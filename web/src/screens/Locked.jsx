import { useMemo, useState } from "react";
import { TEXT } from "../constants/text.js";
import { resetSlot } from "../api/client.js";
import FadeIn from "../components/FadeIn.jsx";

function formatInstant(iso) {
  if (!iso) return TEXT.FALLBACK_SCHEDULED;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return TEXT.FALLBACK_SCHEDULED;
  const parts = new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    hour12: true,
  }).formatToParts(d);

  const lookup = new Map(parts.map((p) => [p.type, p.value]));
  const day = lookup.get("day");
  const month = lookup.get("month");
  const hour = lookup.get("hour");
  const dayPeriod = lookup.get("dayPeriod");

  if (!day || !month || !hour || !dayPeriod) return TEXT.FALLBACK_SCHEDULED;
  return `${day} ${month}, after ${hour}${dayPeriod.toLowerCase()}`;
}

export function Locked({ data, loading, refresh, onRestart }) {
  const scheduledAt = data?.data?.scheduled_at ?? null;

  const [resetting, setResetting] = useState(false);

  const adjustedScheduledAt = useMemo(() => {
    if (!scheduledAt) return null;

    const d = new Date(scheduledAt);
    d.setHours(d.getHours() - 12);

    return d.toISOString();
  }, [scheduledAt]);

  const formatted = useMemo(() => formatInstant(adjustedScheduledAt), [adjustedScheduledAt]);

  async function handleRestart() {
    setResetting(true);

    try {
      await resetSlot();
    } catch { }

    onRestart?.();   // sets readyLocal = false
    await refresh(); // 🔥 ensures backend state updates
    setResetting(false);
  }

  return (
    <div className="center" style={{ position: "relative" }}>
      <button
        type="button"
        onClick={handleRestart}
        aria-label="Restart"
        title="Restart"
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          border: "1px solid transparent",
          background: "transparent",
          color: "var(--muted)",
          padding: "8px 10px",
          borderRadius: 10,
          cursor: "pointer",
          opacity: 0.7,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "1";
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "0.7";
          e.currentTarget.style.borderColor = "transparent";
          e.currentTarget.style.background = "transparent";
        }}
      >
        ← Restart
      </button>


      <FadeIn>
        <h1>{TEXT.LOCKED_TITLE}</h1>
        <p className="muted" style={{ marginTop: 8 }}>
          {TEXT.LOCKED_MESSAGE_PREFIX} {formatted}.
        </p>

        <button type="button" className="btn" onClick={refresh} disabled={loading} style={{ marginTop: 10 }}>
          {loading || resetting ? TEXT.REFRESHING : TEXT.MANUAL_REFRESH}
        </button>
      </FadeIn>
    </div>
  );
}

