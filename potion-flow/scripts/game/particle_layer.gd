class_name ParticleLayer
extends Node2D
## Lightweight CPU particle system for splashes, sparkles and confetti.
## Only processes while particles are alive; capped for mobile performance.

const MAX_PARTICLES := 260

var particles: Array = []
var effect_scale := 1.0  # 0.4 on low-effects mode


func _ready() -> void:
	set_process(false)


func _spawn(p: Dictionary) -> void:
	if particles.size() >= MAX_PARTICLES:
		particles.pop_front()
	particles.append(p)
	set_process(true)


func splash(at: Vector2, color: Color, count := 10) -> void:
	for _k in range(int(count * effect_scale)):
		var a := randf_range(-PI * 0.95, -PI * 0.05)
		_spawn({"pos": at, "vel": Vector2(cos(a), sin(a)) * randf_range(70.0, 190.0),
			"life": randf_range(0.3, 0.55), "age": 0.0, "size": randf_range(2.0, 4.5),
			"color": color, "gravity": 520.0, "kind": "drop"})


func sparkle(at: Vector2, color: Color, count := 14, radius := 40.0) -> void:
	for _k in range(int(count * effect_scale)):
		var off := Vector2(randf_range(-radius, radius), randf_range(-radius, radius))
		_spawn({"pos": at + off, "vel": Vector2(randf_range(-20, 20), randf_range(-70, -20)),
			"life": randf_range(0.5, 1.0), "age": 0.0, "size": randf_range(2.5, 5.5),
			"color": color, "gravity": -10.0, "kind": "star"})


func burst(at: Vector2, colors: Array, count := 60) -> void:
	for _k in range(int(count * effect_scale)):
		var a := randf() * TAU
		var c: Color = colors[randi() % colors.size()] if not colors.is_empty() else Color.WHITE
		_spawn({"pos": at, "vel": Vector2(cos(a), sin(a)) * randf_range(160.0, 520.0),
			"life": randf_range(0.9, 1.6), "age": 0.0, "size": randf_range(3.0, 7.0),
			"color": c, "gravity": 380.0, "kind": "confetti", "spin": randf_range(-8.0, 8.0)})


func _process(delta: float) -> void:
	for k in range(particles.size() - 1, -1, -1):
		var p: Dictionary = particles[k]
		p["age"] += delta
		if p["age"] >= p["life"]:
			particles.remove_at(k)
			continue
		var v: Vector2 = p["vel"]
		v.y += float(p["gravity"]) * delta
		v *= 1.0 - delta * 1.2
		p["vel"] = v
		p["pos"] = (p["pos"] as Vector2) + v * delta
	queue_redraw()
	if particles.is_empty():
		set_process(false)


func _draw() -> void:
	for p in particles:
		var t: float = float(p["age"]) / float(p["life"])
		var c: Color = p["color"]
		c.a *= 1.0 - t * t
		var s: float = float(p["size"]) * (1.0 - t * 0.5)
		var pos: Vector2 = p["pos"]
		match p["kind"]:
			"star":
				draw_line(pos - Vector2(s * 1.6, 0), pos + Vector2(s * 1.6, 0), c, 1.6, true)
				draw_line(pos - Vector2(0, s * 1.6), pos + Vector2(0, s * 1.6), c, 1.6, true)
				draw_circle(pos, s * 0.55, c)
			"confetti":
				var ang: float = float(p["spin"]) * float(p["age"])
				draw_set_transform(pos, ang, Vector2.ONE)
				draw_rect(Rect2(Vector2(-s, -s * 0.5), Vector2(s * 2.0, s)), c)
				draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
			_:
				draw_circle(pos, s, c)
