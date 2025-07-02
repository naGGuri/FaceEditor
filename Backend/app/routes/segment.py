# 파일: app/routes/segment.py
# 설명: 업로드된 이미지를 기반으로 세그멘테이션을 수행하고 결과 반환

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import uuid
from app.services.segment import run_face_segmentation  # 경로 수정

import os

router = APIRouter()  # 함수 호출로 변경해야 제대로 작동함


@router.post("/segment")
async def segment_face(file: UploadFile = File(...)):
    """
    업로드된 얼굴 이미지를 세그멘테이션하고 결과 마스크와 part_index_map을 반환합니다.
    """

    # 1. 고유한 세션 ID 생성
    session_id = str(uuid.uuid4())

    # 2. 저장 경로 설정
    static_dir = "app/static"
    os.makedirs(static_dir, exist_ok=True)  # 디렉토리 없으면 생성
    input_path = os.path.join(static_dir, f"{session_id}_input.jpg")

    try:
        # 3. 업로드 파일 저장
        with open(input_path, "wb") as f:
            f.write(await file.read())

        # 4. 얼굴 세그멘테이션 실행
        mask_path, part_index_map = run_face_segmentation(
            input_path, session_id)

        # 5. 결과 반환
        return JSONResponse(content={
            "session_id": session_id,
            "mask_url": mask_path,  # 상대 URL 경로 (예: static/xxxx_mask.png)
            "part_index_map": part_index_map
        })

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Segmentation failed: {str(e)}")
