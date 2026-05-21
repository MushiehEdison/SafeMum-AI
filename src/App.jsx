import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import BottomNav from "./Components/BottomNav";
import MascotTestPage from "./Mascottestpage";

// ── Auth ─────────────────────────────────────────────────────────────────────
// import Login         from "./Pages/Auth/Login";
// import CHWLogin      from "./Pages/Auth/CHWLogin";
// import FacilityLogin from "./Pages/Auth/FacilityLogin";
// import Register      from "./Pages/Auth/Register";

// ── Patient (Users) pages ────────────────────────────────────────────────────
import Home from "./Pages/Users/Home";
import AIAssistant     from "./Pages/Users/AIAssistant";
import EmergencyAlert  from "./Pages/Users/EmergencyAlert";
import MapPage         from "./Pages/Users/Map";
import ReminderSystem  from "./Pages/Users/ReminderSystem";
import SafeRecoveryHub from "./Pages/Users/SafeRecoveryHub";
import Profile from "./Pages/Users/Profile";

// ── Admin pages ──────────────────────────────────────────────────────────────
// import AdminDashboard     from "./Pages/Admin/AdminDashboard";
// import FacilityMgmt       from "./Pages/Admin/FacilityManagement";
// import InsightReports     from "./Pages/Admin/InsightReports";
// import ManageCHW          from "./Pages/Admin/ManageCHW";
// import ManageHC           from "./Pages/Admin/ManageHC";
// import ReferralFailureMap from "./Pages/Admin/ReferralFailureMap";
// import RiskAreaMap        from "./Pages/Admin/RiskAreaMap";

// ── CHW pages ─────────────────────────────────────────────────────────────────
import AssignedCases from "./Pages/CHW/AssignedCases";
import CaseDetail    from "./Pages/CHW/CaseDetail";
import CHWDashboard  from "./Pages/CHW/CHWDashboard";
import CHWProfile    from "./Pages/CHW/CHWProfile";
import CHWPatients from "./Pages/CHW/CHWpatients";
// ── Health Centre pages ───────────────────────────────────────────────────────
import FacilityDashboard  from "./Pages/HealthCenters/FacilityDashboard";
import IncomingAlerts     from "./Pages/HealthCenters/IncomingAlerts";
import FacilityProfile  from "./Pages/HealthCenters/FacilityProfile";
import UpdateCapabilities from "./Pages/HealthCenters/UpdateCapabilities";

// ── Public ────────────────────────────────────────────────────────────────────
// import PublicHome from "./Pages/Public/Home";
// import NotFound   from "./Pages/Public/NotFound";

const PATIENT_PATHS = [
  "/home",
  "/emergency-alert",
  "/map",
  "/reminders",
  "/safe-recovery",
  "/profile",
];

function AppShell() {
  const location = useLocation();
  const showBottomNav = PATIENT_PATHS.some(
    (p) => location.pathname === p || location.pathname.startsWith(p + "/")
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
     
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/mascot-test" element={<MascotTestPage />} />
        
        {/* ── Patient (Users) ── */}
        <Route path="/home" element={<Home />} />
        <Route path="/ai-assistant"    element={<AIAssistant />} />
        <Route path="/emergency-alert" element={<EmergencyAlert />} />
        <Route path="/map"             element={<MapPage />} />
        <Route path="/reminders"       element={<ReminderSystem />} />
        <Route path="/safe-recovery"   element={<SafeRecoveryHub />} />
        <Route path="/profile"        element={<Profile />} />

        {/* ── Admin ── */}
        {/* <Route path="/admin"                   element={<AdminDashboard />} /> */}
        {/* <Route path="/admin/facilities"        element={<FacilityMgmt />} /> */}
        {/* <Route path="/admin/insights"          element={<InsightReports />} /> */}
        {/* <Route path="/admin/manage-chw"        element={<ManageCHW />} /> */}
        {/* <Route path="/admin/manage-hc"         element={<ManageHC />} /> */}
        {/* <Route path="/admin/referral-failures" element={<ReferralFailureMap />} /> */}
        {/* <Route path="/admin/risk-areas"        element={<RiskAreaMap />} /> */}

        {/* ── CHW ── */}
        <Route path="/chw"           element={<CHWDashboard />} />
        <Route path="/chw/cases"     element={<AssignedCases />} />
        <Route path="/chw/cases/:id" element={<CaseDetail />} />
        <Route path="/chw/profile"   element={<CHWProfile />} />
        <Route path="/chw/patients"   element={<CHWPatients />} />

        {/* ── Health Centres ── */}
        <Route path="/facility"              element={<FacilityDashboard />} />
        <Route path="/facility/alerts"       element={<IncomingAlerts />} />
        <Route path="/facility/profile"    element={<FacilityProfile />} />
        <Route path="/facility/capabilities" element={<UpdateCapabilities />} />

        {/* ── 404 ── */}
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>

      {showBottomNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}