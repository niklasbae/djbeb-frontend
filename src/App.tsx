import { useState, useEffect } from "react";
import { PlaylistSelector } from "./components/PlaylistSelector";
import { PlaylistView } from "./components/PlaylistView";
import { SpotifyWebPlayer } from "./components/SpotifyWebPlayer";
import { api } from "./api";
import { FaSpotify } from "react-icons/fa"; // ✅ Spotify Logo

export default function App() {
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackProgress, setCurrentTrackProgress] = useState(0);
  const [trackDuration, setTrackDuration] = useState(0);

  useEffect(() => {
    api.getPlaylists()
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false));
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        {/* ✅ Spotify Login Button - Fully Styled and Forced */}
        <button
          className="relative flex items-center gap-4 px-8 py-4 text-lg font-spotify font-bold text-black bg-[#1DB954] rounded-full shadow-lg hover:bg-[#1ED760] transition duration-200 ease-in-out border-none outline-none"
          style={{
            fontFamily: "Circular, Arial, sans-serif", // ✅ Exact Spotify Font
            fontSize: "22px", // ✅ Correct text size
            letterSpacing: "0.5px", // ✅ Slight letter spacing like Spotify
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => api.login()}
        >
          {/* ✅ Keep Icon Outside Green */}
          <div
            className="absolute left-[-40px] flex items-center justify-center w-12 h-12 bg-black rounded-full"
          >
            <FaSpotify size={28} className="text-white" />
          </div>

          <span className="leading-none">Log In</span> {/* ✅ Proper Text Alignment */}
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen text-gray-800">
      <SpotifyWebPlayer
        setDeviceId={setDeviceId}
        setIsPlaying={setIsPlaying}
        setCurrentTrackProgress={setCurrentTrackProgress}
        setTrackDuration={setTrackDuration}
      />

      {!selectedPlaylist ? (
        <PlaylistSelector onSelect={setSelectedPlaylist} />
      ) : (
        <PlaylistView 
          playlistId={selectedPlaylist} 
          onBack={() => setSelectedPlaylist(null)} 
          deviceId={deviceId} 
          isPlaying={isPlaying}
          currentTrackProgress={currentTrackProgress}
          trackDuration={trackDuration}
          setIsPlaying={setIsPlaying}
          setCurrentTrackProgress={setCurrentTrackProgress}
          setTrackDuration={setTrackDuration}
        />
      )}
    </div>
  );
}