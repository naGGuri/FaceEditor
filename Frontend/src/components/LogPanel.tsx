// 파일: src/components/LogPanel.tsx
// 설명: 시스템 로그를 하단에 표시하는 패널 컴포넌트

import React, { useEffect, useRef } from "react";

export type LogEntry = {
    message: string;
    timestamp: string;
};

interface Props {
    logs: LogEntry[];
    height?: number;
}

const LogPanel: React.FC<Props> = ({ logs, height = 120 }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    // 로그가 갱신될 때마다 가장 아래로 스크롤
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs]);

    return (
        <div className="w-full bg-[#505050] text-white text-sm px-4 py-2 overflow-y-auto" style={{ height }}>
            {logs.length === 0 ? (
                <p className="text-gray-400">No logs yet.</p>
            ) : (
                <>
                    {logs.map((log, idx) => (
                        <div key={idx} className="flex justify-between">
                            <span className="ml-2">{log.message}</span>
                            <span className="text-gray-400">[{log.timestamp}]</span>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </>
            )}
        </div>
    );
};

export default LogPanel;
