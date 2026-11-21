class_name CosmeticPreview
extends Control
## Small preview of a skin (a live BottleView) or a theme (gradient swatch).

var kind := "skin"
var item: Dictionary = {}
var _bottle: BottleView
var _time := 0.0


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	clip_contents = true
	if kind == "skin":
		_bottle = BottleView.new()
		_bottle.set_skin(item)
		_bottle.set_contents(["blue", "violet", "pink"])
		_bottle.scale = Vector2(0.68, 0.68)
		add_child(_bottle)
		resized.connect(_place)
		_place()
	else:
		set_process(true)


func _place() -> void:
	if _bottle:
		_bottle.position = Vector2(size.x * 0.5, size.y - 12.0)
		_bottle.rest_position = _bottle.position


func _process(delta: float) -> void:
	_time += delta
	if kind != "skin":
		queue_redraw()


func _draw() -> void:
	if kind == "skin":
		return
	var top: Color = item.get("top", Color.BLACK)
	var bottom: Color = item.get("bottom", Color.BLACK)
	var accent: Color = item.get("accent", Color.WHITE)
	var particle: Color = item.get("particle", Color.WHITE)
	var r := Rect2(Vector2(6, 6), size - Vector2(12, 12))
	draw_polygon(PackedVector2Array([r.position, Vector2(r.end.x, r.position.y), r.end,
		Vector2(r.position.x, r.end.y)]), PackedColorArray([top.lightened(0.1), top.lightened(0.1), bottom, bottom]))
	draw_circle(r.get_center() + Vector2(sin(_time) * 20.0, 0), 60.0, Color(accent, 0.18))
	for k in range(14):
		var p := r.position + Vector2(fmod(k * 53.0, r.size.x), fmod(k * 37.0 + _time * 12.0, r.size.y))
		draw_circle(p, 2.0 + (k % 3), Color(particle, 0.6))
