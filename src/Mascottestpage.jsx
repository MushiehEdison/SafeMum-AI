// src/pages/MascotTestPage.jsx
// ─────────────────────────────────────────────────────────────────
// Drop this file into your project, add a route to it, and open it
// in the browser. It lets you test every Mascot prop live.
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import Mascot from "./Components/Mascot/Mascot";
import "./Mascottestpage.css";

// ── Preset scenarios ──────────────────────────────────────────────
const SCENARIOS = [
  {
    label: "Home — rotating messages",
    description: "Cycles through 4 home-page messages every 3 s (shortened for testing)",
    auto: true,
    messages: [
      "Hi Sarah. How are you feeling today?",
      "Your follow-up appointment is tomorrow.",
      "It has been 3 days since your last check-in.",
      "You are doing better than you think.",
    ],
    mood: "idle",
    position: "left",
    size: 140,
  },
  {
    label: "AI — idle state",
    description: "Default AI assistant state before any message is sent",
    mood: "idle",
    message: "I am here. What is on your mind?",
    position: "right",
    size: 100,
  },
  {
    label: "AI — listening",
    description: "While waiting for AI response",
    mood: "idle",
    message: "I am listening...",
    position: "right",
    size: 100,
  },
  {
    label: "AI — concerned",
    description: "AI detected grief or difficult language",
    mood: "concerned",
    message: "I hear you. Let us figure this out together.",
    position: "right",
    size: 100,
  },
  {
    label: "AI — happy",
    description: "AI detected positive progress language",
    mood: "happy",
    message: "That is really good to hear.",
    position: "right",
    size: 100,
  },
  {
    label: "Recovery Hub — open",
    description: "User first lands on the check-in section",
    mood: "idle",
    message: "This is a safe space. Take your time.",
    position: "center",
    size: 120,
  },
  {
    label: "Recovery Hub — check-in done",
    description: "After user submits their check-in",
    mood: "happy",
    message: "Thank you for checking in. That took courage.",
    position: "center",
    size: 120,
  },
  {
    label: "Recovery Hub — post submitted",
    description: "After user posts to the community",
    mood: "happy",
    message: "Your words might be exactly what someone needs today.",
    position: "center",
    size: 120,
  },
  {
    label: "Reminders — all clear",
    description: "No overdue reminders",
    mood: "idle",
    message: "You are all caught up. Well done.",
    position: "right",
    size: 100,
  },
  {
    label: "Reminders — overdue",
    description: "There is a missed reminder",
    mood: "concerned",
    message: "You have a missed reminder. Let us sort it out.",
    position: "right",
    size: 100,
  },
  {
    label: "Reminders — completed",
    description: "User just ticked off a reminder",
    mood: "celebrating",
    message: "You did it. One step at a time.",
    position: "right",
    size: 100,
  },
];

const MOODS      = ["idle", "happy", "concerned", "celebrating"];
const POSITIONS  = ["left", "center", "right"];
const MOOD_COLORS = {
  idle:        "#6b7280",
  happy:       "#16a34a",
  concerned:   "#dc2626",
  celebrating: "#ea580c",
};

