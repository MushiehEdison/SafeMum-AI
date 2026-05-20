import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, AlertCircle, Settings2, GitMerge, User2
} from "lucide-react";

const NAV = [
  { id: "dashboard",    label: "Dashboard",    Icon: LayoutDashboard, path: "/facility"                },
  { id: "alerts",       label: "Alerts",       Icon: AlertCircle,     path: "/facility/alerts"         },
  { id: "capabilities", label: "Capabilities", Icon: Settings2,       path: "/facility/capabilities"   },
  { id: "referrals",    label: "Referrals",    Icon: GitMerge,        path: "/facility/referrals"      },
  { id: "profile",      label: "Profile",      Icon: User2,           path: "/facility/profile"        },
];

export default function FacilityNav() {
  const location = useLocation();
  const navigate  = useNavigate();

  const isActive = (path) =>
    location.pathname === path ||
    (path !== "/facility" && location.pathname.startsWith(path));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600&display=swap');

        /* ─── MOBILE: floating pill at bottom ─── */
        .fn-mobile {
          display: flex;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 100;
          justify-content: center;
          padding: 0 16px 12px;
          pointer-events: none;
        }

        .fn-mobile-inner {
          pointer-events: all;
          width: 100%;
          max-width: 500px;
          background: rgba(17, 17, 17, 0.93);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 26px;
          padding: 6px;
          display: flex;
          gap: 2px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.28);
        }

        .fn-mobile-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          padding: 8px 4px;
          border: none;
          border-radius: 20px;
          background: transparent;
          cursor: pointer;
          transition: background 0.18s;
          -webkit-tap-highlight-color: transparent;
          min-width: 0;
        }

        .fn-mobile-btn.active {
          background: rgba(255,255,255,0.1);
        }

        .fn-mobile-btn:not(.active):hover {
          background: rgba(255,255,255,0.05);
        }

        .fn-mobile-label {
          font-family: 'Manrope', sans-serif;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.04em;
          white-space: nowrap;
          color: rgba(255,255,255,0.35);
          transition: color 0.18s;
        }

        .fn-mobile-btn.active .fn-mobile-label {
          color: #fff;
        }

        /* ─── DESKTOP: sidebar ─── */
        .fn-sidebar {
          display: none;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: 220px;
          z-index: 100;
          background: #faf9f7;
          border-right: 1px solid #e8e6e1;
          flex-direction: column;
          padding: 32px 12px 24px;
        }

        .fn-sidebar-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 8px;
          margin-bottom: 36px;
        }

        .fn-sidebar-logo-mark {
          width: 28px;
          height: 28px;
          background: #111;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .fn-sidebar-logo-text {
          font-family: 'Manrope', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #111;
          letter-spacing: -0.01em;
        }

        .fn-sidebar-logo-sub {
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #bbb;
          display: block;
          margin-top: 1px;
        }

        .fn-sidebar-links {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }

        .fn-sidebar-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border: none;
          border-radius: 12px;
          background: transparent;
          cursor: pointer;
          transition: background 0.15s;
          width: 100%;
          text-align: left;
        }

        .fn-sidebar-btn:hover:not(.active) {
          background: #f0eeea;
        }

        .fn-sidebar-btn.active {
          background: #111;
        }

        .fn-sidebar-btn-label {
          font-family: 'Manrope', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          transition: color 0.15s;
        }

        .fn-sidebar-btn.active .fn-sidebar-btn-label {
          color: #fff;
        }

        .fn-sidebar-btn:hover:not(.active) .fn-sidebar-btn-label {
          color: #111;
        }

        .fn-sidebar-section-label {
          font-family: 'Manrope', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #ccc;
          padding: 0 12px;
          margin: 8px 0 6px;
        }

        /* ─── Responsive breakpoint ─── */
        @media (min-width: 768px) {
          .fn-mobile  { display: none; }
          .fn-sidebar { display: flex; }
        }
      `}</style>

      {/* Mobile floating pill */}
      <nav className="fn-mobile" role="navigation">
        <div className="fn-mobile-inner">
          {NAV.map(({ id, label, Icon, path }) => {
            const active = isActive(path);
            return (
              <button key={id} className={`fn-mobile-btn${active ? " active" : ""}`}
                onClick={() => navigate(path)} aria-label={label}>
                <Icon size={18} color={active ? "#fff" : "rgba(255,255,255,0.4)"} strokeWidth={active ? 2 : 1.6} />
                <span className="fn-mobile-label">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <aside className="fn-sidebar" role="navigation">
        {/* Logo */}
        <div className="fn-sidebar-logo">
          <div className="fn-sidebar-logo-mark">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1.5C7 1.5 2 4.5 2 8.5C2 10.985 4.239 13 7 13C9.761 13 12 10.985 12 8.5C12 4.5 7 1.5 7 1.5Z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <div>
            <span className="fn-sidebar-logo-text">SafeMum AI</span>
            <span className="fn-sidebar-logo-sub">Facility Portal</span>
          </div>
        </div>

        {/* Links */}
        <div className="fn-sidebar-links">
          <p className="fn-sidebar-section-label">Overview</p>
          {NAV.slice(0, 3).map(({ id, label, Icon, path }) => {
            const active = isActive(path);
            return (
              <button key={id} className={`fn-sidebar-btn${active ? " active" : ""}`}
                onClick={() => navigate(path)}>
                <Icon size={16} color={active ? "#fff" : "#9ca3af"} strokeWidth={active ? 2 : 1.6} />
                <span className="fn-sidebar-btn-label">{label}</span>
              </button>
            );
          })}

          <p className="fn-sidebar-section-label" style={{ marginTop: 12 }}>Manage</p>
          {NAV.slice(3).map(({ id, label, Icon, path }) => {
            const active = isActive(path);
            return (
              <button key={id} className={`fn-sidebar-btn${active ? " active" : ""}`}
                onClick={() => navigate(path)}>
                <Icon size={16} color={active ? "#fff" : "#9ca3af"} strokeWidth={active ? 2 : 1.6} />
                <span className="fn-sidebar-btn-label">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom status */}
        <div style={{
          margin: "0 4px",
          padding: "12px",
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: "12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 0 3px rgba(34,197,94,.2)" }} />
            <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 11, fontWeight: 600, color: "#15803d" }}>Facility Open</span>
          </div>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: 10, color: "#6b7280", lineHeight: 1.4 }}>
            Kenyatta National Hospital
          </p>
        </div>
      </aside>
    </>
  );
}