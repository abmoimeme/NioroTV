# NioroTV dashboard setup (one time, free Spark plan)

1. Firebase console → Add project "NioroTV" (same way as Ludo / Street Racing).
2. Build → Realtime Database → Create database → start in locked mode. Note its URL.
3. Build → Authentication → Sign-in method → enable **Google**. Settings → Authorized domains → add `abmoimeme.github.io`.
4. Realtime Database → Rules → paste `database.rules.json`, replacing both `YOUR_GOOGLE_EMAIL` entries with your admin Google email → Publish.
   (Keep your real email out of the GitHub repo: edit it in the console, not in the file.)
5. Project settings → Your apps → Web app → copy the config into `firebase-config.js` (apiKey, authDomain, databaseURL, projectId, appId).
6. Push. Open `/dashboard.html`, sign in with Google.

Add a viewer: `python make_code.py add "Name"`, push `codes.json`, send them the code.
