"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import * as api from "@/lib/api";

interface User {
  id: string;
  email: string;
  createdAt?: string;
  isVerified: boolean;
  plan: "free" | "paid";
  planExpiresAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<api.RegisterResponse>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  upgradeToPaid: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toUser(authUser: api.AuthUser | null | undefined): User | null {
  if (!authUser) return null;
  return {
    id: authUser.id,
    email: authUser.email,
    createdAt: authUser.created_at,
    isVerified: authUser.email_verified ?? true,
    plan: authUser.plan || "free",
    planExpiresAt: authUser.plan_expires_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await api.getMe();
      setUser(toUser(response.user));
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void refresh();
    });
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.login(email, password);
    setUser(toUser(response.user));
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    const response = await api.register(email, password);
    // Don't set user if email verification is pending - user must verify first
    if (response.status !== "pending_verification" && response.user) {
      setUser(toUser(response.user));
    }
    return response;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  const updatePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    const response = await api.changePassword(currentPassword, newPassword);
    setUser(toUser(response.user));
  }, []);

  const updateEmail = useCallback(async (email: string) => {
    const response = await api.changeEmail(email);
    setUser(toUser(response.user));
  }, []);

  const deleteAccount = useCallback(async () => {
    await api.deleteAccount();
    setUser(null);
  }, []);

  const upgradeToPaid = useCallback(async () => {
    await api.upgradeToPaid();
    await refresh();
  }, [refresh]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLoggedIn: !!user,
      isLoading,
      login,
      signup,
      logout,
      refresh,
      updateEmail,
      updatePassword,
      upgradeToPaid,
      deleteAccount,
    }),
    [isLoading, login, logout, refresh, signup, updateEmail, updatePassword, upgradeToPaid, user, deleteAccount]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
