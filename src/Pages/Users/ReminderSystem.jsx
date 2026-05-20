import { useState, useEffect } from "react";
import {
  Plus, CheckCircle2, Bell, AlertTriangle, ChevronRight,
} from "lucide-react";
import ReminderCard from "../../Components/Reminder/Remindercard";
import AIReminderSuggestion from "../../Components/Reminder/Airemindersuggestion";
import AddReminderModal from "../../Components/Reminder/Addremindermodal";

/* ─── Dummy data ─── */
const dummyReminders = [
  {
    id: 1,
    type: 'Follow-up Appointment',
    datetime: 'May 22, 2026 at 10:00 AM',
    note: 'Post-loss follow-up at Kenyatta National Hospital',
    aiMessage: 'Sarah, your follow-up appointment at Kenyatta National Hospital is tomorrow at 10am. This visit helps confirm your body has fully recovered from your loss in February. Please do not skip it.',
    missedCount: 0,
    completed: false,
    overdue: false,
  },
  {
    id: 2,
    type: 'Medication',
    datetime: 'May 21, 2026 at 8:00 AM',
    note: 'Iron supplement',
    aiMessage: 'Taking your iron supplement today helps your body rebuild after your loss. It is a small thing that makes a real difference.',
    missedCount: 0,
    completed: false,
    overdue: true,
  },
  {
    id: 3,
    type: 'Emotional Check-in',
    datetime: 'May 23, 2026 at 6:00 PM',
    note: null,
    aiMessage: 'You set this check-in for yourself. A few minutes to sit with how you are feeling is always worth it.',
    missedCount: 0,
    completed: false,
    overdue: false,
  },
  {
    id: 4,
    type: 'Follow-up Appointment',
    datetime: 'May 18, 2026 at 9:00 AM',
    note: 'Missed twice now',
    aiMessage: 'This appointment has been missed. Your recovery matters — please try to reschedule as soon as possible.',
    missedCount: 2,
    completed: false,
    overdue: true,
  },
  {
    id: 5,
    type: 'Danger Signs Education',
    datetime: 'May 25, 2026 at 7:00 PM',
    note: null,
    aiMessage: 'Knowing the warning signs of incomplete recovery could be life-saving. This reminder is set to keep you informed.',
    missedCount: 0,
    completed: false,
    overdue: false,
  },
];

const dummySuggestion = {
  message: "It has been 3 weeks since your loss. Most doctors recommend a follow-up check at this point. Would you like me to add a reminder for that?",
  reminderData: {
    type: 'Follow-up Appointment',
    datetime: 'May 28, 2026 at 10:00 AM',
    note: 'AI suggested follow-up — 3 weeks post-loss',
    aiMessage: 'This follow-up was suggested based on your recovery timeline. Three weeks post-loss is an important checkpoint. Please do not miss it.',
    missedCount: 0,
    completed: false,
    overdue: false,
  },
};

const SNOOZE_OPTIONS = [
  { label: 'In 1 hour',        value: '1h'  },
  { label: 'Tomorrow morning', value: 'tmr' },
  { label: 'In 3 days',        value: '3d'  },
];

/* ─── Toast ─── */
function Toast({ message }) {
  return (
    <div style={{
      position:       'fixed',
      bottom:         '90px',
      left:           '50%',
      transform:      'translateX(-50%)',
      background:     '#111111',
      color:          '#fff',
      borderRadius:   '20px',
      padding:        '10px 20px',
      fontSize:       '13px',
      fontWeight:     500,
      fontFamily:     "'Manrope', sans-serif",
      zIndex:         9999,
      whiteSpace:     'nowrap',
      pointerEvents:  'none',
    }}>
      {message}
    </div>
  );
}

