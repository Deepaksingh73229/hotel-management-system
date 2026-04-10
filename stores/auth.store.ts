import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthUser, RoleName, PermissionModule, PermissionAction } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// STATE SHAPE
// ─────────────────────────────────────────────────────────────────────────────

interface AuthState {
    accessToken: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
    isHydrating: boolean;       // true while AuthProvider runs getMe on load
}

interface AuthActions {
    setAccessToken: (token: string | null) => void;
    setUser: (user: AuthUser | null) => void;
    setHydrating: (value: boolean) => void;

    /** Call this after login — sets both token and user at once. */
    setSession: (token: string, user: AuthUser) => void;

    /** Wipes all auth state. Called on logout or failed refresh. */
    clearSession: () => void;

    // ── Derived helpers ─────────────────────────────────────────────────────

    /** Returns true if the current user has the given role. */
    hasRole: (...roles: RoleName[]) => boolean;

    /** Returns true if the current user has a specific module+action permission. */
    can: (module: PermissionModule, action: PermissionAction) => boolean;

    /** Returns true if the current user is an admin. */
    isAdmin: () => boolean;
}

type AuthStore = AuthState & AuthActions;

// ─────────────────────────────────────────────────────────────────────────────
// STORE
// Only the access token is persisted to sessionStorage (not localStorage)
// so it's cleared when the browser tab is closed.
// The user object is re-hydrated via getMe on every app load.
// The httpOnly refresh-token cookie handles persistence across sessions.
// ─────────────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            // ── Initial state ────────────────────────────────────────────────
            accessToken: null,
            user: null,
            isAuthenticated: false,
            isHydrating: true,

            // ── Actions ──────────────────────────────────────────────────────
            setAccessToken: (token) =>
                set({
                    accessToken: token,
                    isAuthenticated: token !== null,
                }),

            setUser: (user) => set({ user }),

            setHydrating: (value) => set({ isHydrating: value }),

            setSession: (token, user) =>
                set({
                    accessToken: token,
                    user,
                    isAuthenticated: true,
                }),

            clearSession: () =>
                set({
                    accessToken: null,
                    user: null,
                    isAuthenticated: false,
                }),

            // ── Derived helpers ───────────────────────────────────────────────
            hasRole: (...roles) => {
                const { user } = get();
                return user ? roles.includes(user.role.name as RoleName) : false;
            },

            can: (module, action) => {
                const { user } = get();
                if (!user) return false;

                return user.role.permissions.some(
                    (p) => p.module === module && p.action === action
                );
            },

            isAdmin: () => get().hasRole("admin"),
        }),

        {
            name: "stayos_auth",
            storage: createJSONStorage(() => sessionStorage),
            // Only persist the access token — user is re-fetched on mount.
            partialize: (state) => ({ accessToken: state.accessToken }),
        }
    )
);

// ─────────────────────────────────────────────────────────────────────────────
// SELECTORS
// Import these in components instead of calling useAuthStore directly
// to keep components decoupled from store internals.
// ─────────────────────────────────────────────────────────────────────────────

export const selectUser = (s: AuthStore) => s.user;
export const selectAccessToken = (s: AuthStore) => s.accessToken;
export const selectIsAuthenticated = (s: AuthStore) => s.isAuthenticated;
export const selectIsHydrating = (s: AuthStore) => s.isHydrating;
export const selectIsAdmin = (s: AuthStore) => s.isAdmin();