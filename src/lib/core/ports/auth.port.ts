/**
 * Auth is split into two ports because the two halves genuinely run in
 * different places, independent of which provider backs them:
 *
 * - `AuthSessionPort` runs on the server (reading the current request's
 *   session/profile, sending account-recovery email).
 * - `AuthClientPort` runs in the browser — sign-in/up/out and the live
 *   session listener must run client-side so the provider's own
 *   cookie/session storage stays in sync with the already-mounted UI
 *   (see the comment in the old `auth-actions.ts`).
 */

export interface AuthUser {
  id: string;
}

export type UserRole = "customer" | "super_admin";

export interface ProfileRecord {
  fullName: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
}

export interface AuthError {
  code?: string;
  message: string;
}

export interface AuthSessionPort {
  getAuthenticatedUser(): Promise<AuthUser | null>;
  getProfileById(userId: string): Promise<ProfileRecord | null>;
  resetPasswordForEmail(email: string, redirectTo: string): Promise<void>;
}

export interface AuthClientPort {
  getUser(): Promise<AuthUser | null>;
  /** Returns an unsubscribe function. */
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void;
  signInWithPassword(email: string, password: string): Promise<{ user: AuthUser | null; error: AuthError | null }>;
  signUp(
    email: string,
    password: string,
    profile: { fullName: string; phone: string }
  ): Promise<{ error: AuthError | null }>;
  signOut(): Promise<void>;
  getProfileRole(userId: string): Promise<{ role: UserRole; isActive: boolean } | null>;
}
