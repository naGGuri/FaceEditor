// 파일: src/components/RightSidebar.tsx
// 설명: 부위 카테고리를 리스트로 제공하고, 클릭 시 선택된 카테고리를 상위로 전달하는 사이드바

import React from "react";

interface Props {
    selectedCategory: string | null;
    onSelectCategory: (category: string | null) => void;
}

const categories: {
    label: string;
    iconPath: string;
}[] = [
    { label: "피부", iconPath: "/assets/icons/skin.svg" },
    { label: "눈썹", iconPath: "/assets/icons/eyebrow.svg" },
    { label: "눈", iconPath: "/assets/icons/eye.svg" },
    { label: "귀", iconPath: "/assets/icons/ear.svg" },
    { label: "코", iconPath: "/assets/icons/nose.svg" },
    { label: "입술", iconPath: "/assets/icons/lips.svg" },
    { label: "머리카락", iconPath: "/assets/icons/hair.svg" },
];

const RightSidebar: React.FC<Props> = ({ selectedCategory, onSelectCategory }) => {
    return (
        <div className="w-[48px] p-2 bg-neutral-700 border-l-[0.5px] border-white flex flex-col items-center gap-4">
            {categories.map(({ label, iconPath }) => (
                <button
                    key={label}
                    onClick={() => onSelectCategory(selectedCategory === label ? null : label)}
                    className={`w-10 h-10 flex items-center justify-center rounded ${
                        selectedCategory === label ? "bg-gray-black" : "hover:bg-black"
                    }`}
                    title={label}
                >
                    <img src={iconPath} alt={label} className="w-8 h-8" />
                </button>
            ))}
        </div>
    );
};

export default RightSidebar;
