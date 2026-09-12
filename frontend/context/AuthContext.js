"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import api from "@/lib/api";

const AuthContext = createContext({
  user: null,
  admin: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
  login: () => {},
  logout: () => {},
  logoutAdmin: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate auth state on mount
  useEffect(() => {
    const hydrateAuth = async () => {
      try {
        const adminToken =
          Cookies.get("prayaas_admin_token") ||
          (typeof window !== "undefined"
            ? localStorage.getItem("prayaas_admin_token")
            : null);

        const userToken =
          Cookies.get("prayaas_user_token") ||
          (typeof window !== "undefined"
            ? localStorage.getItem("prayaas_token")
            : null);

        if (adminToken) {
          try {
            const res = await api.get("/api/admin/me", {
              headers: { Authorization: `Bearer ${adminToken}` },
            });
            if (res.data && res.data.admin) {
              setAdmin(res.data.admin);
            }
          } catch (err) {
            console.warn("Admin token expired or invalid");
            Cookies.remove("prayaas_admin_token");
            if (typeof window !== "undefined") {
              localStorage.removeItem("prayaas_admin_token");
              localStorage.removeItem("prayaas_admin_data");
            }
          }
        }

        if (userToken) {
          try {
            const res = await api.get("/api/auth/me", {
              headers: { Authorization: `Bearer ${userToken}` },
            });
            if (res.data && res.data.user) {
              setUser(res.data.user);
            }
          } catch (err) {
            console.warn("User token expired or invalid");
            Cookies.remove("prayaas_user_token");
            if (typeof window !== "undefined") {
              localStorage.removeItem("prayaas_token");
              localStorage.removeItem("prayaas_user_data");
            }
          }
        }
      } catch (err) {
        console.error("Auth hydration error:", err);
      } finally {
        setLoading(false);
      }
    };

    hydrateAuth();
  }, []);

  const login = (token, userData, role = "user") => {
    if (role === "admin") {
      Cookies.set("prayaas_admin_token", token, { expires: 7, sameSite: "Lax" });
      if (typeof window !== "undefined") {
        localStorage.setItem("prayaas_admin_token", token);
        localStorage.setItem("prayaas_admin_data", JSON.stringify(userData));
      }
      setAdmin(userData);
    } else {
      Cookies.set("prayaas_user_token", token, { expires: 7, sameSite: "Lax" });
      if (typeof window !== "undefined") {
        localStorage.setItem("prayaas_token", token);
        localStorage.setItem("prayaas_user_data", JSON.stringify(userData));
      }
      setUser(userData);
    }
  };

  const logout = () => {
    Cookies.remove("prayaas_user_token");
    if (typeof window !== "undefined") {
      localStorage.removeItem("prayaas_token");
      localStorage.removeItem("prayaas_user_data");
    }
    setUser(null);
  };

  const logoutAdmin = () => {
    Cookies.remove("prayaas_admin_token");
    if (typeof window !== "undefined") {
      localStorage.removeItem("prayaas_admin_token");
      localStorage.removeItem("prayaas_admin_data");
    }
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin: Boolean(admin && admin.role === "admin"),
        login,
        logout,
        logoutAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
