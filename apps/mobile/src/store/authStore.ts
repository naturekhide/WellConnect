import { create } from "zustand";
import { login as apiLogin, registerUser, clearAuthToken, loadToken, getAuthToken, getStoredUser } from "../api/client";

interface AuthState {
    user: any | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (identifier: string, password: string) => Promise<boolean>;
    register: (name: string, username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    verifyEmail: (email: string, code: string) => Promise<{ success: boolean; error?: string }>; // <-- Added this
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

export var useAuthStore = create<AuthState>(function (set) {
    return {
        user: null,
        isAuthenticated: false,
        isLoading: true,

        login: async function (identifier, password) {
            try {
                var data = await apiLogin(identifier, password);
                set({ user: data.user, isAuthenticated: true });
                return true;
            } catch (e) {
                return false;
            }
        },

        register: async function (name, username, email, password) {
            try {
                var data = await registerUser(name, username, email, password);
                set({ user: data.user, isAuthenticated: true });
                return { success: true };
            } catch (e: any) {
                return { success: false, error: e.message };
            }
        },

        // NEW FUNCTION: Verify email and save the token/user to the store
        verifyEmail: async function (email, code) {
            try {
                var res = await fetch("https://well-connect-web.vercel.app/api/auth/verify-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, code }),
                });

                var data = await res.json();
                if (!res.ok) throw new Error(data.error || "Verification failed");

                // We need to import setAuthToken to save it to storage
                const { setAuthToken } = require("../api/client");
                await setAuthToken(data.token, data.user);

                // Update the Zustand store!
                set({ user: data.user, isAuthenticated: true });
                return { success: true };
            } catch (e: any) {
                return { success: false, error: e.message };
            }
        },

        logout: async function () {
            await clearAuthToken();
            set({ user: null, isAuthenticated: false });
        },

        checkAuth: async function () {
            try {
                await loadToken();
                var token = getAuthToken();
                var user = getStoredUser();
                if (token && user) {
                    set({ user: user, isAuthenticated: true, isLoading: false });
                } else {
                    set({ user: null, isAuthenticated: false, isLoading: false });
                }
            } catch (e) {
                set({ user: null, isAuthenticated: false, isLoading: false });
            }
        },
    };
});