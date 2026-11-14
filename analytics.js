// NioroTV viewer analytics → Firebase Realtime Database. No-ops until firebase-config.js is filled in.
(function () {
  const cfg = window.FIREBASE_CONFIG || {};
  const on = !!(window.firebase && cfg.apiKey && !String(cfg.apiKey).startsWith("PASTE"));
  const api = { enabled: on };
  let db, TS, INC, vid, name, presRef, cur = null, acc = 0, ps = 0, searchTimer = null;

  const clip = (s, n) => String(s || "").slice(0, n);
  const push = (path, obj) => { try { db.ref(path).push(obj); } catch (e) {} };
  const ev = (type, extra) => push("events", Object.assign({ t: TS, v: vid, n: clip(name, 40), type }, extra));

  api.init = function (ctx) {
    if (!on || db) return;
    try {
      if (!firebase.apps.length) firebase.initializeApp(cfg);
      db = firebase.database(); TS = firebase.database.ServerValue.TIMESTAMP;
      INC = (n) => firebase.database.ServerValue.increment(n);
    } catch (e) { return; }
    vid = clip(ctx.id, 40); name = clip(ctx.name, 40);
    const device = clip((/Android|iPhone|iPad|Mac|Windows|Linux|CrOS/.exec(navigator.userAgent) || ["Other"])[0] + (/Mobi/.test(navigator.userAgent) ? " mobile" : ""), 60);
    try {
      db.ref("viewers/" + vid).update({ name, device, lastSeen: TS, visits: INC(1) });
      presRef = db.ref("presence/" + vid);
      presRef.onDisconnect().remove();
      presRef.set({ name, since: TS, ch: "", g: "" });
    } catch (e) {}
    // Extra profile fields are written separately so a rules mismatch can never block the core tracking.
    try {
      let did = ""; try { did = localStorage.getItem("nioro_did") || ""; if (!did) { did = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); localStorage.setItem("nioro_did", did); } } catch (e) { did = "nols"; }
      const tz = clip((Intl.DateTimeFormat().resolvedOptions().timeZone) || "", 60), lang = clip(navigator.language || "", 10);
      db.ref("viewers/" + vid).update({ tz, lang }).catch(() => {});
      db.ref("devices/" + vid + "/" + clip(did, 20)).set(TS).catch(() => {});
    } catch (e) {}
    ev("visit", {});
    setInterval(heartbeat, 60000);
    document.addEventListener("visibilitychange", () => { if (document.hidden) heartbeat(); });
    window.addEventListener("pagehide", heartbeat);
  };

  function logAcc() {
    if (!cur || acc < 5000) return;
    const s = Math.min(86400, Math.round(acc / 1000));
    ev("watch", { ch: clip(cur.ch, 120), g: clip(cur.g, 60), secs: s });
    try { db.ref("viewers/" + vid).update({ watchSecs: INC(s), lastSeen: TS }); } catch (e) {}
    acc = 0;
  }
  function pause() { if (cur && ps) { acc += Date.now() - ps; ps = 0; } }
  function heartbeat() { if (!db) return; const was = !!ps; pause(); logAcc(); if (was && !document.hidden) ps = Date.now(); }
  function flush() { pause(); logAcc(); cur = null; try { presRef.update({ ch: "", g: "" }); } catch (e) {} }

  api.play = function (ch) {
    if (!db) return; flush();
    cur = { ch: ch.name, g: ch.group }; acc = 0; ps = 0;
    ev("play", { ch: clip(ch.name, 120), g: clip(ch.group, 60) });
    try { presRef.update({ ch: clip(ch.name, 120), g: clip(ch.group, 60) }); } catch (e) {}
  };
  api.playing = function () { if (db && cur && !ps) ps = Date.now(); };
  api.paused = function () { if (db) pause(); };
  api.search = function (q, count) {
    if (!db) return; clearTimeout(searchTimer);
    q = String(q || "").trim().toLowerCase();
    if (q.length < 3) return;
    searchTimer = setTimeout(() => ev("search", { q: clip(q, 80), res: count | 0 }), 1500);
  };
  api.fav = function (ch) { if (db && ch) ev("fav", { ch: clip(ch.name, 120), g: clip(ch.group, 60) }); };
  api.request = function (text) {
    if (!db) return false;
    push("requests", { t: TS, v: vid, n: clip(name, 40), text: clip(text, 500), status: "new" });
    return true;
  };
  window.NioroTrack = api;
})();
