import { create } from "zustand";
import { login as apiLogin, registerUser, setAuthToken, clearAuthToken } from "../api/client";

interface AuthState {
    user: any | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (identifier: string, password: string) => Promise<boolean>;
    register: (name: string, username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export var useAuthStore = create<AuthState>(function (set) {
    return {
        user: null,
        isAuthenticated: false,
        isLoading: false,

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

        logout: function () {
            clearAuthToken();
            set({ user: null, isAuthenticated: false });
        },

        checkAuth: async function () {
            set({ isLoading: false });
        },
    };
});