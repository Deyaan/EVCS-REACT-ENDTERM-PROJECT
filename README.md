# EVCS – Smart EV Charging Station Queue & Route Planner

A full-stack React web app for real-time EV charging station discovery, live queue tracking, QR-based entry/exit, and route planning.

**No Google Maps. No paid APIs. Just one free credential: Firebase.**

---

## 🔑 Only ONE credential needed: Firebase

### Setup Firebase (free)

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → name it (e.g. `evcs-app`) → Continue
3. Once created, click the **Web icon** (`</>`) to register a web app
4. Copy the config object shown — you'll need 6 values
5. In Firebase console, enable:
   - **Authentication** → Sign-in method → **Email/Password** → Enable
   - **Firestore Database** → Create database → Start in **test mode**
6. Rename `.env.example` → `.env` and fill in your values:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

7. Paste the `firestore.rules` file contents into **Firestore → Rules tab** in the console

That's it. No Google Maps, no billing, no credit card.

---

## 🗺️ Maps & Routing — 100% Free, No Key

| Service | Purpose | Cost |
|---|---|---|
| **OpenStreetMap + CARTO** | Map tiles (dark theme) | Free forever |
| **Nominatim** | Address → coordinates (geocoding) | Free, no key |
| **OSRM** | Driving route calculation | Free, no key |

All map functionality works out of the box with zero configuration.

---

## 🚀 Run the App

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in Firebase config
cp .env.example .env
# Edit .env with your Firebase values

# 3. Start dev server
npm run dev
# Open http://localhost:5173
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Layout.jsx        # Sidebar navigation
│   │   └── StatusBadge.jsx   # Available/Moderate/Full badge
│   └── stations/
│       ├── StationCard.jsx   # Station info card with queue bar
│       └── QRModal.jsx       # QR code generator (entry + exit)
├── context/
│   └── AuthContext.jsx       # Firebase Auth + user profile
├── hooks/
│   └── useStations.js        # Real-time Firestore onSnapshot
├── pages/
│   ├── Login.jsx
│   ├── Signup.jsx            # Role selection: Driver or Owner
│   ├── UserDashboard.jsx     # Live network stats + quick links
│   ├── StationList.jsx       # Search + filter all stations
│   ├── RoutePlanner.jsx      # Leaflet map + OSRM routing + nearby stations
│   ├── ScanQR.jsx            # Camera QR scan → Firestore transaction
│   ├── OwnerDashboard.jsx    # CRUD stations + QR generator
│   └── ManageStation.jsx     # Add/edit station with click-on-map picker
├── utils/
│   └── stationUtils.js       # Status logic, haversine, geocode, OSRM
├── firebase.js
├── App.jsx                   # Routes + role-based guards
└── index.css                 # Tailwind + custom styles
```

---

## 🧪 Testing the QR Flow

1. Log in as **Owner** → Add a station (click map to place it)
2. Click **QR Codes** on your station → download Entry & Exit QR PNGs
3. Open the URL directly (`/scan/[stationId]/entry`) to simulate a scan
4. Watch queue number update live on all connected sessions

---

## 🏗️ Production Build

```bash
npm run build
# Deploy /dist to Vercel, Netlify, or Firebase Hosting
```

---

## ⚠️ Notes

- Nominatim (geocoding) has a 1 req/sec rate limit — fine for normal use, not for bulk testing
- OSRM public server is for light use; for production you can self-host or use OpenRouteService
- QR scanning uses device camera via `html5-qrcode` — works best on mobile browsers
