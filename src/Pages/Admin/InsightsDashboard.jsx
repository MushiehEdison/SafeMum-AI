import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../Context/AdminAuthContext";
import { useInsightsData } from "../../API/useInsightsData";
import LossGeographyMap from "../../components/admin/LossGeographyMap";
import CareFacilityGapsMap from "../../components/admin/CareFacilityGapsMap";
import FollowUpRatesChart from "../../components/admin/FollowUpRatesChart";
import EmotionalRecoveryChart from "../../components/admin/EmotionalRecoveryChart";
import LLMInsightSummary from "../../components/admin/LLMInsightSummary";
import ReportExportPanel from "../../components/admin/ReportExportPanel";
import {
  LayoutDashboard, MapPin, HeartPulse, CalendarCheck,
  Brain, FileBarChart, LogOut, Shield, Menu, X,
} from "lucide-react";

const NAV = [
  { id: "overview",   icon: LayoutDashboard, label: "Overview"            },
  { id: "geography",  icon: MapPin,           label: "Loss Geography"     },
  { id: "gaps",       icon: HeartPulse,       label: "Care Gaps"          },
  { id: "followup",   icon: CalendarCheck,    label: "Follow-up Rates"    },
  { id: "emotional",  icon: Brain,            label: "Emotional Recovery" },
  { id: "insights",   icon: FileBarChart,     label: "Insights & Reports" },
];

function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-5 pb-4 border-b border-gray-100">
      <h2 className="text-xl font-medium text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

