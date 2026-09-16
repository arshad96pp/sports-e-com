"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Address, UserProfile } from "@/lib/types";
import type { AddressDTO } from "@/lib/services/address-service";
import { useToast } from "@/lib/context/ToastContext";
import { useSupabaseSession } from "@/lib/context/SupabaseSessionContext";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { getMyProfileAction } from "@/lib/actions/profile-actions";
import {
  createAddressAction,
  deleteAddressAction,
  listMyAddressesAction,
} from "@/lib/actions/address-actions";

interface AuthContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  addresses: AddressDTO[];
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (profile: UserProfile, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  addAddress: (address: Address) => void;
  removeAddress: (addressId: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSupabaseSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<AddressDTO[]>([]);
  const { showToast } = useToast();

  const hydrated = status !== "loading";
  const isAuthenticated = status === "authenticated";

  useEffect(() => {
    if (!isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile(null);
      setAddresses([]);
      return;
    }
    let cancelled = false;
    Promise.all([getMyProfileAction(), listMyAddressesAction()]).then(([p, a]) => {
      if (cancelled) return;
      setProfile(p);
      setAddresses(a);
    });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const login = useCallback<AuthContextValue["login"]>(
    async (email, password) => {
      const parsed = loginSchema.safeParse({ email, password });
      if (!parsed.success) {
        return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid details" };
      }
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      if (error) {
        if (error.code === "email_not_confirmed") {
          return {
            ok: false,
            error: "Please confirm your email before logging in. Check your inbox for the confirmation link.",
          };
        }
        return { ok: false, error: "Incorrect email or password." };
      }
      showToast("Welcome back!", "success");
      return { ok: true };
    },
    [showToast]
  );

  const register = useCallback<AuthContextValue["register"]>(
    async (profileInput, password) => {
      const parsed = registerSchema.safeParse({
        fullName: profileInput.fullName,
        email: profileInput.email,
        phone: profileInput.phone,
        password,
      });
      if (!parsed.success) {
        return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid details" };
      }
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: { data: { full_name: parsed.data.fullName, phone: parsed.data.phone } },
      });
      if (error) {
        const message = error.message.toLowerCase().includes("already registered")
          ? "An account with this email already exists."
          : error.message;
        return { ok: false, error: message };
      }
      showToast(`Account created. Welcome, ${parsed.data.fullName.split(" ")[0]}!`, "success");
      return { ok: true };
    },
    [showToast]
  );

  const logout = useCallback(() => {
    const supabase = createClient();
    void supabase.auth.signOut();
    showToast("You have been logged out", "info");
  }, [showToast]);

  const addAddress = useCallback((address: Address) => {
    void createAddressAction(address).then(() => {
      void listMyAddressesAction().then(setAddresses);
    });
  }, []);

  const removeAddress = useCallback((addressId: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== addressId));
    void deleteAddressAction(addressId);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: profile,
      isAuthenticated,
      hydrated,
      addresses,
      login,
      register,
      logout,
      addAddress,
      removeAddress,
    }),
    [profile, isAuthenticated, hydrated, addresses, login, register, logout, addAddress, removeAddress]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
