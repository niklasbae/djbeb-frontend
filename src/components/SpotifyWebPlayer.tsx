/// <reference types="spotify-web-playback-sdk" />
import { useEffect, useState } from "react";

declare global {
  interface Window {
    spotifyPlayer?: Spotify.Player;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

interface Props {
  setDeviceId: (id: string) => void;
  setCurrentTrackProgress: (progress: number) => void;
  setTrackDuration: (duration: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
}

function extractSpotifyToken(jwt: string): string | null {
  try {
    const payloadBase64 = jwt.split(".")[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    return decodedPayload["SpotifyToken"];
  } catch {
    console.error("Failed to decode JWT.");
    return null;
  }
}

export function SpotifyWebPlayer({
  setDeviceId,
  setCurrentTrackProgress,
  setTrackDuration,
  setIsPlaying,
}: Props) {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);

  useEffect(() => {
    const jwtToken = localStorage.getItem("jwt");

    if (!jwtToken) {
      console.error("JWT token missing.");
      return;
    }

    const spotifyToken = extractSpotifyToken(jwtToken);
    if (!spotifyToken) {
      console.error("Spotify token missing from JWT.");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    window.onSpotifyWebPlaybackSDKReady = () => {
      const newPlayer = new Spotify.Player({
        name: "DJ Beb Web Player",
        getOAuthToken: (cb) => cb(spotifyToken),
        volume: 0.5,
      });

      setPlayer(newPlayer);
      window.spotifyPlayer = newPlayer;

      newPlayer.addListener("ready", ({ device_id }) => {
        console.log("✅ Ready with Device ID:", device_id);
        setDeviceId(device_id);
      });

      newPlayer.addListener("not_ready", ({ device_id }) => {
        console.log("❌ Device disconnected:", device_id);
      });

      newPlayer.addListener("player_state_changed", (state) => {
        if (!state) return;

        setCurrentTrackProgress(state.position);
        setTrackDuration(state.duration);
        setIsPlaying(!state.paused);
      });

      newPlayer.connect();
    };

    document.body.appendChild(script);

    return () => {
      player?.disconnect();
      script.remove();
    };
  }, []);

  useEffect(() => {
    if (!player) return;

    const interval = setInterval(async () => {
      const state = await player.getCurrentState();
      if (!state) {
        console.warn("⚠️ Web Player disconnected. Attempting reconnect...");
        player.connect();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [player]);

  return null;
}