#!/usr/bin/env python3
"""Renders Potion Flow's original sound effects and ambient music.

    python3 tools/make_audio.py            # writes assets/audio/**.ogg

Everything is synthesised from scratch (no samples), so the audio is wholly
original and free of third-party licences:
  * liquid:  Van den Doel bubble model (rising-pitch damped sinusoids) + filtered noise
  * glass:   modal synthesis with inharmonic partials
  * magic:   bell/celesta partials, sparkles, shimmer
  * music:   detuned pad, sub bass, music-box melody, all through a stereo
             convolution reverb, rendered as a seamless loop.
Requires numpy, scipy and ffmpeg (libvorbis).
"""
import subprocess
import tempfile
import wave
from pathlib import Path

import numpy as np
from scipy import signal

SR = 44100
ROOT = Path(__file__).resolve().parent.parent
SFX_DIR = ROOT / "assets" / "audio" / "sfx"
MUSIC_DIR = ROOT / "assets" / "audio" / "music"
rng = np.random.default_rng(7)


# ---------------------------------------------------------------- utilities
def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def env_ad(n, attack, decay_tau):
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-np.maximum(t - attack, 0) / decay_tau)


def lowpass(x, hz, order=2):
    b, a = signal.butter(order, hz / (SR / 2), "low")
    return signal.lfilter(b, a, x, axis=0)


def highpass(x, hz, order=2):
    b, a = signal.butter(order, hz / (SR / 2), "high")
    return signal.lfilter(b, a, x, axis=0)


def bandpass(x, lo, hi, order=2):
    b, a = signal.butter(order, [lo / (SR / 2), hi / (SR / 2)], "band")
    return signal.lfilter(b, a, x, axis=0)


def place(buf, x, at):
    i = int(at * SR)
    if i >= len(buf):
        return
    n = min(len(x), len(buf) - i)
    buf[i:i + n] += x[:n]


def reverb_ir(seconds=2.2, decay=2.0, bright=6000, seed=1):
    """Stereo, decorrelated, exponentially decaying noise impulse response."""
    r = np.random.default_rng(seed)
    n = int(seconds * SR)
    t = np.arange(n) / SR
    env = np.exp(-t * (6.9 / decay))
    ir = r.standard_normal((n, 2)) * env[:, None]
    ir = lowpass(ir, bright)
    ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))[:, None]  # pre-delay softness
    return ir / np.sqrt(np.sum(ir ** 2, axis=0))


def add_reverb(dry, wet=0.25, seconds=2.0, decay=1.8, bright=6000, seed=1):
    """dry: mono or stereo array. Returns stereo with reverb tail appended."""
    if dry.ndim == 1:
        dry = np.stack([dry, dry], axis=1)
    ir = reverb_ir(seconds, decay, bright, seed)
    pad = np.zeros((len(ir), 2))
    d = np.concatenate([dry, pad])
    w = np.stack([signal.fftconvolve(d[:, c], ir[:, c])[: len(d)] for c in range(2)], axis=1)
    return d * (1 - wet) + w * wet


def trim_tail(x, thresh_db=-60):
    a = np.max(np.abs(x), axis=1) if x.ndim == 2 else np.abs(x)
    th = 10 ** (thresh_db / 20) * max(a.max(), 1e-9)
    idx = np.where(a > th)[0]
    end = idx[-1] + int(0.02 * SR) if len(idx) else len(x)
    out = x[:end].copy()
    f = min(len(out), int(0.03 * SR))
    out[-f:] *= np.linspace(1, 0, f)[:, None] if out.ndim == 2 else np.linspace(1, 0, f)
    return out


def normalize(x, peak_db):
    return x * (10 ** (peak_db / 20) / max(np.max(np.abs(x)), 1e-9))


def write_ogg(x, path, quality=5):
    path.parent.mkdir(parents=True, exist_ok=True)
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
        with wave.open(tmp.name, "wb") as w:
            w.setnchannels(2)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes(pcm.tobytes())
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", tmp.name, "-c:a", "libvorbis",
                        "-q:a", str(quality), str(path)], check=True)


# ---------------------------------------------------------------- instruments
def bubble(radius_mm, dur=None, amp=1.0, rise=0.1):
    """Van den Doel: f0 = 3.0/r (r in m) Hz, frequency rises as the bubble surfaces."""
    r = radius_mm / 1000.0
    f0 = 3.0 / r
    damp = 0.043 * f0 + 0.0014 * f0 ** 1.5
    dur = dur or min(0.25, 6.0 / damp)
    t = t_axis(dur)
    f = f0 * (1 + rise * damp * t)
    phase = 2 * np.pi * np.cumsum(f) / SR
    return amp * np.sin(phase) * np.exp(-damp * t)


