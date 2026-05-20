import { useState } from "react";
import { Send, ArrowRight, MessageCircle } from "lucide-react";

const MOOD_OPTIONS = [
  { label: "I have been really struggling", color: "red"   },
  { label: "It has been up and down",       color: "gray"  },
  { label: "A little better than before",   color: "green" },
  { label: "I am doing okay today",         color: "green" },
];

const AI_FOLLOWUPS = {
  "I have been really struggling":
    "I am really sorry to hear that. You do not have to carry this alone. Can you tell me a little more about what has been hard?",
  "It has been up and down":
    "That is completely normal after what you have been through. Some days are harder than others. What has today been like so far?",
  "A little better than before":
    "That is something to hold on to. Even small progress matters. What do you think has been helping?",
  "I am doing okay today":
    "I am really glad to hear that. You have shown a lot of strength. Is there anything on your mind you want to talk about?",
};

const DUMMY_HISTORY = [
  { id: 1, date: "2026-05-17", mood: "A little better than before",   note: "I went for a short walk today. It helped a little.", color: "green" },
  { id: 2, date: "2026-05-14", mood: "I have been really struggling",  note: "Could not sleep. Kept thinking about everything.",   color: "red"   },
  { id: 3, date: "2026-05-11", mood: "It has been up and down",        note: null,                                                color: "gray"  },
];

const DOT_COLOR = { green: "#22c55e", gray: "#94a3b8", red: "#ef4444" };

function fmtDate(str) {
  return new Date(str).toLocaleDateString("en-GB", { day: "numeric", month: "long" });
}

const s = {
  sectionTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: "clamp(26px, 5vw, 38px)",
    fontWeight: 600,
    color: "#111",
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
    marginBottom: 6,
  },
  sectionSub: {
    fontSize: 13,
    color: "#aaa",
    fontWeight: 300,
    marginBottom: 28,
    fontFamily: "'Manrope', sans-serif",
  },
  aiBubble: {
    maxWidth: "80%",
    padding: "13px 16px",
    fontSize: 14,
    lineHeight: 1.65,
    background: "#fff",
    border: "1px solid #e8e6e1",
    color: "#111",
    borderRadius: "4px 18px 18px 18px",
    fontFamily: "'Manrope', sans-serif",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  userBubble: {
    maxWidth: "80%",
    padding: "13px 16px",
    fontSize: 14,
    lineHeight: 1.65,
    background: "#111",
    color: "#fff",
    borderRadius: "18px 4px 18px 18px",
    fontFamily: "'Manrope', sans-serif",
  },
  avatar: {
    width: 30, height: 30, borderRadius: "50%", background: "#111",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, marginRight: 9, marginTop: 2,
    fontSize: 9, color: "#fff", fontWeight: 700, letterSpacing: "0.05em",
  },
  moodBtn: (selected) => ({
    padding: "10px 18px", fontSize: 13,
    border: selected ? "1.5px solid #16a34a" : "1.5px solid #e5e7eb",
    borderRadius: 24, background: selected ? "#f0fdf4" : "transparent",
    color: selected ? "#16a34a" : "#111",
    cursor: "pointer", fontFamily: "'Manrope', sans-serif",
    transition: "all 0.15s",
  }),
  textarea: {
    width: "100%", resize: "none", border: "1.5px solid #e5e7eb",
    borderRadius: 16, padding: "13px 16px", fontSize: 14, color: "#111",
    fontFamily: "'Manrope', sans-serif", outline: "none",
    boxSizing: "border-box", lineHeight: 1.65, background: "#fff",
  },
  sendBtn: {
    display: "flex", alignItems: "center", gap: 7, padding: "10px 18px",
    background: "#111", color: "#fff", border: "none", borderRadius: 12,
    fontSize: 13, cursor: "pointer", fontFamily: "'Manrope', sans-serif", fontWeight: 600,
  },
  label: {
    fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
    textTransform: "uppercase", color: "#bbb", marginBottom: 16,
    fontFamily: "'Manrope', sans-serif",
  },
};

