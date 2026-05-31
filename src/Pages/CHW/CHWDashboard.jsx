import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, AlertTriangle, TrendingUp, TrendingDown, MapPin,
  Navigation, ChevronRight, ArrowUpRight, Clock, CheckCircle2,
  User, Heart, Activity, Calendar, Phone, MessageCircle, Loader,
} from "lucide-react";
import NavCHW from "../../Components/NavCHW";
import { CHWAuthContext } from "../../Context/CHWAuthContext";
import { getCHWDashboard } from "../../API/chw";

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

export default function CHWDashboard() {
  const navigate = useNavigate();
  const { chw, updateCHW } = useContext(CHWAuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(chw?.isAvailable ?? true);
  const [toast, setToast] = useState({ visible: false, message: "" });

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await getCHWDashboard();
        setDashboardData(res.data.data || res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const showToast = (msg) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: "" }), 2000);
  };

  const handleToggleAvailability = () => {
    setIsAvailable(!isAvailable);
    showToast(isAvailable ? "You are now unavailable" : "You are now available");
  };

  const handleViewCase = (caseId) => {
    navigate(`/chw/cases/${caseId}`);
  };

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

  const stats = dashboardData?.stats || {};
  const urgentCases = dashboardData?.urgentCases || [];
  const recentActivity = dashboardData?.recentActivity || [];
  const schedule = dashboardData?.schedule || [];
  const chwName = chw?.name || dashboardData?.chw?.name || "Grace";

  const statCards = [
    { label: "Active cases", value: stats.activeCases ?? 0, key: "activeCases", highlight: (stats.activeCases ?? 0) > 3 },
    { label: "Resolved this week", value: stats.resolvedThisWeek ?? 0, key: "resolvedThisWeek" },
    { label: "Escalated this month", value: stats.escalatedThisMonth ?? 0, key: "escalatedThisMonth" },
    { label: "Contacted today", value: stats.contactedToday ?? 0, key: "contactedToday" },
  ];

  const getActivityIcon = (type) => {
    switch(type) {
      case "update": return <Activity size={12} className="text-blue-500" />;
      case "contact": return <Phone size={12} className="text-green-500" />;
      case "assign": return <User size={12} className="text-purple-500" />;
      case "resolve": return <CheckCircle2 size={12} className="text-green-500" />;
      case "escalate": return <AlertTriangle size={12} className="text-red-500" />;
      default: return <Clock size={12} className="text-gray-400" />;
    }
  };

  return (
    <>
      <NavCHW />

      <div className="min-h-screen bg-gray-50 font-['Manrope'] pb-28">
        <div className="md:ml-64">
          
          {/* Top Bar */}
          <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 md:px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-gray-300 mb-1">
                  {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                </p>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {chwName.split(" ")[0]}
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  {chw?.speciality || dashboardData?.chw?.speciality} · {chw?.coverageArea || dashboardData?.chw?.coverageArea}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleAvailability}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    isAvailable 
                      ? "bg-gray-900 text-white" 
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                  }`}
                >
                  {isAvailable ? "Available" : "Unavailable"}
                </button>
                <button 
                  onClick={() => navigate("/chw/notifications")}
                  className="relative p-2 rounded-full hover:bg-gray-100 transition"
                >
                  <Bell size={20} className="text-gray-600" />
                  {urgentCases.length > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Unavailable Banner */}
          {!isAvailable && (
            <div className="bg-amber-50 border-b border-amber-100 px-4 md:px-6 py-3">
              <div className="max-w-7xl mx-auto flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-600" />
                <p className="text-xs text-amber-700 font-medium">
                  You are set to unavailable. No new cases will be assigned to you.
                </p>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-8">

            {/* Stats Grid */}
            <div>
              <SectionLabel>Overview</SectionLabel>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {statCards.map(({ label, value, key }) => {
                  const trend = stats.trends?.[key];
                  const isUp = trend?.direction === "up";
                  return (
                    <div key={key} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                      <p className="text-[11px] text-gray-400 font-medium mb-2">{label}</p>
                      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
                      {trend && (
                        <div className="flex items-center gap-1.5">
                          {isUp ? (
                            <TrendingUp size={12} className="text-green-500" />
                          ) : (
                            <TrendingDown size={12} className="text-red-500" />
                          )}
                          <span className={`text-[11px] font-semibold ${isUp ? "text-green-600" : "text-red-600"}`}>
                            {trend.percent}%
                          </span>
                          <span className="text-[11px] text-gray-400">vs last week</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Today's Schedule */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <SectionLabel>Today's schedule</SectionLabel>
                <button 
                  onClick={() => navigate("/chw/schedule")}
                  className="text-xs font-semibold text-green-600 hover:text-green-700 transition flex items-center gap-1"
                >
                  View all <ChevronRight size={12} />
                </button>
              </div>
              {schedule.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
                  <Calendar size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No visits scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {schedule.map(item => (
                    <div key={item.id || item._id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                            <Calendar size={18} className="text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{item.patient}</p>
                            <p className="text-xs text-gray-500">{item.type} · {item.address}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{item.time}</p>
                          <button className="text-xs text-green-600 font-medium mt-1">Start visit</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Needs Attention */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <SectionLabel>Needs attention</SectionLabel>
                <button 
                  onClick={() => navigate("/chw/cases")}
                  className="text-xs font-semibold text-green-600 hover:text-green-700 transition flex items-center gap-1"
                >
                  See all <ChevronRight size={12} />
                </button>
              </div>
              {urgentCases.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                  <CheckCircle2 size={32} className="text-green-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No urgent cases right now. All caught up!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {urgentCases.map(c => (
                    <div 
                      key={c.id || c._id} 
                      className={`bg-white rounded-xl border border-gray-100 p-4 shadow-sm transition-all ${
                        c.riskLevel === "High" ? "border-l-4 border-l-red-500" : "border-l-4 border-l-gray-400"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg ${
                            c.riskLevel === "High" ? "bg-red-50" : "bg-gray-100"
                          } flex items-center justify-center`}>
                            <AlertTriangle size={14} className={c.riskLevel === "High" ? "text-red-500" : "text-gray-500"} />
                          </div>
                          <p className="font-bold text-gray-900">{c.patientFirstName}</p>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          c.riskLevel === "High" 
                            ? "bg-red-500 text-white" 
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}>
                          {c.riskLevel}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{c.flagReason}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock size={11} className="text-gray-400" />
                          <span className="text-xs text-gray-400">
                            Assigned {c.daysSinceAssigned} day{c.daysSinceAssigned !== 1 ? "s" : ""} ago
                          </span>
                        </div>
                        <button 
                          onClick={() => handleViewCase(c.id || c._id)}
                          className="px-3 py-1.5 rounded-lg border border-gray-900 bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition"
                        >
                          View case
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity Timeline */}
            <div>
              <SectionLabel>Recent activity</SectionLabel>
              {recentActivity.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
                  <Clock size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No recent activity</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                  {recentActivity.map((item, idx) => (
                    <div key={item.id || item._id || idx} className="flex gap-3 pb-4 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5" />
                        {idx < recentActivity.length - 1 && (
                          <div className="w-px flex-1 bg-gray-100 mt-1 min-h-[24px]" />
                        )}
                      </div>
                      <div className="flex-1 flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getActivityIcon(item.type)}
                          <p className="text-sm text-gray-700">{item.action}</p>
                        </div>
                        <span className="text-xs text-gray-400 ml-4">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div>
              <SectionLabel>Quick actions</SectionLabel>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button 
                  onClick={() => navigate("/chw/cases")}
                  className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-md transition"
                >
                  <Activity size={20} className="text-blue-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-900">View all cases</p>
                </button>
                <button 
                  onClick={() => navigate("/chw/patients")}
                  className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-md transition"
                >
                  <Heart size={20} className="text-red-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-900">My patients</p>
                </button>
                <button 
                  onClick={() => navigate("/chw/schedule")}
                  className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-md transition"
                >
                  <Calendar size={20} className="text-purple-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-900">Schedule</p>
                </button>
                <button 
                  onClick={() => navigate("/chw/messages")}
                  className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-md transition"
                >
                  <MessageCircle size={20} className="text-green-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-900">Messages</p>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
}