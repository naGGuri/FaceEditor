# app/services/segment.py

from app.models.bisenet import BiSeNet

import torch
import numpy as np
import torchvision.transforms as transforms
import json
from PIL import Image
import io
import os

N_CLASSES = 19
_MODEL_PATH = "app/models/bisenet.pth"
_DEVICE = "cpu"

# 모델 초기화
net = BiSeNet(n_classes=N_CLASSES)
net.load_state_dict(torch.load(_MODEL_PATH, map_location=_DEVICE))
net.to(_DEVICE)
net.eval()

_transform = transforms.Compose([
    transforms.Resize((512, 512)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
])


def run_segment(content: bytes, mask_path: str) -> str:
    """
    이미지 바이트를 받아 세그멘테이션 후 마스크 이미지 저장
    """
    image = Image.open(io.BytesIO(content)).convert("RGB")
    tensor = _transform(image).unsqueeze(0).to(_DEVICE)

    with torch.no_grad():
        output = net(tensor)[0]
        parsing = output.squeeze(0).cpu().numpy().argmax(0)

    # 마스크 저장 (grayscale)
    mask_img = Image.fromarray(parsing.astype(np.uint8), mode="L")
    mask_img.save(mask_path)
