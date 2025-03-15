export const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5151";

const getToken = (): string | null => localStorage.getItem("jwt");
const setToken = (token: string) => localStorage.setItem("jwt", token);
const removeToken = () => localStorage.removeItem("jwt");

// 🔹 Ensures headers are always a **plain object**
const createHeaders = (): Record<string, string> => {
  const token = getToken();
  if (!token) throw new Error("No token found");
  return { Authorization: `Bearer ${token}` };
};

const refreshToken = async (): Promise<string | null> => {
  try {
    console.log("🔄 Refreshing token...");
    const res = await fetch(`${baseUrl}/api/spotify/refresh`, {
      method: "POST",
      headers: createHeaders(),
    });

    if (!res.ok) throw new Error("Token refresh failed");

    const data = await res.json();
    setToken(data.jwtToken);
    return data.jwtToken;
  } catch (error) {
    console.error("🚨 Refresh token failed. Logging out.");
    removeToken();
    window.location.href = "/";
    return null;
  }
};

const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<any> => {
  let headers = { ...createHeaders(), ...(options.headers as Record<string, string>) };

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    console.warn("⚠️ Token expired. Attempting refresh...");
    const newToken = await refreshToken();
    if (!newToken) throw new Error("Token refresh failed");

    headers = { ...headers, Authorization: `Bearer ${newToken}` };
    res = await fetch(url, { ...options, headers });
  }

  if (!res.ok) throw new Error(`Error: ${res.statusText}`);
  return res.json();
};

export const api = {
  login: () => {
    window.location.href = `${baseUrl}/api/spotify/login`;
  },

  getPlaylists: () => fetchWithAuth(`${baseUrl}/api/spotify/playlists`),

  getPlaylistTracks: (id: string) => fetchWithAuth(`${baseUrl}/api/spotify/playlist/${id}`),

  playTrack: async (trackId: string, deviceId: string, playlistId: string) => {
    return fetchWithAuth(`${baseUrl}/api/spotify/play`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId, deviceId, playlistId }),
    });
  },

  pausePlayback: () => fetchWithAuth(`${baseUrl}/api/spotify/pause`, { method: "POST" }),

  resumePlayback: (deviceId: string) =>
    fetchWithAuth(`${baseUrl}/api/spotify/resume?device_id=${deviceId}`, { method: "POST" }),

  seekPlayback: (positionMs: number, deviceId: string) =>
    fetchWithAuth(`${baseUrl}/api/spotify/seek`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ positionMs, deviceId }),
    }),
};