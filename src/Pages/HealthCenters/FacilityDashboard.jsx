import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, AlertTriangle, TrendingUp, TrendingDown,
  MapPin, Navigation, ChevronRight, ArrowUpRight
} from "lucide-react";
import FacilityNav from "../../Components/FacilityNav";

/* ── Fonts ── */
const FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,400&family=Manrope:wght@300;400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  .fd-root{font-family:'Manrope',sans-serif;background:#f4f3f0;min-height:100vh;color:#111;}
  @media(min-width:768px){.fd-root{padding-left:220px;}}
`;

/* ── Dummy data ── */
const dummyHospital = {
  name: "Kenyatta National Hospital", isOpen: true,
  capabilities: { postLossCare: true, bloodBank: true, surgical: true, maternity: true }
};
const dummyStats = {
  activeAlerts: 1, pendingReferrals: 2, patientsExpectedToday: 1, resolvedThisWeek: 8,
  trends: {
    activeAlerts:           { direction: "up",   percent: 50 },
    pendingReferrals:       { direction: "down", percent: 20 },
    patientsExpectedToday:  { direction: "up",   percent: 10 },
    resolvedThisWeek:       { direction: "up",   percent: 33 },
  }
};
const dummyAlerts = [
  { id: 1, receivedAt: "11:39 PM", timeAgo: "3 minutes ago", symptom: "Heavy bleeding that will not stop", patientName: "Sarah",  patientArea: "Parklands", distanceKm: 3.2, channel: "App",  riskLevel: "Emergency", status: "Unacknowledged", minutesSinceReceived: 3   },
  { id: 2, receivedAt: "9:15 PM",  timeAgo: "2 hours ago",   symptom: "Fever and feeling very unwell",    patientName: "Amara",  patientArea: "Kibera",    distanceKm: 7.1, channel: "USSD", riskLevel: "High",      status: "Acknowledged",   minutesSinceReceived: 125 },
];
const dummyReferrals = [
  { id: 1, patientName: "Grace",    reason: "Suspected incomplete miscarriage — retained tissue", riskLevel: "High",     distanceKm: 4.2, estimatedArrivalMinutes: 15, status: "Pending",  sentAt: "5 minutes ago" },
  { id: 2, patientName: "Blessing", reason: "Post-ectopic surgery follow-up — wound concern",     riskLevel: "Moderate", distanceKm: 6.8, estimatedArrivalMinutes: 25, status: "Accepted", sentAt: "1 hour ago"    },
];

const CHANNEL_TAG = { App: "text-blue-600 border-blue-200 bg-blue-50", USSD: "text-purple-600 border-purple-200 bg-purple-50", "Voice call": "text-green-700 border-green-200 bg-green-50", WhatsApp: "text-emerald-700 border-emerald-200 bg-emerald-50" };
const CAP_LABELS  = { postLossCare: "Post-loss care", bloodBank: "Blood bank", surgical: "Surgical", maternity: "Maternity" };

function SectionLabel({ children }) {
  return <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#bbb", marginBottom: 12, fontFamily: "'Manrope',sans-serif" }}>{children}</p>;
}

function Toast({ message, visible }) {
  if (!visible) return null;
  return (
    <div style={{ position: "fixed", bottom: 88, left: "50%", transform: "translateX(-50%)", background: "#111", color: "#fff", borderRadius: 20, padding: "10px 20px", fontSize: 13, fontWeight: 500, fontFamily: "'Manrope',sans-serif", zIndex: 9999, whiteSpace: "nowrap" }}>
      {message}
    </div>
  );
}

export default function FacilityDashboard() {
  const navigate = useNavigate();
  const [hospital, setHospital]           = useState(dummyHospital);
  const [alerts, setAlerts]               = useState(dummyAlerts);
  const [referrals, setReferrals]         = useState(dummyReferrals);
  const [capabilities, setCapabilities]   = useState(dummyHospital.capabilities);
  const [toast, setToast]                 = useState({ visible: false, message: "" });
  const [declineInputs, setDeclineInputs] = useState({});
  const [decliningId, setDecliningId]     = useState(null);

  const unacked = alerts.find(a => a.status === "Unacknowledged");
  const unackedCount = alerts.filter(a => a.status === "Unacknowledged").length;

  function showToast(msg) {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: "" }), 2000);
  }
  function ackAlert(id)      { setAlerts(p => p.map(a => a.id === id ? { ...a, status: "Acknowledged" } : a)); }
  function acceptRef(id)     { setReferrals(p => p.map(r => r.id === id ? { ...r, status: "Accepted" } : r)); }
  function declineRef(id)    { setReferrals(p => p.map(r => r.id === id ? { ...r, status: "Declined" } : r)); setDecliningId(null); }
  function markArrived(id)   { setReferrals(p => p.map(r => r.id === id ? { ...r, status: "Arrived" } : r)); }
  function toggleCap(key)    { setCapabilities(p => ({ ...p, [key]: !p[key] })); showToast("Capabilities updated"); }

  const statCards = [
    { label: "Active Alerts",           value: dummyStats.activeAlerts,           key: "activeAlerts"           },
    { label: "Pending Referrals",        value: dummyStats.pendingReferrals,        key: "pendingReferrals"       },
    { label: "Expected Today",           value: dummyStats.patientsExpectedToday,   key: "patientsExpectedToday"  },
    { label: "Resolved This Week",       value: dummyStats.resolvedThisWeek,        key: "resolvedThisWeek"       },
  ];

  return (
    <>
      <style>{FONT_STYLE}</style>
      <FacilityNav />

      <div className="fd-root" style={{ paddingBottom: 100 }}>

        {/* Pulsing emergency banner */}
        {unacked && (
          <div style={{ background: "#dc2626", padding: "12px 20px", display: "flex", alignItems: "center", gap: 12 }}>
            <style>{`@keyframes bpulse{0%,100%{opacity:1}50%{opacity:.85}}.bpulse{animation:bpulse 1.5s ease-in-out infinite}`}</style>
            <div className="bpulse" style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
              <AlertTriangle size={18} color="#fff" strokeWidth={2} style={{ flexShrink: 0 }} />
              <p style={{ color: "#fff", fontSize: 13, fontWeight: 600, flex: 1, fontFamily: "'Manrope',sans-serif" }}>
                Emergency — {unacked.symptom} · {unacked.timeAgo}
              </p>
            </div>
            <button onClick={() => ackAlert(unacked.id)} style={{ flexShrink: 0, border: "1.5px solid rgba(255,255,255,0.7)", background: "transparent", color: "#fff", fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "'Manrope',sans-serif" }}>
              Acknowledge
            </button>
          </div>
        )}

        <div style={{ padding: "clamp(20px,4vw,40px) clamp(16px,4vw,40px) 0", maxWidth: 900, display: "flex", flexDirection: "column", gap: 32 }}>

          {/* Page title area */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#bbb", marginBottom: 6, fontFamily: "'Manrope',sans-serif" }}>
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 600, color: "#111", lineHeight: 1.05, letterSpacing: "-0.02em" }}>
                Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}.
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, background: "#111", color: "#fff", fontSize: 11, fontWeight: 500, letterSpacing: "0.06em", padding: "7px 14px", borderRadius: 40 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 0 3px rgba(74,222,128,.25)" }} />
                  Facility Open
                </div>
                <button onClick={() => setHospital(p => ({ ...p, isOpen: !p.isOpen }))} style={{
                  padding: "7px 14px", borderRadius: 40, fontSize: 11, fontWeight: 500,
                  background: hospital.isOpen ? "#f0fdf4" : "#f3f4f6",
                  color: hospital.isOpen ? "#15803d" : "#6b7280",
                  border: `1px solid ${hospital.isOpen ? "#bbf7d0" : "#e5e7eb"}`,
                  cursor: "pointer", fontFamily: "'Manrope',sans-serif"
                }}>
                  {hospital.isOpen ? "Open" : "Closed"}
                </button>
                <div style={{ position: "relative", cursor: "pointer" }} onClick={() => navigate("/facility/alerts")}>
                  <Bell size={20} strokeWidth={1.8} color="#374151" />
                  {unackedCount > 0 && <span style={{ position: "absolute", top: -5, right: -5, width: 16, height: 16, background: "#dc2626", borderRadius: "50%", fontSize: 9, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>{unackedCount}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Stat cards 2x2 */}
          <div>
            <SectionLabel>Overview</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
              {statCards.map(({ label, value, key }) => {
                const trend = dummyStats.trends[key];
                const up = trend.direction === "up";
                return (
                  <div key={key} style={{ background: "#fff", border: "1px solid #e8e6e1", borderRadius: 18, padding: "18px 20px" }}>
                    <p style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8, fontFamily: "'Manrope',sans-serif" }}>{label}</p>
                    <p style={{ fontFamily: "'Fraunces',serif", fontSize: 36, fontWeight: 600, color: "#111", lineHeight: 1, marginBottom: 12 }}>{value}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      {up ? <TrendingUp size={13} color="#16a34a" strokeWidth={2} /> : <TrendingDown size={13} color="#dc2626" strokeWidth={2} />}
                      <span style={{ fontSize: 11, fontWeight: 600, color: up ? "#16a34a" : "#dc2626", fontFamily: "'Manrope',sans-serif" }}>{trend.percent}%</span>
                      <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: "'Manrope',sans-serif" }}>vs last week</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active alerts */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <SectionLabel>Active alerts</SectionLabel>
              <button onClick={() => navigate("/facility/alerts")} style={{ fontSize: 12, color: "#16a34a", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "'Manrope',sans-serif", display: "flex", alignItems: "center", gap: 3 }}>
                See all <ChevronRight size={13} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {alerts.map(a => {
                const isEmerg = a.riskLevel === "Emergency";
                const isOld   = a.status === "Unacknowledged" && a.minutesSinceReceived > 15;
                return (
                  <div key={a.id} style={{ background: isOld ? "#fef2f2" : "#fff", border: "1px solid #e8e6e1", borderLeft: `3px solid ${isEmerg ? "#dc2626" : "#f97316"}`, borderRadius: 16, padding: "16px 18px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 7, marginBottom: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: a.minutesSinceReceived < 10 ? "#dc2626" : "#9ca3af", fontFamily: "'Manrope',sans-serif" }}>{a.timeAgo}</span>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, border: "1px solid", fontFamily: "'Manrope',sans-serif" + (CHANNEL_TAG[a.channel] || "") }} className={CHANNEL_TAG[a.channel]}>{a.channel}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: isEmerg ? "#fee2e2" : "transparent", color: isEmerg ? "#dc2626" : "#ea580c", border: isEmerg ? "none" : "1px solid #f97316", fontFamily: "'Manrope',sans-serif" }}>{a.riskLevel}</span>
                      {isOld && <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, color: "#dc2626", fontFamily: "'Manrope',sans-serif" }}>No response yet</span>}
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 6, fontFamily: "'Manrope',sans-serif" }}>{a.symptom}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#9ca3af", marginBottom: 14, fontFamily: "'Manrope',sans-serif" }}>
                      <MapPin size={12} strokeWidth={1.8} /> {a.patientArea} · {a.distanceKm} km
                    </div>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      {a.status === "Unacknowledged" && (
                        <button onClick={() => ackAlert(a.id)} style={{ fontSize: 12, fontWeight: 600, border: "1.5px solid #dc2626", color: "#dc2626", background: "transparent", padding: "7px 14px", borderRadius: 10, cursor: "pointer", fontFamily: "'Manrope',sans-serif" }}>
                          Acknowledge
                        </button>
                      )}
                      <button onClick={() => navigate("/facility/alerts")} style={{ fontSize: 12, fontWeight: 600, border: "1.5px solid #e5e7eb", color: "#6b7280", background: "transparent", padding: "7px 14px", borderRadius: 10, cursor: "pointer", fontFamily: "'Manrope',sans-serif" }}>
                        View details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Referrals */}
          <div>
            <SectionLabel>Incoming referrals</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {referrals.map(r => {
                const accepted = r.status === "Accepted";
                const arrived  = r.status === "Arrived";
                const declined = r.status === "Declined";
                return (
                  <div key={r.id} style={{ background: "#fff", border: `1px solid ${accepted || arrived ? "#bbf7d0" : declined ? "#e5e7eb" : "#e8e6e1"}`, borderRadius: 16, padding: "16px 18px" }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 4, fontFamily: "'Manrope',sans-serif" }}>Patient: {r.patientName}</p>
                    <p style={{ fontSize: 13, color: "#374151", marginBottom: 10, lineHeight: 1.55, fontFamily: "'Manrope',sans-serif" }}>{r.reason}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20, background: r.riskLevel === "High" ? "#fee2e2" : "transparent", color: r.riskLevel === "High" ? "#dc2626" : "#ea580c", border: r.riskLevel === "High" ? "none" : "1px solid #f97316", fontFamily: "'Manrope',sans-serif" }}>{r.riskLevel}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#9ca3af", fontFamily: "'Manrope',sans-serif" }}><Navigation size={11} strokeWidth={1.8} /> {r.distanceKm} km · ~{r.estimatedArrivalMinutes} min</span>
                      <span style={{ fontSize: 12, color: "#bbb", marginLeft: "auto", fontFamily: "'Manrope',sans-serif" }}>{r.sentAt}</span>
                    </div>

                    {r.status === "Pending" && (
                      <>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => acceptRef(r.id)} style={{ flex: 1, fontSize: 13, fontWeight: 600, border: "1.5px solid #16a34a", color: "#15803d", background: "transparent", padding: "9px", borderRadius: 12, cursor: "pointer", fontFamily: "'Manrope',sans-serif" }}>Accept</button>
                          <button onClick={() => setDecliningId(decliningId === r.id ? null : r.id)} style={{ flex: 1, fontSize: 13, fontWeight: 600, border: "1.5px solid #dc2626", color: "#dc2626", background: "transparent", padding: "9px", borderRadius: 12, cursor: "pointer", fontFamily: "'Manrope',sans-serif" }}>Decline</button>
                        </div>
                        {decliningId === r.id && (
                          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                            <input value={declineInputs[r.id] || ""} onChange={e => setDeclineInputs(p => ({ ...p, [r.id]: e.target.value }))}
                              placeholder="Reason for declining (optional)"
                              style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", fontFamily: "'Manrope',sans-serif" }} />
                            <button onClick={() => declineRef(r.id)} style={{ background: "#dc2626", color: "#fff", border: "none", padding: "9px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope',sans-serif" }}>Confirm</button>
                          </div>
                        )}
                      </>
                    )}

                    {(accepted || arrived) && (
                      <div>
                        <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, background: "#f0fdf4", color: "#15803d", padding: "2px 10px", borderRadius: 20, marginBottom: 6, fontFamily: "'Manrope',sans-serif" }}>
                          {arrived ? "Arrived" : "Accepted"}
                        </span>
                        <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 10, fontFamily: "'Manrope',sans-serif" }}>Patient arriving in approximately {r.estimatedArrivalMinutes} minutes.</p>
                        {accepted && (
                          <button onClick={() => markArrived(r.id)} style={{ fontSize: 13, fontWeight: 600, border: "1.5px solid #16a34a", color: "#15803d", background: "transparent", padding: "8px 16px", borderRadius: 10, cursor: "pointer", fontFamily: "'Manrope',sans-serif" }}>
                            Mark arrived
                          </button>
                        )}
                      </div>
                    )}

                    {declined && <p style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic", fontFamily: "'Manrope',sans-serif" }}>Referral declined.</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <SectionLabel>Current capabilities</SectionLabel>
              <button onClick={() => navigate("/facility/capabilities")} style={{ fontSize: 12, color: "#16a34a", fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "'Manrope',sans-serif", display: "flex", alignItems: "center", gap: 3 }}>
                Update <ArrowUpRight size={12} />
              </button>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e8e6e1", borderRadius: 18, overflow: "hidden" }}>
              {Object.entries(CAP_LABELS).map(([key, label], i, arr) => (
                <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <span style={{ fontSize: 13, color: "#374151", fontFamily: "'Manrope',sans-serif" }}>{label}</span>
                  <button onClick={() => toggleCap(key)} style={{ position: "relative", width: 44, height: 24, borderRadius: 12, background: capabilities[key] ? "#16a34a" : "#e5e7eb", border: "none", cursor: "pointer", transition: "background 0.2s" }}>
                    <span style={{ position: "absolute", top: 2, left: capabilities[key] ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.15)", transition: "left 0.2s" }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
}