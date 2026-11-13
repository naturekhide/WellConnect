import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 👈 Import AsyncStorage

type ThemeMode = 'dark' | 'light';

interface ThemeState {
    mode: ThemeMode;
    toggleTheme: () => void;
    setTheme: (mode: ThemeMode) => void;
    loadTheme: () => Promise<void>; // 👈 Add loadTheme type
}

export const useThemeStore = create<ThemeState>((set) => ({
    mode: 'dark', // Default

    toggleTheme: async () => {
        set((state) => {
            const newMode = state.mode === 'dark' ? 'light' : 'dark';
            AsyncStorage.setItem('themeMode', newMode); // Save preference
            return { mode: newMode };
        });
    },

    setTheme: (mode) => {
        set({ mode });
        AsyncStorage.setItem('themeMode', mode);
    },

    // 👇 Add the implementation
    loadTheme: async () => {
        try {
            const saved = await AsyncStorage.getItem('themeMode');
            if (saved === 'dark' || saved === 'light') {
                set({ mode: saved });
            }
        } catch (e) {
            console.log("Failed to load theme:", e);
        }
    },
}));