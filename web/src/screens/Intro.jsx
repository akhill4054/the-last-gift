import { useState, useEffect } from "react";
import { TEXT } from "../constants/text.js";

export function Intro({ onStart }) {
  const [step, setStep] = useState(1);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setFade(true));
    return () => cancelAnimationFrame(t);
  }, []);

  function nextStep() {
    setFade(false);
    setTimeout(() => {
      setStep(2);
      setFade(true);
    }, 200);
  }

  function handleStart() {
    window.localStorage.setItem("ready", "true");
    onStart?.();
  }

  return (
    <div className="center">
      <div className={`fade ${fade ? "show" : ""}`}>
        {step === 1 && (
          <>
            <h1>{TEXT.INTRO_TITLE}</h1>
            <button className="btn" onClick={nextStep} style={{ marginTop: 20 }}>
              {TEXT.INTRO_NEXT}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="muted">{TEXT.INTRO_MESSAGE}</p>
            <button className="btn" onClick={handleStart} style={{ marginTop: 8 }}>
              {TEXT.INTRO_BUTTON}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