def glass(f0, dur=0.6, amp=1.0, decay=0.35, partials=((1, 1), (2.32, .5), (4.25, .28), (6.63, .14), (9.4, .06))):
    t = t_axis(dur)
    out = np.zeros_like(t)
    for k, (ratio, a) in enumerate(partials):
        detune = 1 + rng.uniform(-0.002, 0.002)
        out += a * np.sin(2 * np.pi * f0 * ratio * detune * t) * np.exp(-t / (decay / (1 + 0.8 * k)))
    out *= np.clip(t / 0.0015, 0, 1) * tail_fade(len(t))
    return amp * out


def bell(freq, dur=1.6, amp=1.0, decay=0.9):
    """Celesta / music-box tone: mostly harmonic with a bright inharmonic strike."""
    t = t_axis(dur)
    tone = (np.sin(2 * np.pi * freq * t) * np.exp(-t / decay)
            + 0.45 * np.sin(2 * np.pi * freq * 2 * t) * np.exp(-t / (decay * 0.5))
            + 0.18 * np.sin(2 * np.pi * freq * 3.01 * t) * np.exp(-t / (decay * 0.3))
            + 0.12 * np.sin(2 * np.pi * freq * 4.2 * t) * np.exp(-t / 0.08))
    tone *= np.clip(t / 0.002, 0, 1) * tail_fade(len(t))
    return amp * tone


def sparkle(dur, count, lo=3000, hi=9000, amp=0.2):
    buf = np.zeros(int(dur * SR) + SR)
    for _ in range(count):
        f = rng.uniform(lo, hi)
        place(buf, glass(f, 0.25, amp * rng.uniform(0.4, 1), 0.08, ((1, 1), (2.7, .3))), rng.uniform(0, dur))
    return buf


def noise(dur):
    return rng.standard_normal(int(dur * SR))


def tail_fade(n, frac=0.35):
    """Smooth cosine fade over the last part of a note, so cut-offs never click."""
    f = np.ones(n)
    k = int(n * frac)
    f[n - k:] = 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, k))
    return f


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


# ---------------------------------------------------------------- sound effects
def sfx_select():
    x = glass(2093, 0.45, 1.0, 0.18)
    place(x, 0.35 * glass(3136, 0.3, 1.0, 0.1), 0.0)
    w = bandpass(noise(0.12), 2500, 7000) * env_ad(int(0.12 * SR), 0.03, 0.04) * 0.15
    x[: len(w)] += w
    return add_reverb(x, 0.18, 1.2, 0.9)


def sfx_deselect():
    return add_reverb(glass(1568, 0.35, 0.8, 0.12), 0.15, 1.0, 0.8)


def sfx_move():
    n = int(0.32 * SR)
    t = np.arange(n) / SR
    w = bandpass(noise(0.32), 400, 3500) * np.sin(np.pi * t / 0.32) ** 2
    clink = glass(1318, 0.3, 0.25, 0.08)
    x = w * 0.5
    x[: len(clink)] += clink
    return add_reverb(x, 0.15, 1.0, 0.7)


def sfx_pour():
    dur = 1.0
    n = int(dur * SR)
    t = np.arange(n) / SR
    envelope = np.clip(t / 0.06, 0, 1) * np.clip((dur - t) / 0.25, 0, 1)
    # Stream: filtered noise with a slow gurgling amplitude modulation.
    stream = bandpass(noise(dur), 300, 2600) * (0.55 + 0.45 * np.sin(2 * np.pi * 7.3 * t + 1.3 * np.sin(2 * np.pi * 1.7 * t)))
    buf = stream * 0.22 * envelope
    # Bubbles; their pitch creeps upward as the receiving bottle fills.
    for _ in range(70):
        at = rng.uniform(0.02, dur - 0.1)
        radius = rng.uniform(1.6, 4.2) * (1.0 - 0.35 * at / dur)
        place(buf, bubble(radius, amp=rng.uniform(0.08, 0.35)), at)
    buf = lowpass(buf, 7000)
    return add_reverb(buf, 0.12, 0.9, 0.6, 5000)


def sfx_land():
    buf = np.zeros(int(0.4 * SR))
    for k in range(6):
        place(buf, bubble(rng.uniform(2.5, 5.5), amp=rng.uniform(0.3, 0.8)), 0.01 + k * rng.uniform(0.01, 0.04))
    splash = bandpass(noise(0.12), 800, 5000) * env_ad(int(0.12 * SR), 0.002, 0.03) * 0.35
    buf[: len(splash)] += splash
    return add_reverb(buf, 0.15, 0.8, 0.6)


