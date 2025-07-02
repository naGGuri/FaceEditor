// 파일: src/store/colorStore.ts
// 설명: 선택된 부위와 색상 매핑을 zustand로 상태관리

import { create } from "zustand";

interface ColorStore {
    colorMap: Record<string, [number, number, number]>;
    selectedPart: string | null;

    setColor: (part: string, color: [number, number, number]) => void;
    setSelectedPart: (part: string | null) => void;
    reset: () => void;
}

const useColorStore = create<ColorStore>((set) => ({
    colorMap: {},
    selectedPart: null,

    setColor: (part, color) =>
        set((state) => ({
            colorMap: {
                ...state.colorMap,
                [part]: color,
            },
        })),

    setSelectedPart: (part) => set({ selectedPart: part }),

    reset: () => set({ colorMap: {}, selectedPart: null }),
}));

export default useColorStore;
