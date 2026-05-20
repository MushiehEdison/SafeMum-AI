import { useState, useRef } from "react";
import {
  Pencil, Check, X, Bell, Plus, LogOut,
  ChevronRight, Activity, User, Heart,
  Stethoscope, Settings as Gear, Upload,
  FileText, Camera, AlertTriangle,
  ToggleLeft, ToggleRight, Shield,
  Wind, Leaf, BookOpen, MessageCircle,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const INITIAL_INFO = {
  name: "Sarah Mbeki",
  email: "sarah.mbeki@email.com",
  phone: "+237 6XX XXX XXX",
  language: "English",
  location: "Nairobi, Kenya",
};

const MEDICAL_STATIC = {
  bloodType: "O+",
  genotype: "AA",
  allergies: "Penicillin",
  conditions: "None",
  hospital: "Kenyatta National Hospital",
  physician: "Dr. James Oloo",
};

const EMERGENCY = { name: "Amina Mbeki", relation: "Sister", phone: "+237 6XX XXX XXX" };

const PREGNANCY_HISTORY = [
  { id: 1, outcome: "Miscarriage",       date: "February 2026", age: "Lost at 11 weeks",       note: "First loss. Still processing.", color: "#dc2626" },
  { id: 2, outcome: "Ectopic Pregnancy", date: "August 2025",   age: "Lost at 7 weeks",         note: null,                            color: "#ea580c" },
  { id: 3, outcome: "Delivered",         date: "March 2024",    age: "Delivered at 38 weeks",   note: "Healthy baby girl.",            color: "#16a34a" },
];

const INITIAL_REMINDERS = [
  { id: 1, type: "Follow-up Appointment", datetime: "May 22, 2026 · 10:00 AM", note: "Post-loss follow-up at Kenyatta National Hospital" },
  { id: 2, type: "Medication",            datetime: "May 21, 2026 · 8:00 AM",  note: "Take iron supplement" },
  { id: 3, type: "Emotional Check-in",    datetime: "May 23, 2026 · 6:00 PM",  note: null },
];

const REMINDER_TYPES = ["Follow-up Appointment","Medication","Emotional Check-in","Danger Signs Education"];

const TABS = [
  { id: "overview",  label: "Overview",  Icon: User        },
  { id: "medical",   label: "Medical",   Icon: Stethoscope },
  { id: "history",   label: "History",   Icon: Heart       },
  { id: "reminders", label: "Reminders", Icon: Bell        },
  { id: "settings",  label: "Settings",  Icon: Gear        },
];

/* ─────────────────────────────────────────────────────────────
   TINY HELPERS
───────────────────────────────────────────────────────────── */
function Toggle({ on, onChange }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => onChange(!on)}
      style={{ width:44,height:24,borderRadius:12,border:"none",background:on?"#16a34a":"#d1d5db",cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0,padding:0 }}>
      <div style={{ position:"absolute",top:3,left:on?23:3,width:18,height:18,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,.2)",transition:"left .2s" }} />
    </button>
  );
}

function Divider() {
  return <div style={{ height:1,background:"#e8e6e1",margin:"4px 0 16px" }} />;
}

function SectionTitle({ children, action }) {
  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
      <p style={{ margin:0,fontSize:11,fontWeight:700,letterSpacing:".14em",textTransform:"uppercase",color:"#bbb",fontFamily:"'Manrope',sans-serif" }}>{children}</p>
      {action}
    </div>
  );
}

function InfoRow({ label, value, editing, draftKey, draft, onChange, type = "text" }) {
  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",borderBottom:"1px solid #f0eeea",gap:16 }}>
      <span style={{ fontSize:13,color:"#888",fontFamily:"'Manrope',sans-serif",minWidth:120,flexShrink:0,fontWeight:300 }}>{label}</span>
      {editing ? (
        <input type={type} value={draft[draftKey]} onChange={e=>onChange({...draft,[draftKey]:e.target.value})}
          style={{ flex:1,border:"1px solid #e0ddd8",borderRadius:10,padding:"8px 12px",fontSize:13,fontFamily:"'Manrope',sans-serif",color:"#111",outline:"none",background:"#fafaf8",minWidth:0,transition:"border-color .15s" }}
          onFocus={e=>e.target.style.borderColor="#c0bdb8"} onBlur={e=>e.target.style.borderColor="#e0ddd8"} />
      ) : (
        <span style={{ fontSize:13,color:"#111",fontFamily:"'Manrope',sans-serif",textAlign:"right",fontWeight:400 }}>{value}</span>
      )}
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background:"#fff",border:"1px solid #e8e6e1",borderRadius:18,padding:18,boxShadow:"0 1px 4px rgba(0,0,0,.05)",...style }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TAB PANELS
───────────────────────────────────────────────────────────── */

