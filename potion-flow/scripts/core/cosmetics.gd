class_name Cosmetics
extends RefCounted
## Catalogue of cosmetic bottle skins and background themes.
## Cosmetics change visuals only, never puzzle difficulty.

const SKINS := {
	"classic": {"name": "Classic Glass", "price": 0, "shape": "round", "style": "classic",
		"tint": Color(0.78, 0.82, 1.0, 0.12), "rim": Color(1, 1, 1, 0.62), "glow": Color("#A855F7")},
	"crystal": {"name": "Crystal Glass", "price": 400, "shape": "crystal", "style": "crystal",
		"tint": Color(0.7, 0.95, 1.0, 0.16), "rim": Color(0.8, 0.97, 1.0, 0.8), "glow": Color("#38D9F5")},
	"gold": {"name": "Gilded Flask", "price": 900, "shape": "round", "style": "gold",
		"tint": Color(1.0, 0.85, 0.5, 0.12), "rim": Color("#F5C66A"), "glow": Color("#F5C66A")},
	"moonlight": {"name": "Moonlight", "price": 700, "shape": "crystal", "style": "crystal",
		"tint": Color(0.75, 0.8, 1.0, 0.18), "rim": Color(0.82, 0.86, 1.0, 0.9), "glow": Color("#9DB4FF")},
	"ancient": {"name": "Ancient Alchemy", "price": 1200, "shape": "ancient", "style": "ancient",
		"tint": Color(0.9, 0.75, 0.55, 0.13), "rim": Color(0.95, 0.8, 0.55, 0.75), "glow": Color("#F5C66A")},
	"neon": {"name": "Neon Flux", "price": 1500, "shape": "round", "style": "neon",
		"tint": Color(1.0, 0.4, 0.85, 0.10), "rim": Color("#F472B6"), "glow": Color("#F472B6")},
}

const SKIN_ORDER: PackedStringArray = ["classic", "crystal", "moonlight", "gold", "ancient", "neon"]

const THEMES := {
	"purple": {"name": "Purple Magic", "price": 0, "top": Color("#1A1230"), "bottom": Color("#100B20"),
		"accent": Color("#7C3AED"), "particle": Color("#A855F7")},
	"forest": {"name": "Enchanted Forest", "price": 500, "top": Color("#0F2A22"), "bottom": Color("#07140F"),
		"accent": Color("#45D483"), "particle": Color("#A3E635")},
	"ocean": {"name": "Deep Ocean", "price": 500, "top": Color("#0B2340"), "bottom": Color("#050E1E"),
		"accent": Color("#4F8CFF"), "particle": Color("#38D9F5")},
	"sunset": {"name": "Ember Sunset", "price": 700, "top": Color("#3A1530"), "bottom": Color("#140812"),
		"accent": Color("#F472B6"), "particle": Color("#F5C66A")},
	"galaxy": {"name": "Galaxy", "price": 900, "top": Color("#1B0F3A"), "bottom": Color("#05030D"),
		"accent": Color("#A855F7"), "particle": Color("#FFFFFF")},
	"ice": {"name": "Ice Kingdom", "price": 900, "top": Color("#1D3550"), "bottom": Color("#0A1424"),
		"accent": Color("#38D9F5"), "particle": Color("#DDF6FF")},
}

const THEME_ORDER: PackedStringArray = ["purple", "forest", "ocean", "sunset", "galaxy", "ice"]


static func get_skin(id: String) -> Dictionary:
	return SKINS.get(id, SKINS["classic"])


static func get_theme(id: String) -> Dictionary:
	return THEMES.get(id, THEMES["purple"])
