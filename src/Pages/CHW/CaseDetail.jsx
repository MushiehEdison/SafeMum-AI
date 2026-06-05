import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, MapPin, Calendar, Bot, Phone, AlertTriangle,
  LayoutDashboard, FolderOpen, User, ChevronDown, FileUp,
  CheckCircle2, Clock, Heart, MessageCircle, Upload,
  TrendingUp, TrendingDown, Star, Activity, Loader, Navigation,
} from "lucide-react";
import NavCHW from "../../Components/NavCHW";
import { getCHWCaseById, updateCHWCase, respondToCheckin } from "../../API/chw";
import { getNearbyFacilities } from "../../API/facilities";

const TABS = ["Overview", "Check-ins", "Reminders", "Actions", "History"];

const statusConfig = {
  New: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  Contacted: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  Visited: { color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  Escalated: { color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  Resolved: { color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
};

const moodConfig = {
  red: { bg: "bg-red-100", border: "border-red-300", text: "text-red-700", dot: "bg-red-500" },
  gray: { bg: "bg-gray-100", border: "border-gray-300", text: "text-gray-600", dot: "bg-gray-400" },
  green: { bg: "bg-green-100", border: "border-green-300", text: "text-green-700", dot: "bg-green-500" },
};

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-gray-400 mb-3 font-['Manrope']">
      {children}
    </p>
  );
}

function Toast({ message, visible }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded-full px-5 py-2.5 text-xs font-medium font-['Manrope'] z-[9999] whitespace-nowrap shadow-lg">
      {message}
    </div>
  );
}

