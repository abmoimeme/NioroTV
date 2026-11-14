// NioroTV access-code gate. Codes are checked against salted hashes in codes.json.
(function () {
  const fr = (navigator.language || "en").toLowerCase().startsWith("fr");
  const T = fr
    ? { t: "Accès NioroTV", s: "Entrez votre code d'accès personnel.", go: "Entrer", note: "Votre activité de visionnage est enregistrée pour améliorer NioroTV.", bad: "Code invalide.", err: "Impossible de vérifier le code. Réessayez." }
    : { t: "NioroTV Access", s: "Enter your personal access code.", go: "Enter", note: "Your viewing activity is recorded to help improve NioroTV.", bad: "Invalid code.", err: "Could not verify the code. Try again." };

  const css = document.createElement("style");
  css.textContent = `#nioroGate{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at top right,#260d54 0%,#0c041a 60%);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#f8fafc;padding:1rem}
  #nioroGate .card{width:100%;max-width:380px;background:#180933;border:1px solid #361c66;border-radius:16px;padding:1.5rem;box-shadow:0 14px 40px rgba(0,0,0,.55)}
  #nioroGate h2{font-size:1.3rem;margin-bottom:.4rem}#nioroGate p{color:#a799c2;font-size:.9rem;margin-bottom:1rem}
  #nioroGate input{width:100%;background:#0c041a;border:1px solid #361c66;color:#fff;padding:.7rem .8rem;border-radius:8px;font-size:1.05rem;letter-spacing:2px;text-transform:uppercase;margin-bottom:.7rem}
  #nioroGate button{width:100%;background:linear-gradient(135deg,#7e22ce,#581c87);color:#fff;border:1px solid #a855f7;padding:.7rem;border-radius:8px;font-weight:700;cursor:pointer;font-size:1rem}
  #nioroGate .msg{color:#fca5a5;font-size:.85rem;min-height:1.1rem;margin-top:.6rem}
  #nioroGate .badge{display:inline-block;background:linear-gradient(135deg,#9333ea,#662d91);padding:.2rem .55rem;border-radius:6px;font-weight:800;margin-bottom:.8rem}`;
  document.head.appendChild(css);

  const gate = document.createElement("div");
  gate.id = "nioroGate";
  gate.style.display = "none";
  gate.innerHTML = `<div class="card"><span class="badge">NIORO TV</span><h2>${T.t}</h2><p>${T.s}</p>
    <input id="gCode" placeholder="XXXX-XXXX-XXXX" autocomplete="off" autocapitalize="characters" />
    <button id="gGo">${T.go}</button><div class="msg" id="gMsg"></div><div style="color:#a799c2;font-size:.75rem;margin-top:.8rem">${T.note}</div></div>`;
  document.body.appendChild(gate);
  const msg = gate.querySelector("#gMsg"), input = gate.querySelector("#gCode");

  const norm = (c) => c.replace(/[\s-]/g, "").toUpperCase();
  async function sha256(s) {
    const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
    return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, "0")).join("");
  }
  async function lookup(code) {
    const r = await fetch("codes.json", { cache: "no-store" });
    if (!r.ok) throw new Error("codes.json " + r.status);
    const d = await r.json();
    const h = await sha256(d.salt + norm(code));
    return d.codes.find((c) => c.h === h) || null;
  }

  let opts = {};
  function unlock(entry, code) {
    try { localStorage.setItem("nioro_code", code); } catch (e) {}
    gate.style.display = "none";
    opts.onReady && opts.onReady({ id: entry.h.slice(0, 16), name: entry.name, isAdmin: !!entry.admin, signOut });
  }
  function signOut() {
    try { localStorage.removeItem("nioro_code"); } catch (e) {}
    location.reload();
  }
  async function submit() {
    msg.textContent = "";
    const code = input.value;
    if (norm(code).length < 8) { msg.textContent = T.bad; return; }
    try {
      const entry = await lookup(code);
      if (entry) unlock(entry, code); else msg.textContent = T.bad;
    } catch (e) { msg.textContent = T.err; }
  }
  gate.querySelector("#gGo").onclick = submit;
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });

  async function boot() {
    let saved = ""; try { saved = localStorage.getItem("nioro_code") || ""; } catch (e) {}
    if (saved) { try { const entry = await lookup(saved); if (entry) return unlock(entry, saved); } catch (e) {} }
    gate.style.display = "flex";
  }
  window.NioroAuth = { init(o) { opts = o || {}; boot(); } };
})();
