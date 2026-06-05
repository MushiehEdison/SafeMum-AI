import { Navigate, useLocation } from "react-router-dom";
import { useUserAuth }     from "../Context/UserAuthContext";
import { useCHWAuth }      from "../Context/CHWAuthContext";
import { useFacilityAuth } from "../Context/FacilityAuthContext";
import { useAdminAuth }    from "../Context/AdminAuthContext";
import { Loader } from "lucide-react";

const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f4f3f0" }}>
    <Loader size={24} className="animate-spin" color="#aaa" />
  </div>
);

export function PatientRoute({ children }) {
  const { user, loading } = useUserAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/auth/patient" state={{ from: location }} replace />;
  return children;
}

export function CHWRoute({ children }) {
  const { chw, loading } = useCHWAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!chw) return <Navigate to="/auth/chw" state={{ from: location }} replace />;
  return children;
}

export function FacilityRoute({ children }) {
  const { facility, loading } = useFacilityAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!facility) return <Navigate to="/auth/facility" state={{ from: location }} replace />;
  return children;
}

export function AdminRoute({ children }) {
  const { admin, loading } = useAdminAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!admin) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return children;
}