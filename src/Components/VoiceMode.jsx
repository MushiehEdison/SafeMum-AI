import { useState, useEffect, useRef, useCallback } from "react";
import { X, Mic, MicOff, Volume2, VolumeX, PhoneOff, Globe } from "lucide-react";
import Mascot from "./Mascot/Mascot";
import API from "../API/axios"; // your axios instance

/* ─────────────────────────────────────────────────────────────
   LANGUAGE OPTIONS
───────────────────────────────────────────────────────────── */
const LANGUAGES = [
  { code: "en-NG", label: "English (Nigeria)",   whisper: "en" },
  { code: "en-GH", label: "English (Ghana)",     whisper: "en" },
  { code: "en-KE", label: "English (Kenya)",     whisper: "en" },
  { code: "en-ZA", label: "English (S. Africa)", whisper: "en" },
  { code: "fr-CM", label: "French (Cameroon)",   whisper: "fr" },
  { code: "fr-SN", label: "French (Senegal)",    whisper: "fr" },
  { code: "fr-FR", label: "French",              whisper: "fr" },
  { code: "sw-KE", label: "Swahili (Kenya)",     whisper: "sw" },
  { code: "sw-TZ", label: "Swahili (Tanzania)",  whisper: "sw" },
  { code: "pt-BR", label: "Portuguese (Brazil)", whisper: "pt" },
  { code: "ar-SA", label: "Arabic",              whisper: "ar" },
  { code: "en-US", label: "English (US)",        whisper: "en" },
];

/* ─────────────────────────────────────────────────────────────
   AUDIO RECORDING — MediaRecorder API
   Records in webm (Chrome) or mp4 (Safari) — Whisper handles both
───────────────────────────────────────────────────────────── */
function createRecorder(onDataAvailable) {
  return navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    // Pick the best supported format
    const mimeType = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/ogg;codecs=opus",
    ].find((m) => MediaRecorder.isTypeSupported(m)) || "";

    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
    const chunks   = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType || "audio/webm" });
      onDataAvailable(blob);
      stream.getTracks().forEach((t) => t.stop());
    };

    return recorder;
  });
}