export default function CheckInTab() {
  const [selectedMood, setSelectedMood]   = useState(null);
  const [messages, setMessages]           = useState([
    { sender: "ai", text: "Welcome back, Sarah. I am glad you are here. How are you feeling today compared to yesterday?" },
  ]);
  const [followInput, setFollowInput]     = useState("");
  const [submitted, setSubmitted]         = useState(false);
  const [talkInput, setTalkInput]         = useState("");
  const [talkSent, setTalkSent]           = useState(false);

  function pickMood(mood) {
    if (selectedMood) return;
    setSelectedMood(mood.label);
    setMessages(prev => [
      ...prev,
      { sender: "user", text: mood.label },
      { sender: "ai", text: AI_FOLLOWUPS[mood.label] },
    ]);
  }

  function sendFollow() {
    if (!followInput.trim()) return;
    const t = followInput.trim();
    setFollowInput("");
    setMessages(prev => [
      ...prev,
      { sender: "user", text: t },
      { sender: "ai", text: "Thank you for sharing that with me. I have noted how you are feeling today. Take care of yourself today." },
    ]);
    setSubmitted(true);
  }

  function sendTalk() {
    if (!talkInput.trim()) return;
    setTalkInput(""); setTalkSent(true);
    setTimeout(() => setTalkSent(false), 4000);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

      {/* Title */}
      <div>
        <p style={s.sectionTitle}>How are you<br /><em style={{ fontStyle: "italic", fontWeight: 400, color: "#555" }}>today?</em></p>
        <p style={s.sectionSub}>Take a moment. There is no rush here.</p>
      </div>

      {/* Chat thread */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start", alignItems: "flex-start" }}>
            {msg.sender === "ai" && <div style={s.avatar}>AI</div>}
            <div style={msg.sender === "ai" ? s.aiBubble : s.userBubble}>{msg.text}</div>
          </div>
        ))}
      </div>

      {/* Mood pills */}
      {!selectedMood && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {MOOD_OPTIONS.map(m => (
            <button key={m.label} onClick={() => pickMood(m)} style={s.moodBtn(false)}>
              {m.label}
            </button>
          ))}
        </div>
      )}

      {/* Follow-up input */}
      {selectedMood && !submitted && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <textarea value={followInput} onChange={e => setFollowInput(e.target.value)} rows={4}
            placeholder="Take your time. Write as little or as much as you want."
            style={s.textarea}
          />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={sendFollow} style={s.sendBtn}>
              <Send size={13} strokeWidth={2} /> Send
            </button>
          </div>
        </div>
      )}

      {/* Journey timeline */}
      {submitted && (
        <div>
          <p style={s.label}>Your journey</p>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {DUMMY_HISTORY.map((item, i) => (
              <div key={item.id} style={{ display: "flex", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: DOT_COLOR[item.color], flexShrink: 0, marginTop: 5 }} />
                  {i < DUMMY_HISTORY.length - 1 && <div style={{ width: 1, flex: 1, background: "#e8e6e1", margin: "5px 0" }} />}
                </div>
                <div style={{ paddingBottom: 22, flex: 1 }}>
                  <p style={{ fontSize: 11, color: "#bbb", marginBottom: 3, fontFamily: "'Manrope', sans-serif" }}>{fmtDate(item.date)}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#111", marginBottom: 5, fontFamily: "'Manrope', sans-serif" }}>{item.mood}</p>
                  {item.note && <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, fontFamily: "'Manrope', sans-serif" }}>{item.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Talk card */}
      <div style={{ background: "#fff", border: "1.5px solid #e8e6e1", borderRadius: 20, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <MessageCircle size={16} color="#9ca3af" strokeWidth={1.5} />
          <p style={{ fontSize: 14, fontWeight: 600, color: "#111", fontFamily: "'Manrope', sans-serif" }}>Need to talk more?</p>
        </div>
        <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.65, fontFamily: "'Manrope', sans-serif" }}>
          Start a private conversation with the AI. It is here to listen, not to judge.
        </p>
        {talkSent ? (
          <p style={{ fontSize: 13, color: "#16a34a", fontWeight: 600, fontFamily: "'Manrope', sans-serif" }}>Opening your conversation...</p>
        ) : (
          <>
            <textarea value={talkInput} onChange={e => setTalkInput(e.target.value)} rows={3}
              placeholder="What's on your mind today?" style={s.textarea}
            />
            <button onClick={sendTalk} style={{ ...s.sendBtn, alignSelf: "flex-start" }}>
              Start conversation <ArrowRight size={13} strokeWidth={2} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}