def sfx_complete():
    dur = 1.6
    buf = np.zeros(int(dur * SR))
    for i, n in enumerate([79, 83, 86, 91]):  # G5 B5 D6 G6
        place(buf, bell(midi(n), 1.4, 0.55, 0.7), i * 0.07)
    buf += sparkle(dur, 14, amp=0.12)[: len(buf)]
    cork = bandpass(noise(0.05), 300, 1500) * env_ad(int(0.05 * SR), 0.001, 0.01) * 0.6
    place(buf, cork, 0.0)
    return add_reverb(buf, 0.3, 2.4, 2.0)


def sfx_click():
    x = glass(2637, 0.08, 0.6, 0.025, ((1, 1), (2.1, .3)))
    tick = highpass(noise(0.006), 2000) * np.linspace(1, 0, int(0.006 * SR)) * 0.3
    x[: len(tick)] += tick
    return add_reverb(x, 0.08, 0.5, 0.3)


def sfx_level_complete():
    dur = 3.2
    buf = np.zeros(int(dur * SR))
    # Harp-like ascending arpeggio over a warm swell (D major add9).
    notes = [62, 66, 69, 74, 76, 78, 81, 86]
    for i, n in enumerate(notes):
        place(buf, bell(midi(n), 2.2, 0.5, 1.0), i * 0.085)
    t = t_axis(dur)
    pad = sum(np.sin(2 * np.pi * midi(n) * t + rng.uniform(0, 6)) for n in [50, 57, 62, 66])
    pad *= np.clip(t / 0.5, 0, 1) * np.exp(-np.maximum(t - 0.6, 0) / 0.9) * 0.08
    buf += pad
    place(buf, bell(midi(90), 2.4, 0.45, 1.3), 0.85)
    buf += sparkle(2.2, 30, amp=0.1)[: len(buf)]
    return add_reverb(buf, 0.32, 3.0, 2.6)


def sfx_coin():
    buf = np.zeros(int(0.7 * SR))
    place(buf, glass(1976, 0.6, 0.8, 0.25, ((1, 1), (2.76, .4), (5.4, .2))), 0.0)
    place(buf, glass(2637, 0.6, 0.9, 0.3, ((1, 1), (2.76, .4), (5.4, .2))), 0.075)
    return add_reverb(buf, 0.18, 1.2, 1.0)


def sfx_error():
    t = t_axis(0.32)
    f = 196 * (1 - 0.18 * t / 0.32)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    x = lowpass(tone * env_ad(len(t), 0.004, 0.08), 1200)
    second = np.sin(2 * np.pi * 165 * t) * env_ad(len(t), 0.004, 0.07)
    place(x, lowpass(second, 1000) * 0.8, 0.09)
    return add_reverb(x, 0.12, 0.7, 0.5)


def sfx_hint():
    buf = np.zeros(int(1.1 * SR))
    for i, n in enumerate([84, 88, 91, 96, 100]):
        place(buf, bell(midi(n), 0.9, 0.35, 0.45), i * 0.06)
    buf += sparkle(0.7, 12, 5000, 11000, 0.1)[: len(buf)]
    return add_reverb(buf, 0.3, 1.8, 1.5)


def sfx_unlock():
    dur = 1.8
    buf = np.zeros(int(dur * SR))
    t = t_axis(0.6)
    sweep = bandpass(noise(0.6), 500, 6000) * np.sin(np.pi * t / 0.6) ** 2 * 0.25
    buf[: len(sweep)] += sweep
    for i, n in enumerate([67, 71, 74, 79]):
        place(buf, bell(midi(n), 1.4, 0.45, 0.8), 0.35 + i * 0.03)
    buf += sparkle(1.3, 20, amp=0.1)[: len(buf)]
    return add_reverb(buf, 0.3, 2.4, 2.0)


SFX = {
    # id: (renderer, peak dBFS). Quieter peaks for frequent UI sounds.
    "select": (sfx_select, -9), "deselect": (sfx_deselect, -13), "move": (sfx_move, -12),
    "pour": (sfx_pour, -8), "land": (sfx_land, -10), "complete": (sfx_complete, -6),
    "click": (sfx_click, -14), "level_complete": (sfx_level_complete, -4), "coin": (sfx_coin, -8),
    "error": (sfx_error, -9), "hint": (sfx_hint, -7), "unlock": (sfx_unlock, -6),
}


# ---------------------------------------------------------------- music
def pad_voice(freq, t, cutoff_harm=7):
    """Warm detuned saw pad, band-limited by summing a few harmonics."""
    out = np.zeros_like(t)
    for det in (-0.006, 0.0, 0.0065):
        f = freq * (1 + det)
        for h in range(1, cutoff_harm + 1):
            out += np.sin(2 * np.pi * f * h * t + h * 0.7) / h * (0.85 ** h)
    return out / 3


