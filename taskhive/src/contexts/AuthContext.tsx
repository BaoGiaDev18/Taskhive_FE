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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

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
        localStorage.removeItem("jwToken");
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={authUser}>{children}</AuthContext.Provider>
  );
};
