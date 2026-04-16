import { useEffect, useMemo, useState } from "react";
import { bookSlot, getStatus } from "../api/client.js";
import { TEXT } from "../constants/text.js";

const IST_OFFSET_MINUTES = 330; // +05:30
const IST_OFFSET_MS = IST_OFFSET_MINUTES * 60 * 1000;

function toYyyyMmDdUtc(dateUtc) {
  const y = dateUtc.getUTCFullYear();
  const m = String(dateUtc.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dateUtc.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDaysUtc(yyyyMmDd, daysToAdd) {
  const [y, m, d] = (yyyyMmDd ?? "").split("-").map((x) => Number(x));
  if (!y || !m || !d) return null;
  const base = Date.UTC(y, m - 1, d, 0, 0, 0, 0);
  const next = new Date(base + daysToAdd * 24 * 60 * 60 * 1000);
  return toYyyyMmDdUtc(next);
}

function computeAvailableDatesFromNowUtcIso(nowUtcIso) {
  const nowUtc = new Date(nowUtcIso);
  if (Number.isNaN(nowUtc.getTime())) return [];

  const nowIst = new Date(nowUtc.getTime() + IST_OFFSET_MS);

  // Base = today (IST)
  const baseIst = new Date(
    Date.UTC(
      nowIst.getUTCFullYear(),
      nowIst.getUTCMonth(),
      nowIst.getUTCDate()
    )
  );

  // Start from day after tomorrow (+2 days)
  const startDateIstYmd = toYyyyMmDdUtc(
    new Date(baseIst.getTime() + 2 * 24 * 60 * 60 * 1000)
  );

  const out = [];
  for (let i = 0; i < 5; i++) {
    const d = addDaysUtc(startDateIstYmd, i);
    if (d) out.push(d);
  }

  return out;
}

function buildScheduledUtcIsoFromIst(dateStrIst, hourIst) {
  const [y, m, d] = (dateStrIst ?? "").split("-").map((x) => Number(x));
  if (!y || !m || !d) return null;
  const instantUtcMs = Date.UTC(y, m - 1, d, hourIst, 0, 0, 0) - IST_OFFSET_MS;
  const utc = new Date(instantUtcMs);
  if (Number.isNaN(utc.getTime())) return null;
  return utc.toISOString();
}

export function SlotPicker({ nowUtcIso, onBooked, onRestart }) {
  const [fade, setFade] = useState(false);

  const slots = useMemo(
    () => [
      { key: "5pm", label: TEXT.SLOT_5PM, hourIst: 17 },
      { key: "6pm", label: TEXT.SLOT_6PM, hourIst: 18 },
      { key: "7pm", label: TEXT.SLOT_7PM, hourIst: 19 },
      // { key: "8pm", label: TEXT.SLOT_8PM, hourIst: 20 },
    ],
    []
  );

  const [step, setStep] = useState("date"); // "date" | "time"
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedKey, setSelectedKey] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const selected = slots.find((s) => s.key === selectedKey) ?? null;
  const availableDates = useMemo(
    () => computeAvailableDatesFromNowUtcIso(nowUtcIso),
    [nowUtcIso]
  );

  async function onConfirm() {
    if (!selected || submitting) return;
    setSubmitting(true);
    try {
      const scheduledAt = buildScheduledUtcIsoFromIst(selectedDate, selected.hourIst);
      if (!scheduledAt) return;
      await bookSlot(scheduledAt);
      await onBooked();
    } finally {
      setSubmitting(false);
    }
  }

  const [showConfirm, setShowConfirm] = useState(false);

  function handleRestart() {
    window.localStorage.setItem("ready", "false");
    onRestart?.();
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

      {step === "date" && (
        <div className={`fade ${submitting ? "" : "show"}`}>
          <div className="fade show">
            <h1>{TEXT.DATE_TITLE}</h1>
            <p className="muted">{TEXT.DATE_SUBTITLE}</p>

            <div
              className="block"
              style={{
                width: "min(420px, 100%)",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                alignItems: "stretch",
              }}
            >
              <div className="label">{TEXT.DATE_LABEL}</div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  justifyContent: "center",
                }}
              >
                {availableDates.map((d) => {
                  const active = d === selectedDate;
                  return (
                    <button
                      key={d}
                      type="button"
                      className={active ? "slot active" : "slot"}
                      onClick={() => {
                        setSelectedDate(d);
                        setSelectedKey(null);
                      }}
                      disabled={submitting}
                      style={{ minWidth: 130 }}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              className="btn"
              onClick={() => {
                setFade(false);
                setStep("time");

                requestAnimationFrame(() => {
                  setFade(true);
                });
              }}
              disabled={!selectedDate || submitting}
              style={{ marginTop: 20 }}
            >
              {TEXT.NEXT_BUTTON}
            </button>
          </div>
        </div>
      )}

      {step === "time" && (
        <>
          <button
            type="button"
            onClick={() => {
              setStep("date");
              setSelectedKey(null);
            }}
            aria-label="Back"
            title="Back"
            style={{
              position: "absolute",
              top: 14,
              right: 14,
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
            ← {TEXT.BACK_BUTTON}
          </button>

          <div className={`fade ${submitting ? "" : "show"}`}>
            <div className={`fade ${fade ? "show" : ""}`}>
              <h1>{TEXT.SLOT_TITLE}</h1>
              <p className="muted">
                {TEXT.SLOT_SUBTITLE} <span style={{ opacity: 0.9 }}>({selectedDate})</span>
              </p>

              <div className="slots">
                {slots.map((s) => {
                  const active = s.key === selectedKey;
                  const iso = buildScheduledUtcIsoFromIst(selectedDate, s.hourIst);
                  const utcCandidate = iso ? new Date(iso) : null;
                  const nowUtc = nowUtcIso ? new Date(nowUtcIso) : null;
                  const inPast =
                    !utcCandidate ||
                      Number.isNaN(utcCandidate.getTime()) ||
                      !nowUtc ||
                      Number.isNaN(nowUtc.getTime())
                      ? true
                      : utcCandidate.getTime() <= nowUtc.getTime();

                  return (
                    <button
                      key={s.key}
                      type="button"
                      className={active ? "slot active" : "slot"}
                      onClick={() => setSelectedKey(s.key)}
                      disabled={submitting || inPast}
                      title={inPast ? TEXT.SLOT_PAST_TOOLTIP : undefined}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              className="btn"
              onClick={() => { setShowConfirm(true) }}
              style={{ marginTop: 10 }}
              disabled={!selectedKey || submitting}
            >
              {submitting ? TEXT.CONFIRMING : TEXT.CONFIRM_BUTTON}
            </button>
          </div>
        </>
      )}

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <p>1. {TEXT.RULE_1}</p>
            <p>2. {TEXT.RULE_2}</p>
            <p>3. {TEXT.RULE_3}</p>

            <p style={{ marginTop: 10 }}>
              {TEXT.RULE_WARN}
            </p>

            <div className="modal-actions">
              <button
                className="btn"
                onClick={async () => {
                  setShowConfirm(false);
                  await onConfirm(); // existing logic
                }}
              >
                Yes
              </button>
            </div>
            <div className="modal-actions">
              <button
                className="btn secondary"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {submitting && (
        <div className="loading-overlay fade show">
          <h1>{TEXT.APP_TITLE}</h1>
          <p className="muted">Confirming your moment...</p>
        </div>
      )}
    </div>
  );
}

