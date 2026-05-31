import { Navigate, useLocation } from "react-router-dom";
import { useUserAuth }     from "../Context/UserAuthContext";
import { useCHWAuth }      from "../Context/CHWAuthContext";
import { useFacilityAuth } from "../Context/FacilityAuthContext";
import { Loader } from "lucide-react";

export function PatientRoute({ children }) {
  const { user, loading } = useUserAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f4f3f0" }}>
        <Loader size={24} className="animate-spin" color="#aaa" />
      </div>
    );
  }
  
  if (!user) return <Navigate to="/auth/patient" state={{ from: location }} replace />;
  return children;
}

export function CHWRoute({ children }) {
  const { chw, loading } = useCHWAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f4f3f0" }}>
        <Loader size={24} className="animate-spin" color="#aaa" />
      </div>
    );
  }
  
  if (!chw) return <Navigate to="/auth/chw" state={{ from: location }} replace />;
  return children;
}

export function FacilityRoute({ children }) {
  const { facility, loading } = useFacilityAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f4f3f0" }}>
        <Loader size={24} className="animate-spin" color="#aaa" />
      </div>
    );
  }
  
  if (!facility) return <Navigate to="/auth/facility" state={{ from: location }} replace />;
  return children;
}