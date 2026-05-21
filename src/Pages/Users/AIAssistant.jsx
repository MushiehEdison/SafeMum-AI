import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot, Mic, MicOff, Send, X, Plus,
  AlertTriangle, MessageSquare,
  Stethoscope, Heart, Leaf, ShieldAlert,
  CheckCircle2, Circle, ChevronRight,
  Activity, PenLine, PhoneOff, Volume2,
  VolumeX, Home, Bell, Map, Settings,
  ArrowLeft, User2, Sparkles,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const TOPIC_OPTIONS = [
  { id: "physical",  label: "Physical recovery", Icon: Stethoscope, accent: "#2563eb" },
  { id: "emotional", label: "Emotional support",  Icon: Heart,       accent: "#9333ea" },
  { id: "danger",    label: "Danger signs",        Icon: ShieldAlert, accent: "#dc2626" },
  { id: "nutrition", label: "Nutrition & rest",    Icon: Leaf,        accent: "#15803d" },
];

const SYMPTOM_OPTIONS = [
  { id: "bleeding_heavy", label: "Heavy bleeding",    severity: "danger", Icon: AlertTriangle },
  { id: "bleeding_light", label: "Light spotting",    severity: "mild",   Icon: Circle        },
  { id: "pain_severe",    label: "Severe cramping",   severity: "danger", Icon: AlertTriangle },
  { id: "pain_mild",      label: "Mild discomfort",   severity: "mild",   Icon: Circle        },
  { id: "fever",          label: "Fever / chills",    severity: "danger", Icon: AlertTriangle },
  { id: "dizziness",      label: "Dizziness / faint", severity: "danger", Icon: AlertTriangle },
  { id: "none",           label: "No symptoms",       severity: "ok",     Icon: CheckCircle2  },
];

const MOOD_OPTIONS = [
  { id: "overwhelmed", label: "Overwhelmed"  },
  { id: "numb",        label: "Numb / empty" },
  { id: "sad",         label: "Sad"          },
  { id: "anxious",     label: "Anxious"      },
  { id: "ok",          label: "Managing okay"},
  { id: "good",        label: "Feeling good" },
];

const MOCK_CONVOS = [
  { id: "c1", title: "Recovery check-in",          preview: "Light spotting is normal in week 2…", time: "Today"     },
  { id: "c2", title: "Emotional wellbeing",         preview: "Grief after a loss has no timeline…", time: "Yesterday" },
  { id: "c3", title: "Nutrition questions",         preview: "Iron-rich foods help rebuild blood…",  time: "May 16"    },
  { id: "c4", title: "Danger signs & when to act", preview: "Soak a pad every hour — go now…",      time: "May 14"    },
];

const NAV_LINKS = [
  { label: "Home",      Icon: Home,   path: "/home"      },
  { label: "Reminders", Icon: Bell,   path: "/reminders" },
  { label: "Map",       Icon: Map,    path: "/map"        },
  { label: "Profile",   Icon: User2,  path: "/profile"   },
];

function getAIResponse(userMessage, qrId) {
  const msg = (userMessage || "").toLowerCase();
  const id  = qrId || "";
  if (id === "physical" || msg.includes("physical") || msg.includes("recovery"))
    return { text: "Let's check how you're recovering physically. Are you currently experiencing any of these?", quickReplies: SYMPTOM_OPTIONS, quickReplyType: "symptoms", urgent: false, mascotMood: "curious", mascotSay: "Tell me what you're feeling — I'm listening carefully." };
  if (id === "emotional" || msg.includes("feel") || msg.includes("sad") || msg.includes("emotion"))
    return { text: "How you feel emotionally is just as important as your physical recovery.\n\nHow would you describe where you are right now?", quickReplies: MOOD_OPTIONS, quickReplyType: "mood", urgent: false, mascotMood: "warm", mascotSay: "Your feelings are completely valid. Take your time." };
  if (id === "danger" || msg.includes("danger") || msg.includes("warning"))
    return { text: "These are the danger signs that need immediate attention:\n\n**Soaking a pad every hour** for 2+ hours\n**Fever above 38°C** with chills or foul discharge\n**Severe lower belly pain** that does not ease\n**Dizziness or fainting**\n\nIf you notice any of these — go to a facility immediately.", quickReplies: [{ id: "alert", label: "Open Emergency Alert", Icon: ShieldAlert, accent: "#dc2626" }, { id: "map", label: "Find nearest facility", Icon: Stethoscope, accent: "#15803d" }], quickReplyType: "actions", urgent: false, mascotMood: "alert", mascotSay: "Please keep these in mind. Your safety matters most." };
  if (["bleeding_heavy","fever","dizziness","pain_severe"].includes(id))
    return { text: "I'm concerned about what you've described. These symptoms can be serious.\n\nPlease don't wait — you need to be seen by a healthcare provider today.", quickReplies: [{ id: "alert", label: "Send Emergency Alert", Icon: ShieldAlert, accent: "#dc2626" }, { id: "map", label: "Find nearest facility", Icon: Stethoscope, accent: "#15803d" }], quickReplyType: "actions", urgent: true, mascotMood: "urgent", mascotSay: "Please don't wait. Go now — I'll be here when you're safe." };
  if (["bleeding_light","pain_mild"].includes(id))
    return { text: "Some light spotting and mild discomfort are normal in the first 2 weeks. Your body is healing.\n\nAre you attending your follow-up appointment on May 19th?", quickReplies: [{ id: "yes_appt", label: "Yes, I am", Icon: CheckCircle2, accent: "#15803d" }, { id: "no_appt", label: "I'm not sure", Icon: Circle, accent: "#ca8a04" }], quickReplyType: "actions", urgent: false, mascotMood: "reassuring", mascotSay: "That sounds manageable. You're doing well, Amina." };
  if (id === "none")
    return { text: "That's encouraging. Rest, hydration, and your follow-up on May 19th still matter.\n\nAnything specific on your mind?", quickReplies: TOPIC_OPTIONS, quickReplyType: "topics", urgent: false, mascotMood: "happy", mascotSay: "No symptoms — that's good news! Keep taking care of yourself." };
  if (["overwhelmed","numb","sad","anxious"].includes(id))
    return { text: "What you're feeling is completely valid. Grief after a pregnancy loss is real — it doesn't have a timeline.\n\nYou don't have to carry this alone.", quickReplies: [{ id: "hub", label: "Recovery Hub", Icon: Heart, accent: "#9333ea" }, { id: "talk", label: "Keep talking", Icon: MessageSquare, accent: "#2563eb" }], quickReplyType: "actions", urgent: false, mascotMood: "empathetic", mascotSay: "I'm right here with you. You are not alone in this." };
  if (["ok","good"].includes(id))
    return { text: "I'm glad you're managing. That takes real strength.\n\nIs there anything I can help with today?", quickReplies: TOPIC_OPTIONS, quickReplyType: "topics", urgent: false, mascotMood: "celebrating", mascotSay: "That's wonderful. You're stronger than you know, Amina." };
  if (id === "nutrition" || msg.includes("eat") || msg.includes("food"))
    return { text: "Good nutrition after a pregnancy loss helps your body rebuild faster.\n\n**Iron** — lentils, spinach, beans, red meat\n**Folate** — leafy greens, eggs, avocado\n**Hydration** — at least 8 glasses of water daily", quickReplies: TOPIC_OPTIONS, quickReplyType: "topics", urgent: false, mascotMood: "informing", mascotSay: "Small, nourishing choices add up to real healing." };
  return { text: "I hear you. Can you tell me a bit more about what you're experiencing right now?", quickReplies: TOPIC_OPTIONS, quickReplyType: "topics", urgent: false, mascotMood: "curious", mascotSay: "I'm here — tell me more." };
}

