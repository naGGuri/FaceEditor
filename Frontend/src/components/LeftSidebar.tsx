// 파일: src/components/LeftSidebar.tsx
// 설명: 부위 카테고리 대신 파일 및 프로필 아이콘을 버튼으로 표시하는 사이드바

import React, { useRef } from "react";

import { exportCanvasImage } from "../utils/exportImage";

interface Props {
    onUpload: (file: File) => void;
    sessionId: string;
}

const actions = [
    { label: "파일", iconPath: "/assets/icons/file.svg", id: "upload" },
    { label: "내보내기", iconPath: "/assets/icons/export.svg", id: "export" },
    { label: "프로필", iconPath: "/assets/icons/profile.svg", id: "profile" },
];

const LeftSidebar: React.FC<Props> = ({ onUpload, sessionId }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleIconClick = (id: string) => {
        if (id === "upload" && fileInputRef.current) {
            fileInputRef.current.click(); // 파일 선택창 열기
        } else if (id === "export") {
            exportCanvasImage(sessionId); // 내보내기 실행
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
        }
    };

    return (
        <div className="w-[48px] bg-neutral-700 border-r-[0.5px] border-white p-2 flex flex-col items-center justify-start gap-4">
            {actions.map(({ label, iconPath, id }) => (
                <button
                    key={id}
                    onClick={() => handleIconClick(id)}
                    title={label}
                    className="w-10 h-10 flex items-center justify-center rounded hover:bg-black"
                >
                    <img src={iconPath} alt={label} className="w-8 h-8" />
                </button>
            ))}
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
            />
        </div>
    );
};

export default LeftSidebar;
