import { create } from "zustand";

export type RGBColor = [number, number, number];

interface ColorState {
    colorMap: Record<string, RGBColor>;
    setColorMap: (map: Record<string, RGBColor>) => void;
    updateColor: (part: string, color: RGBColor) => void;
}

export const useColorStore = create<ColorState>((set) => ({
    colorMap: {},

    // 전체 색상 맵을 설정
    setColorMap: (map) => set({ colorMap: map }),

    // 개별 부위의 색상 업데이트
    updateColor: (part, color) =>
        set((state) => ({
            colorMap: {
                ...state.colorMap,
                [part]: color,
            },
        })),
}));
