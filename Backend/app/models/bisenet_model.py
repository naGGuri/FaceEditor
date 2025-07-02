# 파일: app/models/bisenet_model.py
# 설명: BiSeNet 아키텍처 정의 (PyTorch 기반)

import torch
import torch.nn as nn
import torch.nn.functional as F


class ConvBNReLU(nn.Module):
    def __init__(self, in_chan, out_chan, ks=3, stride=1, padding=1):
        super().__init__()
        self.conv = nn.Conv2d(in_chan, out_chan, ks,
                              stride, padding, bias=False)
        self.bn = nn.BatchNorm2d(out_chan)
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x):
        return self.relu(self.bn(self.conv(x)))


class AttentionRefinementModule(nn.Module):
    def __init__(self, in_chan, out_chan):
        super().__init__()
        self.conv = ConvBNReLU(in_chan, out_chan, ks=3, stride=1, padding=1)
        self.attention = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Conv2d(out_chan, out_chan, kernel_size=1, bias=False),
            nn.BatchNorm2d(out_chan),
            nn.Sigmoid()
        )

    def forward(self, x):
        feat = self.conv(x)
        att = self.attention(feat)
        return feat * att


class FeatureFusionModule(nn.Module):
    def __init__(self, in_chan, out_chan):
        super().__init__()
        self.conv = ConvBNReLU(in_chan, out_chan, ks=1, stride=1, padding=0)
        self.attention = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Conv2d(out_chan, out_chan // 4, kernel_size=1),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_chan // 4, out_chan, kernel_size=1),
            nn.Sigmoid()
        )

    def forward(self, x):
        feat = self.conv(x)
        att = self.attention(feat)
        return feat * att + feat


class BiSeNetOutput(nn.Module):
    def __init__(self, in_chan, mid_chan, out_chan):
        super().__init__()
        self.conv = nn.Sequential(
            ConvBNReLU(in_chan, mid_chan, ks=3, stride=1, padding=1),
            nn.Conv2d(mid_chan, out_chan, kernel_size=1)
        )

    def forward(self, x):
        return self.conv(x)


class BiSeNet(nn.Module):
    def __init__(self, n_classes=19):
        super().__init__()
        self.conv1 = ConvBNReLU(3, 64, 3, 2, 1)  # Downsample 1/2
        self.conv2 = ConvBNReLU(64, 128, 3, 2, 1)  # 1/4
        self.conv3 = ConvBNReLU(128, 256, 3, 2, 1)  # 1/8
        self.conv4 = ConvBNReLU(256, 512, 3, 2, 1)  # 1/16

        self.arm16 = AttentionRefinementModule(512, 128)
        self.arm32 = AttentionRefinementModule(512, 128)

        self.conv_avg = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            ConvBNReLU(512, 128, ks=1, stride=1, padding=0)
        )

        self.ffm = FeatureFusionModule(256 + 128, 256)
        self.out = BiSeNetOutput(256, 256, n_classes)

    def forward(self, x):
        H, W = x.size()[2], x.size()[3]
        feat1 = self.conv1(x)
        feat2 = self.conv2(feat1)
        feat3 = self.conv3(feat2)
        feat4 = self.conv4(feat3)

        avg = self.conv_avg(feat4)
        avg = F.interpolate(avg, size=feat4.size()[
                            2:], mode='bilinear', align_corners=True)

        feat4 = self.arm32(feat4)
        feat4 += avg
        feat4_up = F.interpolate(feat4, size=feat3.size()[
                                 2:], mode='bilinear', align_corners=True)

        feat3 = self.arm16(feat3)
        feat3 += feat4_up

        feat3_up = F.interpolate(feat3, size=(
            H, W), mode='bilinear', align_corners=True)
        feat2_up = F.interpolate(feat2, size=(
            H, W), mode='bilinear', align_corners=True)

        concat = torch.cat([feat2_up, feat3_up], dim=1)
        out = self.ffm(concat)
        out = self.out(out)
        return out
