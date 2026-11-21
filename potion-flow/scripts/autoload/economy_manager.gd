extends Node
## Coins, hint tokens and cosmetic purchases (autoload "EconomyManager").

signal coins_changed(total: int, delta: int)
signal hints_changed(total: int)

const HINT_COST := 30
const EXTRA_BOTTLE_COST := 60
const MAX_EXTRA_BOTTLES := 2
const MILESTONE_EVERY := 25
const MILESTONE_BONUS := 150


func coins() -> int:
	return int(SaveManager.get_value("economy", "coins", 0))


func hint_tokens() -> int:
	return int(SaveManager.get_value("economy", "hint_tokens", 0))


func add_coins(amount: int, _reason := "") -> void:
	if amount == 0:
		return
	var econ := SaveManager.section("economy")
	econ["coins"] = maxi(0, coins() + amount)
	if amount > 0:
		econ["lifetime_coins"] = int(econ.get("lifetime_coins", 0)) + amount
	SaveManager.commit("economy")
	coins_changed.emit(coins(), amount)


func can_afford(amount: int) -> bool:
	return coins() >= amount


func spend(amount: int, reason := "") -> bool:
	if amount < 0 or not can_afford(amount):
		return false
	add_coins(-amount, reason)
	return true


## Uses a free hint token first, then coins. Returns true if paid.
func pay_for_hint() -> bool:
	if hint_tokens() > 0:
		SaveManager.set_value("economy", "hint_tokens", hint_tokens() - 1)
		hints_changed.emit(hint_tokens())
		return true
	return spend(HINT_COST, "hint")


func add_hint_tokens(n: int) -> void:
	SaveManager.set_value("economy", "hint_tokens", hint_tokens() + n)
	hints_changed.emit(hint_tokens())


## Coins for finishing a level (see Scoring).
static func level_reward(stars: int, first_time: bool, level: int) -> int:
	return Scoring.level_reward(stars, first_time, level)


static func stars_for(moves: int, par: int) -> int:
	return Scoring.stars_for(moves, par)


func owns(kind: String, id: String) -> bool:
	var key := "owned_skins" if kind == "skin" else "owned_themes"
	return (SaveManager.get_value("cosmetics", key, []) as Array).has(id)


func buy_cosmetic(kind: String, id: String) -> bool:
	if owns(kind, id):
		return true
	var item: Dictionary = Cosmetics.get_skin(id) if kind == "skin" else Cosmetics.get_theme(id)
	if not spend(int(item.get("price", 0)), "cosmetic"):
		return false
	var key := "owned_skins" if kind == "skin" else "owned_themes"
	var owned: Array = SaveManager.get_value("cosmetics", key, [])
	owned.append(id)
	SaveManager.set_value("cosmetics", key, owned)
	return true


func equip(kind: String, id: String) -> void:
	if owns(kind, id):
		SaveManager.set_value("cosmetics", "skin" if kind == "skin" else "theme", id)
