import { create } from "zustand";
import { login as apiLogin, registerUser, clearAuthToken, loadToken, getAuthToken } from "../api/client";

interface AuthState {
    user: any | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (identifier: string, password: string) => Promise<boolean>;
    register: (name: string, username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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

        logout: async function () {
            await clearAuthToken();
            set({ user: null, isAuthenticated: false });
        },

        checkAuth: async function () {
            try {
                await loadToken();
                var token = getAuthToken();
                if (token) {
                    set({ isAuthenticated: true, isLoading: false });
                } else {
                    set({ isAuthenticated: false, isLoading: false });
                }
            } catch (e) {
                set({ isAuthenticated: false, isLoading: false });
            }
        },
    };
});