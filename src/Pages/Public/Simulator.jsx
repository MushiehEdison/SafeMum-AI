import { useState, useRef, useEffect } from "react";
import { Phone, PhoneOff, PhoneCall, Loader, Mic, MicOff, Delete, Send, Signal, Battery, Wifi } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function generateId(prefix) {
  return prefix + "-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}
function resolveUrl(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return API_BASE + url;
}

const C = {
  bg: "#FAFAFA",
  white: "#FFFFFF",
  border: "#E8E8E8",
  borderMid: "#D0D0D0",
  text: "#111111",
  muted: "#999999",
  dim: "#CCCCCC",
  accent: "#2563EB",
  accentBg: "#EFF6FF",
  danger: "#DC2626",
  dangerBg: "#FEF2F2",
  surface: "#F5F5F5",
};

export default function PhoneSimulator() {
  const [activeTab, setActiveTab] = useState("ussd");
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })), 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 20px",
      fontFamily: "'DM Mono', 'Courier New', monospace",
      position: "relative",
      background: C.bg,
      // Dot grid pattern
      backgroundImage: "radial-gradient(circle, #CCCCCC 1px, transparent 1px)",
      backgroundSize: "22px 22px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Inter:wght@300;400;500;600&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes wave { 0%{height:3px} 100%{height:16px} }
        @keyframes slide-in { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-ring { 0%,100%{opacity:0.6} 50%{opacity:1} }
        .kb:hover { background: #F0F0F0 !important; }
        .kb:active { background: #E5E5E5 !important; transform: scale(0.96); }
        .tab-btn { transition: all 0.18s ease; }
        input#ussd-text-input:focus { outline: none; border-color: ${C.accent} !important; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #DDD; border-radius: 2px; }
      `}</style>

      <div style={{
        width: "320px",
        background: C.white,
        borderRadius: "44px",
        border: `1px solid ${C.border}`,
        boxShadow: "0 4px 6px rgba(0,0,0,0.04), 0 24px 48px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}>
        {/* Notch */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: "16px", paddingBottom: "6px" }}>
          <div style={{ width: "70px", height: "4px", background: C.border, borderRadius: "2px" }} />
        </div>

        {/* Status bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px 10px", fontFamily: "'Inter', sans-serif" }}>
          <span style={{ fontSize: "11px", color: C.muted, fontWeight: 500 }}>{time}</span>
          <span style={{ fontSize: "9px", color: C.muted, letterSpacing: "0.14em", textTransform: "uppercase" }}>SafeMum</span>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <Signal size={11} color={C.muted} />
            <Wifi size={11} color={C.muted} />
            <Battery size={11} color={C.muted} />
          </div>
        </div>

        {/* Screen */}
        <div style={{
          margin: "0 12px",
          background: C.white,
          borderRadius: "24px",
          border: `1px solid ${C.border}`,
          overflow: "hidden",
          minHeight: "340px",
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Tabs */}
          <div style={{ display: "flex", padding: "6px", gap: "4px", borderBottom: `1px solid ${C.border}` }}>
            {["ussd", "call"].map(tab => (
              <button key={tab} className="tab-btn" onClick={() => setActiveTab(tab)} style={{
                flex: 1, padding: "7px 0", border: "none", borderRadius: "14px",
                background: activeTab === tab ? C.accent : "transparent",
                color: activeTab === tab ? "#fff" : C.muted,
                fontSize: "10px", fontWeight: 600, cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                letterSpacing: "0.1em", textTransform: "uppercase",
              }}>
                {tab === "ussd" ? "USSD" : "Voice"}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflow: "hidden" }}>
            {activeTab === "ussd" ? <USSDScreen /> : <CallScreen />}
          </div>
        </div>

        {/* Keypad */}
        <Keypad
          onKeyPress={k => window.dispatchEvent(new CustomEvent("phone-keypress", { detail: k }))}
          onClear={() => window.dispatchEvent(new CustomEvent("phone-clear"))}
          onDial={() => window.dispatchEvent(new CustomEvent("phone-dial"))}
          onEnd={() => window.dispatchEvent(new CustomEvent("phone-end"))}
          onSendText={() => window.dispatchEvent(new CustomEvent("phone-send-text"))}
        />

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "10px 0 18px", fontFamily: "'Inter', sans-serif" }}>
          <span style={{ fontSize: "9px", color: C.dim, letterSpacing: "0.16em", textTransform: "uppercase" }}>SafeMum AI</span>
        </div>
      </div>
    </div>
  );
}

function Keypad({ onKeyPress, onClear, onDial, onEnd, onSendText }) {
  const keys = ["1","2","3","4","5","6","7","8","9","*","0","#"];
  const sub = { "2":"ABC","3":"DEF","4":"GHI","5":"JKL","6":"MNO","7":"PQRS","8":"TUV","9":"WXYZ","0":"+" };

  return (
    <div style={{ padding: "14px 16px 8px" }}>
      {/* Text input */}
      <div id="ussd-text-input-area" style={{ display: "none", marginBottom: "10px" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          <input id="ussd-text-input" type="text" placeholder="Type your reply..."
            style={{
              flex: 1, height: "40px", background: C.surface,
              border: `1px solid ${C.border}`, borderRadius: "12px",
              padding: "0 12px", fontSize: "12px", color: C.text,
              fontFamily: "'DM Mono', monospace",
            }}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); onSendText(); } }}
          />
          <button onClick={onSendText} style={{
            height: "40px", padding: "0 14px", borderRadius: "12px",
            background: C.accent, border: "none", color: "#fff",
            fontSize: "11px", fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: "4px",
            fontFamily: "'Inter', sans-serif",
          }}>
            <Send size={12} /> Send
          </button>
        </div>
      </div>

      {/* Numpad */}
      <div id="ussd-numpad" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", marginBottom: "8px" }}>
        {keys.map(k => (
          <button key={k} className="kb" onClick={() => onKeyPress(k)} style={{
            height: "48px", border: `1px solid ${C.border}`, borderRadius: "14px",
            background: C.white, color: C.text, cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1px",
            transition: "all 0.07s ease",
          }}>
            <span style={{ fontSize: "17px", fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>{k}</span>
            {sub[k] && <span style={{ fontSize: "7px", color: C.muted, letterSpacing: "0.1em", fontFamily: "'Inter', sans-serif" }}>{sub[k]}</span>}
          </button>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
        <button onClick={onDial} style={{
          height: "48px", borderRadius: "16px", background: C.accent, border: "none",
          color: "#fff", fontSize: "11px", fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
          fontFamily: "'Inter', sans-serif",
        }}>
          <Phone size={13} strokeWidth={2.5} /> Dial
        </button>
        <button onClick={onClear} className="kb" style={{
          height: "48px", borderRadius: "16px", background: C.white,
          border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.07s ease",
        }}>
          <Delete size={15} strokeWidth={1.5} />
        </button>
        <button onClick={onEnd} style={{
          height: "48px", borderRadius: "16px",
          background: C.dangerBg, border: `1px solid #FCA5A5`,
          color: C.danger, fontSize: "11px", fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
          fontFamily: "'Inter', sans-serif",
        }}>
          <PhoneOff size={13} strokeWidth={2.5} /> End
        </button>
      </div>
    </div>
  );
}

