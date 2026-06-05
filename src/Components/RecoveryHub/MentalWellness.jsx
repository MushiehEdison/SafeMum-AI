import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Check, Wind, Brain, Sparkles, BookOpen, Zap } from "lucide-react";
import wellnessContent from "../JSON/mental_wellness_content.json";

// ─── Constants ────────────────────────────────────────────────────────────────

const PHASE_SUBTITLES = {
  early_acute:      "One small step at a time.",
  processing:       "You're beginning to make sense of it.",
  rebuilding:       "Building something new, slowly.",
  stabilised:       "Carrying your loss, and living fully.",
  active_pregnancy: "Holding hope and fear at once.",
  postnatal:        "You're here. So is your baby.",
};

const TYPE_META = {
  reflection:      { color: "#7c3aed", bg: "#f5f3ff", label: "Reflection",      Icon: Brain    },
  breathing:       { color: "#0891b2", bg: "#ecfeff", label: "Breathing",        Icon: Wind     },
  affirmation:     { color: "#16a34a", bg: "#f0fdf4", label: "Affirmation",      Icon: Sparkles },
  psychoeducation: { color: "#2563eb", bg: "#eff6ff", label: "Psychoeducation",  Icon: BookOpen },
  action:          { color: "#ea580c", bg: "#fff7ed", label: "Action",           Icon: Zap      },
};

