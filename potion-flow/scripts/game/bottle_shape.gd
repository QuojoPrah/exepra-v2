class_name BottleShape
extends RefCounted
## Procedural geometry for the potion bottle silhouettes.
## Coordinates: origin at the outer bottom-centre of the bottle, y grows downward,
## so the bottle occupies negative y. One "unit" is one design pixel.

const GLASS := 5.0
const HEIGHT := 236.0

const STYLES := {
	# Classic potion: round base, soft rounded shoulders.
	"round": {"hw": 42.0, "r": 22.0, "shoulder": -170.0, "neck": 16.0, "neck_top": -224.0,
		"lip": 22.0, "taper": 0.0, "chamfer": false},
	# Crystal: chamfered base and straight faceted shoulders.
	"crystal": {"hw": 41.0, "r": 14.0, "shoulder": -172.0, "neck": 15.0, "neck_top": -224.0,
		"lip": 21.0, "taper": 0.0, "chamfer": true},
	# Ancient alchemy: wide base that tapers to the shoulder.
	"ancient": {"hw": 45.0, "r": 26.0, "shoulder": -166.0, "neck": 14.0, "neck_top": -222.0,
		"lip": 23.0, "taper": 6.0, "chamfer": false},
}

static var _cache := {}


static func get_shape(style: String) -> Dictionary:
	if not STYLES.has(style):
		style = "round"
	if not _cache.has(style):
		_cache[style] = _build(STYLES[style])
	return _cache[style]


static func _build(p: Dictionary) -> Dictionary:
	var outer_half := _half_path(p, 0.0)
	var inner_half := _half_path(p, GLASS)
	# Lip flare on the outside only.
	var lip_half := outer_half.duplicate()
	var neck_top: float = p["neck_top"]
	lip_half.append(Vector2(p["lip"], neck_top - 1.0))
	lip_half.append(Vector2(p["lip"], -HEIGHT))
	lip_half.append(Vector2(p["neck"] - 1.0, -HEIGHT))

	var outer := _mirror_closed(lip_half)
	var inner := _mirror_closed(inner_half)
	var right_rim := PackedVector2Array(lip_half)
	var left_rim := PackedVector2Array()
	for v in lip_half:
		left_rim.append(Vector2(-v.x, v.y))

	var liquid_bottom := -GLASS
	var liquid_top: float = float(p["shoulder"]) + 4.0
	var glow: Array = []
	for d in [5.0, 11.0, 18.0]:
		var polys := Geometry2D.offset_polygon(outer, d, Geometry2D.JOIN_ROUND)
		glow.append(polys[0] if not polys.is_empty() else outer)
	return {
		"outer": outer,
		"inner": inner,
		"rim_right": right_rim,
		"rim_left": left_rim,
		"glow": glow,
		"half_width": float(p["hw"]),
		"neck": float(p["neck"]),
		"lip": float(p["lip"]),
		"neck_top": neck_top,
		"shoulder": float(p["shoulder"]),
		"mouth": Vector2(0.0, -HEIGHT),
		"liquid_bottom": liquid_bottom,
		"liquid_top": liquid_top,
		"chamfer": bool(p["chamfer"]),
		"taper": float(p["taper"]),
	}


## Right half of the silhouette from bottom-centre to the top of the neck.
static func _half_path(p: Dictionary, inset: float) -> PackedVector2Array:
	var pts := PackedVector2Array()
	var hw: float = float(p["hw"]) - inset
	var r: float = maxf(2.0, float(p["r"]) - inset)
	var base_y := -inset
	var shoulder_y: float = p["shoulder"]
	var neck_hw: float = float(p["neck"]) - inset
	var neck_top: float = p["neck_top"]
	var top_hw: float = hw - float(p["taper"])
	pts.append(Vector2(0.0, base_y))
	if p["chamfer"]:
		pts.append(Vector2(hw - r, base_y))
		pts.append(Vector2(hw, base_y - r))
	else:
		var c := Vector2(hw - r, base_y - r)
		for k in range(9):
			var a := PI / 2.0 - (PI / 2.0) * k / 8.0
			pts.append(c + Vector2(cos(a), sin(a)) * r)
	pts.append(Vector2(top_hw, shoulder_y))
	var shoulder_end := Vector2(neck_hw, shoulder_y - 34.0 + inset * 0.5)
	if p["chamfer"]:
		pts.append(Vector2(top_hw - 4.0, shoulder_y - 8.0))
		pts.append(shoulder_end)
	else:
		var p0 := Vector2(top_hw, shoulder_y)
		var c1 := Vector2(top_hw, shoulder_y - 30.0)
		for k in range(1, 11):
			var t := k / 10.0
			pts.append(p0.lerp(c1, t).lerp(c1.lerp(shoulder_end, t), t))
	pts.append(Vector2(neck_hw, neck_top))
	return pts


static func _mirror_closed(half: PackedVector2Array) -> PackedVector2Array:
	var out := PackedVector2Array(half)
	for k in range(half.size() - 1, -1, -1):
		var v := half[k]
		if absf(v.x) < 0.01:
			continue
		out.append(Vector2(-v.x, v.y))
	return out
