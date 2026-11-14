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

def https_works(http_url):
    """Return the https:// version of a stream URL if it answers like the real stream, else None."""
    https_url = "https://" + http_url[len("http://"):]
    try:
        req = urllib.request.Request(https_url, headers={"User-Agent": "Mozilla/5.0", "Range": "bytes=0-2048"})
        with urllib.request.urlopen(req, timeout=6) as resp:
            if not (200 <= resp.status < 400):
                return None
            head = resp.read(2048)
        if ".m3u8" in http_url.lower() and b"#EXTM3U" not in head[:512]:
            return None  # an https page that is not the playlist (error page, parked domain...)
        return https_url
    except Exception:
        return None

def upgrade_to_https(candidates):
    """Rewrite http:// streams to https:// when the secure version really works."""
    todo = sorted({url for _, _, url in candidates if url.startswith("http://")})
    if not todo:
        return candidates
    print(f"Checking https for {len(todo)} http streams...")
    with ThreadPoolExecutor(max_workers=40) as executor:
        results = list(executor.map(https_works, todo))
    fixed = {u: r for u, r in zip(todo, results) if r}
    print(f"Upgraded {len(fixed)} of {len(todo)} streams to https.")
    return [(e, t, fixed.get(u, u)) for e, t, u in candidates]

def parse_entries(raw_text, folder_label):
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    entries = []
    i = 0
    while i < len(lines):
        if lines[i].startswith("#EXTINF"):
            extinf = lines[i]
            if folder_label is None:
                pass  # keep the source's own group-title
            elif 'group-title="' in extinf:
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

COUNTRY_NAMES = {
    "sn": "Senegal", "gm": "Gambia", "gn": "Guinea", "gw": "Guinea-Bissau", "ml": "Mali",
    "mr": "Mauritania", "cv": "Cape Verde", "ci": "Cote d'Ivoire", "bf": "Burkina Faso",
    "bj": "Benin", "tg": "Togo", "gh": "Ghana", "ne": "Niger", "ng": "Nigeria",
    "lr": "Liberia", "sl": "Sierra Leone", "us": "United States", "fr": "France",
    "it": "Italy", "uk": "United Kingdom", "sa": "Saudi Arabia", "eg": "Egypt", "ma": "Morocco",
}
LANGUAGE_NAMES = {"fra": "French", "eng": "English", "ara": "Arabic", "ita": "Italian",
                  "wol": "Wolof", "por": "Portuguese", "spa": "Spanish"}
CATEGORY_NAMES = {"religious": "Islamic"}   # the Religious list is filtered to Islamic channels only

def country_label(code):
    return COUNTRY_NAMES.get(code.lower(), code.upper())

def language_label(code):
    return "In " + LANGUAGE_NAMES.get(code.lower(), code.upper())

def category_label(cat):
    return CATEGORY_NAMES.get(cat.lower(), cat.capitalize())

QUALITY_RE = re.compile(r"\s*\(\d{3,4}[pi]\)")
NOT247_RE = re.compile(r"\s*\[Not 24/7\]")

def clean_name(name):
    """Drop the '(720p)' and '[Not 24/7]' tags so names are short and readable on a TV."""
    return NOT247_RE.sub("", QUALITY_RE.sub("", name)).strip()

def clean_extinf(extinf):
    head, sep, name = extinf.rpartition(",")
    return head + "," + clean_name(name) if sep else extinf

def group_of(extinf):
    m = re.search(r'group-title="([^"]*)"', extinf)
    return m.group(1) if m else ""

def plain_name(extinf):
    """Channel name without quality / [Not 24/7] / [Geo-blocked] tags, for matching."""
    return re.sub(r"\s*\[[^\]]*\]", "", clean_name(entry_name(extinf))).strip()

def pick_featured(candidates, wanted):
    """Best working-looking channel for each wanted name ('=Name' means exact name match)."""
    out, used = [], set()
    for w in wanted:
        exact = w.startswith("=")
        key = norm_name(w[1:] if exact else w)
        best, best_score = None, None
        for item in candidates:
            extinf, _, url = item
            n = norm_name(plain_name(extinf))
            if url in used or not ((n == key) if exact else (key in n)):
                continue
            raw = entry_name(extinf)
            score = 4 * ("[Geo-blocked]" in raw) + 2 * (not url.startswith("https://")) + ("[Not 24/7]" in raw)
            if best is None or score < best_score:
                best, best_score = item, score
        if best:
            used.add(best[2])
            extinf, extra, url = best
            out.append((re.sub(r'group-title="[^"]*"', 'group-title="Featured"', extinf), extra, url))
    return out

MARK_RE = re.compile(r"\s*[\u24b6-\u24e9]")   # circled letters used by Free-TV: (G) geo-block, (S) not HD, (Y) YouTube

def tidy_freetv(extinf, group):
    """Free-TV marks geo-blocked channels with a circled G; convert to our [Geo-blocked] tag."""
    head, sep, name = extinf.rpartition(",")
    geo = "\u24bc" in name
    name = MARK_RE.sub("", name).strip()
    if geo:
        name += " [Geo-blocked]"
    head = re.sub(r'group-title="[^"]*"', f'group-title="{group}"', head)
    return head + "," + name

def quality_score(extinf, url):
    raw = entry_name(extinf)
    return 4 * ("[Geo-blocked]" in raw) + 2 * (not url.startswith("https://")) + ("[Not 24/7]" in raw)