const INITIAL_MESSAGES = [{
  id: "intro", role: "assistant", urgent: false,
  text: "Hello Amina, I'm here with you.\n\nI'm your SafeMum health assistant — here to support your recovery, answer your questions, and make sure you're safe.\n\nWhat would you like to talk about today?",
  quickReplies: TOPIC_OPTIONS, quickReplyType: "topics",
  mascotMood: "warm", mascotSay: "I've been thinking about you. Let's check in.",
}];

/* ─────────────────────────────────────────────────────────────
   MASCOT COMPONENT — SVG-based, fully animated
   mood: idle | warm | curious | empathetic | urgent | alert |
         reassuring | happy | celebrating | informing | typing | listening
───────────────────────────────────────────────────────────── */
function MascotFace({ mood = "idle", size = 72 }) {
  const moodColors = {
    idle:        { body: "#2a2927", face: "#1a1917", glow: "rgba(255,255,255,0.04)" },
    warm:        { body: "#9333ea", face: "#7c3aed", glow: "rgba(147,51,234,0.3)"  },
    curious:     { body: "#2563eb", face: "#1d4ed8", glow: "rgba(37,99,235,0.25)"  },
    empathetic:  { body: "#7c3aed", face: "#6d28d9", glow: "rgba(124,58,237,0.3)"  },
    urgent:      { body: "#dc2626", face: "#b91c1c", glow: "rgba(220,38,38,0.35)"  },
    alert:       { body: "#d97706", face: "#b45309", glow: "rgba(217,119,6,0.3)"   },
    reassuring:  { body: "#15803d", face: "#166534", glow: "rgba(21,128,61,0.25)"  },
    happy:       { body: "#16a34a", face: "#15803d", glow: "rgba(22,163,74,0.25)"  },
    celebrating: { body: "#7c3aed", face: "#6d28d9", glow: "rgba(124,58,237,0.35)" },
    informing:   { body: "#0369a1", face: "#075985", glow: "rgba(3,105,161,0.25)"  },
    typing:      { body: "#374151", face: "#1f2937", glow: "rgba(255,255,255,0.06)"},
    listening:   { body: "#1d4ed8", face: "#1e40af", glow: "rgba(29,78,216,0.3)"  },
  };

  const c = moodColors[mood] || moodColors.idle;
  const r = size / 2;

  /* Eye shapes by mood */
  const eyeConfig = {
    idle:        { ly: 0.38, ry: 0.38, lh: 0.09, rh: 0.09, shape: "oval" },
    warm:        { ly: 0.40, ry: 0.40, lh: 0.07, rh: 0.07, shape: "happy" },
    curious:     { ly: 0.36, ry: 0.38, lh: 0.10, rh: 0.08, shape: "asymmetric" },
    empathetic:  { ly: 0.41, ry: 0.41, lh: 0.07, rh: 0.07, shape: "soft" },
    urgent:      { ly: 0.35, ry: 0.35, lh: 0.11, rh: 0.11, shape: "wide" },
    alert:       { ly: 0.35, ry: 0.35, lh: 0.12, rh: 0.12, shape: "wide" },
    reassuring:  { ly: 0.40, ry: 0.40, lh: 0.08, rh: 0.08, shape: "happy" },
    happy:       { ly: 0.42, ry: 0.42, lh: 0.06, rh: 0.06, shape: "happy" },
    celebrating: { ly: 0.41, ry: 0.41, lh: 0.07, rh: 0.07, shape: "happy" },
    informing:   { ly: 0.37, ry: 0.37, lh: 0.10, rh: 0.10, shape: "oval" },
    typing:      { ly: 0.40, ry: 0.40, lh: 0.05, rh: 0.05, shape: "half" },
    listening:   { ly: 0.37, ry: 0.37, lh: 0.11, rh: 0.11, shape: "wide" },
  };

  const ec = eyeConfig[mood] || eyeConfig.idle;
  const lx = size * 0.36, rx = size * 0.64;
  const ley = size * ec.ly, rey = size * ec.ry;
  const leh = size * ec.lh, reh = size * ec.rh;
  const ew  = size * 0.12;

  const mouthConfig = {
    idle:        "M 0.3 0.65 Q 0.5 0.68 0.7 0.65",
    warm:        "M 0.28 0.63 Q 0.5 0.72 0.72 0.63",
    curious:     "M 0.3 0.65 Q 0.5 0.70 0.65 0.62",
    empathetic:  "M 0.3 0.66 Q 0.5 0.72 0.7 0.66",
    urgent:      "M 0.3 0.66 Q 0.5 0.62 0.7 0.66",
    alert:       "M 0.3 0.67 Q 0.5 0.64 0.7 0.67",
    reassuring:  "M 0.28 0.64 Q 0.5 0.72 0.72 0.64",
    happy:       "M 0.27 0.62 Q 0.5 0.74 0.73 0.62",
    celebrating: "M 0.25 0.61 Q 0.5 0.76 0.75 0.61",
    informing:   "M 0.3 0.64 Q 0.5 0.68 0.7 0.64",
    typing:      "M 0.35 0.65 Q 0.5 0.67 0.65 0.65",
    listening:   "M 0.3 0.65 Q 0.5 0.70 0.7 0.65",
  };
  const mouthPath = (moodConfig) => {
    const m = moodConfig || mouthConfig.idle;
    return m.replace(/(\d+\.\d+)/g, v => parseFloat(v) * size);
  };

  const animId = `glow-${mood}-${size}`;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible", flexShrink: 0 }}>
      <defs>
        <radialGradient id={animId} cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor={c.face} />
          <stop offset="100%" stopColor={c.body} />
        </radialGradient>
      </defs>

      {/* Glow ring */}
      <circle cx={r} cy={r} r={r - 1} fill="none" stroke={c.glow} strokeWidth={size * 0.06} />

      {/* Body */}
      <circle cx={r} cy={r} r={r - 2} fill={`url(#${animId})`} />

      {/* Left eye */}
      {ec.shape === "happy" || ec.shape === "soft" ? (
        <path d={`M ${lx - ew/2} ${ley} Q ${lx} ${ley - leh * 1.6} ${lx + ew/2} ${ley}`} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={size * 0.035} strokeLinecap="round" />
      ) : ec.shape === "half" ? (
        <path d={`M ${lx - ew/2} ${ley + leh/2} Q ${lx} ${ley - leh/2} ${lx + ew/2} ${ley + leh/2}`} fill="rgba(255,255,255,0.85)" />
      ) : (
        <ellipse cx={lx} cy={ley} rx={ew / 2} ry={leh} fill="rgba(255,255,255,0.9)" />
      )}

      {/* Right eye */}
      {ec.shape === "happy" || ec.shape === "soft" ? (
        <path d={`M ${rx - ew/2} ${rey} Q ${rx} ${rey - reh * 1.6} ${rx + ew/2} ${rey}`} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={size * 0.035} strokeLinecap="round" />
      ) : ec.shape === "asymmetric" ? (
        <ellipse cx={rx} cy={rey} rx={ew / 2} ry={reh * 0.8} fill="rgba(255,255,255,0.9)" />
      ) : ec.shape === "half" ? (
        <path d={`M ${rx - ew/2} ${rey + reh/2} Q ${rx} ${rey - reh/2} ${rx + ew/2} ${rey + reh/2}`} fill="rgba(255,255,255,0.85)" />
      ) : (
        <ellipse cx={rx} cy={rey} rx={ew / 2} ry={reh} fill="rgba(255,255,255,0.9)" />
      )}

      {/* Mouth */}
      <path
        d={mouthPath(mouthConfig[mood])}
        fill="none"
        stroke="rgba(255,255,255,0.75)"
        strokeWidth={size * 0.032}
        strokeLinecap="round"
      />

      {/* Celebrating sparkles */}
      {mood === "celebrating" && (<>
        <circle cx={size * 0.15} cy={size * 0.2} r={size * 0.03} fill="rgba(255,220,80,0.8)" />
        <circle cx={size * 0.85} cy={size * 0.18} r={size * 0.025} fill="rgba(255,220,80,0.7)" />
        <circle cx={size * 0.82} cy={size * 0.82} r={size * 0.02} fill="rgba(255,200,60,0.6)" />
      </>)}

      {/* Urgent pulse lines */}
      {mood === "urgent" && (<>
        <line x1={size * 0.08} y1={size * 0.45} x2={size * 0.02} y2={size * 0.45} stroke="rgba(255,100,100,0.5)" strokeWidth={1.5} strokeLinecap="round" />
        <line x1={size * 0.92} y1={size * 0.45} x2={size * 0.98} y2={size * 0.45} stroke="rgba(255,100,100,0.5)" strokeWidth={1.5} strokeLinecap="round" />
      </>)}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   TYPED TEXT — character-by-character reveal
───────────────────────────────────────────────────────────── */
function TypedText({ text, onDone }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    if (!text) return;
    let i = 0;
    const t = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(t); if (onDone) onDone(); }
    }, 20);
    return () => clearInterval(t);
  }, [text]);
  return <span>{displayed}<span style={{ opacity: displayed.length < (text||"").length ? 0.4 : 0, transition: "opacity 0.15s" }}>|</span></span>;
}

