import { useState, useEffect } from "react";
import { PlaylistSelector } from "./components/PlaylistSelector";
import { PlaylistView } from "./components/PlaylistView";
import { SpotifyWebPlayer } from "./components/SpotifyWebPlayer";
import { api } from "./api";
import { FaSpotify } from "react-icons/fa";

export default function App() {
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackProgress, setCurrentTrackProgress] = useState(0);
  const [trackDuration, setTrackDuration] = useState(0);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jwtToken = urlParams.get("token");

    if (jwtToken) {
      localStorage.setItem("jwt", jwtToken);
      window.history.replaceState({}, document.title, "/");
      setIsAuthenticated(true);
    } else if (localStorage.getItem("jwt")) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <button
          className="relative flex items-center gap-4 px-8 py-4 text-lg font-bold text-black bg-[#1DB954] rounded-full shadow-lg hover:bg-[#1ED760] transition duration-200 ease-in-out"
          onClick={() => api.login()}
        >
          <FaSpotify size={28} className="text-white absolute left-[-40px] bg-black rounded-full w-12 h-12 p-2" />
          <span>Log In</span>
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