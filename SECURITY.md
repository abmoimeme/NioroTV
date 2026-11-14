# NioroTV security notes

## What is protected, and how
| Area | Status |
|---|---|
| Dashboard access | Google sign-in + database rules that only read for the admin email (verified). Not guessable from the repo (the real email lives only in the Firebase console). |
| Viewer access | Personal access codes. New codes use PBKDF2 (200k rounds); old test codes use a fast hash. Revoke by removing the code and pushing `codes.json`. |
| Page injection (XSS) | Channel names, logos, groups and store labels from third-party playlists are escaped. |
| CSV export | Cells starting with `= + - @` are neutralised so Excel cannot run them. |
| Database writes | Field types, lengths and allowed event types are validated; timestamps must be within ~2 days of server time; unknown fields rejected. |
| Secrets in repo | None. The Firebase web config is public by design. |

## Known limits (be aware)
- **Soft gate.** `playlist.m3u` and `codes.json` are public files. Anyone with the link can load the playlist (it only contains free public streams). Codes keep casual visitors out of the web player and let you track who watches.
- **Open analytics writes.** Anyone who knows the database URL can try to write analytics events. Rules limit size and shape, not volume. Turn on App Check (below) to block scripts and bots.
- **No retention limit.** Events are kept until you delete them. The admin account can now purge them.

## Checklist for AB (Firebase / Google console)
1. Realtime Database -> Rules: paste the latest `database.rules.json` (with your Google email in place of `YOUR_GOOGLE_EMAIL`) and Publish.
2. App Check: Firebase console -> App Check -> register the web app with reCAPTCHA v3, copy the site key into `firebase-config.js` as `appCheckSiteKey: "..."`, push, check it works for a day, then enforce it for Realtime Database.
3. Authentication -> Settings -> Authorized domains: keep only `abmoimeme.github.io` and the firebaseapp domain (remove `localhost`).
4. Google Cloud -> Credentials -> the Browser API key -> restrict to HTTP referrers `https://abmoimeme.github.io/*`.
5. Revoke the "Test Viewer" code and the test codes when testing is over: `python make_code.py revoke "Test Viewer"`.
6. For real viewers use `python make_code.py add "Name"`. Upgrade old codes with `python make_code.py reissue "Name"` (the old code stops working).
7. Privacy: tell viewers what is recorded (name, device type, time zone, language, channels, searches, requests, stream quality). If you have viewers in France or Italy (EU), publish a short privacy notice and delete data you no longer need.
8. Only you hold the admin code and the Google account used for the dashboard. Turn on 2-step verification on that Google account and on GitHub.