function CHWCheckinResponse({ caseId, checkinData }) {
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(!!checkinData?.chwNote);
  const [savedNote, setSavedNote] = useState(checkinData?.chwNote || "");

  async function handleSend() {
    if (!note.trim()) return;
    setSending(true);
    try {
      await respondToCheckin(caseId, note.trim());
      setSavedNote(note.trim());
      setNote("");
      setSent(true);
    } catch (err) {
      console.error("Failed to send response:", err);
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 size={14} className="text-green-600" />
          <span className="text-xs font-semibold text-green-700">Response sent</span>
        </div>
        <p className="text-sm text-green-800 leading-relaxed">{savedNote}</p>
        <button
          onClick={() => setSent(false)}
          className="text-xs text-green-600 font-medium mt-2 hover:text-green-700"
        >
          Edit response
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-1">Respond to latest check-in</h3>
      <p className="text-xs text-gray-500 mb-3">
        The patient will see your note in her check-in tab.
      </p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. I noticed your mood has been low this week. I'm here if you need to talk — you can reach me on..."
        rows={3}
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 resize-none mb-3 font-['Manrope']"
      />
      <button
        onClick={handleSend}
        disabled={!note.trim() || sending}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition ${
          note.trim() && !sending
            ? "bg-gray-900 text-white hover:bg-gray-800"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        {sending ? "Sending..." : "Send response"}
      </button>
    </div>
  );
}


export default function CaseDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: "" });

  useEffect(() => {
    async function fetchData() {
      try {
        const [caseRes, facilitiesRes] = await Promise.all([
          getCHWCaseById(id),
          getNearbyFacilities(),
        ]);
        const caseDataRes = caseRes.data.data || caseRes.data;
        setCaseData(caseDataRes);
        setSelectedStatus(caseDataRes.status);
        setNearbyHospitals(facilitiesRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch case data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast({ visible: false, message: "" }), 2000);
  };

  const handleSaveUpdate = async () => {
    try {
      await updateCHWCase(id, { status: selectedStatus, notes: statusNotes || null });
      setCaseData(prev => ({
        ...prev,
        status: selectedStatus,
        caseHistory: [
          ...(prev.caseHistory || []),
          {
            date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) + " at " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            action: `Status updated to ${selectedStatus}`,
            notes: statusNotes || null,
          },
        ],
      }));
      setStatusNotes("");
      showToast("Case updated successfully");
    } catch (err) {
      console.error('Failed to update case:', err);
      showToast("Failed to update case");
    }
  };

  const handleEscalate = async () => {
    if (!selectedHospital) return;
    try {
      await updateCHWCase(id, { status: "Escalated", escalatedTo: selectedHospital.id || selectedHospital._id });
      setCaseData(prev => ({
        ...prev,
        status: "Escalated",
        caseHistory: [
          ...(prev.caseHistory || []),
          {
            date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) + " at " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            action: `Escalated to ${selectedHospital.name}`,
            notes: null,
          },
        ],
      }));
      setSelectedStatus("Escalated");
      showToast(`Patient escalated to ${selectedHospital.name}`);
    } catch (err) {
      console.error('Failed to escalate case:', err);
      showToast("Failed to escalate case");
    }
  };

  // ── Build a meaningful assignment reason ──────────────────────────────
function getAssignmentReason() {
    const reason = caseData.aiReason || caseData.flagReason || "";
    if (reason.includes("0 consecutive low mood") || reason.includes("Needs follow-up")) {
      const lossType = caseData.lossType || "";
      const daysSince = caseData.daysSinceLoss;
      const riskLevel = caseData.riskLevel || "Moderate";
      
      // Check if this is a pregnancy case or a loss case
      if (lossType.toLowerCase().includes("pregnancy") && !lossType.toLowerCase().includes("loss")) {
        return `This patient was assigned to you based on her ${riskLevel.toLowerCase()} risk level and proximity to your coverage area. She is currently pregnant (${lossType}). Reach out within 24 hours for an initial assessment.`;
      }
      
      return `This patient was assigned to you based on her ${riskLevel.toLowerCase()} risk level and proximity to your coverage area. She is ${daysSince ? daysSince + " days" : "recently"} post-loss (${lossType}). Reach out within 24 hours for an initial assessment.`;
    }
    return reason;
}

  if (loading) {
    return (
      <>
        <NavCHW />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader size={24} className="animate-spin text-gray-400" />
        </div>
      </>
    );
  }

  if (!caseData) {
    return (
      <>
        <NavCHW />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-sm text-gray-500 font-['Manrope']">Case not found</p>
        </div>
      </>
    );
  }

  const statusStyles = statusConfig[caseData.status] || statusConfig.New;
  const getMoodStyles = (color) => moodConfig[color] || moodConfig.gray;
  const hasMedicalHistory = caseData.medicalHistory && (
    caseData.medicalHistory.age ||
    caseData.medicalHistory.bloodType ||
    caseData.medicalHistory.allergies ||
    caseData.medicalHistory.chronicConditions ||
    caseData.medicalHistory.medications ||
    caseData.medicalHistory.medicalHistory
  );

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
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{caseData.patientFirstName}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-500">{caseData.location}</span>
                  </div>
                  {caseData.patientLatitude && caseData.patientLongitude && (
                    <div className="flex items-center gap-1.5">
                      <Navigation size={10} className="text-gray-400" />
                      <span className="text-xs text-gray-400 font-mono">
                        {caseData.patientLatitude.toFixed(4)}, {caseData.patientLongitude.toFixed(4)}
                      </span>
                    </div>
                  )}
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
                {/* Patient summary card */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Patient</p>
                      <p className="text-sm font-bold text-gray-900">{caseData.patientFirstName}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
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
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Phone</p>
                      <p className="text-sm text-gray-900 mt-1">{caseData.phone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Days since loss</p>
                      <p className="text-sm text-gray-900 mt-1">{caseData.daysSinceLoss}</p>
                    </div>
                  </div>
                </div>

                {/* Why assigned */}
                <div>
                  <SectionLabel>Why this case was assigned</SectionLabel>
                  <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
                        <Bot size={16} className="text-white" />
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed flex-1">
                        {getAssignmentReason()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Medical History — NEW */}
                {hasMedicalHistory && (
                  <div>
                    <SectionLabel>Medical history</SectionLabel>
                    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {caseData.medicalHistory.age && (
                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Age</p>
                            <p className="text-sm text-gray-900 mt-0.5">{caseData.medicalHistory.age} years</p>
                          </div>
                        )}
                        {caseData.medicalHistory.bloodType && (
                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Blood type</p>
                            <p className="text-sm text-gray-900 mt-0.5">{caseData.medicalHistory.bloodType}</p>
                          </div>
                        )}
                        {caseData.medicalHistory.genotype && (
                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Genotype</p>
                            <p className="text-sm text-gray-900 mt-0.5">{caseData.medicalHistory.genotype}</p>
                          </div>
                        )}
                      </div>

                      {caseData.medicalHistory.allergies && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Allergies</p>
                          <p className="text-sm text-gray-900 leading-relaxed">{caseData.medicalHistory.allergies}</p>
                        </div>
                      )}

                      {caseData.medicalHistory.chronicConditions && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Chronic conditions</p>
                          <p className="text-sm text-gray-900 leading-relaxed">{caseData.medicalHistory.chronicConditions}</p>
                        </div>
                      )}

                      {caseData.medicalHistory.medications && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Current medications</p>
                          <p className="text-sm text-gray-900 leading-relaxed">{caseData.medicalHistory.medications}</p>
                        </div>
                      )}

                      {caseData.medicalHistory.medicalHistory && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Past medical history</p>
                          <p className="text-sm text-gray-900 leading-relaxed">{caseData.medicalHistory.medicalHistory}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Documents */}
                <div>
                  <SectionLabel>Patient documents</SectionLabel>
                  <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-sm text-gray-500 mb-4">
                      Upload referral letters, discharge summaries, or lab results for this patient.
                    </p>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-gray-300 transition">
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
              <div className="space-y-5">
                <SectionLabel>Recent emotional check-ins</SectionLabel>
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  {(caseData.checkinHistory || []).length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">No check-in history yet</p>
                  ) : (
                    <div className="space-y-4">
                      {(caseData.checkinHistory || []).map((c, idx) => {
                        const moodStyles = getMoodStyles(c.color);
                        return (
                          <div key={idx} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-2.5 h-2.5 rounded-full ${moodStyles.dot}`} />
                              {idx < (caseData.checkinHistory || []).length - 1 && (
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
                                <p className="text-sm text-gray-600 italic mt-1 leading-relaxed">{c.note}</p>
                              )}
                              
                              {c.chwNote && (
                                <div className="mt-3 bg-green-50 border border-green-100 rounded-xl p-3">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                                      <Heart size={10} className="text-white" />
                                    </div>
                                    <span className="text-[11px] font-semibold text-green-700">Your response</span>
                                    {c.chwRespondedAt && (
                                      <span className="text-[10px] text-green-500 ml-auto">
                                        {new Date(c.chwRespondedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-green-800 leading-relaxed">{c.chwNote}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {caseData.status !== "Resolved" && caseData.status !== "Escalated" && (caseData.checkinHistory || []).length > 0 && (
                  <CHWCheckinResponse caseId={id} checkinData={caseData.checkinHistory[0]} />
                )}
              </div>
            )}

            {/* REMINDERS TAB */}
            {activeTab === "Reminders" && (
              <div>
                <SectionLabel>Reminders</SectionLabel>
                {(caseData.reminders || []).length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm text-center">
                    <p className="text-sm text-gray-400">No reminders</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(caseData.reminders || []).map((r, idx) => (
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
                            r.overdue ? "bg-red-500 text-white" : "bg-gray-100 text-gray-500"
                          }`}>
                            {r.overdue ? "Overdue" : "Upcoming"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ACTIONS TAB */}
            {activeTab === "Actions" && (
              <div className="space-y-5">
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

                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Update status</h3>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-gray-400 mb-3 font-['Manrope']"
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
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-gray-400 resize-none mb-3 font-['Manrope']"
                  />
                  <button
                    onClick={handleSaveUpdate}
                    className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition"
                  >
                    Save update
                  </button>
                </div>

                {caseData.status !== "Escalated" && (
                  <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Escalate to hospital</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      If this patient needs immediate physical care, escalate her to the nearest capable facility.
                    </p>
                    {nearbyHospitals.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">No facilities found nearby</p>
                    ) : (
                      <div className="space-y-3 mb-4">
                        {nearbyHospitals.slice(0, 3).map(h => (
                          <div 
                            key={h.id || h._id}
                            onClick={() => setSelectedHospital(h)}
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                              selectedHospital?.id === h.id || selectedHospital?._id === h._id
                                ? "border-gray-900 bg-gray-50" 
                                : "border-gray-100 hover:border-gray-200"
                            }`}
                          >
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{h.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-400">{h.distance || h.dist}</span>
                                {h.hasPostLossCare && (
                                  <span className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Post-loss care</span>
                                )}
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              (selectedHospital?.id === h.id || selectedHospital?._id === h._id)
                                ? "border-gray-900 bg-gray-900" 
                                : "border-gray-300"
                            }`}>
                              {(selectedHospital?.id === h.id || selectedHospital?._id === h._id) && <CheckCircle2 size={12} className="text-white" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                {(caseData.caseHistory || []).length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm text-center">
                    <p className="text-sm text-gray-400">No history yet</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                    <div className="space-y-4">
                      {(caseData.caseHistory || []).map((h, idx) => (
                        <div key={idx} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5" />
                            {idx < (caseData.caseHistory || []).length - 1 && (
                              <div className="w-px flex-1 bg-gray-100 mt-1 min-h-[20px]" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{h.action}</p>
                            <p className="text-xs text-gray-400 mt-1">{h.date}</p>
                            {h.notes && (
                              <p className="text-sm text-gray-500 italic mt-2 leading-relaxed">{h.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
}  