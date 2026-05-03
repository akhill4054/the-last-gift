import { useState } from "react";
import { isPast, getMessage, formatWithYear } from "../utils/specialDates";
import config from "../config/local.config.json";
import FadeIn from "../components/FadeIn.jsx";

// screens/Special.jsx
export function Special({ entry }) {
  console.log("entry", entry);

  const [unlocked, setUnlocked] = useState(false);

  if (!entry) {
    return (
      <FadeIn>
        <div className="center">
          <h3 style={{ marginBottom: 8, fontWeight: 500, margin: 0 }}>
            Come back on these dates ✨
          </h3>
          <p style={{ opacity: 0.7, fontSize: 13, margin: 0 }}>
            Something special is waiting
          </p>
          {Object.values(config.SPECIAL_DATES).map((d, i) => {
            const past = isPast(d.date);

            console.log(past, d.date);

            return (
              <p
                key={i}
                style={{
                  opacity: past ? 0.5 : 1,
                  margin: 2
                }}
              >
                {formatWithYear(d.date)}
              </p>
            );
          })}
        </div>
      </FadeIn>
    );
  }

  const msg = getMessage(entry);

  return (
    <div className="center" style={{ position: "relative" }}>

      {/* Overlay */}
      {!unlocked && (
        <div
          className="click-overlay"
          onClick={() => setUnlocked(true)}
        >
          <p>Tap to see what today holds 🤍</p>
        </div>
      )}

      {/* Content */}
      {unlocked ? (
        <FadeIn>
          <div>
            <h1 style={{ margin: "0px", whiteSpace: "pre-line" }}>{msg?.title}</h1>

            {msg?.sub && (
              <p style={{ opacity: 0.6, margin: "10px" }}>
                {msg.sub}
              </p>
            )}
          </div>
        </FadeIn>
      ) : (
        // optional placeholder (keeps layout stable)
        <h1 style={{ whiteSpace: "pre-line", margin: "2px" }}>
          {msg?.title}
        </h1>
      )}

    </div>
  );
}