/* ─────────────────────────────────────────────────────────────
   STT — send audio blob to Groq Whisper via backend
───────────────────────────────────────────────────────────── */
async function transcribeAudio(audioBlob, langCode) {
  const lang    = LANGUAGES.find((l) => l.code === langCode)?.whisper || "en";
  const formData = new FormData();
  formData.append("audio", audioBlob, `recording.webm`);
  formData.append("lang", lang);

 const res = await API.post("/api/voice/stt", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.text || "";
}

/* ─────────────────────────────────────────────────────────────
   TTS — get human-sounding audio from backend (edge-tts)
   Returns an HTMLAudioElement ready to play
───────────────────────────────────────────────────────────── */
async function fetchSpeech(text, langCode) {
  const res = await API.post(
    "/api/voice/tts",
    { text, lang: langCode },
    { responseType: "blob" }
  );
  const url   = URL.createObjectURL(res.data);
  const audio = new Audio(url);
  return { audio, url };
}

/* ─────────────────────────────────────────────────────────────
   VOICE MODE COMPONENT
───────────────────────────────────────────────────────────── */
export default function VoiceMode({ onClose, onSendMessage, defaultLang = "en-NG" }) {
  const [phase,          setPhase]          = useState("idle");
  // phase: "idle" | "listening" | "processing" | "speaking"
  const [liveTranscript, setLiveTranscript] = useState("");  // live Web Speech display
  const [aiText,         setAiText]         = useState("Tap the mic to speak");
  const [isMuted,        setIsMuted]        = useState(false);
  const [seconds,        setSeconds]        = useState(0);
  const [langCode,       setLangCode]       = useState(defaultLang);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [error,          setError]          = useState("");

  const timerRef      = useRef(null);
  const recorderRef   = useRef(null);
  const audioRef      = useRef(null);   // current HTMLAudioElement for TTS
  const audioUrlRef   = useRef(null);   // object URL to revoke on cleanup
  const liveRecogRef  = useRef(null);   // Web Speech for live display only
  const isMutedRef    = useRef(false);
  isMutedRef.current  = isMuted;

  // Session timer
  useEffect(() => {
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => {
      clearInterval(timerRef.current);
      stopAudio();
      recorderRef.current?.stop();
      liveRecogRef.current?.stop();
    };
  }, []);

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ── Stop current TTS audio ─────────────────────────────────────────────────
  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }

  // ── Live transcript display — Web Speech API (no accuracy requirement) ─────
  function startLiveTranscript(langCode) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const recog           = new SR();
    recog.lang            = langCode;
    recog.continuous      = true;
    recog.interimResults  = true;
    liveRecogRef.current  = recog;

    recog.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (!e.results[i].isFinal) interim += e.results[i][0].transcript;
      }
      setLiveTranscript(interim);
    };

    recog.onerror = () => {};  // silent — this is display only
    try { recog.start(); } catch (_) {}
  }

  function stopLiveTranscript() {
    try { liveRecogRef.current?.stop(); } catch (_) {}
    setLiveTranscript("");
  }

  // ── Start recording ────────────────────────────────────────────────────────
  const startListening = useCallback(async () => {
    setError("");
    setLiveTranscript("");
    setPhase("listening");
    startLiveTranscript(langCode);

    try {
      const recorder = await createRecorder(async (audioBlob) => {
        stopLiveTranscript();
        setPhase("processing");
        setAiText("Listening…");

        try {
          // ── Whisper transcription ──────────────────────────────────────
          const transcript = await transcribeAudio(audioBlob, langCode);
          if (!transcript) {
            setAiText("Tap the mic to speak");
            setPhase("idle");
            return;
          }

          setAiText("Thinking…");

          // ── Send to AI ─────────────────────────────────────────────────
          const reply      = await onSendMessage(transcript);
          const replyText  = reply?.text || "I'm here. Let me know if you need anything.";
          setAiText(replyText);

          if (isMutedRef.current) {
            setPhase("idle");
            return;
          }

          // ── edge-tts audio response ────────────────────────────────────
          setPhase("speaking");
          try {
            const { audio, url } = await fetchSpeech(replyText, langCode);
            audioRef.current   = audio;
            audioUrlRef.current = url;

            audio.onended = () => {
              stopAudio();
              setPhase("idle");
            };
            audio.onerror = () => {
              stopAudio();
              setPhase("idle");
            };
            audio.play();
          } catch (ttsErr) {
            console.error("[voice] TTS error:", ttsErr);
            setPhase("idle");
          }

        } catch (err) {
          console.error("[voice] Pipeline error:", err);
          setError("Something went wrong. Please try again.");
          setPhase("idle");
        }
      });

      recorderRef.current = recorder;
      recorder.start(200); // collect data every 200ms

    } catch (err) {
      console.error("[voice] Mic error:", err);
      setError("Could not access microphone. Please check permissions.");
      setPhase("idle");
    }
  }, [langCode, onSendMessage]);

  // ── Stop recording manually ────────────────────────────────────────────────
  const stopListening = useCallback(() => {
    recorderRef.current?.stop();
    stopLiveTranscript();
    // onstop fires → transcription starts
  }, []);

  // ── Mic button ─────────────────────────────────────────────────────────────
  const handleMicPress = () => {
    if (phase === "listening") {
      stopListening();
    } else if (phase === "speaking") {
      stopAudio();
      setPhase("idle");
    } else if (phase === "idle") {
      startListening();
    }
  };

  const isListening  = phase === "listening";
  const isSpeaking   = phase === "speaking";
  const isProcessing = phase === "processing";

  const mascotMood = isSpeaking ? "happy" : "idle";

  const statusText = isMuted
    ? "Microphone muted"
    : isListening
    ? liveTranscript || "Listening…"
    : isSpeaking
    ? aiText
    : isProcessing
    ? "Thinking…"
    : aiText;

  const selectedLang = LANGUAGES.find((l) => l.code === langCode) || LANGUAGES[0];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "#0c0b0a",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "space-between",
      padding: "max(env(safe-area-inset-top,44px),48px) 24px max(env(safe-area-inset-bottom,24px),32px)",
      animation: "vc-in .3s ease",
    }}>
      <style>{`
        @keyframes vc-in     { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ring-out  { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(1.9);opacity:0} }
        @keyframes txt-in    { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-proc{ 0%,100%{opacity:.4} 50%{opacity:1} }
        .vc-lang-pill:hover  { background: rgba(255,255,255,.12) !important; }
        .vc-lang-opt:hover   { background: rgba(255,255,255,.08) !important; }
      `}</style>

      {/* ── Top bar ── */}
      <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 0 3px rgba(74,222,128,.2)" }} />
          <span style={{ fontSize: 13, color: "#444", fontFamily: "'Manrope',sans-serif", fontWeight: 500 }}>
            Voice · {fmt(seconds)}
          </span>
        </div>

        {/* Language picker */}
        <div style={{ position: "relative" }}>
          <button className="vc-lang-pill" onClick={() => setShowLangPicker((p) => !p)} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 20, padding: "5px 12px", cursor: "pointer",
            color: "#aaa", fontSize: 12, fontFamily: "'Manrope',sans-serif",
            transition: "background .15s",
          }}>
            <Globe size={12} color="#aaa" />
            {selectedLang.label}
          </button>

          {showLangPicker && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              background: "#1a1917", border: "1px solid #2a2927",
              borderRadius: 12, padding: "6px 0", minWidth: 200,
              zIndex: 10, boxShadow: "0 8px 32px rgba(0,0,0,.6)",
            }}>
              {LANGUAGES.map((l) => (
                <button key={l.code} className="vc-lang-opt"
                  onClick={() => { setLangCode(l.code); setShowLangPicker(false); }}
                  style={{
                    width: "100%", textAlign: "left", padding: "9px 16px",
                    background: "transparent", border: "none", cursor: "pointer",
                    color: l.code === langCode ? "#fff" : "#777",
                    fontSize: 13, fontFamily: "'Manrope',sans-serif",
                    fontWeight: l.code === langCode ? 600 : 400,
                    transition: "background .1s",
                  }}>
                  {l.label}
                  {l.code === langCode && <span style={{ marginLeft: 8, color: "#4ade80", fontSize: 10 }}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={onClose} style={{
          width: 36, height: 36, borderRadius: 10,
          background: "#1a1917", border: "1px solid #2a2927",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <X size={15} color="#555" />
        </button>
      </div>

      {/* ── Mascot + status ── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, flex: 1, justifyContent: "center" }}>
        <div style={{ position: "relative" }}>
          {isListening && (<>
            <div style={{ position: "absolute", inset: -20, borderRadius: "60%", border: "1.5px solid rgba(99,102,241,.35)", animation: "ring-out 1.8s linear infinite", pointerEvents: "none" }} />
            <div style={{ position: "absolute", inset: -20, borderRadius: "60%", border: "1.5px solid rgba(99,102,241,.2)", animation: "ring-out 1.8s linear .6s infinite", pointerEvents: "none" }} />
          </>)}
          {isSpeaking && (
            <div style={{ position: "absolute", inset: -20, borderRadius: "60%", border: "1.5px solid rgba(74,222,128,.3)", animation: "ring-out 1.4s linear infinite", pointerEvents: "none" }} />
          )}
          <Mascot mood={mascotMood} message="" position="center" size={140} />
        </div>

        <p key={phase + aiText.slice(0, 20)} style={{
          fontFamily: "'Fraunces',serif", fontStyle: "italic",
          fontSize: "clamp(15px,4vw,20px)", fontWeight: 300,
          color: isMuted ? "#333" : isProcessing ? "#555" : "#777",
          textAlign: "center", maxWidth: 300, lineHeight: 1.55,
          animation: isProcessing ? "pulse-proc 1.5s infinite" : "txt-in .4s ease",
          marginBottom: 12,
        }}>
          {statusText}
        </p>

        {error && (
          <p style={{ fontSize: 12, color: "#f87171", fontFamily: "'Manrope',sans-serif", textAlign: "center", maxWidth: 280 }}>
            {error}
          </p>
        )}
      </div>

      {/* ── Controls ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, justifyContent: "center", width: "100%" }}>
        {/* Mute */}
        <button onClick={() => { setIsMuted((m) => !m); if (isSpeaking) { stopAudio(); setPhase("idle"); } }}
          style={{
            width: 54, height: 54, borderRadius: "50%",
            background: isMuted ? "#dc2626" : "#1a1917",
            border: `1px solid ${isMuted ? "#dc2626" : "#2a2927"}`,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all .2s",
          }}>
          {isMuted
            ? <VolumeX size={20} color="#fff" strokeWidth={1.5} />
            : <Volume2 size={20} color="#555" strokeWidth={1.5} />}
        </button>

        {/* Mic */}
        <button onClick={handleMicPress} disabled={isProcessing}
          style={{
            width: 80, height: 80, borderRadius: "50%",
            background: isListening ? "#dc2626" : isSpeaking ? "#4ade80" : "#fff",
            border: "none", cursor: isProcessing ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: isListening
              ? "0 0 0 8px rgba(220,38,38,.15),0 8px 32px rgba(220,38,38,.3)"
              : isSpeaking
              ? "0 0 0 8px rgba(74,222,128,.15),0 8px 32px rgba(74,222,128,.2)"
              : "0 8px 32px rgba(255,255,255,.15)",
            transition: "all .2s",
            opacity: isProcessing ? 0.5 : 1,
          }}>
          {isListening
            ? <MicOff size={30} color="#fff" strokeWidth={1.5} />
            : <Mic    size={30} color="#111" strokeWidth={1.5} />}
        </button>

        {/* End */}
        <button onClick={onClose}
          style={{
            width: 54, height: 54, borderRadius: "50%",
            background: "#1a1917", border: "1px solid #2a2927",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background .2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#dc2626")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#1a1917")}>
          <PhoneOff size={20} color="#555" strokeWidth={1.5} />
        </button>
      </div>

      <p style={{ marginTop: 16, fontSize: 11, color: "#333", fontFamily: "'Manrope',sans-serif", textAlign: "center" }}>
        {isListening ? "Tap mic to stop · Speak naturally" : isSpeaking ? "Tap to stop · Tap end to close" : "Tap mic to speak · Change language above"}
      </p>
    </div>
  );
}