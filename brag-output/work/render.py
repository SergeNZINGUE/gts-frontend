#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""TerraOps GTS -- Brag Video Renderer, 1280x720 @ 30fps, 21 seconds."""

import numpy as np
from PIL import Image, ImageDraw, ImageFont
import imageio
import wave, struct, math, subprocess, os, sys
from pathlib import Path

# ======================== constants ==========================
W, H, FPS = 1280, 720, 30
TOTAL = 21 * FPS  # 630

HOOK_S, HOOK_E         = 0,   75
XFADE1_S, XFADE1_E     = 75,  90
DASH_S, DASH_E         = 90,  240
XFADE2_S, XFADE2_E     = 240, 255
EQUIP_S, EQUIP_E       = 255, 405
XFADE3_S, XFADE3_E     = 405, 420
FIN_S, FIN_E           = 420, 540
XFADE4_S, XFADE4_E     = 540, 555
OUTRO_S, OUTRO_E       = 555, 630

# ======================== palette ============================
DARK_BG   = (13,  17,  23)
NAVY_BG   = (26,  26,  46)
ORANGE    = (255, 107,  0)
ORANGE_D  = (232,  93,  0)
TEAL      = ( 19, 222, 185)
LIGHT_BG  = (248, 250, 252)
CARD_BG   = (255, 255, 255)
NAVY_TXT  = ( 26,  26,  46)
MUTED     = (100, 116, 139)
WHITE     = (255, 255, 255)
GREEN     = ( 34, 197,  94)
GREEN_D   = ( 22, 163,  74)
WARN      = (245, 158,  11)
RED       = (239,  68,  68)
LT_GREEN  = (240, 253, 244)
LT_ORA    = (255, 247, 237)
LT_RED    = (254, 242, 242)
LT_BLUE   = (239, 246, 255)
BLUE      = ( 59, 130, 246)
SHADOW    = (200, 210, 220)
BORDER    = (226, 232, 240)

# ======================== fonts ==============================
FD = "C:/Windows/Fonts"

def lf(name, size):
    try:    return ImageFont.truetype(f"{FD}/{name}", size)
    except: return ImageFont.load_default()

F_HERO2   = lf("calibrib.ttf", 72)
F_TITLE   = lf("calibrib.ttf", 42)
F_TITLE2  = lf("calibrib.ttf", 32)
F_KPI2    = lf("calibrib.ttf", 44)
F_BODY    = lf("calibri.ttf",  22)
F_BODY2   = lf("calibri.ttf",  18)
F_SMALL   = lf("calibri.ttf",  15)
F_BADGE   = lf("calibrib.ttf", 13)
F_LABEL   = lf("calibri.ttf",  13)
F_TAG2    = lf("calibrib.ttf", 16)
F_OPS_LG  = lf("calibrib.ttf", 52)

# ======================== easing =============================
def eo(t, p=2): return 1-(1-min(t,1))**p
def eio(t):
    t = min(t,1); return t*t*(3-2*t)
def clamp(t): return max(0.0, min(1.0, float(t)))

def lc(c1, c2, t):
    t = clamp(t)
    return tuple(int(c1[i]+(c2[i]-c1[i])*t) for i in range(3))

# ======================== draw helpers =======================
def fa(im): return np.array(im.convert("RGB"))

def rr(d, x0,y0,x1,y1, r, fill, outline=None, ow=1):
    d.rounded_rectangle([(int(x0),int(y0)),(int(x1),int(y1))],
                         radius=int(r), fill=fill,
                         outline=outline, width=ow)

