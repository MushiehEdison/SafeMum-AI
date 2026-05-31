import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Search, MapPin, Calendar, Phone, Mail,
  User, Heart, Activity, Clock, Filter, X, ChevronRight,
  Plus, MoreHorizontal, Eye, MessageCircle, AlertTriangle,
  CheckCircle2, Droplets, Thermometer, Wind, Baby,
  Navigation, Star, PhoneCall, Video, FileText, Loader,
} from "lucide-react";
import NavCHW from "../../Components/NavCHW";
import { getCHWPatients } from "../../API/chw";

const statusConfig = {
  Active: { color: "text-green-600", bg: "bg-green-50", border: "border-green-200", dot: "bg-green-500" },
  Resolved: { color: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200", dot: "bg-gray-400" },
  Escalated: { color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500" },
};

const riskConfig = {
  High: { color: "text-red-700", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500" },
  Moderate: { color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500" },
  Low: { color: "text-green-700", bg: "bg-green-50", border: "border-green-200", dot: "bg-green-500" },
};

const lossTypeIcons = {
  "Miscarriage": Droplets,
  "Stillbirth": Baby,
  "Ectopic pregnancy": Activity,
  "Neonatal loss": Heart,
};

const statusFilters = ["All", "Active", "Resolved", "Escalated"];
const riskFilters = ["All", "High", "Moderate", "Low"];

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-gray-300 mb-3 font-['Manrope']">
      {children}
    </p>
  );
}

export default function CHWPatients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);

  useEffect(() => {
    async function fetchPatients() {
      try {
        const res = await getCHWPatients();
        setPatients(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch patients:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(patient => {
    const matchSearch = !searchQuery || 
      (patient.firstName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (patient.lastName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (patient.location || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchStatus = statusFilter === "All" || patient.status === statusFilter;
    const matchRisk = riskFilter === "All" || patient.riskLevel === riskFilter;
    
    return matchSearch && matchStatus && matchRisk;
  });

  const activeCount = patients.filter(p => p.status === "Active").length;
  const resolvedCount = patients.filter(p => p.status === "Resolved").length;
  const escalatedCount = patients.filter(p => p.status === "Escalated").length;

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const getStatusStyles = (status) => statusConfig[status] || statusConfig.Active;
  const getRiskStyles = (risk) => riskConfig[risk] || riskConfig.Moderate;

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

  return (
    <>
      <NavCHW />

      <div className="min-h-screen bg-gray-50 font-['Manrope'] pb-28">
        <div className="md:ml-64">
          
          {/* Header */}
          <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 md:px-6 py-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <button 
                  onClick={() => navigate("/chw")}
                  className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition"
                >
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">My Patients</h1>
                <div className="w-9" />
              </div>
              
              {/* Stats Summary */}
              <div className="grid grid-cols-3 gap-3 mt-2">
                <div className="bg-green-50 rounded-xl p-2 text-center">
                  <p className="text-xl font-bold text-green-600">{activeCount}</p>
                  <p className="text-[10px] text-green-600 font-medium">Active</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2 text-center">
                  <p className="text-xl font-bold text-gray-600">{resolvedCount}</p>
                  <p className="text-[10px] text-gray-500 font-medium">Resolved</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-2 text-center">
                  <p className="text-xl font-bold text-orange-600">{escalatedCount}</p>
                  <p className="text-[10px] text-orange-600 font-medium">Escalated</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="sticky top-[117px] z-30 bg-gray-50 border-b border-gray-100 px-4 md:px-6 py-3">
            <div className="max-w-7xl mx-auto">
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-gray-100 px-3 py-2 shadow-sm">
                  <Search size={16} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 text-sm text-gray-900 placeholder:text-gray-300 outline-none bg-transparent"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")}>
                      <X size={14} className="text-gray-400" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-3 py-2 rounded-xl border transition ${
                    showFilters || statusFilter !== "All" || riskFilter !== "All"
                      ? "bg-gray-900 border-gray-900 text-white"
                      : "bg-white border-gray-100 text-gray-600"
                  }`}
                >
                  <Filter size={16} />
                </button>
              </div>

              {(showFilters || statusFilter !== "All" || riskFilter !== "All") && (
                <div className="mt-3 space-y-3">
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {statusFilters.map(filter => (
                      <button
                        key={filter}
                        onClick={() => setStatusFilter(filter)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                          statusFilter === filter
                            ? "bg-gray-900 text-white"
                            : "bg-white text-gray-600 border border-gray-200"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {riskFilters.map(filter => (
                      <button
                        key={filter}
                        onClick={() => setRiskFilter(filter)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                          riskFilter === filter
                            ? "bg-gray-900 text-white"
                            : "bg-white text-gray-600 border border-gray-200"
                        }`}
                      >
                        {filter} risk
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Patients List */}
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            {filteredPatients.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                <Heart size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">No patients found</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPatients.map(patient => {
                  const statusStyles = getStatusStyles(patient.status);
                  const riskStyles = getRiskStyles(patient.riskLevel);
                  const LossIcon = lossTypeIcons[patient.lossType] || Heart;
                  const isHighRisk = patient.riskLevel === "High";
                  const patientId = patient.id || patient._id;
                  
                  return (
                    <div 
                      key={patientId}
                      className={`bg-white rounded-xl border shadow-sm transition-all hover:shadow-md ${
                        isHighRisk ? "border-l-4 border-l-red-500" : "border-gray-100"
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="text-sm font-bold text-gray-600">
                                {(patient.firstName || "")[0]}{(patient.lastName || "")[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">
                                {patient.firstName} {patient.lastName}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusStyles.bg} ${statusStyles.color} border ${statusStyles.border}`}>
                                  {patient.status}
                                </span>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${riskStyles.bg} ${riskStyles.color} border ${riskStyles.border}`}>
                                  {patient.riskLevel} risk
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleViewPatient(patient)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition"
                          >
                            <MoreHorizontal size={16} className="text-gray-400" />
                          </button>
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2">
                            <MapPin size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-600">{patient.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <LossIcon size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-600">{patient.lossType} · {patient.daysSinceLoss} days post-loss</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-600">Next: {patient.nextFollowUp || "No upcoming"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-500">Last contact: {patient.lastContact}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => window.open(`tel:${patient.phone}`)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-50 text-gray-700 text-xs font-medium hover:bg-gray-100 transition"
                          >
                            <Phone size={12} />
                            Call
                          </button>
                          <button
                            onClick={() => navigate(`/chw/cases/${patientId}`)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition"
                          >
                            <Eye size={12} />
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Patient Detail Modal */}
      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-600">
                    {(selectedPatient.firstName || "")[0]}{(selectedPatient.lastName || "")[0]}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusConfig[selectedPatient.status]?.bg} ${statusConfig[selectedPatient.status]?.color} border ${statusConfig[selectedPatient.status]?.border}`}>
                      {selectedPatient.status}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${riskConfig[selectedPatient.riskLevel]?.bg} ${riskConfig[selectedPatient.riskLevel]?.color} border ${riskConfig[selectedPatient.riskLevel]?.border}`}>
                      {selectedPatient.riskLevel} risk
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowPatientModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <SectionLabel>Contact information</SectionLabel>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Phone size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-900">{selectedPatient.phone}</span>
                    <button 
                      onClick={() => window.open(`tel:${selectedPatient.phone}`)}
                      className="ml-auto text-xs text-green-600 font-medium"
                    >
                      Call
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-900">{selectedPatient.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-900">{selectedPatient.location}</span>
                  </div>
                </div>
              </div>

              <div>
                <SectionLabel>Medical information</SectionLabel>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Loss type</span>
                    <span className="text-xs font-medium text-gray-900">{selectedPatient.lossType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Days post-loss</span>
                    <span className="text-xs font-medium text-gray-900">{selectedPatient.daysSinceLoss} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500">Assigned date</span>
                    <span className="text-xs font-medium text-gray-900">{selectedPatient.assignedDate}</span>
                  </div>
                </div>
              </div>

              <div>
                <SectionLabel>Recent check-ins</SectionLabel>
                <div className="space-y-3">
                  {(selectedPatient.checkIns || []).slice(0, 3).map((check, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-900">{check.date}</span>
                        <span className="text-xs text-gray-500">{check.mood}</span>
                      </div>
                      {check.note && (
                        <p className="text-xs text-gray-600 italic">{check.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <SectionLabel>CHW notes</SectionLabel>
                <div className="bg-amber-50 rounded-xl p-3">
                  <p className="text-sm text-amber-800">{selectedPatient.notes}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => navigate(`/chw/cases/${selectedPatient.id || selectedPatient._id}`)}
                  className="flex-1 py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold"
                >
                  View full case
                </button>
                <button
                  onClick={() => window.open(`tel:${selectedPatient.phone}`)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold"
                >
                  <Phone size={14} className="inline mr-1" />
                  Call now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}