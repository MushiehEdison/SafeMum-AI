import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X, Activity, Heart, CheckCircle2, AlertTriangle,
  AlertCircle, Eye, ChevronLeft, Shield, MapPin,
  MessageCircle, Droplets, Wind, Thermometer, Brain,
  Moon, Utensils, Users, Frown, Meh, Smile
} from "lucide-react";
import { submitSymptomCheckin } from "../API/recovery";
import Mascot from "../Components/Mascot/Mascot";

const PHYSICAL_SYMPTOMS = [
  "Heavy or unusual bleeding",
  "Severe abdominal pain or cramping",
  "Fever or chills",
  "Persistent headache",
  "Dizziness or fainting",
  "Swollen or painful legs",
  "Chest pain or difficulty breathing",
  "Persistent cough (new)",
  "Cold hands or feet",
  "Foul-smelling discharge",
  "Wound pain or redness"
];

const EMOTIONAL_SYMPTOMS = [
  "Unable to sleep",
  "Not eating or no appetite",
  "Feeling hopeless or empty",
  "Withdrawing from people",
  "Crying most of the day",
  "Feeling completely numb"
];

const POSITIVE_SYMPTOMS = [
  "I feel physically stable today",
  "I am emotionally okay today",
  "No unusual bleeding or pain",
  "I am eating and sleeping normally"
];

const EMERGENCY_SYMPTOMS = [
  "Heavy or unusual bleeding",
  "Chest pain or difficulty breathing",
  "Severe abdominal pain or cramping",
  "Dizziness or fainting",
  "Cold hands or feet",
  "Persistent cough (new)",
  "Swollen or painful legs"
];

const URGENT_SYMPTOMS = [
  "Fever or chills",
  "Foul-smelling discharge",
  "Persistent headache",
  "Wound pain or redness",
  "Feeling hopeless or empty",
  "Unable to sleep",
  "Not eating or no appetite"
];

function classifySymptoms(selected) {
  const hasEmergency = selected.some(s => EMERGENCY_SYMPTOMS.includes(s));
  const hasUrgent = selected.some(s => URGENT_SYMPTOMS.includes(s));
  const allPositive = selected.every(s => POSITIVE_SYMPTOMS.includes(s)) && selected.length > 0;

  if (hasEmergency) return {
    level: "emergency", color: "#dc2626", bgColor: "#fee2e2", borderColor: "#fecaca",
    icon: AlertTriangle,
    title: "Some of your symptoms need immediate attention",
    action: "emergency",
  };
  if (hasUrgent) return {
    level: "urgent", color: "#d97706", bgColor: "#fef3c7", borderColor: "#fde68a",
    icon: AlertCircle,
    title: "You should see a doctor today",
    action: "map",
  };
  if (allPositive) return {
    level: "stable", color: "#16a34a", bgColor: "#dcfce7", borderColor: "#bbf7d0",
    icon: CheckCircle2,
    title: "You are showing good signs of recovery",
    action: "chat",
  };
  return {
    level: "monitor", color: "#6b7280", bgColor: "#f3f4f6", borderColor: "#e5e7eb",
    icon: Eye,
    title: "Keep monitoring how you feel",
    action: "chat",
  };
}

