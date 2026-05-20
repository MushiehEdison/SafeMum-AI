import { useState } from "react";
import CheckInTab from "../../Components/RecoveryHub/Checkintab";
import CommunityTab from "../../Components/RecoveryHub/CommunityTab";
import SupportTab from "../../Components/RecoveryHub/SupportTab";

const TABS = [
  { id: "checkin",   label: "Check-in",  desc: "How are you today?" },
  { id: "community", label: "Community", desc: "You are not alone"   },
  { id: "support",   label: "Support",   desc: "We are here"         },
];

export default function SafeRecoveryHub() {
  const [activeTab, setActiveTab] = useState("checkin");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,300;1,9..144,400;0,9..144,500;0,9..144,600&family=Manrope:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .srh {
          min-height: 100vh;
          background: #fafaf8;
          font-family: 'Manrope', sans-serif;
          padding-bottom: 100px;
        }

        /* ── TAB RAIL ── */
        .srh-rail {
          display: flex;
          gap: 8px;
          padding: clamp(20px,4vw,36px) clamp(16px,4vw,40px) 0;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .srh-rail::-webkit-scrollbar { display: none; }

        .srh-pill {
          display: flex;
          flex-direction: column;
          gap: 3px;
          flex-shrink: 0;
          padding: 12px 18px;
          border-radius: 16px;
          border: 1.5px solid transparent;
          background: #f0efeb;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }
        .srh-pill:hover { background: #e8e6e0; }
        .srh-pill.active {
          background: #111;
          border-color: #111;
        }
        .srh-pill-label {
          font-size: 13px;
          font-weight: 600;
          color: #aaa;
          transition: color 0.2s;
          white-space: nowrap;
        }
        .srh-pill.active .srh-pill-label { color: #fff; }
        .srh-pill-desc {
          font-size: 11px;
          font-weight: 300;
          color: #ccc;
          white-space: nowrap;
          transition: color 0.2s;
        }
        .srh-pill.active .srh-pill-desc { color: rgba(255,255,255,0.5); }

        /* ── WEEK BADGE ── */
        .srh-week {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin: 20px clamp(16px,4vw,40px) 0;
          padding: 6px 13px;
          background: #fff;
          border: 1px solid #e8e6e1;
          border-radius: 40px;
          font-size: 11px;
          font-weight: 500;
          color: #777;
          letter-spacing: 0.03em;
        }
        .srh-week-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 0 3px rgba(74,222,128,.2);
          animation: glow 2s infinite;
          flex-shrink: 0;
        }
        @keyframes glow {
          0%,100%{ box-shadow:0 0 0 3px rgba(74,222,128,.2); }
          50%    { box-shadow:0 0 0 5px rgba(74,222,128,.08); }
        }

        /* ── CONTENT ── */
        .srh-content {
          max-width: 680px;
          padding: clamp(24px,4vw,36px) clamp(16px,4vw,40px) 0;
        }
      `}</style>

      <div className="srh">
        {/* Tab pills */}
        <div className="srh-rail">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`srh-pill${activeTab === t.id ? " active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span className="srh-pill-label">{t.label}</span>
              <span className="srh-pill-desc">{t.desc}</span>
            </button>
          ))}
        </div>

        {/* Week badge */}
        <div className="srh-week">
          <div className="srh-week-dot" />
          Week 2 of 6 · Active Recovery
        </div>

        {/* Page content */}
        <div className="srh-content">
          {activeTab === "checkin"   && <CheckInTab />}
          {activeTab === "community" && <CommunityTab />}
          {activeTab === "support"   && <SupportTab />}
        </div>
      </div>
    </>
  );
}