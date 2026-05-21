import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus, CheckCircle2, Bell, AlertTriangle, ChevronRight,
} from "lucide-react";
import Mascot from "../../Components/Mascot/Mascot";
import ReminderCard from "../../Components/Reminder/Remindercard";
import AIReminderSuggestion from "../../Components/Reminder/Airemindersuggestion";
import AddReminderModal from "../../Components/Reminder/Addremindermodal";

/* ─────────────────────────────────
   DATA
───────────────────────────────── */
const dummyReminders = [
  { id:1, type:'Follow-up Appointment', datetime:'May 22, 2026 at 10:00 AM', note:'Post-loss follow-up at Kenyatta National Hospital', aiMessage:'Sarah, your follow-up appointment at Kenyatta National Hospital is tomorrow at 10am. This visit helps confirm your body has fully recovered from your loss in February. Please do not skip it.', missedCount:0, completed:false, overdue:false },
  { id:2, type:'Medication', datetime:'May 21, 2026 at 8:00 AM', note:'Iron supplement', aiMessage:'Taking your iron supplement today helps your body rebuild after your loss. It is a small thing that makes a real difference.', missedCount:0, completed:false, overdue:true },
  { id:3, type:'Emotional Check-in', datetime:'May 23, 2026 at 6:00 PM', note:null, aiMessage:'You set this check-in for yourself. A few minutes to sit with how you are feeling is always worth it.', missedCount:0, completed:false, overdue:false },
  { id:4, type:'Follow-up Appointment', datetime:'May 18, 2026 at 9:00 AM', note:'Missed twice now', aiMessage:'This appointment has been missed. Your recovery matters — please try to reschedule as soon as possible.', missedCount:2, completed:false, overdue:true },
  { id:5, type:'Danger Signs Education', datetime:'May 25, 2026 at 7:00 PM', note:null, aiMessage:'Knowing the warning signs of incomplete recovery could be life-saving. This reminder is set to keep you informed.', missedCount:0, completed:false, overdue:false },
];

const dummySuggestion = {
  message: "It has been 3 weeks since your loss. Most doctors recommend a follow-up check at this point. Would you like me to add a reminder for that?",
  reminderData: { type:'Follow-up Appointment', datetime:'May 28, 2026 at 10:00 AM', note:'AI suggested follow-up — 3 weeks post-loss', aiMessage:'This follow-up was suggested based on your recovery timeline. Three weeks post-loss is an important checkpoint. Please do not miss it.', missedCount:0, completed:false, overdue:false },
};

const SNOOZE_OPTIONS = [
  { label:'In 1 hour',        value:'1h'  },
  { label:'Tomorrow morning', value:'tmr' },
  { label:'In 3 days',        value:'3d'  },
];

const GROUP_LABELS = {
  overdue:    { label:'Overdue',               color:'#dc2626' },
  followup:   { label:'Follow-up Appointments', color:'#6b7280' },
  medication: { label:'Medication',            color:'#6b7280' },
  other:      { label:'Check-ins & Education', color:'#6b7280' },
};

/* ─── Sarah's contextual messages per situation ─── */
const SARAH_STATES = {
  allClear:   { mood:"happy",       msg:"You are all caught up. Well done, Sarah."              },
  hasOverdue: { mood:"concerned",   msg:"You have overdue items. Let us get through them together." },
  justDone:   { mood:"celebrating", msg:"You did it. One step at a time."                       },
  default:    { mood:"idle",        msg:"I am here to help you stay on track."                  },
  overdueBanner: { mood:"concerned", msg:"This one has been missed. Your recovery matters — please reschedule." },
  suggestion: { mood:"idle",        msg:"I noticed something in your timeline. Here is a suggestion." },
};

