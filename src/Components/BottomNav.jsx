import { useLocation, useNavigate } from "react-router-dom";
import { Home, Bot, Bell, Map, ArchiveRestore ,User2 } from "lucide-react";

const NAV = [
  { id: "home",      label: "Home",      Icon: Home,     path: "/home"         },
  { id: "ai",        label: "Assistant", Icon: Bot,      path: "/ai-assistant" },
  { id: "map",       label: "Map",       Icon: Map,      path: "/map"          },
  { id: "recovery",  label: "Recovery Hub", Icon: ArchiveRestore,     path: "/safe-recovery"     },
  { id: "profile",  label: "Profile",  Icon: User2, path: "/profile"     },
];

export default function BottomNav() {
  const location = useNavigate ? useLocation() : { pathname: "/home" };
  const navigate  = useNavigate();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600&display=swap');

        .bn-bar {
          position: fixed; bottom: 0; left: 0; right: 0;
          z-index: 1000;
          display: flex; justify-content: center;
          padding: 0 0 env(safe-area-inset-bottom, 8px);
          pointer-events: none;
        }

        .bn-inner {
          pointer-events: all;
          width: 100%;
          max-width: 520px;
          margin: 0 16px 12px;
          background: rgba(15, 14, 13, 0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 28px;
          padding: 8px 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 4px;
          box-shadow: 0 8px 40px rgba(0,0,0,.3), 0 2px 8px rgba(0,0,0,.2);
        }

        /* On desktop, center the nav pill and give it a max width */
        @media (min-width: 768px) {
          .bn-bar { padding-bottom: 20px; }
          .bn-inner { max-width: 480px; }
        }

        .bn-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 8px 4px;
          border: none;
          border-radius: 20px;
          background: transparent;
          cursor: pointer;
          min-width: 0;
          position: relative;
          transition: background .2s;
          -webkit-tap-highlight-color: transparent;
        }

        .bn-btn.active {
          background: rgba(255,255,255,.1);
        }

        .bn-btn:hover:not(.active) {
          background: rgba(255,255,255,.05);
        }

        .bn-icon-wrap {
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }

        /* Active glow under icon */
        .bn-btn.active .bn-icon-wrap::after {
          content: '';
          position: absolute;
          bottom: -4px; left: 50%; transform: translateX(-50%);
          width: 4px; height: 4px;
          border-radius: 50%;
          background: #a78bfa;
        }

        .bn-label {
          font-family: 'Manrope', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: .04em;
          white-space: nowrap;
          transition: color .2s;
        }

        .bn-btn.active  .bn-label { color: #fff; }
        .bn-btn         .bn-label { color: #555; }
        .bn-btn:hover:not(.active) .bn-label { color: #888; }
      `}</style>

      <nav className="bn-bar" role="navigation" aria-label="Main navigation">
        <div className="bn-inner">
          {NAV.map(({ id, label, Icon, path }) => {
            const active =
              location.pathname === path ||
              location.pathname.startsWith(path + "/");

            return (
              <button
                key={id}
                className={`bn-btn${active ? " active" : ""}`}
                onClick={() => navigate(path)}
                aria-label={label}
                aria-current={active ? "page" : undefined}
              >
                <div className="bn-icon-wrap">
                  <Icon
                    size={20}
                    color={active ? "#fff" : "#444"}
                    strokeWidth={active ? 2 : 1.5}
                  />
                </div>
                <span className="bn-label">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}