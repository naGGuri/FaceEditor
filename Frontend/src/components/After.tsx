// 설명: 원본 이미지 위에 세그멘테이션 색상 및 부위별 스케일 조절 반영

import React, { useEffect, useRef } from "react";

interface Props {
    originalUrl: string;
    partIndexMap: number[][];
    colorMap: Record<number, [number, number, number]>;
    opacityMap: Record<number, number>;
    scaleMap: Record<number, { scaleX: number; scaleY: number }>;
}

const After: React.FC<Props> = ({ originalUrl, partIndexMap, colorMap, opacityMap, scaleMap }) => {
    const baseRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const baseCanvas = baseRef.current;
        const overlayCanvas = overlayRef.current;
        if (!baseCanvas || !overlayCanvas) return;

        const baseCtx = baseCanvas.getContext("2d")!;
        const overlayCtx = overlayCanvas.getContext("2d")!;
        const image = new Image();

        image.onload = () => {
            const imgW = image.width;
            const imgH = image.height;

            const maskW = partIndexMap[0].length;
            const maskH = partIndexMap.length;

            // 캔버스 크기 설정
            baseCanvas.width = overlayCanvas.width = imgW;
            baseCanvas.height = overlayCanvas.height = imgH;

            // 원본 이미지 그리기
            baseCtx.clearRect(0, 0, imgW, imgH);
            baseCtx.drawImage(image, 0, 0, imgW, imgH);

            overlayCtx.clearRect(0, 0, imgW, imgH);

            // 부위 ID 수집
            const visited = new Set<number>();
            for (let y = 0; y < maskH; y++) {
                for (let x = 0; x < maskW; x++) {
                    const partId = partIndexMap[y][x];
                    if (partId >= 0) visited.add(partId);
                }
            }

            visited.forEach((partId) => {
                const [r, g, b] = colorMap[partId] ?? [0, 0, 0];
                const opacity = opacityMap[partId] ?? 0.5;
                const { scaleX, scaleY } = scaleMap[partId] ?? { scaleX: 1, scaleY: 1 };

                // 🎯 1. maskImage 생성 (partIndexMap 기준)
                const maskImage = new ImageData(maskW, maskH);
                for (let y = 0; y < maskH; y++) {
                    for (let x = 0; x < maskW; x++) {
                        const idx = (y * maskW + x) * 4;
                        if (partIndexMap[y][x] === partId) {
                            maskImage.data[idx] = r;
                            maskImage.data[idx + 1] = g;
                            maskImage.data[idx + 2] = b;
                            maskImage.data[idx + 3] = opacity * 255;
                        }
                    }
                }

                // 🎯 2. tempCanvas에 이미지로 넣고, maskCanvas로 확대 렌더링
                const tempCanvas = document.createElement("canvas");
                tempCanvas.width = maskW;
                tempCanvas.height = maskH;
                const tempCtx = tempCanvas.getContext("2d")!;
                tempCtx.putImageData(maskImage, 0, 0);

                const maskCanvas = document.createElement("canvas");
                maskCanvas.width = imgW;
                maskCanvas.height = imgH;
                const maskCtx = maskCanvas.getContext("2d")!;
                maskCtx.drawImage(tempCanvas, 0, 0, imgW, imgH);

                // 🎯 3. 스케일 반영하여 오버레이
                overlayCtx.save();
                overlayCtx.translate(imgW / 2, imgH / 2);
                overlayCtx.scale(scaleX, scaleY);
                overlayCtx.translate(-imgW / 2, -imgH / 2);
                overlayCtx.drawImage(maskCanvas, 0, 0, imgW, imgH);
                overlayCtx.restore();
            });
        };

        image.src = originalUrl;
    }, [originalUrl, partIndexMap, colorMap, opacityMap, scaleMap]);

    return (
        <div className="w-[480px] flex justify-center items-center">
            <div className="relative w-[512px] h-[512px]">
                <canvas ref={baseRef} className="absolute top-0 left-0 w-full h-full z-10" />
                <canvas ref={overlayRef} className="absolute top-0 left-0 w-full h-full z-20" />
            </div>
        </div>
    );
};

export default After;
