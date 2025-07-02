// 설명: 선택된 카테고리 하위 부위를 표시하고, 부위별 색상 및 투명도 조절을 위한 사이드바 (항상 SketchPicker 표시)

import React from "react";
import { SketchPicker } from "react-color";
import { partHierarchy, getPartIdFromLabel } from "../utils/partHierarchy";

interface Props {
    selectedCategory: string | null;
    colorMap: Record<number, [number, number, number]>;
    opacityMap: Record<number, number>;
    onUpdateColorMap: (newMap: Record<number, [number, number, number]>) => void;
    onUpdateOpacityMap: (newMap: Record<number, number>) => void;
}

const SubSidebar: React.FC<Props> = ({
    selectedCategory,
    colorMap,
    opacityMap,
    onUpdateColorMap,
    onUpdateOpacityMap,
}) => {
    if (!selectedCategory) return null;

    const parts = partHierarchy[selectedCategory] || [];

    const handleColorChange = (partId: number, color: { rgb: { r: number; g: number; b: number } }) => {
        const rgb: [number, number, number] = [color.rgb.r, color.rgb.g, color.rgb.b];
        onUpdateColorMap({ ...colorMap, [partId]: rgb });
    };

    const handleOpacityChange = (partId: number, value: number) => {
        onUpdateOpacityMap({ ...opacityMap, [partId]: value });
    };

    const renderControls = (label: string, partId: number) => {
        const currentColor = colorMap[partId] || [0, 0, 0];
        const opacity = opacityMap[partId] ?? 1;

        return (
            <div
                key={partId}
                className="flex flex-col justify-center items-center border-b text-white font-medium text-l border-white pb-4 mb-6"
            >
                <div className=" mb-">{label}</div>
                {/* 칼라피커 */}
                <SketchPicker
                    color={{ r: currentColor[0], g: currentColor[1], b: currentColor[2] }}
                    onChange={(color) => handleColorChange(partId, color)}
                    disableAlpha
                />
                {/* 투명도 */}
                <div className="flex flex-col justify-center items-center text-white text-l w-full p-2">
                    <p className="w-full">투명도</p>
                    <div className="w-full flex justify-between gap-2">
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={opacity}
                            onChange={(e) => handleOpacityChange(partId, parseFloat(e.target.value))}
                        />
                        {opacity.toFixed(2)}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-[280px] bg-[#7a7a7a] border-l-[0.5px] border-white p-4 overflow-y-auto">
            {parts.map((part) =>
                typeof part === "string"
                    ? renderControls(part, getPartIdFromLabel(part))
                    : Object.entries(part).map(([group, sub]) => (
                          <div key={group}>{sub.map((label) => renderControls(label, getPartIdFromLabel(label)))}</div>
                      ))
            )}
        </div>
    );
};

export default SubSidebar;
