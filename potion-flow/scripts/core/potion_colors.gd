class_name PotionColors
extends RefCounted
## The liquid palette. Ids are stable strings used in level files and saves.

const ORDER: PackedStringArray = [
	"red", "blue", "green", "yellow", "violet",
	"orange", "cyan", "pink", "lime", "magenta",
]

const COLORS := {
	"red": Color("#E8364F"),      # Ruby red
	"blue": Color("#3D7BFF"),     # Ocean blue
	"green": Color("#1FBF75"),    # Emerald green
	"yellow": Color("#FFC93C"),   # Golden yellow
	"violet": Color("#8B5CF6"),   # Violet
	"orange": Color("#FF8A2B"),   # Orange
	"cyan": Color("#38D9F5"),     # Cyan
	"pink": Color("#FF8FC8"),     # Pink
	"lime": Color("#A3E635"),     # Lime
	"magenta": Color("#D946EF"),  # Magenta
}

const NAMES := {
	"red": "Ruby", "blue": "Ocean", "green": "Emerald", "yellow": "Gold",
	"violet": "Violet", "orange": "Ember", "cyan": "Frost", "pink": "Blossom",
	"lime": "Lime", "magenta": "Mystic",
}


static func has(id: String) -> bool:
	return COLORS.has(id)


static func get_color(id: String) -> Color:
	return COLORS.get(id, Color.WHITE)
