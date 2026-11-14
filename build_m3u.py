import json
import re
import unicodedata
import urllib.request
from concurrent.futures import ThreadPoolExecutor

BASE_URL = "https://iptv-org.github.io/iptv"

def fetch_m3u(url):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"Skipping {url}: {e}")
        return ""

def check_stream_alive(url):
    try:
        req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            return 200 <= resp.status < 400
    except Exception:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Range": "bytes=0-1024"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                return 200 <= resp.status < 400
        except Exception:
            return False

def parse_entries(raw_text, folder_label):
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    entries = []
    i = 0
    while i < len(lines):
        if lines[i].startswith("#EXTINF"):
            extinf = lines[i]
            if 'group-title="' in extinf:
                extinf = re.sub(r'group-title="[^"]*"', f'group-title="{folder_label}"', extinf)
            else:
                extinf = extinf.replace("#EXTINF:-1", f'#EXTINF:-1 group-title="{folder_label}"', 1)
            
            j = i + 1
            extra_tags = []
            while j < len(lines) and lines[j].startswith("#"):
                extra_tags.append(lines[j])
                j += 1
            if j < len(lines):
                stream_url = lines[j]
                entries.append((extinf, extra_tags, stream_url))
                i = j
        i += 1
    return entries

def norm_name(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(ch for ch in s if not unicodedata.combining(ch))
    return " " + re.sub(r"[^a-z0-9]+", " ", s).strip() + " "

def entry_name(extinf):
    return extinf.rsplit(",", 1)[-1].strip()

def matches_keywords(name, keywords):
    n = norm_name(name)
    return any(norm_name(k) in n for k in keywords)

def entry_country(extinf):
    """Country code from tvg-id like 'TF1.fr@SD' -> 'fr' (None if absent)."""
    m = re.search(r'tvg-id="([^"]*)"', extinf)
    if not m:
        return None
    ident = m.group(1).split("@")[0]
    if "." not in ident:
        return None
    return ident.rsplit(".", 1)[1].lower()

def main():
    with open("config.json", "r", encoding="utf-8") as f:
        config = json.load(f)

    sources = []
    for c in config.get("countries", []):
        sources.append((f"{BASE_URL}/countries/{c.lower()}.m3u", f"Country: {c.upper()}", "country"))
    for lang in config.get("languages", []):
        sources.append((f"{BASE_URL}/languages/{lang.lower()}.m3u", f"Language: {lang.upper()}", "language"))
    for cat in config.get("categories", []):
        sources.append((f"{BASE_URL}/categories/{cat.lower()}.m3u", f"Category: {cat.capitalize()}", "category"))

    seen_urls = set()
    candidates = []

    # Category lists are global; keep only the channels from these countries.
    cat_countries = {c.lower() for c in config.get("category_countries", [])}

    rules = {k.lower(): v for k, v in config.get("category_rules", {}).items()}

    for url, label, kind in sources:
        rule = rules.get(label.split(": ", 1)[1].lower()) if kind == "category" else None
        raw = fetch_m3u(url)
        for extinf, extra_tags, stream_url in parse_entries(raw, label):
            if config.get("require_https") and not stream_url.startswith("https://"):
                continue
            if rule:
                # e.g. Religious: keep only channels whose name matches the keyword list
                if rule.get("include_keywords") and not matches_keywords(entry_name(extinf), rule["include_keywords"]):
                    continue
                ctry = entry_country(extinf)
                if rule.get("countries"):
                    allowed = {x.lower() for x in rule["countries"]}
                    if ctry not in allowed and not (ctry is None and rule.get("allow_unknown_country")):
                        continue
                elif not rule.get("any_country") and cat_countries and ctry not in cat_countries:
                    continue
            elif kind == "category" and cat_countries and entry_country(extinf) not in cat_countries:
                continue
            if config.get("remove_duplicates", True):
                # A channel appears once per kind (country / language / category),
                # so it can sit under both "Country: US" and "Category: Sports".
                key = (kind, stream_url)
                if key in seen_urls:
                    continue
                seen_urls.add(key)
            candidates.append((extinf, extra_tags, stream_url))

    if config.get("check_health", False):
        print(f"Health-checking {len(candidates)} streams...")
        with ThreadPoolExecutor(max_workers=20) as executor:
            results = list(executor.map(lambda item: check_stream_alive(item[2]), candidates))
        candidates = [item for item, alive in zip(candidates, results) if alive]

    final_lines = ["#EXTM3U"]
    for extinf, extra_tags, stream_url in candidates:
        final_lines.append(extinf)
        final_lines.extend(extra_tags)
        final_lines.append(stream_url)

    with open("playlist.m3u", "w", encoding="utf-8") as f:
        f.write("\n".join(final_lines) + "\n")
    print(f"Generated playlist.m3u with {len(candidates)} unique channels.")

if __name__ == "__main__":
    main()
