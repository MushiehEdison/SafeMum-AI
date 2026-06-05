import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Loader, X } from "lucide-react";
import API from "../../API/axios";

const MOODS = [
  { label: "Hopeful",   color: "#16a34a" },
  { label: "Heavy",     color: "#7c3aed" },
  { label: "Grateful",  color: "#2563eb" },
  { label: "Angry",     color: "#dc2626" },
  { label: "Peaceful",  color: "#0891b2" },
  { label: "Confused",  color: "#ea580c" },
  { label: "Tired",     color: "#9333ea" },
  { label: "Okay",      color: "#6b7280" },
];

function fmtDate(str) {
  return new Date(str).toLocaleDateString("en-GB", { day: "numeric", month: "long" });
}

function MoodPill({ label, color, selected, onClick, small }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        padding: small ? "3px 10px" : "7px 16px",
        fontSize: small ? 11 : 13,
        fontWeight: selected ? 600 : 400,
        fontFamily: "'Manrope', sans-serif",
        border: `1.5px solid ${selected ? color : "#e5e7eb"}`,
        borderRadius: 999,
        background: selected ? color : "transparent",
        color: selected ? "#fff" : color,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.15s",
        letterSpacing: small ? "0.04em" : 0,
      }}
    >
      {label}
    </button>
  );
}

function FadeWrapper({ children, visible }) {
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transition: "opacity 0.2s ease",
      pointerEvents: visible ? "auto" : "none",
    }}>
      {children}
    </div>
  );
}

