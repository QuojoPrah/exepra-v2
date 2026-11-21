class_name PourStream
extends Node2D
## The falling ribbon of liquid between two bottles during a pour.

var from_point := Vector2.ZERO
var to_point := Vector2.ZERO
var color := Color.WHITE
var width := 0.0  # animated by the controller
var _time := 0.0


func _ready() -> void:
	set_process(false)


func start(p_from: Vector2, p_to: Vector2, p_color: Color) -> void:
	from_point = p_from
	to_point = p_to
	color = p_color
	visible = true
	set_process(true)


func stop() -> void:
	visible = false
	width = 0.0
	set_process(false)
	queue_redraw()


func _process(delta: float) -> void:
	_time += delta
	queue_redraw()


func _draw() -> void:
	if width <= 0.2:
		return
	var pts := PackedVector2Array()
	var steps := 14
	# Slight arc: liquid leaves the lip sideways, then falls straight.
	var ctrl := Vector2(to_point.x, from_point.y)
	for s in range(steps + 1):
		var t := float(s) / steps
		var p := from_point.lerp(ctrl, t * 0.6).lerp(ctrl.lerp(to_point, t), t)
		p.x += sin(t * 9.0 + _time * 18.0) * 0.8 * t
		pts.append(p)
	var glow := color
	glow.a = 0.25
	draw_polyline(pts, glow, width * 2.0, true)
	draw_polyline(pts, color, width, true)
	draw_polyline(pts, color.lightened(0.45), maxf(1.0, width * 0.25), true)