function SymptomPill({ symptom, isSelected, onToggle, type }) {
  const isPositive = type === "positive";
  const isEmergency = EMERGENCY_SYMPTOMS.includes(symptom) && !isPositive;

  let bg, border, color, hoverBg, hoverBorder;
  if (isSelected) {
    if (isPositive) {
      bg = "#16a34a"; border = "#16a34a"; color = "#fff";
    } else if (isEmergency) {
      bg = "#dc2626"; border = "#dc2626"; color = "#fff";
    } else {
      bg = "#111"; border = "#111"; color = "#fff";
    }
    hoverBg = bg; hoverBorder = border;
  } else {
    if (isEmergency) {
      bg = "#fff5f5"; border = "#fecaca"; color = "#dc2626";
      hoverBg = "#fee2e2"; hoverBorder = "#fca5a5";
    } else if (isPositive) {
      bg = "#f0fdf4"; border = "#bbf7d0"; color = "#15803d";
      hoverBg = "#dcfce7"; hoverBorder = "#86efac";
    } else {
      bg = "#f8f7f4"; border = "#e8e6e1"; color = "#444";
      hoverBg = "#f0eeea"; hoverBorder = "#ccc";
    }
  }

  return (
    <button
      onClick={() => onToggle(symptom)}
      style={{
        padding: "8px 14px",
        borderRadius: "40px",
        border: `1px solid ${border}`,
        background: bg,
        color,
        fontSize: "12px",
        fontWeight: isSelected ? 600 : 400,
        fontFamily: "'Manrope', sans-serif",
        cursor: "pointer",
        transition: "all .15s",
        whiteSpace: "nowrap",
        lineHeight: 1.4,
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
      }}
      onMouseEnter={e => {
        if (!isSelected) {
          e.currentTarget.style.background = hoverBg;
          e.currentTarget.style.borderColor = hoverBorder;
        }
      }}
      onMouseLeave={e => {
        if (!isSelected) {
          e.currentTarget.style.background = bg;
          e.currentTarget.style.borderColor = border;
        }
      }}
    >
      {isSelected && (
        <CheckCircle2 size={11} strokeWidth={2.5} style={{ flexShrink: 0 }} />
      )}
      {symptom}
    </button>
  );
}

function Section({ icon: Icon, title, color, symptoms, selectedSymptoms, onToggle, type }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "12px" }}>
        <div style={{
          width: "24px", height: "24px", borderRadius: "7px",
          background: color + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Icon size={13} color={color} strokeWidth={1.8} />
        </div>
        <span style={{
          fontSize: "10px", fontWeight: 600, letterSpacing: ".16em",
          textTransform: "uppercase", color: "#bbb", fontFamily: "'Manrope', sans-serif",
        }}>{title}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {symptoms.map(symptom => (
          <SymptomPill
            key={symptom}
            symptom={symptom}
            isSelected={selectedSymptoms.includes(symptom)}
            onToggle={onToggle}
            type={type}
          />
        ))}
      </div>
    </div>
  );
}

function MascotStrip({ mood, message, visible, dark = false, size = 52 }) {
  if (!visible || !message) return null;
  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      gap: "10px",
    }}>
      <div style={{ flexShrink: 0, marginTop: 4 }}>
        <Mascot mood={mood} message="" position="left" size={size} />
      </div>
      <div style={{
        flex: 1,
        background: dark ? "rgba(255,255,255,0.07)" : "#f8f7f4",
        border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #e8e6e1",
        borderRadius: "4px 14px 14px 14px",
        padding: "10px 14px",
        fontSize: "13px",
        lineHeight: 1.55,
        color: dark ? "rgba(255,255,255,0.85)" : "#444",
        fontFamily: "'Manrope', sans-serif",
        fontWeight: 400,
        boxShadow: dark ? "none" : "0 1px 8px rgba(0,0,0,0.05)",
      }}>
        {message}
      </div>
    </div>
  );
}

