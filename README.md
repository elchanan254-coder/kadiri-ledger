# Kadiri Ledger

A simple money tracker for gig and freelance income. Installs as a phone app (PWA) — no app store needed.

## What changed from the Claude artifact version
- Storage swapped from Claude's `window.storage` to real browser `localStorage` — your data lives on your phone, permanently, even offline.
- Added a PWA manifest + service worker so it can be installed like a real app and works with no internet connection.
- Added app icons.

## How to get this live (free)

### Step 1 — Put it on GitHub
1. Create a free account at github.com if you don't have one.
2. Create a new repository (e.g. `kadiri-ledger`).
3. Upload this whole folder to it (GitHub's website lets you drag-and-drop files, or use `git`).

### Step 2 — Deploy to Vercel (free)
1. Create a free account at vercel.com, sign in with GitHub.
2. Click "Add New Project", select your `kadiri-ledger` repo.
3. Vercel auto-detects Vite — just click Deploy.
4. In a minute you'll get a live link like `kadiri-ledger.vercel.app`.

### Step 3 — Install it on your phone
1. Open your live link in Chrome on your Android phone.
2. Tap the three-dot menu → "Add to Home screen" / "Install app".
3. It now behaves like a real app: its own icon, opens full-screen, works offline.

## Local development
```
npm install
npm run dev
```

## Build for production
```
npm run build
```
Output goes to the `dist/` folder — this is what gets deployed.
