import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic, MicOff, Send, X, Plus,
  AlertTriangle, MessageSquare,
  Stethoscope, Heart, Leaf, ShieldAlert,
  CheckCircle2, Circle, ChevronRight,
  Activity, PenLine, PhoneOff, Volume2,
  VolumeX, Home, Bell, Map, Settings,
  User2, Sparkles,
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
  { label: "Home",      Icon: Home,     path: "/home"          },
  { label: "Reminders", Icon: Bell,     path: "/reminders"     },
  { label: "Map",       Icon: Map,      path: "/map"           },
  { label: "Profile",   Icon: User2,    path: "/profile"       },
];

function getAIResponse(userMessage, qrId) {
  const msg = (userMessage || "").toLowerCase();
  const id  = qrId || "";
  if (id === "physical" || msg.includes("physical") || msg.includes("recovery"))
    return { text: "Let's check how you're recovering physically. Are you currently experiencing any of these?", quickReplies: SYMPTOM_OPTIONS, quickReplyType: "symptoms", urgent: false, mood: "thinking" };
  if (id === "emotional" || msg.includes("feel") || msg.includes("sad") || msg.includes("emotion"))
    return { text: "How you feel emotionally is just as important as your physical recovery.\n\nHow would you describe where you are right now?", quickReplies: MOOD_OPTIONS, quickReplyType: "mood", urgent: false, mood: "caring" };
  if (id === "danger" || msg.includes("danger") || msg.includes("warning"))
    return { text: "These are the danger signs that need immediate attention:\n\n**Soaking a pad every hour** for 2+ hours\n**Fever above 38°C** with chills or foul discharge\n**Severe lower belly pain** that does not ease\n**Dizziness or fainting**\n\nIf you notice any of these — go to a facility immediately.", quickReplies: [{ id: "alert", label: "Open Emergency Alert", Icon: ShieldAlert, accent: "#dc2626" }, { id: "map", label: "Find nearest facility", Icon: Stethoscope, accent: "#15803d" }], quickReplyType: "actions", urgent: false, mood: "alert" };
  if (["bleeding_heavy","fever","dizziness","pain_severe"].includes(id))
    return { text: "I'm concerned about what you've described. These symptoms can be serious.\n\nPlease don't wait — you need to be seen by a healthcare provider today.", quickReplies: [{ id: "alert", label: "Send Emergency Alert", Icon: ShieldAlert, accent: "#dc2626" }, { id: "map", label: "Find nearest facility", Icon: Stethoscope, accent: "#15803d" }], quickReplyType: "actions", urgent: true, mood: "concerned" };
  if (["bleeding_light","pain_mild"].includes(id))
    return { text: "Some light spotting and mild discomfort are normal in the first 2 weeks. Your body is healing.\n\nAre you attending your follow-up appointment on May 19th?", quickReplies: [{ id: "yes_appt", label: "Yes, I am", Icon: CheckCircle2, accent: "#15803d" }, { id: "no_appt", label: "I'm not sure", Icon: Circle, accent: "#ca8a04" }], quickReplyType: "actions", urgent: false, mood: "gentle" };
  if (id === "none")
    return { text: "That's encouraging. Rest, hydration, and your follow-up on May 19th still matter.\n\nAnything specific on your mind?", quickReplies: TOPIC_OPTIONS, quickReplyType: "topics", urgent: false, mood: "happy" };
  if (["overwhelmed","numb","sad","anxious"].includes(id))
    return { text: "What you're feeling is completely valid. Grief after a pregnancy loss is real — it doesn't have a timeline.\n\nYou don't have to carry this alone.", quickReplies: [{ id: "hub", label: "Recovery Hub", Icon: Heart, accent: "#9333ea" }, { id: "talk", label: "Keep talking", Icon: MessageSquare, accent: "#2563eb" }], quickReplyType: "actions", urgent: false, mood: "caring" };
  if (["ok","good"].includes(id))
    return { text: "I'm glad you're managing. That takes real strength.\n\nIs there anything I can help with today?", quickReplies: TOPIC_OPTIONS, quickReplyType: "topics", urgent: false, mood: "happy" };
  if (id === "nutrition" || msg.includes("eat") || msg.includes("food"))
    return { text: "Good nutrition after a pregnancy loss helps your body rebuild faster.\n\n**Iron** — lentils, spinach, beans, red meat\n**Folate** — leafy greens, eggs, avocado\n**Hydration** — at least 8 glasses of water daily", quickReplies: TOPIC_OPTIONS, quickReplyType: "topics", urgent: false, mood: "thinking" };
  return { text: "I hear you. Can you tell me a bit more about what you're experiencing right now?", quickReplies: TOPIC_OPTIONS, quickReplyType: "topics", urgent: false, mood: "gentle" };
}

