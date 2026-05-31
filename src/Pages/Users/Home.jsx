import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot, AlertTriangle, Heart, MapPin,
  ChevronRight, ArrowUpRight, Send,
  Droplets, Moon, Leaf, Footprints,
  SmilePlus, Siren, Users, Activity,
  BookOpen, MessageCircle, Wind,
  Stethoscope, Bell, Plus, CheckCircle2, X, Clock,
  Activity as ActivityIcon, Eye, Shield, Stethoscope as StethoscopeIcon,
  Thermometer, Droplet, Frown, Meh, Smile
} from "lucide-react";
import Mascot from "../../Components/Mascot/Mascot";
import SymptomChecklist from "../../Components/SymptomChecklist";
import { UserAuthContext } from "../../Context/UserAuthContext";
import { getReminders, createReminder, completeReminder, deleteReminder, updateReminder } from "../../API/reminders";
import { getPregnancyTip, getProfile } from "../../API/patient";
import { getCheckinHistory, submitCheckin } from "../../API/recovery";
import { getNearbyFacilities, getFacility } from "../../API/facilities";

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
  { text: "How are you feeling right now?", type: "checkin" },
  { text: "Have you had enough water today?", type: "checkin" },
  { text: "Did you sleep well last night?", type: "checkin" },
  { text: "Any pain or discomfort since yesterday?", type: "checkin" },
  { text: "Remember: rest is part of healing.", type: "advice" },
  { text: "It's okay to take things one hour at a time.", type: "advice" },
  { text: "Ask me about your recovery timeline", type: "prompt" },
  { text: "What are the warning signs I should watch for?", type: "prompt" },
  { text: "Can you explain what's normal to feel right now?", type: "prompt" },
];

const RECOVERY_ITEMS = [
  { label: "Mental wellness",  Icon: Wind,         sub: "Breathing & grounding exercises" },
  { label: "Nutrition guide",  Icon: Leaf,          sub: "Foods that help you heal" },
  { label: "Peer stories",     Icon: MessageCircle, sub: "You are not alone" },
  { label: "Read & learn",     Icon: BookOpen,      sub: "Understanding your recovery" },
];

/* ─── Mascot sections ─── */
const IDLE_MESSAGES = [
  "Your follow-up appointment is tomorrow at 10am.",
  "It has been 3 days since your last check-in.",
  "You are doing better than you think.",
  "Tap the map to find a care centre near you.",
  "Remember to take your medication today.",
];

const TYPE_META = {
  'Follow-up Appointment':  { pillBg:'#E6F1FB', pillText:'#0C447C', pillBorder:'#85B7EB', dot:'#378ADD' },
  'Medication':             { pillBg:'#EAF3DE', pillText:'#27500A', pillBorder:'#97C459', dot:'#639922' },
  'Emotional Check-in':     { pillBg:'#EEEDFE', pillText:'#3C3489', pillBorder:'#AFA9EC', dot:'#7F77DD' },
  'Danger Signs Education': { pillBg:'#FAEEDA', pillText:'#633806', pillBorder:'#EF9F27', dot:'#BA7517' },
};

const TYPES = ['Follow-up Appointment','Medication','Emotional Check-in','Danger Signs Education'];

function generateAIMessage(type) {
  switch(type) {
    case 'Follow-up Appointment':  return "This follow-up visit is important for confirming your recovery. Please do not skip it.";
    case 'Medication':             return "Taking your medication consistently makes a real difference in your recovery.";
    case 'Emotional Check-in':     return "Checking in with yourself is just as important as physical recovery.";
    case 'Danger Signs Education': return "Understanding the warning signs helps you act fast if something changes.";
    default:                       return "This reminder is set to support your recovery.";
  }
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h >= 5  && h <= 11) return "Good morning";
  if (h >= 12 && h <= 16) return "Good afternoon";
  if (h >= 17 && h <= 20) return "Good evening";
  return "You are up late";
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
      position:'fixed', bottom:'90px', left:'50%', transform:'translateX(-50%)',
      background:'#111', color:'#fff', borderRadius:'20px', padding:'10px 20px',
      fontSize:'13px', fontWeight:500, fontFamily:"'Manrope', sans-serif",
      zIndex:9999, whiteSpace:'nowrap', pointerEvents:'none',
    }}>{message}</div>
  );
}

