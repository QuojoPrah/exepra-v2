#!/usr/bin/env python3
"""Potion Flow level authoring tool.

Generates the shipped level files (levels/level_NNN.json) and proves every one
of them is solvable. The rules here mirror scripts/core/board_state.gd and the
search mirrors scripts/core/solver.gd, so this file doubles as an executable
reference for the game logic (see tools/test_level_tool.py).

Usage:
    python3 tools/level_tool.py generate --count 150
    python3 tools/level_tool.py verify
"""
from __future__ import annotations

import argparse
import json
import random
from collections import deque
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LEVEL_DIR = ROOT / "levels"

# Order matters: early levels use the first colours, chosen for maximum contrast.
COLORS = [
    "red", "blue", "green", "yellow", "violet",
    "orange", "cyan", "pink", "lime", "magenta",
]


# --------------------------------------------------------------------------
# Board rules (mirror of BoardState)
# --------------------------------------------------------------------------
class Board:
    def __init__(self, bottles, capacity=4):
        self.capacity = capacity
        self.bottles = [list(b) for b in bottles]

    def clone(self):
        return Board(self.bottles, self.capacity)

    def top(self, i):
        b = self.bottles[i]
        return b[-1] if b else ""

    def top_run(self, i):
        b = self.bottles[i]
        if not b:
            return 0
        c = b[-1]
        n = 0
        for x in reversed(b):
            if x != c:
                break
            n += 1
        return n

    def space(self, i):
        return self.capacity - len(self.bottles[i])

    def is_complete(self, i):
        b = self.bottles[i]
        return len(b) == self.capacity and all(x == b[0] for x in b)

    def is_uniform(self, i):
        b = self.bottles[i]
        return bool(b) and all(x == b[0] for x in b)

    def can_pour(self, a, b):
        if a == b or not (0 <= a < len(self.bottles)) or not (0 <= b < len(self.bottles)):
            return False
        if not self.bottles[a] or self.space(b) <= 0:
            return False
        return not self.bottles[b] or self.top(b) == self.top(a)

    def pour_amount(self, a, b):
        if not self.can_pour(a, b):
            return 0
        return min(self.top_run(a), self.space(b))

    def pour(self, a, b):
        n = self.pour_amount(a, b)
        for _ in range(n):
            self.bottles[b].append(self.bottles[a].pop())
        return n

    def is_solved(self):
        return all(not b or self.is_complete(i) for i, b in enumerate(self.bottles))

    def key(self):
        return "|".join(sorted(",".join(b) for b in self.bottles))

    def ordered_moves(self):
        """Pruned, heuristically ordered legal moves (mirror of Solver.ordered_moves)."""
        scored = []
        n = len(self.bottles)
        for a in range(n):
            if not self.bottles[a] or self.is_complete(a):
                continue
            run = self.top_run(a)
            used_empty = False
            for b in range(n):
                if not self.can_pour(a, b):
                    continue
                if not self.bottles[b]:
                    if self.is_uniform(a) or used_empty:
                        continue
                    used_empty = True
                    score = 0
                else:
                    amount = min(run, self.space(b))
                    score = 2
                    if amount == run:
                        score += 2
                    if len(self.bottles[b]) + amount == self.capacity and self.is_uniform(b):
                        score += 4
                scored.append((-score, a, b))
        scored.sort()
        return [(a, b) for _, a, b in scored]


def solve_dfs(start: Board, max_nodes=200_000):
    """Depth-first search with memo; returns (status, moves). status: solved/unsolvable/unknown."""
    if start.is_solved():
        return "solved", []
    visited = {start.key()}
    path = []
    stack = [[start, start.ordered_moves(), 0]]
    explored = 0
    while stack:
        frame = stack[-1]
        state, moves, i = frame
        if i >= len(moves):
            stack.pop()
            if path:
                path.pop()
            continue
        frame[2] = i + 1
        a, b = moves[i]
        nxt = state.clone()
        nxt.pour(a, b)
        k = nxt.key()
        if k in visited:
            continue
        visited.add(k)
        explored += 1
        path.append((a, b))
        if nxt.is_solved():
            return "solved", list(path)
        if explored >= max_nodes:
            return "unknown", []
        stack.append([nxt, nxt.ordered_moves(), 0])
    return "unsolvable", []


