import { useState } from "react";
import { Hospital, LogOut } from "lucide-react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import FacilityNav from "../../Components/FacilityNav";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,400&family=Manrope:wght@300;400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  .fp-root{font-family:'Manrope',sans-serif;background:#f4f3f0;min-height:100vh;color:#111;padding-bottom:100px;}
  @media(min-width:768px){.fp-root{padding-left:220px;}}
`;

const dummyFacility = {
  name: "Kenyatta National Hospital", type: "Referral Hospital", ownership: "Public",
  county: "Nairobi", district: "Starehe", phone: "+254200000001", email: "info@knh.go.ke",
  address: "Hospital Rd, Nairobi", latitude: -1.3000, longitude: 36.8073, memberSince: "January 2026",
  stats: { totalAlertsReceived: 47, totalAlertsAcknowledged: 44, avgAcknowledgementMinutes: 4, totalReferralsReceived: 31, totalReferralsAccepted: 28, acceptanceRate: 90 },
};

function Divider() {
  return <div style={{ height: 1, background: "#e8e6e1", margin: "4px 0 16px" }} />;
}

function SectionLabel({ children }) {
  return <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#bbb", marginBottom: 4, fontFamily: "'Manrope',sans-serif" }}>{children}</p>;
}

export default function FacilityProfile() {
  const [facility] = useState(dummyFacility);

  const contactRows = [
    { label: "Email",    value: facility.email    },
    { label: "Phone",    value: facility.phone    },
    { label: "Address",  value: facility.address  },
    { label: "County",   value: facility.county   },
    { label: "District", value: facility.district },
  ];

  const statCards = [
    { value: `${facility.stats.totalAlertsReceived}`,       label: "Total alerts received",   color: null },
    { value: `${facility.stats.totalAlertsAcknowledged}`,   label: "Alerts acknowledged",      color: null },
    { value: `${facility.stats.avgAcknowledgementMinutes} min`, label: "Avg acknowledgement",  color: null },
    { value: `${facility.stats.totalReferralsReceived}`,    label: "Referrals received",       color: null },
    { value: `${facility.stats.totalReferralsAccepted}`,    label: "Referrals accepted",       color: null },
    { value: `${facility.stats.acceptanceRate}%`,           label: "Acceptance rate",
      color: facility.stats.acceptanceRate >= 80 ? "#16a34a" : facility.stats.acceptanceRate < 60 ? "#dc2626" : "#111" },
  ];

  return (
    <>
      <style>{FONT_STYLE}</style>
      <FacilityNav />

      <div className="fp-root">
        <div style={{ padding: "clamp(20px,4vw,40px) clamp(16px,4vw,40px) 0", maxWidth: 680, display: "flex", flexDirection: "column", gap: 32 }}>

          {/* Identity */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, paddingBottom: 8 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#f0efeb", border: "1.5px solid #e8e6e1", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Hospital size={30} strokeWidth={1.5} color="#6b7280" />
            </div>
            <div style={{ textAlign: "center" }}>
              <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(22px,3vw,30px)", fontWeight: 600, color: "#111", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 10 }}>{facility.name}</h1>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 500, border: "1px solid #e5e7eb", color: "#6b7280", padding: "4px 12px", borderRadius: 20, fontFamily: "'Manrope',sans-serif" }}>{facility.type}</span>
                <span style={{ fontSize: 12, fontWeight: 500, border: "1px solid #e5e7eb", color: "#6b7280", padding: "4px 12px", borderRadius: 20, fontFamily: "'Manrope',sans-serif" }}>{facility.ownership}</span>
              </div>
              <p style={{ fontSize: 12, color: "#bbb", fontFamily: "'Manrope',sans-serif" }}>Member since {facility.memberSince}</p>
            </div>
          </div>

          {/* Contact info */}
          <div>
            <SectionLabel>Contact information</SectionLabel>
            <Divider />
            <div style={{ background: "#fff", border: "1px solid #e8e6e1", borderRadius: 18, overflow: "hidden" }}>
              {contactRows.map(({ label, value }, i, arr) => (
                <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none", gap: 16 }}>
                  <span style={{ fontSize: 12, color: "#9ca3af", flexShrink: 0, width: 64, fontFamily: "'Manrope',sans-serif" }}>{label}</span>
                  <span style={{ fontSize: 13, color: "#111", textAlign: "right", fontFamily: "'Manrope',sans-serif" }}>{value}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: "#9ca3af", fontStyle: "italic", marginTop: 8, paddingLeft: 2, fontFamily: "'Manrope',sans-serif", lineHeight: 1.5 }}>
              To update contact information or location, please contact the SafeMum AI admin team.
            </p>
          </div>

          {/* Map */}
          <div>
            <SectionLabel>Facility location</SectionLabel>
            <Divider />
            <div style={{ border: "1px solid #e8e6e1", borderRadius: 16, overflow: "hidden", height: 160 }}>
              <MapContainer center={[facility.latitude, facility.longitude]} zoom={14}
                style={{ height: "100%", width: "100%" }}
                dragging={false} zoomControl={false} scrollWheelZoom={false} doubleClickZoom={false} touchZoom={false} attributionControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[facility.latitude, facility.longitude]} />
              </MapContainer>
            </div>
            <p style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", marginTop: 8, fontFamily: "ui-monospace, monospace" }}>
              {facility.latitude}, {facility.longitude}
            </p>
          </div>

          {/* Stats */}
          <div>
            <SectionLabel>Performance</SectionLabel>
            <Divider />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
              {statCards.map(({ value, label, color }) => (
                <div key={label} style={{ background: "#fff", border: "1px solid #e8e6e1", borderRadius: 16, padding: "16px 18px" }}>
                  <p style={{ fontFamily: "'Fraunces',serif", fontSize: 28, fontWeight: 600, color: color || "#111", lineHeight: 1, marginBottom: 6 }}>{value}</p>
                  <p style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.4, fontFamily: "'Manrope',sans-serif" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Logout */}
          <button onClick={() => console.log("logout")}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "1.5px solid #dc2626", color: "#dc2626", background: "#fff", fontSize: 14, fontWeight: 600, padding: "14px", borderRadius: 16, cursor: "pointer", fontFamily: "'Manrope',sans-serif" }}>
            <LogOut size={16} strokeWidth={2} />
            Sign out
          </button>

        </div>
      </div>
    </>
  );
}