# 파일: app/routes/save.py
# 설명: 세션 저장 API - 색상 및 투명도 설정 정보를 static/sessions에 JSON으로 저장

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import json
from app.config import SESSIONS_DIR

router = APIRouter()


class SavePayload(BaseModel):
    session_id: str
    color_map: dict[str, list[int]]  # 예: {"1": [255, 0, 0]}
    opacity_map: dict[str, float]    # 예: {"1": 0.5}


@router.post("/save")
def save_session(payload: SavePayload):
    try:
        os.makedirs(SESSIONS_DIR, exist_ok=True)
        session_path = os.path.join(SESSIONS_DIR, f"{payload.session_id}.json")

        with open(session_path, "w") as f:
            json.dump(payload.dict(), f, indent=2)

        print(f"✅ 세션 저장 완료: {session_path}")
        return {"message": "Session saved successfully"}
    except Exception as e:
        print(f"❌ 세션 저장 실패: {e}")
        raise HTTPException(status_code=500, detail="Failed to save session")
