// src/Pages/HealthCenters/IncomingAlerts.jsx
import { useState, useEffect } from "react";
import { Search, MapPin, ChevronDown, Loader, Navigation, ExternalLink } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import FacilityNav from "../../Components/FacilityNav";
import { getFacilityAlerts, respondToAlert, getFacilityProfile } from "../../API/facility";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const patientIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,400&family=Manrope:wght@300;400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  .ia-root{font-family:'Manrope',sans-serif;background:#f4f3f0;min-height:100vh;color:#111;padding-bottom:100px;}
  @media(min-width:768px){.ia-root{padding-left:220px;}}
`;

const CHANNEL_TAG = {
  App:          { color: "#1d4ed8", bg: "#eff6ff",  border: "#bfdbfe" },
  USSD:         { color: "#7c3aed", bg: "#f5f3ff",  border: "#ddd6fe" },
  "Voice call": { color: "#15803d", bg: "#f0fdf4",  border: "#bbf7d0" },
  WhatsApp:     { color: "#065f46", bg: "#ecfdf5",  border: "#6ee7b7" },
};

function statusPillStyle(status) {
  if (status === "Unacknowledged") return { background: "#fee2e2", color: "#dc2626", border: "none" };
  if (status === "Acknowledged")   return { background: "transparent", color: "#2563eb", border: "1px solid #93c5fd" };
  return { background: "transparent", color: "#15803d", border: "1px solid #86efac" };
}

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 14);
  }, [position, map]);
  return null;
}

function PatientLocationMap({ alert, facilityLat, facilityLon }) {
  let patLat = null;
  let patLon = null;

  if (alert.patientCoords && typeof alert.patientCoords === 'string') {
    const parts = alert.patientCoords.split(',').map(p => parseFloat(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      patLat = parts[0];
      patLon = parts[1];
    }
  }
  if (!patLat && alert.patientLat) patLat = alert.patientLat;
  if (!patLon && alert.patientLon) patLon = alert.patientLon;

  if (!patLat || !patLon) {
    return (
      <div style={{
        background: "#f9fafb", border: "1px dashed #e5e7eb", borderRadius: 12,
        padding: "16px 18px", display: "flex", alignItems: "center", gap: 10,
      }}>
        <MapPin size={16} color="#d1d5db" strokeWidth={1.5} />
        <p style={{ fontSize: 12, color: "#9ca3af", fontFamily: "'Manrope',sans-serif" }}>
          Patient location not captured for this alert.
        </p>
      </div>
    );
  }

  const googleMapsDirections = facilityLat && facilityLon
    ? `https://www.google.com/maps/dir/?api=1&origin=${facilityLat},${facilityLon}&destination=${patLat},${patLon}&travelmode=driving`
    : `https://www.google.com/maps/dir/?api=1&destination=${patLat},${patLon}&travelmode=driving`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <p style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
        textTransform: "uppercase", color: "#bbb",
        fontFamily: "'Manrope',sans-serif",
      }}>
        Patient location
      </p>

      <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb", height: 200, position: "relative" }}>
        <MapContainer
          center={[patLat, patLon]}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
          zoomControl={false}
          attributionControl={false}
          dragging={false}
          doubleClickZoom={false}
          touchZoom={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[patLat, patLon]} icon={patientIcon}>
            <Popup>
              <span style={{ fontSize: 12, fontFamily: "'Manrope',sans-serif" }}>
                <strong>Patient</strong><br />
                {patLat.toFixed(5)}, {patLon.toFixed(5)}
              </span>
            </Popup>
          </Marker>
          <RecenterMap position={[patLat, patLon]} />
        </MapContainer>

        <div style={{
          position: "absolute", bottom: 8, left: 8, zIndex: 1000,
          background: "rgba(0,0,0,0.55)", borderRadius: 6, padding: "3px 8px",
        }}>
          <span style={{ fontSize: 10, color: "#fff", fontFamily: "ui-monospace, monospace" }}>
            {patLat.toFixed(5)}, {patLon.toFixed(5)}
          </span>
        </div>
      </div>

      <a
        href={googleMapsDirections}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 6, fontSize: 12, fontWeight: 600, color: "#fff",
          background: "#111", padding: "10px 14px", borderRadius: 10,
          textDecoration: "none", fontFamily: "'Manrope',sans-serif",
          width: "100%",
        }}
      >
        <Navigation size={14} strokeWidth={2} />
        Get directions
        <ExternalLink size={10} strokeWidth={2} />
      </a>
    </div>
  );
}

