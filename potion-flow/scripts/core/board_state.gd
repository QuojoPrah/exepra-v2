class_name BoardState
extends RefCounted
## Pure puzzle state: a list of bottles, each a stack of colour ids (bottom -> top).
## No rendering or scene code lives here, so it is fully unit-testable.

var capacity: int = 4
var bottles: Array = []


func _init(p_bottles: Array = [], p_capacity: int = 4) -> void:
	capacity = p_capacity
	bottles = []
	for b in p_bottles:
		var copy: Array = []
		for c in b:
			copy.append(String(c))
		bottles.append(copy)


func clone() -> BoardState:
	return BoardState.new(bottles, capacity)


func bottle_count() -> int:
	return bottles.size()


func is_valid_index(i: int) -> bool:
	return i >= 0 and i < bottles.size()


func is_empty(i: int) -> bool:
	return (bottles[i] as Array).is_empty()


func fill(i: int) -> int:
	return (bottles[i] as Array).size()


func free_space(i: int) -> int:
	return capacity - fill(i)


func top_color(i: int) -> String:
	var b: Array = bottles[i]
	if b.is_empty():
		return ""
	return b[b.size() - 1]


## Number of consecutive units of the top colour.
func top_run_length(i: int) -> int:
	var b: Array = bottles[i]
	if b.is_empty():
		return 0
	var c: String = b[b.size() - 1]
	var n := 0
	for k in range(b.size() - 1, -1, -1):
		if b[k] != c:
			break
		n += 1
	return n


func is_uniform(i: int) -> bool:
	var b: Array = bottles[i]
	if b.is_empty():
		return false
	for c in b:
		if c != b[0]:
			return false
	return true


func is_bottle_complete(i: int) -> bool:
	return fill(i) == capacity and is_uniform(i)


func can_pour(from: int, to: int) -> bool:
	if from == to or not is_valid_index(from) or not is_valid_index(to):
		return false
	if is_empty(from) or free_space(to) <= 0:
		return false
	return is_empty(to) or top_color(to) == top_color(from)


func pour_amount(from: int, to: int) -> int:
	if not can_pour(from, to):
		return 0
	return mini(top_run_length(from), free_space(to))


## Applies the pour and returns how many units moved (0 if illegal).
func pour(from: int, to: int) -> int:
	var n := pour_amount(from, to)
	var src: Array = bottles[from]
	var dst: Array = bottles[to]
	for _k in range(n):
		dst.append(src.pop_back())
	return n


## Reverts a pour that moved `amount` units from `from` to `to`.
func unpour(from: int, to: int, amount: int) -> bool:
	if not is_valid_index(from) or not is_valid_index(to) or amount <= 0:
		return false
	if fill(to) < amount or free_space(from) < amount:
		return false
	var src: Array = bottles[from]
	var dst: Array = bottles[to]
	for _k in range(amount):
		src.append(dst.pop_back())
	return true


func is_solved() -> bool:
	for i in range(bottles.size()):
		if not is_empty(i) and not is_bottle_complete(i):
			return false
	return true


func add_empty_bottle() -> int:
	bottles.append([])
	return bottles.size() - 1


func all_valid_moves() -> Array[Vector2i]:
	var moves: Array[Vector2i] = []
	for a in range(bottles.size()):
		for b in range(bottles.size()):
			if can_pour(a, b):
				moves.append(Vector2i(a, b))
	return moves


## Order-independent key: two boards that differ only by bottle order are equal.
func key() -> String:
	var parts: PackedStringArray = []
	for b in bottles:
		parts.append(",".join(PackedStringArray(b)))
	parts.sort()
	return "|".join(parts)


func to_array() -> Array:
	var out: Array = []
	for b in bottles:
		out.append((b as Array).duplicate())
	return out


func color_counts() -> Dictionary:
	var counts := {}
	for b in bottles:
		for c in b:
			counts[c] = int(counts.get(c, 0)) + 1
	return counts
