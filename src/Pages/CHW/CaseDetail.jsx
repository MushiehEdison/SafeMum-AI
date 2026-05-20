import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Calendar, Bot, Phone, AlertTriangle,
  LayoutDashboard, FolderOpen, User, ChevronDown, FileUp,
  CheckCircle2, Clock, Heart, MessageCircle, Upload,
  TrendingUp, TrendingDown, Star, Activity
} from "lucide-react";
import NavCHW from "../../Components/NavCHW";

const dummyCase = {
  id: 1,
  patientFirstName: "Sarah",
  location: "Parklands, Nairobi",
  daysSinceLoss: 21,
  lossType: "Miscarriage",
  riskLevel: "High",
  status: "New",
  assignedDate: "May 20, 2026",
  phone: "+254711000001",
  aiReason: "Sarah has had 3 consecutive very low mood check-ins and has not confirmed her follow-up appointment from May 18th. Immediate follow-up is recommended.",
  checkinHistory: [
    { date: "May 19", mood: "Very low", note: "Cannot stop crying.", color: "red" },
    { date: "May 17", mood: "Very low", note: "Hard day.", color: "red" },
    { date: "May 15", mood: "Very low", note: null, color: "red" },
    { date: "May 13", mood: "Low", note: "Not great.", color: "gray" },
    { date: "May 11", mood: "Okay", note: "Had a good moment today.", color: "green" }
  ],
  reminders: [
    { type: "Follow-up Appointment", datetime: "May 18, 2026 at 9:00 AM", overdue: true, missedCount: 2 },
    { type: "Medication", datetime: "May 22, 2026 at 8:00 AM", overdue: false, missedCount: 0 }
  ],
  caseHistory: [
    { date: "May 20, 2026 at 11:00 AM", action: "Case assigned by AI", notes: null }
  ]
};

const dummyNearbyHospitals = [
  { id: 1, name: "Kenyatta National Hospital", distance: "3.2 km", hasPostLossCare: true },
  { id: 2, name: "Aga Khan University Hospital", distance: "4.1 km", hasPostLossCare: true },
  { id: 3, name: "MP Shah Hospital", distance: "5.3 km", hasPostLossCare: false }
];

const TABS = ["Overview", "Check-ins", "Reminders", "Actions", "History"];

const statusConfig = {
  New: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  Contacted: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  Visited: { color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  Escalated: { color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  Resolved: { color: "text-green-600", bg: "bg-green-50", border: "border-green-200" }
};

const moodConfig = {
  red: { bg: "bg-red-100", border: "border-red-300", text: "text-red-700", dot: "bg-red-500" },
  gray: { bg: "bg-gray-100", border: "border-gray-300", text: "text-gray-600", dot: "bg-gray-400" },
  green: { bg: "bg-green-100", border: "border-green-300", text: "text-green-700", dot: "bg-green-500" }
};

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-gray-300 mb-3 font-['Manrope']">
      {children}
    </p>
  );
}

function Toast({ message, visible }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded-full px-5 py-2.5 text-xs font-medium font-['Manrope'] z-[9999] whitespace-nowrap shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
      {message}
    </div>
  );
}

