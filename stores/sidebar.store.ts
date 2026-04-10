import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SidebarStore {
    isCollapsed: boolean;
    toggle: () => void;
    collapse: () => void;
    expand: () => void;
}

export const useSidebarStore = create<SidebarStore>()(
    persist(
        (set) => ({
            isCollapsed: false,

            toggle: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
            collapse: () => set({ isCollapsed: true }),
            expand: () => set({ isCollapsed: false }),
        }),
        {
            name: "stayos_sidebar",
            storage: createJSONStorage(() => localStorage),
        }
    )
);