/* ─────────────────────────────────────────────────────────────
   MASCOT PANEL — the living, reactive companion strip
   Sits in the chat column as a fixed-position floating panel
───────────────────────────────────────────────────────────── */
const MOOD_LABELS = {
  idle:        "Here with you",
  warm:        "Thinking of you",
  curious:     "I'm listening",
  empathetic:  "I understand",
  urgent:      "Please act now",
  alert:       "Important",
  reassuring:  "You're okay",
  happy:       "Good news",
  celebrating: "Well done!",
  informing:   "Here's what I know",
  typing:      "Thinking…",
  listening:   "Go on…",
};

const MOOD_ANIMATIONS = {
  idle:        "msc-idle",
  warm:        "msc-pulse",
  curious:     "msc-tilt",
  empathetic:  "msc-breathe",
  urgent:      "msc-shake",
  alert:       "msc-bounce",
  reassuring:  "msc-sway",
  happy:       "msc-bounce",
  celebrating: "msc-spin-once",
  informing:   "msc-nod",
  typing:      "msc-idle",
  listening:   "msc-lean",
};

function MascotPanel({ mood, message, isTyping, messageCount, lastMessageRole, inputLength }) {
  const [displayedMood, setDisplayedMood] = useState(mood);
  const [displayedMsg,  setDisplayedMsg]  = useState(message);
  const [visible,       setVisible]       = useState(true);
  const [blinking,      setBlinking]      = useState(false);
  const [particleKey,   setParticleKey]   = useState(0);
  const prevMoodRef = useRef(mood);

  /* Mood transition with brief dim */
  useEffect(() => {
    if (mood === prevMoodRef.current) return;
    prevMoodRef.current = mood;
    setVisible(false);
    const t = setTimeout(() => {
      setDisplayedMood(mood);
      setDisplayedMsg(message);
      setVisible(true);
      if (mood === "celebrating") setParticleKey(k => k + 1);
    }, 250);
    return () => clearTimeout(t);
  }, [mood, message]);

  /* Random blink every 3–6s */
  useEffect(() => {
    const blink = () => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
      const next = 3000 + Math.random() * 3000;
      blinkTimer = setTimeout(blink, next);
    };
    let blinkTimer = setTimeout(blink, 2500);
    return () => clearTimeout(blinkTimer);
  }, []);

  const animClass = MOOD_ANIMATIONS[displayedMood] || "msc-idle";
  const moodLabel = MOOD_LABELS[displayedMood] || "Here with you";

  /* Color for the mood label pill */
  const pillColors = {
    idle: { bg: "#1a1917", text: "#666" }, warm: { bg: "#faf5ff", text: "#7c3aed" },
    curious: { bg: "#eff6ff", text: "#2563eb" }, empathetic: { bg: "#faf5ff", text: "#7c3aed" },
    urgent: { bg: "#fef2f2", text: "#dc2626" }, alert: { bg: "#fffbeb", text: "#d97706" },
    reassuring: { bg: "#f0fdf4", text: "#15803d" }, happy: { bg: "#f0fdf4", text: "#16a34a" },
    celebrating: { bg: "#faf5ff", text: "#7c3aed" }, informing: { bg: "#eff6ff", text: "#0369a1" },
    typing: { bg: "#1a1917", text: "#555" }, listening: { bg: "#eff6ff", text: "#2563eb" },
  };
  const pill = pillColors[displayedMood] || pillColors.idle;

  return (
    <>
      <style>{`
        @keyframes msc-idle    { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-2px) scale(1.01)} }
        @keyframes msc-pulse   { 0%,100%{transform:scale(1)} 30%{transform:scale(1.06)} 60%{transform:scale(0.97)} }
        @keyframes msc-tilt    { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-6deg)} 75%{transform:rotate(5deg)} }
        @keyframes msc-breathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
        @keyframes msc-shake   { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-4px)} 40%{transform:translateX(4px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
        @keyframes msc-bounce  { 0%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} 70%{transform:translateY(-3px)} }
        @keyframes msc-sway    { 0%,100%{transform:rotate(0deg)} 33%{transform:rotate(-4deg)} 66%{transform:rotate(3deg)} }
        @keyframes msc-spin-once { 0%{transform:rotate(0deg) scale(1)} 50%{transform:rotate(180deg) scale(1.1)} 100%{transform:rotate(360deg) scale(1)} }
        @keyframes msc-nod     { 0%,100%{transform:translateY(0)} 25%{transform:translateY(-4px)} 75%{transform:translateY(2px)} }
        @keyframes msc-lean    { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-8deg)} }
        @keyframes msc-in      { from{opacity:0;transform:translateY(8px) scale(0.92)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes msc-bubble  { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
        @keyframes msc-particle { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(var(--dx),var(--dy)) scale(0);opacity:0} }
        @keyframes msc-blink   { 0%,100%{scaleY:1} 50%{scaleY:0.1} }
        @keyframes typing-dot  { 0%,60%,100%{transform:translateY(0);opacity:.35} 30%{transform:translateY(-4px);opacity:1} }
      `}</style>

      <div style={{
        position: "absolute",
        bottom: 90,
        right: 16,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 8,
        zIndex: 40,
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.25s ease",
        animation: "msc-in 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
      }}>
        {/* Celebration particles */}
        {displayedMood === "celebrating" && (
          <div key={particleKey} style={{ position: "absolute", width: 80, height: 80, top: 0, right: 0, pointerEvents: "none" }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{
                position: "absolute",
                width: 5, height: 5,
                borderRadius: "50%",
                background: ["#f59e0b","#8b5cf6","#34d399","#f472b6","#60a5fa","#fbbf24","#a78bfa","#6ee7b7"][i],
                top: "50%", left: "50%",
                "--dx": `${(Math.random() - 0.5) * 60}px`,
                "--dy": `${-(Math.random() * 50 + 20)}px`,
                animation: `msc-particle 0.8s ease-out ${i * 0.07}s both`,
              }} />
            ))}
          </div>
        )}

        {/* Speech bubble */}
        {displayedMsg && (
          <div style={{
            maxWidth: 200,
            background: "#fff",
            border: displayedMood === "urgent" ? "1.5px solid #fca5a5" : "1px solid #e8e6e1",
            borderRadius: "14px 14px 4px 14px",
            padding: "10px 14px",
            fontSize: 12.5,
            lineHeight: 1.55,
            color: displayedMood === "urgent" ? "#7f1d1d" : "#222",
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 400,
            boxShadow: displayedMood === "urgent"
              ? "0 4px 20px rgba(220,38,38,0.15)"
              : "0 4px 20px rgba(0,0,0,0.08)",
            animation: "msc-bubble 0.35s cubic-bezier(0.34,1.56,0.64,1) both",
            pointerEvents: "auto",
          }}>
            {isTyping
              ? <span style={{ display: "flex", gap: 4, alignItems: "center", height: 18 }}>
                  {[0,1,2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#bbb", display: "inline-block", animation: `typing-dot 1.2s ${i * 0.15}s infinite` }} />)}
                </span>
              : <TypedText key={displayedMsg} text={displayedMsg} />
            }
          </div>
        )}

        {/* Mood label + face */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
            fontFamily: "'Manrope', sans-serif",
            padding: "3px 9px", borderRadius: 20,
            background: pill.bg, color: pill.text,
            border: `1px solid ${pill.text}22`,
            transition: "all 0.4s ease",
          }}>
            {isTyping ? "Thinking…" : moodLabel}
          </span>

          <div style={{
            animation: `${animClass} ${
              displayedMood === "urgent" ? "0.4s" :
              displayedMood === "celebrating" ? "0.7s" :
              displayedMood === "tilt" ? "1.2s" : "3s"
            } ease-in-out ${
              displayedMood === "celebrating" ? "1" : "infinite"
            }`,
            filter: blinking ? "brightness(0.7)" : "none",
            transition: "filter 0.05s",
            cursor: "pointer",
            pointerEvents: "auto",
          }}>
            <MascotFace mood={isTyping ? "typing" : displayedMood} size={64} />
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   MASCOT GREETING — appears at top of chat, fades after first message
───────────────────────────────────────────────────────────── */
function MascotGreeting({ visible, mood }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "14px 20px",
      background: "rgba(255,255,255,0.6)",
      backdropFilter: "blur(8px)",
      borderBottom: "1px solid #eceae6",
      opacity: visible ? 1 : 0,
      maxHeight: visible ? 80 : 0,
      overflow: "hidden",
      transition: "opacity 0.4s ease, max-height 0.4s ease",
    }}>
      <div style={{ animation: "msc-breathe 3s ease-in-out infinite" }}>
        <MascotFace mood={mood} size={44} />
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#111", fontFamily: "'Manrope', sans-serif", margin: 0 }}>SafeMum Assistant</p>
        <p style={{ fontSize: 11, color: "#9ca3af", fontFamily: "'Manrope', sans-serif", fontWeight: 300, margin: 0 }}>Always here · Week 2 Recovery</p>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 0 3px rgba(74,222,128,0.25)", animation: "pulse 2s infinite" }} />
        <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "'Manrope', sans-serif" }}>Online</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   VOICE MODE
