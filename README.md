# Planify — Planner & Reminders

A responsive, installable PWA for iPhone and desktop.

## Features
- Create, edit and delete events with date, time, category, location, notes and reminder lead time.
- Add and complete tasks.
- Upcoming/all event views.
- Browser notification reminders while the app is open.
- Local device storage and JSON backup/restore.
- Offline app shell after first visit.

## Publish free with GitHub Pages
1. Create a GitHub repository (for example `planify`).
2. Upload the contents of this folder to the repository root (index.html should be at the root).
3. In Settings → Pages, choose Deploy from a branch, select `main` and `/ (root)`, then Save.
4. Open the published HTTPS URL.

## Install
- iPhone: open the HTTPS site in Safari → Share → Add to Home Screen.
- Desktop: open the site in Chrome or Edge and use the install icon in the address bar/menu.

## Reminder limitations — important
This version uses browser notifications and checks due reminders while Planify is open. Browsers and iOS can suspend web apps in the background, so this does **not** guarantee alerts when the app is closed or the device is asleep. Reliable background push reminders require a push service/backend and user subscription; this ZIP does not include that hosted service. Calendar syncing is also not connected yet.

Events and tasks are stored in the browser's local storage on each device, not automatically synced between iPhone and computer. Use Export/Import to move a backup between devices.
