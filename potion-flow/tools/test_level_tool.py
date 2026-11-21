"""Tests for the reference rules, solver, generator and shipped levels.

    python3 -m pytest tools/test_level_tool.py -q

The rule cases mirror tests/run_tests.gd one-to-one, so the GDScript
BoardState and this reference implementation are held to the same contract.
"""
import json
import random

import pytest

import level_tool as lt
from level_tool import Board


def b(bottles):
    return Board(bottles, 4)


# --- pour rules (mirror of run_tests.gd) -------------------------------------
def test_valid_pour():
    s = b([["red", "blue"], ["green", "blue"], []])
    assert s.can_pour(0, 1)
    assert s.pour(0, 1) == 1
    assert s.bottles[0] == ["red"]
    assert s.bottles[1] == ["green", "blue", "blue"]


def test_invalid_pour_color_mismatch():
    s = b([["red"], ["blue"]])
    assert not s.can_pour(0, 1)
    assert s.pour(0, 1) == 0
    assert s.bottles == [["red"], ["blue"]]


def test_pour_into_empty():
    s = b([["red", "blue", "blue"], []])
    assert s.pour(0, 1) == 2
    assert s.bottles[1] == ["blue", "blue"]


def test_pour_into_full():
    assert not b([["red"], ["red"] * 4]).can_pour(0, 1)


def test_partial_capacity():
    s = b([["red", "blue", "blue", "blue"], ["green", "green", "blue"]])
    assert s.pour_amount(0, 1) == 1
    s.pour(0, 1)
    assert s.bottles[0] == ["red", "blue", "blue"]


def test_multi_unit_pour():
    s = b([["red"] * 3, ["red"]])
    assert s.pour(0, 1) == 3
    assert s.is_complete(1)


def test_empty_source_and_same_bottle():
    assert not b([[], ["red"]]).can_pour(0, 1)
    assert not b([["red"], []]).can_pour(0, 0)
    assert not b([["red"], []]).can_pour(0, 5)


def test_completion():
    assert b([["red"] * 4, [], ["blue"] * 4]).is_solved()
    assert not b([["red"] * 3, ["red"]]).is_solved()


def test_key_order_independent():
    assert b([["red"], ["blue"]]).key() == b([["blue"], ["red"]]).key()


# --- solver --------------------------------------------------------------------
def replay(board, moves):
    c = board.clone()
    for a, d in moves:
        assert c.can_pour(a, d)
        c.pour(a, d)
    return c.is_solved()


def test_solver_solves():
    s = b([["red", "blue", "red", "blue"], ["blue", "red", "blue", "red"], [], []])
    status, moves = lt.solve_dfs(s)
    assert status == "solved" and replay(s, moves)


def test_solver_unsolvable():
    s = b([["red", "blue", "red", "blue"], ["blue", "red", "blue", "red"]])
    assert lt.solve_dfs(s)[0] == "unsolvable"


def test_bfs_is_optimal_on_small_board():
    s = b([["red", "red", "red", "blue"], ["blue", "blue", "blue", "red"], []])
    assert len(lt.solve_bfs(s)) == 3


def test_pruning_keeps_random_boards_solvable():
    """Pruned search must agree with a brute-force search on small boards."""
    rnd = random.Random(3)

    def brute(board, seen):
        if board.is_solved():
            return True
        k = board.key()
        if k in seen:
            return False
        seen.add(k)
        n = len(board.bottles)
        for a in range(n):
            for d in range(n):
                if board.can_pour(a, d):
                    nxt = board.clone()
                    nxt.pour(a, d)
                    if brute(nxt, seen):
                        return True
        return False

    for _ in range(60):
        units = [c for c in ["red", "blue", "green"] for _ in range(4)]
        rnd.shuffle(units)
        bottles = [units[i * 4:(i + 1) * 4] for i in range(3)] + [[]]
        board = b(bottles)
        assert (lt.solve_dfs(board)[0] == "solved") == brute(board, set())


# --- levels ----------------------------------------------------------------------
LEVELS = sorted(lt.LEVEL_DIR.glob("level_*.json"))


def test_enough_levels_shipped():
    assert len(LEVELS) >= 10


@pytest.mark.parametrize("path", LEVELS, ids=lambda p: p.stem)
def test_shipped_level_valid_and_solvable(path):
    data = json.loads(path.read_text())
    assert lt.validate(data) == []
    board = Board(data["bottles"], data["bottle_capacity"])
    assert not board.is_solved()
    assert lt.solve_dfs(board)[0] == "solved"
    assert data["par_moves"] <= len(data["solution"])


def test_difficulty_never_decreases_by_tier():
    order = ["tutorial", "easy", "medium", "hard", "advanced"]
    prev_tier, prev_colors = 0, 0
    for p in LEVELS:
        d = json.loads(p.read_text())
        tier = order.index(d["tier"])
        assert tier >= prev_tier
        assert len(d["colors"]) >= prev_colors
        prev_tier, prev_colors = tier, len(d["colors"])


def test_tier_boundaries_match_spec():
    assert lt.difficulty_for(10)["tier"] == "tutorial"
    assert lt.difficulty_for(11)["tier"] == "easy"
    assert lt.difficulty_for(31)["tier"] == "medium"
    assert lt.difficulty_for(76)["tier"] == "hard"
    assert lt.difficulty_for(151)["tier"] == "advanced"
    assert 2 <= lt.difficulty_for(1)["colors"] <= 3
    assert 4 <= lt.difficulty_for(50)["colors"] <= 6
    assert 6 <= lt.difficulty_for(100)["colors"] <= 8


def test_generation_is_deterministic():
    assert lt.generate_level(42)["bottles"] == lt.generate_level(42)["bottles"]