// ── Component ─────────────────────────────────────────────────────
export default function MascotTestPage() {
  // Manual controls
  const [mood,     setMood]     = useState("idle");
  const [message,  setMessage]  = useState("Hi Sarah. How are you feeling today?");
  const [position, setPosition] = useState("left");
  const [size,     setSize]     = useState(140);

  // Active scenario index (null = manual)
  const [activeScenario, setActiveScenario] = useState(null);

  // Auto-cycling for the home scenario
  const [autoIndex, setAutoIndex] = useState(0);

  // Load a preset scenario
  function loadScenario(idx) {
    setActiveScenario(idx);
    setAutoIndex(0);
    const s = SCENARIOS[idx];
    setMood(s.mood);
    setMessage(s.auto ? s.messages[0] : s.message ?? "");
    setPosition(s.position);
    setSize(s.size);
  }

  // Auto-cycle messages for the home scenario
  useEffect(() => {
    if (activeScenario === null) return;
    const s = SCENARIOS[activeScenario];
    if (!s.auto) return;

    const interval = setInterval(() => {
      setAutoIndex((prev) => {
        const next = (prev + 1) % s.messages.length;
        setMessage(s.messages[next]);
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [activeScenario]);

  function handleManual() {
    setActiveScenario(null);
  }

  const accentColor = MOOD_COLORS[mood];

  return (
    <div className="mtp-root">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="mtp-header">
        <div className="mtp-header-inner">
          <div className="mtp-logo">SafeMum AI</div>
          <h1 className="mtp-title">Mascot Test Lab</h1>
          <p className="mtp-subtitle">
            Inspect every state, mood, and position before going live
          </p>
        </div>
      </header>

      <main className="mtp-main">

        {/* ── Left panel: controls ───────────────────────────────── */}
        <aside className="mtp-controls">

          {/* Preset scenarios */}
          <section className="mtp-section">
            <h2 className="mtp-section-title">Preset Scenarios</h2>
            <div className="mtp-scenario-list">
              {SCENARIOS.map((s, i) => (
                <button
                  key={i}
                  className={`mtp-scenario-btn ${activeScenario === i ? "active" : ""}`}
                  style={activeScenario === i ? { "--accent": MOOD_COLORS[s.mood] } : {}}
                  onClick={() => loadScenario(i)}
                >
                  <span className="mtp-scenario-label">{s.label}</span>
                  <span className="mtp-scenario-desc">{s.description}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Divider */}
          <div className="mtp-divider">
            <span>or adjust manually</span>
          </div>

          {/* Manual controls */}
          <section className="mtp-section">
            <h2 className="mtp-section-title">Manual Controls</h2>

            {/* Mood */}
            <div className="mtp-field">
              <label className="mtp-label">Mood</label>
              <div className="mtp-pill-group">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    className={`mtp-pill ${mood === m ? "active" : ""}`}
                    style={{ "--pill-color": MOOD_COLORS[m] }}
                    onClick={() => { setMood(m); handleManual(); }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Position */}
            <div className="mtp-field">
              <label className="mtp-label">Position</label>
              <div className="mtp-pill-group">
                {POSITIONS.map((p) => (
                  <button
                    key={p}
                    className={`mtp-pill ${position === p ? "active" : ""}`}
                    style={{ "--pill-color": "#4f7cac" }}
                    onClick={() => { setPosition(p); handleManual(); }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mtp-field">
              <label className="mtp-label">
                Size — <strong>{size}px</strong>
              </label>
              <input
                type="range"
                min={60}
                max={220}
                value={size}
                className="mtp-slider"
                style={{ "--accent": accentColor }}
                onChange={(e) => { setSize(Number(e.target.value)); handleManual(); }}
              />
              <div className="mtp-range-labels">
                <span>60</span><span>220</span>
              </div>
            </div>

            {/* Message */}
            <div className="mtp-field">
              <label className="mtp-label">Message</label>
              <textarea
                className="mtp-textarea"
                rows={3}
                value={message}
                placeholder="Leave empty to hide the bubble"
                onChange={(e) => { setMessage(e.target.value); handleManual(); }}
              />
              <div className="mtp-textarea-actions">
                <button
                  className="mtp-clear-btn"
                  onClick={() => { setMessage(""); handleManual(); }}
                >
                  Clear bubble
                </button>
              </div>
            </div>
          </section>
        </aside>

        {/* ── Right panel: preview ───────────────────────────────── */}
        <div className="mtp-preview-area">

          {/* Status bar */}
          <div className="mtp-status-bar">
            <div className="mtp-status-dot" style={{ background: accentColor }} />
            <span>
              mood: <strong>{mood}</strong> &nbsp;·&nbsp;
              position: <strong>{position}</strong> &nbsp;·&nbsp;
              size: <strong>{size}px</strong>
              {activeScenario !== null && (
                <> &nbsp;·&nbsp; scenario: <strong>{SCENARIOS[activeScenario].label}</strong></>
              )}
            </span>
          </div>

          {/* Preview stage */}
          <div className="mtp-stage">

            {/* Position guide lines */}
            <div className="mtp-guide mtp-guide-left"  aria-hidden="true" />
            <div className="mtp-guide mtp-guide-center" aria-hidden="true" />
            <div className="mtp-guide mtp-guide-right"  aria-hidden="true" />

            {/* The actual mascot */}
            <div
              className={`mtp-mascot-slot mtp-slot-${position}`}
              key={`${mood}-${position}-${size}-${message}`}
            >
              <Mascot
                mood={mood}
                message={message}
                position={position}
                size={size}
              />
            </div>
          </div>

          {/* Props readout */}
          <div className="mtp-props-readout">
            <span className="mtp-props-label">Current props</span>
            <pre className="mtp-props-code">{JSON.stringify(
              { mood, message: message || "(empty — no bubble)", position, size },
              null,
              2
            )}</pre>
          </div>

          {/* Quick message triggers */}
          <div className="mtp-quick-triggers">
            <span className="mtp-quick-label">Quick message triggers</span>
            <div className="mtp-quick-btns">
              {[
                "Hi Sarah. How are you feeling today?",
                "I am listening...",
                "I hear you. Let us figure this out together.",
                "Thank you for checking in. That took courage.",
                "You did it. One step at a time.",
              ].map((msg) => (
                <button
                  key={msg}
                  className="mtp-quick-btn"
                  onClick={() => { setMessage(msg); handleManual(); }}
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}