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
  playerActivated: boolean; // ✅ Triggered from App.tsx when a playlist is selected
}

function extractSpotifyToken(jwt: string): string | null {
  try {
    const payloadBase64 = jwt.split(".")[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    return decodedPayload["SpotifyToken"] ?? null;
  } catch (error) {
    console.error("❌ Failed to decode JWT:", error);
    return null;
  }
}

export function SpotifyWebPlayer({
  setDeviceId,
  setCurrentTrackProgress,
  setTrackDuration,
  setIsPlaying,
  playerActivated, // ✅ Comes from App.tsx when a playlist is clicked
}: Props) {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [playerInitialized, setPlayerInitialized] = useState(false);

  // ✅ Fetch token once on load
  useEffect(() => {
    const jwtToken = localStorage.getItem("jwt");
    if (!jwtToken) {
      console.error("⚠️ JWT token missing.");
      return;
    }

    const token = extractSpotifyToken(jwtToken);
    if (!token) {
      console.error("⚠️ Spotify token missing from JWT.");
      return;
    }

    setSpotifyToken(token);
  }, []);

  // ✅ Load SDK script (only once)
  useEffect(() => {
    if (sdkLoaded) return; // Prevent duplicate loading

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    script.onload = () => setSdkLoaded(true);

    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [sdkLoaded]);

  // ✅ Initialize player when `playerActivated` is true
  useEffect(() => {
    if (!playerActivated || playerInitialized) return;
    if (!spotifyToken) {
      console.error("🚨 No Spotify token available.");
      return;
    }
    if (!sdkLoaded) {
      console.error("⚠️ Spotify SDK is not ready yet.");
      return;
    }

    console.log("🎵 Initializing Spotify Web Player...");

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

    console.log("🔄 Connecting player...");
    newPlayer.connect();
    setPlayerInitialized(true);
  }, [playerActivated, spotifyToken, sdkLoaded]);

  // ✅ Auto-reconnect logic
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

  return null; // ✅ No more separate activation button needed
}