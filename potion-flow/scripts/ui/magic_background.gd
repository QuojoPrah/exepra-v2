class_name MagicBackground
extends Control
## Animated full-screen backdrop: theme gradient, twinkling stars, drifting
## motes and (optionally) floating potion silhouettes for the home screen.

@export var floating_bottles := false

var theme_data: Dictionary = {}
var low_effects := false
var _stars: Array = []
var _motes: Array = []
var _bottles: Array = []
var _time := 0.0


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	theme_data = Cosmetics.get_theme(SaveManager.get_value("cosmetics", "theme", "purple"))
	low_effects = SaveManager.get_value("settings", "low_effects", false)
	SaveManager.changed.connect(_on_save_changed)
	resized.connect(_regenerate)
	_regenerate()


func _on_save_changed(section: String) -> void:
	if section == "cosmetics" or section == "settings":
		theme_data = Cosmetics.get_theme(SaveManager.get_value("cosmetics", "theme", "purple"))
		low_effects = SaveManager.get_value("settings", "low_effects", false)
		queue_redraw()


func _regenerate() -> void:
	var sz := size if size.x > 1.0 else get_viewport_rect().size
	_stars.clear()
	_motes.clear()
	_bottles.clear()
	for _k in range(70):
		_stars.append({"pos": Vector2(randf() * sz.x, randf() * sz.y), "r": randf_range(0.6, 1.9),
			"phase": randf() * TAU, "speed": randf_range(0.6, 2.0)})
	for _k in range(28):
		_motes.append({"pos": Vector2(randf() * sz.x, randf() * sz.y), "r": randf_range(1.5, 4.0),
			"vel": Vector2(randf_range(-8, 8), randf_range(-26, -8)), "phase": randf() * TAU})
	if floating_bottles:
		var ids := PotionColors.ORDER
		for k in range(6):
			_bottles.append({"pos": Vector2(randf_range(0.08, 0.92) * sz.x, randf_range(0.1, 0.95) * sz.y),
				"color": PotionColors.get_color(ids[k * 2 % ids.size()]), "phase": randf() * TAU,
				"scale": randf_range(0.18, 0.32)})


func _process(delta: float) -> void:
	_time += delta
	var sz := size
	for m in _motes:
		var p: Vector2 = m["pos"]
		p += (m["vel"] as Vector2) * delta
		p.x += sin(_time + float(m["phase"])) * 6.0 * delta
		if p.y < -10.0:
			p = Vector2(randf() * sz.x, sz.y + 10.0)
		m["pos"] = p
	queue_redraw()


func _draw() -> void:
	var sz := size
	var top: Color = theme_data.get("top", Color("#1A1230"))
	var bottom: Color = theme_data.get("bottom", Color("#100B20"))
	var accent: Color = theme_data.get("accent", Color("#7C3AED"))
	var particle: Color = theme_data.get("particle", Color("#A855F7"))
	draw_polygon(PackedVector2Array([Vector2.ZERO, Vector2(sz.x, 0), sz, Vector2(0, sz.y)]),
		PackedColorArray([top, top, bottom, bottom]))
	# Soft nebula glows.
	for k in range(3):
		var c := accent
		c.a = 0.05
		var center := Vector2(sz.x * (0.2 + 0.6 * k / 2.0), sz.y * (0.25 + 0.25 * k)) \
			+ Vector2(sin(_time * 0.2 + k), cos(_time * 0.15 + k)) * 20.0
		for r in [260.0, 180.0, 110.0]:
			draw_circle(center, r, c)
	for s in _stars:
		var tw := 0.5 + 0.5 * sin(_time * float(s["speed"]) + float(s["phase"]))
		if low_effects:
			tw = 0.7
		draw_circle(s["pos"], s["r"], Color(1, 1, 1, 0.25 + 0.55 * tw))
	if not low_effects:
		for m in _motes:
			var c := particle
			c.a = 0.18 + 0.18 * sin(_time * 2.0 + float(m["phase"]))
			draw_circle(m["pos"], float(m["r"]) * 2.2, Color(c, c.a * 0.35))
			draw_circle(m["pos"], m["r"], c)
	for b in _bottles:
		_draw_mini_bottle(b)


func _draw_mini_bottle(b: Dictionary) -> void:
	var shape := BottleShape.get_shape("round")
	var s: float = b["scale"]
	var pos: Vector2 = b["pos"] + Vector2(0, sin(_time * 0.8 + float(b["phase"])) * 14.0)
	var rot := sin(_time * 0.5 + float(b["phase"])) * 0.18
	draw_set_transform(pos, rot, Vector2(s, s))
	var col: Color = b["color"]
	draw_colored_polygon(shape["glow"][2], Color(col, 0.06))
	draw_colored_polygon(shape["outer"], Color(1, 1, 1, 0.05))
	var liquid := PackedVector2Array([Vector2(-60, -90), Vector2(60, -90), Vector2(60, 10), Vector2(-60, 10)])
	for piece in Geometry2D.intersect_polygons(liquid, shape["inner"]):
		draw_colored_polygon(piece, Color(col, 0.35))
	draw_polyline(shape["rim_right"], Color(1, 1, 1, 0.22), 3.0, true)
	draw_polyline(shape["rim_left"], Color(1, 1, 1, 0.22), 3.0, true)
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
