export const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5151";

export const api = {
  login: () => {
    window.location.href = `${baseUrl}/api/spotify/login`; // ✅ Added `/api`
  },

  getPlaylists: async () => {
    const res = await fetch(`${baseUrl}/api/spotify/playlists`, { credentials: "include" }); // ✅ Added `/api`
    if (!res.ok) throw new Error(`Error: ${res.statusText}`);
    return res.json();
  },

  getPlaylistTracks: async (id: string) => {
    const res = await fetch(`${baseUrl}/api/spotify/playlist/${id}`, { credentials: "include" }); // ✅ Added `/api`
    if (!res.ok) throw new Error(`Error: ${res.statusText}`);
    return res.json();
  },

  getSpotifyToken: async () => {
    const res = await fetch(`${baseUrl}/api/spotify/token`, { credentials: "include" }); // ✅ Added `/api`
    if (!res.ok) throw new Error("Failed to fetch token");
    return res.json();
  },

  playTrack: async (trackId: string, deviceId: string, playlistId: string) => {
    const res = await fetch(`${baseUrl}/api/spotify/play`, { // ✅ Added `/api`
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ trackId, deviceId, playlistId }),
    });

    if (!res.ok) throw new Error(`Error: ${res.statusText}`);
    return res.json();
  },

  pausePlayback: () =>
    fetch(`${baseUrl}/api/spotify/pause`, { method: "POST", credentials: "include" }), // ✅ Added `/api`

  resumePlayback: (deviceId: string) =>
    fetch(`${baseUrl}/api/spotify/resume?device_id=${deviceId}`, { // ✅ Added `/api`
      method: "POST",
      credentials: "include",
    }),

  seekPlayback: async (positionMs: number, deviceId: string) => {
    const res = await fetch(`${baseUrl}/api/spotify/seek`, { // ✅ Added `/api`
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ positionMs, deviceId }),
    });

    if (!res.ok) throw new Error(`Error: ${res.statusText}`);

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return res.json();
    } else {
      return res.text(); // Fallback for plain text responses
    }
  },
};