def dedupe_by_name(items):
    """One entry per channel name inside each group, keeping the best-looking stream."""
    best = {}
    for pos, (extinf, extra, url) in enumerate(items):
        key = (group_of(extinf), norm_name(plain_name(extinf)))
        sc = quality_score(extinf, url)
        if key not in best or sc < best[key][0]:
            best[key] = (sc, pos)
    keep = {pos for _, pos in best.values()}
    return [it for pos, it in enumerate(items) if pos in keep]

def write_playlist(path, items, clean=True):
    lines = ["#EXTM3U"]
    for extinf, extra_tags, stream_url in items:
        lines.append(clean_extinf(extinf) if clean else extinf)
        lines.extend(extra_tags)
        lines.append(stream_url)
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")

def main():
    with open("config.json", "r", encoding="utf-8") as f:
        config = json.load(f)

    sources = []
    for c in config.get("countries", []):
        sources.append((f"{BASE_URL}/countries/{c.lower()}.m3u", country_label(c), "country", c.lower()))
    for lang in config.get("languages", []):
        sources.append((f"{BASE_URL}/languages/{lang.lower()}.m3u", language_label(lang), "language", lang.lower()))
    for cat in config.get("categories", []):
        sources.append((f"{BASE_URL}/categories/{cat.lower()}.m3u", category_label(cat), "category", cat.lower()))

    seen_urls = set()
    candidates = []

    # Category lists are global; keep only the channels from these countries.
    cat_countries = {c.lower() for c in config.get("category_countries", [])}

    rules = {k.lower(): v for k, v in config.get("category_rules", {}).items()}

    for url, label, kind, key_name in sources:
        rule = rules.get(key_name) if kind == "category" else None
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

    # Extra curated source(s), e.g. Free-TV/IPTV (better Italy / UK / France / US coverage).
    # Placed first so they win ties against iptv-org duplicates.
    extra_items = []
    for src in config.get("extra_sources", []):
        raw = fetch_m3u(src["url"])
        gmap = src.get("group_map", {})
        for extinf, extra_tags, stream_url in parse_entries(raw, None):
            orig = group_of(extinf)
            if orig in src.get("keyword_groups", {}):
                # e.g. Quran channels living in "Saudi Arabia" / "Qatar": keep only the matching names
                if not matches_keywords(entry_name(extinf), rules.get("religious", {}).get("include_keywords", [])):
                    continue
                target = src["keyword_groups"][orig]
            elif orig in gmap:
                target = gmap[orig]
            else:
                continue
            key = ("extra", stream_url)
            if key in seen_urls:
                continue
            seen_urls.add(key)
            extra_items.append((tidy_freetv(extinf, target), extra_tags, stream_url))
    candidates = extra_items + candidates

    keep_geo = set(config.get("keep_geo_blocked_groups", []))
    if config.get("hide_geo_blocked", False):
        # Geo-blocked channels will not play for most viewers; keep them only where the viewers are
        # inside the blocked region (e.g. Senegal).
        candidates = [c for c in candidates
                      if "[Geo-blocked]" not in entry_name(c[0]) or group_of(c[0]) in keep_geo]

    if config.get("dedupe_names", False):
        candidates = dedupe_by_name(candidates)

    if config.get("upgrade_https", False):
        candidates = upgrade_to_https(candidates)

    if config.get("check_health", False):
        print(f"Health-checking {len(candidates)} streams...")
        with ThreadPoolExecutor(max_workers=20) as executor:
            results = list(executor.map(lambda item: check_stream_alive(item[2]), candidates))
        candidates = [item for item, alive in zip(candidates, results) if alive]

    if not candidates:
        # Never overwrite a good playlist with an empty one (e.g. iptv-org unreachable).
        raise SystemExit("No channels fetched - leaving the existing playlists untouched.")

    clean = config.get("clean_names", True)

    # "Featured": a short best-of group shown first in Smarters
    featured = pick_featured(candidates, config.get("featured", []))
    candidates = featured + candidates

    # "Soccer": official free soccer channels (FIFA+, Golazo, beIN Xtra, club TV...) collected from all groups
    soccer, soccer_seen = [], set()
    soccer_kw = [norm_name(k) for k in config.get("soccer_keywords", [])]
    for extinf, extra_tags, stream_url in candidates:
        n = norm_name(plain_name(extinf))
        if stream_url in soccer_seen or group_of(extinf) == "Featured" or not any(k in n for k in soccer_kw):
            continue
        soccer_seen.add(stream_url)
        soccer.append((re.sub(r'group-title="[^"]*"', 'group-title="Soccer"', extinf), extra_tags, stream_url))
    candidates = candidates + dedupe_by_name(soccer)

    # Group order in Smarters = order of first appearance, so sort by the configured order
    order = config.get("playlist_order", [])
    if order:
        idx = {g: i for i, g in enumerate(order)}
        candidates = sorted(candidates, key=lambda it: (
            idx.get(group_of(it[0]), len(idx)),
            "" if group_of(it[0]) == "Featured" else plain_name(it[0]).casefold()))

    write_playlist("playlist.m3u", candidates, clean)
    print(f"Generated playlist.m3u with {len(candidates)} channels ({len(featured)} featured).")

    # Short themed playlists, easy to type on a TV remote (e.g. .../NioroTV/sn.m3u)
    for spec in config.get("extra_playlists", []):
        items = candidates
        if spec.get("groups"):
            items = [i for i in items if group_of(i[0]) in spec["groups"]]
        if spec.get("exclude_groups"):
            items = [i for i in items if group_of(i[0]) not in spec["exclude_groups"]]
        if spec.get("https_only"):
            items = [i for i in items if i[2].startswith("https://")]
        write_playlist(spec["file"], items, clean)
        print(f"Generated {spec['file']} with {len(items)} channels.")

if __name__ == "__main__":
    main()
