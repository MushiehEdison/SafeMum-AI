import { useState, useEffect } from "react";
import { Send, ArrowRight, MessageCircle, Loader, ChevronDown, ChevronUp, Flame } from "lucide-react";
import { getCheckinHistory, submitCheckin } from "../../API/recovery";

const MOOD_OPTIONS = [
  { label: "I have been really struggling", color: "red"   },
  { label: "It has been up and down",       color: "gray"  },
  { label: "A little better than before",   color: "green" },
  { label: "I am doing okay today",         color: "green" },
];

const DOT_COLOR = { green: "#22c55e", gray: "#94a3b8", red: "#ef4444" };

function fmtDate(str) {
  return new Date(str).toLocaleDateString("en-GB", { day: "numeric", month: "long" });
}

const s = {
  sectionTitle: {
    fontFamily: "'Fraunces', serif", fontSize: "clamp(26px, 5vw, 38px)",
    fontWeight: 600, color: "#111", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 6,
  },
  sectionSub: {
    fontSize: 13, color: "#aaa", fontWeight: 300, marginBottom: 28, fontFamily: "'Manrope', sans-serif",
  },
  aiBubble: {
    maxWidth: "80%", padding: "13px 16px", fontSize: 14, lineHeight: 1.65,
    background: "#fff", border: "1px solid #e8e6e1", color: "#111",
    borderRadius: "4px 18px 18px 18px", fontFamily: "'Manrope', sans-serif",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  userBubble: {
    maxWidth: "80%", padding: "13px 16px", fontSize: 14, lineHeight: 1.65,
    background: "#111", color: "#fff", borderRadius: "18px 4px 18px 18px",
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
    cursor: "pointer", fontFamily: "'Manrope', sans-serif", transition: "all 0.15s",
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
  pillBtn: (selected, accent) => ({
    padding: "8px 16px", fontSize: 12, fontWeight: selected ? 600 : 400,
    border: selected ? `1.5px solid ${accent}` : "1.5px solid #e5e7eb",
    borderRadius: 24, background: selected ? accent + "15" : "transparent",
    color: selected ? accent : "#444",
    cursor: "pointer", fontFamily: "'Manrope', sans-serif", transition: "all 0.15s",
  }),
  scaleBtn: (selected) => ({
    width: 40, height: 40, borderRadius: 12,
    border: selected ? "1.5px solid #111" : "1.5px solid #e5e7eb",
    background: selected ? "#111" : "transparent",
    color: selected ? "#fff" : "#666",
    fontSize: 13, fontWeight: selected ? 600 : 400,
    cursor: "pointer", fontFamily: "'Manrope', sans-serif",
    display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
  }),
};

export default function CheckInTab() {
  // Core state
  const [screen, setScreen] = useState("greeting");
  const [greeting, setGreeting] = useState("");
  const [physicalQuestions, setPhysicalQuestions] = useState([]);
  const [emotionalQuestions, setEmotionalQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [conclusion, setConclusion] = useState("");
  const [dailyTip, setDailyTip] = useState("");
  const [recoveryPhase, setRecoveryPhase] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [streak, setStreak] = useState(0);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);

  // Mood & free text
  const [selectedMood, setSelectedMood] = useState(null);
  const [freeText, setFreeText] = useState("");

  // History
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [expandedHistory, setExpandedHistory] = useState([]);

  // Talk card
  const [talkInput, setTalkInput] = useState("");
  const [talkSent, setTalkSent] = useState(false);

  // Fetch questions and history on mount
  useEffect(() => {
    async function fetchAll() {
      try {
        const [histRes] = await Promise.all([
          getCheckinHistory(),
        ]);
        const histData = histRes.data.data || histRes.data || [];

        setHistory(histData);

        // Check if already checked in today
        const today = new Date().toISOString().split("T")[0];
        const todayCheckin = Array.isArray(histData)
          ? histData.find(h => (h.date || "").startsWith(today))
          : null;

        if (todayCheckin) {
          setAlreadyCheckedIn(true);
          setConclusion(todayCheckin.conclusion || todayCheckin.note || "");
          setSelectedMood(todayCheckin.mood || null);
        }

        // Set mock questions (replace with API call when ready)
        setGreeting("Welcome back. Let's see how you're doing today.");
        setPhysicalQuestions([
          { id: "bleeding", question: "Are you experiencing any bleeding?", type: "choice", options: ["None", "Light spotting", "Moderate", "Heavy — soaking pads"], min_label: null, max_label: null },
          { id: "pain", question: "Rate your pain level today", type: "scale", options: null, min_label: "No pain", max_label: "Severe pain" },
          { id: "fever", question: "Do you have a fever?", type: "yesno", options: null, min_label: null, max_label: null },
          { id: "appetite", question: "How is your appetite?", type: "scale", options: null, min_label: "No appetite", max_label: "Normal" },
        ]);
        setEmotionalQuestions([
          { id: "sleep", question: "How well did you sleep last night?", type: "scale", options: null, min_label: "Not at all", max_label: "Very well" },
          { id: "mood", question: "How would you describe your mood?", type: "choice", options: ["Hopeful", "Numb", "Sad", "Anxious", "Okay", "Good"], min_label: null, max_label: null },
          { id: "support", question: "Did you talk to anyone supportive today?", type: "yesno", options: null, min_label: null, max_label: null },
        ]);

        const streakVal = histRes.data?.streak || histData?.streak || (Array.isArray(histData) ? histData.length : 0);
        setStreak(streakVal);
        setRecoveryPhase(histRes.data?.recovery_phase || "Week 2 · Active Recovery");
        setProgressPct(histRes.data?.progress_pct || 33);
        setDailyTip(histRes.data?.daily_tip || "Stay hydrated and rest when you can.");
      } catch (err) {
        console.error("Failed to fetch check-in data:", err);
      } finally {
        setLoading(false);
        setLoadingHistory(false);
      }
    }
    fetchAll();
  }, []);

  function toggleHistoryItem(id) {
    setExpandedHistory(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function setAnswer(qId, value) {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  }

  function allPhysicalAnswered() {
    return physicalQuestions.every(q => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== "");
  }

  function allEmotionalAnswered() {
    return emotionalQuestions.every(q => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== "");
  }

  function handleReset() {
    setScreen("greeting");
    setAnswers({});
    setSelectedMood(null);
    setFreeText("");
    setAiResponse(null);
    setConclusion("");
    setSubmitted(false);
    setAlreadyCheckedIn(false);
  }

  async function handleSubmit() {
    if (!selectedMood || !freeText.trim()) return;
    setSubmitting(true);
    try {
      const res = await submitCheckin({
        mood: selectedMood.label || selectedMood,
        note: freeText.trim(),
        answers,
      });
      const data = res.data;
      setAiResponse(data.ai_response || "Thank you for sharing.");
      setConclusion(data.conclusion || "");
      setDailyTip(data.daily_tip || dailyTip);
      setRecoveryPhase(data.recovery_phase || recoveryPhase);
      setProgressPct(data.progress_pct ?? progressPct);
      setStreak(data.streak ?? streak);
      setSubmitted(true);

      const histRes = await getCheckinHistory();
      setHistory(histRes.data.data || histRes.data || []);
    } catch (err) {
      console.error("Failed to submit check-in:", err);
      setAiResponse("Thank you for sharing. Take care of yourself today.");
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  function sendTalk() {
    if (!talkInput.trim()) return;
    setTalkInput(""); setTalkSent(true);
    setTimeout(() => setTalkSent(false), 4000);
  }

  function renderQuestion(q) {
    const val = answers[q.id];
    if (q.type === "scale") {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "#aaa", fontFamily: "'Manrope', sans-serif", minWidth: 60 }}>{q.min_label}</span>
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => setAnswer(q.id, n)} style={s.scaleBtn(val === n)}>{n}</button>
          ))}
          <span style={{ fontSize: 11, color: "#aaa", fontFamily: "'Manrope', sans-serif" }}>{q.max_label}</span>
        </div>
      );
    }
    if (q.type === "yesno") {
      return (
        <div style={{ display: "flex", gap: 8 }}>
          {["Yes", "No"].map(opt => (
            <button key={opt} onClick={() => setAnswer(q.id, opt)} style={s.pillBtn(val === opt, "#111")}>{opt}</button>
          ))}
        </div>
      );
    }
    if (q.type === "choice") {
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {q.options.map(opt => (
            <button key={opt} onClick={() => setAnswer(q.id, opt)} style={s.pillBtn(val === opt, "#111")}>{opt}</button>
          ))}
        </div>
      );
    }
    return null;
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
        <Loader size={20} className="animate-spin" color="#aaa" />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

      {/* Title */}
      <div>
        <p style={s.sectionTitle}>How are you<br /><em style={{ fontStyle: "italic", fontWeight: 400, color: "#555" }}>today?</em></p>
        <p style={s.sectionSub}>Take a moment. There is no rush here.</p>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e8e6e1", borderRadius: 12, padding: "8px 14px", alignSelf: "flex-start" }}>
          <Flame size={14} color="#f59e0b" />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#111", fontFamily: "'Manrope', sans-serif" }}>Day {streak} streak</span>
        </div>
      )}

      {/* Already checked in */}
      {alreadyCheckedIn && !submitted && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 16, padding: "18px 20px" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#15803d", fontFamily: "'Manrope', sans-serif", marginBottom: 6 }}>
            You already checked in today
          </p>
          {conclusion && (
            <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, fontFamily: "'Manrope', sans-serif", marginBottom: 12 }}>
              {conclusion}
            </p>
          )}
          <button onClick={handleReset} style={{ ...s.sendBtn, background: "#16a34a" }}>
            Check in again
          </button>
        </div>
      )}

      {/* Screen: Greeting */}
      {!alreadyCheckedIn && screen === "greeting" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={s.avatar}>AI</div>
            <div style={s.aiBubble}>{greeting || "Welcome back. Let's check how you're doing today."}</div>
          </div>
          <button onClick={() => setScreen("physical")} style={{ ...s.sendBtn, alignSelf: "flex-start" }}>
            Start check-in <ArrowRight size={13} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Screen: Physical questions */}
      {!alreadyCheckedIn && screen === "physical" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#dc2626", fontFamily: "'Manrope', sans-serif", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Physical symptoms
          </p>
          {physicalQuestions.map(q => (
            <div key={q.id} style={{ background: "#fff", border: "1px solid #e8e6e1", borderRadius: 14, padding: "14px 16px" }}>
              <p style={{ fontSize: 13, color: "#111", fontFamily: "'Manrope', sans-serif", fontWeight: 500, marginBottom: 10 }}>{q.question}</p>
              {renderQuestion(q)}
            </div>
          ))}
          <button onClick={() => setScreen("emotional")} disabled={!allPhysicalAnswered()}
            style={{
              ...s.sendBtn, alignSelf: "flex-end",
              opacity: allPhysicalAnswered() ? 1 : 0.4,
              cursor: allPhysicalAnswered() ? "pointer" : "not-allowed",
            }}>
            Continue <ArrowRight size={13} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Screen: Emotional questions */}
      {!alreadyCheckedIn && screen === "emotional" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#9333ea", fontFamily: "'Manrope', sans-serif", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Emotional wellbeing
          </p>
          {emotionalQuestions.map(q => (
            <div key={q.id} style={{ background: "#fff", border: "1px solid #e8e6e1", borderRadius: 14, padding: "14px 16px" }}>
              <p style={{ fontSize: 13, color: "#111", fontFamily: "'Manrope', sans-serif", fontWeight: 500, marginBottom: 10 }}>{q.question}</p>
              {renderQuestion(q)}
            </div>
          ))}
          <button onClick={() => setScreen("summary")} disabled={!allEmotionalAnswered()}
            style={{
              ...s.sendBtn, alignSelf: "flex-end",
              opacity: allEmotionalAnswered() ? 1 : 0.4,
              cursor: allEmotionalAnswered() ? "pointer" : "not-allowed",
            }}>
            Continue <ArrowRight size={13} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Screen: Summary */}
      {!alreadyCheckedIn && screen === "summary" && !submitted && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontSize: 13, color: "#111", fontFamily: "'Manrope', sans-serif", fontWeight: 500 }}>
            How are you feeling overall?
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {MOOD_OPTIONS.map(m => (
              <button key={m.label} onClick={() => setSelectedMood(m)}
                style={s.moodBtn(selectedMood?.label === m.label)}>
                {m.label}
              </button>
            ))}
          </div>

          <textarea value={freeText} onChange={e => setFreeText(e.target.value)} rows={4}
            placeholder="Tell me more about how you're feeling..."
            style={s.textarea}
          />

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={handleSubmit} disabled={!selectedMood || !freeText.trim() || submitting}
              style={{
                ...s.sendBtn,
                opacity: (!selectedMood || !freeText.trim()) ? 0.4 : 1,
                cursor: (!selectedMood || !freeText.trim()) ? "not-allowed" : "pointer",
              }}>
              {submitting ? (
                <><Loader size={13} className="animate-spin" /> Sending...</>
              ) : (
                <><Send size={13} strokeWidth={2} /> Send</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Submitting state */}
      {submitting && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 0" }}>
          <Loader size={16} className="animate-spin" color="#aaa" />
          <p style={{ fontSize: 13, color: "#aaa", fontFamily: "'Manrope', sans-serif" }}>
            The AI is reviewing your check-in...
          </p>
        </div>
      )}

      {/* Submitted: AI response + recovery data */}
      {submitted && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* AI response bubble */}
          {aiResponse && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={s.avatar}>AI</div>
              <div style={s.aiBubble}>{aiResponse}</div>
            </div>
          )}

          {/* Conclusion card */}
          {conclusion && (
            <div style={{
              background: "#fff", border: "1px solid #e8e6e1", borderRadius: 16, padding: "18px 20px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}>
              <p style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
                textTransform: "uppercase", color: "#bbb", fontFamily: "'Manrope', sans-serif", marginBottom: 8,
              }}>Today's assessment</p>
              <p style={{ fontSize: 14, color: "#111", lineHeight: 1.65, fontFamily: "'Manrope', sans-serif" }}>
                {conclusion}
              </p>
            </div>
          )}

          {/* Daily tip */}
          {dailyTip && (
            <div style={{
              background: "#fefce8", border: "1px solid #fde68a", borderRadius: 14, padding: "14px 18px",
            }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: "#a16207", fontFamily: "'Manrope', sans-serif", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                Daily tip
              </p>
              <p style={{ fontSize: 13, color: "#713f12", lineHeight: 1.6, fontFamily: "'Manrope', sans-serif" }}>
                {dailyTip}
              </p>
            </div>
          )}

          {/* Recovery progress */}
          <div style={{
            background: "#fff", border: "1px solid #e8e6e1", borderRadius: 16, padding: "16px 18px",
          }}>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: "#bbb", fontFamily: "'Manrope', sans-serif", marginBottom: 10,
            }}>Recovery progress</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#111", fontFamily: "'Manrope', sans-serif", marginBottom: 8 }}>
              {recoveryPhase}
            </p>
            <div style={{ height: 6, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progressPct}%`, background: "#16a34a", borderRadius: 3, transition: "width 0.5s ease" }} />
            </div>
            <p style={{ fontSize: 11, color: "#9ca3af", fontFamily: "'Manrope', sans-serif", marginTop: 6 }}>
              {progressPct}% complete
            </p>
          </div>
        </div>
      )}

      {/* History timeline */}
      <div>
        <p style={s.label}>Your journey</p>
        {loadingHistory ? (
          <p style={{ fontSize: 13, color: "#aaa" }}>Loading...</p>
        ) : history.length === 0 ? (
          <p style={{ fontSize: 13, color: "#aaa", fontStyle: "italic" }}>Your check-in history will appear here.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {history.map((item, i) => {
              const isExpanded = expandedHistory.includes(item.id || item._id || i);
              return (
                <div key={item.id || item._id || i} style={{ display: "flex", gap: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: DOT_COLOR[item.color] || "#94a3b8", flexShrink: 0, marginTop: 5 }} />
                    {i < history.length - 1 && <div style={{ width: 1, flex: 1, background: "#e8e6e1", margin: "5px 0" }} />}
                  </div>
                  <div style={{ paddingBottom: 22, flex: 1 }}>
                    <p style={{ fontSize: 11, color: "#bbb", marginBottom: 3, fontFamily: "'Manrope', sans-serif" }}>{fmtDate(item.date)}</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#111", marginBottom: 5, fontFamily: "'Manrope', sans-serif" }}>{item.mood}</p>
                    {item.note && !isExpanded && (
                      <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, fontFamily: "'Manrope', sans-serif" }}>{item.note}</p>
                    )}
                    {item.conclusion && (
                      <button onClick={() => toggleHistoryItem(item.id || item._id || i)}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                        <span style={{ fontSize: 11, color: "#9333ea", fontFamily: "'Manrope', sans-serif", fontWeight: 500 }}>AI assessment</span>
                        {isExpanded ? <ChevronUp size={12} color="#9333ea" /> : <ChevronDown size={12} color="#9333ea" />}
                      </button>
                    )}
                    {isExpanded && item.conclusion && (
                      <div style={{
                        background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 10,
                        padding: "10px 14px", marginTop: 8,
                      }}>
                        <p style={{ fontSize: 10, color: "#9333ea", fontFamily: "'Manrope', sans-serif", fontWeight: 600, letterSpacing: "0.06em", marginBottom: 4 }}>
                          AI assessment
                        </p>
                        <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, fontFamily: "'Manrope', sans-serif" }}>
                          {item.conclusion}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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