import React, { useEffect, useRef } from "react";

interface Props {
    originalUrl: string;
    maskUrl: string;
    colorMap: Record<number, [number, number, number] | undefined>;
    opacityMap: Record<number, number>;
}

const CANVAS_SIZE = 512;

const After: React.FC<Props> = ({ originalUrl, maskUrl, colorMap, opacityMap }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!originalUrl || !maskUrl) return;

        const originalImg = new Image();
        originalImg.crossOrigin = "anonymous";
        originalImg.src = originalUrl;

        const maskImg = new Image();
        maskImg.crossOrigin = "anonymous";
        maskImg.src = maskImg.src = `${import.meta.env.VITE_API_BASE_URL}${maskUrl}`;
        console.log("🔄 이미지 로딩 시작");

        Promise.all([
            new Promise((resolve) => (originalImg.onload = resolve)),
            new Promise((resolve) => (maskImg.onload = resolve)),
        ]).then(() => {
            const canvas = canvasRef.current;
            if (!canvas) {
                console.error("❌ canvasRef가 null입니다");
                return;
            }

            canvas.width = CANVAS_SIZE;
            canvas.height = CANVAS_SIZE;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // 원본 이미지 그리기
            ctx.drawImage(originalImg, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

            // 마스크 이미지 읽기
            const maskCanvas = document.createElement("canvas");
            maskCanvas.width = CANVAS_SIZE;
            maskCanvas.height = CANVAS_SIZE;
            const maskCtx = maskCanvas.getContext("2d");
            if (!maskCtx) return;

            maskCtx.drawImage(maskImg, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
            const maskData = maskCtx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data;

            const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
            const data = imageData.data;

            let updatedPixelCount = 0;
            const appliedParts = new Set<number>();

            for (let i = 0; i < data.length; i += 4) {
                const gray = maskData[i]; // grayscale 값 → part id
                const color = colorMap[gray];
                const opacity = opacityMap[gray] ?? 0;

                if (color !== undefined && opacity > 0) {
                    data[i] = data[i] * (1 - opacity) + color[0] * opacity;
                    data[i + 1] = data[i + 1] * (1 - opacity) + color[1] * opacity;
                    data[i + 2] = data[i + 2] * (1 - opacity) + color[2] * opacity;
                    updatedPixelCount++;
                    appliedParts.add(gray);
                }
            }

            ctx.putImageData(imageData, 0, 0);
        });
    }, [originalUrl, maskUrl, colorMap, opacityMap]);

    return (
        <div className="w-full h-full flex justify-center items-center bg-[#242424]">
            <canvas id="after-canvas" ref={canvasRef} className="max-w-full max-h-full" />
        </div>
    );
};

export default After;
