class_name Scoring
extends RefCounted
## Pure scoring rules: stars and level rewards. No autoload dependencies.


## Coins for finishing a level. Replays pay a small amount.
static func level_reward(stars: int, first_time: bool, level: int) -> int:
	if not first_time:
		return 5
	@warning_ignore("integer_division")
	var base := 20 + mini(level, 200) / 10
	return base + stars * 5


static func stars_for(moves: int, par: int) -> int:
	if par <= 0 or moves <= par:
		return 3
	if moves <= int(ceil(par * 1.5)) + 2:
		return 2
	return 1
