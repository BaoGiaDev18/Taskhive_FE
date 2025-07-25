import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export interface AuthUser {
  userId: number;
  email: string;
  role: string;
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
}

const AuthContext = createContext<AuthUser | null>(null);

export const useAuth = () => useContext(AuthContext);

// ✅ Export thêm function để trigger refresh
export const refreshAuth = () => {
  window.dispatchEvent(new CustomEvent("refreshAuth"));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // ✅ Thêm trigger

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        setAuthUser({
          userId: parseInt(decoded.sub),
          email: decoded.email,
          role: decoded.role,
        });
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("jwtToken");
        setAuthUser(null);
      }
    } else {
      setAuthUser(null);
    }
  }, [refreshTrigger]); // ✅ Depend on refreshTrigger

  // ✅ Listen for refresh event
  useEffect(() => {
    const handleRefresh = () => setRefreshTrigger((prev) => prev + 1);
    window.addEventListener("refreshAuth", handleRefresh);
    return () => window.removeEventListener("refreshAuth", handleRefresh);
  }, []);

  return (
    <AuthContext.Provider value={authUser}>{children}</AuthContext.Provider>
  );
};