/* ── OVERVIEW ── */
function OverviewTab({ info, isEditing, editDraft, setEditDraft, startEdit, saveEdit, cancelEdit }) {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>

      {/* Personal info card */}
      <Card>
        <SectionTitle action={
          isEditing ? (
            <div style={{ display:"flex",gap:6 }}>
              <button onClick={saveEdit} style={{ display:"flex",alignItems:"center",gap:4,border:"none",background:"#f0fdf4",color:"#16a34a",borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'Manrope',sans-serif" }}>
                <Check size={13}/> Save
              </button>
              <button onClick={cancelEdit} style={{ display:"flex",alignItems:"center",gap:4,border:"none",background:"#f4f3f0",color:"#888",borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"'Manrope',sans-serif" }}>
                <X size={13}/> Cancel
              </button>
            </div>
          ) : (
            <button onClick={startEdit} style={{ display:"flex",alignItems:"center",gap:5,border:"none",background:"none",color:"#888",cursor:"pointer",fontSize:12,fontWeight:500,fontFamily:"'Manrope',sans-serif",padding:"4px 6px",borderRadius:7 }}>
              <Pencil size={13}/> Edit
            </button>
          )
        }>Personal information</SectionTitle>
        <Divider/>
        {[
          { label:"Full name",  key:"name"     },
          { label:"Email",      key:"email",   type:"email" },
          { label:"Phone",      key:"phone"    },
          { label:"Language",   key:"language" },
          { label:"Location",   key:"location" },
        ].map(f => (
          <InfoRow key={f.key} label={f.label} value={info[f.key]} editing={isEditing} draftKey={f.key} draft={editDraft} onChange={setEditDraft} type={f.type}/>
        ))}
      </Card>

      {/* Upload medical documents */}
      <Card>
        <SectionTitle>Documents & files</SectionTitle>
        <Divider/>
        <p style={{ fontSize:12,color:"#aaa",fontWeight:300,fontFamily:"'Manrope',sans-serif",marginBottom:14,lineHeight:1.6 }}>
          Upload medical records, lab results, prescriptions, or any relevant documents. Your files are private and encrypted.
        </p>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          {[
            { label:"Lab results",      Icon:FileText   },
            { label:"Scan / imaging",   Icon:Camera     },
            { label:"Prescriptions",    Icon:FileText   },
            { label:"Doctor's reports", Icon:Stethoscope},
          ].map(item => (
            <button key={item.label}
              style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:8,padding:"18px 12px",background:"#f8f7f4",border:"1.5px dashed #e0ddd8",borderRadius:14,cursor:"pointer",fontFamily:"'Manrope',sans-serif",transition:"background .15s,border-color .15s" }}
              onMouseEnter={e=>{e.currentTarget.style.background="#f0eeea";e.currentTarget.style.borderColor="#c8c5bf";}}
              onMouseLeave={e=>{e.currentTarget.style.background="#f8f7f4";e.currentTarget.style.borderColor="#e0ddd8";}}>
              <div style={{ width:36,height:36,borderRadius:10,background:"#fff",border:"1px solid #e8e6e1",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <item.Icon size={16} color="#888" strokeWidth={1.5}/>
              </div>
              <span style={{ fontSize:12,fontWeight:500,color:"#555",textAlign:"center",lineHeight:1.3 }}>{item.label}</span>
              <span style={{ fontSize:10,color:"#bbb",fontWeight:300 }}>Tap to upload</span>
            </button>
          ))}
        </div>
        <button style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",marginTop:12,padding:"11px",background:"#111",borderRadius:12,border:"none",cursor:"pointer",fontFamily:"'Manrope',sans-serif",fontSize:13,fontWeight:500,color:"#fff",transition:"background .15s" }}
          onMouseEnter={e=>e.currentTarget.style.background="#222"} onMouseLeave={e=>e.currentTarget.style.background="#111"}>
          <Upload size={14} strokeWidth={1.8}/> Upload a file
        </button>
      </Card>
    </div>
  );
}

/* ── MEDICAL ── */
function MedicalTab() {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
      <Card>
        <SectionTitle>Medical profile</SectionTitle>
        <Divider/>
        {[
          { label:"Blood type",         value:MEDICAL_STATIC.bloodType  },
          { label:"Genotype",           value:MEDICAL_STATIC.genotype   },
          { label:"Allergies",          value:MEDICAL_STATIC.allergies  },
          { label:"Chronic conditions", value:MEDICAL_STATIC.conditions },
          { label:"Primary hospital",   value:MEDICAL_STATIC.hospital   },
          { label:"Primary physician",  value:MEDICAL_STATIC.physician  },
        ].map(f => (
          <div key={f.label} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",borderBottom:"1px solid #f0eeea",gap:16 }}>
            <span style={{ fontSize:13,color:"#888",fontFamily:"'Manrope',sans-serif",minWidth:140,flexShrink:0,fontWeight:300 }}>{f.label}</span>
            <span style={{ fontSize:13,color:"#111",fontFamily:"'Manrope',sans-serif",textAlign:"right" }}>{f.value}</span>
          </div>
        ))}
      </Card>

      <Card>
        <SectionTitle>Emergency contact</SectionTitle>
        <Divider/>
        {[
          { label:"Name",     value:EMERGENCY.name     },
          { label:"Relation", value:EMERGENCY.relation },
          { label:"Phone",    value:EMERGENCY.phone    },
        ].map(f => (
          <div key={f.label} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",borderBottom:"1px solid #f0eeea",gap:16 }}>
            <span style={{ fontSize:13,color:"#888",fontFamily:"'Manrope',sans-serif",minWidth:120,flexShrink:0,fontWeight:300 }}>{f.label}</span>
            <span style={{ fontSize:13,color:"#111",fontFamily:"'Manrope',sans-serif",textAlign:"right" }}>{f.value}</span>
          </div>
        ))}
      </Card>

      {/* Danger signs quick ref */}
      <Card style={{ background:"#fff8f8",border:"1px solid #fecaca" }}>
        <div style={{ display:"flex",alignItems:"center",gap:9,marginBottom:10 }}>
          <div style={{ width:32,height:32,borderRadius:9,background:"#fef2f2",border:"1px solid #fecaca",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <AlertTriangle size={15} color="#dc2626" strokeWidth={1.8}/>
          </div>
          <div>
            <p style={{ margin:0,fontSize:13,fontWeight:600,color:"#7f1d1d",fontFamily:"'Manrope',sans-serif" }}>Know your danger signs</p>
            <p style={{ margin:0,fontSize:11,color:"#fca5a5",fontWeight:300,fontFamily:"'Manrope',sans-serif" }}>Seek care immediately if you notice any of these</p>
          </div>
        </div>
        {["Heavy bleeding — soaking a pad per hour","Fever above 38°C with chills","Severe lower belly pain","Dizziness or fainting","Foul-smelling discharge"].map(s=>(
          <div key={s} style={{ display:"flex",alignItems:"flex-start",gap:8,padding:"6px 0",borderTop:"1px solid #fee2e2" }}>
            <div style={{ width:5,height:5,borderRadius:"50%",background:"#dc2626",marginTop:5,flexShrink:0 }}/>
            <span style={{ fontSize:12,color:"#7f1d1d",fontFamily:"'Manrope',sans-serif",fontWeight:300,lineHeight:1.5 }}>{s}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ── HISTORY ── */
function HistoryTab() {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
      <Card>
        <SectionTitle>Pregnancy history</SectionTitle>
        <Divider/>
        {PREGNANCY_HISTORY.length === 0 ? (
          <p style={{ fontSize:13,color:"#aaa",fontStyle:"italic",fontFamily:"'Manrope',sans-serif" }}>No history recorded yet.</p>
        ) : (
          <div>
            {PREGNANCY_HISTORY.map((item, idx) => (
              <div key={item.id} style={{ display:"flex",gap:14,position:"relative" }}>
                {/* Left spine */}
                <div style={{ display:"flex",flexDirection:"column",alignItems:"center",width:14,flexShrink:0 }}>
                  <div style={{ width:12,height:12,borderRadius:"50%",background:item.color,marginTop:4,flexShrink:0,boxShadow:`0 0 0 3px ${item.color}22` }}/>
                  {idx < PREGNANCY_HISTORY.length - 1 && (
                    <div style={{ flex:1,width:1,background:"#e8e6e1",marginTop:4 }}/>
                  )}
                </div>
                {/* Content */}
                <div style={{ flex:1,paddingBottom:idx < PREGNANCY_HISTORY.length-1 ? 22 : 4 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
                    <span style={{ fontSize:14,fontWeight:600,color:"#111",fontFamily:"'Manrope',sans-serif" }}>{item.outcome}</span>
                    <span style={{ fontSize:11,color:"#bbb",fontFamily:"'Manrope',sans-serif" }}>{item.date}</span>
                  </div>
                  <p style={{ fontSize:13,color:"#888",fontFamily:"'Manrope',sans-serif",margin:"0 0 3px",fontWeight:300 }}>{item.age}</p>
                  {item.note && (
                    <p style={{ fontSize:12,color:"#aaa",fontStyle:"italic",fontFamily:"'Fraunces',serif",margin:0,fontWeight:300 }}>{item.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Emotional support callout */}
      <Card style={{ background:"#faf5ff",border:"1px solid #e9d5ff" }}>
        <div style={{ display:"flex",alignItems:"center",gap:9,marginBottom:8 }}>
          <div style={{ width:32,height:32,borderRadius:9,background:"#f5f3ff",border:"1px solid #ddd6fe",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <Heart size={15} color="#9333ea" strokeWidth={1.8}/>
          </div>
          <p style={{ margin:0,fontSize:13,fontWeight:600,color:"#6b21a8",fontFamily:"'Manrope',sans-serif" }}>You are not alone</p>
        </div>
        <p style={{ margin:0,fontSize:13,color:"#7e22ce",fontWeight:300,lineHeight:1.6,fontFamily:"'Manrope',sans-serif" }}>
          Each loss is part of your story, not a definition of your future. The Recovery Hub has peer stories and support tools whenever you need them.
        </p>
      </Card>
    </div>
  );
}

/* ── REMINDERS ── */
function RemindersTab({ reminders, setReminders }) {
  const [showModal, setShowModal] = useState(false);
  const [nr, setNr] = useState({ type: REMINDER_TYPES[0], date: "", time: "", note: "" });

  const addReminder = () => {
    if (!nr.date || !nr.time) return;
    setReminders(prev => [...prev, { id: Date.now(), type: nr.type, datetime: `${nr.date} · ${nr.time}`, note: nr.note || null }]);
    setNr({ type: REMINDER_TYPES[0], date: "", time: "", note: "" });
    setShowModal(false);
  };

  const typeColor = (t) => t === "Follow-up Appointment" ? "#2563eb" : t === "Medication" ? "#16a34a" : t === "Emotional Check-in" ? "#9333ea" : "#ea580c";

  return (
    <>
      {showModal && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.4)",backdropFilter:"blur(4px)",zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center" }}
          onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div style={{ background:"#fff",borderRadius:"20px 20px 0 0",padding:"24px 20px 40px",width:"100%",maxWidth:480,animation:"mslide .25s ease" }}>
            <style>{`@keyframes mslide{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
              <p style={{ margin:0,fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:600,color:"#111",letterSpacing:"-.02em" }}>New reminder</p>
              <button onClick={()=>setShowModal(false)} style={{ background:"#f4f3f0",border:"none",borderRadius:9,width:32,height:32,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <X size={15} color="#555"/>
              </button>
            </div>
            {[
              { label:"Type", el:<select value={nr.type} onChange={e=>setNr(r=>({...r,type:e.target.value}))} style={{ width:"100%",border:"1px solid #e5e7eb",borderRadius:11,padding:"10px 12px",fontSize:13,fontFamily:"'Manrope',sans-serif",color:"#111",outline:"none",background:"#fafaf8" }}>{REMINDER_TYPES.map(t=><option key={t}>{t}</option>)}</select> },
            ].map(f=>(
              <div key={f.label} style={{ marginBottom:12 }}>
                <p style={{ fontSize:11,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:"#aaa",marginBottom:5,fontFamily:"'Manrope',sans-serif" }}>{f.label}</p>
                {f.el}
              </div>
            ))}
            <div style={{ display:"flex",gap:10,marginBottom:12 }}>
              {[{label:"Date",type:"date",key:"date"},{label:"Time",type:"time",key:"time"}].map(f=>(
                <div key={f.key} style={{ flex:1 }}>
                  <p style={{ fontSize:11,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:"#aaa",marginBottom:5,fontFamily:"'Manrope',sans-serif" }}>{f.label}</p>
                  <input type={f.type} value={nr[f.key]} onChange={e=>setNr(r=>({...r,[f.key]:e.target.value}))} style={{ width:"100%",border:"1px solid #e5e7eb",borderRadius:11,padding:"10px 12px",fontSize:13,fontFamily:"'Manrope',sans-serif",color:"#111",outline:"none",background:"#fafaf8" }}/>
                </div>
              ))}
            </div>
            <div style={{ marginBottom:18 }}>
              <p style={{ fontSize:11,fontWeight:600,letterSpacing:".1em",textTransform:"uppercase",color:"#aaa",marginBottom:5,fontFamily:"'Manrope',sans-serif" }}>Note (optional)</p>
              <input placeholder="Add a note…" value={nr.note} onChange={e=>setNr(r=>({...r,note:e.target.value}))} style={{ width:"100%",border:"1px solid #e5e7eb",borderRadius:11,padding:"10px 12px",fontSize:13,fontFamily:"'Manrope',sans-serif",color:"#111",outline:"none",background:"#fafaf8" }}/>
            </div>
            <button onClick={addReminder} style={{ width:"100%",padding:"13px",background:"#111",borderRadius:13,border:"none",cursor:"pointer",fontFamily:"'Manrope',sans-serif",fontSize:14,fontWeight:600,color:"#fff" }}>
              Add reminder
            </button>
          </div>
        </div>
      )}

      <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
        <Card>
          <SectionTitle action={
            <button onClick={()=>setShowModal(true)} style={{ display:"flex",alignItems:"center",gap:5,border:"none",background:"#111",color:"#fff",borderRadius:9,padding:"6px 11px",cursor:"pointer",fontSize:12,fontWeight:500,fontFamily:"'Manrope',sans-serif" }}>
              <Plus size={13}/> Add
            </button>
          }>Upcoming reminders</SectionTitle>
          <Divider/>
          {reminders.length === 0 ? (
            <p style={{ fontSize:13,color:"#aaa",fontStyle:"italic",fontFamily:"'Manrope',sans-serif" }}>No reminders yet.</p>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {reminders.map(r => (
                <div key={r.id} style={{ display:"flex",alignItems:"flex-start",gap:12,padding:"12px",background:"#f8f7f4",borderRadius:13,border:"1px solid #f0eeea" }}>
                  <div style={{ width:32,height:32,borderRadius:9,background:"#fff",border:"1px solid #e8e6e1",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    <Bell size={14} color="#888" strokeWidth={1.5}/>
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <span style={{ display:"inline-block",fontSize:10,fontWeight:600,letterSpacing:".06em",textTransform:"uppercase",border:`1px solid ${typeColor(r.type)}33`,borderRadius:20,padding:"2px 9px",color:typeColor(r.type),marginBottom:4,fontFamily:"'Manrope',sans-serif" }}>
                      {r.type}
                    </span>
                    <p style={{ fontSize:13,fontWeight:600,color:"#111",fontFamily:"'Manrope',sans-serif",margin:"0 0 2px" }}>{r.datetime}</p>
                    {r.note && <p style={{ fontSize:12,color:"#888",fontWeight:300,fontFamily:"'Manrope',sans-serif",margin:0,lineHeight:1.4 }}>{r.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

/* ── SETTINGS ── */
function SettingsTab() {
  const [language,      setLanguage]      = useState("English");
  const [notifications, setNotifications] = useState({ sms:true,whatsapp:true,app:true });
  const [anonymousMode, setAnonymousMode] = useState(false);

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>

      {/* Language */}
      <Card>
        <SectionTitle>Language</SectionTitle>
        <Divider/>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 0" }}>
          <span style={{ fontSize:13,color:"#111",fontFamily:"'Manrope',sans-serif" }}>Display language</span>
          <select value={language} onChange={e=>setLanguage(e.target.value)}
            style={{ border:"1px solid #e8e6e1",borderRadius:10,padding:"7px 11px",fontSize:13,fontFamily:"'Manrope',sans-serif",color:"#111",outline:"none",background:"#f8f7f4",cursor:"pointer" }}>
            {["English","French","Swahili","Hausa","Arabic"].map(l=><option key={l}>{l}</option>)}
          </select>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <SectionTitle>Notifications</SectionTitle>
        <Divider/>
        {[{key:"sms",label:"SMS notifications"},{key:"whatsapp",label:"WhatsApp notifications"},{key:"app",label:"App notifications"}].map(n=>(
          <div key={n.key} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid #f0eeea" }}>
            <span style={{ fontSize:13,color:"#111",fontFamily:"'Manrope',sans-serif" }}>{n.label}</span>
            <Toggle on={notifications[n.key]} onChange={v=>setNotifications(p=>({...p,[n.key]:v}))}/>
          </div>
        ))}
      </Card>

      {/* Privacy */}
      <Card>
        <SectionTitle>Privacy</SectionTitle>
        <Divider/>
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,padding:"4px 0" }}>
          <div>
            <p style={{ margin:0,fontSize:13,color:"#111",fontFamily:"'Manrope',sans-serif",marginBottom:3 }}>Anonymous mode in community</p>
            {anonymousMode && <p style={{ margin:0,fontSize:11,color:"#888",fontWeight:300,fontFamily:"'Manrope',sans-serif",lineHeight:1.5 }}>Your posts in the community board will show as Anonymous.</p>}
          </div>
          <Toggle on={anonymousMode} onChange={setAnonymousMode}/>
        </div>
      </Card>

      {/* Logout */}
      <button onClick={()=>console.log("logout")}
        style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:9,width:"100%",padding:"14px",border:"1px solid #dc2626",borderRadius:14,background:"#fff",cursor:"pointer",fontFamily:"'Manrope',sans-serif",fontSize:14,fontWeight:500,color:"#dc2626",transition:"background .15s" }}
        onMouseEnter={e=>e.currentTarget.style.background="#fef2f2"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
        <LogOut size={16} strokeWidth={1.5}/> Log out
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN
───────────────────────────────────────────────────────────── */
export default function Profile() {
  const [activeTab,  setActiveTab]  = useState("overview");
  const [personalInfo, setPersonalInfo] = useState(INITIAL_INFO);
  const [isEditing,    setIsEditing]    = useState(false);
  const [editDraft,    setEditDraft]    = useState(INITIAL_INFO);
  const [reminders,    setReminders]    = useState(INITIAL_REMINDERS);

  const now     = new Date();
  const initials = personalInfo.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const hour    = now.getHours();
  const nameColor = hour < 12 ? "#d97706" : hour < 17 ? "#ea580c" : "#7c3aed";

  const startEdit  = () => { setEditDraft({...personalInfo}); setIsEditing(true); };
  const saveEdit   = () => { setPersonalInfo({...editDraft}); setIsEditing(false); };
  const cancelEdit = () => setIsEditing(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,400&family=Manrope:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .pf-root {
          font-family: 'Manrope', sans-serif;
          background: #f4f3f0;
          min-height: 100vh;
          color: #111;
          padding-bottom: 120px;
        }

        /* ── HERO ── */
        .pf-hero {
          padding: clamp(44px,7vw,64px) clamp(20px,5vw,48px) clamp(24px,4vw,36px);
          display: flex; align-items: center; gap: 18px;
          border-bottom: 1px solid #e8e6e1;
          background: #f4f3f0;
        }
        .pf-avatar {
          width: 68px; height: 68px; border-radius: 50%;
          background: #fff; border: 1px solid #e8e6e1;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,.06);
        }
        .pf-initials {
          font-family: 'Fraunces', serif; font-size: 24px;
          font-weight: 600; color: #111; letter-spacing: -.02em;
        }
        .pf-name {
          font-family: 'Fraunces', serif;
          font-size: clamp(20px,3.5vw,28px);
          font-weight: 600; color: #111; letter-spacing: -.02em;
          margin-bottom: 4px; line-height: 1.1;
        }
        .pf-email { font-size: 13px; color: #888; font-weight: 300; margin-bottom: 10px; }
        .pf-badges { display: flex; gap: 7px; flex-wrap: wrap; }
        .pf-badge {
          font-size: 10px; font-weight: 600; padding: 3px 10px;
          border-radius: 20px; font-family: 'Manrope', sans-serif;
          letter-spacing: .04em;
        }

        /* ── TABS ── */
        .pf-tabs-wrap {
          position: sticky; top: 0; z-index: 10;
          background: #f4f3f0;
          border-bottom: 1px solid #e8e6e1;
          padding: 0 clamp(16px,4vw,48px);
          overflow-x: auto;
        }
        .pf-tabs-wrap::-webkit-scrollbar { height: 0; }
        .pf-tabs {
          display: flex; gap: 0;
          min-width: max-content;
        }
        .pf-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 14px 18px; border: none; background: none;
          cursor: pointer; font-family: 'Manrope', sans-serif;
          font-size: 13px; font-weight: 500;
          color: #aaa; border-bottom: 2px solid transparent;
          transition: color .15s, border-color .15s;
          white-space: nowrap;
        }
        .pf-tab:hover { color: #555; }
        .pf-tab.active { color: #111; border-bottom-color: #111; }
        .pf-tab-icon { flex-shrink: 0; }

        /* ── BODY ── */
        .pf-body {
          max-width: 640px; margin: 0 auto;
          padding: clamp(20px,4vw,32px) clamp(16px,4vw,48px) 0;
        }
      `}</style>

      <div className="pf-root">

        {/* Hero */}
        <div className="pf-hero">
          <div className="pf-avatar">
            <span className="pf-initials">{initials}</span>
          </div>
          <div>
            <p className="pf-name" style={{ color: nameColor }}>{personalInfo.name}</p>
            <p className="pf-email">{personalInfo.email}</p>
            <div className="pf-badges">
              <span className="pf-badge" style={{ border:"1.5px solid #dc2626",color:"#dc2626" }}>In Recovery</span>
              <span className="pf-badge" style={{ border:"1.5px solid #d1d5db",color:"#888" }}>Member since May 2026</span>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="pf-tabs-wrap">
          <div className="pf-tabs">
            {TABS.map(t => (
              <button key={t.id} className={`pf-tab${activeTab===t.id?" active":""}`} onClick={()=>setActiveTab(t.id)}>
                <t.Icon size={14} className="pf-tab-icon" strokeWidth={activeTab===t.id?2:1.5}/>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Panel */}
        <div className="pf-body">
          {activeTab === "overview" && (
            <OverviewTab
              info={personalInfo} isEditing={isEditing} editDraft={editDraft}
              setEditDraft={setEditDraft} startEdit={startEdit} saveEdit={saveEdit} cancelEdit={cancelEdit}
            />
          )}
          {activeTab === "medical"   && <MedicalTab/>}
          {activeTab === "history"   && <HistoryTab/>}
          {activeTab === "reminders" && <RemindersTab reminders={reminders} setReminders={setReminders}/>}
          {activeTab === "settings"  && <SettingsTab/>}
        </div>
      </div>
    </>
  );
}