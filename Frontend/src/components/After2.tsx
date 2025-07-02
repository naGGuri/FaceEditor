// // 파일: src/components/After2.tsx
// // 설명: 원본 이미지 위에 세그멘테이션 마스크를 적용하여 색상 수정된 이미지를 렌더링

// import React, { useEffect, useRef } from "react";

// interface Props {
//     originalUrl: string;
//     partIndexMap: number[][];
//     colorMap: Record<number, [number, number, number] | undefined>;
//     opacityMap: Record<number, number>;
// }

// const CANVAS_SIZE = 512; // 기준 사이즈 (partIndexMap의 크기와 일치)

// const After2: React.FC<Props> = ({ originalUrl, partIndexMap, colorMap, opacityMap }) => {
//     const canvasRef = useRef<HTMLCanvasElement | null>(null);

//     useEffect(() => {
//         if (!originalUrl || partIndexMap.length === 0) return;

//         const img = new Image();
//         img.crossOrigin = "anonymous";
//         img.src = originalUrl;

//         img.onload = () => {
//             const canvas = canvasRef.current;
//             if (!canvas) return;

//             const ctx = canvas.getContext("2d");
//             if (!ctx) return;

//             // 고정된 512x512 캔버스에 원본 이미지 리사이즈하여 렌더링
//             canvas.width = CANVAS_SIZE;
//             canvas.height = CANVAS_SIZE;
//             ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

//             const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
//             const data = imageData.data;

//             for (let y = 0; y < CANVAS_SIZE; y++) {
//                 for (let x = 0; x < CANVAS_SIZE; x++) {
//                     const index = (y * CANVAS_SIZE + x) * 4;
//                     const partId = partIndexMap[y]?.[x] ?? 0;
//                     const color = colorMap[partId];
//                     const opacity = opacityMap[partId] ?? 0;

//                     if (color !== undefined) {
//                         data[index] = data[index] * (1 - opacity) + color[0] * opacity;
//                         data[index + 1] = data[index + 1] * (1 - opacity) + color[1] * opacity;
//                         data[index + 2] = data[index + 2] * (1 - opacity) + color[2] * opacity;
//                     }
//                 }
//             }

//             ctx.putImageData(imageData, 0, 0);
//         };
//     }, [originalUrl, partIndexMap, colorMap, opacityMap]);

//     return (
//         <div className="w-1/2 flex bg-[#242424] justify-center items-center">
//             <div className="w-[512px] h-[512px] flex justify-center items-center">
//                 <canvas ref={canvasRef} className="w-full h-full" />
//             </div>
//         </div>
//     );
// };

// export default After2;

// 설명: 원본 이미지 위에 세그멘테이션 마스크를 적용하여 색상 수정된 이미지를 렌더링

import React, { useEffect, useRef } from "react";

interface Props {
    originalUrl: string;
    partIndexMap: number[][];
    colorMap: Record<number, [number, number, number] | undefined>;
    opacityMap: Record<number, number>;
}

const CANVAS_SIZE = 512;

const After2: React.FC<Props> = ({ originalUrl, partIndexMap, colorMap, opacityMap }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!originalUrl || partIndexMap.length === 0) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = originalUrl;

        img.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            canvas.width = CANVAS_SIZE;
            canvas.height = CANVAS_SIZE;
            ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

            const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
            const data = imageData.data;

            for (let y = 0; y < CANVAS_SIZE; y++) {
                for (let x = 0; x < CANVAS_SIZE; x++) {
                    const index = (y * CANVAS_SIZE + x) * 4;
                    const partId = partIndexMap[y]?.[x] ?? 0;
                    const color = colorMap[partId];
                    const opacity = opacityMap[partId] ?? 0;

                    if (color !== undefined) {
                        data[index] = data[index] * (1 - opacity) + color[0] * opacity;
                        data[index + 1] = data[index + 1] * (1 - opacity) + color[1] * opacity;
                        data[index + 2] = data[index + 2] * (1 - opacity) + color[2] * opacity;
                    }
                }
            }

            ctx.putImageData(imageData, 0, 0);
        };
    }, [originalUrl, partIndexMap, colorMap, opacityMap]);

    return (
        <div className="w-full h-full flex justify-center items-center bg-[#242424]">
            <canvas ref={canvasRef} className="max-w-full max-h-full" />
        </div>
    );
};

export default After2;