def ambient_music():
    """~68 s seamless loop: Dmaj9 – Bm11 – Gmaj7#11 – Asus2, twice, melody varies."""
    bar = 4.25
    chords = [
        [50, 57, 61, 64, 66],   # Dmaj9:   D A C# E F#
        [47, 54, 57, 61, 64],   # Bm11:    B F# A C# E
        [43, 50, 54, 57, 61],   # Gmaj7#11 G D F# A C#
        [45, 52, 57, 59, 64],   # Asus2    A E A B E
    ]
    seq = chords * 4
    total = bar * len(seq)
    n = int(total * SR)
    t = np.arange(n) / SR
    mix = np.zeros((n, 2))

    # Pad: each chord crossfades with a long attack/release.
    for i, ch in enumerate(seq):
        start = i * bar
        seg_len = bar + 2.0
        ts = t_axis(seg_len)
        env = np.clip(ts / 1.6, 0, 1) * np.clip((seg_len - ts) / 2.0, 0, 1)
        voice = np.zeros_like(ts)
        for k, note in enumerate(ch):
            voice += pad_voice(midi(note), ts) * (0.9 if k else 0.6)
        voice = lowpass(voice * env, 1400)
        pan = 0.5 + 0.25 * np.sin(i)
        st = np.stack([voice * (1 - pan + 0.5), voice * (pan + 0.5)], axis=1) * 0.5
        idx = int(start * SR)
        end = min(n, idx + len(st))
        mix[idx:end] += st[: end - idx]
        if idx + len(st) > n:  # wrap the release into the loop start
            mix[: idx + len(st) - n] += st[end - idx:]
    # Sub bass on chord roots.
    for i, ch in enumerate(seq):
        ts = t_axis(bar)
        b = np.sin(2 * np.pi * midi(ch[0] - 12) * ts) * np.clip(ts / 0.4, 0, 1) * np.clip((bar - ts) / 0.6, 0, 1)
        place_st = int(i * bar * SR)
        mix[place_st:place_st + len(ts)] += (b * 0.22)[:, None][: n - place_st]

    # Music-box melody, D major pentatonic, sparse and gentle.
    scale = [74, 76, 78, 81, 83, 86, 88, 90]
    mel_rng = np.random.default_rng(21)
    melody = np.zeros(n + 4 * SR)
    beat = bar / 4
    for i in range(len(seq)):
        if i % 8 in (0, 1, 2, 3, 4, 5, 6, 7) and mel_rng.random() < 0.85:
            pos = 0
            idx = mel_rng.integers(0, 4)
            while pos < 4:
                if mel_rng.random() < 0.6:
                    note = scale[int(np.clip(idx, 0, len(scale) - 1))]
                    place(melody, bell(midi(note), 2.4, mel_rng.uniform(0.18, 0.3), 1.1),
                          i * bar + pos * beat + mel_rng.uniform(0, 0.02))
                idx += mel_rng.integers(-2, 3)
                pos += mel_rng.choice([1, 1, 2])
    melody[:4 * SR] += melody[n:n + 4 * SR]  # wrap ringing notes
    melody = melody[:n]
    mix[:, 0] += melody * 0.9
    mix[:, 1] += np.roll(melody, int(0.011 * SR)) * 0.9

    # Airy shimmer.
    shimmer = highpass(rng.standard_normal(n), 6000) * (0.012 + 0.008 * np.sin(2 * np.pi * t / 17.0))
    mix += np.stack([shimmer, np.roll(shimmer, 3000)], axis=1)

    # Big reverb; wrap the tail so the loop point is seamless.
    wet = add_reverb(mix, 0.45, 4.5, 4.0, 4500, seed=5)
    loop = wet[:n].copy()
    tail = wet[n:]
    loop[: len(tail)] += tail
    loop = highpass(lowpass(loop, 9000), 35)
    # Re-run once more through filters is not loop-safe; fix tiny DC/edge with a 5 ms crossfade.
    f = int(0.005 * SR)
    loop[:f] = loop[:f] * np.linspace(0, 1, f)[:, None] + loop[-f:] * np.linspace(1, 0, f)[:, None]
    loop = loop[:-f]
    return normalize(loop, -3)


def main():
    for name, (fn, peak) in SFX.items():
        x = normalize(trim_tail(fn()), peak)
        write_ogg(x, SFX_DIR / f"{name}.ogg")
        print(f"sfx  {name:15s} {len(x) / SR:5.2f}s")
    music = ambient_music()
    write_ogg(music, MUSIC_DIR / "ambient.ogg", quality=4)
    print(f"music ambient          {len(music) / SR:5.1f}s")


if __name__ == "__main__":
    main()
