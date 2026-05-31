import { createContext, useContext, useState, useEffect } from "react";
import API from "../API/axios";

const UserAuthContext = createContext(null);

export function UserAuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await API.get("/api/patient/auth/me");
        setUser(res.data.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const verifyOtp = async (phone, countryCode, otp) => {
    const res = await API.post("/api/patient/auth/verify-otp", {
      phone, countryCode, otp,
    });
    setUser(res.data.data);
    return res.data;
  };

  const logout = async () => {
    try {
      await API.post("/api/patient/auth/logout");
    } finally {
      setUser(null);
    }
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <UserAuthContext.Provider
      value={{ user, loading, verifyOtp, logout, updateUser }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(UserAuthContext);
}

export { UserAuthContext };