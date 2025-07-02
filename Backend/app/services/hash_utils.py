# app/services/hash_utils.py
# 이미지 바이너리에서 MD5 해시 생성

import hashlib


def compute_image_hash(image_bytes: bytes) -> str:
    return hashlib.md5(image_bytes).hexdigest()
