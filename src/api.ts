export const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5151";

const getToken = () => localStorage.getItem("jwt");

export const api = {
  login: () => {
    window.location.href = `${baseUrl}/api/spotify/login`;
  },

  // ✅ No authenticate endpoint needed (JWT is provided on login redirect)

  getPlaylists: async () => {
    const res = await fetch(`${baseUrl}/api/spotify/playlists`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error(`Error: ${res.statusText}`);
    return res.json();
  },

  getPlaylistTracks: async (id: string) => {
    const res = await fetch(`${baseUrl}/api/spotify/playlist/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error(`Error: ${res.statusText}`);
    return res.json();
  },

  playTrack: async (trackId: string, deviceId: string, playlistId: string) => {
    const res = await fetch(`${baseUrl}/api/spotify/play`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ trackId, deviceId, playlistId }),
    });
    if (!res.ok) throw new Error(`Error: ${res.statusText}`);
    return res.json();
  },

  pausePlayback: async () => {
    const res = await fetch(`${baseUrl}/api/spotify/pause`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error(`Error: ${res.statusText}`);
    return res.text();
  },

  resumePlayback: async (deviceId: string) => {
    const res = await fetch(`${baseUrl}/api/spotify/resume?device_id=${deviceId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error(`Error: ${res.statusText}`);
    return res.text();
  },

  seekPlayback: async (positionMs: number, deviceId: string) => {
    const res = await fetch(`${baseUrl}/api/spotify/seek`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ positionMs, deviceId }),
    });

    if (!res.ok) throw new Error(`Error: ${res.statusText}`);

    const contentType = res.headers.get("content-type");
    return contentType?.includes("application/json")
      ? res.json()
      : res.text();
  },
};