# 파일: app/main.py
# 설명: FastAPI 진입점 및 업로드/세그멘테이션 라우트 정의

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
from app.routes import config
from app.routes import segment

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 중에는 전체 허용
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("app/static", exist_ok=True)

# 정적 파일 제공: /static 경로로 접근 가능하게 함
app.mount("/static", StaticFiles(directory="app/static"), name="static")

app.include_router(config.router)
app.include_router(segment.router)
