import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot, AlertTriangle, Heart, MapPin,
  ChevronRight, ArrowUpRight, Send,
  Droplets, Moon, Leaf, Footprints,
  SmilePlus, Siren, Users, Activity,
  Navigation, Phone, Clock, Star,
  BookOpen, MessageCircle, Wind,
  Thermometer, Stethoscope,
  Bell, Plus, CheckCircle2, Sparkles, X,
} from "lucide-react";

/* ─────────────────────────────────
   DATA
───────────────────────────────── */
const DAYS   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const TIPS = [
  { label: "Hydration",    Icon: Droplets,   bg: "#e8f4fd", accent: "#1a6fa8", tip: "Drink at least 8 glasses of water today to support tissue healing." },
  { label: "Rest",         Icon: Moon,       bg: "#ede9fe", accent: "#5b21b6", tip: "Allow yourself at least 8 hours of sleep — recovery happens fastest when you rest." },
  { label: "Nutrition",    Icon: Leaf,       bg: "#dcfce7", accent: "#15803d", tip: "Iron-rich foods like lentils and leafy greens help rebuild blood levels." },
  { label: "Movement",     Icon: Footprints, bg: "#fefce8", accent: "#a16207", tip: "A gentle 10-minute walk can lift your mood without straining your body." },
  { label: "Emotional",    Icon: SmilePlus,  bg: "#fce7f3", accent: "#be185d", tip: "It's normal to feel waves of grief. You don't have to rush healing." },
  { label: "Danger Signs", Icon: Siren,      bg: "#fee2e2", accent: "#b91c1c", tip: "Heavy bleeding, fever, or severe pain — don't wait. Seek help immediately." },
  { label: "Connection",   Icon: Users,      bg: "#e0f2fe", accent: "#0369a1", tip: "Talking to someone who understands can ease the weight you're carrying." },
];

const AI_MESSAGES = [
  { text: "How are you feeling right now, Amina?", type: "checkin" },
  { text: "Have you had enough water today?", type: "checkin" },
  { text: "Did you sleep well last night?", type: "checkin" },
  { text: "Any pain or discomfort since yesterday?", type: "checkin" },
  { text: "Remember: rest is part of healing.", type: "advice" },
  { text: "It's okay to take things one hour at a time.", type: "advice" },
  { text: "Ask me about your recovery timeline", type: "prompt" },
  { text: "What are the warning signs I should watch for?", type: "prompt" },
  { text: "Can you explain what's normal to feel right now?", type: "prompt" },
];

const FACILITIES = [
  { name: "Kenyatta National Hospital", type: "General Hospital", dist: "1.2 km", open: true,  Icon: Stethoscope },
  { name: "Nairobi Women's Hospital",   type: "Women's Health",   dist: "2.8 km", open: true,  Icon: Heart       },
  { name: "MP Shah Hospital",           type: "Private Clinic",   dist: "3.4 km", open: false, Icon: Activity    },
];

const RECOVERY_ITEMS = [
  { label: "Mental wellness",  Icon: Wind,          sub: "Breathing & grounding exercises" },
  { label: "Nutrition guide",  Icon: Leaf,           sub: "Foods that help you heal" },
  { label: "Peer stories",     Icon: MessageCircle,  sub: "You are not alone" },
  { label: "Read & learn",     Icon: BookOpen,       sub: "Understanding your recovery" },
];

const STATS = [
  { label: "Physical",   value: "Stable",    color: "#22c55e" },
  { label: "Emotional",  value: "Monitored", color: "#a78bfa" },
  { label: "Follow-up",  value: "Tomorrow",  color: "#94a3b8" },
  { label: "Risk Level", value: "Low",       color: "#22c55e" },
];

