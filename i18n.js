// NioroTV language switcher: English / Français / Italiano. Translates page text in place.
(function () {
  const D = {}; // English text -> [French, Italian]
  const add = (en, fr, it) => (D[en] = [fr, it]);
  // Access screen
  add("NioroTV Access", "Accès NioroTV", "Accesso a NioroTV");
  add("Enter your name and your personal access code.", "Entrez votre nom et votre code d'accès personnel.", "Inserisci il tuo nome e il tuo codice di accesso personale.");
  add("Your name", "Votre nom", "Il tuo nome");
  add("Enter", "Entrer", "Entra");
  add("Your viewing activity is recorded to help improve NioroTV.", "Votre activité de visionnage est enregistrée pour améliorer NioroTV.", "La tua attività di visione viene registrata per migliorare NioroTV.");
  add("Invalid code.", "Code invalide.", "Codice non valido.");
  add("Could not verify the code. Try again.", "Impossible de vérifier le code. Réessayez.", "Impossibile verificare il codice. Riprova.");
  add("Please enter your name.", "Entrez votre nom.", "Inserisci il tuo nome.");
  // Navigation + chrome
  add("🏠 Home & Live TV", "🏠 Accueil et TV en direct", "🏠 Home e TV in diretta");
  add("🔍 Search", "🔍 Recherche", "🔍 Cerca");
  add("💬 Request", "💬 Demande", "💬 Richiesta");
  add("🛍️ Channel Store", "🛍️ Boutique de chaînes", "🛍️ Negozio canali");
  add("Use Arrow Keys + Enter or the Remote Pad.", "Utilisez les flèches + Entrée ou la télécommande.", "Usa le frecce + Invio o il telecomando.");
  add("Loading channels...", "Chargement des chaînes...", "Caricamento canali...");
  add("Fetching live IPTV-org streams...", "Récupération des flux IPTV-org...", "Recupero dei flussi IPTV-org...");
  add("Home — Live Channels", "Accueil — Chaînes en direct", "Home — Canali in diretta");
  add("Free-to-air global streams powered by IPTV-org", "Flux mondiaux gratuits propulsés par IPTV-org", "Flussi globali gratuiti forniti da IPTV-org");
  add("⬇ Download playlist.m3u", "⬇ Télécharger playlist.m3u", "⬇ Scarica playlist.m3u");
  add("Lock", "Verrouiller", "Blocca");
  // Guide, settings, profile
  add("☰ Guide", "☰ Guide", "☰ Guida");
  add("▦ Rows", "▦ Rangées", "▦ Righe");
  add("Guide", "Guide", "Guida");
  add("Rows", "Rangées", "Righe");
  add("★ Favorites", "★ Favoris", "★ Preferiti");
  add("Recently Watched", "Récemment regardées", "Guardati di recente");
  add("All Channels", "Toutes les chaînes", "Tutti i canali");
  add("Filter channels", "Filtrer les chaînes", "Filtra canali");
  add("No favorites yet. Tap the star on any channel.", "Aucun favori. Touchez l'étoile d'une chaîne.", "Nessun preferito. Tocca la stella su un canale.");
  add("Channels you watch will show up here.", "Les chaînes que vous regardez apparaîtront ici.", "I canali che guardi appariranno qui.");
  add("No channels found.", "Aucune chaîne trouvée.", "Nessun canale trovato.");
  add("Settings", "Paramètres", "Impostazioni");
  add("Profile", "Profil", "Profilo");
  add("Home view", "Affichage d'accueil", "Vista Home");
  add("Language", "Langue", "Lingua");
  add("Playlist", "Playlist", "Playlist");
  add("Favorites", "Favoris", "Preferiti");
  add("Recently watched", "Récemment regardées", "Guardati di recente");
  add("Viewer", "Spectateur", "Spettatore");
  add("Administrator", "Administrateur", "Amministratore");
  add("Open admin dashboard", "Ouvrir le tableau de bord admin", "Apri la dashboard admin");
  add("Lock / Sign out", "Verrouiller / Se déconnecter", "Blocca / Esci");
  add("Countries to watch", "Pays à regarder", "Paesi da guardare");
  add("Select all", "Tout sélectionner", "Seleziona tutto");
  add("Clear all", "Tout effacer", "Deseleziona tutto");
  add("Sports", "Sports", "Sport");
  add("Movies", "Films", "Film");
  add("Documentary", "Documentaires", "Documentari");
  add("Religious", "Religion", "Religione");
  add("Kids", "Enfants", "Bambini");
  add("Music", "Musique", "Musica");
  add("News", "Actualités", "Notizie");
  add("Entertainment", "Divertissement", "Intrattenimento");
  add("Comedy", "Comédie", "Commedia");
  add("Series", "Séries", "Serie");
  add("Culture", "Culture", "Cultura");
  add("Education", "Éducation", "Istruzione");
  add("Family", "Famille", "Famiglia");
  // Stream problems
  add("This channel can't play in the browser", "Cette chaîne ne peut pas être lue dans le navigateur", "Questo canale non può essere riprodotto nel browser");
  add("Its server only offers an insecure connection. Open it in Smarters Player Lite or VLC.", "Son serveur n'offre qu'une connexion non sécurisée. Ouvrez-la dans Smarters Player Lite ou VLC.", "Il suo server offre solo una connessione non sicura. Aprilo in Smarters Player Lite o VLC.");
  add("Not available in your region", "Non disponible dans votre région", "Non disponibile nella tua regione");
  add("The broadcaster restricts this channel by country.", "Le diffuseur restreint cette chaîne par pays.", "L'emittente limita questo canale per paese.");
  add("This channel is offline right now", "Cette chaîne est hors ligne pour le moment", "Questo canale è offline al momento");
  add("Try again later.", "Réessayez plus tard.", "Riprova più tardi.");
  add("Blocked by the browser or unreachable", "Bloquée par le navigateur ou inaccessible", "Bloccato dal browser o irraggiungibile");
  add("It may work in Smarters Player Lite or VLC.", "Elle peut fonctionner dans Smarters Player Lite ou VLC.", "Potrebbe funzionare in Smarters Player Lite o VLC.");
  add("Stream unavailable", "Flux indisponible", "Flusso non disponibile");
  add("Try copying the URL into Smarters Player Lite or VLC.", "Essayez de copier l'URL dans Smarters Player Lite ou VLC.", "Prova a copiare l'URL in Smarters Player Lite o VLC.");
  add("Channels that need Smarters / VLC", "Chaînes qui nécessitent Smarters / VLC", "Canali che richiedono Smarters / VLC");
  add("Hide", "Masquer", "Nascondi");
  add("Show", "Afficher", "Mostra");
  add("SMARTERS", "SMARTERS", "SMARTERS");
  // Player
  add("Select any channel below to start watching", "Choisissez une chaîne ci-dessous pour regarder", "Scegli un canale qui sotto per guardare");
  add("Supports live HLS (.m3u8) streams directly in your browser", "Lecture directe des flux HLS (.m3u8) dans votre navigateur", "Riproduce flussi HLS (.m3u8) direttamente nel browser");
  add("LIVE STREAM PREVIEW", "APERÇU EN DIRECT", "ANTEPRIMA IN DIRETTA");
  add("Ready to Stream", "Prêt à diffuser", "Pronto per la visione");
  add("Choose a channel tile from Senegal, France, USA, Sports, or Movies.", "Choisissez une chaîne du Sénégal, de France, des États-Unis, du sport ou du cinéma.", "Scegli un canale da Senegal, Francia, USA, Sport o Film.");
  add("⛶ Watch Fullscreen", "⛶ Plein écran", "⛶ Schermo intero");
  add("☆ Add to Favorites", "☆ Ajouter aux favoris", "☆ Aggiungi ai preferiti");
  add("★ Favorited", "★ Dans les favoris", "★ Nei preferiti");
  add("📋 Copy Stream URL", "📋 Copier l'URL du flux", "📋 Copia URL del flusso");
  add("Stream offline or geo-blocked in browser", "Flux hors ligne ou bloqué dans le navigateur", "Flusso offline o bloccato nel browser");
  add("Try copying the URL into Smarters Player Lite or VLC.", "Essayez de copier l'URL dans Smarters Player Lite ou VLC.", "Prova a copiare l'URL in Smarters Player Lite o VLC.");
  add("Unable to play directly in browser", "Lecture impossible dans le navigateur", "Impossibile riprodurre nel browser");
  // Search
  add("Search", "Recherche", "Cerca");
  add("On-Screen Keypad", "Clavier à l'écran", "Tastiera su schermo");
  add("Type channel name...", "Nom de la chaîne...", "Nome del canale...");
  add("Clear", "Effacer", "Cancella");
  add("SPACE", "ESPACE", "SPAZIO");
  add("⌫ DEL", "⌫ SUPPR", "⌫ CANC");
  add("Showing all channels", "Toutes les chaînes", "Tutti i canali");
  // Request
  add("Request a Channel", "Demander une chaîne", "Richiedi un canale");
  add("Tell us what you want to watch", "Dites-nous ce que vous voulez regarder", "Dicci cosa vuoi guardare");
  add("Missing a channel, a country or a feature? Send a request and the NioroTV team will see it.", "Il manque une chaîne, un pays ou une fonction ? Envoyez une demande, l'équipe NioroTV la verra.", "Manca un canale, un paese o una funzione? Invia una richiesta e il team NioroTV la vedrà.");
  add("e.g. Add more Senegalese channels, a Wolof news channel...", "ex. Plus de chaînes sénégalaises, une chaîne d'info en wolof...", "es. Più canali senegalesi, un canale di notizie in wolof...");
  add("Send request", "Envoyer la demande", "Invia richiesta");
  add("Please write a few words.", "Écrivez quelques mots.", "Scrivi qualche parola.");
  add("Thank you! Your request was sent.", "Merci ! Votre demande a été envoyée.", "Grazie! La tua richiesta è stata inviata.");
  add("Requests are not available right now.", "Les demandes ne sont pas disponibles pour le moment.", "Le richieste non sono al momento disponibili.");
  // Channel store
  add("Channel Store — Lineup Builder", "Boutique de chaînes — Constructeur de liste", "Negozio canali — Costruttore lineup");
  add("Customize Your Lineup", "Personnalisez votre liste", "Personalizza la tua lineup");
  add("Check or uncheck sources to rebuild your live guide and downloadable M3U playlist.", "Cochez ou décochez des sources pour reconstruire votre guide et votre playlist M3U.", "Seleziona o deseleziona le fonti per ricostruire la guida e la playlist M3U.");
  add("🔄 Refresh Lineup Now", "🔄 Actualiser la liste", "🔄 Aggiorna la lineup");
  add("Countries", "Pays", "Paesi"); add("Languages", "Langues", "Lingue"); add("Categories", "Catégories", "Categorie");
  add("Add ISO code (e.g. sn, gb, br)", "Ajouter un code ISO (ex. sn, gb, br)", "Aggiungi codice ISO (es. sn, gb, br)");
  add("+ Add Country", "+ Ajouter un pays", "+ Aggiungi paese");
  add("Add 3-letter ISO (e.g. fra, eng, wol)", "Ajouter un code ISO à 3 lettres (ex. fra, eng, wol)", "Aggiungi codice ISO a 3 lettere (es. fra, eng, wol)");
  add("+ Add Language", "+ Ajouter une langue", "+ Aggiungi lingua");
  [["Senegal", "Sénégal", "Senegal"], ["USA", "États-Unis", "USA"], ["France", "France", "Francia"], ["United Kingdom", "Royaume-Uni", "Regno Unito"],
   ["Morocco", "Maroc", "Marocco"], ["Nigeria", "Nigéria", "Nigeria"], ["French", "Français", "Francese"], ["English", "Anglais", "Inglese"],
   ["Arabic", "Arabe", "Arabo"], ["Spanish", "Espagnol", "Spagnolo"], ["Sports", "Sport", "Sport"], ["Movies", "Films", "Film"], ["News", "Actualités", "Notizie"],
   ["General", "Général", "Generale"], ["Music", "Musique", "Musica"], ["Documentary", "Documentaires", "Documentari"]].forEach((r) => add(r[0], r[1], r[2]));
  const P = [ // [regex, fr, it]
    [/^(\d+) Unique Channels Loaded$/, "$1 chaînes uniques chargées", "$1 canali unici caricati"],
    [/^Connecting to (.+)\.\.\.$/, "Connexion à $1...", "Connessione a $1..."],
    [/^(\d+) of (\d+) selected$/, "$1 sur $2 sélectionnés", "$1 di $2 selezionati"],
    [/^🌍 Countries \((\d+)\/(\d+)\)$/, "🌍 Pays ($1/$2)", "🌍 Paesi ($1/$2)"],
    [/^(\d+) channels$/, "$1 chaînes", "$1 canali"],
    [/^Showing (\d+) matching channels$/, "$1 chaînes trouvées", "$1 canali trovati"],
    [/^⭐ My Favorites \((\d+)\)$/, "⭐ Mes favoris ($1)", "⭐ I miei preferiti ($1)"],
    [/^Country: (.+)$/, "Pays : $1", "Paese: $1"], [/^Language: (.+)$/, "Langue : $1", "Lingua: $1"], [/^Category: (.+)$/, "Catégorie : $1", "Categoria: $1"]
  ];

  const saved = (() => { try { return localStorage.getItem("nioro_lang"); } catch (e) { return null; } })();
  const nav = (navigator.language || "en").slice(0, 2).toLowerCase();
  let lang = ["en", "fr", "it"].includes(saved) ? saved : ["fr", "it"].includes(nav) ? nav : "en";
  const idx = () => (lang === "fr" ? 0 : 1);

  function tr(s) {
    if (lang === "en" || !s) return s;
    const k = s.trim(); if (!k) return s;
    let out = D[k] && D[k][idx()];
    if (!out) for (const p of P) if (p[0].test(k)) { out = k.replace(p[0], p[idx() + 1]); break; }
    if (!out) return s;
    return s.match(/^\s*/)[0] + out + s.match(/\s*$/)[0];
  }
  const tmap = new WeakMap(), amap = new WeakMap(), SKIP = /^(SCRIPT|STYLE|PRE|TEXTAREA|NOSCRIPT)$/;
  function doText(n) {
    const v = n.nodeValue, rec = tmap.get(n);
    if (rec && v === rec.out) { const o = tr(rec.orig); if (o !== v) { n.nodeValue = o; rec.out = o; } return; }
    const o = tr(v); tmap.set(n, { orig: v, out: o }); if (o !== v) n.nodeValue = o;
  }
  function doAttr(el, a) {
    const v = el.getAttribute(a); if (v == null) return;
    const rec = (amap.get(el) || {})[a];
    if (rec && v === rec.out) { const o = tr(rec.orig); if (o !== v) { el.setAttribute(a, o); rec.out = o; } return; }
    const o = tr(v); const m = amap.get(el) || {}; m[a] = { orig: v, out: o }; amap.set(el, m); if (o !== v) el.setAttribute(a, o);
  }
  function walk(root) {
    if (root.nodeType === 3) { if (root.parentNode && !SKIP.test(root.parentNode.nodeName)) doText(root); return; }
    if (root.nodeType !== 1 || SKIP.test(root.nodeName)) return;
    if (root.id === "nioroLang") return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = []; let n; while ((n = w.nextNode())) if (!SKIP.test(n.parentNode.nodeName) && !n.parentNode.closest("#nioroLang")) nodes.push(n);
    nodes.forEach(doText);
    const els = root.querySelectorAll("[placeholder],[title]");
    els.forEach((e) => { doAttr(e, "placeholder"); doAttr(e, "title"); });
    if (root.hasAttribute("placeholder")) doAttr(root, "placeholder");
  }

  function start() {
    const bar = document.createElement("div");
    bar.id = "nioroLang";
    bar.style.cssText = "position:fixed;top:2px;right:10px;z-index:10000;display:flex;gap:2px;font-family:sans-serif";
    ["en", "fr", "it"].forEach((l) => {
      const b = document.createElement("button"); b.textContent = l.toUpperCase(); b.dataset.l = l;
      b.style.cssText = "font-size:.68rem;font-weight:700;padding:1px 7px;border-radius:6px;cursor:pointer;color:#fff;border:1px solid #a855f7";
      b.onclick = () => setLang(l); bar.appendChild(b);
    });
    document.body.appendChild(bar);
    paint();
    walk(document.body);
    new MutationObserver((ms) => ms.forEach((m) => {
      if (m.type === "characterData") { if (!m.target.parentNode || SKIP.test(m.target.parentNode.nodeName)) return; doText(m.target); }
      else if (m.type === "attributes") doAttr(m.target, m.attributeName);
      else m.addedNodes.forEach(walk);
    })).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["placeholder", "title"] });
    document.addEventListener("DOMContentLoaded", () => walk(document.body));
  }
  function paint() {
    document.documentElement.lang = lang;
    document.querySelectorAll("#nioroLang button").forEach((b) => (b.style.background = b.dataset.l === lang ? "#7e22ce" : "#180933"));
  }
  function setLang(l) {
    lang = l; try { localStorage.setItem("nioro_lang", l); } catch (e) {}
    paint(); walk(document.body);
  }
  window.NioroLang = { t: tr, set: setLang, get: () => lang };
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();