function ReflectionModal({ reflection, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.35)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
      padding: "0 0 120px",
    }}>
      <div style={{
        background: "#fff", borderRadius: "20px 20px 20px 20px",
        padding: "24px 20px", width: "100%", maxWidth: 480,
        margin: "0 16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      }}>
        {/* AI bubble */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", background: "#111",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: "0.05em" }}>AI</span>
          </div>
          <div style={{
            flex: 1, background: "#f4f3f0", border: "1px solid #e8e6e1",
            borderRadius: "4px 18px 18px 18px",
            padding: "13px 16px", fontSize: 14, lineHeight: 1.65,
            color: "#111", fontFamily: "'Manrope', sans-serif",
          }}>
            {reflection}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: "100%", padding: "12px", border: "1.5px solid #e5e7eb",
            borderRadius: 12, background: "transparent", fontSize: 13,
            fontWeight: 600, color: "#555", fontFamily: "'Manrope', sans-serif",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function Journal({ userName, recoveryPhase }) {
  const [view, setView]           = useState("list");
  const [visible, setVisible]     = useState(true);
  const [entries, setEntries]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeEntry, setActiveEntry] = useState(null);

  // Write view state
  const [content, setContent]     = useState("");
  const [moodTag, setMoodTag]     = useState(null);
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState("");
  const textareaRef               = useRef(null);

  // Reflection modal
  const [reflection, setReflection]         = useState(null);
  const [reflectionShown, setReflectionShown] = useState(false);

  // Delete confirm
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]           = useState(false);

  useEffect(() => { fetchEntries(); }, []);

  async function fetchEntries() {
    setLoading(true);
    try {
      const res = await API.get("/api/recovery/journal/entries");
      setEntries(res.data.data || []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }

  function switchView(next, entry = null) {
    setVisible(false);
    setTimeout(() => {
      setView(next);
      setActiveEntry(entry);
      setVisible(true);
      setSaveError("");
      setConfirmDelete(false);
    }, 200);
  }

  function goWrite() {
    setContent("");
    setMoodTag(null);
    switchView("write");
  }

  function goList() {
    switchView("list");
  }

  function goRead(entry) {
    switchView("read", entry);
  }

  // Auto-grow textarea
  function handleContentChange(e) {
    setContent(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    setSaveError("");
    try {
      await API.post("/api/recovery/journal/entry", {
        content: content.trim(),
        moodTag: moodTag || null,
      });

      // Healia reflection — once per session, silent fail
      if (!reflectionShown) {
        setReflectionShown(true);
        try {
          const r = await API.post("/api/recovery/healia/journal-reflection", {
            content: content.trim(),
            recoveryPhase,
          });
          const text = r.data.reflection || null;
          if (text) {
            setReflection(text);
            await fetchEntries();
            setSaving(false);
            return; // stay on write view, show modal; goList after close
          }
        } catch { /* silent */ }
      }

      await fetchEntries();
      goList();
    } catch {
      setSaveError("Could not save your entry. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleReflectionClose() {
    setReflection(null);
    goList();
  }

  async function handleDelete() {
    if (!activeEntry) return;
    setDeleting(true);
    try {
      await API.delete(`/api/recovery/journal/entry/${activeEntry.id}`);
      await fetchEntries();
      goList();
    } catch {
      setDeleting(false);
    }
  }

  const s = {
    page: {
      display: "flex", flexDirection: "column", gap: 24,
    },
    backBtn: {
      display: "flex", alignItems: "center", gap: 6,
      background: "none", border: "none", cursor: "pointer",
      padding: 0, marginBottom: 8, color: "#555",
    },
    backLabel: {
      fontSize: 13, fontFamily: "'Manrope', sans-serif", fontWeight: 500,
    },
    sectionTitle: {
      fontFamily: "'Fraunces', serif",
      fontSize: "clamp(26px,5vw,38px)", fontWeight: 600,
      color: "#111", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 6,
    },
    sectionSub: {
      fontSize: 13, color: "#aaa", fontWeight: 300,
      fontFamily: "'Manrope', sans-serif", marginBottom: 4,
    },
    primaryBtn: {
      width: "100%", padding: "14px", background: "#111", color: "#fff",
      border: "none", borderRadius: 14, fontSize: 14, fontWeight: 600,
      fontFamily: "'Manrope', sans-serif", cursor: "pointer",
    },
    card: {
      background: "#fff", border: "1px solid #e8e6e1",
      borderRadius: 18, padding: "16px 18px",
    },
    label: {
      fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
      textTransform: "uppercase", color: "#bbb", marginBottom: 14,
      fontFamily: "'Manrope', sans-serif",
    },
  };

  return (
    <div style={s.page}>
      <FadeWrapper visible={visible}>

        {/* ── LIST VIEW ─────────────────────────────────────── */}
        {view === "list" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <p style={s.sectionTitle}>Your Journal</p>
              <p style={s.sectionSub}>Only you can see this.</p>
            </div>

            <button onClick={goWrite} style={s.primaryBtn}>
              Write today
            </button>

            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
                <Loader size={18} className="animate-spin" color="#ccc" />
              </div>
            ) : entries.length === 0 ? (
              <div style={{ ...s.card, textAlign: "center", padding: "36px 24px" }}>
                <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.65, fontFamily: "'Manrope', sans-serif", fontStyle: "italic" }}>
                  Your first entry is waiting.<br />There are no rules here.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={s.label}>Past entries</p>
                {entries.map(entry => {
                  const mood = MOODS.find(m => m.label === entry.mood_tag);
                  const preview = (entry.content || "").length > 80
                    ? entry.content.slice(0, 80) + "..."
                    : entry.content;
                  return (
                    <button
                      key={entry.id}
                      onClick={() => goRead(entry)}
                      style={{
                        ...s.card,
                        textAlign: "left", cursor: "pointer",
                        display: "flex", flexDirection: "column", gap: 8,
                        transition: "box-shadow 0.15s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 12, color: "#aaa", fontFamily: "'Manrope', sans-serif" }}>
                          {fmtDate(entry.created_at)}
                        </span>
                        {mood && (
                          <MoodPill label={mood.label} color={mood.color} selected small />
                        )}
                      </div>
                      <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, fontFamily: "'Manrope', sans-serif", margin: 0 }}>
                        {preview}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── WRITE VIEW ────────────────────────────────────── */}
        {view === "write" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <button onClick={goList} style={s.backBtn}>
              <ArrowLeft size={16} strokeWidth={2} color="#555" />
              <span style={s.backLabel}>Back</span>
            </button>

            <p style={{ ...s.sectionTitle, fontStyle: "italic", fontWeight: 400 }}>
              What's on your mind?
            </p>

            {/* Mood selector */}
            <div>
              <p style={s.label}>How are you feeling?</p>
              <div style={{
                display: "flex", gap: 8, overflowX: "auto",
                paddingBottom: 4, scrollbarWidth: "none",
              }}>
                {MOODS.map(m => (
                  <MoodPill
                    key={m.label}
                    label={m.label}
                    color={m.color}
                    selected={moodTag === m.label}
                    onClick={() => setMoodTag(moodTag === m.label ? null : m.label)}
                  />
                ))}
              </div>
            </div>

            {/* Writing surface */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              placeholder="Start anywhere. There is no right way to do this."
              style={{
                width: "100%", minHeight: 220, resize: "none",
                border: "none", outline: "none",
                background: "#f4f3f0", borderRadius: 0,
                fontFamily: "'Manrope', sans-serif",
                fontSize: 16, lineHeight: 1.8, color: "#111",
                boxSizing: "border-box",
                padding: "4px 0",
              }}
            />

            {saveError && (
              <p style={{ fontSize: 12, color: "#dc2626", fontFamily: "'Manrope', sans-serif" }}>
                {saveError}
              </p>
            )}

            <button
              onClick={handleSave}
              disabled={!content.trim() || saving}
              style={{
                ...s.primaryBtn,
                opacity: !content.trim() ? 0.4 : 1,
                cursor: !content.trim() ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {saving
                ? <><Loader size={14} className="animate-spin" /> Saving...</>
                : "Save entry"
              }
            </button>
          </div>
        )}

        {/* ── READ VIEW ─────────────────────────────────────── */}
        {view === "read" && activeEntry && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <button onClick={goList} style={s.backBtn}>
              <ArrowLeft size={16} strokeWidth={2} color="#555" />
              <span style={s.backLabel}>Back</span>
            </button>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontSize: 13, color: "#aaa", fontFamily: "'Manrope', sans-serif" }}>
                {fmtDate(activeEntry.created_at)}
              </p>
              {(() => {
                const mood = MOODS.find(m => m.label === activeEntry.mood_tag);
                return mood ? <MoodPill label={mood.label} color={mood.color} selected small /> : null;
              })()}
            </div>

            <p style={{
              fontSize: 16, lineHeight: 1.8, color: "#111",
              fontFamily: "'Manrope', sans-serif", whiteSpace: "pre-wrap",
            }}>
              {activeEntry.content}
            </p>

            {/* Delete */}
            <div style={{ marginTop: 16, paddingTop: 20, borderTop: "1px solid #f0efec" }}>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 13, color: "#dc2626",
                    fontFamily: "'Manrope', sans-serif", padding: 0,
                  }}
                >
                  Delete this entry
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <p style={{ fontSize: 13, color: "#374151", fontFamily: "'Manrope', sans-serif" }}>
                    Are you sure? This cannot be undone.
                  </p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      style={{
                        padding: "10px 18px", background: "#dc2626", color: "#fff",
                        border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600,
                        fontFamily: "'Manrope', sans-serif", cursor: "pointer",
                      }}
                    >
                      {deleting ? "Deleting..." : "Yes, delete"}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      style={{
                        padding: "10px 18px", background: "transparent",
                        border: "1.5px solid #e5e7eb", borderRadius: 10,
                        fontSize: 13, color: "#555",
                        fontFamily: "'Manrope', sans-serif", cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </FadeWrapper>

      {/* Reflection modal */}
      {reflection && (
        <ReflectionModal reflection={reflection} onClose={handleReflectionClose} />
      )}
    </div>
  );
}