/* ─── Reminder dummy data ─── */
const dummyReminders = [
  {
    id: 1,
    type: 'Follow-up Appointment',
    datetime: 'May 22, 2026 at 10:00 AM',
    note: 'Post-loss follow-up at Kenyatta National Hospital',
    aiMessage: 'Sarah, your follow-up appointment at Kenyatta National Hospital is tomorrow at 10am. This visit helps confirm your body has fully recovered from your loss in February. Please do not skip it.',
    missedCount: 0, completed: false, overdue: false,
  },
  {
    id: 2,
    type: 'Medication',
    datetime: 'May 21, 2026 at 8:00 AM',
    note: 'Iron supplement',
    aiMessage: 'Taking your iron supplement today helps your body rebuild after your loss. It is a small thing that makes a real difference.',
    missedCount: 0, completed: false, overdue: true,
  },
  {
    id: 3,
    type: 'Emotional Check-in',
    datetime: 'May 23, 2026 at 6:00 PM',
    note: null,
    aiMessage: 'You set this check-in for yourself. A few minutes to sit with how you are feeling is always worth it.',
    missedCount: 0, completed: false, overdue: false,
  },
  {
    id: 4,
    type: 'Follow-up Appointment',
    datetime: 'May 18, 2026 at 9:00 AM',
    note: 'Missed twice now',
    aiMessage: 'This appointment has been missed. Your recovery matters — please try to reschedule as soon as possible.',
    missedCount: 2, completed: false, overdue: true,
  },
  {
    id: 5,
    type: 'Danger Signs Education',
    datetime: 'May 25, 2026 at 7:00 PM',
    note: null,
    aiMessage: 'Knowing the warning signs of incomplete recovery could be life-saving. This reminder is set to keep you informed.',
    missedCount: 0, completed: false, overdue: false,
  },
];

const TYPE_COLORS = {
  'Follow-up Appointment':  '#dc2626',
  'Medication':             '#16a34a',
  'Emotional Check-in':     '#2563eb',
  'Danger Signs Education': '#ea580c',
};

const TYPES = ['Follow-up Appointment','Medication','Emotional Check-in','Danger Signs Education'];

function generateAIMessage(type) {
  switch (type) {
    case 'Follow-up Appointment':  return "Sarah, this follow-up visit is important for confirming your recovery. Please do not skip it.";
    case 'Medication':             return "Taking your medication consistently makes a real difference in your recovery. This one is worth keeping.";
    case 'Emotional Check-in':     return "Checking in with yourself is just as important as physical recovery. Set aside a few minutes for this one.";
    case 'Danger Signs Education': return "Understanding the warning signs helps you act fast if something changes. This reminder is here to keep you informed.";
    default:                       return "This reminder is set to support your recovery.";
  }
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* ─── Toast ─── */
function Toast({ message }) {
  return (
    <div style={{
      position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)',
      background: '#111', color: '#fff', borderRadius: '20px', padding: '10px 20px',
      fontSize: '13px', fontWeight: 500, fontFamily: "'Manrope', sans-serif",
      zIndex: 9999, whiteSpace: 'nowrap', pointerEvents: 'none',
    }}>{message}</div>
  );
}

/* ─── Add Reminder Modal ─── */
function AddReminderModal({ onClose, onAdd }) {
  const [selectedType, setSelectedType] = useState(TYPES[0]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [noteText,     setNoteText]     = useState('');

  function handleAdd() {
    if (!selectedDate || !selectedTime) return;
    onAdd({
      id: Date.now(), type: selectedType,
      datetime: selectedDate + ' at ' + selectedTime,
      note: noteText || null,
      aiMessage: generateAIMessage(selectedType),
      missedCount: 0, completed: false, overdue: false,
    });
    onClose();
  }

  const inp = {
    width: '100%', padding: '10px 12px', borderRadius: '10px',
    border: '1px solid #e5e7eb', background: '#f8f7f4',
    fontSize: '13px', color: '#111', fontFamily: "'Manrope', sans-serif",
    outline: 'none', boxSizing: 'border-box',
  };
  const lbl = {
    display: 'block', fontSize: '11px', fontWeight: 600,
    letterSpacing: '.1em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '6px',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '24px',
        width: '100%', maxWidth: '420px', fontFamily: "'Manrope', sans-serif", position: 'relative',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          border: 'none', background: '#f8f7f4', borderRadius: '8px',
          width: '30px', height: '30px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer',
        }}><X size={15} color="#6b7280" /></button>

        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '20px', fontWeight: 600, color: '#111', marginBottom: '20px' }}>
          New reminder
        </h2>

        <div style={{ marginBottom: '14px' }}>
          <label style={lbl}>Type</label>
          <select value={selectedType} onChange={e => setSelectedType(e.target.value)} style={{ ...inp, appearance: 'none' }}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={lbl}>Date</label>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={inp} />
        </div>
        <div style={{ marginBottom: '14px' }}>
          <label style={lbl}>Time</label>
          <input type="time" value={selectedTime} onChange={e => setSelectedTime(e.target.value)} style={inp} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={lbl}>Note</label>
          <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
            placeholder="Add a note (optional)" rows={3}
            style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }} />
        </div>
        <button onClick={handleAdd} style={{
          width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
          background: '#111', color: '#fff', fontSize: '14px', fontWeight: 600,
          cursor: 'pointer', fontFamily: "'Manrope', sans-serif",
        }}>Add reminder</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────
   AI TICKER
