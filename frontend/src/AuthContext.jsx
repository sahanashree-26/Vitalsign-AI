import React, { createContext, useContext, useState } from "react";
import client from "./api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("vitalsignai_user");
    return stored ? JSON.parse(stored) : null;
  });

  async function login(email, password) {
    const res = await client.post("/auth/login", { email, password });
    localStorage.setItem("vitalsignai_token", res.data.access_token);
    localStorage.setItem("vitalsignai_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }

  function logout() {
    localStorage.removeItem("vitalsignai_token");
    localStorage.removeItem("vitalsignai_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
