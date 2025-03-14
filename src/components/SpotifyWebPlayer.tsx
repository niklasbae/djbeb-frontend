/// <reference types="spotify-web-playback-sdk" />
import { useEffect, useState } from "react";
import { api } from "../api";

declare global {
  interface Window {
    spotifyPlayer?: Spotify.Player;
  }
}

interface Props {
  setDeviceId: (id: string) => void;
  setCurrentTrackProgress: (progress: number) => void;
  setTrackDuration: (duration: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
}

export function SpotifyWebPlayer({
  setDeviceId,
  setCurrentTrackProgress,
  setTrackDuration,
  setIsPlaying,
}: Props) {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    api.getSpotifyToken()
      .then((data) => {
        console.log("🎟️ Received Spotify Token:", data.access_token);
        setToken(data.access_token);
      })
      .catch((error) => console.error("⚠️ Failed to fetch token:", error));
  }, []);

  useEffect(() => {
    if (!token) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const newPlayer = new Spotify.Player({
        name: "DJ Beb Web Player",
        getOAuthToken: (cb) => cb(token),
        volume: 0.5,
      });

      setPlayer(newPlayer);
      window.spotifyPlayer = newPlayer; // ✅ Now TypeScript won't complain!

      newPlayer.addListener("ready", ({ device_id }) => {
        console.log("✅ Ready with Device ID:", device_id);
        setDeviceId(device_id);
      });

      newPlayer.addListener("not_ready", ({ device_id }) => {
        console.log("❌ Device ID disconnected:", device_id);
      });

      // ✅ Track song progress, auto-skip, and update playback state
      newPlayer.addListener("player_state_changed", (state) => {
        if (!state) return;

        console.log("🎵 Player state changed:", state);

        // ✅ Update progress bar values
        setCurrentTrackProgress(state.position);
        setTrackDuration(state.duration);

        // ✅ Track play/pause state
        setIsPlaying(!state.paused);

        // ✅ Auto-play next track if current one is finished
        if (state.paused && state.position === 0 && state.track_window.next_tracks.length > 0) {
          console.log("⏭️ Auto-playing next track...");
          newPlayer.nextTrack().catch(err => console.error("⚠️ Failed to skip track:", err));
        }
      });

      newPlayer.connect();
    };
  }, [token]);

  useEffect(() => {
    if (!player) return;

    const interval = setInterval(async () => {
      const state = await player.getCurrentState();
      if (!state) {
        console.warn("⚠️ Web Player is not connected. Reconnecting...");
        player.connect();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [player]);

  return null;
}