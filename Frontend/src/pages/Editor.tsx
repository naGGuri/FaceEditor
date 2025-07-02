// 파일: src/pages/Editor.tsx
// 설명: 이미지 업로드, 세그멘테이션, 색상/투명도 조절, Undo/Redo, 로그 패널을 포함한 메인 에디터 (Before/After/LogPanel 크기 조절 기능 포함)

import React, { useState, useRef } from "react";
import Before from "../components/Before";
import After2 from "../components/After2";
import Header from "../components/Header";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import SubSidebar from "../components/SubSidebar";
import LogPanel from "../components/LogPanel";
import { defaultColorMap, defaultOpacityMap } from "../utils/defaultMaps";
import { saveConfigAPI, loadConfigAPI } from "../api/config";

export interface LogEntry {
    message: string;
    timestamp: string;
}

const Editor: React.FC = () => {
    const [logHeight, setLogHeight] = useState(120);
    const logPanelRef = useRef<HTMLDivElement>(null);

    const [imageUrl, setImageUrl] = useState<string>("");
    const [sessionId, setSessionId] = useState<string>("");
    const [partIndexMap, setPartIndexMap] = useState<number[][]>([]);
    const [colorMap, setColorMap] = useState<Record<number, [number, number, number]>>(defaultColorMap);
    const [opacityMap, setOpacityMap] = useState<Record<number, number>>(defaultOpacityMap);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);

    const [history, setHistory] = useState<{ colorMap: typeof colorMap; opacityMap: typeof opacityMap }[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);

    const [beforeWidth, setBeforeWidth] = useState<number>(50); // 좌우 분할 비율

    const handleVerticalResize = () => {
        const onMouseMove = (moveEvent: MouseEvent) => {
            const totalWidth = window.innerWidth;
            const newBeforeWidth = (moveEvent.clientX / totalWidth) * 100;
            setBeforeWidth(Math.max(10, Math.min(90, newBeforeWidth)));
        };
        const onMouseUp = () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    };

    const handleHorizontalResize = () => {
        const onMouseMove = (e: MouseEvent) => {
            const editorRect = logPanelRef.current?.getBoundingClientRect();
            if (!editorRect) return;

            const distanceFromBottom = window.innerHeight - e.clientY;
            setLogHeight(Math.max(80, Math.min(300, distanceFromBottom)));
        };

        const onMouseUp = () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    };

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs((prev) => [...prev, { message, timestamp }]);
    };

    const applyHistory = (index: number) => {
        const snapshot = history[index];
        if (snapshot) {
            setColorMap(snapshot.colorMap);
            setOpacityMap(snapshot.opacityMap);
        }
    };

    const pushHistory = (newColorMap: typeof colorMap, newOpacityMap: typeof opacityMap) => {
        const snapshot = {
            colorMap: { ...newColorMap },
            opacityMap: { ...newOpacityMap },
        };
        const updated = [...history.slice(0, historyIndex + 1), snapshot];
        setHistory(updated);
        setHistoryIndex(updated.length - 1);
    };

    const handleUpload = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(import.meta.env.VITE_API_BASE_URL + "/segment", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            const url = URL.createObjectURL(file);

            setImageUrl(url);
            setSessionId(data.session_id);
            setPartIndexMap(data.part_index_map);
            setColorMap(defaultColorMap);
            setOpacityMap(defaultOpacityMap);
            pushHistory(defaultColorMap, defaultOpacityMap);

            addLog("Image uploaded and segmentation completed");
            addLog("Session ID: " + data.session_id);
        } catch (error) {
            console.error("Upload error:", error);
            addLog("❌ Failed to upload image and run segmentation");
        }
    };

    const handleReset = () => {
        setColorMap(defaultColorMap);
        setOpacityMap(defaultOpacityMap);
        pushHistory(defaultColorMap, defaultOpacityMap);
        addLog("Settings reset");
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            applyHistory(newIndex);
            addLog("Undo operation performed");
        }
    };

    const handleRedo = () => {
        if (historyIndex + 1 < history.length) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            applyHistory(newIndex);
            addLog("Redo operation performed");
        }
    };

    const handleSave = () => {
        if (!sessionId) {
            addLog("❌ Cannot save: sessionId is missing");
            return;
        }
        saveConfigAPI(sessionId, { colorMap, opacityMap });
        addLog("Settings saved");
    };

    const handleLoad = async () => {
        if (!sessionId) {
            addLog("❌ Cannot load: sessionId is missing");
            return;
        }

        try {
            const data = await loadConfigAPI(sessionId);
            setColorMap(data.colorMap);
            setOpacityMap(data.opacityMap);
            setTimeout(() => {
                pushHistory(data.colorMap, data.opacityMap);
            }, 0);
            addLog("Settings loaded from server");
        } catch (error) {
            console.error("Load error:", error);
            addLog("❌ Failed to load: Network or server error");
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* 헤더*/}
            <Header
                onReset={handleReset}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onSave={handleSave}
                onLoad={handleLoad}
            />
            <div className="flex flex-1">
                <LeftSidebar onUpload={handleUpload} />

                <div className="flex-1 flex flex-col">
                    {/* 편집 뷰 */}
                    <div className="flex flex-1 relative" style={{ height: `calc(100% - ${logHeight}px)` }}>
                        <div style={{ width: `${beforeWidth}%` }} className="h-full">
                            <Before imageUrl={imageUrl} />
                        </div>
                        <div onMouseDown={handleVerticalResize} className="w-[1px] cursor-col-resize bg-white h-full" />
                        <div style={{ width: `${100 - beforeWidth}%` }} className="h-full">
                            <After2
                                originalUrl={imageUrl}
                                partIndexMap={partIndexMap}
                                colorMap={colorMap}
                                opacityMap={opacityMap}
                            />
                        </div>
                    </div>

                    {/* 로그 패널 */}
                    <div ref={logPanelRef} className="relative">
                        <div className="h-[1px] cursor-row-resize bg-white" onMouseDown={handleHorizontalResize} />
                        <LogPanel logs={logs} height={logHeight} />
                    </div>
                </div>

                {/* 오른쪽 사이드바 */}
                <div className="flex">
                    <SubSidebar
                        selectedCategory={selectedCategory}
                        colorMap={colorMap}
                        opacityMap={opacityMap}
                        onUpdateColorMap={(newMap) => {
                            setColorMap(newMap);
                            pushHistory(newMap, opacityMap);
                        }}
                        onUpdateOpacityMap={(newMap) => {
                            setOpacityMap(newMap);
                            pushHistory(colorMap, newMap);
                        }}
                    />
                    <RightSidebar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
                </div>
            </div>
        </div>
    );
};

export default Editor;
