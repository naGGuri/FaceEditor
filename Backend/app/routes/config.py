# 파일: app/routes/config.py
# 설명: 세션 기반 설정(colorMap, opacityMap 등) 저장 및 불러오기 API

from fastapi import APIRouter, HTTPException
from app.schemas.config import ConfigPayload

# 🔧 임시 인메모리 저장소 (운영 환경에서는 DB 또는 파일/캐시 시스템으로 교체 예정)
SESSION_CONFIGS: dict[str, ConfigPayload] = {}

# 라우터 생성
router = APIRouter()


@router.post("/config/{session_id}")
async def save_config(session_id: str, payload: ConfigPayload):
    """
    특정 세션에 대한 색상/투명도 설정 저장

    Args:
        session_id (str): 고유 세션 ID
        payload (ConfigPayload): 저장할 설정 데이터 (colorMap, opacityMap)

    Returns:
        dict: 저장 완료 메시지
    """
    SESSION_CONFIGS[session_id] = payload
    print(
        f"[SAVE] session_id={session_id}, colorMapKeys={list(payload.colorMap.keys())}")

    return {"message": "Configuration saved successfully"}


@router.get("/config/{session_id}", response_model=ConfigPayload)
async def load_config(session_id: str):
    """
    특정 세션에 저장된 설정 불러오기

    Args:
        session_id (str): 고유 세션 ID

    Returns:
        ConfigPayload: 해당 세션의 저장된 설정 값

    Raises:
        HTTPException: 세션 ID가 존재하지 않을 경우 404 오류 반환
    """
    config = SESSION_CONFIGS.get(session_id)

    if config is None:
        raise HTTPException(
            status_code=404, detail="No config found for this session_id")
    print(f"[LOAD] session_id={session_id}")

    return config
