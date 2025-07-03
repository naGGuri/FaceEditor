# 파일: app/config.py

import os

# BASE 디렉토리 (app 기준)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# static 디렉토리
STATIC_DIR = os.path.join(BASE_DIR, "static")

# static 하위 디렉토리
MASKS_DIR = os.path.join(STATIC_DIR, "masks")
SESSIONS_DIR = os.path.join(STATIC_DIR, "sessions")
EYELINES_DIR = os.path.join(STATIC_DIR, "eyelines")
