// 파일: src/api/segment.ts
// 설명: FastAPI의 /segment API와 통신

export async function uploadImageToSegmentAPI(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://localhost:8000/segment", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) throw new Error("Segment API 호출 실패");

    return await response.json(); // { session_id, mask_url, part_index_map }
}
