// 설명: 현재 세션의 색상 및 투명도 상태를 서버에 저장

import axios from "axios";

export async function saveSession(sessionId: string, colorMap: object, opaciryMap: object): Promise<void> {
    try {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/save`, {
            session_id: sessionId,
            color_map: colorMap,
            opacity_map: opaciryMap,
        });
        console.log("✅ 세션 저장 성공");
    } catch (error) {
        console.error("❌ 세션 저장 실패", error);
    }
}
