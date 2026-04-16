import React, { useState, useEffect } from "react";
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

  function onStart() {
    setReadyLocal(true);
  }

  function onRestart() {
    window.localStorage.removeItem("ready");
    setReadyLocal(false);
  }

  let content;

  if (!hasResponse) {
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

  return <AppLayout>{content}</AppLayout>;
}

