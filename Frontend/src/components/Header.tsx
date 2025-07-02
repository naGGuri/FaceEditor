// 파일: src/components/Header.tsx
// 설명: 상단 네비게이션 바 - 아이콘 기반의 Reset, Undo, Redo, Save, Load 버튼 제공

import React from "react";

interface Props {
    onReset: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onSave: () => void;
    onLoad: () => void;
}

const actions = [
    { name: "Load", icon: "/assets/icons/load.svg" },
    { name: "Save", icon: "/assets/icons/save.svg" },
    { name: "Reset", icon: "/assets/icons/reset.svg" },
    { name: "Undo", icon: "/assets/icons/undo.svg" },
    { name: "Redo", icon: "/assets/icons/redo.svg" },
];

const Header: React.FC<Props> = ({ onReset, onUndo, onRedo, onSave, onLoad }) => {
    const handlers: Record<string, () => void> = {
        Reset: onReset,
        Undo: onUndo,
        Redo: onRedo,
        Save: onSave,
        Load: onLoad,
    };

    return (
        <header className="bg-neutral-700 border-b-[0.5px] border-white h-[48px] ">
            <nav className="flex justify-end items-center px-10 h-full">
                <ul className="flex gap-4">
                    {actions.map(({ name, icon }) => (
                        <li key={name}>
                            <button
                                onClick={() => {
                                    console.log(`${name} clicked`);
                                    handlers[name]();
                                }}
                                className="w-10 h-10 flex items-center justify-center hover:bg-black rounded"
                                title={name}
                            >
                                <img src={icon} alt={name} className="w-8 h-8" />
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
};

export default Header;
