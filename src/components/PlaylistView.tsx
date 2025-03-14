import { useEffect, useState } from "react";
import { api } from "../api";
import { FaPlay, FaPause } from "react-icons/fa"; // 🎵 Play/Pause Icons

interface Track {
  track: {
    id: string;
    name: string;
    uri: string;
    album?: { images?: { url: string }[] };
  };
}

interface Props {
  playlistId: string;
  onBack: () => void;
  deviceId: string | null;
  isPlaying: boolean;
  currentTrackProgress: number;
  trackDuration: number;
  setIsPlaying: (value: boolean) => void;
  setCurrentTrackProgress: (progress: number) => void;
  setTrackDuration: (duration: number) => void;
}

export function PlaylistView({ 
  playlistId, 
  onBack, 
  deviceId, 
  isPlaying, 
  currentTrackProgress, 
  trackDuration, 
  setIsPlaying, 
  setCurrentTrackProgress, 
  setTrackDuration 
}: Props) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [_currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);

  useEffect(() => {
    api.getPlaylistTracks(playlistId)
      .then(data => setTracks(data.items || []))
      .catch(err => setError(err.message));
  }, [playlistId]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!window.spotifyPlayer) return;
  
      const state = await window.spotifyPlayer.getCurrentState();
      if (!state) return;
  
      // ✅ Fixed: Directly assign boolean values
      setIsPlaying(!state.paused);
      setCurrentTrackProgress(state.position);
      setTrackDuration(state.duration);
    }, 1000);
  
    return () => clearInterval(interval);
  }, [setCurrentTrackProgress, setTrackDuration, setIsPlaying]);

  const playTrack = (trackId: string, index: number) => {
    if (!deviceId) {
      console.error("❌ No active Spotify Web Player device found.");
      return;
    }

    setCurrentTrackIndex(index);
    console.log(`🎵 Playing track ${trackId} from playlist ${playlistId}`);

    api.playTrack(trackId, deviceId, playlistId)
      .then(() => setIsPlaying(true))
      .catch(err => console.error("⚠️ Playback failed:", err));
  };

  const togglePlayPause = () => {
    if (!deviceId) {
      console.error("❌ No active Spotify Web Player device found.");
      return;
    }

    if (isPlaying) {
      api.pausePlayback().then(() => setIsPlaying(false));
    } else {
      api.resumePlayback(deviceId).then(() => setIsPlaying(true));
    }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!deviceId) {
      console.error("❌ No active Spotify Web Player device found.");
      return;
    }
  
    const newPosition = parseInt(e.target.value, 10);
    setCurrentTrackProgress(newPosition); // ✅ Instant UI update

    api.seekPlayback(newPosition, deviceId)
      .catch(err => console.error("⚠️ Seek failed:", err));
  };

  if (error) return <div className="text-red-500 text-center">Error: {error}</div>;

  return (
    <div className="p-6 w-full max-w-7xl mx-auto flex flex-col items-center justify-center"
      style={{ textAlign: "center" }}
    >
      <button onClick={onBack} className="mb-6 px-4 py-2 rounded border bg-gray-100 shadow text-lg font-spotify">
        ← Back
      </button>

      <div style={{ height: "20px" }}></div> 

      <div className="grid grid-cols-auto-fit gap-6 w-full max-w-6xl mx-auto"
        style={{ justifyContent: "center", display: "flex", flexWrap: "wrap" }}
      >
        {tracks.map((track, index) => {
          const imageUrl = track.track.album?.images?.[0]?.url || '';

          return (
            <div
              key={track.track.id || index}
              onClick={() => playTrack(track.track.id, index)}
              className="cursor-pointer border rounded-lg shadow-md bg-white hover:bg-gray-100 transition transform hover:scale-105 p-2 flex flex-col items-center justify-center"
              style={{ width: "220px", height: "280px", textAlign: "center" }}
            >
              <div className="flex items-center justify-center rounded-md overflow-hidden"
                style={{
                  width: "200px",
                  height: "200px",
                  backgroundColor: "#E5E7EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={track.track.name}
                    className="rounded-md"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <span className="text-gray-600 text-xs">No Image</span>
                )}
              </div>
              <p className="mt-2 text-sm font-medium text-gray-900 break-words text-center"
                style={{
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "normal",
                  maxWidth: "200px",
                }}
              >
                {track.track.name}
              </p>
            </div>
          );
        })}
      </div>

      {/* Sticky Full-Width Playback Container */}
      <div
        className="fixed bottom-0 left-0 w-full bg-white text-black flex flex-col items-center justify-center py-4 shadow-lg"
        style={{
          position: "fixed",
          bottom: "0",
          left: "0",
          width: "100%",
          zIndex: 9999, // Keeps it on top
          backgroundColor: "#FFF", // White background
          padding: "10px 0", // Add some vertical padding
          borderTop: "2px solid rgba(0, 0, 0, 0.1)", // Subtle separator line
        }}
      >
        {/* Progress Bar */}
        <input
          type="range"
          min="0"
          max={trackDuration}
          value={currentTrackProgress}
          onChange={seek}
          className="w-full max-w-3xl h-2 rounded-lg appearance-none cursor-pointer"
          style={{
            accentColor: "#1DB954", // Spotify green progress bar
            backgroundColor: "#ddd", // Light gray for contrast
          }}
        />

        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className="mt-2 p-4 rounded-full bg-green-500 text-black font-bold text-lg font-spotify shadow-md hover:bg-green-400 transition"
        >
          {isPlaying ? <FaPause size={24} /> : <FaPlay size={24} />}
        </button>
      </div>
    </div>
  );
}