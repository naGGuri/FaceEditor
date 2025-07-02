// 설명: 서버에서 해당 세션의 색상 및 투명도 상태를 불러오기

import axios from "axios";

// 파일: src/api/load.ts

export async function loadSession(sessionId: string): Promise<{
    colorMap: Record<number, [number, number, number]>;
    opacityMap: Record<number, number>;
} | null> {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/load`, {
            params: { session_id: sessionId },
        });

        console.log("✅ 세션 불러오기 성공", response.data);

        // 문자열 key → number key로 변환
        const colorMap: Record<number, [number, number, number]> = {};
        const opacityMap: Record<number, number> = {};

        for (const [k, v] of Object.entries(response.data.color_map)) {
            colorMap[parseInt(k, 10)] = v as [number, number, number];
        }
        for (const [k, v] of Object.entries(response.data.opacity_map)) {
            opacityMap[parseInt(k, 10)] = v as number;
        }

        return { colorMap, opacityMap };
    } catch (error) {
        console.error("❌ 세션 불러오기 실패", error);
        return null;
    }
}
