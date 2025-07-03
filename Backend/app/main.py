# 파일: app/main.py
# 설명: FastAPI 진입점 및 업로드/세그멘테이션 라우트 정의

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os

from app.routes import segment, save, load, eyeline
from app.config import STATIC_DIR

app = FastAPI()
app.include_router(segment.router)
app.include_router(save.router)
app.include_router(load.router)
app.include_router(eyeline.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 중에는 전체 허용
    allow_methods=["*"],
    allow_headers=["*"],
)

# 존재하지 않으면 생성
os.makedirs(STATIC_DIR, exist_ok=True)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