export default function SymptomChecklist({ onClose, onResult, onStartChat }) {
  const navigate = useNavigate();
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [screen, setScreen] = useState("checklist");
  const [result, setResult] = useState(null);

  const [aiResponse, setAiResponse] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const handleSeeResults = async () => {
    if (selectedSymptoms.length === 0) return;
    const classification = classifySymptoms(selectedSymptoms);
    setResult(classification);
    setScreen("result");
    if (onResult) onResult(classification);

    setSubmitting(true);
    try {
      const res = await submitSymptomCheckin({ symptoms: selectedSymptoms });
      setAiResponse(res.data.ai_response);
    } catch (err) {
      console.error('Symptom checkin failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrimaryAction = () => {
    if (result?.action === "emergency") {
      onClose(); navigate("/emergency-alert");
    } else if (result?.action === "map") {
      onClose(); navigate("/map");
    } else {
      const symptomList = selectedSymptoms.join(", ");
      const contextMessage = `I am experiencing the following symptoms: ${symptomList}. Please help me understand what this means and what I should do.`;
      if (onStartChat) onStartChat(contextMessage, selectedSymptoms);
      onClose();
    }
  };

  const handleGoBack = () => { setScreen("checklist"); setResult(null); setAiResponse(null); };

  const hasSelection = selectedSymptoms.length > 0;
  const selectedPhysical = selectedSymptoms.filter(s => PHYSICAL_SYMPTOMS.includes(s));
  const selectedEmotional = selectedSymptoms.filter(s => EMOTIONAL_SYMPTOMS.includes(s));
  const selectedPositive = selectedSymptoms.filter(s => POSITIVE_SYMPTOMS.includes(s));
  const IconComponent = result?.icon || AlertCircle;

  // Mascot mood based on result level
  const getMascotMood = () => {
    if (!result) return "neutral";
    switch (result.level) {
      case "emergency": return "worried";
      case "urgent": return "concerned";
      case "stable": return "happy";
      case "monitor": return "neutral";
      default: return "idle";
    }
  };

  // Dynamic button label and color
  const getActionButtonConfig = () => {
    if (!result) return { label: "", bg: "#111", hoverBg: "#333" };
    switch (result.level) {
      case "emergency":
        return { label: "Send emergency alert", bg: "#dc2626", hoverBg: "#b91c1c" };
      case "urgent":
        return { label: "Find nearest facility", bg: "#d97706", hoverBg: "#b45309" };
      case "stable":
      case "monitor":
      default:
        return { label: "Talk to AI assistant", bg: "#111", hoverBg: "#333" };
    }
  };

  const actionConfig = getActionButtonConfig();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,400&family=Manrope:wght@300;400;500;600&display=swap');
        .sc-overlay { position:fixed; inset:0; z-index:1000; background:rgba(0,0,0,0.45); display:flex; align-items:flex-end; justify-content:center; animation:sc-fade-in .2s ease; }
        @keyframes sc-fade-in { from{opacity:0} to{opacity:1} }
        .sc-sheet { background:#f4f3f0; border-radius:24px 24px 0 0; width:100%; max-width:640px; max-height:92vh; display:flex; flex-direction:column; animation:sc-slide-up .28s cubic-bezier(0.32,0.72,0,1); overflow:hidden; }
        @keyframes sc-slide-up { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }
        .sc-drag { width:40px; height:4px; background:#d1d0cc; border-radius:2px; margin:12px auto 0; flex-shrink:0; }
        .sc-header { display:flex; align-items:center; justify-content:space-between; padding:16px 20px 14px; flex-shrink:0; }
        .sc-icon-btn { width:36px; height:36px; border-radius:50%; border:1px solid #e8e6e1; background:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background .15s; }
        .sc-icon-btn:hover { background:#f0eeea; }
        .sc-body { flex:1; overflow-y:auto; padding:0 20px 0; -webkit-overflow-scrolling:touch; }
        .sc-body::-webkit-scrollbar { width:0; }
        .sc-footer { flex-shrink:0; padding:16px 20px calc(28px + 80px); background:#f4f3f0; border-top:1px solid #e8e6e1; }
        .sc-cta { width:100%; padding:14px; border-radius:14px; border:none; font-family:'Manrope', sans-serif; font-size:14px; font-weight:600; cursor:pointer; transition:background .15s, transform .1s; }
        .sc-cta:active { transform:scale(0.98); }
        .sc-ghost { background:none; border:none; font-family:'Manrope', sans-serif; font-size:12px; color:#aaa; cursor:pointer; padding:10px; display:block; width:100%; text-align:center; transition:color .15s; }
        .sc-ghost:hover { color:#555; }
        .sc-counter { display:inline-flex; align-items:center; justify-content:center; width:18px; height:18px; border-radius:50%; background:#111; color:#fff; font-size:10px; font-weight:600; margin-left:6px; }
        .sc-result-icon-wrap { width:72px; height:72px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; flex-shrink:0; }
        .sc-selected-tag { display:inline-flex; align-items:center; gap:4px; padding:5px 10px; border-radius:20px; font-size:11px; font-weight:500; font-family:'Manrope', sans-serif; whiteSpace:nowrap; }
      `}</style>

      <div className="sc-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="sc-sheet">
          <div className="sc-drag" />

          {/* Header */}
          <div className="sc-header">
            {screen === "result" ? (
              <button className="sc-icon-btn" onClick={handleGoBack}>
                <ChevronLeft size={17} color="#555" strokeWidth={1.8} />
              </button>
            ) : <div style={{ width: 36 }} />}

            <p style={{
              fontFamily: "'Manrope', sans-serif", fontSize: "13px",
              fontWeight: 600, color: "#111", letterSpacing: ".01em",
            }}>
              {screen === "checklist" ? "Symptom check-in" : "Your results"}
              {screen === "checklist" && hasSelection && (
                <span className="sc-counter">{selectedSymptoms.length}</span>
              )}
            </p>

            <button className="sc-icon-btn" onClick={onClose}>
              <X size={16} color="#555" strokeWidth={1.8} />
            </button>
          </div>

          {/* Body */}
          <div className="sc-body">
            {screen === "checklist" ? (
              <>
                <div style={{ marginBottom: "24px" }}>
                  <h1 style={{
                    fontFamily: "'Fraunces', serif", fontSize: "24px",
                    fontWeight: 600, color: "#111", lineHeight: 1.15,
                    letterSpacing: "-.02em", marginBottom: "6px",
                  }}>
                    How are you feeling<br />
                    <span style={{ fontStyle: "italic", fontWeight: 400 }}>right now?</span>
                  </h1>
                  <p style={{
                    fontSize: "13px", color: "#999", fontWeight: 300,
                    fontFamily: "'Manrope', sans-serif", lineHeight: 1.6,
                  }}>
                    Select everything you are experiencing, even things that seem unrelated to your loss.
                  </p>
                </div>

                <Section icon={Activity} title="Physical symptoms" color="#dc2626"
                  symptoms={PHYSICAL_SYMPTOMS} selectedSymptoms={selectedSymptoms}
                  onToggle={toggleSymptom} type="physical" />
                <Section icon={Heart} title="Emotional symptoms" color="#9333ea"
                  symptoms={EMOTIONAL_SYMPTOMS} selectedSymptoms={selectedSymptoms}
                  onToggle={toggleSymptom} type="emotional" />
                <Section icon={CheckCircle2} title="Positive signs" color="#16a34a"
                  symptoms={POSITIVE_SYMPTOMS} selectedSymptoms={selectedSymptoms}
                  onToggle={toggleSymptom} type="positive" />

                <div style={{ height: "8px" }} />
              </>
            ) : (
              result && (
                <>
                  {/* Result card */}
                  <div style={{
                    background: "#fff", border: "1px solid #e8e6e1",
                    borderRadius: "20px", padding: "28px 24px 24px",
                    marginBottom: "16px", textAlign: "center",
                  }}>
                    <div className="sc-result-icon-wrap"
                      style={{ background: result.bgColor, border: `1px solid ${result.borderColor}` }}>
                      <IconComponent size={30} color={result.color} strokeWidth={1.8} />
                    </div>
                    <h2 style={{
                      fontFamily: "'Fraunces', serif", fontSize: "20px",
                      fontWeight: 600, color: "#111", lineHeight: 1.2,
                      letterSpacing: "-.015em", marginBottom: "10px",
                    }}>{result.title}</h2>

                    {/* AI Response with Mascot */}
                    <div style={{ marginTop: "16px", textAlign: "left" }}>
                      {submitting ? (
                        <p style={{
                          fontSize: "13px", color: "#aaa", fontFamily: "'Manrope', sans-serif",
                          lineHeight: 1.6, textAlign: "center",
                        }}>
                          Analysing your symptoms...
                        </p>
                      ) : aiResponse ? (
                        <MascotStrip
                          mood={getMascotMood()}
                          message={aiResponse}
                          visible={true}
                          dark={false}
                          size={42}
                        />
                      ) : null}
                    </div>
                  </div>

                  {/* Selected symptoms summary */}
                  <div style={{
                    background: "#fff", border: "1px solid #e8e6e1",
                    borderRadius: "16px", padding: "16px 18px", marginBottom: "16px",
                  }}>
                    <p style={{
                      fontSize: "10px", fontWeight: 600, letterSpacing: ".16em",
                      textTransform: "uppercase", color: "#bbb",
                      fontFamily: "'Manrope', sans-serif", marginBottom: "12px",
                    }}>You selected</p>

                    {selectedPhysical.length > 0 && (
                      <div style={{ marginBottom: "10px" }}>
                        <p style={{ fontSize: "10px", color: "#dc2626", fontWeight: 600, fontFamily: "'Manrope', sans-serif", marginBottom: "6px", letterSpacing: ".08em", textTransform: "uppercase" }}>Physical</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {selectedPhysical.map(s => (
                            <span key={s} className="sc-selected-tag"
                              style={{ background: "#fff5f5", color: "#dc2626", border: "1px solid #fecaca" }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedEmotional.length > 0 && (
                      <div style={{ marginBottom: "10px" }}>
                        <p style={{ fontSize: "10px", color: "#9333ea", fontWeight: 600, fontFamily: "'Manrope', sans-serif", marginBottom: "6px", letterSpacing: ".08em", textTransform: "uppercase" }}>Emotional</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {selectedEmotional.map(s => (
                            <span key={s} className="sc-selected-tag"
                              style={{ background: "#faf5ff", color: "#9333ea", border: "1px solid #e9d5ff" }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedPositive.length > 0 && (
                      <div>
                        <p style={{ fontSize: "10px", color: "#16a34a", fontWeight: 600, fontFamily: "'Manrope', sans-serif", marginBottom: "6px", letterSpacing: ".08em", textTransform: "uppercase" }}>Positive signs</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {selectedPositive.map(s => (
                            <span key={s} className="sc-selected-tag"
                              style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ height: "8px" }} />
                </>
              )
            )}
          </div>

          {/* Footer */}
          <div className="sc-footer">
            {screen === "checklist" ? (
              <>
                <button
                  className="sc-cta"
                  onClick={handleSeeResults}
                  disabled={!hasSelection}
                  style={{
                    background: hasSelection ? "#111" : "#e8e6e1",
                    color: hasSelection ? "#fff" : "#bbb",
                    cursor: hasSelection ? "pointer" : "not-allowed",
                  }}
                  onMouseEnter={e => { if (hasSelection) e.currentTarget.style.background = "#333"; }}
                  onMouseLeave={e => { if (hasSelection) e.currentTarget.style.background = "#111"; }}
                >
                  {hasSelection
                    ? `See my results — ${selectedSymptoms.length} symptom${selectedSymptoms.length !== 1 ? "s" : ""} selected`
                    : "Select at least one symptom"}
                </button>
                <p style={{
                  textAlign: "center", fontSize: "10px", color: "#ccc",
                  fontFamily: "'Manrope', sans-serif", marginTop: "10px", lineHeight: 1.5,
                }}>
                  Your responses help the AI give you the most accurate guidance.
                </p>
              </>
            ) : (
              result && (
                <>
                  <button
                    className="sc-cta"
                    onClick={handlePrimaryAction}
                    style={{
                      background: actionConfig.bg,
                      color: "#fff",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = actionConfig.hoverBg}
                    onMouseLeave={e => e.currentTarget.style.background = actionConfig.bg}
                  >
                    {actionConfig.label}
                  </button>
                  <button className="sc-ghost" onClick={handleGoBack}>
                    Go back and change my answers
                  </button>
                  <p style={{
                    textAlign: "center", fontSize: "10px", color: "#ccc",
                    fontFamily: "'Manrope', sans-serif", lineHeight: 1.5,
                  }}>
                    This is not a medical diagnosis. Always consult a healthcare professional.
                  </p>
                </>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}