self.addEventListener("install", (event) => {
    event.waitUntil(
      caches.open("spotibaby-cache").then((cache) => {
        return cache.addAll([{
    "name": "SpotiBaby",
    "short_name": "SpotiBaby",
    "description": "A simple Spotify remote web app for kids",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#000000",
    "theme_color": "#1DB954",
    "icons": [
      {
        "src": "/icon-192x192.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "/icon-512x512.png",
        "sizes": "512x512",
        "type": "image/png"
      }
    ]
  },
          "/",
          "/index.html",
          "/manifest.json",
          "/icon-192x192.png",
          "/icon-512x512.png"
        ]);
      })
    );
  });
  
  self.addEventListener("fetch", (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });