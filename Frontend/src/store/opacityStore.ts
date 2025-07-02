import { create } from "zustand";

interface OpacityState {
    opacityMap: Record<string, number>;
    setOpacityMap: (map: Record<string, number>) => void;
    updateOpacity: (part: string, value: number) => void;
}

export const useOpacityStore = create<OpacityState>((set) => ({
    opacityMap: {},
    setOpacityMap: (map) => set({ opacityMap: map }),
    updateOpacity: (part, value) =>
        set((state) => ({
            opacityMap: { ...state.opacityMap, [part]: value },
        })),
}));