function USSDScreen() {
  const [screen,      setScreen]      = useState("Dial *384*57# to begin");
  const [sessionId,   setSessionId]   = useState(null);
  const [phoneNumber]                 = useState("+237653288958");
  const [serviceCode, setServiceCode] = useState("*384*57#");
  const [inputBuffer, setInputBuffer] = useState("");
  const [history,     setHistory]     = useState([]);
  const [isActive,    setIsActive]    = useState(false);
  const [isEnded,     setIsEnded]     = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [isFreeText,  setIsFreeText]  = useState(false);
  const [msgKey,      setMsgKey]      = useState(0);

  useEffect(() => {
    if (!isActive || isEnded) { setIsFreeText(false); return; }
    const lower = screen.toLowerCase();
    const triggers = [
      "describe","share","how are you","feeling","type your","town","county","area","concern",
      "ville","cidade","comment","como",
      "reply to continue","reply to","type to continue","send a message","write your",
      "enter your message","enter a message","please type","please reply","respond with",
      "tell us","tell me","your response","your message","your reply",
    ];
    // Also detect when screen has "0. End | Reply to continue" style pattern — no numbered menu items
    const hasReplyPrompt = /reply\s+to\s+continue/i.test(screen) || /0\.\s*end\s*[\|\/]\s*reply/i.test(screen);
    const needsFree = hasReplyPrompt || (triggers.some(t => lower.includes(t)) && !lower.match(/^\d+\./m));
    setIsFreeText(needsFree);
    const ta = document.getElementById("ussd-text-input-area");
    const np = document.getElementById("ussd-numpad");
    if (needsFree) {
      if (ta) ta.style.display = "block";
      if (np) np.style.display = "none";
      setTimeout(() => { const inp = document.getElementById("ussd-text-input"); if (inp) inp.focus(); }, 100);
    } else {
      if (ta) ta.style.display = "none";
      if (np) np.style.display = "grid";
    }
  }, [screen, isActive, isEnded]);

  useEffect(() => {
    function onKeyPress(e) {
      if (!isActive || isEnded) { setServiceCode(p => p + e.detail); return; }
      if (isFreeText) { const inp = document.getElementById("ussd-text-input"); if (inp) { inp.value += e.detail; inp.focus(); } return; }
      setInputBuffer(p => p + e.detail);
    }
    function onClear() {
      if (!isActive || isEnded) { setServiceCode(p => p.slice(0, -1) || ""); return; }
      if (isFreeText) { const inp = document.getElementById("ussd-text-input"); if (inp) inp.value = inp.value.slice(0, -1); return; }
      setInputBuffer(p => p.slice(0, -1));
    }
    function onDial() { if (!isActive) dialUSSD(); else sendUSSD(); }
    function onEnd() { resetUSSD(); }
    function onSendText() {
      if (!isFreeText) return;
      const inp = document.getElementById("ussd-text-input");
      if (!inp || !inp.value.trim()) return;
      const val = inp.value.trim();
      inp.value = "";
      const newHist = [...history, val];
      setHistory(newHist);
      setLoading(true);
      postUSSD(newHist.join("*"))
        .then(processUSSD)
        .catch(() => setScreen("Network error. Is your server running?"))
        .finally(() => setLoading(false));
    }
    window.addEventListener("phone-keypress", onKeyPress);
    window.addEventListener("phone-clear", onClear);
    window.addEventListener("phone-dial", onDial);
    window.addEventListener("phone-end", onEnd);
    window.addEventListener("phone-send-text", onSendText);
    return () => {
      window.removeEventListener("phone-keypress", onKeyPress);
      window.removeEventListener("phone-clear", onClear);
      window.removeEventListener("phone-dial", onDial);
      window.removeEventListener("phone-end", onEnd);
      window.removeEventListener("phone-send-text", onSendText);
    };
  }, [isActive, isEnded, inputBuffer, history, sessionId, loading, isFreeText]);

  useEffect(() => {
    function onKey(e) {
      if (isFreeText) return;
      if (e.key === "Enter") { e.preventDefault(); if (!isActive) dialUSSD(); else sendUSSD(); }
      else if (e.key === "Backspace") {
        if (!isActive || isEnded) setServiceCode(p => p.slice(0, -1) || "");
        else setInputBuffer(p => p.slice(0, -1));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isActive, isEnded, inputBuffer, history, sessionId, loading, isFreeText]);

  async function postUSSD(text, sid) {
    const id = sid || sessionId;
    const res = await fetch(`${API_BASE}/ussd/callback`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ sessionId: id, phoneNumber, serviceCode, text }).toString(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  }

  async function dialUSSD() {
    if (!serviceCode.trim()) return;
    const newId = generateId("SIM");
    setSessionId(newId);
    setLoading(true);
    setScreen("Connecting...");
    try {
      const r = await postUSSD("", newId);
      processUSSD(r);
      setIsActive(true);
      setIsEnded(false);
      setHistory([]);
    } catch { setScreen("Network error.\nIs your server running?"); }
    finally { setLoading(false); }
  }

  async function sendUSSD() {
    if (!inputBuffer.trim() || loading || isEnded) return;
    const newHist = [...history, inputBuffer.trim()];
    setHistory(newHist);
    setInputBuffer("");
    setLoading(true);
    try {
      const r = await postUSSD(newHist.join("*"));
      processUSSD(r);
    } catch { setScreen("Network error.\nPlease try again."); }
    finally { setLoading(false); }
  }

  function processUSSD(raw) {
    if (!raw) { setScreen("No response."); return; }
    let txt = raw, ended = false;
    if (raw.startsWith("CON "))      { txt = raw.substring(4); }
    else if (raw.startsWith("END ")) { txt = raw.substring(4); ended = true; }
    else if (raw.startsWith("CON"))  { txt = raw.substring(3); }
    else if (raw.startsWith("END"))  { txt = raw.substring(3); ended = true; }

    // Only replace bare "0 to exit" when NOT paired with a "reply to continue" alternative
    if (!/reply\s+to\s+continue/i.test(txt)) {
      txt = txt
        .replace(/\b0[\s.]*to\s+exit\b/gi, "1 to continue")
        .replace(/^0[.):]\s*(exit|quit|back|return)\s*$/gim, "1. Continue");
    }

    setScreen(txt);
    setIsEnded(ended);
    setMsgKey(k => k + 1);
  }

  function resetUSSD() {
    setIsActive(false); setIsEnded(false); setSessionId(null);
    setInputBuffer(""); setHistory([]); setIsFreeText(false);
    setScreen("Dial *384*57# to begin"); setServiceCode("*384*57#");
    setMsgKey(k => k + 1);
    const ta = document.getElementById("ussd-text-input-area");
    const np = document.getElementById("ussd-numpad");
    if (ta) ta.style.display = "none";
    if (np) np.style.display = "grid";
  }

  return (
    <div style={{
      padding: "14px 16px", color: C.text, fontSize: "13px", lineHeight: "1.75",
      whiteSpace: "pre-wrap", wordBreak: "break-word",
      fontFamily: "'DM Mono', monospace", height: "100%",
      overflowY: "auto", position: "relative", minHeight: "260px",
      display: "flex", flexDirection: "column",
    }}>
      {/* Badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px", fontFamily: "'Inter', sans-serif" }}>
        <div style={{
          width: "5px", height: "5px", borderRadius: "50%",
          background: isActive && !isEnded ? C.accent : C.dim,
          animation: isActive && !isEnded ? "pulse-ring 2s ease-in-out infinite" : "none",
        }} />
        <span style={{ fontSize: "9px", color: C.muted, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {isActive && !isEnded ? "Session active" : isEnded ? "Ended" : "USSD"}
        </span>
      </div>

      {/* Screen content */}
      <div key={msgKey} style={{ flex: 1, animation: "slide-in 0.2s ease" }}>
        {screen}
      </div>

      {/* Code input */}
      {!isActive && (
        <div style={{ marginTop: "14px", padding: "10px 12px", background: C.surface, borderRadius: "10px", border: `1px solid ${C.border}` }}>
          <span style={{ color: C.accent }}>{serviceCode}</span>
          <span style={{ borderLeft: `1.5px solid ${C.accent}`, marginLeft: "1px", animation: "blink 1s step-end infinite" }}>&nbsp;</span>
        </div>
      )}

      {isActive && !isEnded && !isFreeText && (
        <div style={{ marginTop: "10px", padding: "8px 12px", background: C.surface, borderRadius: "10px", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ color: C.muted, fontSize: "12px" }}>›</span>
          <span>{inputBuffer}</span>
          <span style={{ borderLeft: `1.5px solid ${C.text}`, animation: "blink 1s step-end infinite" }}>&nbsp;</span>
        </div>
      )}

      {loading && (
        <div style={{ position: "absolute", bottom: "12px", right: "14px", display: "flex", alignItems: "center", gap: "5px", color: C.muted, fontSize: "10px", fontFamily: "'Inter', sans-serif" }}>
          <Loader size={10} style={{ animation: "spin 1s linear infinite" }} /> Waiting
        </div>
      )}

      {isEnded && (
        <div style={{ marginTop: "12px", padding: "8px 12px", background: C.dangerBg, border: `1px solid #FCA5A5`, borderRadius: "10px", fontSize: "10px", fontFamily: "'Inter', sans-serif", letterSpacing: "0.08em", textTransform: "uppercase", color: C.danger, display: "flex", alignItems: "center", gap: "5px" }}>
          <PhoneOff size={10} /> Session ended
        </div>
      )}
    </div>
  );
}

function CallScreen() {
  const [status,      setStatus]      = useState("idle");
  const [screenMsg,   setScreenMsg]   = useState("Dial to connect");
  const [sessionId,   setSessionId]   = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [callbackUrl, setCallbackUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [lang,        setLang]        = useState("en");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef   = useRef([]);
  const currentAudioRef  = useRef(null);

  useEffect(() => {
    function onDial() { dialCall(); }
    function onEnd()  { endCall(); }
    window.addEventListener("phone-dial", onDial);
    window.addEventListener("phone-end",  onEnd);
    return () => {
      window.removeEventListener("phone-dial", onDial);
      window.removeEventListener("phone-end",  onEnd);
    };
  }, [sessionId, callbackUrl, status]);

  async function speakText(text, langCode, onDone) {
    try {
      if (currentAudioRef.current) { currentAudioRef.current.pause(); currentAudioRef.current = null; }
      const res = await fetch(`${API_BASE}/voice/tts`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang: langCode }),
      });
      if (!res.ok) throw new Error("TTS failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      currentAudioRef.current = audio;
      audio.onended = () => { URL.revokeObjectURL(url); currentAudioRef.current = null; if (onDone) onDone(); };
      audio.onerror = () => { URL.revokeObjectURL(url); currentAudioRef.current = null; if (onDone) onDone(); };
      audio.play();
    } catch {
      if ("speechSynthesis" in window) { const u = new SpeechSynthesisUtterance(text); u.onend = onDone; window.speechSynthesis.speak(u); }
      else { if (onDone) onDone(); }
    }
  }

  function handleVoiceResponse(xmlText) {
    const doc = new DOMParser().parseFromString(xmlText, "text/xml");
    if (doc.querySelector("parsererror")) { setScreenMsg("Invalid response."); setStatus("ended"); return; }
    const sayEl = doc.querySelector("Say");
    const getDigits = doc.querySelector("GetDigits");
    const record = doc.querySelector("Record");
    if (getDigits) setCallbackUrl(resolveUrl(getDigits.getAttribute("callbackUrl")));
    if (record)    setCallbackUrl(resolveUrl(record.getAttribute("callbackUrl")));
    if (doc.querySelector("Hangup")) { setStatus("ended"); setScreenMsg("Call ended."); return; }
    if (sayEl) {
      const text = sayEl.textContent.trim();
      setScreenMsg(text); setStatus("speaking");
      speakText(text, lang, () => {
        if (getDigits) setStatus("listening");
        else if (record) setStatus("recording");
      });
    } else {
      if (getDigits) setStatus("listening");
      else if (record) setStatus("recording");
    }
  }

  async function dialCall() {
    const newId = generateId("CALL");
    setSessionId(newId); setStatus("calling"); setScreenMsg("Connecting..."); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/voice/answer`, {
        method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ sessionId: newId, callerNumber: "+237653288958" }).toString(),
      });
      handleVoiceResponse(await res.text());
    } catch { setScreenMsg("Network error.\nIs your server running?"); setStatus("ended"); }
    finally { setLoading(false); }
  }

  async function sendDTMF(digit) {
    if (!callbackUrl || status !== "listening") return;
    if (digit === "2") setLang("fr");
    else if (digit === "3") setLang("pt");
    else if (digit === "1") setLang("en");
    setLoading(true);
    try {
      const res = await fetch(callbackUrl, {
        method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ sessionId, callerNumber: "+237653288958", dtmfDigits: digit, isActive: "1" }).toString(),
      });
      handleVoiceResponse(await res.text());
    } catch { setScreenMsg("Network error."); }
    finally { setLoading(false); }
  }

  function startRecording() {
    if (!navigator.mediaDevices) { setScreenMsg("Microphone not supported."); return; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = e => audioChunksRef.current.push(e.data);
      recorder.onstop = () => submitRecording(new Blob(audioChunksRef.current, { type: "audio/webm" }));
      recorder.start();
      setIsRecording(true);
      setScreenMsg("Recording...\nTap mic again to stop.");
    }).catch(() => setScreenMsg("Microphone access denied."));
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  }

  async function submitRecording(blob) {
    if (!callbackUrl) return;
    setLoading(true); setScreenMsg("Transcribing...");
    try {
      const fd = new FormData();
      fd.append("audio", blob, "recording.webm");
      fd.append("lang", lang);
      const sttRes = await fetch(`${API_BASE}/voice/stt`, { method: "POST", body: fd });
      const sttData = await sttRes.json();
      const transcript = sttData.text || "";
      setScreenMsg(`You said:\n"${transcript}"\n\nProcessing...`);
      const res = await fetch(callbackUrl, {
        method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ sessionId, callerNumber: "+237653288958", isActive: "1", transcriptionText: transcript }).toString(),
      });
      handleVoiceResponse(await res.text());
    } catch {
      try {
        const res = await fetch(callbackUrl, {
          method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ sessionId, callerNumber: "+237653288958", isActive: "1", transcriptionText: "" }).toString(),
        });
        handleVoiceResponse(await res.text());
      } catch { setScreenMsg("Network error."); }
    } finally { setLoading(false); }
  }

  function endCall() {
    if (currentAudioRef.current) { currentAudioRef.current.pause(); currentAudioRef.current = null; }
    if (sessionId) {
      fetch(`${API_BASE}/voice/hangup`, {
        method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ sessionId }).toString(),
      }).catch(() => {});
    }
    setStatus("ended"); setScreenMsg("Call ended.");
    setSessionId(null); setCallbackUrl(null); setIsRecording(false);
  }

  const statusConfig = {
    idle:      { label: "Ready to dial",            color: C.muted },
    calling:   { label: "Dialing...",               color: C.accent },
    speaking:  { label: "SafeMum is speaking",      color: C.accent },
    listening: { label: "Awaiting your input",      color: C.text },
    recording: { label: isRecording ? "Tap mic to stop" : "Tap mic to speak", color: C.danger },
    ended:     { label: "Disconnected",             color: C.muted },
  };
  const cfg = statusConfig[status] || statusConfig.idle;

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "space-between", minHeight: "260px", padding: "24px 20px 20px", gap: "14px",
    }}>
      {/* Icon ring */}
      <div style={{
        width: "60px", height: "60px", borderRadius: "50%",
        border: `1.5px solid ${status === "idle" || status === "ended" ? C.border : status === "recording" ? "#FCA5A5" : C.accent}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: status === "speaking" ? C.accentBg : status === "recording" ? C.dangerBg : C.surface,
        transition: "all 0.3s ease",
      }}>
        {status === "idle"      && <PhoneCall size={22} color={C.muted} strokeWidth={1.5} />}
        {status === "calling"   && <Loader size={22} color={C.accent} strokeWidth={1.5} style={{ animation: "spin 1s linear infinite" }} />}
        {status === "speaking"  && <WaveformAnimation />}
        {status === "listening" && <span style={{ fontSize: "19px", fontFamily: "'DM Mono', monospace", color: C.text }}>#</span>}
        {status === "recording" && (
          <button onClick={isRecording ? stopRecording : startRecording} style={{ border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
            {isRecording ? <MicOff size={22} color={C.danger} strokeWidth={1.5} /> : <Mic size={22} color={C.muted} strokeWidth={1.5} />}
          </button>
        )}
        {status === "ended"     && <PhoneOff size={22} color={C.muted} strokeWidth={1.5} />}
      </div>

      <p style={{ fontSize: "13px", lineHeight: "1.7", whiteSpace: "pre-wrap", maxWidth: "220px", color: C.text, textAlign: "center", margin: 0, fontFamily: "'DM Mono', monospace", flex: 1 }}>
        {screenMsg}
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        {loading && <Loader size={10} color={C.accent} style={{ animation: "spin 1s linear infinite" }} />}
        <span style={{ fontSize: "9px", color: cfg.color, textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "'Inter', sans-serif" }}>
          {cfg.label}
        </span>
      </div>

      {status === "listening" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "4px" }}>
          {["1","2","3","4","5","6","7","8","9","*","0","#"].map(d => (
            <button key={d} onClick={() => sendDTMF(d)} className="kb" style={{
              width: "38px", height: "32px", borderRadius: "8px",
              background: C.white, border: `1px solid ${C.border}`,
              color: C.text, fontSize: "13px", cursor: "pointer",
              fontFamily: "'DM Mono', monospace", transition: "all 0.07s ease",
            }}>{d}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function WaveformAnimation() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "3px", height: "22px" }}>
      {[0,1,2,3,4].map(i => (
        <div key={i} style={{
          width: "3px", background: C.accent, borderRadius: "2px",
          animation: `wave 0.55s ease-in-out ${i * 0.1}s infinite alternate`,
        }} />
      ))}
    </div>
  );
}