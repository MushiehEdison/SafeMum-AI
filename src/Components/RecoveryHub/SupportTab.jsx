import { useState, useEffect } from "react";
import { Heart, Phone, CheckCircle2, Loader } from "lucide-react";
import { getCounsellors, submitSupportRequest, getNgoMatch } from "../../API/recovery";

const font = "'Manrope', sans-serif";
const SUPPORT_TYPES = ["Counselling", "Transport", "Financial Aid"];

function Initials({ name }) {
  const parts = (name || "").split(" ");
  const init = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0]?.[0] || "?");
  return (
    <div style={{
      width: 42, height: 42, borderRadius: "50%", background: "#f0efeb",
      border: "1.5px solid #e8e6e1", display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#555",
      flexShrink: 0, fontFamily: font, letterSpacing: "0.03em",
    }}>{init}</div>
  );
}

export default function SupportTab() {
  const [counsellors, setCounsellors]       = useState([]);
  const [loading, setLoading]               = useState(true);
  const [supportType, setSupportType]       = useState("");
  const [supportDesc, setSupportDesc]       = useState("");
  const [supportSubmitted, setSubmitted]    = useState(false);
  const [userVuln, setUserVuln] = useState("medium");
  const [showUrgent, setShowUrgent] = useState(false);
  const [orderedTypes, setOrderedTypes] = useState(["Counselling", "Transport", "Financial Aid"]);
  const [counsellingNote, setCounsellingNote] = useState(null);

 useEffect(() => {
  async function fetchAll() {
    try {
      const [counselRes, ngoRes] = await Promise.all([
        getCounsellors(),
        getNgoMatch(),
      ]);
      setCounsellors(counselRes.data.data || []);
      setUserVuln(counselRes.data.user_vuln || "medium");
      setShowUrgent(counselRes.data.show_urgent || false);
      setOrderedTypes(ngoRes.data.ordered_types || ["Counselling", "Transport", "Financial Aid"]);
      setCounsellingNote(ngoRes.data.counselling_note || null);
    } catch (err) {
      console.error('Failed to fetch support data:', err);
    } finally {
      setLoading(false);
    }
  }
  fetchAll();
}, []);

  async function handleSubmit() {
    if (!supportType || !supportDesc.trim()) return;
    try {
      await submitSupportRequest({
        type: supportType,
        description: supportDesc.trim(),
      });
    } catch (err) {
      console.error('Failed to submit:', err);
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSupportType("");
      setSupportDesc("");
    }, 4000);
  }

  const aiMessage = "You have shown real strength recently. If you ever need someone to talk to, these people are always here.";

  return (
    <div style={{ fontFamily: font, display: "flex", flexDirection: "column", gap: 32 }}>

      {/* Title */}
      <div>
        <p style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 600, color: "#111", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 6 }}>
          People who<br /><em style={{ fontStyle: "italic", fontWeight: 400, color: "#555" }}>care.</em>
        </p>
        <p style={{ fontSize: 13, color: "#aaa", fontWeight: 300 }}>You never have to face this alone.</p>
      </div>

      {/* AI card */}
      <div style={{ background: "#fff", border: "1.5px solid #e8e6e1", borderRadius: 20, padding: "18px 20px", display: "flex", gap: 13, alignItems: "flex-start", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <Heart size={16} color="#9ca3af" strokeWidth={1.5} style={{ marginTop: 2, flexShrink: 0 }} />
        <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7 }}>{aiMessage}</p>
      </div>

      {/* Urgent banner */}
      {showUrgent && (
        <div style={{
          background: "#fef2f2", border: "1.5px solid #fecaca",
          borderRadius: 16, padding: "16px 18px",
          display: "flex", gap: 12, alignItems: "flex-start",
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%", background: "#ef4444",
            flexShrink: 0, marginTop: 5, boxShadow: "0 0 0 3px rgba(239,68,68,.2)",
          }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#991b1b", fontFamily: font, marginBottom: 4 }}>
              A counsellor is available for you right now
            </p>
            <p style={{ fontSize: 12, color: "#b91c1c", fontFamily: font, fontWeight: 300, lineHeight: 1.6 }}>
              Based on how you have been feeling, connecting with someone today could really help.
            </p>
          </div>
        </div>
      )}

      {/* Talk to someone */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#bbb", marginBottom: 16 }}>
          Talk to someone
        </p>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
            <Loader size={20} className="animate-spin" color="#aaa" />
          </div>
        ) : counsellors.length === 0 ? (
          <p style={{ fontSize: 13, color: "#aaa", fontStyle: "italic" }}>No counsellors available at the moment.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {counsellors.map(c => (
              <div key={c.id || c._id} style={{ background: "#fff", border: "1.5px solid #e8e6e1", borderRadius: 18, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <Initials name={c.name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 2 }}>{c.name}</p>
                  <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 9 }}>{c.speciality} · {c.area}</p>
                  <span style={{
                    fontSize: 11, fontWeight: 500, padding: "3px 11px", borderRadius: 20,
                    border: c.available ? "1px solid #bbf7d0" : "1px solid #e5e7eb",
                    color: c.available ? "#15803d" : "#9ca3af",
                    background: c.available ? "#f0fdf4" : "transparent",
                  }}>
                    {c.available ? "Available now" : "Unavailable"}
                  </span>
                </div>
                <a href={`tel:${c.phone}`} onClick={e => !c.available && e.preventDefault()} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "10px 16px",
                  background: c.available ? "#111" : "#f3f4f6",
                  color: c.available ? "#fff" : "#bbb",
                  border: "none", borderRadius: 12, fontSize: 13, fontWeight: 500,
                  cursor: c.available ? "pointer" : "not-allowed", textDecoration: "none",
                  fontFamily: font, flexShrink: 0,
                }}>
                  <Phone size={13} strokeWidth={1.8} /> Call
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NGO form */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#bbb", marginBottom: 16 }}>
          Request NGO support
        </p>
        {supportSubmitted ? (
          <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: 18, padding: "20px", display: "flex", alignItems: "center", gap: 12 }}>
            <CheckCircle2 size={20} color="#16a34a" strokeWidth={1.8} />
            <p style={{ fontSize: 14, color: "#15803d", fontWeight: 500 }}>Your request has been sent. Someone will reach out to you soon.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {counsellingNote && (
              <p style={{
                fontSize: 12, color: "#9333ea", fontFamily: font, lineHeight: 1.6,
                padding: "10px 14px", background: "#faf5ff", borderRadius: 10,
                border: "1px solid #e9d5ff",
              }}>
                {counsellingNote}
              </p>
            )}
            <select value={supportType} onChange={e => setSupportType(e.target.value)} style={{
              width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 14,
              padding: "12px 16px", fontSize: 14, color: supportType ? "#111" : "#9ca3af",
              fontFamily: font, background: "#fff", outline: "none", boxSizing: "border-box", appearance: "none",
            }}>
              <option value="" disabled>Select type of support</option>
              {orderedTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <textarea value={supportDesc} onChange={e => setSupportDesc(e.target.value)} rows={3}
              placeholder="Briefly describe what you need"
              style={{ width: "100%", resize: "none", border: "1.5px solid #e5e7eb", borderRadius: 14, padding: "13px 16px", fontSize: 14, color: "#111", fontFamily: font, outline: "none", boxSizing: "border-box", lineHeight: 1.65, background: "#fff" }}
            />
            <button onClick={handleSubmit} disabled={!supportType || !supportDesc.trim()} style={{
              width: "100%", padding: "14px", background: "#111", color: "#fff", border: "none", borderRadius: 14,
              fontSize: 14, fontWeight: 600, cursor: !supportType || !supportDesc.trim() ? "not-allowed" : "pointer",
              fontFamily: font, opacity: !supportType || !supportDesc.trim() ? 0.35 : 1, transition: "opacity 0.2s",
            }}>
              Submit Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
}