export default function IncomingAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [facilityCoords, setFacilityCoords] = useState({ lat: null, lon: null });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState([]);
  const [outcomes, setOutcomes] = useState({});
  const [confirming, setConfirming] = useState([]);

  const FILTERS = ["All", "Unacknowledged", "Acknowledged", "Resolved"];

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const [alertsRes, profileRes] = await Promise.all([
          getFacilityAlerts(),
          getFacilityProfile(),
        ]);

        setAlerts(alertsRes.data.data || []);

        const profile = profileRes.data.data || profileRes.data;
        if (profile.latitude && profile.longitude) {
          setFacilityCoords({ lat: profile.latitude, lon: profile.longitude });
        }
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, []);

  function toggle(id) {
    setExpanded(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }

  async function ackAlert(id) {
    try {
      await respondToAlert(id, { status: "Acknowledged" });
      const t = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      setAlerts(p => p.map(a => (a.id || a._id) === id
        ? { ...a, status: "Acknowledged", timeline: [...(a.timeline || []), { time: t, action: "Alert acknowledged" }] }
        : a
      ));
    } catch (err) {
      console.error('Failed to acknowledge:', err);
    }
  }

  async function markArrived(id) {
    try {
      await respondToAlert(id, { action: "Patient arrived" });
      const t = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      setAlerts(p => p.map(a => (a.id || a._id) === id
        ? { ...a, timeline: [...(a.timeline || []), { time: t, action: "Patient arrived" }] }
        : a
      ));
      setConfirming(p => [...p, id]);
    } catch (err) {
      console.error('Failed to mark arrived:', err);
    }
  }

  async function markResolved(id) {
    try {
      const outcome = outcomes[id] || "";
      await respondToAlert(id, { status: "Resolved", outcome });
      const t = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      setAlerts(p => p.map(a => (a.id || a._id) === id
        ? { ...a, status: "Resolved", outcome, timeline: [...(a.timeline || []), { time: t, action: "Case resolved" }] }
        : a
      ));
      setConfirming(p => p.filter(x => x !== id));
    } catch (err) {
      console.error('Failed to resolve:', err);
    }
  }

  const filtered = alerts.filter(a => {
    const matchF = filter === "All" || a.status === filter;
    const q = search.toLowerCase();
    const matchS = !q
      || (a.symptom || "").toLowerCase().includes(q)
      || (a.patientArea || "").toLowerCase().includes(q)
      || (a.status || "").toLowerCase().includes(q);
    return matchF && matchS;
  });

  if (loading) {
    return (
      <>
        <style>{FONT_STYLE}</style>
        <FacilityNav />
        <div className="ia-root" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Loader size={24} className="animate-spin" color="#aaa" />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{FONT_STYLE}</style>
      <FacilityNav />

      <div className="ia-root">
        <div style={{ padding: "clamp(20px,4vw,40px) clamp(16px,4vw,40px) 0", maxWidth: 860, display: "flex", flexDirection: "column", gap: 20 }}>

          <div>
            <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 600, color: "#111", lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 4 }}>
              Incoming alerts.
            </h1>
            <p style={{ fontSize: 13, color: "#9ca3af", fontFamily: "'Manrope',sans-serif", fontWeight: 300 }}>
              {alerts.filter(a => a.status !== "Resolved").length} active · {alerts.filter(a => a.status === "Unacknowledged").length} unacknowledged
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid #e8e6e1", borderRadius: 14, padding: "10px 14px" }}>
            <Search size={15} strokeWidth={1.8} color="#9ca3af" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by symptom, patient area, or status"
              style={{ flex: 1, border: "none", outline: "none", fontSize: 13, color: "#111", fontFamily: "'Manrope',sans-serif", background: "transparent" }}
            />
          </div>

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

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.length === 0 && (
              <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, padding: "40px 0", fontFamily: "'Manrope',sans-serif" }}>
                No alerts match your search.
              </p>
            )}

            {filtered.map(a => {
              const alertId = a.id || a._id;
              const isExp = expanded.includes(alertId);
              const isEmerg = a.riskLevel === "Emergency";
              const noResp = a.status === "Unacknowledged" && a.minutesSinceReceived > 15;
              const isConf = confirming.includes(alertId);
              const ch = CHANNEL_TAG[a.channel] || { color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb" };
              const borderCol = isEmerg ? "#dc2626" : a.status === "Resolved" ? "#d1d5db" : "#f97316";

              return (
                <div key={alertId} style={{ background: "#fff", border: "1px solid #e8e6e1", borderLeft: `3px solid ${borderCol}`, borderRadius: 16, overflow: "hidden" }}>

                  <button
                    style={{ width: "100%", textAlign: "left", padding: "16px 18px", background: "transparent", border: "none", cursor: "pointer" }}
                    onClick={() => toggle(alertId)}
                  >
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
                          <MapPin size={11} strokeWidth={1.8} />
                          {a.patientArea}
                          {a.distanceKm > 0 && ` · ${a.distanceKm} km`}
                        </div>
                      </div>
                      <ChevronDown size={18} strokeWidth={2} color="#9ca3af" style={{ flexShrink: 0, transition: "transform 0.2s", transform: isExp ? "rotate(180deg)" : "none", marginTop: 2 }} />
                    </div>
                  </button>

                  {isExp && (
                    <div style={{ borderTop: "1px solid #f3f4f6", padding: "18px", display: "flex", flexDirection: "column", gap: 16 }}>

                      <PatientLocationMap
                        alert={a}
                        facilityLat={facilityCoords.lat}
                        facilityLon={facilityCoords.lon}
                      />

                      {a.aiMessage && (
                        <div style={{ background: "#f4f3f0", borderRadius: 12, padding: "12px 14px" }}>
                          <pre style={{ fontSize: 12, color: "#374151", whiteSpace: "pre-wrap", fontFamily: "ui-monospace, monospace", lineHeight: 1.65 }}>{a.aiMessage}</pre>
                        </div>
                      )}

                      {(a.timeline || []).length > 0 && (
                        <div>
                          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#bbb", marginBottom: 12, fontFamily: "'Manrope',sans-serif" }}>Timeline</p>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {(a.timeline || []).map((entry, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: i === (a.timeline || []).length - 1 ? "#111" : "#d1d5db", flexShrink: 0 }} />
                                <span style={{ fontSize: 11, color: "#9ca3af", width: 56, flexShrink: 0, fontFamily: "'Manrope',sans-serif" }}>{entry.time}</span>
                                <span style={{ fontSize: 13, color: "#374151", fontFamily: "'Manrope',sans-serif" }}>{entry.action}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {noResp && (
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", fontFamily: "'Manrope',sans-serif" }}>
                          No response for {a.minutesSinceReceived} minutes
                        </p>
                      )}

                      {a.status === "Unacknowledged" && (
                        <button onClick={() => ackAlert(alertId)} style={{ border: "2px solid #dc2626", color: "#dc2626", background: "transparent", fontSize: 14, fontWeight: 600, padding: "12px", borderRadius: 14, cursor: "pointer", fontFamily: "'Manrope',sans-serif", width: "100%" }}>
                          Acknowledge
                        </button>
                      )}

                      {a.status === "Acknowledged" && !isConf && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => markArrived(alertId)} style={{ flex: 1, border: "1.5px solid #16a34a", color: "#15803d", background: "transparent", fontSize: 13, fontWeight: 600, padding: "10px", borderRadius: 12, cursor: "pointer", fontFamily: "'Manrope',sans-serif" }}>
                            Mark patient arrived
                          </button>
                          <button onClick={() => setConfirming(p => [...p, alertId])} style={{ flex: 1, border: "1.5px solid #e5e7eb", color: "#6b7280", background: "transparent", fontSize: 13, fontWeight: 600, padding: "10px", borderRadius: 12, cursor: "pointer", fontFamily: "'Manrope',sans-serif" }}>
                            Mark resolved
                          </button>
                        </div>
                      )}

                      {isConf && a.status !== "Resolved" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <textarea
                            value={outcomes[alertId] || ""}
                            onChange={e => setOutcomes(p => ({ ...p, [alertId]: e.target.value }))}
                            rows={3}
                            placeholder="What happened? What treatment was given?"
                            style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: "10px 14px", fontSize: 13, outline: "none", resize: "none", fontFamily: "'Manrope',sans-serif", lineHeight: 1.6 }}
                          />
                          <button onClick={() => markResolved(alertId)} style={{ background: "#111", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, padding: "12px", borderRadius: 12, cursor: "pointer", fontFamily: "'Manrope',sans-serif" }}>
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