import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import BottomNav from "./Components/BottomNav";
import MascotTestPage from "./Mascottestpage";
import { PatientRoute, CHWRoute, FacilityRoute } from "./Components/ProtectedRoute";
import { UserAuthProvider } from "./Context/UserAuthContext";
import { CHWAuthProvider } from "./Context/CHWAuthContext";
import { FacilityAuthProvider } from "./Context/FacilityAuthContext";
import PhoneSimulator from "./Pages/Public/Simulator";

// ── Auth ─────────────────────────────────────────────────────────────────────
import PatientAuth from "./Pages/Auth/Patientauth";
import CHWAuth from "./Pages/Auth/Chwauth";
import FacilityAuth from "./Pages/Auth/Facilityauth";

// ── Patient (Users) pages ────────────────────────────────────────────────────
import Home from "./Pages/Users/Home";
import AIAssistant     from "./Pages/Users/AIAssistant";
import EmergencyAlert  from "./Pages/Users/EmergencyAlert";
import MapPage         from "./Pages/Users/Map";
import ReminderSystem  from "./Pages/Users/ReminderSystem";
import SafeRecoveryHub from "./Pages/Users/SafeRecoveryHub";
import Profile from "./Pages/Users/Profile";

// ── CHW pages ─────────────────────────────────────────────────────────────────
import AssignedCases from "./Pages/CHW/AssignedCases";
import CaseDetail    from "./Pages/CHW/CaseDetail";
import CHWDashboard  from "./Pages/CHW/CHWDashboard";
import CHWProfile    from "./Pages/CHW/CHWProfile";
import CHWPatients from "./Pages/CHW/CHWpatients";
import CHWSchedule from "./Pages/CHW/CHWschedule";

// ── Health Centre pages ───────────────────────────────────────────────────────
import FacilityDashboard  from "./Pages/HealthCenters/FacilityDashboard";
import IncomingAlerts     from "./Pages/HealthCenters/IncomingAlerts";
import FacilityProfile  from "./Pages/HealthCenters/FacilityProfile";
import UpdateCapabilities from "./Pages/HealthCenters/UpdateCapabilities";
import IncomingReferrals from "./Pages/HealthCenters/IncomingReferrals";

// ── Public ────────────────────────────────────────────────────────────────────
import Landing from "./Pages/Public/Landing";

const PATIENT_PATHS = [
  "/home", "/emergency-alert", "/map", "/reminders", "/safe-recovery", "/profile",
];

function AppShell() {
  const location = useLocation();
  const showBottomNav = PATIENT_PATHS.some(
    (p) => location.pathname === p || location.pathname.startsWith(p + "/")
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<Landing />} />
        <Route path="/mascot-test" element={<MascotTestPage />} />
        <Route path="/simulator" element={<PhoneSimulator />} />

        
        {/* ── Auth ── */}
        <Route path="/auth/patient"  element={<PatientAuth />} />
        <Route path="/auth/chw"      element={<CHWAuth />} />
        <Route path="/auth/facility" element={<FacilityAuth />} />

        {/* ── Patient (protected) ── */}
        <Route path="/home"           element={<PatientRoute><Home /></PatientRoute>} />
        <Route path="/ai-assistant"   element={<PatientRoute><AIAssistant /></PatientRoute>} />
        <Route path="/emergency-alert"element={<PatientRoute><EmergencyAlert /></PatientRoute>} />
        <Route path="/map"            element={<PatientRoute><MapPage /></PatientRoute>} />
        <Route path="/reminders"      element={<PatientRoute><ReminderSystem /></PatientRoute>} />
        <Route path="/safe-recovery"  element={<PatientRoute><SafeRecoveryHub /></PatientRoute>} />
        <Route path="/profile"        element={<PatientRoute><Profile /></PatientRoute>} />

        {/* ── CHW (protected) ── */}
        <Route path="/chw"            element={<CHWRoute><CHWDashboard /></CHWRoute>} />
        <Route path="/chw/cases"      element={<CHWRoute><AssignedCases /></CHWRoute>} />
        <Route path="/chw/cases/:id"  element={<CHWRoute><CaseDetail /></CHWRoute>} />
        <Route path="/chw/profile"    element={<CHWRoute><CHWProfile /></CHWRoute>} />
        <Route path="/chw/patients"   element={<CHWRoute><CHWPatients /></CHWRoute>} />
        <Route path="/chw/schedule"   element={<CHWRoute><CHWSchedule /></CHWRoute>} />

        {/* ── Health Centres (protected) ── */}
        <Route path="/facility"              element={<FacilityRoute><FacilityDashboard /></FacilityRoute>} />
        <Route path="/facility/alerts"       element={<FacilityRoute><IncomingAlerts /></FacilityRoute>} />
        <Route path="/facility/profile"      element={<FacilityRoute><FacilityProfile /></FacilityRoute>} />
        <Route path="/facility/capabilities" element={<FacilityRoute><UpdateCapabilities /></FacilityRoute>} />
        <Route path="/facility/referrals"    element={<FacilityRoute><IncomingReferrals /></FacilityRoute>} />
      </Routes>

      {showBottomNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <UserAuthProvider>
        <CHWAuthProvider>
          <FacilityAuthProvider>
            <AppShell />
          </FacilityAuthProvider>
        </CHWAuthProvider>
      </UserAuthProvider>
    </Router>
  );
}