───────────────────────────────── */
function AiTicker({ onSelect }) {
  const [idx, setIdx]         = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % AI_MESSAGES.length); setVisible(true); }, 400);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  const msg = AI_MESSAGES[idx];
  const typeColor = msg.type === "checkin" ? "#6366f1" : msg.type === "advice" ? "#0369a1" : "#15803d";
  const typeLabel = msg.type === "checkin" ? "Check-in" : msg.type === "advice" ? "Tip" : "Ask me";

  return (
    <button className="ai-ticker" onClick={() => onSelect(msg.text)} style={{ "--tc": typeColor }}>
      <div className="ai-ticker-dot" />
      <div className="ai-ticker-content" style={{ opacity: visible ? 1 : 0 }}>
        <span className="ai-ticker-tag" style={{ color: typeColor, background: typeColor + "18" }}>{typeLabel}</span>
        <span className="ai-ticker-text">"{msg.text}"</span>
      </div>
      <ChevronRight size={14} className="ai-ticker-arr" />
    </button>
  );
}

/* ─────────────────────────────────
   COMPACT REMINDER SECTION
───────────────────────────────── */
const TYPE_META = {
  'Follow-up Appointment':  { accent: '#ffffff', pillBg: '#E6F1FB', pillText: '#0C447C', pillBorder: '#85B7EB', dot: '#378ADD' },
  'Medication':             { accent: '#ffffff', pillBg: '#EAF3DE', pillText: '#27500A', pillBorder: '#97C459', dot: '#639922' },
  'Emotional Check-in':     { accent: '#ffffff', pillBg: '#EEEDFE', pillText: '#3C3489', pillBorder: '#AFA9EC', dot: '#7F77DD' },
  'Danger Signs Education': { accent: '#ffffff', pillBg: '#FAEEDA', pillText: '#633806', pillBorder: '#EF9F27', dot: '#BA7517' },
};