/* ─── Add Reminder Modal ─── */
function AddReminderModal({ onClose, onAdd }) {
  const [selectedType, setSelectedType] = useState(TYPES[0]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [noteText, setNoteText] = useState('');

  async function handleAdd() {
    if (!selectedDate || !selectedTime) return;
    try {
      const reminderData = {
        type: selectedType,
        datetime: selectedDate+' at '+selectedTime,
        note: noteText || null,
        aiMessage: generateAIMessage(selectedType),
      };
      const res = await createReminder(reminderData);
      onAdd(res.data.data);
    } catch (err) {
      console.error('Failed to create reminder:', err);
    }
    onClose();
  }
  const inp = { width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e5e7eb', background:'#f8f7f4', fontSize:'13px', color:'#111', fontFamily:"'Manrope', sans-serif", outline:'none', boxSizing:'border-box' };
  const lbl = { display:'block', fontSize:'11px', fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', color:'#6b7280', marginBottom:'6px' };
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'20px' }}>
      <div style={{ background:'#fff', borderRadius:'16px', padding:'24px', width:'100%', maxWidth:'420px', fontFamily:"'Manrope', sans-serif", position:'relative' }}>
        <button onClick={onClose} style={{ position:'absolute', top:'16px', right:'16px', border:'none', background:'#f8f7f4', borderRadius:'8px', width:'30px', height:'30px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}><X size={15} color="#6b7280" /></button>
        <h2 style={{ fontFamily:"'Fraunces', serif", fontSize:'20px', fontWeight:600, color:'#111', marginBottom:'20px' }}>New reminder</h2>
        <div style={{ marginBottom:'14px' }}><label style={lbl}>Type</label><select value={selectedType} onChange={e=>setSelectedType(e.target.value)} style={{...inp, appearance:'none'}}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
        <div style={{ marginBottom:'14px' }}><label style={lbl}>Date</label><input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} style={inp} /></div>
        <div style={{ marginBottom:'14px' }}><label style={lbl}>Time</label><input type="time" value={selectedTime} onChange={e=>setSelectedTime(e.target.value)} style={inp} /></div>
        <div style={{ marginBottom:'20px' }}><label style={lbl}>Note</label><textarea value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Add a note (optional)" rows={3} style={{...inp, resize:'vertical', lineHeight:1.5}} /></div>
        <button onClick={handleAdd} style={{ width:'100%', padding:'12px', borderRadius:'10px', border:'none', background:'#111', color:'#fff', fontSize:'14px', fontWeight:600, cursor:'pointer', fontFamily:'Manrope' }}> Add reminder </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────
   INLINE MASCOT STRIP
───────────────────────────────── */
function MascotStrip({ mood, message, size = 80, visible, dark = false, bubbleOpacity = 1 }) {
  if (!visible) return null;
  return (
    <div style={{
      display:'flex', alignItems:'flex-end', gap:'10px',
      padding: dark ? '0 0 4px 0' : '8px 0 0 0',
      opacity: visible ? 1 : 0,
      transition:'opacity 0.5s ease',
    }}>
      <div style={{ flexShrink:0, transition:'all 0.4s ease' }}>
        <Mascot
          mood={mood}
          message=""
          position="left"
          size={size}
        />
      </div>
      {message && (
        <div
          style={{
            flex:1,
            background: dark ? 'rgba(255,255,255,0.07)' : '#fff',
            border: dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e8e6e1',
            borderRadius:'14px 14px 14px 4px',
            padding:'10px 14px',
            fontSize:'13px',
            lineHeight:1.55,
            color: dark ? 'rgba(255,255,255,0.85)' : '#222',
            fontFamily:"'Manrope', sans-serif",
            fontWeight:400,
            opacity: bubbleOpacity,
            transition:'opacity 0.4s ease',
            maxWidth:'260px',
            boxShadow: dark ? 'none' : '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          <TypedText text={message} key={message} dark={dark} />
        </div>
      )}
    </div>
  );
}

/* Typed text effect */
function TypedText({ text, dark }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const t = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(t);
    }, 22);
    return () => clearInterval(t);
  }, [text]);
  return <span>{displayed}<span style={{ opacity:0.35, color: dark ? '#fff' : '#111' }}>{displayed.length < text.length ? '|' : ''}</span></span>;
}

/* ─────────────────────────────────
   AI TICKER
───────────────────────────────── */
function AiTicker({ onSelect }) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % AI_MESSAGES.length); setVisible(true); }, 400);
    }, 3800);
    return () => clearInterval(interval);
  }, []);
  const msg = AI_MESSAGES[idx];
  const typeColor = msg.type==="checkin"?"#6366f1":msg.type==="advice"?"#0369a1":"#15803d";
  const typeLabel = msg.type==="checkin"?"Check-in":msg.type==="advice"?"Tip":"Ask me";
  return (
    <button className="ai-ticker" onClick={() => onSelect(msg.text)} style={{ "--tc": typeColor }}>
      <div className="ai-ticker-dot" />
      <div className="ai-ticker-content" style={{ opacity: visible ? 1 : 0 }}>
        <span className="ai-ticker-tag" style={{ color:typeColor, background:typeColor+"18" }}>{typeLabel}</span>
        <span className="ai-ticker-text">"{msg.text}"</span>
      </div>
      <ChevronRight size={14} className="ai-ticker-arr" />
    </button>
  );
}

