// 파일: src/utils/exportImage.ts
// 설명: 현재 캔버스를 PNG 이미지로 내보내기 위한 유틸 함수

export function exportCanvasImage(sessionId: string, canvasId: string = "after-canvas") {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;

    if (!canvas) {
        console.error("❌ 캔버스를 찾을 수 없습니다. ID:", canvasId);
        return;
    }

    const dataURL = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `${sessionId}_result.png`;
    link.click();

    console.log("✅ 이미지 저장 완료:", link.download);
}