function CompactReminders({ navigate }) {
  const [reminders, setReminders] = useState(dummyReminders);
  const [showModal, setShowModal] = useState(false);
  const [toast,     setToast]     = useState({ visible: false, message: '' });

  function showToast(msg) {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: '' }), 2000);
  }

  function handleComplete(id) {
    setReminders(rs => rs.map(r => r.id === id ? { ...r, completed: true } : r));
    showToast('Marked as done.');
  }

  function handleAdd(reminder) {
    setReminders(rs => [...rs, reminder]);
    showToast('Reminder added.');
  }

  const upcoming      = reminders.filter(r => !r.completed).slice(0, 4);
  const overdueCount  = reminders.filter(r => !r.completed && r.overdue).length;

  return (
    <>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={15} color="#111" strokeWidth={1.8} />
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#111', fontFamily: "'Manrope', sans-serif" }}>
            Upcoming reminders
          </span>
          {overdueCount > 0 && (
            <span style={{
              fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px',
              background: '#FCEBEB', color: '#A32D2D', border: '0.5px solid #F09595',
            }}>
              {overdueCount} overdue
            </span>
          )}
        </div>
        <button onClick={() => navigate('/reminders')} style={{
          display: 'flex', alignItems: 'center', gap: '3px',
          background: 'none', border: 'none', color: '#6b7280',
          fontWeight: 500, fontSize: '12px', cursor: 'pointer',
          fontFamily: "'Manrope', sans-serif",
        }}>
          See all <ChevronRight size={13} />
        </button>
      </div>

      {/* ── 2-column grid ── */}
      {upcoming.length === 0 ? (
        <div style={{
          gridColumn: '1 / -1', padding: '28px', textAlign: 'center',
          border: '0.5px dashed #d1d5db', borderRadius: '12px', marginBottom: '12px',
        }}>
          <Bell size={20} color="#d1d5db" strokeWidth={1.5} style={{ display: 'block', margin: '0 auto 8px' }} />
          <p style={{ fontSize: '13px', color: '#9ca3af', fontFamily: "'Manrope', sans-serif" }}>
            No upcoming reminders. Tap + to add one.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '10px', marginBottom: '12px',
        }}>
          {upcoming.map(r => {
            const m = TYPE_META[r.type] || TYPE_META['Medication'];
            return (
              <div key={r.id} style={{
                background: '#fff',
                border: '0.5px solid #e8e6e1',
                borderRadius: '14px',
                overflow: 'hidden',
                fontFamily: "'Manrope', sans-serif",
                display: 'flex', flexDirection: 'column',
              }}>
                {/* Colored top accent bar */}
                <div style={{ height: '3px', background: m.accent, flexShrink: 0 }} />

                <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Type pill */}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    fontSize: '10px', fontWeight: 500, letterSpacing: '.02em',
                    padding: '3px 8px', borderRadius: '20px', alignSelf: 'flex-start',
                    background: m.pillBg, color: m.pillText, border: `0.5px solid ${m.pillBorder}`,
                    marginBottom: '9px',
                  }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: m.dot, flexShrink: 0 }} />
                    {r.type}
                  </span>

                  {/* Missed banner */}
                  {r.missedCount >= 2 && (
                    <div style={{
                      fontSize: '11px', color: '#A32D2D',
                      background: '#FCEBEB', borderRadius: '6px',
                      padding: '5px 8px', marginBottom: '8px',
                      display: 'flex', alignItems: 'center', gap: '5px',
                    }}>
                      <AlertTriangle size={11} strokeWidth={2} />
                      Missed — CHW notified
                    </div>
                  )}

                  {/* AI message */}
                  <p style={{
                    fontSize: '12px', color: '#111', lineHeight: 1.55,
                    marginBottom: '10px', flex: 1,
                  }}>
                    {r.aiMessage}
                  </p>

                  {/* Footer: time + overdue + done btn */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} strokeWidth={1.8} />
                        {r.datetime}
                      </span>
                      {r.overdue && (
                        <span style={{
                          fontSize: '10px', fontWeight: 600, color: '#A32D2D',
                          background: '#FCEBEB', border: '0.5px solid #F09595',
                          borderRadius: '20px', padding: '1px 7px', alignSelf: 'flex-start',
                        }}>
                          Overdue
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleComplete(r.id)}
                      title="Mark done"
                      style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        border: '0.5px solid #e8e6e1', background: '#f8f7f4',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', flexShrink: 0, transition: 'background .15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#EAF3DE'; e.currentTarget.style.borderColor = '#97C459'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#f8f7f4'; e.currentTarget.style.borderColor = '#e8e6e1'; }}
                    >
                      <CheckCircle2 size={13} color="#6b7280" strokeWidth={1.8} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add reminder ── */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          width: '100%', padding: '10px', borderRadius: '10px',
          border: '0.5px dashed #d1d5db', background: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
          fontSize: '13px', fontWeight: 500, color: '#6b7280', cursor: 'pointer',
          fontFamily: "'Manrope', sans-serif", transition: 'background .15s, border-color .15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#f8f7f4'; e.currentTarget.style.borderColor = '#9ca3af'; e.currentTarget.style.color = '#111'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#6b7280'; }}
      >
        <Plus size={15} /> Add reminder
      </button>

      {showModal && <AddReminderModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}
      {toast.visible && <Toast message={toast.message} />}
    </>
  );
}

