// 파일: src/api/segment.ts
// 설명: FastAPI의 /segment API와 통신

import axios from "axios";

interface SegmentResponse {
    session_id: string;
    mask_url: string;
}

export async function uploadImageToSegmentAPI(file: File): Promise<SegmentResponse> {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await axios.post<SegmentResponse>(`${import.meta.env.VITE_API_BASE_URL}/segment`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        console.log("✅ 세그멘테이션 성공:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Segment API 호출 실패:", error);
        throw new Error("Segment API 호출 실패");
    }
}
