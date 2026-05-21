import { Link } from "react-router-dom";
import "./Landing.css";

export default function Landing() {
  return (
    <div className="page">

      {/* ── LEFT ── */}
      <div className="left">
        <div className="wordmark">SafeMum AI</div>

        <div className="headline-block">
          <div className="eyebrow">AI for Reproductive Health · Africa 2026</div>

          <h1 className="headline">
            No woman<br />should face <em>loss</em>
          </h1>
          <div className="headline-sub">alone.</div>

          <p className="description">
            SafeMum AI is a post-pregnancy loss care platform built for
            Sub-Saharan Africa. It connects women to physical care, emotional
            support, and community — through any phone, anywhere.
          </p>

          <div className="stat-row">
            <div className="stat">
              <span className="stat-num">7%</span>
              <span className="stat-label">of maternal deaths<br />from early pregnancy loss</span>
            </div>
            <div className="stat">
              <span className="stat-num">3</span>
              <span className="stat-label">pillars — prevent,<br />educate, intervene</span>
            </div>
            <div className="stat">
              <span className="stat-num">0</span>
              <span className="stat-label">internet needed<br />for emergency access</span>
            </div>
          </div>
        </div>

        <div className="bottom-left">
          <div className="track-badge">
            <div className="track-dot" />
            Track I — Early Pregnancy Loss Care
          </div>
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div className="right">

        <div className="right-top">
          <div className="hackathon-label">AI Innovation Challenge · Hackathon 2026</div>
        </div>

        <div className="mission-block">
          <div className="mission-item">
            <div className="mission-num">01</div>
            <div className="mission-text-block">
              <div className="mission-title">Prevention</div>
              <div className="mission-body">
                Weekly tips, antenatal reminders, and danger signs education —
                delivered to any phone over SMS or USSD. No data required.
              </div>
            </div>
          </div>
          <div className="mission-item">
            <div className="mission-num">02</div>
            <div className="mission-text-block">
              <div className="mission-title">Education</div>
              <div className="mission-body">
                An AI assistant that explains what is happening in plain
                language — and a SafeRecovery Hub for women navigating grief
                and loss.
              </div>
            </div>
          </div>
          <div className="mission-item">
            <div className="mission-num">03</div>
            <div className="mission-text-block">
              <div className="mission-title">Intervention</div>
              <div className="mission-body">
                Smart referrals, live facility maps, and an emergency call
                line — connecting the right care to the right woman in seconds.
              </div>
            </div>
          </div>
        </div>

        <div className="cta-section">
          <div className="cta-label">Enter as</div>
          <div className="cta-buttons">

            <Link to="/home" className="cta-btn btn-patient">
              <div className="cta-btn-inner">
                <span className="cta-btn-title">Patient</span>
                <span className="cta-btn-sub">I am seeking care or support</span>
              </div>
              <span className="cta-arrow">→</span>
            </Link>

            <Link to="/chw/dashboard" className="cta-btn btn-chw">
              <div className="cta-btn-inner">
                <span className="cta-btn-title">Community Health Worker</span>
                <span className="cta-btn-sub">I support women in my area</span>
              </div>
              <span className="cta-arrow">→</span>
            </Link>

            <Link to="/facility/dashboard" className="cta-btn btn-facility">
              <div className="cta-btn-inner">
                <span className="cta-btn-title">Health Facility</span>
                <span className="cta-btn-sub">I manage a clinic or hospital</span>
              </div>
              <span className="cta-arrow">→</span>
            </Link>

          </div>
        </div>

      </div>
    </div>
  );
}