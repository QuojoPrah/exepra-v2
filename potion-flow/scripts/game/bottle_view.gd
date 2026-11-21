class_name BottleView
extends Node2D
## Renders one potion bottle and its liquid. Holds no puzzle rules: the game
## controller tells it what it contains and drives its animations.
##
## Liquid is drawn as world-level layers that are clipped against the glass
## interior with Geometry2D, so the liquid stays inside the bottle and stays
## level while the bottle tilts, on every renderer.

const LIFT := 30.0

var index: int = -1
var capacity: int = 4
var rest_position := Vector2.ZERO
var skin: Dictionary = {}

## Display layers bottom -> top: [{"color": String, "amount": float}]
var layers: Array = []
## 0 = resting, 1 = in the pouring pose (fades the ground shadow, livens the surface).
var tilt_amount: float = 0.0
var selected := false
var hint_glow: float = 0.0
var complete_glow: float = 0.0
var cork: float = 0.0  # 0 = no stopper, 1 = stopper seated
var wobble: float = 0.0
var low_effects := false

var _shape: Dictionary = {}
var _time := 0.0
var _bubbles: Array = []
var _lift_tween: Tween
var _shake_tween: Tween
var _capacity_area := 0.0
var _tops_key := ""
var _tops_cache := PackedFloat32Array()


func _ready() -> void:
	_time = randf() * 10.0
	if _shape.is_empty():
		set_skin(Cosmetics.get_skin("classic"))


func set_skin(p_skin: Dictionary) -> void:
	skin = p_skin
	_shape = BottleShape.get_shape(String(skin.get("shape", "round")))
	_capacity_area = 0.0
	_tops_key = ""
	queue_redraw()


func hit_rect() -> Rect2:
	## Generous tap area around the rest pose, in parent coordinates.
	var s := scale.x
	var w: float = (float(_shape.get("half_width", 42.0)) * 2.0 + 24.0) * s
	var h := (BottleShape.HEIGHT + 40.0) * s
	return Rect2(rest_position + Vector2(-w * 0.5, -h + 14.0 * s), Vector2(w, h))


## World position of the bottle mouth (with the current transform).
func mouth_global() -> Vector2:
	return to_global(_shape.get("mouth", Vector2(0, -BottleShape.HEIGHT)))


func mouth_local() -> Vector2:
	return _shape.get("mouth", Vector2(0, -BottleShape.HEIGHT))


## Liquid surface position in global coordinates when upright.
func surface_global() -> Vector2:
	var y := minf(surface_for(total_amount(), 0.0), float(_shape["liquid_bottom"]))
	return to_global(Vector2(0.0, y))


func total_amount() -> float:
	var t := 0.0
	for l in layers:
		t += float(l["amount"])
	return t


func set_contents(colors: Array) -> void:
	layers.clear()
	for c in colors:
		if not layers.is_empty() and layers[layers.size() - 1]["color"] == c:
			layers[layers.size() - 1]["amount"] += 1.0
		else:
			layers.append({"color": String(c), "amount": 1.0})
	queue_redraw()


## Adjust the top layer by `delta` units of `color` (negative drains).
func adjust_top(color: String, delta: float) -> void:
	if delta > 0.0:
		if layers.is_empty() or layers[layers.size() - 1]["color"] != color:
			layers.append({"color": color, "amount": 0.0})
		layers[layers.size() - 1]["amount"] += delta
	elif not layers.is_empty():
		var top: Dictionary = layers[layers.size() - 1]
		top["amount"] = maxf(0.0, float(top["amount"]) + delta)
		if top["amount"] <= 0.001:
			layers.pop_back()
	queue_redraw()


func set_selected(value: bool, animate := true) -> void:
	selected = value
	var target := rest_position + (Vector2(0, -LIFT * scale.y) if value else Vector2.ZERO)
	if _lift_tween:
		_lift_tween.kill()
	if not animate:
		position = target
		return
	_lift_tween = create_tween()
	_lift_tween.tween_property(self, "position", target, 0.16) \
		.set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)


func shake() -> void:
	if _shake_tween:
		_shake_tween.kill()
	var base := position
	_shake_tween = create_tween()
	for k in range(4):
		var dx := (10.0 if k % 2 == 0 else -10.0) * scale.x * (1.0 - k * 0.2)
		_shake_tween.tween_property(self, "position", base + Vector2(dx, 0), 0.045)
	_shake_tween.tween_property(self, "position", base, 0.05)