def solve_bfs(start: Board, max_nodes=300_000):
    """Shortest solution (in pours) or None if the search budget runs out."""
    if start.is_solved():
        return []
    parent = {start.key(): None}
    q = deque([(start, start.key())])
    while q:
        state, key = q.popleft()
        for a, b in state.ordered_moves():
            nxt = state.clone()
            nxt.pour(a, b)
            k = nxt.key()
            if k in parent:
                continue
            parent[k] = (key, (a, b))
            if nxt.is_solved():
                moves = []
                cur = k
                while parent[cur] is not None:
                    pk, mv = parent[cur]
                    moves.append(mv)
                    cur = pk
                return list(reversed(moves))
            if len(parent) > max_nodes:
                return None
            q.append((nxt, k))
    return None


# --------------------------------------------------------------------------
# Generation
# --------------------------------------------------------------------------
def difficulty_for(level: int) -> dict:
    """Difficulty curve. Grows smoothly; see CHECKLIST.md for the tier table."""
    if level <= 10:
        colors = 2 if level <= 3 else 3
        return {"tier": "tutorial", "colors": colors, "empty": 2,
                "mode": "scramble", "steps": 3 + level * 2}
    if level <= 30:
        colors = 3 if level <= 18 else 4
        return {"tier": "easy", "colors": colors, "empty": 2,
                "mode": "scramble" if level <= 20 else "shuffle", "steps": 18 + level}
    if level <= 75:
        colors = 4 + (level - 31) * 3 // 45  # 4 -> 6
        return {"tier": "medium", "colors": min(colors, 6), "empty": 2, "mode": "shuffle"}
    if level <= 150:
        colors = 6 + (level - 76) * 3 // 75  # 6 -> 8
        return {"tier": "hard", "colors": min(colors, 8), "empty": 2, "mode": "shuffle",
                "candidates": 3}
    colors = min(10, 8 + (level - 151) // 100)
    return {"tier": "advanced", "colors": colors, "empty": 2, "mode": "shuffle", "candidates": 3}


def scramble(colors, empty, steps, rng: random.Random, capacity=4):
    """Walk backwards from the solved board using inverse legal pours."""
    board = Board([[c] * capacity for c in colors] + [[] for _ in range(empty)], capacity)
    last = None
    for _ in range(steps * 6):
        if steps <= 0:
            break
        options = []
        n = len(board.bottles)
        for b in range(n):  # b received liquid in the forward move
            if not board.bottles[b]:
                continue
            for a in range(n):
                if a == b or (b, a) == last:
                    continue
                for k in range(1, board.top_run(b) + 1):
                    if board.space(a) < k:
                        break
                    prev = board.clone()
                    for _ in range(k):
                        prev.bottles[a].append(prev.bottles[b].pop())
                    check = prev.clone()
                    if check.pour(a, b) == k and check.bottles == board.bottles:
                        options.append((prev, (a, b)))
        if not options:
            break
        board, last = rng.choice(options)
        steps -= 1
    return board


def shuffle_board(colors, empty, rng: random.Random, capacity=4):
    units = [c for c in colors for _ in range(capacity)]
    while True:
        rng.shuffle(units)
        bottles = [units[i * capacity:(i + 1) * capacity] for i in range(len(colors))]
        board = Board(bottles + [[] for _ in range(empty)], capacity)
        # Reject boards that start with finished bottles or very long runs.
        if any(board.is_complete(i) for i in range(len(colors))):
            continue
        if any(board.top_run(i) >= 3 for i in range(len(colors))):
            continue
        return board


def generate_level(level: int) -> dict:
    d = difficulty_for(level)
    rng = random.Random(1000 + level * 7919)
    colors = COLORS[:d["colors"]]
    best = None
    tries = 0
    while True:
        tries += 1
        if d["mode"] == "scramble":
            board = scramble(colors, d["empty"], d["steps"], rng)
            if board.is_solved():
                continue
        else:
            board = shuffle_board(colors, d["empty"], rng)
        status, moves = solve_dfs(board)
        if status != "solved":
            continue
        optimal = solve_bfs(board, max_nodes=150_000) if d["colors"] <= 6 else None
        par = len(optimal) if optimal is not None else len(moves)
        # Prefer the harder of several candidates in the later tiers.
        if best is None or par > best[1]:
            best = (board, par, moves)
        if tries >= d.get("candidates", 1):
            break
    board, par, moves = best
    return {
        "level": level,
        "tier": d["tier"],
        "difficulty": round(min(1.0, level / 200.0), 3),
        "colors": colors,
        "bottle_capacity": board.capacity,
        "empty_bottles": d["empty"],
        "par_moves": par,
        "bottles": board.bottles,
        "mechanics": {},
        "solution": [[a, b] for a, b in moves],
    }


# Hand-authored opening levels: each teaches one idea.
HANDCRAFTED = {
    1: {"tier": "tutorial", "colors": ["red", "blue"], "empty_bottles": 1,
        "bottles": [["red", "red", "red", "blue"], ["blue", "blue", "blue", "red"], []],
        "note": "Pour the top layer into the empty bottle."},
    2: {"tier": "tutorial", "colors": ["red", "blue"], "empty_bottles": 2,
        "bottles": [["red", "blue", "red", "blue"], ["blue", "red", "blue", "red"], [], []],
        "note": "Use both empty bottles to separate the layers."},
}


def build_handcrafted(level: int) -> dict:
    h = HANDCRAFTED[level]
    board = Board(h["bottles"])
    status, moves = solve_dfs(board)
    assert status == "solved", f"handcrafted level {level} is unsolvable"
    optimal = solve_bfs(board)
    return {
        "level": level, "tier": h["tier"], "difficulty": 0.0, "colors": h["colors"],
        "bottle_capacity": 4, "empty_bottles": h["empty_bottles"],
        "par_moves": len(optimal), "bottles": h["bottles"], "mechanics": {},
        "tutorial": h["note"], "solution": [[a, b] for a, b in moves],
    }


def validate(data: dict) -> list[str]:
    errors = []
    cap = data["bottle_capacity"]
    counts = {}
    for b in data["bottles"]:
        if len(b) > cap:
            errors.append("bottle over capacity")
        for c in b:
            if c not in COLORS:
                errors.append(f"unknown colour {c}")
            counts[c] = counts.get(c, 0) + 1
    for c, n in counts.items():
        if n != cap:
            errors.append(f"colour {c} has {n} units, expected {cap}")
    if sorted(counts) != sorted(data["colors"]):
        errors.append("colors list does not match bottles")
    board = Board(data["bottles"], cap)
    for a, b in data.get("solution", []):
        if not board.can_pour(a, b):
            errors.append(f"stored solution has illegal move {a}->{b}")
            break
        board.pour(a, b)
    if not board.is_solved():
        errors.append("stored solution does not solve the level")
    if board.is_solved() and Board(data["bottles"], cap).is_solved():
        errors.append("level starts solved")
    return errors


def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)
    g = sub.add_parser("generate")
    g.add_argument("--count", type=int, default=150)
    sub.add_parser("verify")
    args = p.parse_args()

    LEVEL_DIR.mkdir(exist_ok=True)
    if args.cmd == "generate":
        for lv in range(1, args.count + 1):
            data = build_handcrafted(lv) if lv in HANDCRAFTED else generate_level(lv)
            errs = validate(data)
            assert not errs, (lv, errs)
            (LEVEL_DIR / f"level_{lv:03d}.json").write_text(json.dumps(data, indent=1) + "\n")
            print(f"level {lv:3d}  {data['tier']:9s} colors={len(data['colors']):2d} par={data['par_moves']}")
    else:
        files = sorted(LEVEL_DIR.glob("level_*.json"))
        bad = 0
        for f in files:
            data = json.loads(f.read_text())
            errs = validate(data)
            status, _ = solve_dfs(Board(data["bottles"], data["bottle_capacity"]))
            if status != "solved":
                errs.append(f"solver: {status}")
            if errs:
                bad += 1
                print(f.name, errs)
        print(f"verified {len(files)} levels, {bad} with problems")
        raise SystemExit(1 if bad else 0)


if __name__ == "__main__":
    main()
