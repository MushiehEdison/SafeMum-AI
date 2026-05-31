import { createContext, useContext, useState, useEffect } from "react";
import API from "../API/axios";

const FacilityAuthContext = createContext(null);

export function FacilityAuthProvider({ children }) {
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await API.get("/api/facility/auth/me");
        setFacility(res.data.data);          // ← was res.data.facility
      } catch {
        setFacility(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const register = async (formData) => {
    const res = await API.post("/api/facility/auth/register", formData);
    return res.data;
  };

  const login = async (email, password) => {
    const res = await API.post("/api/facility/auth/login", { email, password });
    setFacility(res.data.data);              // ← was res.data.facility
    return res.data;
  };

  const logout = async () => {
    try {
      await API.post("/api/facility/auth/logout");
    } finally {
      setFacility(null);
    }
  };

  const updateFacility = (updatedData) => {
    setFacility((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <FacilityAuthContext.Provider
      value={{ facility, loading, register, login, logout, updateFacility }}
    >
      {children}
    </FacilityAuthContext.Provider>
  );
}

export function useFacilityAuth() {
  const ctx = useContext(FacilityAuthContext);
  if (ctx === null) throw new Error("useFacilityAuth must be used inside <FacilityAuthProvider>");
  return ctx;
}

export { FacilityAuthContext };