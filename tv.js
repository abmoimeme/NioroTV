// NioroTV "TV mode": big, remote-friendly layout for smart-TV browsers (Samsung, LG, Fire TV, Android TV).
// Auto-on for TV browsers; force with ?tv=1 / ?tv=0 or the Settings switch.
(function () {
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const q = new URLSearchParams(location.search);
  if (q.has("tv")) store.set("nioro_tv", q.get("tv") === "0" ? "0" : "1");
  const looksTV = /Tizen|SMART-TV|SmartTV|Web0S|webOS|NetCast|VIERA|BRAVIA|HbbTV|CrKey|AppleTV|GoogleTV|Android.*TV|AFT[A-Z]/i.test(navigator.userAgent);
  let on = (store.get("nioro_tv") ?? (looksTV ? "1" : "0")) === "1";
  let zone = "list";          // "head" | "cats" | "list"
  let headIdx = 1;            // header icon in focus (0 search, 1 settings, 2 profile)

  const $ = id => document.getElementById(id);
  const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
  const panelOpen = () => $("panelOverlay") && $("panelOverlay").classList.contains("open");
  const homeActive = () => $("view-home") && $("view-home").classList.contains("active");
  const heads = () => [...document.querySelectorAll(".topbar .icon-btn")];

  function paint() {
    document.body.classList.toggle("tv", on);
    const gv = $("guideView");
    if (gv) { gv.classList.toggle("z-cats", on && zone === "cats"); gv.classList.toggle("z-list", on && zone === "list"); }
    heads().forEach((b, i) => b.classList.toggle("tvfocus", on && zone === "head" && i === headIdx));
    document.querySelectorAll("#setTvSeg button").forEach(b => b.classList.toggle("on", (b.dataset.t === "1") === on));
  }

  // Player fullscreen includes the status overlay, so errors stay visible on the big screen.
  const origFs = window.enterTheaterFullscreen;
  window.enterTheaterFullscreen = function () {
    const wrap = $("videoContainer");
    if (on && wrap) {
      const f = wrap.requestFullscreen || wrap.webkitRequestFullscreen;
      if (f) { try { const p = f.call(wrap); if (p && p.catch) p.catch(() => {}); return; } catch (e) {} }
    }
    if (origFs) origFs();
  };
  function exitFs() { const f = document.exitFullscreen || document.webkitExitFullscreen; if (f) { try { f.call(document); } catch (e) {} } }

  function zap(d) {
    if (typeof guideRows === "undefined" || !guideRows.length) return;
    guideMove(d);
    const ch = guideRows[guideSel];
    if (ch) playChannel(ch);
  }

  function catMove(d) {
    const btns = [...document.querySelectorAll("#guideCats .guide-cat")];
    if (!btns.length) return;
    const i = Math.max(0, btns.findIndex(b => b.classList.contains("on")));
    const n = i + d;
    if (n < 0) { zone = "head"; paint(); return; }
    if (n >= btns.length) return;
    btns[n].click();
    const nb = document.querySelectorAll("#guideCats .guide-cat")[n];
    if (nb) nb.scrollIntoView({ block: "nearest" });
  }

  // Move focus between buttons/inputs inside a container (settings panel, search view...).
  function focusMove(container, d) {
    const items = [...container.querySelectorAll("button, input, select, a[href]")].filter(el => !el.disabled && el.offsetParent !== null);
    if (!items.length) return;
    let i = items.indexOf(document.activeElement);
    i = i < 0 ? 0 : Math.max(0, Math.min(items.length - 1, i + d));
    items[i].focus();
    items[i].scrollIntoView({ block: "nearest" });
  }

  function clickActive() { const a = document.activeElement; if (a && a !== document.body && a.click) a.click(); }

  function goBack() {
    if (panelOpen()) { closePanel(); return true; }
    if (fsEl()) { exitFs(); return true; }
    if (!homeActive()) { const b = document.querySelector('.nav-btn[data-view="home"]'); if (b) switchView("home", b); zone = "list"; paint(); return true; }
    if (zone === "list") { zone = "cats"; paint(); return true; }
    return false;
  }

  document.addEventListener("keydown", function (e) {
    if (!on) return;
    const k = e.key, kc = e.keyCode;
    const typing = document.activeElement && /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    const isBack = k === "XF86Back" || k === "BrowserBack" || kc === 10009 || kc === 461 || (k === "Backspace" && !typing);
    const handled = () => { e.preventDefault(); e.stopImmediatePropagation(); };

    if (isBack) { if (goBack()) handled(); return; }
    if (typing) return;

    const dir = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" }[k];
    const chUp = k === "ChannelUp" || kc === 427 || k === "PageUp";
    const chDown = k === "ChannelDown" || kc === 428 || k === "PageDown";

    // Watching fullscreen: up/down (or channel +/-) zap, Enter leaves fullscreen.
    if (fsEl()) {
      if (dir === "down" || chUp) { zap(1); handled(); }
      else if (dir === "up" || chDown) { zap(-1); handled(); }
      else if (k === "Enter") { exitFs(); handled(); }
      return;
    }
    if (chUp || chDown) { if (homeActive()) { zap(chUp ? 1 : -1); handled(); } return; }

    if (panelOpen()) {
      const box = document.querySelector("#panelOverlay .side-panel:not([style*='display: none'])") || $("panelOverlay");
      if (dir === "down" || dir === "right") { focusMove(box, 1); handled(); }
      else if (dir === "up" || dir === "left") { focusMove(box, -1); handled(); }
      else if (k === "Enter") { clickActive(); handled(); }
      return;
    }

    if (!homeActive()) {
      const view = document.querySelector(".view-section.active");
      if (view && dir) { focusMove(view, dir === "down" || dir === "right" ? 1 : -1); handled(); }
      else if (k === "Enter") { clickActive(); handled(); }
      return;
    }

    if (!dir && k !== "Enter") return;
    if (zone === "head") {
      const h = heads();
      if (dir === "left") headIdx = Math.max(0, headIdx - 1);
      else if (dir === "right") headIdx = Math.min(h.length - 1, headIdx + 1);
      else if (dir === "down") zone = "list";
      else if (k === "Enter" && h[headIdx]) h[headIdx].click();
      paint(); handled(); return;
    }
    if (zone === "cats") {
      if (dir === "up") catMove(-1);
      else if (dir === "down") catMove(1);
      else if (dir === "right" || k === "Enter") { zone = "list"; paint(); }
      handled(); return;
    }
    // list zone
    if (dir === "up") { if (typeof guideSel !== "undefined" && guideSel <= 0) zone = "head"; else guideMove(-1); }
    else if (dir === "down") guideMove(1);
    else if (dir === "left") zone = "cats";
    else if (k === "Enter") {
      const ch = typeof guideRows !== "undefined" && guideRows[guideSel];
      if (ch) { if (!currentChannel || currentChannel.url !== ch.url) playChannel(ch); window.enterTheaterFullscreen(); }
    }
    paint(); handled();
  }, true);

  window.NioroTV = {
    isOn: () => on,
    set(v) {
      on = !!v; store.set("nioro_tv", on ? "1" : "0"); paint();
      if (on && typeof setHomeView === "function") setHomeView("guide");
    }
  };
  document.addEventListener("fullscreenchange", paint);
  paint();
  if (on && typeof setHomeView === "function") setHomeView("guide");
})();
