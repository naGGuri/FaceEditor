// 파일: src/pages/Editor.tsx
// 설명: 이미지 업로드, 세그멘테이션, 색상/투명도 조절, Undo/Redo, 로그 패널을 포함한 메인 에디터 (Before/After/LogPanel 크기 조절 기능 포함)

import React, { useState, useRef } from "react";

// components
import Before from "../components/Before";
import After from "../components/After";
import Header from "../components/Header";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import SubSidebar from "../components/SubSidebar";
import LogPanel from "../components/LogPanel";

// api
import { uploadImageToSegmentAPI } from "../api/segment";

// store
import { saveSession } from "../api/save";
import { loadSession } from "../api/load";
import { useColorStore } from "../store/colorStore";
import { useOpacityStore } from "../store/opacityStore";
import { defaultColorMap, defaultOpacityMap } from "../utils/defaultMaps";

export interface LogEntry {
    message: string;
    timestamp: string;
}

const Editor: React.FC = () => {
    const [logHeight, setLogHeight] = useState(120);
    const logPanelRef = useRef<HTMLDivElement>(null);

    const [imageUrl, setImageUrl] = useState<string>("");
    const [maskUrl, setMaskUrl] = useState<string>("");
    const [sessionId, setSessionId] = useState<string>("");

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);

    const [history, setHistory] = useState<
        { colorMap: Record<string, [number, number, number]>; opacityMap: Record<string, number> }[]
    >([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);

    const [beforeWidth, setBeforeWidth] = useState<number>(50);

    const colorMap = useColorStore((state) => state.colorMap);
    const setColorMap = useColorStore((state) => state.setColorMap);
    const opacityMap = useOpacityStore((state) => state.opacityMap);
    const setOpacityMap = useOpacityStore((state) => state.setOpacityMap);

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
        if (!file || file.size === 0) {
            addLog("⚠️ 올바른 이미지를 선택하세요.");
            return;
        }

        try {
            const { session_id, mask_url } = await uploadImageToSegmentAPI(file);
            const url = URL.createObjectURL(file);

            setImageUrl(url);
            setMaskUrl(mask_url);
            setSessionId(session_id);
            setColorMap(defaultColorMap);
            setOpacityMap(defaultOpacityMap);
            pushHistory(defaultColorMap, defaultOpacityMap);
            addLog("세션 ID: " + session_id);
            addLog("편집할 이미지 로드 : " + mask_url);
        } catch (error) {
            console.error("Upload error:", error);
            addLog("❌ 이미지 업로드에 실패했습니다.");
        }
    };

    const handleReset = () => {
        if (!sessionId) {
            addLog("⚠️ [Reset] 초기화할 이미지가 없습니다.");
            return;
        }

        setColorMap(defaultColorMap);
        setOpacityMap(defaultOpacityMap);
        pushHistory(defaultColorMap, defaultOpacityMap);
        addLog("🔄 [Reset] 편집 초기화");
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            applyHistory(newIndex);
            addLog("↩️ Undo");
        } else {
            addLog("⚠️ [Undo] 이전 기록이 없습니다.");
        }
    };

    const handleRedo = () => {
        if (historyIndex + 1 < history.length) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            applyHistory(newIndex);
            addLog("↪️ Redo");
        } else {
            addLog("⚠️ [Rndo] 이후 기록이 없습니다.");
        }
    };

    const handleSave = async () => {
        if (!sessionId) {
            addLog("⚠️ [Save] 세션 ID가 없습니다. 이미지를 먼저 업로드하세요.");
            return;
        }

        if (Object.keys(colorMap).length === 0 && Object.keys(opacityMap).length === 0) {
            addLog("⚠️ [Save] 저장할 내용이 없습니다. 먼저 편집을 진행하세요.");
            return;
        }

        await saveSession(sessionId, colorMap, opacityMap);
        addLog("✅ [Save] 세션이 저장되었습니다.");
    };

    const handleLoad = async () => {
        if (!sessionId) {
            addLog("⚠️ [Load] 세션 ID가 없습니다. 이미지를 먼저 업로드하세요.");
            return;
        }

        const result = await loadSession(sessionId);
        if (result) {
            setColorMap(result.colorMap);
            setOpacityMap(result.opacityMap);
            pushHistory(result.colorMap, result.opacityMap);
            addLog("✅ [Load] 세션이 로드되었습니다.");
        } else {
            addLog("❌ [Load] 세션을 불러오지 못했습니다.");
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
                <LeftSidebar onUpload={handleUpload} sessionId={sessionId} />

                <div className="flex-1 flex flex-col">
                    {/* 편집 뷰 */}
                    <div className="flex flex-1 relative" style={{ height: `calc(100% - ${logHeight}px)` }}>
                        <div style={{ width: `${beforeWidth}%` }} className="h-full">
                            <Before imageUrl={imageUrl} />
                        </div>
                        <div onMouseDown={handleVerticalResize} className="w-[1px] cursor-col-resize bg-white h-full" />
                        <div style={{ width: `${100 - beforeWidth}%` }} className="h-full">
                            <After
                                originalUrl={imageUrl}
                                maskUrl={maskUrl}
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
