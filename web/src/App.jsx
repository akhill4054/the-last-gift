import { useState, useEffect, useRef } from "react";
import { TEXT } from "./constants/text.js";
import { useStatus } from "./hooks/useStatus.js";
import { Intro } from "./screens/Intro.jsx";
import { SlotPicker } from "./screens/SlotPicker.jsx";
import { Locked } from "./screens/Locked.jsx";
import { Location } from "./screens/Location.jsx";
import AppLayout from "./components/AppLayout";


export default function App() {
  const [readyLocal, setReadyLocal] = useState(() => {
    return window.localStorage.getItem("ready") === "true";
  });

  const { data, loading, refresh } = useStatus();

  const status = data?.status ?? null;
  const hasResponse = data !== undefined;

  const hasPlayed = useRef(false);
  const [audioReady, setAudioReady] = useState(false);
  const audioRef = useRef(new Audio("/bg-music.mp3"));

  useEffect(() => {
    const audio = audioRef.current;

    const handleReady = () => {
      setAudioReady(true);
    };

    audio.addEventListener("canplaythrough", handleReady);

    // start loading
    audio.load();

    return () => {
      audio.removeEventListener("canplaythrough", handleReady);
    };
  }, []);

  function startMusicOnce() {
    if (hasPlayed.current) return;

    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = true;

    audio.play()
      .then(() => {
        hasPlayed.current = true;

        // Fade-in starts here
        let vol = 0;
        const fade = setInterval(() => {
          if (vol >= 0.5) {
            clearInterval(fade);
            return;
          }
          vol += 0.05;
          audio.volume = vol;
          console.log("Volume:", vol);
        }, 100);
      })
      .catch(() => { });
  }

  useEffect(() => {
    const audio = audioRef.current;

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && hasPlayed.current) {
        audio.play().catch(() => { });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  function onStart() {
    setReadyLocal(true);
  }

  function onRestart() {
    window.localStorage.removeItem("ready");
    setReadyLocal(false);
  }

  let content;

  if (!hasResponse || !audioReady) {
    content = (
      <div className="fade show">
        <div className="center">
          <h1>{TEXT.APP_TITLE}</h1>
          <p className="muted">Loading your surprise...</p>
        </div>
      </div>
    );
  } else if (!readyLocal && status == "new") {
    content = <Intro onStart={onStart} />;
  } else if (status === "location") {
    content = <Location data={data} />;
  } else if (status === "slot_selected") {
    content = (
      <Locked
        data={data}
        loading={loading}
        refresh={refresh}
        onRestart={onRestart}
      />
    );
  } else {
    content = <SlotPicker
      nowUtcIso={data?.now}
      onBooked={refresh}
      onRestart={onRestart} />;
  }

  return (
    <div
      onClick={startMusicOnce}
      onPointerDown={startMusicOnce}
      style={{ height: "100%" }}
    >
      <AppLayout>{content}</AppLayout>

      <div className="floating-flower" />
    </div>
  );
}

