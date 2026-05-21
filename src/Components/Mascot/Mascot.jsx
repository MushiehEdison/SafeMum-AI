// src/Components/Mascot/Mascot.jsx
import { useEffect, useRef, useState } from "react";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import mascotRiv from "../../assets/mascot/mascot.riv?url";
import "./Mascot.css";

/* ─── mood → accent colour ───────────────────────────────────────── */
const MOOD_COLORS = {
  idle:        "#6b7280",
  happy:       "#16a34a",
  concerned:   "#dc2626",
  celebrating: "#ea580c",
};

/*
 * tevredenheid scale:  0-2 angry · 3 annoyed · 4 neutral · 5-6 happy · 7 laughing
 * We pick the most expressive value for each SafeMum mood.
 */
const MOOD_TO_VALUE = {
  idle:        4,   // neutral
  concerned:   2,   // troubled / worried
  happy:       6,   // warm positive
  celebrating: 7,   // full joy
};

const STATE_MACHINE_NAME = "State Machine 1";
const INPUT_NAME         = "tevredenheid";
const TYPING_INTERVAL_MS = 28;

export default function Mascot({
  mood     = "idle",
  message  = "",
  position = "left",
  size     = 140,
}) {
  /* ── Rive + state machine ────────────────────────────────────────── */
  const { RiveComponent, rive } = useRive({
    src:           mascotRiv,
    autoplay:      true,
    stateMachines: STATE_MACHINE_NAME,
  });

  const tevredenheid = useStateMachineInput(
    rive,
    STATE_MACHINE_NAME,
    INPUT_NAME
  );

  /* ── Drive the emotion number whenever mood changes ─────────────── */
  useEffect(() => {
    if (!tevredenheid) return;
    const value = MOOD_TO_VALUE[mood] ?? MOOD_TO_VALUE.idle;
    tevredenheid.value = value;
  }, [mood, tevredenheid]);

  /* ── Typewriter ──────────────────────────────────────────────────── */
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

  /* ── Mood pulse ──────────────────────────────────────────────────── */
  const wrapperRef  = useRef(null);
  const prevMoodRef = useRef(mood);
  useEffect(() => {
    if (mood !== "idle" && mood !== prevMoodRef.current && wrapperRef.current) {
      const el = wrapperRef.current;
      el.classList.add("mascot-pulsing");
      const timer = setTimeout(() => el.classList.remove("mascot-pulsing"), 600);
      prevMoodRef.current = mood;
      return () => clearTimeout(timer);
    }
    prevMoodRef.current = mood;
  }, [mood]);

  /* ── Render ──────────────────────────────────────────────────────── */
  const accentColor = MOOD_COLORS[mood] ?? MOOD_COLORS.idle;
  const showBubble  = Boolean(message);
  const bubbleStyle = {
    borderColor:             accentColor,
    "--bubble-border-color": accentColor,
  };

  return (
    <div className={`mascot-root position-${position}`}>

      {showBubble && (
        <div className="mascot-bubble" style={bubbleStyle} key={message}>
          {displayedText}
          {isTyping && <span className="mascot-cursor" aria-hidden="true" />}
        </div>
      )}

      <div
        ref={wrapperRef}
        className="mascot-canvas-wrapper"
        style={{ width: size, height: size }}
      >
        <RiveComponent
          className="mascot-canvas"
          style={{ width: size, height: size }}
          aria-label="SafeMum mascot"
        />
      </div>

    </div>
  );
}