func play_complete() -> void:
	var tw := create_tween().set_parallel(true)
	tw.tween_property(self, "complete_glow", 1.0, 0.25)
	tw.tween_property(self, "cork", 1.0, 0.45).set_trans(Tween.TRANS_BOUNCE) \
		.set_ease(Tween.EASE_OUT).set_delay(0.12)
	tw.chain().tween_property(self, "complete_glow", 0.35, 0.8)


func set_complete_instant(value: bool) -> void:
	complete_glow = 0.35 if value else 0.0
	cork = 1.0 if value else 0.0
	queue_redraw()


func flash_hint(duration := 2.2) -> void:
	var tw := create_tween()
	for k in range(3):
		tw.tween_property(self, "hint_glow", 1.0, duration / 6.0)
		tw.tween_property(self, "hint_glow", 0.2, duration / 6.0)
	tw.tween_property(self, "hint_glow", 0.0, 0.2)


func add_bubbles(count: int) -> void:
	if low_effects:
		return
	var hw: float = float(_shape["half_width"]) - 12.0
	var top := _upright_surface_y(total_amount())
	for _k in range(count):
		_bubbles.append({
			"pos": Vector2(randf_range(-hw, hw), randf_range(-12.0, maxf(top + 10.0, -40.0))),
			"r": randf_range(1.5, 3.6),
			"speed": randf_range(30.0, 70.0),
		})


func _process(delta: float) -> void:
	_time += delta
	wobble = move_toward(wobble, 0.0, delta * 1.6)
	if not _bubbles.is_empty():
		var top := _upright_surface_y(total_amount())
		for k in range(_bubbles.size() - 1, -1, -1):
			var b: Dictionary = _bubbles[k]
			var p: Vector2 = b["pos"]
			p.y -= float(b["speed"]) * delta
			p.x += sin(_time * 6.0 + k) * 0.3
			b["pos"] = p
			if p.y < top + 4.0 or tilt_amount > 0.05:
				_bubbles.remove_at(k)
	elif not low_effects and total_amount() > 0.5 and randf() < delta * 0.25:
		add_bubbles(1)
	# Idle surface motion needs a redraw; skip it on low-effects mode.
	if not low_effects or wobble > 0.0 or not _bubbles.is_empty() or tilt_amount > 0.0 \
			or hint_glow > 0.0:
		queue_redraw()


func _unit_height() -> float:
	return (float(_shape["liquid_bottom"]) - float(_shape["liquid_top"])) / float(capacity)


func _upright_surface_y(amount: float) -> float:
	return float(_shape["liquid_bottom"]) - amount * _unit_height()


# --------------------------------------------------------------------------
# Drawing
# --------------------------------------------------------------------------
func _draw() -> void:
	if _shape.is_empty():
		return
	var accent: Color = skin.get("glow", Color("#A855F7"))
	var rim: Color = skin.get("rim", Color(1, 1, 1, 0.6))
	var tint: Color = skin.get("tint", Color(0.75, 0.8, 1.0, 0.10))

	# Ground shadow (fades out while the bottle is lifted or tilted).
	var shadow_a := 0.28 * (1.0 - tilt_amount) * (0.6 if selected else 1.0)
	if shadow_a > 0.01:
		draw_set_transform(Vector2(0, 6), 0.0, Vector2(1.0, 0.22))
		draw_circle(Vector2.ZERO, float(_shape["half_width"]) + 6.0, Color(0, 0, 0, shadow_a))
		draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)

	# Glows: selection, hint and completion.
	var glow_color := accent
	var glow_strength := 0.0
	if selected:
		glow_strength = 0.75
	if hint_glow > 0.0:
		glow_color = Color("#F5C66A")
		glow_strength = maxf(glow_strength, hint_glow)
	if complete_glow > 0.0 and not layers.is_empty():
		var lc := PotionColors.get_color(layers[0]["color"])
		if complete_glow * 1.1 > glow_strength:
			glow_color = lc
			glow_strength = complete_glow
	if glow_strength > 0.01:
		var glows: Array = _shape["glow"]
		for k in range(glows.size() - 1, -1, -1):
			var c := glow_color
			c.a = glow_strength * (0.10 + 0.08 * (glows.size() - k))
			draw_colored_polygon(glows[k], c)

	var inner: PackedVector2Array = _shape["inner"]
	var outer: PackedVector2Array = _shape["outer"]

	# Glass body (back face).
	draw_colored_polygon(outer, Color(tint.r, tint.g, tint.b, tint.a * 0.6))
	draw_colored_polygon(inner, Color(0.04, 0.02, 0.10, 0.35))

	_draw_liquid(inner)
	_draw_bubbles()
	_draw_glass_front(inner, rim)
	if cork > 0.01:
		_draw_cork()