const INITIAL_MESSAGES = [{
  id: "intro", role: "assistant", urgent: false, mood: "happy",
  text: "Hello Amina, I'm here with you.\n\nI'm your SafeMum health assistant — here to support your recovery, answer your questions, and make sure you're safe.\n\nWhat would you like to talk about today?",
  quickReplies: TOPIC_OPTIONS, quickReplyType: "topics",
}];

/* ─────────────────────────────────────────────────────────────
   MASCOT FACE  — fully CSS, no external SVG
   moods: idle | thinking | caring | happy | concerned | alert | gentle | typing | listening
───────────────────────────────────────────────────────────── */
function MascotFace({ mood = "idle", size = 56 }) {
  const s = size;
  const r = s / 2;

  // Eye shapes by mood
  const eyeConfigs = {
    idle:      { lx: r * 0.34, rx: r * 0.66, ey: r * 0.44, ew: r * 0.12, eh: r * 0.14, brow: 0 },
    thinking:  { lx: r * 0.34, rx: r * 0.66, ey: r * 0.44, ew: r * 0.12, eh: r * 0.10, brow: -2 },
    caring:    { lx: r * 0.34, rx: r * 0.66, ey: r * 0.44, ew: r * 0.12, eh: r * 0.16, brow: 1 },
    happy:     { lx: r * 0.34, rx: r * 0.66, ey: r * 0.44, ew: r * 0.13, eh: r * 0.06, brow: 2, squint: true },
    concerned: { lx: r * 0.34, rx: r * 0.66, ey: r * 0.44, ew: r * 0.12, eh: r * 0.16, brow: -3 },
    alert:     { lx: r * 0.33, rx: r * 0.67, ey: r * 0.43, ew: r * 0.13, eh: r * 0.18, brow: -4 },
    gentle:    { lx: r * 0.34, rx: r * 0.66, ey: r * 0.45, ew: r * 0.11, eh: r * 0.13, brow: 1 },
    typing:    { lx: r * 0.34, rx: r * 0.66, ey: r * 0.44, ew: r * 0.12, eh: r * 0.10, brow: -1 },
    listening: { lx: r * 0.34, rx: r * 0.66, ey: r * 0.44, ew: r * 0.14, eh: r * 0.18, brow: 0 },
  };

  const cfg = eyeConfigs[mood] || eyeConfigs.idle;

  // Mouth paths by mood
  const mouthY = r * 0.66;
  const mouthW = r * 0.32;
  const mouthPaths = {
    idle:      `M ${r - mouthW} ${mouthY} Q ${r} ${mouthY + r * 0.08} ${r + mouthW} ${mouthY}`,
    thinking:  `M ${r - mouthW * 0.7} ${mouthY + r * 0.02} Q ${r} ${mouthY - r * 0.04} ${r + mouthW * 0.7} ${mouthY + r * 0.02}`,
    caring:    `M ${r - mouthW} ${mouthY} Q ${r} ${mouthY + r * 0.14} ${r + mouthW} ${mouthY}`,
    happy:     `M ${r - mouthW} ${mouthY - r * 0.04} Q ${r} ${mouthY + r * 0.18} ${r + mouthW} ${mouthY - r * 0.04}`,
    concerned: `M ${r - mouthW * 0.8} ${mouthY + r * 0.06} Q ${r} ${mouthY - r * 0.06} ${r + mouthW * 0.8} ${mouthY + r * 0.06}`,
    alert:     `M ${r - mouthW * 0.6} ${mouthY + r * 0.04} L ${r + mouthW * 0.6} ${mouthY + r * 0.04}`,
    gentle:    `M ${r - mouthW} ${mouthY} Q ${r} ${mouthY + r * 0.10} ${r + mouthW} ${mouthY}`,
    typing:    `M ${r - mouthW * 0.5} ${mouthY} Q ${r} ${mouthY + r * 0.05} ${r + mouthW * 0.5} ${mouthY}`,
    listening: `M ${r - mouthW} ${mouthY} Q ${r} ${mouthY + r * 0.06} ${r + mouthW} ${mouthY}`,
  };

  const faceColors = {
    idle:      { bg: "#111", glow: "rgba(99,102,241,0.15)" },
    thinking:  { bg: "#1d1d3a", glow: "rgba(99,102,241,0.25)" },
    caring:    { bg: "#1a0d2e", glow: "rgba(147,51,234,0.25)" },
    happy:     { bg: "#0a1f0a", glow: "rgba(34,197,94,0.2)" },
    concerned: { bg: "#1f0a0a", glow: "rgba(220,38,38,0.2)" },
    alert:     { bg: "#2a0a0a", glow: "rgba(220,38,38,0.3)" },
    gentle:    { bg: "#0d1a2a", glow: "rgba(37,99,235,0.2)" },
    typing:    { bg: "#111", glow: "rgba(99,102,241,0.2)" },
    listening: { bg: "#0a1a1a", glow: "rgba(20,184,166,0.2)" },
  };

  const fc = faceColors[mood] || faceColors.idle;

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ display: "block", filter: `drop-shadow(0 0 ${s * 0.12}px ${fc.glow})`, transition: "filter 0.5s ease" }}>
      {/* Face circle */}
      <circle cx={r} cy={r} r={r - 1} fill={fc.bg} style={{ transition: "fill 0.5s ease" }} />
      {/* Inner glow ring */}
      <circle cx={r} cy={r} r={r - 1} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

      {/* Left brow */}
      <line
        x1={cfg.lx - r * 0.10} y1={cfg.ey - r * 0.20 + cfg.brow}
        x2={cfg.lx + r * 0.10} y2={cfg.ey - r * 0.20 - cfg.brow}
        stroke="rgba(255,255,255,0.55)" strokeWidth={r * 0.045} strokeLinecap="round"
        style={{ transition: "all 0.35s ease" }}
      />
      {/* Right brow */}
      <line
        x1={cfg.rx - r * 0.10} y1={cfg.ey - r * 0.20 + cfg.brow}
        x2={cfg.rx + r * 0.10} y2={cfg.ey - r * 0.20 - cfg.brow}
        stroke="rgba(255,255,255,0.55)" strokeWidth={r * 0.045} strokeLinecap="round"
        style={{ transition: "all 0.35s ease" }}
      />

      {/* Left eye */}
      <ellipse cx={cfg.lx} cy={cfg.ey} rx={cfg.ew} ry={cfg.squint ? cfg.eh * 0.4 : cfg.eh}
        fill="white" style={{ transition: "all 0.3s ease" }} />
      {/* Left pupil */}
      {!cfg.squint && <circle cx={cfg.lx + r * 0.01} cy={cfg.ey + r * 0.02} r={cfg.ew * 0.55} fill="#111" />}
      {!cfg.squint && <circle cx={cfg.lx + r * 0.04} cy={cfg.ey - r * 0.02} r={cfg.ew * 0.2} fill="white" />}

      {/* Right eye */}
      <ellipse cx={cfg.rx} cy={cfg.ey} rx={cfg.ew} ry={cfg.squint ? cfg.eh * 0.4 : cfg.eh}
        fill="white" style={{ transition: "all 0.3s ease" }} />
      {/* Right pupil */}
      {!cfg.squint && <circle cx={cfg.rx + r * 0.01} cy={cfg.ey + r * 0.02} r={cfg.ew * 0.55} fill="#111" />}
      {!cfg.squint && <circle cx={cfg.rx + r * 0.04} cy={cfg.ey - r * 0.02} r={cfg.ew * 0.2} fill="white" />}

      {/* Happy squint lines */}
      {cfg.squint && <>
        <path d={`M ${cfg.lx - r*0.12} ${cfg.ey} Q ${cfg.lx} ${cfg.ey - r*0.12} ${cfg.lx + r*0.12} ${cfg.ey}`}
          fill="none" stroke="white" strokeWidth={r * 0.05} strokeLinecap="round" />
        <path d={`M ${cfg.rx - r*0.12} ${cfg.ey} Q ${cfg.rx} ${cfg.ey - r*0.12} ${cfg.rx + r*0.12} ${cfg.ey}`}
          fill="none" stroke="white" strokeWidth={r * 0.05} strokeLinecap="round" />
      </>}

      {/* Mouth */}
      <path d={mouthPaths[mood] || mouthPaths.idle}
        fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={r * 0.048} strokeLinecap="round"
        style={{ transition: "d 0.4s ease" }} />

      {/* Thinking dots */}
      {mood === "thinking" && <>
        <circle cx={r * 1.38} cy={r * 0.42} r={r * 0.045} fill="rgba(255,255,255,0.5)" />
        <circle cx={r * 1.48} cy={r * 0.30} r={r * 0.035} fill="rgba(255,255,255,0.35)" />
        <circle cx={r * 1.55} cy={r * 0.18} r={r * 0.025} fill="rgba(255,255,255,0.2)" />
      </>}

      {/* Alert exclamation */}
      {mood === "alert" && <>
        <text x={r * 1.35} y={r * 0.55} fontSize={r * 0.28} fill="rgba(220,38,38,0.8)" fontWeight="bold">!</text>
      </>}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   MASCOT PANEL — the living presence in the chat
   Shows the face + status + subtle ambient animations
