extends Node
## Daily login rewards with streaks (autoload "RewardManager").
## Uses the local calendar day. Refuses to pay out if the clock moved backwards
## past the last claim. Swap `_now_unix()` for a server time later.

signal claimed(day_in_cycle: int, coins: int)

const REWARDS := [25, 35, 50, 70, 90, 120, 200]
const HINT_BONUS_DAY := 7  # day 7 also grants a hint token

## Overridable clock for tests (unix seconds); 0 means use the system clock.
var debug_now_unix := 0


func _now_unix() -> int:
	return debug_now_unix if debug_now_unix > 0 else int(Time.get_unix_time_from_system())


func _today() -> int:
	# Local calendar day number.
	var tz_bias := int(Time.get_time_zone_from_system().get("bias", 0)) * 60
	return int(floor(float(_now_unix() + tz_bias) / 86400.0))


func streak() -> int:
	return int(SaveManager.get_value("daily", "streak", 0))


func can_claim() -> bool:
	var last := int(SaveManager.get_value("daily", "last_claim_day", -1))
	if _now_unix() < int(SaveManager.get_value("daily", "last_claim_unix", 0)):
		return false  # clock rolled back
	return _today() > last


## Which day (1-7) the next claim is.
func next_day_in_cycle() -> int:
	var last := int(SaveManager.get_value("daily", "last_claim_day", -1))
	var s := streak()
	if last >= 0 and _today() - last > 1:
		s = 0  # streak broken
	return (s % REWARDS.size()) + 1


func claim() -> int:
	if not can_claim():
		return 0
	var day := next_day_in_cycle()
	var coins: int = REWARDS[day - 1]
	var daily := SaveManager.section("daily")
	var last := int(daily.get("last_claim_day", -1))
	var s := int(daily.get("streak", 0))
	s = s + 1 if (last >= 0 and _today() - last == 1) else 1
	daily["streak"] = s
	daily["last_claim_day"] = _today()
	daily["last_claim_unix"] = _now_unix()
	SaveManager.commit("daily")
	EconomyManager.add_coins(coins, "daily")
	if day == HINT_BONUS_DAY:
		EconomyManager.add_hint_tokens(1)
	claimed.emit(day, coins)
	return coins