def txt_cen(d, text, font, cx, cy, color):
    bb = d.textbbox((0,0), text, font=font)
    w = bb[2]-bb[0]; h = bb[3]-bb[1]
    d.text((int(cx-w//2), int(cy-h//2)), text, font=font, fill=color)

def txt_left(d, text, font, x, y, color):
    d.text((int(x), int(y)), text, font=font, fill=color)

def txt_right(d, text, font, x, y, color):
    bb = d.textbbox((0,0), text, font=font)
    w = bb[2]-bb[0]
    d.text((int(x-w), int(y)), text, font=font, fill=color)

def circle(d, cx, cy, r, fill):
    r = int(r); cx = int(cx); cy = int(cy)
    d.ellipse([(cx-r,cy-r),(cx+r,cy+r)], fill=fill)

def blend(f1, f2, t):
    t_e = eio(t)
    return (f1.astype(float)*(1-t_e)+f2.astype(float)*t_e).astype(np.uint8)

def gradient_v(c_top, c_bot, width=W, height=H):
    arr = np.zeros((height, width, 3), dtype=np.float32)
    ys = np.linspace(0,1,height)[:,None]
    for i in range(3):
        arr[:,:,i] = c_top[i]*(1-ys)+c_bot[i]*ys
    return arr.astype(np.uint8)

def alpha_paste(base_arr, overlay_img, alpha):
    ov = np.array(overlay_img.convert("RGB")).astype(float)
    return (base_arr.astype(float)*(1-alpha)+ov*alpha).astype(np.uint8)

# ======================== logo ================================
def draw_logo_white(d, cx, cy, scale=1.0):
    s = scale
    icx = cx - int(110*s)
    icy = cy
    # chassis
    rr(d, icx-40*s, icy-8*s, icx+40*s, icy+8*s, 4*s, WHITE)
    # crane boom
    arm = [
        (icx-20*s, icy-8*s), (icx-5*s, icy-40*s),
        (icx+35*s, icy-40*s),(icx+35*s, icy-33*s),
        (icx-2*s,  icy-33*s),(icx-10*s, icy-8*s),
    ]
    d.polygon([(int(x),int(y)) for x,y in arm], fill=ORANGE)
    # hook line
    d.line([(int(icx+35*s),int(icy-33*s)),(int(icx+35*s),int(icy-18*s))],
           fill=WHITE, width=max(2,int(3*s)))
    # wheels
    for wx in [icx-22*s, icx+18*s]:
        circle(d, wx, icy+16*s, 10*s, WHITE)
        circle(d, wx, icy+16*s,  5*s, lc(DARK_BG, NAVY_BG, 0.5))
    # divider
    dv = cx - int(55*s)
    d.line([(dv,cy-int(35*s)),(dv,cy+int(35*s))], fill=ORANGE, width=max(1,int(2*s)))
    # text
    tx = cx - int(40*s)
    fs_terra = int(72*s); fs_ops = int(52*s)
    txt_left(d, "TERRA", lf("calibrib.ttf", max(10,fs_terra)), tx, cy-int(44*s), WHITE)
    txt_left(d, "OPS",   lf("calibrib.ttf", max(10,fs_ops)),   tx, cy+int( 2*s), ORANGE)

def draw_header(d):
    rr(d, 0, 0, W, 56, 0, NAVY_TXT)
    txt_left(d, "TERRA", lf("calibrib.ttf",20), 20, 16, WHITE)
    txt_left(d, "OPS",   lf("calibrib.ttf",13), 83, 24, ORANGE)
    txt_left(d, "GTS",   lf("calibri.ttf", 11), 83, 39, lc(MUTED, WHITE, 0.3))
    d.line([(112,14),(112,42)], fill=ORANGE, width=1)
    txt_left(d, "MINING  BTP  FLEET", lf("arialbd.ttf", 9), 120, 27, lc(MUTED, WHITE, 0.2))

# ======================== scenes ==============================

def render_hook(p):
    arr = gradient_v(DARK_BG, NAVY_BG)
    im  = Image.fromarray(arr)
    d   = ImageDraw.Draw(im)

    # orange accent lines slide in
    line_p = clamp(eo((p-0.0)/0.3))
    lw = int(W*0.6*line_p)
    if lw > 0:
        lx = W//2 - lw//2
        d.line([(lx, H//2+60),(lx+lw, H//2+60)], fill=ORANGE, width=3)
        d.line([(lx, H//2+66),(lx+lw, H//2+66)], fill=ORANGE_D, width=1)

    # logo fade + rise
    logo_a = clamp(eo((p-0.1)/0.4))
    logo_dy = int(30*(1-eo((p-0.1)/0.5)))
    if logo_a > 0.01:
        ly = Image.new("RGBA", (W,H), (0,0,0,0))
        ld = ImageDraw.Draw(ly)
        draw_logo_white(ld, W//2, H//2-20+logo_dy, scale=1.2)
        base = Image.fromarray(arr.copy())
        base.paste(ly, mask=ly.split()[3])
        arr2 = alpha_paste(arr, base, logo_a)
        im = Image.fromarray(arr2)
        d  = ImageDraw.Draw(im)

    # slug
    slug_a = clamp(eo((p-0.4)/0.3))
    if slug_a > 0.01:
        sc = lc(DARK_BG, lc(MUTED, WHITE, 0.5), slug_a)
        txt_cen(d, "MINING  -  BTP  -  FLEET", lf("arialbd.ttf",11), W//2, H//2+90, sc)

    # tagline
    tag_a = clamp(eo((p-0.55)/0.35))
    if tag_a > 0.01:
        tc = lc(DARK_BG, WHITE, tag_a*0.9)
        txt_cen(d, "Fleet operations. Fully tracked.", F_BODY, W//2, H//2+120, tc)

    return fa(im)


def render_dashboard(p):
    im = Image.new("RGB",(W,H), LIGHT_BG)
    d  = ImageDraw.Draw(im)
    draw_header(d)

    ta = clamp(eo(p/0.2))
    txt_left(d, "Tableau de bord", F_TITLE2, 40, 74, lc(LIGHT_BG, NAVY_TXT, ta))
    txt_right(d, "2026", F_BODY2, W-40, 80, lc(LIGHT_BG, MUTED, ta))

    kpis = [
        ("Clients",          24,       "references",     BLUE,   LT_BLUE),
        ("Engins",           18,       "12 disponibles", ORANGE, LT_ORA),
        ("Locations 2026",   47,       "3 actives",      WARN,   (255,251,235)),
        ("A encaisser (F)", 2450000,   "7 impayes",      RED,    LT_RED),
    ]

    cw = 270; ch = 130; gap = 18
    sx = (W - (4*cw + 3*gap))//2
    cy0 = 150

    for i, (label, val_full, sub, col, lt_col) in enumerate(kpis):
        delay = i * 0.12
        cp = clamp(eo((p-0.15-delay)/0.35))
        if cp < 0.01: continue
        dy = int(30*(1-cp))
        cx = sx + i*(cw+gap)
        cy = cy0 + dy

        rr(d, cx+3, cy+3, cx+cw+3, cy+ch+3, 10, lc(LIGHT_BG, SHADOW, cp))
        rr(d, cx,   cy,   cx+cw,   cy+ch,   10, lc(LIGHT_BG, CARD_BG, cp))

        ia = clamp(eo((p-0.2-delay)/0.25))
        circle(d, cx+cw-45, cy+ch//2, 28, lc(CARD_BG, lt_col, ia))
        circle(d, cx+cw-45, cy+ch//2, 14, lc(CARD_BG, col, ia))

        la = clamp(eo((p-0.25-delay)/0.25))
        txt_left(d, label, lf("calibri.ttf",14), cx+16, cy+18, lc(CARD_BG, MUTED, la))

        np2 = clamp(eo((p-0.30-delay)/0.40))
        val_now = int(val_full * np2)
        ns = f"{val_now:,}".replace(",", " ") if val_full > 9999 else str(val_now)
        txt_left(d, ns, F_KPI2, cx+16, cy+40, lc(CARD_BG, NAVY_TXT, np2))
        txt_left(d, sub, lf("calibri.ttf",14), cx+16, cy+96, lc(CARD_BG, MUTED, np2))

        ap = clamp(eo((p-0.45-delay)/0.25))
        if ap > 0:
            alw = int(cw*0.7*ap)
            d.line([(cx+16, cy+ch-6),(cx+16+alw, cy+ch-6)],
                   fill=lc(LIGHT_BG, col, ap), width=3)

    fin_kpis = [
        ("Chiffre d'affaires 2026", 47250000, "Factures validees + payees", GREEN),
        ("Carburant 2026",           8450000,  "Cout ravitaillements",      WARN),
        ("Maintenance 2026",         3200000,  "Total: 11.65M FCFA",       RED),
    ]
    fw = int((W-80)/3 - 12); fh = 120; fy = cy0+ch+26; fx0 = 40

    for i, (label, val_full, sub, col) in enumerate(fin_kpis):
        delay2 = 0.50 + i*0.10
        fp = clamp(eo((p-delay2)/0.35))
        if fp < 0.01: continue
        dy2 = int(25*(1-fp))
        cx2 = fx0 + i*(fw+18); cy2 = fy + dy2

        rr(d, cx2+3, cy2+3, cx2+fw+3, cy2+fh+3, 10, lc(LIGHT_BG, SHADOW, fp))
        rr(d, cx2,   cy2,   cx2+fw,   cy2+fh,   10, lc(LIGHT_BG, CARD_BG, fp))
        rr(d, cx2,   cy2,   cx2+5,    cy2+fh,    3, lc(CARD_BG, col, fp))

        txt_left(d, label, lf("calibri.ttf",14), cx2+16, cy2+14, lc(CARD_BG, MUTED, fp))
        np3 = clamp(eo((p-delay2-0.05)/0.40))
        vn  = int(val_full*np3)
        ns3 = f"{vn:,}".replace(",", " ")
        txt_left(d, ns3, lf("calibrib.ttf",32), cx2+16, cy2+36, lc(CARD_BG, col, np3))
        txt_left(d, "FCFA", F_BODY2, cx2+16, cy2+74, lc(CARD_BG, MUTED, np3))
        txt_left(d, sub,    lf("calibri.ttf",13), cx2+16, cy2+96, lc(CARD_BG, MUTED, np3*0.8))

    return fa(im)


def render_equipment(p):
    im = Image.new("RGB",(W,H), LIGHT_BG)
    d  = ImageDraw.Draw(im)
    draw_header(d)

    ta = clamp(eo(p/0.2))
    txt_left(d, "Parc materiel -- Suivi administratif", F_TITLE2, 40, 74,
             lc(LIGHT_BG, NAVY_TXT, ta))

    panels = [
        {
            "title": "Assurances engins",
            "col":   BLUE,
            "total": 18,
            "items": [
                ("En cours",      15, GREEN, LT_GREEN, "OK"),
                ("Expirent <30j",  3, WARN,  LT_ORA,   "!"),
                ("Expirees",       0, RED,   LT_RED,   "X"),
            ]
        },
        {
            "title": "Controles VGP",
            "col":   TEAL,
            "total": 15,
            "items": [
                ("Conformes",     12, GREEN, LT_GREEN, "OK"),
                ("A renouveler",   2, WARN,  LT_ORA,   "!"),
                ("En retard",      1, RED,   LT_RED,   "X"),
            ]
        },
    ]

    pw = (W-100)//2 - 10; ph = 260

    for pi, panel in enumerate(panels):
        dp = pi*0.15
        pp = clamp(eo((p-0.10-dp)/0.35))
        if pp < 0.01: continue
        dy = int(20*(1-pp))
        px = 40 + pi*(pw+20); py = 150 + dy

        rr(d, px+3, py+3, px+pw+3, py+ph+3, 12, lc(LIGHT_BG, SHADOW, pp))
        rr(d, px,   py,   px+pw,   py+ph,   12, lc(LIGHT_BG, CARD_BG, pp))

        pc = panel["col"]
        circle(d, px+26, py+30, 14, lc(CARD_BG, lc(LT_BLUE, LT_GREEN, pi*0.5), pp))
        circle(d, px+26, py+30,  7, lc(CARD_BG, pc, pp))
        txt_left(d, panel["title"], F_TAG2, px+48, py+20, lc(LIGHT_BG, NAVY_TXT, pp))
        txt_left(d, f"({panel['total']} au total)", lf("calibri.ttf",14),
                 px+48, py+40, lc(CARD_BG, MUTED, pp))

        bw = (pw-40)//3 - 8; bh = 120; bx0 = px+14; by0 = py+70

        for bi, (label, num, col, lt, icon_txt) in enumerate(panel["items"]):
            db = dp + bi*0.08 + 0.25
            bp = clamp(eo((p-db)/0.30))
            if bp < 0.01: continue
            bx = bx0 + bi*(bw+8); by = by0

            rr(d, bx, by, bx+bw, by+bh, 8, lc(CARD_BG, lt, bp), lc(CARD_BG, lc(lt,col,0.3), bp), 1)
            txt_cen(d, icon_txt, F_BODY,  bx+bw//2, by+24, lc(CARD_BG, col, bp))
            num_n = int(num*clamp(eo((p-db-0.05)/0.25)))
            txt_cen(d, str(num_n), F_KPI2, bx+bw//2, by+62, lc(CARD_BG, col if col!=GREEN else GREEN_D, bp))
            txt_cen(d, label, lf("calibri.ttf",13), bx+bw//2, by+96, lc(CARD_BG, lc(col,MUTED,0.4), bp))

            if num > 0 and col in (WARN, RED):
                bdp = clamp(eo((p-db-0.15)/0.20))
                if bdp > 0.01:
                    circle(d, bx+bw-8, by+8, 10, lc(CARD_BG, col, bdp))
                    txt_cen(d, str(num), lf("calibrib.ttf",13), bx+bw-8, by+9, lc(CARD_BG, WHITE, bdp))

    tagp = clamp(eo((p-0.75)/0.25))
    if tagp > 0.01:
        txt_cen(d, "Alertes automatiques -- rien n'expire sans notification.", F_BODY2,
                W//2, 468, lc(LIGHT_BG, MUTED, tagp))

    return fa(im)


def render_finance(p):
    arr = gradient_v(NAVY_BG, DARK_BG)
    im  = Image.fromarray(arr)
    d   = ImageDraw.Draw(im)

    hp = clamp(eo(p/0.25))
    if hp > 0.01:
        txt_left(d, "TERRA", lf("calibrib.ttf",18), 40, 18, lc(DARK_BG, WHITE, hp))
        txt_left(d, "OPS",   lf("calibrib.ttf",12), 100, 26, lc(DARK_BG, ORANGE, hp))
        d.line([(130,16),(130,42)], fill=lc(DARK_BG,ORANGE,hp*0.4), width=1)
        txt_left(d, "BILAN FINANCIER 2026", lf("calibrib.ttf",12),
                 142, 22, lc(DARK_BG, lc(MUTED,WHITE,0.3), hp))

    tp = clamp(eo((p-0.1)/0.3))
    if tp > 0.01:
        txt_cen(d, "De la mission a la facture,", F_TITLE2,  W//2, 110, lc(DARK_BG, WHITE, tp))
        txt_cen(d, "chaque centime compte.",       F_TITLE2,  W//2, 152, lc(DARK_BG, lc(MUTED,ORANGE,0.5), tp))

    blocks = [
        ("Chiffre d'affaires", 47250000, GREEN),
        ("Carburant",           8450000, WARN),
        ("Maintenance",         3200000, RED),
    ]

    bw = 330; bh = 180; total_w = 3*bw + 2*40
    bx0 = (W-total_w)//2; by0 = 210

    for i, (label, val, col) in enumerate(blocks):
        delay = 0.20 + i*0.12
        bp = clamp(eo((p-delay)/0.35))
        if bp < 0.01: continue
        dy = int(20*(1-bp))
        bx = bx0 + i*(bw+40); by = by0 + dy

        gc = lc(DARK_BG, lc(col, DARK_BG, 0.5), bp)
        rr(d, bx-1, by-1, bx+bw+1, by+bh+1, 14, gc)
        cc = lc(DARK_BG, lc(DARK_BG, lc(col, DARK_BG, 0.88), 1.0), bp)
        rr(d, bx, by, bx+bw, by+bh, 12, cc)
        rr(d, bx, by, bx+bw, by+4,   2, lc(DARK_BG, col, bp))

        txt_cen(d, label, F_BODY2, bx+bw//2, by+30, lc(DARK_BG, lc(MUTED,WHITE,0.4), bp))
        np2 = clamp(eo((p-delay-0.05)/0.45))
        vn  = int(val*np2)
        ns  = f"{vn:,}".replace(",", " ")
        txt_cen(d, ns,     lf("calibrib.ttf",38), bx+bw//2, by+90,  lc(DARK_BG, col, np2))
        txt_cen(d, "FCFA", F_BODY2,                bx+bw//2, by+130, lc(DARK_BG, lc(MUTED,WHITE,0.4), bp))

        if i > 0:
            pct = val/47250000*100
            pcn = pct*clamp(eo((p-delay-0.15)/0.35))
            txt_cen(d, f"{pcn:.1f}% du CA", lf("calibri.ttf",14),
                    bx+bw//2, by+158, lc(DARK_BG, lc(col,WHITE,0.3), bp))

    dp = clamp(eo((p-0.65)/0.25))
    if dp > 0.01:
        txt_cen(d, "Total depenses : 11 650 000 FCFA", F_BODY2, W//2, 430,
                lc(DARK_BG, lc(MUTED,WHITE,0.5), dp))

    np3 = clamp(eo((p-0.72)/0.25))
    if np3 > 0.01:
        d.line([(W//2-220,448),(W//2+220,448)], fill=lc(DARK_BG,lc(MUTED,WHITE,0.2),np3), width=1)
        txt_cen(d, "Resultat brut : 35 600 000 FCFA", F_TAG2, W//2, 475, lc(DARK_BG, GREEN, np3))

    mp = clamp(eo((p-0.82)/0.18))
    if mp > 0.01:
        txt_cen(d, "Factures, reglements et rapports -- tout en un.", F_BODY2,
                W//2, 530, lc(DARK_BG, lc(MUTED,WHITE,0.3), mp))

    return fa(im)


def render_outro(p):
    arr = gradient_v(DARK_BG, NAVY_BG)
    im  = Image.fromarray(arr)
    d   = ImageDraw.Draw(im)

    gp = clamp(eio(p))
    if gp > 0.01:
        for ri in range(15, 0, -1):
            rv = ri*12
            ag = gp*(1-ri/16)*0.15
            gc = tuple(int(ORANGE[i]*ag + DARK_BG[i]*(1-ag)) for i in range(3))
            circle(d, W//2, H//2-30, rv, gc)

    tp = clamp(eo((p-0.05)/0.40))
    if tp > 0.01:
        txt_cen(d, "De la mission a la facture.", F_TITLE, W//2, H//2-130,
                lc(DARK_BG, WHITE, tp*0.95))

    lp = clamp(eo((p-0.20)/0.45))
    if lp > 0.01:
        ly = Image.new("RGBA",(W,H),(0,0,0,0))
        ld = ImageDraw.Draw(ly)
        draw_logo_white(ld, W//2, H//2-20, scale=1.3)
        base = Image.fromarray(arr.copy())
        base.paste(ly, mask=ly.split()[3])
        arr2 = alpha_paste(arr.copy(), base, lp)
        im = Image.fromarray(arr2)
        d  = ImageDraw.Draw(im)

    sp = clamp(eo((p-0.55)/0.35))
    if sp > 0.01:
        txt_cen(d, "MINING  -  BTP  -  FLEET", lf("arialbd.ttf",12),
                W//2, H//2+85, lc(DARK_BG, lc(MUTED,WHITE,0.4), sp))

    up = clamp(eo((p-0.70)/0.30))
    if up > 0.01:
        txt_cen(d, "Angular 19  *  Spring Boot  *  Railway", lf("calibri.ttf",14),
                W//2, H//2+115, lc(DARK_BG, ORANGE, up*0.7))

    return fa(im)


# ======================== dispatcher ==========================
def render_frame(fi):
    if fi < HOOK_E:
        return render_hook(fi/HOOK_E)
    elif fi < XFADE1_E:
        t = (fi-XFADE1_S)/(XFADE1_E-XFADE1_S)
        return blend(render_hook(1.0), render_dashboard(0.0), t)
    elif fi < DASH_E:
        return render_dashboard((fi-DASH_S)/(DASH_E-DASH_S))
    elif fi < XFADE2_E:
        t = (fi-XFADE2_S)/(XFADE2_E-XFADE2_S)
        return blend(render_dashboard(1.0), render_equipment(0.0), t)
    elif fi < EQUIP_E:
        return render_equipment((fi-EQUIP_S)/(EQUIP_E-EQUIP_S))
    elif fi < XFADE3_E:
        t = (fi-XFADE3_S)/(XFADE3_E-XFADE3_S)
        return blend(render_equipment(1.0), render_finance(0.0), t)
    elif fi < FIN_E:
        return render_finance((fi-FIN_S)/(FIN_E-FIN_S))
    elif fi < XFADE4_E:
        t = (fi-XFADE4_S)/(XFADE4_E-XFADE4_S)
        return blend(render_finance(1.0), render_outro(0.0), t)
    else:
        return render_outro((fi-OUTRO_S)/(OUTRO_E-OUTRO_S))


# ======================== audio ===============================
def gen_audio(path, duration=21.0, sr=44100):
    n = int(sr*duration)
    sig = np.zeros(n, dtype=np.float32)
    bpm = 120; beat = 60/bpm; chord_dur = beat*4

    CHORDS = [
        [220.00, 261.63, 329.63],   # Am
        [174.61, 220.00, 261.63],   # F
        [261.63, 329.63, 392.00],   # C
        [196.00, 246.94, 293.66],   # G
    ]

    def pad(freq, start, dur, amp=0.10):
        s = int(start*sr); e = min(int((start+dur)*sr), n)
        if s >= n: return
        ln = e-s; tl = np.arange(ln)/sr
        w = (np.sin(2*math.pi*freq*tl)*0.6 +
             np.sin(2*math.pi*freq*2*tl)*0.25 +
             np.sin(2*math.pi*freq*3*tl)*0.15)
        at = int(0.3*sr); re = int(0.5*sr)
        env = np.ones(ln)
        env[:min(at,ln)] = np.linspace(0,1,min(at,ln))
        env[max(0,ln-re):] *= np.linspace(1,0, ln-max(0,ln-re))
        sig[s:e] += (w*env*amp).astype(np.float32)

    def bass(freq, start, dur, amp=0.30):
        s = int(start*sr); e = min(int((start+dur)*sr), n)
        if s >= n: return
        ln = e-s; tl = np.arange(ln)/sr
        w = np.sin(2*math.pi*freq*tl*0.5)
        env = np.exp(-tl*(3/dur))
        sig[s:e] += (w*env*amp).astype(np.float32)

    for m in range(5):
        ci = m % 4; chord = CHORDS[ci]; ts = m*chord_dur
        if ts >= duration: break
        for freq in chord:
            pad(freq, ts, chord_dur*0.98, 0.10)
            pad(freq*2, ts+0.05, chord_dur*0.93, 0.04)
        bass(chord[0], ts,        beat*0.8, 0.32)
        bass(chord[0], ts+beat*2, beat*0.8, 0.25)
        for b in range(4):
            bt = ts+b*beat; sb = int(bt*sr); db = int(0.03*sr)
            eb = min(sb+db, n)
            if eb > sb:
                en = np.exp(-np.arange(eb-sb)/(db//6+1)*3)
                sig[sb:eb] += (np.random.randn(eb-sb)*en*0.06).astype(np.float32)
        mel_f = chord[-1]
        s_m = int(ts*sr); e_m = min(int((ts+beat*1.5)*sr), n)
        if e_m > s_m:
            ln = e_m-s_m; tl = np.arange(ln)/sr
            wm = np.sin(2*math.pi*mel_f*tl)
            en = np.exp(-tl*2)
            sig[s_m:e_m] += (wm*en*0.15).astype(np.float32)

    fade_s = int((duration-1.5)*sr)
    if fade_s < n:
        sig[fade_s:] *= np.linspace(1,0,n-fade_s)

    mx = np.max(np.abs(sig))
    if mx > 0: sig /= mx
    pcm = (sig*32000).astype(np.int16)

    with wave.open(path, 'w') as wf:
        wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(sr)
        wf.writeframes(pcm.tobytes())


# ======================== main ================================
def main():
    out_dir  = Path(__file__).parent.parent
    work_dir = Path(__file__).parent

    video_silent = str(work_dir / "video_silent.mp4")
    audio_path   = str(work_dir / "audio.wav")
    poster_path  = str(out_dir  / "brag.jpg")
    final_path   = str(out_dir  / "brag.mp4")

    from imageio_ffmpeg import get_ffmpeg_exe
    ffmpeg = get_ffmpeg_exe()

    print(f"Rendering {TOTAL} frames at {W}x{H} @ {FPS}fps ...")

    import imageio.v2 as iio
    writer = iio.get_writer(
        video_silent, fps=FPS,
        codec="libx264",
        ffmpeg_params=["-pix_fmt","yuv420p","-preset","fast","-crf","18"]
    )

    for fi in range(TOTAL):
        frame = render_frame(fi)
        writer.append_data(frame)
        if fi % 60 == 0:
            pct = fi/TOTAL*100
            print(f"  {fi}/{TOTAL}  {pct:.0f}%")

    writer.close()
    print("Frames done.")

    print("Generating audio ...")
    gen_audio(audio_path, duration=TOTAL/FPS)
    print("Audio done.")

    print("Merging ...")
    r = subprocess.run([
        ffmpeg, "-y",
        "-i", video_silent,
        "-i", audio_path,
        "-c:v", "copy",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest", final_path
    ], capture_output=True)
    if r.returncode != 0:
        print("ffmpeg merge error:", r.stderr.decode())
        sys.exit(1)
    print(f"Merged -> {final_path}")

    print("Saving poster ...")
    poster_frame = render_dashboard(0.92)
    Image.fromarray(poster_frame).save(poster_path, "JPEG", quality=92)
    print(f"Poster -> {poster_path}")

    # Bake poster as first frame
    print("Baking poster ...")
    r2 = subprocess.run([
        ffmpeg, "-y",
        "-loop", "1", "-t", "0.034", "-i", poster_path,
        "-i", final_path,
        "-filter_complex",
        "[0:v]scale=1280:720,fps=30[poster];[poster][1:v]concat=n=2:v=1:a=0[vout]",
        "-map", "[vout]", "-map", "1:a",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "fast", "-crf", "18",
        "-c:a", "copy",
        final_path+"_tmp.mp4"
    ], capture_output=True)
    if r2.returncode == 0:
        import shutil; shutil.move(final_path+"_tmp.mp4", final_path)
        print("Poster baked.")
    else:
        print("Poster bake skipped:", r2.stderr.decode()[:200])

    print(f"\nDone! -> {final_path}")
    print(f"Poster -> {poster_path}")


if __name__ == "__main__":
    main()
