import { createContext, useContext, useState, useEffect } from "react";
import API from "../API/axios";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await API.get("/api/admin/auth/me");
        setAdmin(res.data.admin);
      } catch {
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await API.post("/api/admin/auth/login", { email, password });
    setAdmin(res.data.admin);
    return res.data;
  };

  const logout = async () => {
    try {
      await API.post("/api/admin/auth/logout");
    } finally {
      setAdmin(null);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{ admin, loading, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

export { AdminAuthContext };