/* ─────────────────────────────────
   HOME
───────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const now      = new Date();
  const tip      = TIPS[now.getDay()];
  const TipIcon  = tip.Icon;
  const dateStr  = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;
  const hour     = now.getHours();
  const nameColor = hour < 12 ? "#d97706" : hour < 17 ? "#ea580c" : "#7c3aed";

  function sendToAI(text) {
    navigate("/ai-assistant", { state: { prefill: text || query } });
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,400&family=Manrope:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .hm {
          font-family: 'Manrope', sans-serif;
          background: #f4f3f0;
          min-height: 100vh;
          color: #111;
          padding-bottom: 110px;
        }

        .hm-hero {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
          padding: clamp(36px,6vw,56px) clamp(20px,5vw,52px) clamp(20px,3vw,32px);
          border-bottom: 1px solid #e5e3de;
        }
        .hm-date {
          font-size: 11px; font-weight: 500; letter-spacing: .16em;
          text-transform: uppercase; color: #aaa; margin-bottom: 8px;
        }
        .hm-greeting {
          font-family: 'Fraunces', serif;
          font-size: clamp(26px, 4vw, 44px);
          font-weight: 600; color: #111;
          line-height: 1.1; letter-spacing: -.02em;
        }
        .hm-name { font-style: italic; font-weight: 400; }
        .hm-hero-right {
          display: flex; flex-direction: column; align-items: flex-end; gap: 8px;
        }
        .hm-week-pill {
          display: inline-flex; align-items: center; gap: 7px;
          background: #111; color: #fff;
          font-size: 11px; font-weight: 500; letter-spacing: .06em;
          padding: 7px 14px; border-radius: 40px; white-space: nowrap;
        }
        .hm-live {
          width: 6px; height: 6px; border-radius: 50%; background: #4ade80;
          box-shadow: 0 0 0 3px rgba(74,222,128,.25);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%,100% { box-shadow: 0 0 0 3px rgba(74,222,128,.25); }
          50%      { box-shadow: 0 0 0 5px rgba(74,222,128,.1); }
        }
        .hm-sub { font-size: 13px; color: #999; font-weight: 300; }

        .hm-body {
          max-width: 1200px; margin: 0 auto;
          padding: clamp(20px,4vw,40px) clamp(16px,4vw,52px) 0;
          display: grid; gap: 20px;
          grid-template-columns: 1fr;
        }
        @media (min-width: 768px) {
          .hm-body { grid-template-columns: 1fr 1fr; }
          .hm-full { grid-column: 1 / -1; }
        }
        @media (min-width: 1100px) {
          .hm-body { grid-template-columns: 1.4fr 1fr 1fr; }
          .hm-left { grid-row: 1 / 3; }
        }

        .hm-lbl {
          font-size: 10px; font-weight: 600; letter-spacing: .18em;
          text-transform: uppercase; color: #bbb; margin-bottom: 10px;
        }

        /* STATUS */
        .hm-status {
          background: #111; border-radius: 22px;
          padding: clamp(20px,4vw,28px); position: relative; overflow: hidden; height: 100%;
        }
        .hm-status::before {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 160px 120px at 95% 5%, rgba(34,197,94,.15) 0%, transparent 55%),
            radial-gradient(ellipse 100px 100px at 5% 95%, rgba(167,139,250,.1) 0%, transparent 55%);
        }
        .hm-status-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
        .hm-chip {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(34,197,94,.1); color: #4ade80;
          border: 1px solid rgba(34,197,94,.2);
          font-size: 11px; font-weight: 500; letter-spacing: .06em;
          padding: 5px 12px; border-radius: 40px;
        }
        .hm-chip-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; box-shadow: 0 0 0 3px rgba(74,222,128,.25); }
        .hm-wk { font-size: 11px; color: #333; }
        .hm-status-title { font-family: 'Fraunces', serif; font-size: clamp(22px,3vw,30px); font-weight: 600; color: #fff; line-height: 1.1; margin-bottom: 6px; }
        .hm-status-sub { font-size: 13px; color: #444; font-weight: 300; margin-bottom: 20px; }
        .hm-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .hm-stat { background: #1a1a19; border: 1px solid #252320; border-radius: 12px; padding: 11px 13px; }
        .hm-stat-l { font-size: 9px; letter-spacing: .1em; text-transform: uppercase; color: #444; margin-bottom: 4px; }
        .hm-stat-v { font-size: 14px; font-weight: 600; }

        /* TIP */
        .hm-tip { border-radius: 22px; padding: clamp(18px,3vw,24px); position: relative; overflow: hidden; }
        .hm-tip-wm { position: absolute; top: 0; right: 10px; font-family: 'Fraunces', serif; font-size: 100px; font-style: italic; line-height: 1; opacity: .09; pointer-events: none; user-select: none; }
        .hm-tip-head { display: flex; align-items: center; gap: 9px; margin-bottom: 13px; }
        .hm-tip-ico { width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .hm-tip-badge { font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
        .hm-tip-day { font-size: 11px; font-weight: 300; margin-left: auto; opacity: .4; }
        .hm-tip-text { font-family: 'Fraunces', serif; font-size: clamp(14px,2vw,16px); font-weight: 300; font-style: italic; line-height: 1.65; position: relative; z-index: 1; }

        /* APPT */
        .hm-appt {
          background: #fff; border: 1px solid #e8e6e1; border-radius: 18px;
          padding: 15px 18px; display: flex; align-items: center; gap: 14px;
          cursor: pointer; transition: border-color .2s, box-shadow .2s;
        }
        .hm-appt:hover { border-color: #ccc; box-shadow: 0 6px 22px rgba(0,0,0,.06); }
        .hm-appt-cal { width: 50px; height: 50px; flex-shrink: 0; background: #111; border-radius: 13px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .hm-appt-n { font-family: 'Fraunces', serif; font-size: 22px; color: #fff; line-height: 1; }
        .hm-appt-m { font-size: 9px; color: #555; text-transform: uppercase; letter-spacing: .1em; }
        .hm-appt-t { font-size: 14px; font-weight: 600; margin-bottom: 3px; }
        .hm-appt-d { font-size: 12px; color: #aaa; font-weight: 300; }

        /* REMINDERS CARD */
        .hm-reminders-card {
          background: #fff; border: 1px solid #e8e6e1; border-radius: 22px;
          padding: clamp(18px,3vw,24px);
        }

        /* BENTO */
        .hm-bento {
          display: grid; gap: 12px;
          grid-template-columns: 1fr 1fr;
          grid-template-areas:
            "ai     ai"
            "emer   fac"
            "hub    hub";
        }
        @media (min-width: 600px) {
          .hm-bento {
            grid-template-columns: 1.3fr 1fr 1fr;
            grid-template-rows: auto auto;
            grid-template-areas:
              "ai  emer  fac"
              "ai  hub   hub";
          }
        }
        .hm-card { border-radius: 20px; border: 1px solid #e0ddd7; background: #fff; overflow: hidden; position: relative; }
        .hm-card-ai { grid-area: ai; display: flex; flex-direction: column; }
        .hm-card-ai-header { display: flex; align-items: center; gap: 10px; padding: 16px 16px 12px; border-bottom: 1px solid #f0eeea; }
        .hm-card-ai-icon { width: 34px; height: 34px; border-radius: 10px; background: #111; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .hm-card-ai-title { font-size: 14px; font-weight: 600; color: #111; }
        .hm-card-ai-sub   { font-size: 11px; color: #aaa; font-weight: 300; }
        .hm-card-ai-badge { margin-left: auto; font-size: 10px; font-weight: 600; letter-spacing: .06em; background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; padding: 3px 9px; border-radius: 40px; white-space: nowrap; }
        .hm-ai-input-row { display: flex; align-items: center; gap: 0; margin: 12px 12px 0; background: #f8f7f4; border: 1px solid #e8e6e1; border-radius: 12px; overflow: hidden; }
        .hm-ai-input { flex: 1; border: none; background: transparent; padding: 12px 14px; font-family: 'Manrope', sans-serif; font-size: 13px; color: #111; outline: none; }
        .hm-ai-input::placeholder { color: #bbb; }
        .hm-ai-send { width: 40px; height: 40px; flex-shrink: 0; border: none; background: #111; display: flex; align-items: center; justify-content: center; cursor: pointer; margin: 4px; border-radius: 9px; transition: background .15s; }
        .hm-ai-send:hover { background: #333; }
        .ai-ticker { display: flex; align-items: center; gap: 10px; margin: 8px 12px 12px; padding: 9px 12px; border-radius: 10px; background: #f8f7f4; border: 1px solid #eeecea; cursor: pointer; text-align: left; width: calc(100% - 24px); transition: background .15s; position: relative; }
        .ai-ticker:hover { background: #f0eeea; }
        .ai-ticker-dot { width: 7px; height: 7px; flex-shrink: 0; border-radius: 50%; background: var(--tc, #6366f1); box-shadow: 0 0 0 3px color-mix(in srgb, var(--tc, #6366f1) 20%, transparent); }
        .ai-ticker-content { flex: 1; display: flex; flex-direction: column; gap: 2px; transition: opacity .4s ease; }
        .ai-ticker-tag { font-size: 9px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; padding: 1px 6px; border-radius: 4px; align-self: flex-start; }
        .ai-ticker-text { font-size: 12px; color: #555; font-weight: 400; line-height: 1.4; }
        .ai-ticker-arr { color: #ccc; flex-shrink: 0; }
        .hm-card-emer { grid-area: emer; cursor: pointer; transition: border-color .2s; }
        .hm-card-emer:hover { border-color: #fca5a5; }
        .hm-card-emer-inner { display: flex; flex-direction: column; justify-content: space-between; height: 100%; padding: 16px; }
        .hm-card-icon-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .hm-icon-box { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .hm-card-title { font-size: 14px; font-weight: 600; color: #111; margin-bottom: 3px; }
        .hm-card-sub   { font-size: 12px; color: #aaa; font-weight: 300; line-height: 1.4; }
        .hm-arr-btn { width: 26px; height: 26px; border-radius: 50%; border: 1px solid #e8e6e1; display: flex; align-items: center; justify-content: center; background: transparent; cursor: pointer; }
        .hm-emer-ring { width: 38px; height: 38px; position: relative; flex-shrink: 0; }
        .hm-emer-ring::before { content: ''; position: absolute; inset: -4px; border-radius: 50%; border: 1.5px solid rgba(220,38,38,.3); animation: ring 2s infinite; }
        @keyframes ring { 0% { transform: scale(1); opacity: .8; } 100%{ transform: scale(1.4); opacity: 0; } }
        .hm-card-fac { grid-area: fac; cursor: pointer; transition: border-color .2s; }
        .hm-card-fac:hover { border-color: #bbf7d0; }
        .hm-card-fac-inner { display: flex; flex-direction: column; height: 100%; padding: 16px; }
        .hm-fac-list { display: flex; flex-direction: column; gap: 7px; margin-top: 8px; flex: 1; }
        .hm-fac-item { display: flex; align-items: center; gap: 8px; padding: 7px 9px; border-radius: 9px; background: #f8f7f4; cursor: pointer; transition: background .15s; }
        .hm-fac-item:hover { background: #f0eeea; }
        .hm-fac-name { font-size: 11px; font-weight: 600; color: #111; }
        .hm-fac-meta { font-size: 10px; color: #aaa; font-weight: 300; }
        .hm-fac-open { margin-left: auto; font-size: 9px; font-weight: 600; padding: 2px 7px; border-radius: 20px; white-space: nowrap; }
        .hm-open-yes { background: #f0fdf4; color: #15803d; }
        .hm-open-no  { background: #fef2f2; color: #b91c1c; }
        .hm-card-hub { grid-area: hub; cursor: pointer; transition: border-color .2s; }
        .hm-card-hub:hover { border-color: #ddd6fe; }
        .hm-hub-inner { padding: 16px; }
        .hm-hub-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .hm-hub-title-row { display: flex; flex-direction: column; gap: 2px; }
        .hm-hub-modules { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        @media (min-width: 480px) { .hm-hub-modules { grid-template-columns: repeat(4, 1fr); } }
        .hm-hub-mod { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 11px 8px; border-radius: 12px; background: #f8f7f4; cursor: pointer; text-align: center; transition: background .15s; border: 1px solid transparent; }
        .hm-hub-mod:hover { background: #f0eeea; border-color: #e8ddf5; }
        .hm-hub-mod-label { font-size: 11px; font-weight: 500; color: #111; line-height: 1.3; }
        .hm-hub-mod-sub   { font-size: 10px; color: #aaa; font-weight: 300; line-height: 1.3; }
      `}</style>

      <div className="hm">

        {/* HERO */}
        <div className="hm-hero">
          <div className="hm-hero-left">
            <p className="hm-date">{dateStr}</p>
            <h1 className="hm-greeting">
              {getGreeting()}, <span className="hm-name" style={{ color: nameColor }}>Amina.</span>
            </h1>
          </div>
          <div className="hm-hero-right">
            <span className="hm-week-pill"><span className="hm-live" /> Week 2 · Active Recovery</span>
            <p className="hm-sub">Here's how your recovery is going today.</p>
          </div>
        </div>

        <div className="hm-body">

          {/* Status */}
          <div className="hm-left">
            <p className="hm-lbl">Recovery Overview</p>
            <div className="hm-status">
              <div className="hm-status-top">
                <span className="hm-chip"><span className="hm-chip-dot" /> Stable</span>
                <span className="hm-wk">Week 2 of 6</span>
              </div>
              <p className="hm-status-title">Steady &amp; Recovering</p>
              <p className="hm-status-sub">You're making solid progress. Keep monitoring your symptoms daily.</p>
              <div className="hm-stats">
                {STATS.map(s => (
                  <div className="hm-stat" key={s.label}>
                    <p className="hm-stat-l">{s.label}</p>
                    <p className="hm-stat-v" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tip */}
          <div>
            <p className="hm-lbl">Today's Health Tip</p>
            <div className="hm-tip" style={{ background: tip.bg }}>
              <div className="hm-tip-wm" style={{ color: tip.accent }}>"</div>
              <div className="hm-tip-head">
                <div className="hm-tip-ico" style={{ background: tip.accent + "20" }}>
                  <TipIcon size={16} color={tip.accent} strokeWidth={1.8} />
                </div>
                <span className="hm-tip-badge" style={{ color: tip.accent }}>{tip.label}</span>
                <span className="hm-tip-day"   style={{ color: tip.accent }}>{DAYS[now.getDay()]}</span>
              </div>
              <p className="hm-tip-text" style={{ color: tip.accent }}>"{tip.tip}"</p>
            </div>
          </div>

          {/* Appointment */}
          <div>
            <p className="hm-lbl">Next Appointment</p>
            <div className="hm-appt" onClick={() => navigate("/reminders")}>
              <div className="hm-appt-cal">
                <span className="hm-appt-n">19</span>
                <span className="hm-appt-m">May</span>
              </div>
              <div style={{ flex: 1 }}>
                <p className="hm-appt-t">Post-Loss Follow-up</p>
                <p className="hm-appt-d">Kenyatta National Hospital · 10:00 AM</p>
              </div>
              <ChevronRight size={16} color="#ccc" />
            </div>
          </div>

          {/* ── REMINDERS — new section ── */}
          <div className="hm-full">
            <p className="hm-lbl">Reminders</p>
            <div className="hm-reminders-card">
              <CompactReminders navigate={navigate} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="hm-full">
            <p className="hm-lbl">Quick Actions</p>
            <div className="hm-bento">

              {/* AI CARD */}
              <div className="hm-card hm-card-ai">
                <div className="hm-card-ai-header">
                  <div className="hm-card-ai-icon">
                    <Bot size={18} color="#fff" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="hm-card-ai-title">AI Health Assistant</p>
                    <p className="hm-card-ai-sub">Ask me anything about your recovery</p>
                  </div>
                  <span className="hm-card-ai-badge">24/7</span>
                </div>
                <div className="hm-ai-input-row">
                  <input
                    ref={inputRef}
                    className="hm-ai-input"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendToAI()}
                    placeholder="Type your question here…"
                  />
                  <button className="hm-ai-send" onClick={() => sendToAI()}>
                    <Send size={14} color="#fff" strokeWidth={2} />
                  </button>
                </div>
                <AiTicker onSelect={sendToAI} />
              </div>

              {/* EMERGENCY */}
              <div className="hm-card hm-card-emer" onClick={() => navigate("/emergency-alert")}>
                <div className="hm-card-emer-inner">
                  <div className="hm-card-icon-row">
                    <div className="hm-emer-ring">
                      <div className="hm-icon-box" style={{ background: "#fef2f2", border: "1px solid #fecaca", width: 38, height: 38, borderRadius: 10 }}>
                        <AlertTriangle size={18} color="#dc2626" strokeWidth={1.8} />
                      </div>
                    </div>
                    <div className="hm-arr-btn"><ArrowUpRight size={12} color="#aaa" /></div>
                  </div>
                  <div>
                    <p className="hm-card-title">Emergency Alert</p>
                    <p className="hm-card-sub">Feeling unwell? Get immediate help</p>
                  </div>
                </div>
              </div>

              {/* FIND FACILITY */}
              <div className="hm-card hm-card-fac" onClick={() => navigate("/map")}>
                <div className="hm-card-fac-inner">
                  <div className="hm-card-icon-row">
                    <div className="hm-icon-box" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                      <MapPin size={18} color="#16a34a" strokeWidth={1.8} />
                    </div>
                    <div className="hm-arr-btn"><ArrowUpRight size={12} color="#aaa" /></div>
                  </div>
                  <p className="hm-card-title" style={{ marginBottom: 8 }}>Nearby Facilities</p>
                  <div className="hm-fac-list">
                    {FACILITIES.map(f => (
                      <div className="hm-fac-item" key={f.name}>
                        <f.Icon size={13} color="#aaa" strokeWidth={1.5} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p className="hm-fac-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</p>
                          <p className="hm-fac-meta">{f.dist} · {f.type}</p>
                        </div>
                        <span className={`hm-fac-open ${f.open ? "hm-open-yes" : "hm-open-no"}`}>
                          {f.open ? "Open" : "Closed"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RECOVERY HUB */}
              <div className="hm-card hm-card-hub" onClick={() => navigate("/safe-recovery")}>
                <div className="hm-hub-inner">
                  <div className="hm-hub-top">
                    <div className="hm-hub-title-row">
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <div className="hm-icon-box" style={{ background: "#faf5ff", border: "1px solid #e9d5ff", width: 32, height: 32, borderRadius: 9 }}>
                          <Heart size={15} color="#9333ea" strokeWidth={1.8} />
                        </div>
                        <p className="hm-card-title">Recovery Hub</p>
                      </div>
                      <p className="hm-card-sub">Your space to heal, learn, and feel supported</p>
                    </div>
                    <div className="hm-arr-btn" style={{ flexShrink: 0, marginLeft: 8 }}>
                      <ArrowUpRight size={12} color="#aaa" />
                    </div>
                  </div>
                  <div className="hm-hub-modules">
                    {RECOVERY_ITEMS.map(item => (
                      <div className="hm-hub-mod" key={item.label}
                        onClick={e => { e.stopPropagation(); navigate("/safe-recovery"); }}>
                        <item.Icon size={18} color="#9333ea" strokeWidth={1.5} />
                        <p className="hm-hub-mod-label">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}