/* ─────────────────────────────────
   COMPACT REMINDERS
───────────────────────────────── */
function CompactReminders({ navigate, onReminderHover, onReminderComplete }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ visible:false, message:'' });

  useEffect(() => {
    async function fetchReminders() {
      try {
        const res = await getReminders();
        setReminders(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch reminders:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReminders();
  }, []);

  function showToast(msg) { setToast({ visible:true, message:msg }); setTimeout(()=>setToast({ visible:false, message:'' }), 2000); }
  
  async function handleComplete(id) {
    try {
      await completeReminder(id);
      setReminders(rs=>rs.map(r=>r.id===id?{...r, completed:true}:r)); 
      showToast('Marked as done.'); 
      if(onReminderComplete) onReminderComplete();
    } catch (err) {
      console.error('Failed to complete reminder:', err);
      showToast('Failed to mark as done.');
    }
  }
  
  function handleAdd(reminder) { 
    setReminders(rs=>[...rs, reminder]); 
    showToast('Reminder added.'); 
  }

  const upcoming     = reminders.filter(r=>!r.completed).slice(0,4);
  const overdueCount = reminders.filter(r=>!r.completed && r.overdue).length;

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
        <p style={{ fontSize:'13px', color:'#aaa', fontFamily:"'Manrope', sans-serif" }}>Loading reminders...</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <Bell size={15} color="#111" strokeWidth={1.8} />
          <span style={{ fontSize:'14px', fontWeight:600, color:'#111', fontFamily:"'Manrope', sans-serif" }}>Upcoming reminders</span>
          {overdueCount > 0 && <span style={{ fontSize:'10px', fontWeight:600, padding:'2px 8px', borderRadius:'20px', background:'#FCEBEB', color:'#A32D2D', border:'0.5px solid #F09595' }}>{overdueCount} overdue</span>}
        </div>
        <button onClick={() => navigate('/reminders')} style={{ display:'flex', alignItems:'center', gap:'3px', background:'none', border:'none', color:'#6b7280', fontWeight:500, fontSize:'12px', cursor:'pointer', fontFamily:"'Manrope', sans-serif" }}>See all <ChevronRight size={13} /></button>
      </div>

      {upcoming.length === 0 ? (
        <div style={{ padding:'28px', textAlign:'center', border:'0.5px dashed #d1d5db', borderRadius:'12px', marginBottom:'12px' }}>
          <Bell size={20} color="#d1d5db" strokeWidth={1.5} style={{ display:'block', margin:'0 auto 8px' }} />
          <p style={{ fontSize:'13px', color:'#9ca3af', fontFamily:"'Manrope', sans-serif" }}>No upcoming reminders. Tap + to add one.</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'12px' }}>
          {upcoming.map(r => {
            const m = TYPE_META[r.type] || TYPE_META['Medication'];
            return (
              <div key={r.id}
                style={{ background:'#fff', border:'0.5px solid #e8e6e1', borderRadius:'14px', overflow:'hidden', fontFamily:"'Manrope', sans-serif", display:'flex', flexDirection:'column', cursor:'default', transition:'border-color .2s' }}
                onMouseEnter={() => onReminderHover && onReminderHover(r.overdue)}
                onMouseLeave={() => onReminderHover && onReminderHover(false)}
              >
                <div style={{ height:'3px', background: r.overdue ? '#dc2626' : '#e5e7eb', flexShrink:0 }} />
                <div style={{ padding:'12px', flex:1, display:'flex', flexDirection:'column' }}>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', fontSize:'10px', fontWeight:500, padding:'3px 8px', borderRadius:'20px', alignSelf:'flex-start', background:m.pillBg, color:m.pillText, border:`0.5px solid ${m.pillBorder}`, marginBottom:'9px' }}>
                    <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:m.dot, flexShrink:0 }} />{r.type}
                  </span>
                  {r.missedCount >= 2 && (
                    <div style={{ fontSize:'11px', color:'#A32D2D', background:'#FCEBEB', borderRadius:'6px', padding:'5px 8px', marginBottom:'8px', display:'flex', alignItems:'center', gap:'5px' }}>
                      <AlertTriangle size={11} strokeWidth={2} />Missed — CHW notified
                    </div>
                  )}
                  <p style={{ fontSize:'12px', color:'#111', lineHeight:1.55, marginBottom:'10px', flex:1 }}>{r.aiMessage}</p>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'6px', flexWrap:'wrap' }}>
                    <div style={{ display:'flex', flexDirection:'column', gap:'3px' }}>
                      <span style={{ fontSize:'11px', color:'#9ca3af', display:'flex', alignItems:'center', gap:'4px' }}><Clock size={11} strokeWidth={1.8} />{r.datetime}</span>
                      {r.overdue && <span style={{ fontSize:'10px', fontWeight:600, color:'#A32D2D', background:'#FCEBEB', border:'0.5px solid #F09595', borderRadius:'20px', padding:'1px 7px', alignSelf:'flex-start' }}>Overdue</span>}
                    </div>
                    <button onClick={() => handleComplete(r.id)} title="Mark done"
                      style={{ width:'28px', height:'28px', borderRadius:'50%', border:'0.5px solid #e8e6e1', background:'#f8f7f4', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, transition:'background .15s' }}
                      onMouseEnter={e=>{ e.currentTarget.style.background='#EAF3DE'; e.currentTarget.style.borderColor='#97C459'; }}
                      onMouseLeave={e=>{ e.currentTarget.style.background='#f8f7f4'; e.currentTarget.style.borderColor='#e8e6e1'; }}>
                      <CheckCircle2 size={13} color="#6b7280" strokeWidth={1.8} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button onClick={() => setShowModal(true)}
        style={{ width:'100%', padding:'10px', borderRadius:'10px', border:'0.5px dashed #d1d5db', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', gap:'7px', fontSize:'13px', fontWeight:500, color:'#6b7280', cursor:'pointer', fontFamily:"'Manrope', sans-serif", transition:'background .15s, border-color .15s' }}
        onMouseEnter={e=>{ e.currentTarget.style.background='#f8f7f4'; e.currentTarget.style.borderColor='#9ca3af'; e.currentTarget.style.color='#111'; }}
        onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='#d1d5db'; e.currentTarget.style.color='#6b7280'; }}>
        <Plus size={15} /> Add reminder
      </button>
      {showModal && <AddReminderModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}
      {toast.visible && <Toast message={toast.message} />}
    </>
  );
}

/* ─────────────────────────────────
   SYMPTOM CHECKLIST CARD (Compact)
───────────────────────────────── */
function SymptomChecklistCard({ onOpen }) {
  const MOOD_OPTIONS = [
    { Icon: Frown,  label: "Not great",  color: "#dc2626", bg: "#fff5f5", border: "#fecaca" },
    { Icon: Meh,   label: "So-so",      color: "#d97706", bg: "#fef3c7", border: "#fde68a" },
    { Icon: Smile, label: "Pretty okay", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  ];

  return (
    <div
      onClick={onOpen}
      style={{
        background: "#fff",
        border: "1px solid #e8e6e1",
        borderRadius: "18px",
        padding: "18px",
        cursor: "pointer",
        fontFamily: "'Manrope', sans-serif",
        transition: "border-color .2s, box-shadow .2s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "#c4b5fd";
        e.currentTarget.style.boxShadow = "0 6px 22px rgba(0,0,0,.06)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "#e8e6e1";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "9px",
            background: "#faf5ff", border: "1px solid #e9d5ff",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Activity size={16} color="#9333ea" strokeWidth={1.8} />
          </div>
          <div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#111", marginBottom: "1px" }}>Check my symptoms</p>
            <p style={{ fontSize: "11px", color: "#aaa", fontWeight: 300 }}>Physical, emotional, or both</p>
          </div>
        </div>
        <ChevronRight size={16} color="#ccc" />
      </div>

      {/* Mood row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
        {MOOD_OPTIONS.map(({ Icon, label, color, bg, border }) => (
          <div key={label} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: "5px",
            padding: "10px 6px", borderRadius: "12px",
            background: bg, border: `1px solid ${border}`,
          }}>
            <Icon size={20} color={color} strokeWidth={1.6} />
            <span style={{ fontSize: "11px", fontWeight: 500, color, textAlign: "center", lineHeight: 1.2 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
/* ─────────────────────────────────
   HOME
───────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const { user } = useContext(UserAuthContext);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const now      = new Date();
  
  // Real data states
  const [tip, setTip] = useState(null);
  const [stats, setStats] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [loadingTip, setLoadingTip] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingFacilities, setLoadingFacilities] = useState(true);
  
  const dateStr  = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;
  const hour     = now.getHours();
  const nameColor = hour < 12 ? "#d97706" : hour < 17 ? "#ea580c" : "#7c3aed";
  
  // Symptom checklist state
  const [showSymptomChecklist, setShowSymptomChecklist] = useState(false);

  /* ── Mascot state ── */
  const [mascotMood,    setMascotMood]    = useState("idle");
  const [mascotMessage, setMascotMessage] = useState("");
  const [mascotZone,    setMascotZone]    = useState("hero");
  const [mascotVisible, setMascotVisible] = useState(false);
  const [bubbleOpacity, setBubbleOpacity] = useState(1);
  const [lastInteraction, setLastInteraction] = useState(new Date());

  /* ── Refs ── */
  const idleTimerRef      = useRef(null);
  const idleRotationRef   = useRef(null);
  const idleIndexRef      = useRef(0);
  const returnTimerRef    = useRef(null);
  const celebrateTimerRef = useRef(null);
  const entranceDoneRef   = useRef(false);
  const pageStartRef      = useRef(Date.now());
  const savedMsgRef       = useRef("");
  const savedMoodRef      = useRef("idle");
  const savedZoneRef      = useRef("hero");

  /* ── Fetch real data on mount ── */
  useEffect(() => {
    async function fetchHomeData() {
      try {
        // Fetch pregnancy tip
        const tipRes = await getPregnancyTip();
        setTip(tipRes.data.data);
        setLoadingTip(false);

        // Fetch check-in history for stats
        const statsRes = await getCheckinHistory();
        const historyData = statsRes.data.data;
        if (historyData && historyData.stats) {
          setStats([
            { label: "Physical",   value: historyData.stats.physical || "Stable",    color: "#22c55e" },
            { label: "Emotional",  value: historyData.stats.emotional || "Monitored", color: "#a78bfa" },
            { label: "Follow-up",  value: historyData.stats.followUp || "Tomorrow",  color: "#94a3b8" },
            { label: "Risk Level", value: historyData.stats.riskLevel || "Low",       color: "#22c55e" },
          ]);
        }
        setLoadingStats(false);

        // Fetch nearby facilities
        const facilitiesRes = await getNearbyFacilities();
        setFacilities(facilitiesRes.data.data || []);
        setLoadingFacilities(false);

        // Set next appointment from reminders if available
        const remindersRes = await getReminders();
        const appointments = remindersRes.data.data?.filter(r => r.type === 'Follow-up Appointment' && !r.completed) || [];
        if (appointments.length > 0) {
          setNextAppointment(appointments[0]);
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
        setLoadingTip(false);
        setLoadingStats(false);
        setLoadingFacilities(false);
      }
    }
    fetchHomeData();
  }, []);

  /* ── Show mascot in a zone ── */
  const show = useCallback((zone, mood, message) => {
    setMascotZone(zone);
    setMascotMood(mood);
    setMascotMessage(message);
    setMascotVisible(true);
    setBubbleOpacity(1);
  }, []);

  /* ── Idle rotation ── */
  const startIdleRotation = useCallback(() => {
    if (idleRotationRef.current) clearInterval(idleRotationRef.current);
    const zones = ["hero", "status", "reminders"];
    idleRotationRef.current = setInterval(() => {
      const msg = IDLE_MESSAGES[idleIndexRef.current % IDLE_MESSAGES.length];
      const zone = zones[idleIndexRef.current % zones.length];
      idleIndexRef.current++;
      show(zone, "idle", msg);
    }, 6000);
  }, [show]);

  /* ── Reset idle timer ── */
  const resetIdleTimer = useCallback(() => {
    setLastInteraction(new Date());
    if (idleTimerRef.current)    clearTimeout(idleTimerRef.current);
    if (idleRotationRef.current) clearInterval(idleRotationRef.current);
    if (!entranceDoneRef.current) return;
    idleTimerRef.current = setTimeout(startIdleRotation, 8000);
  }, [startIdleRotation]);

  /* ── Entrance sequence ── */
  useEffect(() => {
    const greeting = getTimeGreeting();
    const userName = user?.name || "Sarah";
    const msg1 = `${greeting}, ${userName}. I have been thinking about you.`;
    const msg2 = "How are you feeling today?";
    const delay1 = msg1.length * 28 + 1000;

    const t1 = setTimeout(() => {
      show("hero", "idle", msg1);
    }, 800);
    const t2 = setTimeout(() => {
      show("hero", "idle", msg2);
      entranceDoneRef.current = true;
      idleTimerRef.current = setTimeout(startIdleRotation, 8000);
    }, 800 + delay1);

    return () => {
      clearTimeout(t1); clearTimeout(t2);
      if (idleTimerRef.current)    clearTimeout(idleTimerRef.current);
      if (idleRotationRef.current) clearInterval(idleRotationRef.current);
    };
  }, [user]);

  /* ── Attention pulse every 30s ── */
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed   = Date.now() - pageStartRef.current;
      const idleSince = Date.now() - lastInteraction.getTime();
      if (elapsed > 30000 && idleSince > 30000 && mascotVisible) {
        setBubbleOpacity(0.3);
        setTimeout(() => setBubbleOpacity(1), 600);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [lastInteraction, mascotVisible]);

  /* ── Handler: SOS ── */
  const handleSOSHover = useCallback(() => {
    if (returnTimerRef.current) clearTimeout(returnTimerRef.current);
    savedMsgRef.current  = mascotMessage;
    savedMoodRef.current = mascotMood;
    savedZoneRef.current = mascotZone;
    resetIdleTimer();
    show("emergency", "concerned", "If you are in crisis, tap the button. I will help you right away.");
  }, [show, resetIdleTimer, mascotMessage, mascotMood, mascotZone]);

  const handleSOSLeave = useCallback(() => {
    resetIdleTimer();
    returnTimerRef.current = setTimeout(() => {
      show(savedZoneRef.current || "hero", savedMoodRef.current || "idle", savedMsgRef.current || IDLE_MESSAGES[0]);
    }, 3000);
  }, [show, resetIdleTimer]);

  /* ── Handler: Reminders ── */
  const handleReminderHover = useCallback((isOverdue) => {
    resetIdleTimer();
    if (isOverdue) {
      savedMsgRef.current  = mascotMessage;
      savedMoodRef.current = mascotMood;
      savedZoneRef.current = mascotZone;
      show("reminders", "concerned", "This one is overdue. Let us take care of it.");
    }
  }, [show, resetIdleTimer, mascotMessage, mascotMood, mascotZone]);

  const handleReminderComplete = useCallback(() => {
    resetIdleTimer();
    if (celebrateTimerRef.current) clearTimeout(celebrateTimerRef.current);
    show("reminders", "celebrating", "You did it. One step at a time.");
    celebrateTimerRef.current = setTimeout(() => {
      show("hero", "idle", "How are you feeling today?");
    }, 3000);
  }, [show, resetIdleTimer]);

  /* ── Handler: Nav cards ── */
  const handleNavHover = useCallback((tab) => {
    if (returnTimerRef.current) clearTimeout(returnTimerRef.current);
    resetIdleTimer();
    savedMsgRef.current  = mascotMessage;
    savedMoodRef.current = mascotMood;
    savedZoneRef.current = mascotZone;
    const config = {
      recovery: { zone:"hub",       msg:"The recovery space is there whenever you need it." },
      map:      { zone:"emergency", msg:"I can help you find the nearest care centre." },
      ai:       { zone:"status",    msg:"Want to talk? I am always here." },
    };
    const c = config[tab];
    if (c) show(c.zone, "idle", c.msg);
  }, [show, resetIdleTimer, mascotMessage, mascotMood, mascotZone]);

  const handleNavLeave = useCallback(() => {
    resetIdleTimer();
    returnTimerRef.current = setTimeout(() => {
      if (savedMsgRef.current) show(savedZoneRef.current || "hero", savedMoodRef.current || "idle", savedMsgRef.current);
    }, 2000);
  }, [show, resetIdleTimer]);

  function sendToAI(text) {
    navigate("/ai-assistant", { state: { prefill: text || query } });
  }

  function handleSymptomChecklistStart(contextMessage, symptoms) {
    navigate("/ai-assistant", { state: { prefill: contextMessage, symptoms: symptoms } });
  }

  /* ── Mascot size per zone ── */
  const sizeForZone = { hero:90, status:80, reminders:80, emergency:76, hub:76 };

  // Fallback tip if API hasn't loaded yet
  const fallbackTip = TIPS[now.getDay()];
  const displayTip = tip || fallbackTip;
  const TipIcon = displayTip.Icon;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;1,9..144,400&family=Manrope:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .hm { font-family:'Manrope', sans-serif; background:#f4f3f0; min-height:100vh; color:#111; padding-bottom:110px; }

        /* HERO */
        .hm-hero { padding: clamp(36px,6vw,56px) clamp(20px,5vw,52px) clamp(20px,3vw,32px); border-bottom:1px solid #e5e3de; }
        .hm-hero-top { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:0; }
        .hm-date { font-size:11px; font-weight:500; letter-spacing:.16em; text-transform:uppercase; color:#aaa; margin-bottom:8px; }
        .hm-greeting { font-family:'Fraunces', serif; font-size:clamp(26px,4vw,44px); font-weight:600; color:#111; line-height:1.1; letter-spacing:-.02em; }
        .hm-name { font-style:italic; font-weight:400; }
        .hm-hero-right { display:flex; flex-direction:column; align-items:flex-end; gap:8px; }
        .hm-week-pill { display:inline-flex; align-items:center; gap:7px; background:#111; color:#fff; font-size:11px; font-weight:500; letter-spacing:.06em; padding:7px 14px; border-radius:40px; white-space:nowrap; }
        .hm-live { width:6px; height:6px; border-radius:50%; background:#4ade80; box-shadow:0 0 0 3px rgba(74,222,128,.25); animation:pulse 2s infinite; }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 3px rgba(74,222,128,.25);}50%{box-shadow:0 0 0 5px rgba(74,222,128,.1);} }
        .hm-sub { font-size:13px; color:#999; font-weight:300; }

        /* MASCOT HERO AREA */
        .hm-hero-mascot { margin-top:16px; }

        /* BODY GRID */
        .hm-body { max-width:1200px; margin:0 auto; padding:clamp(20px,4vw,40px) clamp(16px,4vw,52px) 0; display:grid; gap:20px; grid-template-columns:1fr; }
        @media (min-width:768px) { .hm-body{grid-template-columns:1fr 1fr;} .hm-full{grid-column:1/-1;} }
        @media (min-width:1100px) { .hm-body{grid-template-columns:1.4fr 1fr 1fr;} .hm-left{grid-row:1/3;} }
        .hm-lbl { font-size:10px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; color:#bbb; margin-bottom:10px; }

        /* STATUS */
        .hm-status { background:#111; border-radius:22px; padding:clamp(20px,4vw,28px); position:relative; overflow:hidden; height:100%; }
        .hm-status::before { content:''; position:absolute; inset:0; pointer-events:none; background: radial-gradient(ellipse 160px 120px at 95% 5%, rgba(34,197,94,.15) 0%, transparent 55%), radial-gradient(ellipse 100px 100px at 5% 95%, rgba(167,139,250,.1) 0%, transparent 55%); }
        .hm-status-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; }
        .hm-chip { display:inline-flex; align-items:center; gap:7px; background:rgba(34,197,94,.1); color:#4ade80; border:1px solid rgba(34,197,94,.2); font-size:11px; font-weight:500; letter-spacing:.06em; padding:5px 12px; border-radius:40px; }
        .hm-chip-dot { width:6px; height:6px; border-radius:50%; background:currentColor; box-shadow:0 0 0 3px rgba(74,222,128,.25); }
        .hm-wk { font-size:11px; color:#333; }
        .hm-status-title { font-family:'Fraunces', serif; font-size:clamp(22px,3vw,30px); font-weight:600; color:#fff; line-height:1.1; margin-bottom:6px; }
        .hm-status-sub { font-size:13px; color:#444; font-weight:300; margin-bottom:20px; }
        .hm-stats { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        .hm-stat { background:#1a1a19; border:1px solid #252320; border-radius:12px; padding:11px 13px; }
        .hm-stat-l { font-size:9px; letter-spacing:.1em; text-transform:uppercase; color:#444; margin-bottom:4px; }
        .hm-stat-v { font-size:14px; font-weight:600; }

        /* MASCOT IN STATUS */
        .hm-status-mascot { margin-top:20px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.06); }

        /* TIP */
        .hm-tip { border-radius:22px; padding:clamp(18px,3vw,24px); position:relative; overflow:hidden; }
        .hm-tip-wm { position:absolute; top:0; right:10px; font-family:'Fraunces', serif; font-size:100px; font-style:italic; line-height:1; opacity:.09; pointer-events:none; user-select:none; }
        .hm-tip-head { display:flex; align-items:center; gap:9px; margin-bottom:13px; }
        .hm-tip-ico { width:32px; height:32px; border-radius:9px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .hm-tip-badge { font-size:11px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; }
        .hm-tip-day { font-size:11px; font-weight:300; margin-left:auto; opacity:.4; }
        .hm-tip-text { font-family:'Fraunces', serif; font-size:clamp(14px,2vw,16px); font-weight:300; font-style:italic; line-height:1.65; position:relative; z-index:1; }

        /* APPT */
        .hm-appt { background:#fff; border:1px solid #e8e6e1; border-radius:18px; padding:15px 18px; display:flex; align-items:center; gap:14px; cursor:pointer; transition:border-color .2s, box-shadow .2s; }
        .hm-appt:hover { border-color:#ccc; box-shadow:0 6px 22px rgba(0,0,0,.06); }
        .hm-appt-cal { width:50px; height:50px; flex-shrink:0; background:#111; border-radius:13px; display:flex; flex-direction:column; align-items:center; justify-content:center; }
        .hm-appt-n { font-family:'Fraunces', serif; font-size:22px; color:#fff; line-height:1; }
        .hm-appt-m { font-size:9px; color:#555; text-transform:uppercase; letter-spacing:.1em; }
        .hm-appt-t { font-size:14px; font-weight:600; margin-bottom:3px; }
        .hm-appt-d { font-size:12px; color:#aaa; font-weight:300; }

        /* REMINDERS */
        .hm-reminders-card { background:#fff; border:1px solid #e8e6e1; border-radius:22px; padding:clamp(18px,3vw,24px); }
        .hm-reminders-mascot { margin-top:16px; padding-top:14px; border-top:1px solid #f0eeea; }

        /* BENTO */
        .hm-bento { display:grid; gap:12px; grid-template-columns:1fr 1fr; grid-template-areas:"ai ai" "emer fac" "hub hub"; }
        @media (min-width:600px) { .hm-bento{grid-template-columns:1.3fr 1fr 1fr; grid-template-rows:auto auto; grid-template-areas:"ai emer fac" "ai hub hub";} }
        .hm-card { border-radius:20px; border:1px solid #e0ddd7; background:#fff; overflow:hidden; position:relative; }
        .hm-card-ai { grid-area:ai; display:flex; flex-direction:column; }
        .hm-card-ai-header { display:flex; align-items:center; gap:10px; padding:16px 16px 12px; border-bottom:1px solid #f0eeea; }
        .hm-card-ai-icon { width:34px; height:34px; border-radius:10px; background:#111; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .hm-card-ai-title { font-size:14px; font-weight:600; color:#111; }
        .hm-card-ai-sub { font-size:11px; color:#aaa; font-weight:300; }
        .hm-card-ai-badge { margin-left:auto; font-size:10px; font-weight:600; letter-spacing:.06em; background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0; padding:3px 9px; border-radius:40px; white-space:nowrap; }
        .hm-ai-input-row { display:flex; align-items:center; gap:0; margin:12px 12px 0; background:#f8f7f4; border:1px solid #e8e6e1; border-radius:12px; overflow:hidden; }
        .hm-ai-input { flex:1; border:none; background:transparent; padding:12px 14px; font-family:'Manrope', sans-serif; font-size:13px; color:#111; outline:none; }
        .hm-ai-input::placeholder { color:#bbb; }
        .hm-ai-send { width:40px; height:40px; flex-shrink:0; border:none; background:#111; display:flex; align-items:center; justify-content:center; cursor:pointer; margin:4px; border-radius:9px; transition:background .15s; }
        .hm-ai-send:hover { background:#333; }
        .ai-ticker { display:flex; align-items:center; gap:10px; margin:8px 12px 12px; padding:9px 12px; border-radius:10px; background:#f8f7f4; border:1px solid #eeecea; cursor:pointer; text-align:left; width:calc(100% - 24px); transition:background .15s; position:relative; }
        .ai-ticker:hover { background:#f0eeea; }
        .ai-ticker-dot { width:7px; height:7px; flex-shrink:0; border-radius:50%; background:var(--tc, #6366f1); box-shadow:0 0 0 3px color-mix(in srgb, var(--tc, #6366f1) 20%, transparent); }
        .ai-ticker-content { flex:1; display:flex; flex-direction:column; gap:2px; transition:opacity .4s ease; }
        .ai-ticker-tag { font-size:9px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; padding:1px 6px; border-radius:4px; align-self:flex-start; }
        .ai-ticker-text { font-size:12px; color:#555; font-weight:400; line-height:1.4; }
        .ai-ticker-arr { color:#ccc; flex-shrink:0; }
        .hm-card-emer { grid-area:emer; cursor:pointer; transition:border-color .2s; }
        .hm-card-emer:hover { border-color:#fca5a5; }
        .hm-card-emer-inner { display:flex; flex-direction:column; justify-content:space-between; height:100%; padding:16px; }
        .hm-card-icon-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .hm-icon-box { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; }
        .hm-card-title { font-size:14px; font-weight:600; color:#111; margin-bottom:3px; }
        .hm-card-sub { font-size:12px; color:#aaa; font-weight:300; line-height:1.4; }
        .hm-arr-btn { width:26px; height:26px; border-radius:50%; border:1px solid #e8e6e1; display:flex; align-items:center; justify-content:center; background:transparent; cursor:pointer; }
        .hm-emer-ring { width:38px; height:38px; position:relative; flex-shrink:0; }
        .hm-emer-ring::before { content:''; position:absolute; inset:-4px; border-radius:50%; border:1.5px solid rgba(220,38,38,.3); animation:ring 2s infinite; }
        @keyframes ring { 0%{transform:scale(1);opacity:.8;}100%{transform:scale(1.4);opacity:0;} }

        /* MASCOT IN EMERGENCY CARD */
        .hm-emer-mascot { padding:12px 16px 16px; border-top:1px solid #fef2f2; }

        .hm-card-fac { grid-area:fac; cursor:pointer; transition:border-color .2s; }
        .hm-card-fac:hover { border-color:#bbf7d0; }
        .hm-card-fac-inner { display:flex; flex-direction:column; height:100%; padding:16px; }
        .hm-fac-list { display:flex; flex-direction:column; gap:7px; margin-top:8px; flex:1; }
        .hm-fac-item { display:flex; align-items:center; gap:8px; padding:7px 9px; border-radius:9px; background:#f8f7f4; cursor:pointer; transition:background .15s; }
        .hm-fac-item:hover { background:#f0eeea; }
        .hm-fac-name { font-size:11px; font-weight:600; color:#111; }
        .hm-fac-meta { font-size:10px; color:#aaa; font-weight:300; }
        .hm-fac-open { margin-left:auto; font-size:9px; font-weight:600; padding:2px 7px; border-radius:20px; white-space:nowrap; }
        .hm-open-yes { background:#f0fdf4; color:#15803d; }
        .hm-open-no  { background:#fef2f2; color:#b91c1c; }
        .hm-card-hub { grid-area:hub; cursor:pointer; transition:border-color .2s; }
        .hm-card-hub:hover { border-color:#ddd6fe; }
        .hm-hub-inner { padding:16px; }
        .hm-hub-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
        .hm-hub-title-row { display:flex; flex-direction:column; gap:2px; }
        .hm-hub-modules { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        @media (min-width:480px) { .hm-hub-modules{grid-template-columns:repeat(4,1fr);} }
        .hm-hub-mod { display:flex; flex-direction:column; align-items:center; gap:6px; padding:11px 8px; border-radius:12px; background:#f8f7f4; cursor:pointer; text-align:center; transition:background .15s; border:1px solid transparent; }
        .hm-hub-mod:hover { background:#f0eeea; border-color:#e8ddf5; }
        .hm-hub-mod-label { font-size:11px; font-weight:500; color:#111; line-height:1.3; }

        /* MASCOT IN RECOVERY HUB */
        .hm-hub-mascot { margin-top:14px; padding-top:14px; border-top:1px solid #f3f0fa; }
      `}</style>

      <div className="hm" onMouseMove={resetIdleTimer} onClick={resetIdleTimer}>

        {/* ═══ HERO ═══ */}
        <div className="hm-hero">
          <div className="hm-hero-top">
            <div>
              <p className="hm-date">{dateStr}</p>
              <h1 className="hm-greeting">
                {getGreeting()}, <span className="hm-name" style={{ color: nameColor }}>{user?.name || 'Amina'}.</span>
              </h1>
            </div>
            <div className="hm-hero-right">
              <span className="hm-week-pill"><span className="hm-live" /> Week 2 · Active Recovery</span>
              <p className="hm-sub">Here's how your recovery is going today.</p>
            </div>
          </div>

          {/* MASCOT ZONE: hero */}
          <div className="hm-hero-mascot">
            <MascotStrip
              mood={mascotMood}
              message={mascotMessage}
              size={sizeForZone.hero}
              visible={mascotVisible && mascotZone === "hero"}
              bubbleOpacity={bubbleOpacity}
            />
          </div>
        </div>

        <div className="hm-body">

          {/* ═══ STATUS ═══ */}
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
                {loadingStats ? (
                  <p style={{ color: '#666', fontSize: '13px', gridColumn: '1/-1' }}>Loading stats...</p>
                ) : (
                  stats.map(s => (
                    <div className="hm-stat" key={s.label}>
                      <p className="hm-stat-l">{s.label}</p>
                      <p className="hm-stat-v" style={{ color: s.color }}>{s.value}</p>
                    </div>
                  ))
                )}
              </div>

              {/* MASCOT ZONE: status */}
              <div className="hm-status-mascot">
                <MascotStrip
                  mood={mascotMood}
                  message={mascotMessage}
                  size={sizeForZone.status}
                  visible={mascotVisible && mascotZone === "status"}
                  dark={true}
                  bubbleOpacity={bubbleOpacity}
                />
              </div>
            </div>
          </div>

          {/* ═══ TIP & APPOINTMENT COLUMN ═══ */}
          <div>
            {/* Today's Health Tip */}
            <div className="mb-4">
              <p className="hm-lbl">Today's Health Tip</p>
              <div className="hm-tip" style={{ background: displayTip.bg }}>
                <div className="hm-tip-wm" style={{ color: displayTip.accent }}>"</div>
                <div className="hm-tip-head">
                  <div className="hm-tip-ico" style={{ background: displayTip.accent + "20" }}>
                    {loadingTip ? (
                      <Droplets size={16} color={displayTip.accent} strokeWidth={1.8} />
                    ) : (
                      <TipIcon size={16} color={displayTip.accent} strokeWidth={1.8} />
                    )}
                  </div>
                  <span className="hm-tip-badge" style={{ color: displayTip.accent }}>{displayTip.label}</span>
                  <span className="hm-tip-day" style={{ color: displayTip.accent }}>{DAYS[now.getDay()]}</span>
                </div>
                <p className="hm-tip-text" style={{ color: displayTip.accent }}>"{displayTip.tip}"</p>
              </div>
            </div>

            {/* Next Appointment */}
            <div className="mb-4">
              <p className="hm-lbl">Next Appointment</p>
              {nextAppointment ? (
                <div className="hm-appt" onClick={() => navigate("/reminders")}>
                  <div className="hm-appt-cal">
                    <span className="hm-appt-n">{new Date(nextAppointment.datetime).getDate()}</span>
                    <span className="hm-appt-m">{MONTHS[new Date(nextAppointment.datetime).getMonth()].slice(0,3)}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p className="hm-appt-t">{nextAppointment.type}</p>
                    <p className="hm-appt-d">{nextAppointment.note || 'Appointment scheduled'} · {nextAppointment.datetime}</p>
                  </div>
                  <ChevronRight size={16} color="#ccc" />
                </div>
              ) : (
                <div className="hm-appt" onClick={() => navigate("/reminders")} style={{ opacity: 0.6 }}>
                  <div className="hm-appt-cal">
                    <span className="hm-appt-n">--</span>
                    <span className="hm-appt-m">---</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p className="hm-appt-t">No upcoming appointments</p>
                    <p className="hm-appt-d">Tap to schedule one</p>
                  </div>
                  <ChevronRight size={16} color="#ccc" />
                </div>
              )}
            </div>

            {/* Symptom Checklist Card - NEW */}
            <div>
              <p className="hm-lbl">How are you feeling?</p>
              <SymptomChecklistCard onOpen={() => setShowSymptomChecklist(true)} />
            </div>
          </div>

          {/* ═══ REMINDERS ═══ */}
          <div className="hm-full">
            <p className="hm-lbl">Reminders</p>
            <div className="hm-reminders-card">
              <CompactReminders
                navigate={navigate}
                onReminderHover={handleReminderHover}
                onReminderComplete={handleReminderComplete}
              />
              <div className="hm-reminders-mascot">
                <MascotStrip
                  mood={mascotMood}
                  message={mascotMessage}
                  size={sizeForZone.reminders}
                  visible={mascotVisible && mascotZone === "reminders"}
                  bubbleOpacity={bubbleOpacity}
                />
              </div>
            </div>
          </div>

          {/* ═══ QUICK ACTIONS ═══ */}
          <div className="hm-full">
            <p className="hm-lbl">Quick Actions</p>
            <div className="hm-bento">

              {/* AI CARD */}
              <div className="hm-card hm-card-ai" onMouseEnter={() => handleNavHover("ai")} onMouseLeave={handleNavLeave}>
                <div className="hm-card-ai-header">
                  <div className="hm-card-ai-icon"><Bot size={18} color="#fff" strokeWidth={1.5} /></div>
                  <div>
                    <p className="hm-card-ai-title">AI Health Assistant</p>
                    <p className="hm-card-ai-sub">Ask me anything about your recovery</p>
                  </div>
                  <span className="hm-card-ai-badge">24/7</span>
                </div>
                <div className="hm-ai-input-row">
                  <input ref={inputRef} className="hm-ai-input" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendToAI()} placeholder="Type your question here…" />
                  <button className="hm-ai-send" onClick={() => sendToAI()}><Send size={14} color="#fff" strokeWidth={2} /></button>
                </div>
                <AiTicker onSelect={sendToAI} />
              </div>

              {/* EMERGENCY */}
              <div className="hm-card hm-card-emer" onClick={() => navigate("/emergency-alert")} onMouseEnter={handleSOSHover} onMouseLeave={handleSOSLeave}>
                <div className="hm-card-emer-inner">
                  <div className="hm-card-icon-row">
                    <div className="hm-emer-ring">
                      <div className="hm-icon-box" style={{ background:"#fef2f2", border:"1px solid #fecaca", width:38, height:38, borderRadius:10 }}>
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
                <div className="hm-emer-mascot" onClick={e => e.stopPropagation()}>
                  <MascotStrip
                    mood={mascotMood}
                    message={mascotMessage}
                    size={sizeForZone.emergency}
                    visible={mascotVisible && mascotZone === "emergency"}
                    bubbleOpacity={bubbleOpacity}
                  />
                </div>
              </div>

              {/* FIND FACILITY */}
              <div className="hm-card hm-card-fac" onClick={() => navigate("/map")} onMouseEnter={() => handleNavHover("map")} onMouseLeave={handleNavLeave}>
                <div className="hm-card-fac-inner">
                  <div className="hm-card-icon-row">
                    <div className="hm-icon-box" style={{ background:"#f0fdf4", border:"1px solid #bbf7d0" }}>
                      <MapPin size={18} color="#16a34a" strokeWidth={1.8} />
                    </div>
                    <div className="hm-arr-btn"><ArrowUpRight size={12} color="#aaa" /></div>
                  </div>
                  <p className="hm-card-title" style={{ marginBottom:8 }}>Nearby Facilities</p>
                  <div className="hm-fac-list">
                    {loadingFacilities ? (
                      <p style={{ fontSize: '11px', color: '#aaa', padding: '8px' }}>Loading facilities...</p>
                    ) : facilities.length === 0 ? (
                      <p style={{ fontSize: '11px', color: '#aaa', padding: '8px' }}>No facilities found nearby</p>
                    ) : (
                      facilities.slice(0, 3).map(f => (
                        <div className="hm-fac-item" key={f.name || f.id}>
                          <StethoscopeIcon size={13} color="#aaa" strokeWidth={1.5} />
                          <div style={{ flex:1, minWidth:0 }}>
                            <p className="hm-fac-name" style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.name}</p>
                            <p className="hm-fac-meta">{f.dist || f.distance} · {f.type}</p>
                          </div>
                          <span className={`hm-fac-open ${f.open ? "hm-open-yes" : "hm-open-no"}`}>{f.open ? "Open" : "Closed"}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* RECOVERY HUB */}
              <div className="hm-card hm-card-hub" onClick={() => navigate("/safe-recovery")} onMouseEnter={() => handleNavHover("recovery")} onMouseLeave={handleNavLeave}>
                <div className="hm-hub-inner">
                  <div className="hm-hub-top">
                    <div className="hm-hub-title-row">
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
                        <div className="hm-icon-box" style={{ background:"#faf5ff", border:"1px solid #e9d5ff", width:32, height:32, borderRadius:9 }}>
                          <Heart size={15} color="#9333ea" strokeWidth={1.8} />
                        </div>
                        <p className="hm-card-title">Recovery Hub</p>
                      </div>
                      <p className="hm-card-sub">Your space to heal, learn, and feel supported</p>
                    </div>
                    <div className="hm-arr-btn" style={{ flexShrink:0, marginLeft:8 }}><ArrowUpRight size={12} color="#aaa" /></div>
                  </div>
                  <div className="hm-hub-modules">
                    {RECOVERY_ITEMS.map(item => (
                      <div className="hm-hub-mod" key={item.label} onClick={e=>{e.stopPropagation();navigate("/safe-recovery");}}>
                        <item.Icon size={18} color="#9333ea" strokeWidth={1.5} />
                        <p className="hm-hub-mod-label">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="hm-hub-mascot" onClick={e => e.stopPropagation()}>
                    <MascotStrip
                      mood={mascotMood}
                      message={mascotMessage}
                      size={sizeForZone.hub}
                      visible={mascotVisible && mascotZone === "hub"}
                      bubbleOpacity={bubbleOpacity}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Symptom Checklist Modal */}
      {showSymptomChecklist && (
        <SymptomChecklist
          onClose={() => setShowSymptomChecklist(false)}
          onStartChat={handleSymptomChecklistStart}
        />
      )}
    </>
  );
}