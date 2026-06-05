// src/Components/Mascot/Mascot.jsx
import { useEffect, useRef, useState } from "react";
import { useRive } from "@rive-app/react-canvas";

// ─── DROP YOUR 4 .RIV FILES HERE ─────────────────────────────────────────
// Export one .riv per emotion from Rive editor, place in assets/mascot/
import rivIdle        from "../../assets/mascot/mascot_idle.riv?url";
import rivHappy       from "../../assets/mascot/mascot_happy.riv?url";
import rivConcerned   from "../../assets/mascot/mascot_concerned.riv?url";
import rivCelebrating from "../../assets/mascot/mascot_celebrating.riv?url";
// ─────────────────────────────────────────────────────────────────────────

const MOOD_RIV = {
  idle:        rivIdle,
  happy:       rivHappy,
  concerned:   rivConcerned,
  celebrating: rivCelebrating,
};

const MOOD_COLORS = {
  idle:        "#6b7280",
  happy:       "#16a34a",
  concerned:   "#dc2626",
  celebrating: "#ea580c",
};

const TYPING_INTERVAL_MS = 28;

// ─── Single Rive renderer — one file at a time ───────────────────────────
function RivPlayer({ src, size }) {
  const { RiveComponent } = useRive({
    src,
    autoplay: true,
  });

  return (
    <RiveComponent
      style={{ width: size, height: size, display: "block" }}
      aria-label="SafeMum mascot"
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────
export default function Mascot({
  mood     = "idle",
  message  = "",
  position = "left",
  size     = 140,
}) {
  // ── Mood swap with crossfade ──────────────────────────────────────
  const [activeMood, setActiveMood] = useState(mood);
  const [visible,    setVisible]    = useState(true);
  const prevMoodRef = useRef(mood);

  useEffect(() => {
    if (mood === prevMoodRef.current) return;
    setVisible(false);
    const t = setTimeout(() => {
      setActiveMood(mood);
      setVisible(true);
      prevMoodRef.current = mood;
    }, 200);
    return () => clearTimeout(t);
  }, [mood]);

  // ── Typewriter ────────────────────────────────────────────────────
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping,      setIsTyping]      = useState(false);

  useEffect(() => {
    if (!message) { setDisplayedText(""); setIsTyping(false); return; }
    setDisplayedText("");
    setIsTyping(true);
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setDisplayedText(message.slice(0, index));
      if (index >= message.length) { clearInterval(interval); setIsTyping(false); }
    }, TYPING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [message]);

  // ── Mood pulse ────────────────────────────────────────────────────
  const wrapperRef = useRef(null);
  useEffect(() => {
    if (!wrapperRef.current || mood === "idle") return;
    const el = wrapperRef.current;
    el.classList.add("mascot-pulsing");
    const t = setTimeout(() => el.classList.remove("mascot-pulsing"), 600);
    return () => clearTimeout(t);
  }, [mood]);

  // ── Render ────────────────────────────────────────────────────────
  const accentColor = MOOD_COLORS[mood] ?? MOOD_COLORS.idle;
  const showBubble  = Boolean(message);
  const rivSrc      = MOOD_RIV[activeMood] ?? MOOD_RIV.idle;

  const rootStyle = {
    display:       "flex",
    alignItems:    "flex-end",
    flexDirection: position === "right" ? "row-reverse" : "row",
    gap:           "8px",
  };

  const wrapperStyle = {
    flexShrink:  0,
    width:       size,
    height:      size,
    opacity:     visible ? 1 : 0,
    transition:  "opacity 0.2s ease",
  };

  const bubbleStyle = {
    maxWidth:     "240px",
    background:   "#fff",
    border:       `1.5px solid ${accentColor}`,
    borderRadius: position === "right"
      ? "14px 14px 4px 14px"
      : "14px 14px 14px 4px",
    padding:      "10px 14px",
    fontSize:     "13px",
    lineHeight:   1.55,
    color:        "#222",
    fontFamily:   "'Manrope', sans-serif",
    fontWeight:   400,
    boxShadow:    "0 2px 12px rgba(0,0,0,0.06)",
    marginBottom: "8px",
  };

  return (
    <div style={rootStyle}>

      {/* Mascot — fades between .riv files on mood change */}
      <div
        ref={wrapperRef}
        style={wrapperStyle}
        className="mascot-canvas-wrapper"
      >
        <RivPlayer src={rivSrc} size={size} />
      </div>

      {/* Speech bubble */}
      {showBubble && (
        <div style={bubbleStyle} key={message}>
          {displayedText}
          {isTyping && (
            <span
              className="mascot-cursor"
              aria-hidden="true"
              style={{ opacity: 0.4, marginLeft: "1px" }}
            >|</span>
          )}
        </div>
      )}

    </div>
  );
}