───────────────────────────────────────────────────────────── */
function VoiceMode({ onClose }) {
  const [phase,      setPhase]      = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [aiText,     setAiText]     = useState("Tap the mic to speak");
  const [isMuted,    setIsMuted]    = useState(false);
  const [seconds,    setSeconds]    = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const handleMicPress = () => {
    if (phase === "listening") {
      setPhase("speaking");
      setAiText("Thank you for sharing that. Light spotting in week 2 is usually normal. How long has it been going on?");
      setTimeout(() => setPhase("idle"), 3500);
    } else {
      setPhase("listening"); setTranscript("");
      const words = ["I've been having","some light spotting","since yesterday morning"];
      let i = 0;
      const t = setInterval(() => { if (i < words.length) { setTranscript(p => p+(p?" ":"")+words[i]); i++; } else clearInterval(t); }, 700);
    }
  };

  const isActive   = phase === "listening";
  const isSpeaking = phase === "speaking";

  return (
    <div style={{ position:"fixed",inset:0,zIndex:500,background:"#0c0b0a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",padding:"max(env(safe-area-inset-top,44px),48px) 24px max(env(safe-area-inset-bottom,24px),32px)",animation:"vc-in .3s ease" }}>
      <style>{`
        @keyframes vc-in{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes orb-idle{0%,100%{transform:scale(1);opacity:.55}50%{transform:scale(1.06);opacity:.75}}
        @keyframes orb-listen{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.14);opacity:1}}
        @keyframes orb-speak{0%,100%{transform:scale(1);opacity:.6}25%{transform:scale(1.1);opacity:.9}75%{transform:scale(.96);opacity:.7}}
        @keyframes ring-out{0%{transform:scale(1);opacity:.5}100%{transform:scale(1.9);opacity:0}}
        @keyframes wave-bar{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}
        @keyframes txt-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 3px rgba(74,222,128,.25)}50%{box-shadow:0 0 0 5px rgba(74,222,128,.1)}}
      `}</style>

      <div style={{ width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <div style={{ width:7,height:7,borderRadius:"50%",background:"#4ade80",boxShadow:"0 0 0 3px rgba(74,222,128,.2)" }} />
          <span style={{ fontSize:13,color:"#444",fontFamily:"'Manrope',sans-serif",fontWeight:500 }}>Voice · {fmt(seconds)}</span>
        </div>
        <button onClick={onClose} style={{ width:36,height:36,borderRadius:10,background:"#1a1917",border:"1px solid #2a2a27",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
          <X size={15} color="#555" />
        </button>
      </div>

      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:0,flex:1,justifyContent:"center" }}>
        <div style={{ position:"relative",width:160,height:160,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:36 }}>
          {isActive && (<>
            <div style={{ position:"absolute",inset:-16,borderRadius:"50%",border:"1.5px solid rgba(99,102,241,.35)",animation:"ring-out 1.8s linear infinite" }} />
            <div style={{ position:"absolute",inset:-16,borderRadius:"50%",border:"1.5px solid rgba(99,102,241,.2)",animation:"ring-out 1.8s linear .6s infinite" }} />
          </>)}
          <div style={{ width:140,height:140,borderRadius:"50%",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:isActive?"0 0 60px rgba(99,102,241,.25)":isSpeaking?"0 0 60px rgba(167,139,250,.2)":"0 8px 32px rgba(0,0,0,.4)",animation:isActive?"orb-listen 1.2s ease-in-out infinite":isSpeaking?"orb-speak 1s ease-in-out infinite":"orb-idle 3s ease-in-out infinite",border:"1px solid #1e1d1b" }}>
            <MascotFace mood={isActive ? "listening" : isSpeaking ? "informing" : "idle"} size={140} />
          </div>
        </div>
        <p key={phase} style={{ fontFamily:"'Fraunces',serif",fontStyle:"italic",fontSize:"clamp(16px,4vw,22px)",fontWeight:300,color:isMuted?"#333":"#777",textAlign:"center",maxWidth:300,lineHeight:1.5,animation:"txt-in .4s ease",marginBottom:12 }}>
          {isMuted?"Microphone muted":isActive?"Listening…":isSpeaking?aiText:"Tap the mic to speak"}
        </p>
        {isActive && transcript && (
          <div style={{ background:"#1a1917",border:"1px solid #252320",borderRadius:14,padding:"10px 16px",maxWidth:320,textAlign:"center",animation:"txt-in .2s ease" }}>
            <p style={{ fontSize:13,color:"#888",fontFamily:"'Manrope',sans-serif",fontWeight:300,lineHeight:1.5,margin:0 }}>{transcript}</p>
          </div>
        )}
      </div>

      <div style={{ display:"flex",alignItems:"center",gap:20,justifyContent:"center",width:"100%" }}>
        <button onClick={() => setIsMuted(m=>!m)} style={{ width:54,height:54,borderRadius:"50%",background:isMuted?"#dc2626":"#1a1917",border:`1px solid ${isMuted?"#dc2626":"#2a2927"}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s" }}>
          {isMuted?<VolumeX size={20} color="#fff" strokeWidth={1.5}/>:<Volume2 size={20} color="#555" strokeWidth={1.5}/>}
        </button>
        <button onClick={handleMicPress} style={{ width:80,height:80,borderRadius:"50%",background:isActive?"#dc2626":"#fff",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:isActive?"0 0 0 8px rgba(220,38,38,.15),0 8px 32px rgba(220,38,38,.3)":"0 8px 32px rgba(255,255,255,.15)",transition:"all .2s" }}>
          {isActive?<MicOff size={30} color="#fff" strokeWidth={1.5}/>:<Mic size={30} color="#111" strokeWidth={1.5}/>}
        </button>
        <button onClick={onClose} style={{ width:54,height:54,borderRadius:"50%",background:"#1a1917",border:"1px solid #2a2927",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"background .2s" }}
          onMouseEnter={e=>e.currentTarget.style.background="#dc2626"} onMouseLeave={e=>e.currentTarget.style.background="#1a1917"}>
          <PhoneOff size={20} color="#555" strokeWidth={1.5}/>
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────────────────────── */
function Sidebar({ open, onClose, onNew, activeId, onSelect, navigate }) {
  return (
    <>
      <style>{`
        @keyframes sb-fade{from{opacity:0}to{opacity:1}}
        .sb-backdrop{display:none;position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.35);backdrop-filter:blur(3px);animation:sb-fade .2s ease}
        @media(max-width:767px){.sb-backdrop{display:block}}
        .sb-drawer{position:fixed;top:0;left:0;bottom:0;width:280px;background:#f4f3f0;border-right:1px solid #e8e6e1;display:flex;flex-direction:column;z-index:201;transition:transform .28s cubic-bezier(.4,0,.2,1);box-shadow:4px 0 24px rgba(0,0,0,.06)}
        @media(min-width:768px){.sb-drawer{position:relative;top:auto;left:auto;bottom:auto;flex-shrink:0;z-index:auto;box-shadow:none;width:268px}}
        .sb-head{padding:clamp(44px,8vw,56px) 18px 18px;border-bottom:1px solid #e8e6e1}
        .sb-head-title{font-family:'Fraunces',serif;font-size:22px;font-weight:600;color:#111;letter-spacing:-.02em;line-height:1}
        .sb-head-title em{font-style:italic;font-weight:400;color:#aaa;font-size:.72em;display:block;margin-top:4px}
        .sb-close-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
        .sb-ico-btn{width:32px;height:32px;border-radius:9px;background:#eceae6;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s}
        .sb-ico-btn:hover{background:#e0ddd8}
        .sb-new{display:flex;align-items:center;gap:9px;margin:14px 16px 0;padding:11px 13px;background:#111;border-radius:13px;border:none;cursor:pointer;font-family:'Manrope',sans-serif;font-size:13px;font-weight:500;color:#fff;transition:background .15s;text-align:left;width:calc(100% - 32px)}
        .sb-new:hover{background:#222}
        .sb-new-ico{width:26px;height:26px;border-radius:7px;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .sb-section{font-size:10px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#bbb;padding:16px 18px 7px;font-family:'Manrope',sans-serif}
        .sb-list{flex:1;overflow-y:auto;padding:0 8px 8px}.sb-list::-webkit-scrollbar{width:0}
        .sb-item{width:100%;text-align:left;border:1px solid transparent;background:transparent;border-radius:12px;padding:10px 12px;cursor:pointer;margin-bottom:2px;display:flex;flex-direction:column;gap:3px;transition:background .15s}
        .sb-item:hover{background:#eceae6}.sb-item.act{background:#fff;border-color:#e8e6e1;box-shadow:0 1px 5px rgba(0,0,0,.05)}
        .sb-item-row{display:flex;align-items:center;justify-content:space-between;gap:6px}
        .sb-item-t{font-size:13px;font-weight:500;color:#111;font-family:'Manrope',sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}
        .sb-item.act .sb-item-t{font-weight:600}
        .sb-item-time{font-size:10px;color:#bbb;font-family:'Manrope',sans-serif;flex-shrink:0}
        .sb-item-prev{font-size:11px;color:#aaa;font-weight:300;font-family:'Manrope',sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .sb-nav-section{border-top:1px solid #e8e6e1;padding:10px 8px 0;flex-shrink:0}
        .sb-nav-item{width:100%;display:flex;align-items:center;gap:10px;padding:10px 12px;border:none;background:transparent;border-radius:11px;cursor:pointer;font-family:'Manrope',sans-serif;font-size:13px;font-weight:400;color:#555;transition:background .15s;text-align:left;margin-bottom:2px}
        .sb-nav-item:hover{background:#eceae6;color:#111}
        .sb-nav-ico{width:30px;height:30px;border-radius:8px;background:#eceae6;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .15s}
        .sb-nav-item:hover .sb-nav-ico{background:#e0ddd8}
        .sb-obs{margin:10px 8px 28px;padding:13px 14px;background:#fff;border-radius:14px;border:1px solid #e8e6e1;flex-shrink:0}
        .sb-obs-head{display:flex;align-items:center;gap:7px;margin-bottom:5px}
        .sb-obs-t{font-size:11px;font-weight:600;color:#111;font-family:'Manrope',sans-serif;flex:1}
        .sb-obs-pill{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9333ea;background:#f5f3ff;padding:2px 8px;border-radius:20px;font-family:'Manrope',sans-serif}
        .sb-obs-txt{font-size:11px;color:#bbb;font-weight:300;line-height:1.5;font-family:'Manrope',sans-serif;margin:0}
        @media(min-width:768px){.sb-drawer{transform:translateX(0) !important;position:relative !important}}
      `}</style>
      {open && <div className="sb-backdrop" onClick={onClose} />}
      <div className="sb-drawer" style={{ transform: open ? "translateX(0)" : "translateX(-100%)" }}>
        <div className="sb-head">
          <div className="sb-close-row">
            <p className="sb-head-title">Conversations<em>SafeMum AI</em></p>
            <button className="sb-ico-btn" onClick={onClose}><X size={14} color="#555" /></button>
          </div>
          <button className="sb-new" onClick={() => { onNew(); onClose(); }}>
            <div className="sb-new-ico"><PenLine size={12} color="#fff" strokeWidth={1.8} /></div>
            New conversation
          </button>
        </div>
        <p className="sb-section">Recent</p>
        <div className="sb-list">
          {MOCK_CONVOS.map(c => (
            <button key={c.id} className={`sb-item${c.id === activeId ? " act" : ""}`} onClick={() => { onSelect(c.id); onClose(); }}>
              <div className="sb-item-row"><span className="sb-item-t">{c.title}</span><span className="sb-item-time">{c.time}</span></div>
              <span className="sb-item-prev">{c.preview}</span>
            </button>
          ))}
        </div>
        <div className="sb-nav-section">
          <p className="sb-section" style={{ padding:"6px 10px 8px" }}>Navigate</p>
          {NAV_LINKS.map(({ label, Icon, path }) => (
            <button key={path} className="sb-nav-item" onClick={() => navigate(path)}>
              <div className="sb-nav-ico"><Icon size={14} color="#555" strokeWidth={1.5} /></div>
              {label}
            </button>
          ))}
        </div>
        <div className="sb-obs">
          <div className="sb-obs-head"><Activity size={12} color="#9333ea" strokeWidth={1.5} /><span className="sb-obs-t">AI Observations</span><span className="sb-obs-pill">Soon</span></div>
          <p className="sb-obs-txt">Patterns & insights from your conversations will appear here.</p>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   QUICK REPLIES
───────────────────────────────────────────────────────────── */
function QuickReplies({ replies, type, onSelect, revealed }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (revealed) { const t = setTimeout(() => setShow(true), 300); return () => clearTimeout(t); }
  }, [revealed]);
  if (!show || !replies?.length) return null;

  const base = { border: "none", cursor: "pointer", fontFamily: "'Manrope',sans-serif", transition: "all .15s" };

  if (type === "topics") return (
    <div style={{ display:"flex",flexWrap:"wrap",gap:7,marginTop:12 }}>
      {replies.map(opt => (
        <button key={opt.id} onClick={() => onSelect(opt.label, opt.id)}
          style={{ ...base,display:"flex",alignItems:"center",gap:6,background:"#fff",border:"1px solid #e8e6e1",borderRadius:40,padding:"7px 13px",fontSize:12,fontWeight:500,color:opt.accent }}
          onMouseEnter={e=>e.currentTarget.style.borderColor=opt.accent}
          onMouseLeave={e=>e.currentTarget.style.borderColor="#e8e6e1"}>
          {opt.Icon&&<opt.Icon size={11} color={opt.accent} strokeWidth={1.8}/>}
          {opt.label}
        </button>
      ))}
    </div>
  );

  if (type === "symptoms") return (
    <div style={{ display:"flex",flexDirection:"column",gap:6,marginTop:12 }}>
      {replies.map(opt => {
        const color=opt.severity==="danger"?"#dc2626":opt.severity==="ok"?"#15803d":"#555";
        return (
          <button key={opt.id} onClick={() => onSelect(opt.label, opt.id)}
            style={{ ...base,display:"flex",alignItems:"center",gap:9,background:"#f8f7f4",border:"1px solid #e8e6e1",borderRadius:12,padding:"9px 12px" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=color}
            onMouseLeave={e=>e.currentTarget.style.borderColor="#e8e6e1"}>
            {opt.Icon&&<opt.Icon size={13} color={color} strokeWidth={1.8}/>}
            <span style={{ fontSize:13,fontWeight:500,color,flex:1 }}>{opt.label}</span>
            {opt.severity==="danger"&&<span style={{ fontSize:9,fontWeight:700,color:"#dc2626",letterSpacing:".1em",textTransform:"uppercase" }}>Urgent</span>}
          </button>
        );
      })}
    </div>
  );

  if (type === "mood") return (
    <div style={{ display:"flex",flexWrap:"wrap",gap:7,marginTop:12 }}>
      {replies.map(opt => (
        <button key={opt.id} onClick={() => onSelect(opt.label, opt.id)}
          style={{ ...base,background:"#f8f7f4",border:"1px solid #e8e6e1",borderRadius:40,padding:"7px 14px",fontSize:12,fontWeight:500,color:"#444" }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor="#9333ea";e.currentTarget.style.background="#faf5ff";}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor="#e8e6e1";e.currentTarget.style.background="#f8f7f4";}}>
          {opt.label}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:6,marginTop:12 }}>
      {replies.map(opt => (
        <button key={opt.id} onClick={() => onSelect(opt.label, opt.id)}
          style={{ ...base,display:"flex",alignItems:"center",gap:9,background:"#f8f7f4",border:"1px solid #e8e6e1",borderRadius:12,padding:"9px 12px" }}
          onMouseEnter={e=>e.currentTarget.style.borderColor=opt.accent}
          onMouseLeave={e=>e.currentTarget.style.borderColor="#e8e6e1"}>
          {opt.Icon&&<opt.Icon size={13} color={opt.accent} strokeWidth={1.8}/>}
          <span style={{ fontSize:13,fontWeight:500,color:opt.accent,flex:1 }}>{opt.label}</span>
          <ChevronRight size={12} color="#ccc"/>
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN
───────────────────────────────────────────────────────────── */
export default function AIAssistant() {
  const navigate = useNavigate();
  const [messages,      setMessages]      = useState(INITIAL_MESSAGES);
  const [inputText,     setInputText]     = useState("");
  const [isTyping,      setIsTyping]      = useState(false);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [voiceMode,     setVoiceMode]     = useState(false);
  const [activeConvo,   setActiveConvo]   = useState("c1");
  const [revealedIds,   setRevealedIds]   = useState(new Set(["intro"]));
  const [isDesktop,     setIsDesktop]     = useState(window.innerWidth >= 768);
  const [mascotMood,    setMascotMood]    = useState("warm");
  const [mascotMessage, setMascotMessage] = useState("Hello Amina — I'm so glad you're here.");
  const [greetingVisible, setGreetingVisible] = useState(true);
  const [inputFocused,  setInputFocused]  = useState(false);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    if (isDesktop) setSidebarOpen(true);
  }, [isDesktop]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* Hide greeting after first user message */
  useEffect(() => {
    const hasUser = messages.some(m => m.role === "user");
    if (hasUser) setGreetingVisible(false);
  }, [messages]);

  /* Mascot reacts when user starts typing */
  useEffect(() => {
    if (inputFocused && inputText.length > 0 && inputText.length < 5) {
      setMascotMood("listening");
      setMascotMessage("Go on…");
    } else if (inputFocused && inputText.length >= 5) {
      setMascotMood("curious");
      setMascotMessage("I'm reading every word.");
    }
  }, [inputText, inputFocused]);

  /* Mascot reacts while AI is typing */
  useEffect(() => {
    if (isTyping) {
      setMascotMood("typing");
      setMascotMessage("");
    }
  }, [isTyping]);

  const sendMessage = useCallback((text, qrId) => {
    const userText = text?.trim();
    if (!userText) return;
    const userMsg = { id: Date.now(), role: "user", text: userText };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);
    setMascotMood("typing");
    setMascotMessage("");

    setTimeout(() => {
      const resp  = getAIResponse(userText, qrId);
      const newId = Date.now() + 1;
      setMessages(prev => [...prev, { id: newId, role: "assistant", ...resp }]);
      setIsTyping(false);

      /* Mascot reacts to the response */
      setMascotMood(resp.mascotMood || "idle");
      setMascotMessage(resp.mascotSay || "");

      setTimeout(() => setRevealedIds(prev => new Set([...prev, newId])), 80);

      /* After a few seconds, mascot settles */
      setTimeout(() => {
        if (!resp.urgent) {
          setMascotMood("idle");
          setMascotMessage("I'm here whenever you need me.");
        }
      }, 7000);
    }, 1100 + Math.random() * 500);
  }, []);

  const handleNewConvo = () => {
    setMessages(INITIAL_MESSAGES);
    setRevealedIds(new Set(["intro"]));
    setActiveConvo("new");
    setGreetingVisible(true);
    setMascotMood("warm");
    setMascotMessage("Hello Amina — I'm so glad you're here.");
  };

  const renderMessage = msg => {
    const isUser     = msg.role === "user";
    const isUrgent   = msg.urgent;
    const isRevealed = revealedIds.has(msg.id);
    return (
      <div key={msg.id} style={{ display:"flex",flexDirection:isUser?"row-reverse":"row",alignItems:"flex-start",gap:10,marginBottom:22,animation:"ai-fadein .28s ease both" }}>
        {!isUser && (
          <div style={{ flexShrink: 0, marginTop: 2 }}>
            <MascotFace mood={isUrgent ? "urgent" : (msg.mascotMood || "idle")} size={30} />
          </div>
        )}
        <div style={{ maxWidth:"78%",minWidth:40 }}>
          <div style={{ background:isUser?"#111":"#fff",border:isUser?"none":isUrgent?"1px solid #fecaca":"1px solid #eceae6",borderRadius:isUser?"18px 6px 18px 18px":"6px 18px 18px 18px",padding:"12px 16px",boxShadow:isUser?"none":"0 1px 4px rgba(0,0,0,.04)" }}>
            {isUrgent&&(
              <div style={{ display:"flex",alignItems:"center",gap:5,marginBottom:7 }}>
                <AlertTriangle size={10} color="#dc2626"/>
                <span style={{ fontSize:9,fontWeight:700,color:"#dc2626",letterSpacing:".1em",textTransform:"uppercase",fontFamily:"'Manrope',sans-serif" }}>Attention needed</span>
              </div>
            )}
            <p style={{ margin:0,fontSize:14,lineHeight:1.7,color:isUser?"#fff":isUrgent?"#7f1d1d":"#1a1a1a",fontFamily:"'Manrope',sans-serif",fontWeight:300,whiteSpace:"pre-wrap" }}
              dangerouslySetInnerHTML={{ __html:msg.text.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\n/g,"<br/>") }}/>
          </div>
          {!isUser&&<QuickReplies replies={msg.quickReplies} type={msg.quickReplyType} onSelect={sendMessage} revealed={isRevealed}/>}
        </div>
      </div>
    );
  };

  const sidebarVisible = isDesktop ? true : sidebarOpen;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,400&family=Manrope:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes ai-fadein { from{opacity:0;transform:translateY(7px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ai-tdot {0%,60%,100%{transform:translateY(0);opacity:.35}30%{transform:translateY(-5px);opacity:1}}
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 3px rgba(74,222,128,.25)}50%{box-shadow:0 0 0 5px rgba(74,222,128,.1)} }
        @keyframes msc-breathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }

        .ai-shell {
          font-family: 'Manrope', sans-serif;
          background: #f4f3f0;
          height: 100dvh;
          display: flex;
          flex-direction: row;
          overflow: hidden;
        }

        @media (min-width: 768px) {
          .sb-drawer { transform: translateX(0) !important; position: relative !important; }
        }

        .ai-chat { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; position: relative; }

        .ai-menu-btn {
          position: absolute; top: max(env(safe-area-inset-top,0px), 16px); left: 16px; z-index: 50;
          width: 38px; height: 38px; border-radius: 12px;
          background: rgba(244,243,240,.9); backdrop-filter: blur(8px);
          border: 1px solid #e8e6e1; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 10px rgba(0,0,0,.08); transition: background .15s;
        }
        .ai-menu-btn:hover { background: #eceae6; }

        .ai-msgs {
          flex: 1; overflow-y: auto;
          padding: 16px 20px 16px;
          scroll-behavior: smooth; position: relative;
        }
        .ai-msgs::-webkit-scrollbar { width: 0; }
        .ai-msgs-inner { max-width: 640px; margin: 0 auto; padding-bottom: 80px; }

        .ai-date-chip { text-align:center; margin-bottom:24px; }
        .ai-date-chip span { display:inline-block;background:#eceae6;border-radius:20px;padding:4px 14px;font-size:11px;color:#aaa;font-weight:500;letter-spacing:.06em;font-family:'Manrope',sans-serif; }

        .ai-tdot { width:6px;height:6px;border-radius:50%;background:#ccc;animation:ai-tdot 1.2s infinite; }
        .ai-tdot:nth-child(2){animation-delay:.15s}.ai-tdot:nth-child(3){animation-delay:.3s}

        .ai-bar {
          flex-shrink: 0; padding: 8px 20px;
          padding-bottom: calc(env(safe-area-inset-bottom,0px) + 12px);
          background: #f4f3f0; position: relative; z-index: 30;
        }
        .ai-bar-inner {
          max-width: 640px; margin: 0 auto;
          background: #fff; border: 1px solid #e0ddd8;
          border-radius: 20px; padding: 4px 4px 4px 18px;
          display: flex; align-items: flex-end; gap: 6px;
          box-shadow: 0 2px 14px rgba(0,0,0,.06); transition: border-color .2s, box-shadow .2s;
        }
        .ai-bar-inner:focus-within { border-color: #c8c5bf; box-shadow: 0 2px 20px rgba(0,0,0,.09); }
        .ai-bar-inner.listening-active { border-color: #2563eb; box-shadow: 0 2px 20px rgba(37,99,235,0.15); }
        .ai-textarea {
          flex: 1; background: none; border: none; outline: none;
          font-family: 'Manrope', sans-serif; font-size: 14px;
          font-weight: 300; color: #111; resize: none;
          max-height: 120px; line-height: 1.55; padding: 11px 0;
        }
        .ai-textarea::placeholder { color: #c0bdb8; }
        .ai-bar-actions { display:flex;align-items:center;gap:4px;padding:5px; }
        .ai-bar-btn { width:36px;height:36px;border-radius:12px;border:none;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:background .15s; }
        .ai-voice-btn { width:36px;height:36px;border-radius:12px;border:1px solid #e0ddd8;background:#f4f3f0;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .15s; }
        .ai-voice-btn:hover { background:#eceae6;border-color:#d5d0c8; }
        .ai-send { background: #111; }
        .ai-send:hover { background: #2563eb; }
        .ai-send:disabled { background: #ddd8d0; cursor: default; }
      `}</style>

      {voiceMode && <VoiceMode onClose={() => setVoiceMode(false)} />}

      <div className="ai-shell">
        <Sidebar
          open={sidebarVisible}
          onClose={() => { if (!isDesktop) setSidebarOpen(false); }}
          onNew={handleNewConvo}
          activeId={activeConvo}
          onSelect={setActiveConvo}
          navigate={navigate}
        />

        <div className="ai-chat">
          {!isDesktop && (
            <button className="ai-menu-btn" onClick={() => setSidebarOpen(true)}>
              <MessageSquare size={16} color="#555" strokeWidth={1.5} />
            </button>
          )}

          {/* Mascot greeting strip */}
          <MascotGreeting visible={greetingVisible} mood={mascotMood} />

          {/* Messages */}
          <div className="ai-msgs">
            <div className="ai-msgs-inner">
              <div className="ai-date-chip">
                <span>{new Date().toLocaleDateString("en-GB", { weekday:"long",day:"numeric",month:"long" })}</span>
              </div>

              {messages.map(renderMessage)}

              {isTyping && (
                <div style={{ display:"flex",alignItems:"flex-start",gap:10,marginBottom:22,animation:"ai-fadein .25s ease" }}>
                  <div style={{ flexShrink: 0, marginTop: 2 }}>
                    <MascotFace mood="typing" size={30} />
                  </div>
                  <div style={{ background:"#fff",border:"1px solid #eceae6",borderRadius:"6px 18px 18px 18px",padding:"14px 16px",display:"flex",gap:5,alignItems:"center",boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
                    <div className="ai-tdot"/><div className="ai-tdot"/><div className="ai-tdot"/>
                  </div>
                </div>
              )}

              <div ref={bottomRef} style={{ height: 4 }} />
            </div>
          </div>

          {/* Floating mascot panel */}
          <MascotPanel
            mood={mascotMood}
            message={mascotMessage}
            isTyping={isTyping}
            messageCount={messages.length}
            lastMessageRole={messages[messages.length - 1]?.role}
            inputLength={inputText.length}
          />

          {/* Input */}
          <div className="ai-bar">
            <div className={`ai-bar-inner${inputFocused && inputText ? " listening-active" : ""}`}>
              <textarea
                ref={inputRef}
                className="ai-textarea"
                rows={1}
                placeholder="Ask me anything…"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onFocus={() => { setInputFocused(true); setMascotMood("listening"); setMascotMessage("I'm all ears, Amina."); }}
                onBlur={() => { setInputFocused(false); if (!inputText) { setMascotMood("idle"); setMascotMessage("I'm here whenever you need me."); } }}
                onKeyDown={e => { if (e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage(inputText);}}}
              />
              <div className="ai-bar-actions">
                <button className="ai-voice-btn" onClick={() => setVoiceMode(true)}>
                  <Mic size={15} color="#888" strokeWidth={1.5}/>
                </button>
                <button className="ai-bar-btn ai-send" disabled={!inputText.trim()} onClick={() => sendMessage(inputText)}>
                  <Send size={14} color="#fff" strokeWidth={2}/>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}