function getTypeMeta(type = "") {
  return TYPE_META[type.toLowerCase()] || { color: "#6b7280", bg: "#f3f4f6", label: type, Icon: Brain };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadProgress(userId) {
  try {
    const raw = localStorage.getItem(`wellness_progress_${userId}`);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveProgress(userId, progress) {
  try { localStorage.setItem(`wellness_progress_${userId}`, JSON.stringify(progress)); }
  catch { /* silent */ }
}

function progressKey(weekIndex, dayIndex) {
  return `week_${weekIndex}_day_${dayIndex}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypeBadge({ type, small = false }) {
  const { color, bg, label, Icon } = getTypeMeta(type);
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: small ? 4 : 5,
      padding: small ? "3px 8px" : "5px 12px",
      borderRadius: 999, background: bg,
      fontSize: small ? 10 : 11,
      fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
      color, fontFamily: "'Manrope', sans-serif",
    }}>
      <Icon size={small ? 9 : 11} strokeWidth={2.2} />
      {label}
    </span>
  );
}

function DayCircle({ dayNum, isCompleted, isCurrent, isFuture, onClick }) {
  const base = {
    width: 36, height: 36, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: isFuture ? "default" : "pointer",
    flexShrink: 0, transition: "transform 0.12s, box-shadow 0.12s",
    fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 12,
  };

  if (isCompleted) return (
    <button onClick={onClick} style={{ ...base, background: "#111", border: "none" }}>
      <Check size={14} strokeWidth={2.5} color="#fff" />
    </button>
  );
  if (isCurrent) return (
    <button onClick={onClick} style={{ ...base, background: "transparent", border: "2px solid #111", color: "#111" }}>
      {dayNum}
    </button>
  );
  return (
    <div style={{ ...base, background: "transparent", border: "1.5px solid #e8e6e1", color: "#d1d5db" }}>
      {dayNum}
    </div>
  );
}

function DayView({ day, dayIndex, onClose, onMarkDone, isCompleted }) {
  const { color, bg } = getTypeMeta(day.type);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 60,
      display: "flex", flexDirection: "column",
      background: "transparent",
    }}>
      <div onClick={onClose} style={{ flex: 1, background: "rgba(0,0,0,0.18)", cursor: "pointer" }} />

      <div style={{
        background: "#f4f3f0",
        borderRadius: "24px 24px 0 0",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.12)",
        display: "flex", flexDirection: "column",
        maxHeight: "88vh",
        animation: "slideUp 250ms ease forwards",
      }}>
        {/* Handle + close */}
        <div style={{ padding: "16px 20px 0", position: "relative", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#d1d5db" }} />
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: "50%", background: "#fff",
            border: "1px solid #e5e7eb", display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer", position: "absolute", right: 20, top: 16,
          }}>
            <X size={14} strokeWidth={2} color="#555" />
          </button>
        </div>

        <div style={{ overflowY: "auto", padding: "20px 20px 32px", display: "flex", flexDirection: "column", gap: 18 }}>
          <p style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "#aaa",
            fontFamily: "'Manrope', sans-serif", margin: 0,
          }}>
            Day {dayIndex + 1}
          </p>

          <h2 style={{
            fontFamily: "'Fraunces', serif", fontSize: "clamp(22px,5.5vw,30px)",
            fontWeight: 600, color: "#111", lineHeight: 1.2,
            letterSpacing: "-0.02em", margin: 0,
          }}>
            {day.title}
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <TypeBadge type={day.type} />
            {day.duration && (
              <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: "'Manrope', sans-serif", fontWeight: 500 }}>
                {day.duration}
              </span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(Array.isArray(day.content)
              ? day.content
              : (day.content || "").split(/\n\n+/).filter(Boolean)
            ).map((para, i) => (
              <p key={i} style={{
                fontSize: 14, color: "#374151", lineHeight: 1.78,
                fontFamily: "'Manrope', sans-serif", margin: 0,
              }}>
                {para}
              </p>
            ))}
          </div>

          {day.prompt && (
            <div style={{
              background: bg, borderRadius: 14,
              border: `1px solid ${color}22`,
              padding: "14px 16px",
            }}>
              <p style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color, marginBottom: 6,
                fontFamily: "'Manrope', sans-serif",
              }}>
                Reflection prompt
              </p>
              <p style={{
                fontSize: 13.5, color: "#111", lineHeight: 1.7,
                fontFamily: "'Manrope', sans-serif", fontStyle: "italic",
                fontWeight: 500, margin: 0,
              }}>
                {day.prompt}
              </p>
            </div>
          )}

          <button
            onClick={() => { if (!isCompleted) { onMarkDone(); onClose(); } }}
            disabled={isCompleted}
            style={{
              marginTop: 4, padding: "15px 20px", borderRadius: 14,
              background: isCompleted ? "#e8e6e1" : "#111",
              color: isCompleted ? "#9ca3af" : "#fff",
              border: "none", cursor: isCompleted ? "default" : "pointer",
              fontSize: 14, fontWeight: 600, fontFamily: "'Manrope', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {isCompleted ? <><Check size={15} strokeWidth={2.5} /> Completed</> : "Mark as done"}
          </button>

          <div style={{ height: 20 }} />
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function WeekCompletionCard({ hasNext, onNext }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 18, border: "1px solid #e8e6e1",
      padding: "24px 20px", textAlign: "center",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: "50%", background: "#f0fdf4",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: "1.5px solid #bbf7d0",
      }}>
        <Check size={22} strokeWidth={2.5} color="#16a34a" />
      </div>
      <div>
        <p style={{
          fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600,
          color: "#111", margin: "0 0 6px", lineHeight: 1.2,
        }}>
          You showed up every day this week.
        </p>
        <p style={{ fontSize: 13, color: "#9ca3af", fontFamily: "'Manrope', sans-serif", margin: 0, lineHeight: 1.6 }}>
          That's not small. That's everything.
        </p>
      </div>
      {hasNext && (
        <button onClick={onNext} style={{
          padding: "12px 24px", borderRadius: 12, background: "#111",
          color: "#fff", border: "none", cursor: "pointer",
          fontSize: 13, fontWeight: 600, fontFamily: "'Manrope', sans-serif",
        }}>
          Continue to next week →
        </button>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function MentalWellness({ recoveryPhase, userName, daysSinceLoss, userId }) {
  const [progress,     setProgress]     = useState(() => loadProgress(userId));
  const [weekIndex,    setWeekIndex]     = useState(0);
  const [openDayIndex, setOpenDayIndex] = useState(null);

  // JSON is a root-level array — handle both shapes
  const allWeeks = Array.isArray(wellnessContent)
    ? wellnessContent
    : (wellnessContent.weeks || []);

  // Filter to weeks relevant for this phase (week.phase is an array of phase strings)
  const weeks = allWeeks.filter(w => {
    if (!w.phase || w.phase.length === 0) return true;
    return w.phase.includes(recoveryPhase);
  });

  // Fallback: if no phase-matched weeks, show all
  const displayWeeks = weeks.length > 0 ? weeks : allWeeks;

  const currentWeekIndex = Math.min(Math.floor((daysSinceLoss || 0) / 7), displayWeeks.length - 1);
  const currentDayIndex  = Math.min((daysSinceLoss || 0) % 7, 6);

  useEffect(() => {
    setWeekIndex(Math.max(0, currentWeekIndex));
  }, [currentWeekIndex]);

  const week = displayWeeks[weekIndex];
  if (!week) return null;

  // JSON uses "days" array; each day has a "day" number field (1-based)
  const days = week.days || [];

  // weekIntro field name in JSON is "weekIntro" (camelCase)
  const weekIntro = week.weekIntro || week.intro || null;

  function isDayCompleted(wIdx, dIdx) {
    return !!progress[progressKey(wIdx, dIdx)];
  }

  function isWeekCompleted(wIdx) {
    const w = displayWeeks[wIdx];
    if (!w) return false;
    return (w.days || []).every((_, dIdx) => isDayCompleted(wIdx, dIdx));
  }

  function markDone(wIdx, dIdx) {
    const next = { ...progress, [progressKey(wIdx, dIdx)]: true };
    setProgress(next);
    saveProgress(userId, next);
  }

  const subtitle     = PHASE_SUBTITLES[recoveryPhase] || "Healing looks different every day.";
  const canGoPrev    = weekIndex > 0;
  const canGoNext    = weekIndex < displayWeeks.length - 1;
  const weekCompleted = isWeekCompleted(weekIndex);
  const todayDay     = weekIndex === currentWeekIndex ? days[currentDayIndex] : null;

  return (
    <>
      {openDayIndex !== null && days[openDayIndex] && (
        <DayView
          day={days[openDayIndex]}
          dayIndex={openDayIndex}
          weekIndex={weekIndex}
          onClose={() => setOpenDayIndex(null)}
          onMarkDone={() => markDone(weekIndex, openDayIndex)}
          isCompleted={isDayCompleted(weekIndex, openDayIndex)}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 28, paddingBottom: 100 }}>

        {/* Header */}
        <div>
          <p style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "clamp(26px,5vw,38px)",
            fontWeight: 600, color: "#111",
            lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 6,
          }}>
            Your Wellness Journey
          </p>
          <p style={{ fontSize: 13, color: "#aaa", fontWeight: 300, fontFamily: "'Manrope', sans-serif" }}>
            {subtitle}
          </p>
        </div>

        {/* Week theme card */}
        <div style={{
          background: "#fff", borderRadius: 18, border: "1px solid #e8e6e1",
          padding: "18px 18px 16px",
          display: "flex", flexDirection: "column", gap: 8,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "#aaa",
            fontFamily: "'Manrope', sans-serif", margin: 0,
          }}>
            Week {week.week || weekIndex + 1}
          </p>
          <p style={{
            fontFamily: "'Fraunces', serif", fontSize: 20,
            fontWeight: 600, color: "#111", lineHeight: 1.2, margin: 0,
          }}>
            {week.theme}
          </p>
          {weekIntro && (
            <p style={{
              fontSize: 13, color: "#6b7280", lineHeight: 1.7,
              fontFamily: "'Manrope', sans-serif", margin: 0,
            }}>
              {weekIntro}
            </p>
          )}
        </div>

        {/* Day circles + navigation */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button
              onClick={() => canGoPrev && setWeekIndex(w => w - 1)}
              disabled={!canGoPrev}
              style={{
                width: 32, height: 32, borderRadius: "50%",
                background: canGoPrev ? "#fff" : "transparent",
                border: canGoPrev ? "1px solid #e5e7eb" : "1px solid transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: canGoPrev ? "pointer" : "default",
                opacity: canGoPrev ? 1 : 0.3,
              }}
            >
              <ChevronLeft size={15} strokeWidth={2} color="#555" />
            </button>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {days.map((_, dIdx) => {
                const completed = isDayCompleted(weekIndex, dIdx);
                const isCurrent = weekIndex === currentWeekIndex && dIdx === currentDayIndex;
                const isFuture  = weekIndex > currentWeekIndex || (weekIndex === currentWeekIndex && dIdx > currentDayIndex);
                return (
                  <DayCircle
                    key={dIdx}
                    dayNum={dIdx + 1}
                    isCompleted={completed}
                    isCurrent={isCurrent && !completed}
                    isFuture={isFuture && !completed}
                    onClick={() => !isFuture && setOpenDayIndex(dIdx)}
                  />
                );
              })}
            </div>

            <button
              onClick={() => canGoNext && setWeekIndex(w => w + 1)}
              disabled={!canGoNext}
              style={{
                width: 32, height: 32, borderRadius: "50%",
                background: canGoNext ? "#fff" : "transparent",
                border: canGoNext ? "1px solid #e5e7eb" : "1px solid transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: canGoNext ? "pointer" : "default",
                opacity: canGoNext ? 1 : 0.3,
              }}
            >
              <ChevronRight size={15} strokeWidth={2} color="#555" />
            </button>
          </div>

          {/* Day labels */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
            {["M","T","W","T","F","S","S"].map((l, i) => (
              <div key={i} style={{
                width: 36, textAlign: "center",
                fontSize: 10, color: "#d1d5db",
                fontFamily: "'Manrope', sans-serif", fontWeight: 600, letterSpacing: "0.05em",
              }}>
                {l}
              </div>
            ))}
          </div>
        </div>

        {/* Week completion or today's card */}
        {weekCompleted ? (
          <WeekCompletionCard
            hasNext={canGoNext}
            onNext={() => setWeekIndex(w => w + 1)}
          />
        ) : todayDay ? (
          <div style={{
            background: "#fff", borderRadius: 18, border: "1px solid #e8e6e1",
            padding: "18px 18px 20px",
            display: "flex", flexDirection: "column", gap: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: "#aaa",
              fontFamily: "'Manrope', sans-serif", margin: 0,
            }}>
              Today · Day {currentDayIndex + 1}
            </p>

            <p style={{
              fontFamily: "'Fraunces', serif", fontSize: 18,
              fontWeight: 600, color: "#111", lineHeight: 1.25, margin: 0,
            }}>
              {todayDay.title}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <TypeBadge type={todayDay.type} small />
              {todayDay.duration && (
                <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: "'Manrope', sans-serif", fontWeight: 500 }}>
                  {todayDay.duration}
                </span>
              )}
            </div>

            <p style={{
              fontSize: 13, color: "#6b7280", lineHeight: 1.7,
              fontFamily: "'Manrope', sans-serif", margin: 0,
              display: "-webkit-box", WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {Array.isArray(todayDay.content) ? todayDay.content[0] : (todayDay.content || "").split(/\n\n/)[0]}
            </p>

            <button
              onClick={() => setOpenDayIndex(currentDayIndex)}
              style={{
                marginTop: 4, padding: "13px 18px", borderRadius: 12,
                background: "#111", color: "#fff",
                border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600, fontFamily: "'Manrope', sans-serif",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              Start today's exercise
            </button>
          </div>
        ) : null}

      </div>
    </>
  );
}