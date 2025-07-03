# app/routes/segment.py

from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
from app.services.hash_utils import compute_image_hash
from app.services.segment import run_segment
import os
from app.config import MASKS_DIR

router = APIRouter()


@router.post("/segment")
async def segment_face(file: UploadFile = File(...)):
    """
    업로드된 얼굴 이미지를 세그멘테이션하고 마스크 이미지를 반환한다.
    """

    content = await file.read()
    image_hash = compute_image_hash(content)
    mask_filename = f"{image_hash}_mask.png"
    mask_path = os.path.join(MASKS_DIR, mask_filename)
    # print(mask_path)

    # 디렉토리 없으면 생성
    os.makedirs(MASKS_DIR, exist_ok=True)

    if not os.path.exists(mask_path):
        run_segment(content, mask_path)

    return {
        "session_id": image_hash,
        "mask_url": f"/static/masks/{mask_filename}"
    }
