import { createContext, useContext, useState, useEffect } from "react";
import API from "../API/axios";

const CHWAuthContext = createContext(null);

export function CHWAuthProvider({ children }) {
  const [chw, setCHW] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await API.get("/api/chw/auth/me");
        setCHW(res.data.data);          // matches backend: {"message":"ok","data":{...}}
      } catch {
        setCHW(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const register = async (formData) => {
    const res = await API.post("/api/chw/auth/register", formData);
    // Registration does NOT log in — account is pending verification.
    // Caller can read res.data.message to show a confirmation message if needed.
    return res.data;
  };

  const login = async (email, password) => {
    const res = await API.post("/api/chw/auth/login", { email, password });
    setCHW(res.data.data);              // matches backend: {"message":"...","data":{...}}
    return res.data;
  };

  const logout = async () => {
    try {
      await API.post("/api/chw/auth/logout");
    } finally {
      setCHW(null);
    }
  };

  const updateCHW = (updatedData) => {
    setCHW((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <CHWAuthContext.Provider
      value={{ chw, loading, register, login, logout, updateCHW }}
    >
      {children}
    </CHWAuthContext.Provider>
  );
}

export function useCHWAuth() {
  return useContext(CHWAuthContext);
}

export { CHWAuthContext };