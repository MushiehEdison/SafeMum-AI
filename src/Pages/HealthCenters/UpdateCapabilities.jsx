import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Info, Loader } from "lucide-react";
import FacilityNav from "../../Components/FacilityNav";
import { getFacilityProfile, updateFacilityCapabilities, updateFacilityProfile } from "../../API/facility";

const FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,400&family=Manrope:wght@300;400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  .uc-root{font-family:'Manrope',sans-serif;background:#f4f3f0;min-height:100vh;color:#111;padding-bottom:100px;}
  @media(min-width:768px){.uc-root{padding-left:220px;}}
`;

const CAP_META = {
  postLossCare: { label: "Post-loss care",    desc: "We can treat women recovering from miscarriage, ectopic pregnancy, or stillbirth" },
  bloodBank:    { label: "Blood bank",         desc: "We have blood available for transfusion" },
  surgical:     { label: "Surgical capacity",  desc: "We can perform emergency surgical procedures" },
  maternity:    { label: "Maternity",          desc: "We have a functioning maternity ward" },
  icu:          { label: "ICU",                desc: "We have intensive care capacity" },
};

function Toggle({ enabled, onToggle }) {
  return (
    <button onClick={onToggle} style={{ position: "relative", width: 44, height: 24, borderRadius: 12, background: enabled ? "#16a34a" : "#e5e7eb", border: "none", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
      <span style={{ position: "absolute", top: 2, left: enabled ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.15)", transition: "left 0.2s" }} />
    </button>
  );
}

export default function UpdateCapabilities() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [capabilities, setCapabilities] = useState({});
  const [capacity, setCapacity] = useState({ availableBeds: 0, staffOnDuty: 0, estimatedWaitMinutes: 0 });
  const [toast, setToast] = useState({ visible: false, message: "" });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getFacilityProfile();
        const data = res.data.data || res.data;
        setIsOpen(data.isOpen ?? true);
        setCapabilities(data.capabilities || {});
        setCapacity({
          availableBeds: data.capacity?.availableBeds ?? data.availableBeds ?? 0,
          staffOnDuty: data.capacity?.staffOnDuty ?? data.staffOnDuty ?? 0,
          estimatedWaitMinutes: data.capacity?.estimatedWaitMinutes ?? data.estimatedWaitMinutes ?? 0,
        });
      } catch (err) {
        console.error('Failed to fetch facility data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function showToast(msg) {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: "" }), 3000);
  }

  function toggleCap(key) {
    setCapabilities(p => ({ ...p, [key]: { ...p[key], enabled: !(p[key]?.enabled ?? false) } }));
  }

  function setReason(key, value) {
    setCapabilities(p => ({ ...p, [key]: { ...p[key], reason: value } }));
  }

  async function handleSave() {
    try {
      await Promise.all([
        updateFacilityProfile({ isOpen }),
        updateFacilityCapabilities({ capabilities, capacity }),
      ]);
      showToast("Capabilities updated. The AI will use this information immediately.");
    } catch (err) {
      console.error('Failed to save capabilities:', err);
      showToast("Failed to save. Please try again.");
    }
  }

  if (loading) {
    return (
      <>
        <style>{FONT_STYLE}</style>
        <FacilityNav />
        <div className="uc-root" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Loader size={24} className="animate-spin" color="#aaa" />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{FONT_STYLE}</style>
      <FacilityNav />

      <div className="uc-root">
        <div style={{ padding: "clamp(20px,4vw,40px) clamp(16px,4vw,40px) 0", maxWidth: 680, display: "flex", flexDirection: "column", gap: 28 }}>

          <div>
            <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 600, color: "#111", lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 4 }}>
              Capabilities.
            </h1>
            <p style={{ fontSize: 13, color: "#9ca3af", fontFamily: "'Manrope',sans-serif", fontWeight: 300 }}>Keep this accurate. It determines who the AI routes to you.</p>
          </div>

          <div style={{ background: "#fff", border: "1px solid #e8e6e1", borderRadius: 18, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 3, fontFamily: "'Manrope',sans-serif" }}>Facility is open</p>
                <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.5, fontFamily: "'Manrope',sans-serif" }}>When closed, no new alerts or referrals will be sent to you.</p>
              </div>
              <Toggle enabled={isOpen} onToggle={() => setIsOpen(p => !p)} />
            </div>
            {!isOpen && (
              <div style={{ marginTop: 14, border: "1px solid #fecaca", borderRadius: 12, padding: "10px 14px" }}>
                <p style={{ fontSize: 12, color: "#dc2626", lineHeight: 1.55, fontFamily: "'Manrope',sans-serif" }}>
                  Your facility is marked as closed. The AI will not route cases to you until you reopen.
                </p>
              </div>
            )}
          </div>

          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#bbb", marginBottom: 4, fontFamily: "'Manrope',sans-serif" }}>Service capabilities</p>
            <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 14, fontFamily: "'Manrope',sans-serif" }}>The AI uses this to decide which patients to route here.</p>
            <div style={{ background: "#fff", border: "1px solid #e8e6e1", borderRadius: 18, overflow: "hidden" }}>
              {Object.entries(CAP_META).map(([key, { label, desc }], i, arr) => {
                const cap = capabilities[key] || { enabled: false, reason: "" };
                return (
                  <div key={key} style={{ borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none", padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#111", marginBottom: 2, fontFamily: "'Manrope',sans-serif" }}>{label}</p>
                        <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.5, fontFamily: "'Manrope',sans-serif" }}>{desc}</p>
                      </div>
                      <Toggle enabled={cap.enabled} onToggle={() => toggleCap(key)} />
                    </div>
                    {!cap.enabled && (
                      <input value={cap.reason || ""} onChange={e => setReason(key, e.target.value)}
                        placeholder="Reason for unavailability (optional)"
                        style={{ marginTop: 10, width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", fontFamily: "'Manrope',sans-serif", background: "#f9fafb" }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#bbb", marginBottom: 4, fontFamily: "'Manrope',sans-serif" }}>Current capacity</p>
            <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 14, fontFamily: "'Manrope',sans-serif" }}>Helps the AI estimate wait times and prioritise routing.</p>
            <div style={{ background: "#fff", border: "1px solid #e8e6e1", borderRadius: 18, overflow: "hidden" }}>
              {[
                { key: "availableBeds",        label: "Available beds"            },
                { key: "staffOnDuty",          label: "Staff on duty"             },
                { key: "estimatedWaitMinutes", label: "Estimated wait time (min)" },
              ].map(({ key, label }, i, arr) => (
                <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <span style={{ fontSize: 13, color: "#374151", fontFamily: "'Manrope',sans-serif" }}>{label}</span>
                  <input type="number" min={0} value={capacity[key]} onChange={e => setCapacity(p => ({ ...p, [key]: Number(e.target.value) }))}
                    style={{ width: 72, border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px", fontSize: 14, fontWeight: 600, textAlign: "center", outline: "none", fontFamily: "'Manrope',sans-serif" }} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ border: "1px solid #e8e6e1", borderRadius: 16, padding: "16px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Info size={16} color="#9ca3af" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.65, fontFamily: "'Manrope',sans-serif" }}>
              Keeping your capabilities accurate is critical. Women in crisis are routed to your facility based on this information. Incorrect data can cost lives.
            </p>
          </div>

          <button onClick={handleSave}
            style={{ width: "100%", padding: "15px", background: "#111", color: "#fff", border: "none", borderRadius: 16, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope',sans-serif" }}>
            Save capabilities
          </button>

        </div>
      </div>

      {toast.visible && (
        <div style={{ position: "fixed", bottom: 88, left: "50%", transform: "translateX(-50%)", background: "#111", color: "#fff", borderRadius: 20, padding: "10px 20px", fontSize: 13, fontWeight: 500, fontFamily: "'Manrope',sans-serif", zIndex: 9999, whiteSpace: "nowrap", maxWidth: "90vw", textAlign: "center" }}>
          {toast.message}
        </div>
      )}
    </>
  );
}