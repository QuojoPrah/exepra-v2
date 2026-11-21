class_name IconView
extends Control
## Vector icons drawn procedurally (no image assets needed).
## Replace with textures later by swapping this control for a TextureRect.

@export var icon := "star":
	set(v):
		icon = v
		queue_redraw()
@export var color := Color.WHITE:
	set(v):
		color = v
		queue_redraw()


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE


func _draw() -> void:
	var s := minf(size.x, size.y)
	var c := size * 0.5
	var w := maxf(2.0, s * 0.09)
	match icon:
		"undo":
			draw_arc(c + Vector2(s * 0.04, s * 0.06), s * 0.28, -PI * 0.95, PI * 0.55, 20, color, w, true)
			var tip := c + Vector2(-s * 0.24, -s * 0.04)
			_tri(tip + Vector2(-s * 0.04, -s * 0.16), tip + Vector2(-s * 0.18, s * 0.06), tip + Vector2(s * 0.12, s * 0.06))
		"restart":
			draw_arc(c, s * 0.3, -PI * 0.35, PI * 1.45, 24, color, w, true)
			var tip2 := c + Vector2(cos(-PI * 0.35), sin(-PI * 0.35)) * s * 0.3
			_tri(tip2 + Vector2(-s * 0.16, -s * 0.08), tip2 + Vector2(s * 0.08, -s * 0.16), tip2 + Vector2(s * 0.06, s * 0.12))
		"hint":
			draw_circle(c + Vector2(0, -s * 0.08), s * 0.24, color)
			draw_rect(Rect2(c + Vector2(-s * 0.11, s * 0.1), Vector2(s * 0.22, s * 0.14)), color)
			draw_rect(Rect2(c + Vector2(-s * 0.08, s * 0.27), Vector2(s * 0.16, s * 0.06)), color)
			draw_circle(c + Vector2(-s * 0.08, -s * 0.15), s * 0.06, Color(1, 1, 1, 0.7))
		"bottle_add":
			var p := PackedVector2Array([
				c + Vector2(-s * 0.09, -s * 0.38), c + Vector2(s * 0.09, -s * 0.38),
				c + Vector2(s * 0.09, -s * 0.18), c + Vector2(s * 0.22, -s * 0.06),
				c + Vector2(s * 0.22, s * 0.36), c + Vector2(-s * 0.22, s * 0.36),
				c + Vector2(-s * 0.22, -s * 0.06), c + Vector2(-s * 0.09, -s * 0.18),
				c + Vector2(-s * 0.09, -s * 0.38)])
			draw_polyline(p, color, w * 0.8, true)
			draw_line(c + Vector2(0, 0.02 * s), c + Vector2(0, 0.24 * s), color, w, true)
			draw_line(c + Vector2(-0.11 * s, 0.13 * s), c + Vector2(0.11 * s, 0.13 * s), color, w, true)
		"gear":
			for k in range(8):
				var a := TAU * k / 8.0
				draw_line(c + Vector2(cos(a), sin(a)) * s * 0.22, c + Vector2(cos(a), sin(a)) * s * 0.4, color, w * 1.6)
			draw_circle(c, s * 0.27, color)
			draw_circle(c, s * 0.11, Color(0.1, 0.06, 0.2))
		"coin":
			draw_circle(c, s * 0.42, Color("#C98A2E"))
			draw_circle(c, s * 0.36, Color("#F5C66A"))
			draw_circle(c, s * 0.25, Color("#FFE3A3"))
			_star(c, s * 0.18, Color("#E0A23F"))
		"star":
			_star(c, s * 0.46, color)
		"star_empty":
			_star(c, s * 0.46, Color(color, 0.25))
		"home":
			_tri(c + Vector2(0, -s * 0.38), c + Vector2(-s * 0.4, s * 0.02), c + Vector2(s * 0.4, s * 0.02))
			draw_rect(Rect2(c + Vector2(-s * 0.27, 0), Vector2(s * 0.54, s * 0.36)), color)
			draw_rect(Rect2(c + Vector2(-s * 0.08, s * 0.12), Vector2(s * 0.16, s * 0.24)), Color(0.1, 0.06, 0.2))
		"shop":
			draw_rect(Rect2(c + Vector2(-s * 0.32, -s * 0.12), Vector2(s * 0.64, s * 0.48)), color)
			draw_arc(c + Vector2(0, -s * 0.12), s * 0.18, PI, TAU, 14, color, w, true)
			draw_circle(c + Vector2(0, s * 0.1), s * 0.07, Color(0.1, 0.06, 0.2))
		"gift":
			draw_rect(Rect2(c + Vector2(-s * 0.34, -s * 0.08), Vector2(s * 0.68, s * 0.44)), color)
			draw_rect(Rect2(c + Vector2(-s * 0.4, -s * 0.2), Vector2(s * 0.8, s * 0.14)), color.lightened(0.2))
			draw_rect(Rect2(c + Vector2(-s * 0.06, -s * 0.2), Vector2(s * 0.12, s * 0.56)), Color("#F472B6"))
			draw_circle(c + Vector2(-s * 0.12, -s * 0.28), s * 0.09, Color("#F472B6"))
			draw_circle(c + Vector2(s * 0.12, -s * 0.28), s * 0.09, Color("#F472B6"))
		"collection":
			for k in range(3):
				var x := (k - 1) * s * 0.26
				var h := s * (0.5 if k == 1 else 0.38)
				draw_rect(Rect2(c + Vector2(x - s * 0.09, s * 0.32 - h), Vector2(s * 0.18, h)), Color(color, 0.9 - k * 0.15))
				draw_rect(Rect2(c + Vector2(x - s * 0.04, s * 0.32 - h - s * 0.1), Vector2(s * 0.08, s * 0.1)), color)
		"play":
			_tri(c + Vector2(-s * 0.22, -s * 0.3), c + Vector2(-s * 0.22, s * 0.3), c + Vector2(s * 0.3, 0))
		"close":
			draw_line(c + Vector2(-s, -s) * 0.25, c + Vector2(s, s) * 0.25, color, w * 1.2, true)
			draw_line(c + Vector2(s, -s) * 0.25, c + Vector2(-s, s) * 0.25, color, w * 1.2, true)
		"next":
			_tri(c + Vector2(-s * 0.3, -s * 0.28), c + Vector2(-s * 0.3, s * 0.28), c + Vector2(s * 0.05, 0))
			_tri(c + Vector2(-s * 0.02, -s * 0.28), c + Vector2(-s * 0.02, s * 0.28), c + Vector2(s * 0.33, 0))
		"lock":
			draw_arc(c + Vector2(0, -s * 0.06), s * 0.17, PI, TAU, 14, color, w, true)
			draw_line(c + Vector2(-s * 0.17, -s * 0.06), c + Vector2(-s * 0.17, s * 0.04), color, w)
			draw_line(c + Vector2(s * 0.17, -s * 0.06), c + Vector2(s * 0.17, s * 0.04), color, w)
			draw_rect(Rect2(c + Vector2(-s * 0.26, s * 0.02), Vector2(s * 0.52, s * 0.34)), color)
		"check":
			draw_polyline(PackedVector2Array([c + Vector2(-0.26, 0.0) * s, c + Vector2(-0.06, 0.2) * s,
				c + Vector2(0.28, -0.2) * s]), color, w * 1.3, true)
		_:
			draw_circle(c, s * 0.3, color)


func _tri(a: Vector2, b: Vector2, d: Vector2) -> void:
	draw_colored_polygon(PackedVector2Array([a, b, d]), color)


func _star(c: Vector2, r: float, col: Color) -> void:
	var pts := PackedVector2Array()
	for k in range(10):
		var a := -PI / 2.0 + PI * k / 5.0
		var rr := r if k % 2 == 0 else r * 0.45
		pts.append(c + Vector2(cos(a), sin(a)) * rr)
	draw_colored_polygon(pts, col)