/* ─── Helpers ─── */
function snoozeDatetime(option) {
  const now = new Date();
  if (option === '1h')  now.setHours(now.getHours() + 1);
  if (option === 'tmr') { now.setDate(now.getDate() + 1); now.setHours(8,0,0,0); }
  if (option === '3d')  now.setDate(now.getDate() + 3);
  return now.toLocaleString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

/* ─── Toast ─── */
function Toast({ message }) {
  return (
    <div style={{ position:'fixed', bottom:'90px', left:'50%', transform:'translateX(-50%)', background:'#111', color:'#fff', borderRadius:'20px', padding:'10px 20px', fontSize:'13px', fontWeight:500, fontFamily:"'Manrope', sans-serif", zIndex:9999, whiteSpace:'nowrap', pointerEvents:'none' }}>
      {message}
    </div>
  );
}

/* ─────────────────────────────────
   TYPED TEXT — character by character
───────────────────────────────── */
function TypedText({ text }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const t = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(t);
    }, 20);
    return () => clearInterval(t);
  }, [text]);
  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span style={{ opacity:0.3 }}>|</span>
      )}
    </span>
  );
}

/* ─────────────────────────────────
   SARAH HEADER STRIP
   Persistent at the top — reacts to page state
───────────────────────────────── */
function SarahHeader({ mood, message, isVisible }) {
  return (
    <div style={{
      flexShrink: 0,
      background: '#f4f3f0',
      borderBottom: '1px solid #e5e3de',
      padding: '0 clamp(20px,5vw,52px)',
      display: 'flex',
      alignItems: 'flex-end',
      gap: '0',
      minHeight: '88px',
    }}>
      {/* Mascot — feet flush to divider */}
      <div style={{ flexShrink:0, marginBottom:'-2px' }}>
        <Mascot mood={mood} message="" position="left" size={76} />
      </div>

      {/* Message bubble */}
      <div style={{
        flex: 1,
        paddingBottom: '16px',
        paddingLeft: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
        minWidth: 0,
      }}>
        <span style={{
          fontFamily: "'Fraunces', serif",
          fontSize: '15px',
          fontWeight: 600,
          color: '#111',
          letterSpacing: '-.01em',
        }}>Sarah</span>

        {isVisible && message && (
          <div style={{
            background: '#fff',
            border: '1px solid #e8e6e1',
            borderRadius: '4px 14px 14px 14px',
            padding: '9px 14px',
            fontSize: '13px',
            lineHeight: 1.55,
            color: '#222',
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 400,
            maxWidth: '420px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            animation: 'rs-bubble-in .3s ease',
          }}>
            <TypedText text={message} key={message} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────
   SARAH INLINE STRIP
   Sits inside a section — reacts to that group
───────────────────────────────── */
function SarahInline({ mood, message, visible, dark = false }) {
  if (!visible || !message) return null;
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      gap: '8px',
      marginBottom: '10px',
      animation: 'rs-bubble-in .35s ease',
    }}>
      <div style={{ flexShrink: 0 }}>
        <Mascot mood={mood} message="" position="left" size={52} />
      </div>
      <div style={{
        background: dark ? 'rgba(255,255,255,0.08)' : '#fff',
        border: dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e8e6e1',
        borderRadius: '4px 14px 14px 14px',
        padding: '9px 13px',
        fontSize: '13px',
        lineHeight: 1.55,
        color: dark ? 'rgba(255,255,255,0.82)' : '#222',
        fontFamily: "'Manrope', sans-serif",
        fontWeight: 400,
        maxWidth: '300px',
        boxShadow: dark ? 'none' : '0 1px 8px rgba(0,0,0,0.05)',
      }}>
        <TypedText text={message} key={message} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────
   MAIN COMPONENT
───────────────────────────────── */
export default function ReminderSystem({ compact = false }) {
  const [reminders,    setReminders]    = useState(dummyReminders);
  const [suggestion,   setSuggestion]   = useState(dummySuggestion);
  const [showModal,    setShowModal]    = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [snoozeOpenId, setSnoozeOpenId] = useState(null);
  const [toast,        setToast]        = useState({ visible:false, message:'' });

  /* ── Sarah state ── */
  const [sarahMood,    setSarahMood]    = useState("idle");
  const [sarahMsg,     setSarahMsg]     = useState("");
  const [sarahVisible, setSarahVisible] = useState(false);
  const celebrateTimer = useRef(null);

  /* ── Derived counts ── */
  const active       = reminders.filter(r => !r.completed);
  const done         = reminders.filter(r =>  r.completed);
  const overdueItems = active.filter(r => r.overdue);

  /* ── Set Sarah's state based on page content ── */
  useEffect(() => {
    const t = setTimeout(() => {
      setSarahVisible(true);
      if (active.length === 0 && done.length > 0) {
        setSarahMood(SARAH_STATES.allClear.mood);
        setSarahMsg(SARAH_STATES.allClear.msg);
      } else if (overdueItems.length > 0) {
        setSarahMood(SARAH_STATES.hasOverdue.mood);
        setSarahMsg(SARAH_STATES.hasOverdue.msg);
      } else if (suggestion) {
        setSarahMood(SARAH_STATES.suggestion.mood);
        setSarahMsg(SARAH_STATES.suggestion.msg);
      } else {
        setSarahMood(SARAH_STATES.default.mood);
        setSarahMsg(SARAH_STATES.default.msg);
      }
    }, 600);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line

  function showToast(msg) {
    setToast({ visible:true, message:msg });
    setTimeout(() => setToast({ visible:false, message:'' }), 2000);
  }

  function handleComplete(id) {
    setReminders(rs => rs.map(r => r.id === id ? { ...r, completed:true } : r));
    // Sarah celebrates
    if (celebrateTimer.current) clearTimeout(celebrateTimer.current);
    setSarahMood("celebrating");
    setSarahMsg(SARAH_STATES.justDone.msg);
    celebrateTimer.current = setTimeout(() => {
      // Re-evaluate after celebrate
      const stillActive   = reminders.filter(r => !r.completed && r.id !== id);
      const stillOverdue  = stillActive.filter(r => r.overdue);
      if (stillActive.length === 0) {
        setSarahMood("happy");
        setSarahMsg(SARAH_STATES.allClear.msg);
      } else if (stillOverdue.length > 0) {
        setSarahMood("concerned");
        setSarahMsg(SARAH_STATES.hasOverdue.msg);
      } else {
        setSarahMood("idle");
        setSarahMsg(SARAH_STATES.default.msg);
      }
    }, 3500);
  }

  function handleDismiss(id) {
    setReminders(rs => rs.filter(r => r.id !== id));
    showToast('Reminder dismissed.');
  }

  function handleSnooze(id, option) {
    setReminders(rs => rs.map(r => r.id === id ? { ...r, datetime:snoozeDatetime(option), overdue:false } : r));
    setSnoozeOpenId(null);
    showToast('Reminder snoozed.');
    setSarahMood("idle");
    setSarahMsg("I have snoozed that for you. I will remind you again.");
    setTimeout(() => setSarahMsg(SARAH_STATES.default.msg), 4000);
  }

  function handleAcceptSuggestion(reminderData) {
    setReminders(rs => [...rs, { ...reminderData, id:Date.now() }]);
    setSuggestion(null);
    showToast('Reminder added.');
    setSarahMood("happy");
    setSarahMsg("Added! I will make sure you do not miss it.");
    setTimeout(() => {
      setSarahMood("idle");
      setSarahMsg(SARAH_STATES.default.msg);
    }, 3500);
  }

  function handleAddReminder(reminder) {
    setReminders(rs => [...rs, reminder]);
    showToast('Reminder added.');
    setSarahMood("happy");
    setSarahMsg("New reminder saved. I have got you.");
    setTimeout(() => {
      setSarahMood("idle");
      setSarahMsg(SARAH_STATES.default.msg);
    }, 3000);
  }

  /* ── Hover reactions ── */
  function handleReminderHover(r) {
    if (r.overdue) {
      setSarahMood("concerned");
      setSarahMsg(r.missedCount >= 2
        ? "This has been missed more than once. Please try to reschedule as soon as possible."
        : "This one is overdue. Let us take care of it today.");
    }
  }
  function handleReminderLeave() {
    // Return to contextual default after a beat
    setTimeout(() => {
      if (overdueItems.length > 0) {
        setSarahMood("concerned");
        setSarahMsg(SARAH_STATES.hasOverdue.msg);
      } else {
        setSarahMood("idle");
        setSarahMsg(SARAH_STATES.default.msg);
      }
    }, 1500);
  }

  /* ─── COMPACT VIEW (home page embed) ─── */
  if (compact) {
    const upcoming = reminders.filter(r => !r.completed).slice(0,3);
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,400&family=Manrope:wght@300;400;500;600&display=swap');`}</style>
        <div style={{ fontFamily:"'Manrope', sans-serif" }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
            <p style={{ fontFamily:"'Manrope', sans-serif", fontWeight:700, fontSize:'15px', color:'#111' }}>Upcoming reminders</p>
            <button style={{ display:'flex', alignItems:'center', gap:'3px', background:'none', border:'none', color:'#16a34a', fontWeight:600, fontSize:'12px', cursor:'pointer', fontFamily:"'Manrope', sans-serif" }}>
              See all <ChevronRight size={13} />
            </button>
          </div>
          {upcoming.length === 0 ? (
            <p style={{ color:'#6b7280', fontSize:'13px' }}>No upcoming reminders. Tap + to add one.</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'14px' }}>
              {upcoming.map(r => (
                <ReminderCard key={r.id} reminder={r} compact onComplete={() => handleComplete(r.id)} />
              ))}
            </div>
          )}
          <button onClick={() => setShowModal(true)} style={{ width:'100%', padding:'11px', borderRadius:'10px', border:'1px solid #e5e7eb', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', gap:'7px', fontSize:'13px', fontWeight:600, color:'#111', cursor:'pointer', fontFamily:"'Manrope', sans-serif" }}>
            <Plus size={15} /> Add reminder
          </button>
          {showModal && <AddReminderModal onClose={() => setShowModal(false)} onAdd={handleAddReminder} />}
          {toast.visible && <Toast message={toast.message} />}
        </div>
      </>
    );
  }

  /* ─── FULL VIEW ─── */
  const filtered = activeFilter === 'completed' ? done
                 : activeFilter === 'upcoming'  ? active
                 : reminders;

  const overdue    = active.filter(r => r.overdue);
  const followup   = active.filter(r => !r.overdue && r.type === 'Follow-up Appointment');
  const medication = active.filter(r => !r.overdue && r.type === 'Medication');
  const other      = active.filter(r => !r.overdue && r.type !== 'Follow-up Appointment' && r.type !== 'Medication');

  const groups = [
    { key:'overdue',    items:overdue    },
    { key:'followup',   items:followup   },
    { key:'medication', items:medication },
    { key:'other',      items:other      },
  ].filter(g => g.items.length > 0);

  const sectionLabelStyle = (color) => ({
    display:'flex', alignItems:'center', gap:'6px',
    fontSize:'10px', fontWeight:700, letterSpacing:'.14em',
    textTransform:'uppercase', color,
    marginBottom:'8px', marginTop:'4px',
  });

  const filterPillStyle = (isActive) => ({
    padding:'6px 14px', borderRadius:'40px',
    border: isActive ? 'none' : '1px solid #e5e7eb',
    background: isActive ? '#111' : 'transparent',
    color: isActive ? '#fff' : '#6b7280',
    fontSize:'12px', fontWeight:500, cursor:'pointer',
    fontFamily:"'Manrope', sans-serif", transition:'all .15s',
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,400&family=Manrope:wght@300;400;500;600&display=swap');
        @keyframes rs-bubble-in {
          from { opacity:0; transform:translateY(6px); }
          to   { opacity:1; transform:translateY(0);   }
        }
      `}</style>

      <div style={{
        background: '#f4f3f0',
        minHeight: '100vh',
        fontFamily: "'Manrope', sans-serif",
        paddingBottom: '110px',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* ── SARAH HEADER — always visible ── */}
        <SarahHeader
          mood={sarahMood}
          message={sarahMsg}
          isVisible={sarahVisible}
        />

        {/* ── PAGE TITLE ROW ── */}
        <div style={{
          padding: 'clamp(24px,4vw,40px) clamp(20px,5vw,52px) clamp(16px,3vw,24px)',
          borderBottom: '1px solid #e5e3de',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <p style={{ fontSize:'11px', fontWeight:500, letterSpacing:'.16em', textTransform:'uppercase', color:'#aaa', marginBottom:'8px' }}>
              Your Schedule
            </p>
            <h1 style={{ fontFamily:"'Fraunces', serif", fontSize:'clamp(26px,4vw,44px)', fontWeight:600, color:'#111', lineHeight:1.1, letterSpacing:'-.02em', margin:0 }}>
              Reminders
            </h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{ display:'flex', alignItems:'center', gap:'7px', padding:'9px 18px', borderRadius:'40px', border:'1px solid #111', background:'transparent', color:'#111', fontSize:'13px', fontWeight:600, cursor:'pointer', fontFamily:"'Manrope', sans-serif" }}
          >
            <Plus size={15} /> Add reminder
          </button>
        </div>

        {/* ── BODY ── */}
        <div style={{ maxWidth:'720px', margin:'0 auto', padding:'clamp(20px,4vw,40px) clamp(16px,4vw,32px) 0', display:'flex', flexDirection:'column', gap:'12px', width:'100%' }}>

          {/* AI Suggestion — Sarah reacts when it's visible */}
          {suggestion && (
            <div
              onMouseEnter={() => { setSarahMood("idle"); setSarahMsg(SARAH_STATES.suggestion.msg); }}
            >
              <AIReminderSuggestion
                suggestion={suggestion}
                onAccept={handleAcceptSuggestion}
                onDismiss={() => { setSuggestion(null); setSarahMsg(SARAH_STATES.default.msg); }}
              />
            </div>
          )}

          {/* Filter pills */}
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            {['all','upcoming','completed'].map(f => (
              <button key={f} style={filterPillStyle(activeFilter === f)} onClick={() => setActiveFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Overdue group — Sarah appears inline above overdue cards */}
          {activeFilter !== 'completed' && overdue.length > 0 && (
            <div>
              {/* Sarah inline — only for overdue group */}
              <SarahInline
                mood="concerned"
                message={`You have ${overdue.length} overdue item${overdue.length > 1 ? 's' : ''}. Let us work through them together.`}
                visible={sarahVisible}
              />

              <div style={sectionLabelStyle(GROUP_LABELS.overdue.color)}>
                <AlertTriangle size={12} />
                {GROUP_LABELS.overdue.label}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {overdue.map(r => (
                  <div key={r.id} style={{ position:'relative' }}
                    onMouseEnter={() => handleReminderHover(r)}
                    onMouseLeave={handleReminderLeave}
                  >
                    <ReminderCard
                      reminder={r}
                      onComplete={() => handleComplete(r.id)}
                      onDismiss={()  => handleDismiss(r.id)}
                      onSnooze={()   => setSnoozeOpenId(snoozeOpenId === r.id ? null : r.id)}
                    />
                    {snoozeOpenId === r.id && (
                      <div style={{ position:'absolute', bottom:'48px', right:'0', background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', boxShadow:'0 4px 16px rgba(0,0,0,0.1)', overflow:'hidden', zIndex:100, minWidth:'170px' }}>
                        {SNOOZE_OPTIONS.map(opt => (
                          <button key={opt.value} onClick={() => handleSnooze(r.id, opt.value)}
                            style={{ display:'block', width:'100%', padding:'10px 14px', border:'none', background:'transparent', textAlign:'left', fontSize:'13px', color:'#111', cursor:'pointer', fontFamily:"'Manrope', sans-serif", borderBottom:'1px solid #f4f3f0' }}
                            onMouseEnter={e=>e.currentTarget.style.background='#f8f7f4'}
                            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up, Medication, Other groups */}
          {activeFilter !== 'completed' && [
            { key:'followup',   items:followup   },
            { key:'medication', items:medication },
            { key:'other',      items:other      },
          ].filter(g => g.items.length > 0).map(group => (
            <div key={group.key}>
              <div style={sectionLabelStyle(GROUP_LABELS[group.key].color)}>
                {GROUP_LABELS[group.key].label}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {group.items.map(r => (
                  <div key={r.id} style={{ position:'relative' }}
                    onMouseEnter={() => handleReminderHover(r)}
                    onMouseLeave={handleReminderLeave}
                  >
                    <ReminderCard
                      reminder={r}
                      onComplete={() => handleComplete(r.id)}
                      onDismiss={()  => handleDismiss(r.id)}
                      onSnooze={()   => setSnoozeOpenId(snoozeOpenId === r.id ? null : r.id)}
                    />
                    {snoozeOpenId === r.id && (
                      <div style={{ position:'absolute', bottom:'48px', right:'0', background:'#fff', border:'1px solid #e5e7eb', borderRadius:'10px', boxShadow:'0 4px 16px rgba(0,0,0,0.1)', overflow:'hidden', zIndex:100, minWidth:'170px' }}>
                        {SNOOZE_OPTIONS.map(opt => (
                          <button key={opt.value} onClick={() => handleSnooze(r.id, opt.value)}
                            style={{ display:'block', width:'100%', padding:'10px 14px', border:'none', background:'transparent', textAlign:'left', fontSize:'13px', color:'#111', cursor:'pointer', fontFamily:"'Manrope', sans-serif", borderBottom:'1px solid #f4f3f0' }}
                            onMouseEnter={e=>e.currentTarget.style.background='#f8f7f4'}
                            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Completed — Sarah gives a nod */}
          {(activeFilter === 'completed' || activeFilter === 'all') && done.length > 0 && (
            <div>
              {/* Sarah inline for completed section */}
              {activeFilter === 'completed' && (
                <SarahInline
                  mood="happy"
                  message={`${done.length} item${done.length > 1 ? 's' : ''} completed. You are doing really well.`}
                  visible={sarahVisible}
                />
              )}
              <div style={sectionLabelStyle('#6b7280')}>
                <CheckCircle2 size={12} />
                Completed
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px', opacity:0.5 }}>
                {done.map(r => (
                  <div key={r.id} style={{ borderRadius:'12px', border:'1px solid #e5e7eb', background:'#fff', padding:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
                      <CheckCircle2 size={15} color="#16a34a" />
                      <span style={{ fontSize:'12px', fontWeight:600, color:'#16a34a' }}>Completed</span>
                    </div>
                    <p style={{ fontSize:'13px', color:'#111', lineHeight:1.5 }}>{r.aiMessage}</p>
                    <p style={{ fontSize:'12px', color:'#6b7280', marginTop:'6px' }}>{r.datetime}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {active.length === 0 && done.length === 0 && (
            <div style={{ textAlign:'center', padding:'40px 0', color:'#6b7280' }}>
              <Bell size={28} strokeWidth={1.5} style={{ marginBottom:'12px', opacity:0.4 }} />
              <p style={{ fontSize:'14px' }}>No reminders yet. Add your first one.</p>
            </div>
          )}

        </div>
      </div>

      {showModal && <AddReminderModal onClose={() => setShowModal(false)} onAdd={handleAddReminder} />}
      {toast.visible && <Toast message={toast.message} />}
    </>
  );
}