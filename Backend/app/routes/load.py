# 파일: app/routes/load.py
# 설명: 세션 불러오기 API - 세션 ID로 저장된 color_map, opacity_map 불러오기

from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse
import os
import json
from app.config import SESSIONS_DIR

router = APIRouter()


@router.get("/load")
def load_session(session_id: str = Query(...)):
    try:
        session_path = os.path.join(SESSIONS_DIR, f"{session_id}.json")

        if not os.path.exists(session_path):
            print(f"⚠️ 세션 파일 없음: {session_path}")
            raise HTTPException(status_code=404, detail="Session not found")

        with open(session_path, "r") as f:
            data = json.load(f)

        print(f"✅ 세션 불러오기 성공: {session_path}")
        return JSONResponse(content=data)
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 세션 불러오기 실패: {e}")
        raise HTTPException(status_code=500, detail="Failed to load session")
