#!/usr/bin/env python3
"""生成官网社交分享封面 site/assets/og-cover.png（1200×630）。

用途：index.html 的 og:image。WeChat / Weibo / Twitter 等爬虫需要绝对 URL，
且偏好 1.91:1 的横版图——竖版游戏截图和二维码都不适合直接当封面，
所以这里用真实战斗画面做底，重新排版标题，右下角放小程序码。

依赖：Pillow + macOS 自带中文字体。
    python3 site/tools/make_og_cover.py
"""

import os
import sys

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")
OUT = os.path.join(ASSETS, "og-cover.png")

W, H = 1200, 630

GOLD = (232, 196, 122)
DIM = (168, 160, 180)
TEXT = (243, 240, 248)

CJK_BOLD = "/System/Library/Fonts/STHeiti Medium.ttc"
CJK_REG = "/System/Library/Fonts/Hiragino Sans GB.ttc"
MONO = "/System/Library/Fonts/Menlo.ttc"


def font(path, size):
    if not os.path.exists(path):
        sys.exit(f"缺少字体文件: {path}")
    return ImageFont.truetype(path, size)


def tracked_text(draw, xy, text, fnt, fill, tracking=0):
    """按字符间距逐字绘制（letter-spacing），等宽字体排版用。"""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += draw.textlength(ch, font=fnt) + tracking
    return x


def load_background():
    """真实战斗画面做底：裁中间区域 + 压暗 + 轻微模糊，避免抢标题。"""
    src = os.path.join(ASSETS, "shots", "crowd.webp")
    if not os.path.exists(src):
        return None
    im = Image.open(src).convert("RGB")
    # 取中段（密集战斗区），裁成 1200x630
    cw, ch = im.size
    crop_h = int(cw * H / W)
    top = int(ch * 0.34)
    im = im.crop((0, top, cw, min(top + crop_h, ch)))
    if im.height < crop_h:
        im = im.crop((0, 0, cw, ch))
    im = im.resize((W, H), Image.LANCZOS)
    im = im.filter(ImageFilter.GaussianBlur(1.4))
    # 压暗
    im = Image.blend(im, Image.new("RGB", (W, H), (14, 11, 20)), 0.72)
    return im


def main():
    bg = load_background()
    if bg is None:
        bg = Image.new("RGB", (W, H), (18, 15, 26))
    bg = bg.convert("RGBA")

    # 左侧渐变遮罩，保证文字可读
    shade = Image.new("L", (W, 1))
    sp = shade.load()
    for x in range(W):
        t = x / (W - 1)
        sp[x, 0] = int(232 * max(0.0, 1 - t / 0.62) ** 1.25)
    shade = shade.resize((W, H))
    dark = Image.new("RGBA", (W, H), (10, 8, 16, 255))
    bg = Image.composite(dark, bg, shade)

    draw = ImageDraw.Draw(bg)

    # 顶部标签
    tracked_text(draw, (70, 66), "WECHAT MINI GAME", font(MONO, 19), GOLD, tracking=3)

    # 主标题
    draw.text((70, 112), "暗夜幸存者", font=font(CJK_BOLD, 88), fill=TEXT)

    # 英文名
    tracked_text(draw, (74, 228), "NIGHT SURVIVORS", font(MONO, 28), GOLD, tracking=6)

    draw.rectangle([70, 284, 250, 286], fill=(78, 68, 92))

    draw.text((70, 312), "血月降临，活到第一缕晨光", font=font(CJK_REG, 33), fill=DIM)

    draw.text(
        (70, 378),
        "10 位英雄  ·  10 条超武进化  ·  单人与双人攻城",
        font=font(CJK_REG, 26),
        fill=(210, 204, 218),
    )
    draw.text(
        (70, 424),
        "原生微信小游戏 · 扫码即玩 · 无需下载",
        font=font(CJK_REG, 24),
        fill=DIM,
    )

    # 右下角小程序码
    qr_path = os.path.join(ASSETS, "wxcode.png")
    if os.path.exists(qr_path):
        qr = Image.open(qr_path).convert("RGB")
        qs = 188
        qr = qr.resize((qs, qs), Image.LANCZOS)
        qx, qy = W - qs - 62, H - qs - 58
        card = Image.new("RGBA", (qs + 24, qs + 24), (255, 255, 255, 242))
        card = card.filter(ImageFilter.GaussianBlur(0.4))
        shadow = Image.new("RGBA", card.size, (0, 0, 0, 0))
        shadow.putalpha(card.getchannel("A").point(lambda a: int(a * 0.35)))
        bg.alpha_composite(shadow, (qx + 12 - 6, qy + 12 - 6))
        bg.alpha_composite(card, (qx - 12, qy - 12))
        bg.paste(qr, (qx, qy))
        draw = ImageDraw.Draw(bg)
        tip = "微信扫码即玩"
        tw = draw.textlength(tip, font=font(CJK_REG, 22))
        draw.text((W - 62 - tw, H - qs - 92), tip, font=font(CJK_REG, 22), fill=GOLD)

    bg.convert("RGB").save(OUT, "PNG", optimize=True)
    print(f"已生成 {OUT} ({W}x{H}, {os.path.getsize(OUT)//1024}KB)")


if __name__ == "__main__":
    main()
