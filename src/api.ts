const baseUrl = import.meta.env.VITE_API_BASE_URL;

export const api = {
  login: () => {
    window.location.href = `${baseUrl}/spotify/login`;
  },

  getPlaylists: async () => {
    const res = await fetch(`${baseUrl}/spotify/playlists`, { credentials: "include" });
    if (!res.ok) throw new Error(`Error: ${res.statusText}`);
    return res.json();
  },

  getPlaylistTracks: async (id: string) => {
    const res = await fetch(`${baseUrl}/spotify/playlist/${id}`, { credentials: "include" });
    if (!res.ok) throw new Error(`Error: ${res.statusText}`);
    return res.json();
  },

  getSpotifyToken: async () => {
    const res = await fetch(`${baseUrl}/spotify/token`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch token");
    return res.json();
  },

  playTrack: async (trackId: string, deviceId: string, playlistId: string) => {
    const res = await fetch(`${baseUrl}/spotify/play`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ trackId, deviceId, playlistId }), // ✅ Send all three params
    });

    if (!res.ok) throw new Error(`Error: ${res.statusText}`);
    return res.json();
  },

  pausePlayback: () =>
    fetch(`${baseUrl}/spotify/pause`, { method: "POST", credentials: "include" }),

  resumePlayback: (deviceId: string) =>
    fetch(`${baseUrl}/spotify/resume?device_id=${deviceId}`, {
      method: "POST",
      credentials: "include",
    }),

    seekPlayback: async (positionMs: number, deviceId: string) => {
      const res = await fetch(`${baseUrl}/spotify/seek`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positionMs, deviceId }),
      });
    
      if (!res.ok) throw new Error(`Error: ${res.statusText}`);
    
      // ✅ Ensure we only parse JSON if the response is JSON
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return res.json();
      } else {
        return res.text(); // Fallback for plain text responses
      }
    },

  
};