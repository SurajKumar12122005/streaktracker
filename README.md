# StreakTracker – Developer Learning Cadence

A full-stack developer habit tracker and study cadence dashboard designed to build consistency and engineering momentum everyday.

---

## 🚀 Overview

**StreakTracker** helps engineers stay accountable to their daily learning goals. It tracks daily study streaks, logs time spent across engineering domains (DSA, System Design, Frontend, Backend, Cloud), provides an interactive sprint timer, and visualizes learning habits through activity heatmaps and monthly calendars.

---

## ✨ Features

* **Daily Streak & Cadence Metrics**: Real-time tracking of current streak, longest streak, and daily targets.
* **Session Logging**: Log learning sessions by domain, topic, duration, and key takeaways.
* **Sprint Timer**: Integrated Pomodoro-style timer with celebratory confetti upon milestone completions.
* **Monthly Calendar & Activity Matrix**: Visual heatmaps and monthly overview of daily learning velocity.
* **Multi-User & Admin Panel**: Secure username/password authentication with role-based access (Admin/User).
* **Live Cloud Sync**: Seamless synchronization across Google Cloud Firestore and local storage.
* **Google Sheets Export**: One-click Google OAuth sync to export study logs to a personal Google Sheet.

---

## 🛠️ Tech Stack

* **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Motion, Lucide React
* **Backend**: Node.js, Express 4, tsx
* **Security & Auth**: PBKDF2 SHA-512 password encryption, Firebase Auth (Google OAuth)
* **Databases & Cloud**: Google Cloud Firestore, Google Sheets & Drive REST APIs

---

## ⚡ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/SurajKumar12122005/streaktracker.git
cd streaktracker
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Default Admin Credentials

* **Username:** `suraj` (or `surajsasi1212@gmail.com`)
* **Password:** `password123`

*(You can also register a new account directly from the UI)*

---

## 📜 Available Scripts

* `npm run dev` – Launch Express backend + Vite dev server at port 3000.
* `npm run lint` – Run TypeScript type checking.
* `npm run build` – Build optimized production bundle to `dist/`.
* `npm start` – Run server in production mode.