func _draw_liquid(inner: PackedVector2Array) -> void:
	if layers.is_empty():
		return
	var angle := rotation
	var tops := _layer_tops(angle)
	var wave_amp := 0.0 if low_effects else 1.4
	wave_amp += wobble * 5.0 + tilt_amount * 1.5
	var hw: float = _shape["half_width"]
	var shade_band := PackedVector2Array([
		Vector2(hw * 0.35, 0.0), Vector2(hw + 2.0, 0.0),
		Vector2(hw + 2.0, -BottleShape.HEIGHT), Vector2(hw * 0.35, -BottleShape.HEIGHT),
	])
	var last := layers.size() - 1
	var y_bottom := 400.0
	for li in range(layers.size()):
		var y_top: float = tops[li]
		var poly := _layer_polygon(y_top, y_bottom, li == last, wave_amp, -angle)
		var base := PotionColors.get_color(layers[li]["color"])
		for piece in Geometry2D.intersect_polygons(poly, inner):
			draw_colored_polygon(piece, base)
			for shade in Geometry2D.intersect_polygons(piece, shade_band):
				draw_colored_polygon(shade, base.darkened(0.22))
			# Glossy meniscus on the surface, thin seam between potions.
			var band_h := 5.0 if li == last else 2.0
			var band := _layer_polygon(y_top, y_top + band_h, li == last, wave_amp, -angle)
			for m in Geometry2D.intersect_polygons(band, piece):
				draw_colored_polygon(m, base.lightened(0.35 if li == last else 0.18))
		y_bottom = y_top


# --------------------------------------------------------------------------
# Volume-correct liquid levels
# --------------------------------------------------------------------------
## Surface height (in level, bottle-centred coordinates) of every layer's top,
## bottom layer first. Recomputed only when contents or angle change.
func _layer_tops(angle: float) -> PackedFloat32Array:
	var key := "%.3f" % angle
	for l in layers:
		key += "|%.3f" % float(l["amount"])
	if key == _tops_key:
		return _tops_cache
	var tops := PackedFloat32Array()
	var cum := 0.0
	for l in layers:
		cum += float(l["amount"])
		tops.append(surface_for(cum, angle))
	_tops_key = key
	_tops_cache = tops
	return tops


static func _poly_area(p: PackedVector2Array) -> float:
	var a := 0.0
	var n := p.size()
	for i in range(n):
		var u := p[i]
		var w := p[(i + 1) % n]
		a += u.x * w.y - w.x * u.y
	return absf(a) * 0.5


## Interior area covered by liquid lying below level `y` when tilted by `angle`.
func _area_below(y: float, angle: float) -> float:
	var total := 0.0
	var band := _layer_polygon(y, 400.0, false, 0.0, -angle)
	for piece in Geometry2D.intersect_polygons(band, _shape["inner"]):
		total += _poly_area(piece)
	return total


## Level at which `amount` units of liquid settle for a bottle tilted by `angle`.
func surface_for(amount: float, angle: float) -> float:
	if amount <= 0.0001:
		return 400.0
	if _capacity_area <= 0.0:
		_capacity_area = _area_below(float(_shape["liquid_top"]), 0.0)
	var target := amount * _capacity_area / float(capacity)
	var lo := -320.0
	var hi := 400.0
	for _k in range(18):
		var mid := (lo + hi) * 0.5
		if _area_below(mid, angle) > target:
			lo = mid
		else:
			hi = mid
	return (lo + hi) * 0.5


## Tilt (radians, always positive) at which `amount` units just reach the lip.
func pour_angle(amount: float) -> float:
	var lip := Vector2(0.0, float(_shape["neck_top"]) - 4.0)
	var lo := 0.2
	var hi := 2.2
	for _k in range(16):
		var mid := (lo + hi) * 0.5
		if surface_for(amount, mid) > lip.rotated(mid).y:
			lo = mid  # surface still below the lip: tilt further
		else:
			hi = mid
	return (lo + hi) * 0.5


