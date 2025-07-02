# 파일: app/models/config.py
# 설명: 세션별 설정 저장을 위한 Pydantic 모델 정의

from pydantic import BaseModel
from typing import Dict, List, Tuple


class ConfigPayload(BaseModel):
    # 부위 ID를 키로 가지며 RGB 색상 튜플을 값으로 가짐
    colorMap: Dict[int, Tuple[int, int, int]]

    # 부위 ID를 키로 가지며 투명도(0~255)를 값으로 가짐
    opacityMap: Dict[int, int]
