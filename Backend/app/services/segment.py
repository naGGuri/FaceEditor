# 파일: app/services/segment.py
# 설명: BiSeNet 모델 로딩 및 얼굴 세그멘테이션 실행

import os
import torch
import numpy as np
import torchvision.transforms as transforms
from PIL import Image
from app.models.bisenet import BiSeNet


# 세그멘테이션 클래스 수
N_CLASSES = 19

# 모델 경로 및 로딩 (최초 1회만 수행)
_MODEL_PATH = "app/models/bisenet.pth"
_DEVICE = "cpu"  # GPU 사용 시 "cuda" 로 변경

# 모델 초기화
net = BiSeNet(n_classes=N_CLASSES)
net.load_state_dict(torch.load(_MODEL_PATH, map_location=_DEVICE))
net.to(_DEVICE)
net.eval()

# 전처리 transform
_transform = transforms.Compose([
    transforms.Resize((512, 512)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
])


def run_face_segmentation(image_path: str, session_id: str) -> tuple[str, list[list[int]]]:
    """
    얼굴 세그멘테이션 실행 함수

    Args:
        image_path (str): 입력 이미지 경로
        session_id (str): 세션 고유 ID (마스크 저장용)

    Returns:
        tuple: 마스크 파일 경로, 파트 인덱스 맵 (2D 리스트)
    """
    # 이미지 로딩 및 전처리
    image = Image.open(image_path).convert("RGB")
    tensor = _transform(image).unsqueeze(0).to(_DEVICE)

    with torch.no_grad():
        output = net(tensor)[0]  # (N, C, H, W)
        parsing = output.squeeze(0).cpu().numpy().argmax(0)  # (H, W)

    # 마스크 이미지 저장 (grayscale)
    mask_img = Image.fromarray(parsing.astype(np.uint8), mode="L")
    mask_path = f"app/static/{session_id}_mask.png"
    mask_img.save(mask_path)

    # 결과 반환
    return mask_path, parsing.tolist()
