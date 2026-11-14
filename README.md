# NioroTV

This repository hosts **NioroTV**: a web TV player & channel builder (`index.html`) and a self-updating M3U playlist generator (`build_m3u.py`) for **Smarters Player Lite**.

## Quick GitHub Setup

1. **Create a Public Repository** on GitHub (e.g., `my-iptv`) and upload all files from this ZIP archive, preserving the folder structure (`.github/workflows/update.yml`).
2. **Enable GitHub Pages:**
   - Go to **Settings → Pages**.
   - Under **Build and deployment → Source**, select **Deploy from a branch** (`main`, `/ (root)`), and click **Save**.
3. **Enable Workflow Permissions:**
   - Go to **Settings → Actions → General**.
   - Under **Workflow permissions**, select **Read and write permissions** and click **Save**.
4. **Run Your First Build:**
   - Go to the **Actions** tab, select **Build Custom IPTV Playlist**, and click **Run workflow**.
5. **Connect Smarters Player Lite:**
   - Open **Smarters Player Lite** → **Load Your Playlist or File/URL** → **M3U URL**.
   - Enter `https://<your-username>.github.io/<repo-name>/playlist.m3u`.
