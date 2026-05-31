import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Navigation, Clock, ChevronDown, Loader,
} from "lucide-react";
import FacilityNav from "../../Components/FacilityNav";
import { getFacilityReferrals, updateFacilityReferral } from "../../API/facility";

const FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,400&family=Manrope:wght@300;400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  .ir-root{font-family:'Manrope',sans-serif;background:#f4f3f0;min-height:100vh;color:#111;padding-bottom:100px;}
  @media(min-width:768px){.ir-root{padding-left:220px;}}
`;

const FILTERS = ["All", "Pending", "Accepted", "Declined"];

function Toast({ message, visible }) {
  if (!visible) return null;
  return (
    <div style={{ position: "fixed", bottom: 88, left: "50%", transform: "translateX(-50%)", background: "#111", color: "#fff", borderRadius: 20, padding: "10px 20px", fontSize: 13, fontWeight: 500, fontFamily: "'Manrope',sans-serif", zIndex: 9999, whiteSpace: "nowrap" }}>
      {message}
    </div>
  );
}

export default function IncomingReferrals() {
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState([]);
  const [declineReasons, setDeclineReasons] = useState({});
  const [decliningId, setDecliningId] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: "" });

  useEffect(() => {
    async function fetchReferrals() {
      try {
        const res = await getFacilityReferrals();
        setReferrals(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch referrals:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReferrals();
  }, []);

  function showToast(msg) {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: "" }), 2500);
  }

  function toggle(id) {
    setExpanded(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }

async function acceptReferral(id) {
  try {
    await updateFacilityReferral(id, { status: "Accepted" });
    setReferrals(p => p.map(r => (r.id || r._id) === id ? { ...r, status: "Accepted" } : r));
    showToast("Referral accepted. Patient is on their way.");
  } catch { showToast("Failed to accept. Please try again."); }
}

async function declineReferral(id) {
  const reason = declineReasons[id] || "";
  try {
    await updateFacilityReferral(id, { status: "Declined", declineReason: reason });
    setReferrals(p => p.map(r => (r.id || r._id) === id ? { ...r, status: "Declined", declineReason: reason } : r));
    setDecliningId(null);
    showToast("Referral declined. The AI will find the next best facility.");
  } catch { showToast("Failed to decline. Please try again."); }
}

async function markArrived(id) {
  try {
    await updateFacilityReferral(id, { status: "Arrived" });
    setReferrals(p => p.map(r => (r.id || r._id) === id ? { ...r, status: "Arrived" } : r));
    showToast("Patient arrival confirmed.");
  } catch { showToast("Failed to confirm arrival. Please try again."); }
}

  const pendingCount = referrals.filter(r => r.status === "Pending").length;

  const filtered = referrals.filter(r => {
    if (filter === "All") return true;
    return r.status === filter;
  });

  const statusPill = (status) => {
    switch (status) {
      case "Pending": return { background: "#fee2e2", color: "#dc2626", border: "none" };
      case "Accepted": return { background: "transparent", color: "#16a34a", border: "1px solid #86efac" };
      case "Declined": return { background: "transparent", color: "#9ca3af", border: "1px solid #d1d5db" };
      case "Arrived": return { background: "transparent", color: "#2563eb", border: "1px solid #93c5fd" };
      default: return { background: "transparent", color: "#9ca3af", border: "1px solid #d1d5db" };
    }
  };

  const riskBorder = (level) => {
    if (level === "High") return "#dc2626";
    if (level === "Moderate") return "#f97316";
    return "#d1d5db";
  };

  if (loading) {
    return (
      <>
        <style>{FONT_STYLE}</style>
        <FacilityNav />
        <div className="ir-root" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Loader size={24} className="animate-spin" color="#aaa" />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{FONT_STYLE}</style>
      <FacilityNav />

      <div className="ir-root">
        <div style={{ padding: "clamp(20px,4vw,40px) clamp(16px,4vw,40px) 0", maxWidth: 760, display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Top bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button onClick={() => navigate("/facility")} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
              <ArrowLeft size={22} color="#111" strokeWidth={2} />
            </button>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: "#111", fontFamily: "'Manrope',sans-serif" }}>Referrals</h1>
            {pendingCount > 0 && (
              <span style={{ background: "#dc2626", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, fontFamily: "'Manrope',sans-serif" }}>
                {pendingCount} pending
              </span>
            )}
            {pendingCount === 0 && <span style={{ width: 60 }} />}
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

          {/* Referral cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.length === 0 && (
              <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, padding: "40px 0", fontFamily: "'Manrope',sans-serif" }}>No referrals found.</p>
            )}
            {filtered.map(r => {
              const refId = r.id || r._id;
              const isExp = expanded.includes(refId);
              const isPending = r.status === "Pending";
              const isAccepted = r.status === "Accepted";
              const isDeclined = r.status === "Declined";
              const isDeclining = decliningId === refId;
              const pill = statusPill(r.status);
              const borderL = riskBorder(r.riskLevel);

              return (
                <div key={refId} style={{
                  background: "#fff", border: `1px solid ${isAccepted ? "#bbf7d0" : isDeclined ? "#e5e7eb" : "#e8e6e1"}`,
                  borderLeft: `3px solid ${borderL}`, borderRadius: 12, padding: 16, transition: "border-color 0.2s",
                }}>
                  {/* Collapsed header */}
                  <button onClick={() => toggle(refId)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#111", fontFamily: "'Manrope',sans-serif" }}>{r.patientName}</p>
                          <span style={{
                            fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, fontFamily: "'Manrope',sans-serif",
                            background: pill.background, color: pill.color, border: pill.border,
                          }}>{r.status}</span>
                        </div>
                        <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 6, fontFamily: "'Manrope',sans-serif" }}>
                          {r.sentBy || "Sent by AI System"}
                        </p>
                        <p style={{
                          fontSize: 13, color: "#374151", marginBottom: 8, lineHeight: 1.5, fontFamily: "'Manrope',sans-serif",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: isExp ? "normal" : "nowrap",
                        }}>{r.reason}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 8 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#9ca3af", fontFamily: "'Manrope',sans-serif" }}>
                            <MapPin size={11} strokeWidth={1.5} /> {r.patientArea}
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#9ca3af", fontFamily: "'Manrope',sans-serif" }}>
                            <Navigation size={11} strokeWidth={1.5} /> {r.distanceKm} km · ~{r.estimatedArrivalMinutes} min
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#9ca3af", fontFamily: "'Manrope',sans-serif" }}>
                            <Clock size={11} strokeWidth={1.5} /> {r.sentAt}
                          </span>
                        </div>
                        {r.symptoms && r.symptoms.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {r.symptoms.map((s, i) => (
                              <span key={i} style={{ fontSize: 11, color: "#6b7280", padding: "2px 8px", borderRadius: 20, border: "1px solid #e5e7eb", fontFamily: "'Manrope',sans-serif" }}>{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <ChevronDown size={18} strokeWidth={2} color="#9ca3af" style={{
                        flexShrink: 0, marginTop: 4, transition: "transform 0.2s", transform: isExp ? "rotate(180deg)" : "none",
                      }} />
                    </div>
                  </button>

                  {/* Expanded */}
                  {isExp && (
                    <div style={{ borderTop: "1px solid #f3f4f6", marginTop: 14, paddingTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                      <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.65, fontFamily: "'Manrope',sans-serif" }}>{r.reason}</p>

                      {r.patientContext && (
                        <p style={{ fontSize: 12, color: "#9ca3af", fontFamily: "'Manrope',sans-serif" }}>{r.patientContext}</p>
                      )}

                      {r.channel && (
                        <span style={{
                          display: "inline-block", alignSelf: "flex-start", fontSize: 11, fontWeight: 500,
                          padding: "2px 10px", borderRadius: 20, border: "1px solid #d1d5db", color: "#6b7280",
                          fontFamily: "'Manrope',sans-serif",
                        }}>{r.channel}</span>
                      )}

                      {isPending && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <button onClick={() => acceptReferral(refId)} style={{
                            width: "100%", padding: "12px", background: "#16a34a", color: "#fff", border: "none",
                            borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope',sans-serif",
                          }}>Accept referral</button>
                          <button onClick={() => setDecliningId(isDeclining ? null : refId)} style={{
                            width: "100%", padding: "12px", background: "transparent", color: "#dc2626",
                            border: "1.5px solid #dc2626", borderRadius: 12, fontSize: 13, fontWeight: 600,
                            cursor: "pointer", fontFamily: "'Manrope',sans-serif",
                          }}>Decline referral</button>
                          {isDeclining && (
                            <div style={{ display: "flex", gap: 8 }}>
                              <input
                                value={declineReasons[refId] || ""}
                                onChange={e => setDeclineReasons(p => ({ ...p, [refId]: e.target.value }))}
                                placeholder="Reason for declining (optional)"
                                style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", fontFamily: "'Manrope',sans-serif" }}
                              />
                              <button onClick={() => declineReferral(refId)} style={{
                                padding: "9px 14px", background: "transparent", color: "#dc2626",
                                border: "1.5px solid #dc2626", borderRadius: 10, fontSize: 13, fontWeight: 600,
                                cursor: "pointer", fontFamily: "'Manrope',sans-serif",
                              }}>Confirm</button>
                            </div>
                          )}
                        </div>
                      )}

                      {isAccepted && (
                        <div>
                          <p style={{ fontSize: 13, color: "#15803d", marginBottom: 10, fontFamily: "'Manrope',sans-serif" }}>
                            Patient expected — arriving in approximately {r.estimatedArrivalMinutes} minutes.
                          </p>
                          <button onClick={() => markArrived(refId)} style={{
                            padding: "10px 18px", background: "transparent", color: "#15803d",
                            border: "1.5px solid #16a34a", borderRadius: 12, fontSize: 13, fontWeight: 600,
                            cursor: "pointer", fontFamily: "'Manrope',sans-serif",
                          }}>Mark patient arrived</button>
                        </div>
                      )}

                      {isDeclined && r.declineReason && (
                        <p style={{ fontSize: 13, color: "#9ca3af", fontStyle: "italic", fontFamily: "'Manrope',sans-serif" }}>
                          {r.declineReason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
}