function OverviewSection({ data, loading }) {
  const overview = data?.overview || {};
  
  const KPI_CARDS = [
    { 
      label: "Total cases tracked",  
      value: overview.totalCases || 0, 
      sub: `${overview.totalCasesChange > 0 ? "↑" : "↓"} ${Math.abs(overview.totalCasesChange || 0)}% this month`, 
      subColor: overview.totalCasesChange >= 0 ? "text-green-600" : "text-red-500" 
    },
    { 
      label: "Follow-up rate",       
      value: `${overview.followUpRate || 0}%`,   
      sub: `${overview.followUpChange >= 0 ? "↑" : "↓"} ${Math.abs(overview.followUpChange || 0)}% vs last month`, 
      subColor: overview.followUpChange >= 0 ? "text-green-600" : "text-red-500" 
    },
    { 
      label: "Care gap zones",       
      value: overview.careGapZones || 0,    
      sub: "regions flagged",     
      subColor: "text-gray-400"  
    },
    { 
      label: "High depression risk", 
      value: `${overview.highDepressionPct || 0}%`,   
      sub: `${overview.depressionChange >= 0 ? "↑" : "↓"} ${Math.abs(overview.depressionChange || 0)}% vs last month`, 
      subColor: overview.depressionChange >= 0 ? "text-red-500" : "text-green-600" 
    },
  ];

  if (loading) {
    return (
      <div>
        <PageHeader title="Overview" subtitle="Post-loss analytics · Fully anonymised · Updated daily" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {KPI_CARDS.map((card) => (
            <div key={card.label} className="bg-white border border-gray-100 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-2">{card.label}</p>
              <div className="h-8 flex items-center">
                <div className="animate-pulse bg-gray-200 rounded h-6 w-16"></div>
              </div>
              <div className="h-4 mt-1"><div className="animate-pulse bg-gray-100 rounded h-3 w-20"></div></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Overview" subtitle="Post-loss analytics · Fully anonymised · Updated daily" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {KPI_CARDS.map((card) => (
          <div key={card.label} className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-2">{card.label}</p>
            <p className="text-2xl font-medium text-gray-900">{card.value}</p>
            <p className={`text-xs mt-1 ${card.subColor}`}>{card.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function GeographySection({ data, loading, error }) {
  const geographyData = data?.lossGeography || [];
  
  const totals = {
    miscarriage: geographyData.reduce((s, r) => s + (r.miscarriage || 0), 0),
    ectopic: geographyData.reduce((s, r) => s + (r.ectopic || 0), 0),
    stillbirth: geographyData.reduce((s, r) => s + (r.stillbirth || 0), 0),
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Loss Geography" subtitle="Miscarriage, ectopic, and stillbirth clusters across tracked regions" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <div className="bg-blue-50 rounded-xl p-4"><div className="animate-pulse"><p className="text-xs font-medium text-blue-700 mb-2">Miscarriage cases</p><div className="h-8 w-20 bg-gray-200 rounded"></div></div></div>
          <div className="bg-orange-50 rounded-xl p-4"><div className="animate-pulse"><p className="text-xs font-medium text-orange-700 mb-2">Ectopic cases</p><div className="h-8 w-20 bg-gray-200 rounded"></div></div></div>
          <div className="bg-pink-50 rounded-xl p-4"><div className="animate-pulse"><p className="text-xs font-medium text-pink-700 mb-2">Stillbirth cases</p><div className="h-8 w-20 bg-gray-200 rounded"></div></div></div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5">
          <p className="text-sm text-gray-400 text-center py-8">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Loss Geography"
        subtitle="Miscarriage, ectopic, and stillbirth clusters across tracked regions"
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-xs font-medium text-blue-700 mb-2">Miscarriage cases</p>
          <p className="text-3xl font-medium text-gray-900">{totals.miscarriage.toLocaleString()}</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4">
          <p className="text-xs font-medium text-orange-700 mb-2">Ectopic cases</p>
          <p className="text-3xl font-medium text-gray-900">{totals.ectopic.toLocaleString()}</p>
        </div>
        <div className="bg-pink-50 rounded-xl p-4">
          <p className="text-xs font-medium text-pink-700 mb-2">Stillbirth cases</p>
          <p className="text-3xl font-medium text-gray-900">{totals.stillbirth.toLocaleString()}</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <LossGeographyMap data={data} loading={loading} error={error} />
      </div>
    </div>
  );
}

function GapsSection({ data, loading, error }) {
  const gaps = data?.facilityGaps || [];
  
  const criticalCount = gaps.filter((r) => r.pct >= 65).length;
  const moderateCount = gaps.filter((r) => r.pct >= 40 && r.pct < 65).length;
  const manageableCount = gaps.filter((r) => r.pct < 40).length;

  if (loading) {
    return (
      <div>
        <PageHeader title="Care Facility Gaps" subtitle="% of population with no post-loss facility within 30 km" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <div className="bg-red-50 rounded-xl p-4"><div className="animate-pulse"><p className="text-xs font-medium text-red-600 mb-2">Critical</p><div className="h-8 w-16 bg-gray-200 rounded"></div></div></div>
          <div className="bg-amber-50 rounded-xl p-4"><div className="animate-pulse"><p className="text-xs font-medium text-amber-600 mb-2">Moderate</p><div className="h-8 w-16 bg-gray-200 rounded"></div></div></div>
          <div className="bg-green-50 rounded-xl p-4"><div className="animate-pulse"><p className="text-xs font-medium text-green-600 mb-2">Manageable</p><div className="h-8 w-16 bg-gray-200 rounded"></div></div></div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5">
          <p className="text-sm text-gray-400 text-center py-8">Loading gap data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Care Facility Gaps"
        subtitle="% of population with no post-loss facility within 30 km — output for ministries & NGOs"
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-xs font-medium text-red-600 mb-2">Critical (&gt;65%)</p>
          <p className="text-3xl font-medium text-gray-900">{criticalCount}</p>
          <p className="text-xs text-gray-400 mt-1">regions</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-xs font-medium text-amber-600 mb-2">Moderate (40–65%)</p>
          <p className="text-3xl font-medium text-gray-900">{moderateCount}</p>
          <p className="text-xs text-gray-400 mt-1">regions</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-xs font-medium text-green-600 mb-2">Manageable (&lt;40%)</p>
          <p className="text-3xl font-medium text-gray-900">{manageableCount}</p>
          <p className="text-xs text-gray-400 mt-1">regions</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <CareFacilityGapsMap data={data} loading={loading} error={error} />
      </div>
    </div>
  );
}

function FollowUpSection({ data, loading, error }) {
  const split = data?.followUp?.attendanceSplit || [];
  const returned = split.find((d) => d.name === "Returned")?.value || 0;
  const noShow = split.find((d) => d.name === "No-show")?.value || 0;

  if (loading) {
    return (
      <div>
        <PageHeader title="Follow-up Rates" subtitle="Women who returned for post-loss appointments vs those lost to follow-up" />
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-green-50 rounded-xl p-4"><div className="animate-pulse"><p className="text-xs font-medium text-green-700 mb-2">Returned</p><div className="h-10 w-20 bg-gray-200 rounded"></div></div></div>
          <div className="bg-red-50 rounded-xl p-4"><div className="animate-pulse"><p className="text-xs font-medium text-red-600 mb-2">Did not return</p><div className="h-10 w-20 bg-gray-200 rounded"></div></div></div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5">
          <p className="text-sm text-gray-400 text-center py-8">Loading follow-up data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Follow-up Rates"
        subtitle="Women who returned for post-loss appointments vs those lost to follow-up"
      />
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-xs font-medium text-green-700 mb-2">Returned for follow-up</p>
          <p className="text-4xl font-medium text-gray-900">{returned}%</p>
          <p className="text-xs text-gray-400 mt-1">of discharged women</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-xs font-medium text-red-600 mb-2">Did not return</p>
          <p className="text-4xl font-medium text-gray-900">{noShow}%</p>
          <p className="text-xs text-gray-400 mt-1">lost to follow-up</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <FollowUpRatesChart data={data} loading={loading} error={error} />
      </div>
    </div>
  );
}

function EmotionalSection({ data, loading, error }) {
  const emotionalData = data?.emotionalHealth?.regionalData || [];
  const flaggedCount = data?.flaggedForCounsellor || 0;
  const trajectory = data?.emotionalHealth?.recoveryTrajectory || [];
  
  const highestRisk = emotionalData.reduce(
    (max, r) => r.depression > (max?.depression || 0) ? r : max,
    emotionalData[0]
  );

  const week6 = trajectory.find(w => w.week === "Wk6")?.score || 0;
  const recoveryMilestone = week6 > 0 ? `${week6}%` : "Week 6";

  if (loading) {
    return (
      <div>
        <PageHeader title="Emotional Recovery" subtitle="Depression & trauma rates from SafeRecovery Hub check-ins" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <div className="bg-pink-50 rounded-xl p-4"><div className="animate-pulse"><p className="text-xs font-medium text-pink-600 mb-2">Highest depression region</p><div className="h-8 w-24 bg-gray-200 rounded"></div></div></div>
          <div className="bg-purple-50 rounded-xl p-4"><div className="animate-pulse"><p className="text-xs font-medium text-purple-600 mb-2">Recovery milestone</p><div className="h-8 w-20 bg-gray-200 rounded"></div></div></div>
          <div className="bg-gray-50 rounded-xl p-4"><div className="animate-pulse"><p className="text-xs font-medium text-gray-600 mb-2">Flagged for counsellor</p><div className="h-8 w-16 bg-gray-200 rounded"></div></div></div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5">
          <p className="text-sm text-gray-400 text-center py-8">Loading emotional data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Emotional Recovery"
        subtitle="Depression & trauma rates from SafeRecovery Hub check-ins · Regional breakdown"
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="bg-pink-50 rounded-xl p-4">
          <p className="text-xs font-medium text-pink-600 mb-2">Highest depression region</p>
          <p className="text-xl sm:text-2xl font-medium text-gray-900">{highestRisk?.region || "—"}</p>
          <p className="text-xs text-gray-400 mt-1">{highestRisk?.depression || 0}% high-risk</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <p className="text-xs font-medium text-purple-600 mb-2">Recovery milestone</p>
          <p className="text-2xl font-medium text-gray-900">{recoveryMilestone}</p>
          <p className="text-xs text-gray-400 mt-1">median stabilisation point</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-600 mb-2">Flagged for counsellor</p>
          <p className="text-2xl font-medium text-gray-900">{flaggedCount}</p>
          <p className="text-xs text-gray-400 mt-1">active referrals</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <EmotionalRecoveryChart data={data} loading={loading} error={error} />
      </div>
    </div>
  );
}

function InsightsSection({ data, loading, error, refetch }) {
  return (
    <div>
      <PageHeader
        title="Insights & Reports"
        subtitle="AI-generated findings and exportable reports for health organisations and donors"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <LLMInsightSummary data={data} loading={loading} error={error} refetch={refetch} />
        <ReportExportPanel />
      </div>
    </div>
  );
}

// Mobile Bottom Navigation Component
function MobileBottomNav({ active, onTabChange, onMenuClick, isSidebarOpen }) {
  const mobileNav = NAV.slice(0, 5);
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileNav.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
              active === id
                ? "text-gray-900"
                : "text-gray-400"
            }`}
          >
            <Icon size={20} strokeWidth={active === id ? 2 : 1.5} />
            <span className="text-[10px] mt-1 font-medium">{label.split(" ")[0]}</span>
          </button>
        ))}
        <button
          onClick={onMenuClick}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
            isSidebarOpen ? "text-gray-900" : "text-gray-400"
          }`}
        >
          <Menu size={20} strokeWidth={isSidebarOpen ? 2 : 1.5} />
          <span className="text-[10px] mt-1 font-medium">Menu</span>
        </button>
      </div>
    </div>
  );
}

// Mobile Sidebar Drawer
function MobileSidebar({ isOpen, onClose, active, onTabChange, admin, onLogout }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-50 md:hidden transition-opacity duration-300"
        onClick={onClose}
      />
      
      <div className="fixed top-0 left-0 bottom-0 w-72 bg-gray-950 z-50 shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto">
        <div className="sticky top-0 bg-gray-950 px-5 py-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
              <Shield size={14} className="text-gray-950" />
            </div>
            <div>
              <p className="text-white text-sm font-medium leading-none">SafeMum AI</p>
              <p className="text-gray-500 text-xs mt-0.5">Admin Console</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        <nav className="px-3 py-4 space-y-0.5">
          {NAV.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => {
                onTabChange(id);
                onClose();
              }}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                active === id
                  ? "bg-white text-gray-950 font-medium"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800 mt-auto">
          <div className="px-3 py-2 mb-1">
            <p className="text-xs text-gray-400 truncate">{admin?.email || "admin@safemum.ai"}</p>
            <p className="text-xs text-gray-600 capitalize">{admin?.role || "admin"}</p>
          </div>
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}

// Desktop Sidebar
function DesktopSidebar({ active, onTabChange, admin, onLogout }) {
  return (
    <aside className="hidden md:flex md:w-56 min-h-screen bg-gray-950 flex-col fixed top-0 left-0">
      <div className="px-5 py-6 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <Shield size={14} className="text-gray-950" />
          </div>
          <div>
            <p className="text-white text-sm font-medium leading-none">SafeMum AI</p>
            <p className="text-gray-500 text-xs mt-0.5">Admin Console</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
              active === id
                ? "bg-white text-gray-950 font-medium"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs text-gray-400 truncate">{admin?.email || "admin@safemum.ai"}</p>
          <p className="text-xs text-gray-600 capitalize">{admin?.role || "admin"}</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default function InsightsDashboard() {
  const [active, setActive] = useState("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { data, loading, error, refetch } = useInsightsData();
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/admin/login");
  }

  const handleTabChange = (id) => {
    setActive(id);
    if (id === "insights") {
      refetch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      {/* Desktop Sidebar */}
      <DesktopSidebar 
        active={active} 
        onTabChange={handleTabChange} 
        admin={admin} 
        onLogout={handleLogout} 
      />

      {/* Mobile Sidebar Drawer */}
      <MobileSidebar 
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        active={active}
        onTabChange={handleTabChange}
        admin={admin}
        onLogout={handleLogout}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        active={active} 
        onTabChange={handleTabChange}
        onMenuClick={() => setMobileSidebarOpen(true)}
        isSidebarOpen={mobileSidebarOpen}
      />

      {/* Main Content */}
      <div className="md:ml-56 px-4 sm:px-6 md:px-8 py-6 md:py-8 pb-20 md:pb-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
            <p className="text-sm text-red-600">⚠️ Failed to load insights data</p>
            <p className="text-xs text-red-400 mt-1">{error}</p>
          </div>
        )}

        {active === "overview"  && <OverviewSection  data={data} loading={loading} />}
        {active === "geography" && <GeographySection data={data} loading={loading} error={error} />}
        {active === "gaps"      && <GapsSection      data={data} loading={loading} error={error} />}
        {active === "followup"  && <FollowUpSection  data={data} loading={loading} error={error} />}
        {active === "emotional" && <EmotionalSection data={data} loading={loading} error={error} />}
        {active === "insights"  && <InsightsSection  data={data} loading={loading} error={error} refetch={refetch} />}
      </div>
    </div>
  );
}