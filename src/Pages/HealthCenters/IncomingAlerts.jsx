import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, ChevronDown } from "lucide-react";
import FacilityNav from "../../Components/FacilityNav";

const FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,400&family=Manrope:wght@300;400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  .ia-root{font-family:'Manrope',sans-serif;background:#f4f3f0;min-height:100vh;color:#111;padding-bottom:100px;}
  @media(min-width:768px){.ia-root{padding-left:220px;}}
`;

const dummyAlerts = [
  { id: 1, receivedAt: "May 20, 2026 at 11:39 PM", timeAgo: "3 minutes ago", symptom: "Heavy bleeding that will not stop", patientName: "Sarah",  patientArea: "Parklands, Nairobi", patientCoords: "-1.2614, 36.8022", distanceKm: 3.2, channel: "App",        riskLevel: "Emergency", status: "Unacknowledged", minutesSinceReceived: 3,    aiMessage: "EMERGENCY ALERT — SafeMum AI\nPatient: Sarah (post-loss, 21 days)\nSituation: Heavy bleeding that will not stop\nLocation: Parklands, Nairobi (-1.2614, 36.8022)\nTime: May 20, 2026 at 11:39 PM\nPlease respond immediately.", timeline: [{ time: "11:39 PM", action: "Alert received" }], outcome: null },
  { id: 2, receivedAt: "May 20, 2026 at 9:15 PM",  timeAgo: "2 hours ago",   symptom: "Fever and feeling very unwell",    patientName: "Amara",  patientArea: "Kibera, Nairobi",    patientCoords: "-1.3133, 36.7833", distanceKm: 7.1, channel: "USSD",       riskLevel: "High",      status: "Acknowledged",   minutesSinceReceived: 125,  aiMessage: "EMERGENCY ALERT — SafeMum AI\nPatient: Amara (post-loss, 14 days)\nSituation: Fever and feeling very unwell\nLocation: Kibera, Nairobi\nTime: May 20, 2026 at 9:15 PM\nPlease respond immediately.",        timeline: [{ time: "9:15 PM", action: "Alert received" }, { time: "9:18 PM", action: "Alert acknowledged" }], outcome: null },
  { id: 3, receivedAt: "May 19, 2026 at 2:30 PM",  timeAgo: "Yesterday",     symptom: "Severe pain or cramping",          patientName: "Fatuma", patientArea: "Eastleigh, Nairobi", patientCoords: "-1.2833, 36.8500", distanceKm: 5.4, channel: "Voice call", riskLevel: "High",      status: "Resolved",       minutesSinceReceived: 1400, aiMessage: "EMERGENCY ALERT — SafeMum AI\nPatient: Fatuma (post-loss, 6 days)\nSituation: Severe pain or cramping\nLocation: Eastleigh, Nairobi\nTime: May 19, 2026 at 2:30 PM\nPlease respond immediately.",          timeline: [{ time: "2:30 PM", action: "Alert received" }, { time: "2:33 PM", action: "Alert acknowledged" }, { time: "3:10 PM", action: "Patient arrived" }, { time: "5:45 PM", action: "Case resolved" }], outcome: "Patient treated for incomplete miscarriage. Discharged after 2 hours observation." },
];

const CHANNEL_TAG = { App: { color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" }, USSD: { color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" }, "Voice call": { color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" }, WhatsApp: { color: "#065f46", bg: "#ecfdf5", border: "#6ee7b7" } };

function statusPillStyle(status) {
  if (status === "Unacknowledged") return { background: "#fee2e2", color: "#dc2626", border: "none" };
  if (status === "Acknowledged")   return { background: "transparent", color: "#2563eb", border: "1px solid #93c5fd" };
  return { background: "transparent", color: "#15803d", border: "1px solid #86efac" };
}

export default function IncomingAlerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts]         = useState(dummyAlerts);
  const [filter, setFilter]         = useState("All");
  const [search, setSearch]         = useState("");
  const [expanded, setExpanded]     = useState([]);
  const [outcomes, setOutcomes]     = useState({});
  const [confirming, setConfirming] = useState([]);

  const FILTERS = ["All", "Unacknowledged", "Acknowledged", "Resolved"];

  function toggle(id)     { setExpanded(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]); }

  function ackAlert(id) {
    const t = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    setAlerts(p => p.map(a => a.id === id ? { ...a, status: "Acknowledged", timeline: [...a.timeline, { time: t, action: "Alert acknowledged" }] } : a));
  }

  function markArrived(id) {
    const t = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    setAlerts(p => p.map(a => a.id === id ? { ...a, timeline: [...a.timeline, { time: t, action: "Patient arrived" }] } : a));
    setConfirming(p => [...p, id]);
  }

  function markResolved(id) {
    const t = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    setAlerts(p => p.map(a => a.id === id ? { ...a, status: "Resolved", outcome: outcomes[id] || "", timeline: [...a.timeline, { time: t, action: "Case resolved" }] } : a));
    setConfirming(p => p.filter(x => x !== id));
  }

  const filtered = alerts.filter(a => {
    const matchF = filter === "All" || a.status === filter;
    const q = search.toLowerCase();
    const matchS = !q || a.symptom.toLowerCase().includes(q) || a.patientArea.toLowerCase().includes(q) || a.status.toLowerCase().includes(q);
    return matchF && matchS;
  });

  return (
    <>
      <style>{FONT_STYLE}</style>
      <FacilityNav />

      <div className="ia-root">
        <div style={{ padding: "clamp(20px,4vw,40px) clamp(16px,4vw,40px) 0", maxWidth: 860, display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Title */}
          <div>
            <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 600, color: "#111", lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 4 }}>
              Incoming alerts.
            </h1>
            <p style={{ fontSize: 13, color: "#9ca3af", fontFamily: "'Manrope',sans-serif", fontWeight: 300 }}>
              {alerts.filter(a => a.status !== "Resolved").length} active · {alerts.filter(a => a.status === "Unacknowledged").length} unacknowledged
            </p>
          </div>

          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid #e8e6e1", borderRadius: 14, padding: "10px 14px" }}>
            <Search size={15} strokeWidth={1.8} color="#9ca3af" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by symptom, patient area, or status"
              style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: "#111", fontFamily: "'Manrope',sans-serif", background: "transparent" }} />
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                flexShrink: 0, padding: "7px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: filter === f ? "none" : "1.5px solid #e5e7eb",
                background: filter === f ? "#111" : "transparent",
                color: filter === f ? "#fff" : "#6b7280",
                cursor: "pointer", fontFamily: "'Manrope',sans-serif", transition: "all 0.15s",
              }}>{f}</button>
            ))}
          </div>

          {/* Alert cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.length === 0 && (
              <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, padding: "40px 0", fontFamily: "'Manrope',sans-serif" }}>No alerts match your search.</p>
            )}
            {filtered.map(a => {
              const isExp     = expanded.includes(a.id);
              const isEmerg   = a.riskLevel === "Emergency";
              const noResp    = a.status === "Unacknowledged" && a.minutesSinceReceived > 15;
              const isConf    = confirming.includes(a.id);
              const ch        = CHANNEL_TAG[a.channel] || { color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb" };
              const borderCol = isEmerg ? "#dc2626" : a.status === "Resolved" ? "#d1d5db" : "#f97316";

              return (
                <div key={a.id} style={{ background: "#fff", border: "1px solid #e8e6e1", borderLeft: `3px solid ${borderCol}`, borderRadius: 16, overflow: "hidden" }}>
                  {/* Header — always visible */}
                  <button style={{ width: "100%", textAlign: "left", padding: "16px 18px", background: "transparent", border: "none", cursor: "pointer" }} onClick={() => toggle(a.id)}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, justifyContent: "space-between" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 7, marginBottom: 9 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: a.minutesSinceReceived < 10 ? "#dc2626" : "#9ca3af", fontFamily: "'Manrope',sans-serif" }}>{a.timeAgo}</span>
                          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, fontFamily: "'Manrope',sans-serif", background: ch.bg, color: ch.color, border: `1px solid ${ch.border}` }}>{a.channel}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, fontFamily: "'Manrope',sans-serif", background: isEmerg ? "#fee2e2" : "transparent", color: isEmerg ? "#dc2626" : "#ea580c", border: isEmerg ? "none" : "1px solid #f97316" }}>{a.riskLevel}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, fontFamily: "'Manrope',sans-serif", ...statusPillStyle(a.status) }}>{a.status}</span>
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 5, fontFamily: "'Manrope',sans-serif" }}>{a.symptom}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#9ca3af", fontFamily: "'Manrope',sans-serif" }}>
                          <MapPin size={11} strokeWidth={1.8} /> {a.patientArea} · {a.distanceKm} km
                        </div>
                      </div>
                      <ChevronDown size={18} strokeWidth={2} color="#9ca3af" style={{ flexShrink: 0, transition: "transform 0.2s", transform: isExp ? "rotate(180deg)" : "none", marginTop: 2 }} />
                    </div>
                  </button>

                  {/* Expanded */}
                  {isExp && (
                    <div style={{ borderTop: "1px solid #f3f4f6", padding: "18px", display: "flex", flexDirection: "column", gap: 16 }}>
                      {/* AI message */}
                      <div style={{ background: "#f4f3f0", borderRadius: 12, padding: "12px 14px" }}>
                        <pre style={{ fontSize: 12, color: "#374151", whiteSpace: "pre-wrap", fontFamily: "ui-monospace, monospace", lineHeight: 1.65 }}>{a.aiMessage}</pre>
                      </div>

                      {/* Coords */}
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#9ca3af", fontFamily: "ui-monospace, monospace" }}>
                        <MapPin size={12} strokeWidth={1.8} color="#9ca3af" /> {a.patientCoords}
                      </div>

                      {/* Timeline */}
                      <div>
                        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#bbb", marginBottom: 12, fontFamily: "'Manrope',sans-serif" }}>Timeline</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {a.timeline.map((entry, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: i === a.timeline.length - 1 ? "#111" : "#d1d5db", flexShrink: 0 }} />
                              <span style={{ fontSize: 11, color: "#9ca3af", width: 56, flexShrink: 0, fontFamily: "'Manrope',sans-serif" }}>{entry.time}</span>
                              <span style={{ fontSize: 13, color: "#374151", fontFamily: "'Manrope',sans-serif" }}>{entry.action}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {noResp && <p style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", fontFamily: "'Manrope',sans-serif" }}>No response for {a.minutesSinceReceived} minutes</p>}

                      {/* Actions */}
                      {a.status === "Unacknowledged" && (
                        <button onClick={() => ackAlert(a.id)} style={{ border: "2px solid #dc2626", color: "#dc2626", background: "transparent", fontSize: 14, fontWeight: 600, padding: "12px", borderRadius: 14, cursor: "pointer", fontFamily: "'Manrope',sans-serif", width: "100%" }}>
                          Acknowledge
                        </button>
                      )}

                      {a.status === "Acknowledged" && !isConf && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => markArrived(a.id)} style={{ flex: 1, border: "1.5px solid #16a34a", color: "#15803d", background: "transparent", fontSize: 13, fontWeight: 600, padding: "10px", borderRadius: 12, cursor: "pointer", fontFamily: "'Manrope',sans-serif" }}>Mark patient arrived</button>
                          <button onClick={() => setConfirming(p => [...p, a.id])} style={{ flex: 1, border: "1.5px solid #e5e7eb", color: "#6b7280", background: "transparent", fontSize: 13, fontWeight: 600, padding: "10px", borderRadius: 12, cursor: "pointer", fontFamily: "'Manrope',sans-serif" }}>Mark resolved</button>
                        </div>
                      )}

                      {isConf && a.status !== "Resolved" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <textarea value={outcomes[a.id] || ""} onChange={e => setOutcomes(p => ({ ...p, [a.id]: e.target.value }))} rows={3}
                            placeholder="What happened? What treatment was given?"
                            style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: "10px 14px", fontSize: 13, outline: "none", resize: "none", fontFamily: "'Manrope',sans-serif", lineHeight: 1.6 }} />
                          <button onClick={() => markResolved(a.id)} style={{ background: "#111", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, padding: "12px", borderRadius: 12, cursor: "pointer", fontFamily: "'Manrope',sans-serif" }}>
                            Confirm resolve
                          </button>
                        </div>
                      )}

                      {a.status === "Resolved" && a.outcome && (
                        <p style={{ fontSize: 13, color: "#6b7280", fontStyle: "italic", lineHeight: 1.6, fontFamily: "'Manrope',sans-serif" }}>{a.outcome}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}