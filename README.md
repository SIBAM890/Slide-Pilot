# SlidePilot 🚀

**Refined WebRTC Screen Sharing & Remote Control System**

SlidePilot solves the problem of connecting laptops to smart boards wirelessly without installing software. It allows you to share your screen via a browser and control your presentation (Next/Prev) directly from the smart board using touch gestures or buttons.

---

## ✨ Features
*   **Zero Installation**: Works entirely in the browser (Chrome, Edge, Firefox, Safari).
*   **Instant Screen Sharing**: High-quality, low-latency WebRTC streaming.
*   **Remote Control**: Control PowerPoint, Google Slides, or Keynote from the viewing device.
*   **Touch Gestures**: Swipe Left/Right on the Smart Board to change slides.
*   **Secure**: Uses generated room codes for private sessions.

---

## 🛠️ Architecture
This is a monorepo setup containing:

1.  **Server (`/server`)**: A Node.js + Socket.io signaling server. It manages room connections and relays WebRTC signals (Offers/Answers) and control commands. It **does not** handle the video stream (that's P2P).
2.  **Client (`/client`)**: A React + Vite application.
    *   **Broadcaster**: Captures screen using `getDisplayMedia`, creates P2P connection, simulates keyboard events.
    *   **Controller**: Receives P2P stream, displays video, sends control commands via Socket.io.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v16 or higher)
*   npm

### 1. Start the Signaling Server
The server handles the initial handshake between devices.

```bash
cd server
npm install
npm start
```
*Output: `🚀 SlidePilot Signaling Server running...`*

### 2. Start the Client Application
The client acts as both the Broadcaster and the Controller.

```bash
cd client
npm install
npm run dev
```
*Opens local server at: `http://localhost:5173`*

---

## 📖 User Guide

### Role 1: Broadcaster (The Presenter/Laptop)
1.  Open the app on your laptop.
2.  Select **Broadcaster**.
3.  **Copy the Session Code** shown at the top.
4.  Click **Start Screen Share** and select your presentation window.
5.  **Critical Step**: Click back on your presentation window to ensure it has focus. The app simulates "Arrow Left/Right" keys, which only work if the target window is focused.

### Role 2: Controller (The Smart Board/Viewer)
1.  Open the app on the Smart Board (or tablet/phone).
2.  Select **Controller**.
3.  Enter the **Session Code** provided by the Broadcaster.
4.  Click **Connect**.
5.  **Control Slides**:
    *   Tap **Next / Prev** buttons.
    *   **Swipe Left** to go Next.
    *   **Swipe Right** to go Previous.

---

## 🔧 Technologies
*   **Frontend**: React, Vite, Tailwind CSS, SimplePeer (WebRTC)
*   **Backend**: Node.js, Socket.io
*   **Icons**: Lucide React

---

## ⚠️ Troubleshooting
*   **Video not appearing?** Ensure you agreed to browser permissions for screen sharing.
*   **Controls not working?** Make sure the Broadcaster laptop has the presentation window **focused**.
*   **Connection issues?** Ensure both devices are on the same network. If using `localhost`, devices might not see each other; use your machine's LAN IP (e.g., `http://192.168.1.5:5173`) and update `client/src/utils/webrtc.js` if deploying to production.