class_name DailyRewardPanel
extends Control
## Seven-day login calendar with a claim animation.

signal closed

var _claim_button: Button
var _days: Array[PanelContainer] = []


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	var m := UIKit.make_modal("Daily Reward", 640.0, true)
	add_child(m["root"])
	var body: VBoxContainer = m["body"]
	(m["close"] as Button).pressed.connect(close)

	var streak := RewardManager.streak()
	var sub := UIKit.make_label("Streak: %d day%s" % [streak, "" if streak == 1 else "s"], 28, UIKit.CYAN)
	sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	body.add_child(sub)

	var grid := GridContainer.new()
	grid.columns = 4
	grid.add_theme_constant_override("h_separation", 12)
	grid.add_theme_constant_override("v_separation", 12)
	body.add_child(grid)
	var can := RewardManager.can_claim()
	var next_day := RewardManager.next_day_in_cycle()
	for d in range(1, RewardManager.REWARDS.size() + 1):
		var done := d < next_day or (d == next_day and not can)
		var today := d == next_day and can
		var cell := PanelContainer.new()
		var border := UIKit.GOLD if today else Color(1, 1, 1, 0.1)
		cell.add_theme_stylebox_override("panel", UIKit.flat(
			Color(UIKit.GOLD, 0.16) if today else Color(1, 1, 1, 0.05), 20, border, 3 if today else 2))
		cell.custom_minimum_size = Vector2(134, 150)
		var v := VBoxContainer.new()
		v.alignment = BoxContainer.ALIGNMENT_CENTER
		cell.add_child(v)
		var dl := UIKit.make_label("Day %d" % d, 22, UIKit.TEXT_DIM)
		dl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		v.add_child(dl)
		var ic := IconView.new()
		ic.icon = "check" if done else ("gift" if d == RewardManager.HINT_BONUS_DAY else "coin")
		ic.color = UIKit.GREEN if done else UIKit.GOLD
		ic.custom_minimum_size = Vector2(56, 56)
		ic.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
		v.add_child(ic)
		var amount := UIKit.make_label(str(RewardManager.REWARDS[d - 1]), 28, UIKit.GOLD)
		amount.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		v.add_child(amount)
		grid.add_child(cell)
		_days.append(cell)

	_claim_button = UIKit.make_button("Claim" if can else "Come back tomorrow",
		UIKit.GOLD if can else Color("#3A2A5C"), Vector2(0, 100), 34, "gift" if can else "")
	_claim_button.disabled = not can
	_claim_button.pressed.connect(_on_claim)
	body.add_child(_claim_button)
	UIKit.pop_in(m["card"])


func _on_claim() -> void:
	var day := RewardManager.next_day_in_cycle()
	var coins := RewardManager.claim()
	if coins <= 0:
		return
	_claim_button.disabled = true
	_claim_button.text = "+%d coins!" % coins
	AudioManager.play("coin")
	AudioManager.vibrate(30)
	var cell := _days[day - 1]
	cell.pivot_offset = cell.size * 0.5
	var tw := create_tween()
	tw.tween_property(cell, "scale", Vector2(1.18, 1.18), 0.15).set_trans(Tween.TRANS_BACK)
	tw.tween_property(cell, "scale", Vector2.ONE, 0.2)
	# Coins fly upward from the claimed day.
	for k in range(10):
		var c := IconView.new()
		c.icon = "coin"
		c.size = Vector2(40, 40)
		c.position = cell.get_global_rect().get_center() - Vector2(20, 20)
		add_child(c)
		var t := c.create_tween().set_parallel(true)
		var dest := Vector2(size.x * 0.5 + randf_range(-120, 120), -60)
		t.tween_property(c, "position", dest, 0.7 + k * 0.04).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN)
		t.tween_property(c, "modulate:a", 0.0, 0.3).set_delay(0.5 + k * 0.04)
		t.chain().tween_callback(c.queue_free)
	var wait := create_tween()
	wait.tween_interval(1.1)
	wait.tween_callback(close)


func close() -> void:
	closed.emit()
	var tw := create_tween()
	tw.tween_property(self, "modulate:a", 0.0, 0.15)
	tw.tween_callback(queue_free)
