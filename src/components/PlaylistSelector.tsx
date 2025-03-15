import { useEffect, useState } from "react";
import { api } from "../api";

interface Playlist {
  id: string;
  name: string;
  images: { url: string }[];
}

interface Props {
  onSelect: (id: string) => void;
  activatePlayer: () => void; // ✅ Add activation function
}

export function PlaylistSelector({ onSelect, activatePlayer }: Props) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [playerActivated, setPlayerActivated] = useState(false); // ✅ Track player state

  useEffect(() => {
    api.getPlaylists()
      .then((data) => setPlaylists(data.items))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="text-red-500 text-center">Error: {error}</div>;

  return (
    <div 
      className="p-6 w-full max-w-7xl mx-auto flex flex-col items-center justify-center"
      style={{ textAlign: "center" }} 
    > 
      <div style={{ height: "20px" }}></div> 
      <div 
        className="grid grid-cols-auto-fit gap-6 w-full max-w-6xl mx-auto" 
        style={{ justifyContent: "center", display: "flex", flexWrap: "wrap" }} 
      >
        {playlists.map((playlist) => {
          const images = playlist.images || [];
          const imageUrl = images.length > 0 ? images[0].url : ""; // ✅ Use first image

          return (
            <div
              key={playlist.id}
              onClick={() => {
                if (!playerActivated) {
                  activatePlayer(); // ✅ Activate player only on first click
                  setPlayerActivated(true);
                }
                onSelect(playlist.id);
              }}
              className="cursor-pointer border rounded-lg shadow-md bg-white hover:bg-gray-100 transition transform hover:scale-105 p-2 flex flex-col items-center justify-center"
              style={{ width: "220px", height: "280px", textAlign: "center" }}
            >
              <div 
                className="flex items-center justify-center rounded-md overflow-hidden"
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
                    alt={playlist.name}
                    className="rounded-md"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <span className="text-gray-600 text-xs">No Image</span>
                )}
              </div>

              <p 
                className="mt-2 text-sm font-medium text-gray-900 break-words text-center"
                style={{
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  whiteSpace: "normal",
                  maxWidth: "200px", // ✅ Match image width
                }}
              >
                {playlist.name}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}