## A horizontal (world-level) band, rotated into bottle space.
func _layer_polygon(y_top: float, y_bottom: float, wavy: bool, amp: float,
		rot: float) -> PackedVector2Array:
	var pts := PackedVector2Array()
	var span := 260.0
	if wavy and amp > 0.01:
		var steps := 16
		for s in range(steps + 1):
			var x := -span + 2.0 * span * s / steps
			var y := y_top + sin(x * 0.09 + _time * 2.4) * amp + sin(x * 0.05 - _time * 1.3) * amp * 0.5
			pts.append(Vector2(x, y).rotated(rot))
	else:
		pts.append(Vector2(-span, y_top).rotated(rot))
		pts.append(Vector2(span, y_top).rotated(rot))
	pts.append(Vector2(span, y_bottom).rotated(rot))
	pts.append(Vector2(-span, y_bottom).rotated(rot))
	return pts


func _draw_bubbles() -> void:
	for b in _bubbles:
		draw_circle(b["pos"], b["r"], Color(1, 1, 1, 0.35))
		draw_circle(b["pos"] + Vector2(-0.6, -0.6), float(b["r"]) * 0.4, Color(1, 1, 1, 0.5))


func _draw_glass_front(inner: PackedVector2Array, rim: Color) -> void:
	var hw: float = _shape["half_width"]
	var shoulder: float = _shape["shoulder"]
	# Long vertical reflection on the left.
	var refl := PackedVector2Array([
		Vector2(-hw + 9.0, -26.0), Vector2(-hw + 15.0, -30.0),
		Vector2(-hw + 15.0, shoulder + 6.0), Vector2(-hw + 9.0, shoulder + 12.0),
	])
	for piece in Geometry2D.intersect_polygons(refl, inner):
		draw_colored_polygon(piece, Color(1, 1, 1, 0.30))
	# Thin secondary reflection.
	draw_line(Vector2(-hw + 21.0, -40.0), Vector2(-hw + 21.0, -90.0), Color(1, 1, 1, 0.12), 2.0, true)
	# Shoulder sparkle.
	draw_circle(Vector2(-hw * 0.45, shoulder - 10.0), 3.2, Color(1, 1, 1, 0.55))
	draw_circle(Vector2(hw * 0.55, -22.0), 2.0, Color(1, 1, 1, 0.25))
	# Rim / outline.
	draw_polyline(_shape["rim_right"], rim, 2.6, true)
	draw_polyline(_shape["rim_left"], rim, 2.6, true)
	# Mouth opening ellipse.
	var lip: float = _shape["lip"]
	draw_set_transform(Vector2(0, -BottleShape.HEIGHT), 0.0, Vector2(1.0, 0.24))
	draw_arc(Vector2.ZERO, lip - 1.0, 0.0, TAU, 24, Color(rim, rim.a * 0.9), 2.6, true)
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
	if skin.get("style", "") == "crystal":
		var facet := Color(1, 1, 1, 0.14)
		draw_line(Vector2(-hw * 0.3, -10.0), Vector2(-hw * 0.3, shoulder), facet, 1.5, true)
		draw_line(Vector2(hw * 0.3, -10.0), Vector2(hw * 0.3, shoulder), facet, 1.5, true)
	elif skin.get("style", "") == "ancient":
		var gold: Color = skin.get("glow", Color("#F5C66A"))
		var band := Color(gold, 0.7)
		var y := shoulder + 16.0
		draw_line(Vector2(-hw + 6.0, y), Vector2(hw - 9.0, y), band, 2.0, true)
		for r in range(5):
			var x := -hw * 0.6 + r * hw * 0.3
			draw_circle(Vector2(x, y + 7.0), 1.6, band)


func _draw_cork() -> void:
	var neck: float = _shape["neck"]
	var drop := (1.0 - cork) * -40.0
	var top := -BottleShape.HEIGHT - 14.0 + drop
	var body := Rect2(Vector2(-neck + 2.0, top), Vector2((neck - 2.0) * 2.0, 26.0))
	var a := clampf(cork * 1.5, 0.0, 1.0)
	draw_rect(body, Color(0.55, 0.35, 0.2, a))
	draw_rect(Rect2(body.position, Vector2(body.size.x, 6.0)), Color(0.72, 0.5, 0.3, a))
	draw_line(body.position + Vector2(4, 12), body.position + Vector2(body.size.x - 4, 12),
		Color(0.4, 0.24, 0.12, a), 1.5)
	# A little gold seal.
	draw_circle(Vector2(0, top + 3.0), 4.0, Color(0.96, 0.78, 0.42, a))
