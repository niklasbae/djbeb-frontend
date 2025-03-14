import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

declare global {
  interface Window {
    deferredPrompt: any;
  }
}

// Create the root element
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// ✅ Register the service worker for PWA functionality
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then(() => console.log("✅ Service Worker Registered"))
    .catch((error) => console.error("❌ Service Worker Registration Failed", error));
}

// ✅ Handle install prompt
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  window.deferredPrompt = event;
  console.log("✅ Install prompt triggered");
});

// ✅ Function to install PWA
const installPWA = () => {
  if (window.deferredPrompt) {
    window.deferredPrompt.prompt();
    window.deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === "accepted") {
        console.log("✅ User accepted the install prompt");
      } else {
        console.log("❌ User dismissed the install prompt");
      }
      window.deferredPrompt = null;
    });
  }
};

// ✅ Render install button inside the root app
const InstallButton = () => {
  const [showButton, setShowButton] = useState(false);

  window.addEventListener("beforeinstallprompt", () => setShowButton(true));

  return showButton ? (
    <button
      onClick={installPWA}
      className="fixed bottom-4 right-4 px-6 py-2 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition"
    >
      Install SpotiBaby
    </button>
  ) : null;
};

// ✅ Append install button inside root
document.addEventListener("DOMContentLoaded", () => {
  const installButtonContainer = document.createElement("div");
  document.body.appendChild(installButtonContainer);
  createRoot(installButtonContainer).render(<InstallButton />);
});