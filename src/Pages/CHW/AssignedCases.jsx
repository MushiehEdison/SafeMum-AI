import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Search, MapPin, Clock, LayoutDashboard, FolderOpen,
  User, Bell, AlertTriangle, ChevronRight, Filter, X,
  Phone, Calendar, MessageCircle, Heart, CheckCircle2
} from "lucide-react";
import NavCHW from "../../Components/NavCHW";

const dummyCases = [
  {
    id: 1,
    patientFirstName: "Sarah",
    location: "Parklands",
    daysSinceLoss: 21,
    riskLevel: "High",
    status: "New",
    flagReason: "3 consecutive very low mood check-ins",
    daysSinceAssigned: 1,
    lastContact: null,
    phone: "+254700000001"
  },
  {
    id: 2,
    patientFirstName: "Amara",
    location: "Kibera",
    daysSinceLoss: 14,
    riskLevel: "Moderate",
    status: "Contacted",
    flagReason: "Missed follow-up appointment",
    daysSinceAssigned: 3,
    lastContact: "Yesterday",
    phone: "+254700000002"
  },
  {
    id: 3,
    patientFirstName: "Fatuma",
    location: "Eastleigh",
    daysSinceLoss: 7,
    riskLevel: "Low",
    status: "Visited",
    flagReason: "First week post-loss check — recovery on track",
    daysSinceAssigned: 5,
    lastContact: "2 days ago",
    phone: "+254700000003"
  },
  {
    id: 4,
    patientFirstName: "Wanjiru",
    location: "Westlands",
    daysSinceLoss: 45,
    riskLevel: "Low",
    status: "Resolved",
    flagReason: "Emotional support follow-up — patient discharged",
    daysSinceAssigned: 14,
    lastContact: "5 days ago",
    phone: "+254700000004"
  },
  {
    id: 5,
    patientFirstName: "Blessing",
    location: "Kasarani",
    daysSinceLoss: 10,
    riskLevel: "High",
    status: "Escalated",
    flagReason: "High risk symptom reported — referred to hospital",
    daysSinceAssigned: 2,
    lastContact: "Today",
    phone: "+254700000005"
  }
];

const STATUS_FILTERS = ["All", "New", "Contacted", "Visited", "Escalated", "Resolved"];

const statusConfig = {
  New: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  Contacted: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  Visited: { color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  Escalated: { color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  Resolved: { color: "text-green-600", bg: "bg-green-50", border: "border-green-200" }
};

const riskConfig = {
  High: { color: "text-red-700", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-500" },
  Moderate: { color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500" },
  Low: { color: "text-green-700", bg: "bg-green-50", border: "border-green-200", dot: "bg-green-500" }
};

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-gray-300 mb-3 font-['Manrope']">
      {children}
    </p>
  );
}

export default function AssignedCases() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const activeCaseCount = dummyCases.filter(c => c.status !== "Resolved").length;

  const filtered = dummyCases.filter(c => {
    const matchFilter = activeFilter === "All" || c.status === activeFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || 
      c.patientFirstName.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.flagReason.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const showEmpty = filtered.length === 0;

  const getStatusStyles = (status) => statusConfig[status] || statusConfig.New;
  const getRiskStyles = (risk) => riskConfig[risk] || riskConfig.Moderate;

  const handleContact = (caseId) => {
    navigate(`/chw/cases/${caseId}/contact`);
  };

  const handleViewDetails = (caseId) => {
    navigate(`/chw/cases/${caseId}`);
  };

  return (
    <>
      <NavCHW />

      <div className="min-h-screen bg-gray-50 font-['Manrope'] pb-28">
        <div className="md:ml-64">
          
          {/* Header */}
          <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 md:px-6 py-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <button 
                  onClick={() => navigate("/chw/dashboard")}
                  className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition"
                >
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">My Cases</h1>
                <div className="w-9" />
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500">
                  {activeCaseCount} active case{activeCaseCount !== 1 ? "s" : ""}
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-[10px] text-gray-400">Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filters Bar */}
          <div className="sticky top-[73px] z-30 bg-gray-50 border-b border-gray-100 px-4 md:px-6 py-3">
            <div className="max-w-7xl mx-auto">
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-gray-100 px-3 py-2 shadow-sm">
                  <Search size={16} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, location, or flag reason..."
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
                    showFilters || activeFilter !== "All"
                      ? "bg-gray-900 border-gray-900 text-white"
                      : "bg-white border-gray-100 text-gray-600"
                  }`}
                >
                  <Filter size={16} />
                </button>
              </div>

              {/* Filter Pills */}
              {(showFilters || activeFilter !== "All") && (
                <div className="flex gap-2 overflow-x-auto pb-1 mt-3 scrollbar-hide">
                  {STATUS_FILTERS.map(f => (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                        activeFilter === f
                          ? "bg-gray-900 text-white"
                          : "bg-white text-gray-600 border border-gray-200"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cases List */}
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            {showEmpty ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">
                  {searchQuery
                    ? "No cases match your search."
                    : `No ${activeFilter === "All" ? "" : activeFilter + " "}cases right now.`}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {searchQuery ? "Try a different search term" : "All caught up!"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(c => {
                  const statusStyles = getStatusStyles(c.status);
                  const riskStyles = getRiskStyles(c.riskLevel);
                  const isResolved = c.status === "Resolved";
                  
                  return (
                    <div 
                      key={c.id} 
                      className={`bg-white rounded-xl border shadow-sm transition-all hover:shadow-md ${
                        isResolved ? "border-gray-100 opacity-75" : "border-gray-100"
                      }`}
                    >
                      <div className="p-4">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${riskStyles.dot}`} />
                            <p className="font-bold text-gray-900">{c.patientFirstName}</p>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyles.bg} ${statusStyles.color} border ${statusStyles.border}`}>
                              {c.status}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${riskStyles.bg} ${riskStyles.color} border ${riskStyles.border}`}>
                              {c.riskLevel} risk
                            </span>
                          </div>
                          {c.status === "New" && (
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                              <span className="text-[10px] font-medium text-red-500">New</span>
                            </div>
                          )}
                        </div>

                        {/* Flag Reason */}
                        <p className="text-sm text-gray-600 mb-3 leading-relaxed">{c.flagReason}</p>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 mb-3">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-500">{c.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-500">{c.daysSinceLoss} days post-loss</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-500">Assigned {c.daysSinceAssigned} day{c.daysSinceAssigned !== 1 ? "s" : ""} ago</span>
                          </div>
                          {c.lastContact && (
                            <div className="flex items-center gap-1.5">
                              <Phone size={12} className="text-gray-400" />
                              <span className="text-xs text-gray-500">Last contact: {c.lastContact}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-1">
                            <Heart size={12} className="text-gray-400" />
                            <span className="text-[11px] text-gray-400">
                              {c.status === "Resolved" ? "Case closed" : "Active follow-up"}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {c.status !== "Resolved" && c.status !== "Escalated" && (
                              <button
                                onClick={() => handleContact(c.id)}
                                className="px-3 py-1.5 rounded-lg border border-green-500 bg-white text-green-600 text-xs font-semibold hover:bg-green-50 transition"
                              >
                                <Phone size={11} className="inline mr-1" />
                                Contact
                              </button>
                            )}
                            <button
                              onClick={() => handleViewDetails(c.id)}
                              className="px-3 py-1.5 rounded-lg border border-gray-900 bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition"
                            >
                              View details
                              <ChevronRight size={11} className="inline ml-1" />
                            </button>
                          </div>
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
    </>
  );
}