───────────────────────────────────────────────────────────── */
function MascotPanel({ mood, isTyping, isListening, lastMessage }) {
  const [blink, setBlink] = useState(false);
  const [breathe, setBreathe] = useState(false);

  // Natural blink rhythm
  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 2500 + Math.random() * 4000;
      return setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 140);
        blinkTimerRef.current = scheduleBlink();
      }, delay);
    };
    const blinkTimer = scheduleBlink();
    return () => clearTimeout(blinkTimer);
  }, []);

  const blinkTimerRef = useRef(null);

  // Breathing / pulse
  useEffect(() => {
    const t = setInterval(() => setBreathe(b => !b), 2800);
    return () => clearInterval(t);
  }, []);

  const moodMeta = {
    idle:      { label: "Online",     color: "#4ade80",  bg: "rgba(74,222,128,0.1)"  },
    thinking:  { label: "Thinking…",  color: "#a78bfa",  bg: "rgba(167,139,250,0.1)" },
    caring:    { label: "With you",   color: "#f472b6",  bg: "rgba(244,114,182,0.1)" },
    happy:     { label: "Here",       color: "#4ade80",  bg: "rgba(74,222,128,0.1)"  },
    concerned: { label: "Concerned",  color: "#f87171",  bg: "rgba(248,113,113,0.1)" },
    alert:     { label: "Urgent",     color: "#ef4444",  bg: "rgba(239,68,68,0.15)"  },
    gentle:    { label: "Listening",  color: "#60a5fa",  bg: "rgba(96,165,250,0.1)"  },
    typing:    { label: "Typing…",    color: "#fbbf24",  bg: "rgba(251,191,36,0.1)"  },
    listening: { label: "Listening",  color: "#2dd4bf",  bg: "rgba(45,212,191,0.1)"  },
  };
  const meta = moodMeta[mood] || moodMeta.idle;
  const displayMood = blink ? "happy" : mood;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 0,
      padding: "20px 16px 16px",
      borderBottom: "1px solid rgba(0,0,0,0.06)",
      background: "linear-gradient(180deg, #fff 0%, #fafaf9 100%)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient light behind mascot */}
      <div style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: 120,
        height: 120,
        borderRadius: "50%",
        background: meta.bg,
        filter: "blur(30px)",
        transition: "background 0.8s ease",
        pointerEvents: "none",
      }} />

      {/* Mascot container with breathing */}
      <div style={{
        transform: breathe ? "scale(1.015) translateY(-1px)" : "scale(1) translateY(0)",
        transition: "transform 2.8s ease-in-out",
        position: "relative",
        zIndex: 1,
      }}>
        <MascotFace mood={displayMood} size={64} />

        {/* Typing wave under mascot */}
        {isTyping && (
          <div style={{
            position: "absolute",
            bottom: -8,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 3,
            animation: "fadeIn 0.2s ease",
          }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: meta.color,
                animation: `mascot-dot 1s ease-in-out ${i * 0.15}s infinite`,
              }} />
            ))}
          </div>
        )}

        {/* Listening rings */}
        {isListening && (
          <div style={{ position: "absolute", inset: -6, borderRadius: "50%", border: `1.5px solid ${meta.color}`, opacity: 0.4, animation: "mascot-ring 1.5s linear infinite" }} />
        )}
      </div>

      {/* Status pill */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        marginTop: 10,
        background: meta.bg,
        border: `1px solid ${meta.color}22`,
        borderRadius: 20,
        padding: "4px 10px",
        transition: "all 0.5s ease",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: meta.color,
          boxShadow: `0 0 0 2px ${meta.color}30`,
          animation: "mascot-pulse 2s infinite",
        }} />
        <span style={{
          fontSize: 11,
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 500,
          color: meta.color,
          letterSpacing: "0.04em",
          transition: "color 0.5s ease",
        }}>{meta.label}</span>
      </div>

      {/* Name */}
      <p style={{
        fontSize: 11,
        color: "#bbb",
        fontFamily: "'Manrope', sans-serif",
        fontWeight: 300,
        marginTop: 4,
        letterSpacing: "0.06em",
      }}>SafeMum AI</p>
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
  const voiceMood  = isActive ? "listening" : isSpeaking ? "caring" : "idle";

  return (
    <div style={{ position:"fixed",inset:0,zIndex:500,background:"#0c0b0a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",padding:"max(env(safe-area-inset-top,44px),48px) 24px max(env(safe-area-inset-bottom,24px),32px)",animation:"vc-in .3s ease" }}>
      <style>{`
        @keyframes vc-in{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ring-out{0%{transform:scale(1);opacity:.5}100%{transform:scale(1.9);opacity:0}}
        @keyframes wave-bar{0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}}
        @keyframes txt-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
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
          <div style={{ width:140,height:140,borderRadius:"50%",background:"#111",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:isActive?"0 0 60px rgba(99,102,241,.25)":isSpeaking?"0 0 60px rgba(167,139,250,.2)":"0 8px 32px rgba(0,0,0,.4)",transition:"box-shadow .4s" }}>
            <MascotFace mood={voiceMood} size={88} />
          </div>
        </div>
        <p style={{ fontFamily:"'Fraunces',serif",fontStyle:"italic",fontSize:"clamp(16px,4vw,22px)",fontWeight:300,color:"#777",textAlign:"center",maxWidth:300,lineHeight:1.5,animation:"txt-in .4s ease",marginBottom:12 }}>
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
        .sb-backdrop{display:none;position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.35);backdrop-filter:blur(3px);animation:sb-fade .2s ease;}
        @media(max-width:767px){.sb-backdrop{display:block;}}
        .sb-drawer{position:fixed;top:0;left:0;bottom:0;width:280px;background:#f4f3f0;border-right:1px solid #e8e6e1;display:flex;flex-direction:column;z-index:201;transition:transform .28s cubic-bezier(.4,0,.2,1);box-shadow:4px 0 24px rgba(0,0,0,.06);}
        @media(min-width:768px){.sb-drawer{position:relative;top:auto;left:auto;bottom:auto;flex-shrink:0;z-index:auto;box-shadow:none;width:268px;}}
        .sb-head{padding:clamp(44px,8vw,56px) 18px 18px;border-bottom:1px solid #e8e6e1;}
        .sb-head-title{font-family:'Fraunces',serif;font-size:22px;font-weight:600;color:#111;letter-spacing:-.02em;line-height:1;}
        .sb-head-title em{font-style:italic;font-weight:400;color:#aaa;font-size:.72em;display:block;margin-top:4px;}
        .sb-close-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
        .sb-ico-btn{width:32px;height:32px;border-radius:9px;background:#eceae6;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;}
        .sb-ico-btn:hover{background:#e0ddd8;}
        .sb-new{display:flex;align-items:center;gap:9px;margin:14px 16px 0;padding:11px 13px;background:#111;border-radius:13px;border:none;cursor:pointer;font-family:'Manrope',sans-serif;font-size:13px;font-weight:500;color:#fff;transition:background .15s;text-align:left;width:calc(100% - 32px);}
        .sb-new:hover{background:#222;}
        .sb-new-ico{width:26px;height:26px;border-radius:7px;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .sb-section{font-size:10px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#bbb;padding:16px 18px 7px;font-family:'Manrope',sans-serif;}
        .sb-list{flex:1;overflow-y:auto;padding:0 8px 8px;}
        .sb-list::-webkit-scrollbar{width:0;}
        .sb-item{width:100%;text-align:left;border:1px solid transparent;background:transparent;border-radius:12px;padding:10px 12px;cursor:pointer;margin-bottom:2px;display:flex;flex-direction:column;gap:3px;transition:background .15s;}
        .sb-item:hover{background:#eceae6;}
        .sb-item.act{background:#fff;border-color:#e8e6e1;box-shadow:0 1px 5px rgba(0,0,0,.05);}
        .sb-item-row{display:flex;align-items:center;justify-content:space-between;gap:6px;}
        .sb-item-t{font-size:13px;font-weight:500;color:#111;font-family:'Manrope',sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;}
        .sb-item.act .sb-item-t{font-weight:600;}
        .sb-item-time{font-size:10px;color:#bbb;font-family:'Manrope',sans-serif;flex-shrink:0;}
        .sb-item-prev{font-size:11px;color:#aaa;font-weight:300;font-family:'Manrope',sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .sb-nav-section{border-top:1px solid #e8e6e1;padding:10px 8px 0;flex-shrink:0;}
        .sb-nav-item{width:100%;display:flex;align-items:center;gap:10px;padding:10px 12px;border:none;background:transparent;border-radius:11px;cursor:pointer;font-family:'Manrope',sans-serif;font-size:13px;font-weight:400;color:#555;transition:background .15s;text-align:left;margin-bottom:2px;}
        .sb-nav-item:hover{background:#eceae6;color:#111;}
        .sb-nav-ico{width:30px;height:30px;border-radius:8px;background:#eceae6;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .15s;}
        .sb-nav-item:hover .sb-nav-ico{background:#e0ddd8;}
        .sb-obs{margin:10px 8px 28px;padding:13px 14px;background:#fff;border-radius:14px;border:1px solid #e8e6e1;flex-shrink:0;}
        .sb-obs-head{display:flex;align-items:center;gap:7px;margin-bottom:5px;}
        .sb-obs-t{font-size:11px;font-weight:600;color:#111;font-family:'Manrope',sans-serif;flex:1;}
        .sb-obs-pill{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9333ea;background:#f5f3ff;padding:2px 8px;border-radius:20px;font-family:'Manrope',sans-serif;}
        .sb-obs-txt{font-size:11px;color:#bbb;font-weight:300;line-height:1.5;font-family:'Manrope',sans-serif;margin:0;}
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
              <div className="sb-item-row">
                <span className="sb-item-t">{c.title}</span>
                <span className="sb-item-time">{c.time}</span>
              </div>
              <span className="sb-item-prev">{c.preview}</span>
            </button>
          ))}
        </div>
        <div className="sb-nav-section">
          <p className="sb-section" style={{ padding: "6px 10px 8px" }}>Navigate</p>
          {NAV_LINKS.map(({ label, Icon, path }) => (
            <button key={path} className="sb-nav-item" onClick={() => navigate(path)}>
              <div className="sb-nav-ico"><Icon size={14} color="#555" strokeWidth={1.5} /></div>
              {label}
            </button>
          ))}
        </div>
        <div className="sb-obs">
          <div className="sb-obs-head">
            <Activity size={12} color="#9333ea" strokeWidth={1.5} />
            <span className="sb-obs-t">AI Observations</span>
            <span className="sb-obs-pill">Soon</span>
          </div>
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
   TYPING TEXT — streams in character by character
───────────────────────────────────────────────────────────── */
function StreamingText({ text, onDone, speed = 18 }) {
  const [displayed, setDisplayed] = useState("");
  const iRef = useRef(0);

  useEffect(() => {
    iRef.current = 0;
    setDisplayed("");
    const t = setInterval(() => {
      iRef.current++;
      setDisplayed(text.slice(0, iRef.current));
      if (iRef.current >= text.length) {
        clearInterval(t);
        if (onDone) onDone();
      }
    }, speed);
    return () => clearInterval(t);
  }, [text]);

  return (
    <span
      dangerouslySetInnerHTML={{
        __html: displayed
          .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
          .replace(/\n/g, "<br/>")
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN
───────────────────────────────────────────────────────────── */
export default function AIAssistant() {
  const navigate = useNavigate();
  const [messages,        setMessages]        = useState(INITIAL_MESSAGES);
  const [inputText,       setInputText]       = useState("");
  const [isTyping,        setIsTyping]        = useState(false);
  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [voiceMode,       setVoiceMode]       = useState(false);
  const [activeConvo,     setActiveConvo]     = useState("c1");
  const [revealedIds,     setRevealedIds]     = useState(new Set(["intro"]));
  const [streamingIds,    setStreamingIds]    = useState(new Set(["intro"]));
  const [isDesktop,       setIsDesktop]       = useState(window.innerWidth >= 768);
  const [mascotMood,      setMascotMood]      = useState("happy");
  const [isListening,     setIsListening]     = useState(false);
  const [inputFocused,    setInputFocused]    = useState(false);
  const [inputLen,        setInputLen]        = useState(0);

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

  // Mascot reacts to input
  useEffect(() => {
    if (inputFocused && inputLen > 0) {
      setMascotMood("listening");
    } else if (inputFocused) {
      setMascotMood("gentle");
    } else if (!isTyping) {
      setMascotMood("idle");
    }
  }, [inputFocused, inputLen, isTyping]);

  const sendMessage = useCallback((text, qrId) => {
    const userText = text?.trim();
    if (!userText) return;
    const userMsg = { id: Date.now(), role: "user", text: userText };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setInputLen(0);
    setIsTyping(true);
    setMascotMood("thinking");

    setTimeout(() => {
      const resp  = getAIResponse(userText, qrId);
      const newId = Date.now() + 1;
      setIsTyping(false);
      setMascotMood(resp.mood || "gentle");
      setMessages(prev => [...prev, { id: newId, role: "assistant", ...resp, streaming: true }]);
      setStreamingIds(prev => new Set([...prev, newId]));
      setTimeout(() => setRevealedIds(prev => new Set([...prev, newId])), 80);
    }, 900 + Math.random() * 600);
  }, []);

  const handleStreamDone = useCallback((id) => {
    setStreamingIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setMascotMood("idle");
  }, []);

  const handleNewConvo = () => {
    setMessages(INITIAL_MESSAGES);
    setRevealedIds(new Set(["intro"]));
    setStreamingIds(new Set(["intro"]));
    setActiveConvo("new");
    setMascotMood("happy");
  };

  const renderMessage = msg => {
    const isUser     = msg.role === "user";
    const isUrgent   = msg.urgent;
    const isRevealed = revealedIds.has(msg.id);
    const isStreaming = streamingIds.has(msg.id);

    return (
      <div key={msg.id} style={{ display:"flex",flexDirection:isUser?"row-reverse":"row",alignItems:"flex-start",gap:10,marginBottom:22,animation:"ai-fadein .28s ease both" }}>
        {/* Inline face for assistant messages */}
        {!isUser && (
          <div style={{
            width: 30, height: 30,
            borderRadius: "50%",
            flexShrink: 0,
            marginTop: 2,
            overflow: "hidden",
            background: isUrgent ? "#dc2626" : "#111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {isUrgent
              ? <AlertTriangle size={13} color="#fff" strokeWidth={2} />
              : <MascotFace mood={isUrgent ? "alert" : (msg.mood || "idle")} size={30} />
            }
          </div>
        )}

        <div style={{ maxWidth:"78%",minWidth:40 }}>
          <div style={{
            background:isUser?"#111":"#fff",
            border:isUser?"none":isUrgent?"1px solid #fecaca":"1px solid #eceae6",
            borderRadius:isUser?"18px 6px 18px 18px":"6px 18px 18px 18px",
            padding:"12px 16px",
            boxShadow:isUser?"none":"0 1px 4px rgba(0,0,0,.04)",
          }}>
            {isUrgent && (
              <div style={{ display:"flex",alignItems:"center",gap:5,marginBottom:7 }}>
                <AlertTriangle size={10} color="#dc2626"/>
                <span style={{ fontSize:9,fontWeight:700,color:"#dc2626",letterSpacing:".1em",textTransform:"uppercase",fontFamily:"'Manrope',sans-serif" }}>Attention needed</span>
              </div>
            )}
            <p style={{
              margin:0,fontSize:14,lineHeight:1.7,
              color:isUser?"#fff":isUrgent?"#7f1d1d":"#1a1a1a",
              fontFamily:"'Manrope',sans-serif",fontWeight:300,whiteSpace:"pre-wrap"
            }}>
              {!isUser && isStreaming
                ? <StreamingText text={msg.text} onDone={() => handleStreamDone(msg.id)} />
                : <span dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\n/g,"<br/>") }} />
              }
            </p>
          </div>
          {!isUser && <QuickReplies replies={msg.quickReplies} type={msg.quickReplyType} onSelect={sendMessage} revealed={isRevealed && !isStreaming} />}
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
        @keyframes ai-tdot { 0%,60%,100%{transform:translateY(0);opacity:.35}30%{transform:translateY(-5px);opacity:1} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes mascot-dot { 0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-4px);opacity:1} }
        @keyframes mascot-ring { 0%{transform:scale(1);opacity:.6}100%{transform:scale(1.5);opacity:0} }
        @keyframes mascot-pulse { 0%,100%{opacity:1}50%{opacity:0.5} }

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

        /* The right side: mascot panel + messages + input stacked */
        .ai-chat {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
        }

        /* Mascot panel is pinned top of chat area */
        .ai-mascot-panel {
          flex-shrink: 0;
        }

        .ai-msgs {
          flex: 1;
          overflow-y: auto;
          padding: 20px 20px 16px;
          scroll-behavior: smooth;
          position: relative;
        }
        .ai-msgs::-webkit-scrollbar { width: 0; }
        .ai-msgs-inner { max-width: 640px; margin: 0 auto; }

        .ai-date-chip { text-align:center; margin-bottom:24px; }
        .ai-date-chip span {
          display:inline-block; background:#eceae6; border-radius:20px;
          padding:4px 14px; font-size:11px; color:#aaa; font-weight:500;
          letter-spacing:.06em; font-family:'Manrope',sans-serif;
        }

        .ai-tdot { width:6px;height:6px;border-radius:50%;background:#ccc;animation:ai-tdot 1.2s infinite; }
        .ai-tdot:nth-child(2){animation-delay:.15s}
        .ai-tdot:nth-child(3){animation-delay:.3s}

        /* Menu btn for mobile */
        .ai-menu-btn {
          position: absolute; top: max(env(safe-area-inset-top,0px), 12px); left: 12px; z-index: 50;
          width: 36px; height: 36px; border-radius: 11px;
          background: rgba(244,243,240,.9); backdrop-filter: blur(8px);
          border: 1px solid #e8e6e1; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 10px rgba(0,0,0,.08); transition: background .15s;
        }
        .ai-menu-btn:hover { background: #eceae6; }

        /* Input bar */
        .ai-bar {
          flex-shrink: 0;
          padding: 8px 20px;
          padding-bottom: calc(env(safe-area-inset-bottom,0px) + 12px);
          background: #f4f3f0;
        }
        .ai-bar-inner {
          max-width: 640px; margin: 0 auto;
          background: #fff; border: 1px solid #e0ddd8; border-radius: 20px;
          padding: 4px 4px 4px 18px;
          display: flex; align-items: flex-end; gap: 6px;
          box-shadow: 0 2px 14px rgba(0,0,0,.06); transition: border-color .2s, box-shadow .2s;
        }
        .ai-bar-inner:focus-within { border-color: #c8c5bf; box-shadow: 0 2px 20px rgba(0,0,0,.09); }
        .ai-textarea {
          flex: 1; background: none; border: none; outline: none;
          font-family: 'Manrope', sans-serif; font-size: 14px; font-weight: 300;
          color: #111; resize: none; max-height: 120px; line-height: 1.55; padding: 11px 0;
        }
        .ai-textarea::placeholder { color: #c0bdb8; }
        .ai-bar-actions { display:flex;align-items:center;gap:4px;padding:5px; }
        .ai-bar-btn {
          width: 36px; height: 36px; border-radius: 12px; border: none; cursor: pointer; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; transition: background .15s;
        }
        .ai-voice-btn {
          width: 36px; height: 36px; border-radius: 12px; border: 1px solid #e0ddd8; background: #f4f3f0;
          cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all .15s;
        }
        .ai-voice-btn:hover { background: #eceae6; border-color: #d5d0c8; }
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

        <div className="ai-chat" style={{ position: "relative" }}>
          {/* Mobile menu button */}
          {!isDesktop && (
            <button className="ai-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <MessageSquare size={15} color="#555" strokeWidth={1.5} />
            </button>
          )}

          {/* ── MASCOT PANEL pinned at top ── */}
          <div className="ai-mascot-panel">
            <MascotPanel
              mood={mascotMood}
              isTyping={isTyping}
              isListening={isListening}
              lastMessage={messages[messages.length - 1]?.text}
            />
          </div>

          {/* Messages */}
          <div className="ai-msgs">
            <div className="ai-msgs-inner">
              <div className="ai-date-chip">
                <span>{new Date().toLocaleDateString("en-GB", { weekday:"long",day:"numeric",month:"long" })}</span>
              </div>

              {messages.map(renderMessage)}

              {isTyping && (
                <div style={{ display:"flex",alignItems:"flex-start",gap:10,marginBottom:22,animation:"ai-fadein .25s ease" }}>
                  <div style={{ width:30,height:30,borderRadius:"50%",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2,background:"#111" }}>
                    <MascotFace mood="thinking" size={30} />
                  </div>
                  <div style={{ background:"#fff",border:"1px solid #eceae6",borderRadius:"6px 18px 18px 18px",padding:"14px 16px",display:"flex",gap:5,alignItems:"center",boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
                    <div className="ai-tdot"/><div className="ai-tdot"/><div className="ai-tdot"/>
                  </div>
                </div>
              )}

              <div ref={bottomRef} style={{ height: 4 }} />
            </div>
          </div>

          {/* Input */}
          <div className="ai-bar">
            <div className="ai-bar-inner">
              <textarea
                ref={inputRef}
                className="ai-textarea"
                rows={1}
                placeholder="Ask me anything…"
                value={inputText}
                onChange={e => { setInputText(e.target.value); setInputLen(e.target.value.length); }}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                onKeyDown={e => { if (e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage(inputText);}}}
              />
              <div className="ai-bar-actions">
                <button className="ai-voice-btn"
                  onClick={() => setVoiceMode(true)}
                  onMouseEnter={() => setIsListening(true)}
                  onMouseLeave={() => setIsListening(false)}
                  aria-label="Voice conversation">
                  <Mic size={15} color="#888" strokeWidth={1.5}/>
                </button>
                <button className="ai-bar-btn ai-send" disabled={!inputText.trim()} onClick={() => sendMessage(inputText)} aria-label="Send">
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