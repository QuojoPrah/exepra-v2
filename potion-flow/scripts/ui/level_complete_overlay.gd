class_name LevelCompleteOverlay
extends Control
## Victory card: stars, coin reward count-up, next / replay / home.

signal next_pressed
signal replay_pressed
signal home_pressed

var _level := 1
var _stars := 3
var _reward := 0
var _bonus := 0
var _moves := 0
var _par := 0


func setup(level: int, stars: int, reward: int, bonus: int, moves: int, par: int) -> void:
	_level = level
	_stars = stars
	_reward = reward
	_bonus = bonus
	_moves = moves
	_par = par


func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	var m := UIKit.make_modal("Level %d Complete!" % _level, 620.0, false)
	add_child(m["root"])
	var body: VBoxContainer = m["body"]
	var title: Label = m["title"]
	title.add_theme_font_size_override("font_size", 46)

	var star_row := HBoxContainer.new()
	star_row.alignment = BoxContainer.ALIGNMENT_CENTER
	star_row.add_theme_constant_override("separation", 14)
	star_row.custom_minimum_size = Vector2(0, 140)
	body.add_child(star_row)
	var star_nodes: Array[IconView] = []
	for k in range(3):
		var st := IconView.new()
		st.icon = "star" if k < _stars else "star_empty"
		st.color = UIKit.GOLD if k < _stars else Color(1, 1, 1)
		var sz := 120.0 if k == 1 else 100.0
		st.custom_minimum_size = Vector2(sz, sz)
		st.size_flags_vertical = Control.SIZE_SHRINK_END if k != 1 else Control.SIZE_SHRINK_BEGIN
		st.pivot_offset = Vector2(sz, sz) * 0.5
		st.scale = Vector2.ZERO
		star_row.add_child(st)
		star_nodes.append(st)

	var rating: String = ["Well brewed!", "Great brewing!", "Masterful alchemy!"][clampi(_stars, 1, 3) - 1]
	var r := UIKit.make_label(rating, 32, UIKit.TEXT)
	r.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	body.add_child(r)
	var info := UIKit.make_label("Moves %d  ·  Target %d" % [_moves, _par], 24, UIKit.TEXT_DIM)
	info.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	body.add_child(info)

	var coin_row := HBoxContainer.new()
	coin_row.alignment = BoxContainer.ALIGNMENT_CENTER
	coin_row.add_theme_constant_override("separation", 10)
	body.add_child(coin_row)
	var coin := IconView.new()
	coin.icon = "coin"
	coin.custom_minimum_size = Vector2(56, 56)
	coin_row.add_child(coin)
	var coin_label := UIKit.make_label("+0", 46, UIKit.GOLD, 6)
	coin_row.add_child(coin_label)
	if _bonus > 0:
		var b := UIKit.make_label("Milestone bonus +%d!" % _bonus, 26, UIKit.CYAN)
		b.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		body.add_child(b)

	var next := UIKit.make_button("Next Level", UIKit.GOLD, Vector2(0, 104), 38, "next")
	body.add_child(next)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 16)
	body.add_child(row)
	var replay := UIKit.make_button("Replay", Color("#3A2A5C"), Vector2(0, 84), 28, "restart")
	replay.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var home := UIKit.make_button("Home", Color("#3A2A5C"), Vector2(0, 84), 28, "home")
	home.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(replay)
	row.add_child(home)

	next.pressed.connect(func() -> void: _close(next_pressed))
	replay.pressed.connect(func() -> void: _close(replay_pressed))
	home.pressed.connect(func() -> void: _close(home_pressed))

	UIKit.pop_in(m["card"])
	# Stars pop in one by one, then the coins count up.
	var tw := create_tween()
	tw.tween_interval(0.25)
	for k in range(3):
		var node := star_nodes[k]
		tw.tween_property(node, "scale", Vector2(1.2, 1.2), 0.16).set_trans(Tween.TRANS_BACK)
		tw.tween_property(node, "scale", Vector2.ONE, 0.1)
		if k < _stars:
			tw.tween_callback(AudioManager.play.bind("select", 1.0 + 0.15 * k))
	var total := _reward + _bonus
	tw.tween_method(func(v: float) -> void: coin_label.text = "+%d" % int(v), 0.0, float(total), 0.6)
	tw.tween_callback(AudioManager.play.bind("coin"))


func _close(sig: Signal) -> void:
	var tw := create_tween()
	tw.tween_property(self, "modulate:a", 0.0, 0.15)
	tw.tween_callback(func() -> void:
		sig.emit()
		queue_free()
	)