export default function CaseDetail() {
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(dummyCase);
  const [activeTab, setActiveTab] = useState("Overview");
  const [selectedStatus, setSelectedStatus] = useState(dummyCase.status);
  const [statusNotes, setStatusNotes] = useState("");
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: "" });

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 2000);
  };

  const handleSaveUpdate = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const newEntry = {
      date: `${dateStr} at ${timeStr}`,
      action: `Status updated to ${selectedStatus}`,
      notes: statusNotes || null
    };
    setCaseData(prev => ({
      ...prev,
      status: selectedStatus,
      caseHistory: [...prev.caseHistory, newEntry]
    }));
    setStatusNotes("");
    showToast("Case updated successfully");
  };

  const handleEscalate = () => {
    if (!selectedHospital) return;
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const newEntry = {
      date: `${dateStr} at ${timeStr}`,
      action: `Escalated to ${selectedHospital.name}`,
      notes: null
    };
    setCaseData(prev => ({
      ...prev,
      status: "Escalated",
      caseHistory: [...prev.caseHistory, newEntry]
    }));
    setSelectedStatus("Escalated");
    showToast(`Patient escalated to ${selectedHospital.name}`);
  };

  const statusStyles = statusConfig[caseData.status] || statusConfig.New;
  const getMoodStyles = (color) => moodConfig[color] || moodConfig.gray;

  return (
    <>
      <NavCHW />

      <div className="min-h-screen bg-gray-50 font-['Manrope'] pb-28">
        <div className="md:ml-64">
          
          {/* Header */}
          <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 md:px-6 py-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <button 
                  onClick={() => navigate("/chw/cases")}
                  className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition"
                >
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">Case Detail</h1>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles.bg} ${statusStyles.color} border ${statusStyles.border}`}>
                  {caseData.riskLevel}
                </div>
              </div>
              
              {/* Patient Name & Basic Info */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{caseData.patientFirstName}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-500">{caseData.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-500">{caseData.daysSinceLoss} days post-loss</span>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusStyles.bg} ${statusStyles.color} border ${statusStyles.border}`}>
                    {caseData.status}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="sticky top-[105px] z-30 bg-white border-b border-gray-100 overflow-x-auto scrollbar-hide">
            <div className="max-w-4xl mx-auto px-4 md:px-6 flex gap-1">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? "text-gray-900 border-b-2 border-gray-900"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
            
            {/* OVERVIEW TAB */}
            {activeTab === "Overview" && (
              <div className="space-y-6">
                {/* Patient Info Card */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Patient</p>
                      <p className="text-sm font-bold text-gray-900">{caseData.patientFirstName}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-400">Assigned {caseData.assignedDate}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Loss type</p>
                      <p className="text-sm text-gray-900 mt-1">{caseData.lossType}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Location</p>
                      <p className="text-sm text-gray-900 mt-1">{caseData.location}</p>
                    </div>
                  </div>
                </div>

                {/* AI Reason */}
                <div>
                  <SectionLabel>Why this case was assigned</SectionLabel>
                  <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
                        <Bot size={16} className="text-white" />
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed flex-1">
                        {caseData.aiReason}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Patient Documents */}
                <div>
                  <SectionLabel>Patient documents</SectionLabel>
                  <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-sm text-gray-500 mb-4">
                      Upload referral letters, discharge summaries, or lab results for this patient.
                    </p>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-gray-300 transition">
                      <Upload size={24} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 font-medium">Tap to upload a file</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG supported</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CHECK-INS TAB */}
            {activeTab === "Check-ins" && (
              <div>
                <SectionLabel>Recent emotional check-ins</SectionLabel>
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="space-y-4">
                    {caseData.checkinHistory.map((c, idx) => {
                      const moodStyles = getMoodStyles(c.color);
                      return (
                        <div key={idx} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-2.5 h-2.5 rounded-full ${moodStyles.dot}`} />
                            {idx < caseData.checkinHistory.length - 1 && (
                              <div className="w-px flex-1 bg-gray-200 mt-1 min-h-[20px]" />
                            )}
                          </div>
                          <div className="flex-1 pb-3">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs text-gray-400">{c.date}</p>
                              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${moodStyles.bg} ${moodStyles.text}`}>
                                {c.mood}
                              </span>
                            </div>
                            {c.note && (
                              <p className="text-sm text-gray-600 italic mt-1">{c.note}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* REMINDERS TAB */}
            {activeTab === "Reminders" && (
              <div>
                <SectionLabel>Reminders</SectionLabel>
                <div className="space-y-3">
                  {caseData.reminders.map((r, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            r.overdue ? "bg-red-50 border-red-200 text-red-600" : "bg-gray-100 border-gray-200 text-gray-600"
                          }`}>
                            {r.type}
                          </span>
                          <p className="text-sm font-medium text-gray-900 mt-2">{r.datetime}</p>
                          {r.overdue && r.missedCount > 0 && (
                            <p className="text-xs text-red-500 mt-1">Missed {r.missedCount} time{r.missedCount !== 1 ? "s" : ""}</p>
                          )}
                        </div>
                        <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${
                          r.overdue 
                            ? "bg-red-500 text-white" 
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {r.overdue ? "Overdue" : "Upcoming"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ACTIONS TAB */}
            {activeTab === "Actions" && (
              <div className="space-y-5">
                {/* Call Patient */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Call patient</h3>
                  <p className="text-sm text-gray-600 mb-3">{caseData.phone}</p>
                  <button
                    onClick={() => window.open(`tel:${caseData.phone}`)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition"
                  >
                    <Phone size={16} />
                    Call {caseData.phone}
                  </button>
                </div>

                {/* Update Status */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Update status</h3>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-gray-400 mb-3"
                  >
                    {["New", "Contacted", "Visited", "Escalated", "Resolved"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <textarea
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder="Add notes about what happened — what you found, what you did, any concerns."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-400 resize-none mb-3"
                  />
                  <button
                    onClick={handleSaveUpdate}
                    className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition"
                  >
                    Save update
                  </button>
                </div>

                {/* Escalate to Hospital */}
                {caseData.status !== "Escalated" && (
                  <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Escalate to hospital</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      If this patient needs immediate physical care, escalate her to the nearest capable facility.
                    </p>
                    <div className="space-y-3 mb-4">
                      {dummyNearbyHospitals.map(h => (
                        <div 
                          key={h.id}
                          onClick={() => setSelectedHospital(h)}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                            selectedHospital?.id === h.id 
                              ? "border-gray-900 bg-gray-50" 
                              : "border-gray-100 hover:border-gray-200"
                          }`}
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{h.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400">{h.distance}</span>
                              {h.hasPostLossCare && (
                                <span className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Post-loss care</span>
                              )}
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedHospital?.id === h.id 
                              ? "border-gray-900 bg-gray-900" 
                              : "border-gray-300"
                          }`}>
                            {selectedHospital?.id === h.id && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleEscalate}
                      disabled={!selectedHospital}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition ${
                        selectedHospital 
                          ? "bg-red-500 text-white hover:bg-red-600" 
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <AlertTriangle size={16} />
                      Confirm escalation
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === "History" && (
              <div>
                <SectionLabel>Case history</SectionLabel>
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="space-y-4">
                    {caseData.caseHistory.map((h, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5" />
                          {idx < caseData.caseHistory.length - 1 && (
                            <div className="w-px flex-1 bg-gray-100 mt-1 min-h-[20px]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{h.action}</p>
                          <p className="text-xs text-gray-400 mt-1">{h.date}</p>
                          {h.notes && (
                            <p className="text-sm text-gray-500 italic mt-2">{h.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
}