/* ─── Helpers ─── */
function snoozeDatetime(option) {
  const now = new Date();
  if (option === '1h')  now.setHours(now.getHours() + 1);
  if (option === 'tmr') { now.setDate(now.getDate() + 1); now.setHours(8, 0, 0, 0); }
  if (option === '3d')  now.setDate(now.getDate() + 3);
  return now.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const GROUP_LABELS = {
  overdue:    { label: 'Overdue',              color: '#dc2626' },
  followup:   { label: 'Follow-up Appointments', color: '#6b7280' },
  medication: { label: 'Medication',           color: '#6b7280' },
  other:      { label: 'Check-ins & Education', color: '#6b7280' },
};

export default function ReminderSystem({ compact = false }) {
  const [reminders,    setReminders]    = useState(dummyReminders);
  const [suggestion,   setSuggestion]   = useState(dummySuggestion);
  const [showModal,    setShowModal]    = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [snoozeOpenId, setSnoozeOpenId] = useState(null);
  const [toast,        setToast]        = useState({ visible: false, message: '' });

  function showToast(message) {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: '' }), 2000);
  }

  function handleComplete(id) {
    setReminders(rs => rs.map(r => r.id === id ? { ...r, completed: true } : r));
  }
  function handleDismiss(id) {
    setReminders(rs => rs.filter(r => r.id !== id));
    showToast('Reminder dismissed.');
  }
  function handleSnooze(id, option) {
    setReminders(rs => rs.map(r => r.id === id ? { ...r, datetime: snoozeDatetime(option), overdue: false } : r));
    setSnoozeOpenId(null);
    showToast('Reminder snoozed.');
  }
  function handleAcceptSuggestion(reminderData) {
    setReminders(rs => [...rs, { ...reminderData, id: Date.now() }]);
    setSuggestion(null);
    showToast('Reminder added.');
  }
  function handleAddReminder(reminder) {
    setReminders(rs => [...rs, reminder]);
    showToast('Reminder added.');
  }

  /* ─── Compact view (home page) ─── */
  if (compact) {
    const upcoming = reminders
      .filter(r => !r.completed)
      .slice(0, 3);

    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,400&family=Manrope:wght@300;400;500;600&display=swap');`}</style>
        <div style={{ fontFamily: "'Manrope', sans-serif" }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: '15px', color: '#111' }}>
              Upcoming reminders
            </p>
            <button style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'none', border: 'none', color: '#16a34a', fontWeight: 600, fontSize: '12px', cursor: 'pointer', fontFamily: "'Manrope', sans-serif" }}>
              See all <ChevronRight size={13} />
            </button>
          </div>

          {upcoming.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '13px' }}>No upcoming reminders. Tap + to add one.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
              {upcoming.map(r => (
                <ReminderCard key={r.id} reminder={r} compact onComplete={() => handleComplete(r.id)} />
              ))}
            </div>
          )}

          <button
            onClick={() => setShowModal(true)}
            style={{
              width: '100%', padding: '11px', borderRadius: '10px',
              border: '1px solid #e5e7eb', background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              fontSize: '13px', fontWeight: 600, color: '#111', cursor: 'pointer',
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            <Plus size={15} /> Add reminder
          </button>

          {showModal && <AddReminderModal onClose={() => setShowModal(false)} onAdd={handleAddReminder} />}
          {toast.visible && <Toast message={toast.message} />}
        </div>
      </>
    );
  }

  /* ─── Full view ─── */
  const active = reminders.filter(r => !r.completed);
  const done   = reminders.filter(r =>  r.completed);

  const filtered = activeFilter === 'completed' ? done
                 : activeFilter === 'upcoming'  ? active
                 : reminders;

  // Group active reminders
  const overdue    = active.filter(r => r.overdue);
  const followup   = active.filter(r => !r.overdue && r.type === 'Follow-up Appointment');
  const medication = active.filter(r => !r.overdue && r.type === 'Medication');
  const other      = active.filter(r => !r.overdue && r.type !== 'Follow-up Appointment' && r.type !== 'Medication');

  const groups = [
    { key: 'overdue',    items: overdue    },
    { key: 'followup',   items: followup   },
    { key: 'medication', items: medication },
    { key: 'other',      items: other      },
  ].filter(g => g.items.length > 0);

  const sectionLabelStyle = (color) => ({
    display:        'flex',
    alignItems:     'center',
    gap:            '6px',
    fontSize:       '10px',
    fontWeight:     700,
    letterSpacing:  '.14em',
    textTransform:  'uppercase',
    color,
    marginBottom:   '8px',
    marginTop:      '4px',
  });

  const filterPillStyle = (active) => ({
    padding:        '6px 14px',
    borderRadius:   '40px',
    border:         active ? 'none' : '1px solid #e5e7eb',
    background:     active ? '#111' : 'transparent',
    color:          active ? '#fff' : '#6b7280',
    fontSize:       '12px',
    fontWeight:     500,
    cursor:         'pointer',
    fontFamily:     "'Manrope', sans-serif",
    transition:     'all .15s',
  });

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,400&family=Manrope:wght@300;400;500;600&display=swap');`}</style>

      <div style={{
        background:   '#f4f3f0',
        minHeight:    '100vh',
        fontFamily:   "'Manrope', sans-serif",
        paddingBottom:'110px',
      }}>

        {/* ── Page title area (no nav header) ── */}
        <div style={{
          padding:      'clamp(36px,6vw,56px) clamp(20px,5vw,52px) clamp(20px,3vw,32px)',
          borderBottom: '1px solid #e5e3de',
          display:      'flex',
          alignItems:   'flex-end',
          justifyContent:'space-between',
          flexWrap:     'wrap',
          gap:          '12px',
        }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '.16em', textTransform: 'uppercase', color: '#aaa', marginBottom: '8px' }}>
              Your Schedule
            </p>
            <h1 style={{
              fontFamily:   "'Fraunces', serif",
              fontSize:     'clamp(26px, 4vw, 44px)',
              fontWeight:   600,
              color:        '#111',
              lineHeight:   1.1,
              letterSpacing:'-.02em',
              margin:       0,
            }}>
              Reminders
            </h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '7px',
              padding:      '9px 18px',
              borderRadius: '40px',
              border:       '1px solid #111',
              background:   'transparent',
              color:        '#111',
              fontSize:     '13px',
              fontWeight:   600,
              cursor:       'pointer',
              fontFamily:   "'Manrope', sans-serif",
            }}
          >
            <Plus size={15} /> Add reminder
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{
          maxWidth: '720px',
          margin:   '0 auto',
          padding:  'clamp(20px,4vw,40px) clamp(16px,4vw,32px) 0',
          display:  'flex',
          flexDirection:'column',
          gap:      '12px',
        }}>

          {/* AI Suggestion */}
          {suggestion && (
            <AIReminderSuggestion
              suggestion={suggestion}
              onAccept={handleAcceptSuggestion}
              onDismiss={() => setSuggestion(null)}
            />
          )}

          {/* Filter pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['all', 'upcoming', 'completed'].map(f => (
              <button key={f} style={filterPillStyle(activeFilter === f)} onClick={() => setActiveFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Groups — show when filter is all or upcoming */}
          {activeFilter !== 'completed' && groups.map(group => (
            <div key={group.key}>
              <div style={sectionLabelStyle(GROUP_LABELS[group.key].color)}>
                {group.key === 'overdue' && <AlertTriangle size={12} />}
                {GROUP_LABELS[group.key].label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {group.items.map(r => (
                  <div key={r.id} style={{ position: 'relative' }}>
                    <ReminderCard
                      reminder={r}
                      onComplete={() => handleComplete(r.id)}
                      onDismiss={()  => handleDismiss(r.id)}
                      onSnooze={()   => setSnoozeOpenId(snoozeOpenId === r.id ? null : r.id)}
                    />
                    {/* Snooze dropdown */}
                    {snoozeOpenId === r.id && (
                      <div style={{
                        position:     'absolute',
                        bottom:       '48px',
                        right:        '0',
                        background:   '#fff',
                        border:       '1px solid #e5e7eb',
                        borderRadius: '10px',
                        boxShadow:    '0 4px 16px rgba(0,0,0,0.1)',
                        overflow:     'hidden',
                        zIndex:       100,
                        minWidth:     '170px',
                      }}>
                        {SNOOZE_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => handleSnooze(r.id, opt.value)}
                            style={{
                              display:    'block',
                              width:      '100%',
                              padding:    '10px 14px',
                              border:     'none',
                              background: 'transparent',
                              textAlign:  'left',
                              fontSize:   '13px',
                              color:      '#111',
                              cursor:     'pointer',
                              fontFamily: "'Manrope', sans-serif",
                              borderBottom: '1px solid #f4f3f0',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8f7f4'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
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

          {/* Completed */}
          {(activeFilter === 'completed' || activeFilter === 'all') && done.length > 0 && (
            <div>
              <div style={sectionLabelStyle('#6b7280')}>
                <CheckCircle2 size={12} />
                Completed
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', opacity: 0.5 }}>
                {done.map(r => (
                  <div key={r.id} style={{ borderRadius: '12px', border: '1px solid #e5e7eb', background: '#fff', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <CheckCircle2 size={15} color="#16a34a" />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a' }}>Completed</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#111', lineHeight: 1.5 }}>{r.aiMessage}</p>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>{r.datetime}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {active.length === 0 && done.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
              <Bell size={28} strokeWidth={1.5} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <p style={{ fontSize: '14px' }}>No reminders yet. Add your first one.</p>
            </div>
          )}

        </div>
      </div>

      {showModal && <AddReminderModal onClose={() => setShowModal(false)} onAdd={handleAddReminder} />}
      {toast.visible && <Toast message={toast.message} />}
    </>
  );
}