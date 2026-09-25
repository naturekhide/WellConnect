import { create } from "zustand";
import { login as apiLogin, registerUser, getSession } from "../api/client";

var storage: Record<string, string> = {};

async function getItem(key: string): Promise<string | null> {
    return storage[key] || null;
}

async function setItem(key: string, value: string): Promise<void> {
    storage[key] = value;
}

async function deleteItem(key: string): Promise<void> {
    delete storage[key];
}

interface AuthState {
    user: any | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (identifier: string, password: string) => Promise<boolean>;
    register: (name: string, username: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
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
                if (data.url) {
                    set({ user: data.user, isAuthenticated: true });
                    await setItem("auth", "true");
                    return true;
                }
                return false;
            } catch (e) {
                return false;
            }
        },

        register: async function (name, username, email, password) {
            try {
                var data = await registerUser(name, username, email, password);
                return !!data.user;
            } catch (e) {
                return false;
            }
        },

        logout: async function () {
            await deleteItem("auth");
            set({ user: null, isAuthenticated: false });
        },

        checkAuth: async function () {
            try {
                var stored = await getItem("auth");
                if (stored) {
                    var session = await getSession();
                    if (session?.user) {
                        set({ user: session.user, isAuthenticated: true, isLoading: false });
                        return;
                    }
                }
            } catch (e) { }
            set({ user: null, isAuthenticated: false, isLoading: false });
        },
    };
});