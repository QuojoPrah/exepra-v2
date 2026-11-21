class_name UIKit
extends RefCounted
## Shared look-and-feel helpers: theme, buttons, panels, modals and toasts.

const BG := Color("#100B20")
const PANEL := Color("#1A1230")
const VIOLET := Color("#7C3AED")
const PURPLE := Color("#A855F7")
const GOLD := Color("#F5C66A")
const CYAN := Color("#38D9F5")
const PINK := Color("#F472B6")
const BLUE := Color("#4F8CFF")
const GREEN := Color("#45D483")
const TEXT := Color("#F4EEFF")
const TEXT_DIM := Color(0.85, 0.8, 1.0, 0.65)

const FONT_UI := "res://assets/fonts/LilitaOne-Regular.ttf"
const FONT_LOGO := "res://assets/fonts/CinzelDecorative-Bold.ttf"

static var _theme: Theme


static func font(path: String = FONT_UI) -> Font:
	if ResourceLoader.exists(path):
		return load(path)
	return ThemeDB.fallback_font


static func get_theme() -> Theme:
	if _theme != null:
		return _theme
	var t := Theme.new()
	t.default_font = font()
	t.default_font_size = 30
	t.set_color("font_color", "Label", TEXT)
	for state in ["normal", "hover", "pressed", "disabled", "focus"]:
		t.set_stylebox(state, "Button", button_style(VIOLET, state))
	t.set_color("font_color", "Button", TEXT)
	t.set_color("font_hover_color", "Button", TEXT)
	t.set_color("font_pressed_color", "Button", TEXT)
	t.set_color("font_focus_color", "Button", TEXT)
	t.set_color("font_disabled_color", "Button", Color(TEXT, 0.4))
	t.set_font_size("font_size", "Button", 32)
	var slider_bg := flat(Color(1, 1, 1, 0.12), 10)
	slider_bg.content_margin_top = 8
	slider_bg.content_margin_bottom = 8
	t.set_stylebox("slider", "HSlider", slider_bg)
	t.set_stylebox("grabber_area", "HSlider", flat(PURPLE, 10))
	t.set_stylebox("grabber_area_highlight", "HSlider", flat(PURPLE.lightened(0.15), 10))
	t.set_icon("grabber", "HSlider", _circle_texture(30, GOLD))
	t.set_icon("grabber_highlight", "HSlider", _circle_texture(34, GOLD.lightened(0.2)))
	t.set_stylebox("panel", "PanelContainer", flat(PANEL, 28))
	t.set_stylebox("panel", "ScrollContainer", StyleBoxEmpty.new())
	_theme = t
	return t


static func _circle_texture(d: int, c: Color) -> Texture2D:
	var img := Image.create(d, d, false, Image.FORMAT_RGBA8)
	var r := d * 0.5
	for y in range(d):
		for x in range(d):
			var dist := Vector2(x + 0.5 - r, y + 0.5 - r).length()
			var a := clampf(r - dist, 0.0, 1.0)
			img.set_pixel(x, y, Color(c, a))
	return ImageTexture.create_from_image(img)


static func flat(color: Color, radius: int = 24, border: Color = Color(0, 0, 0, 0),
		border_w: int = 0) -> StyleBoxFlat:
	var s := StyleBoxFlat.new()
	s.bg_color = color
	s.set_corner_radius_all(radius)
	s.anti_aliasing = true
	if border_w > 0:
		s.border_color = border
		s.set_border_width_all(border_w)
	s.content_margin_left = 18
	s.content_margin_right = 18
	s.content_margin_top = 10
	s.content_margin_bottom = 10
	return s


static func button_style(base: Color, state: String) -> StyleBoxFlat:
	var c := base
	match state:
		"hover":
			c = base.lightened(0.08)
		"pressed":
			c = base.darkened(0.15)
		"disabled":
			c = base.darkened(0.45)
		"focus":
			c = base
	var s := flat(c, 26, base.lightened(0.35), 2)
	s.shadow_color = Color(0, 0, 0, 0.35)
	s.shadow_size = 6 if state != "pressed" else 2
	s.shadow_offset = Vector2(0, 4 if state != "pressed" else 1)
	if state == "focus":
		s.bg_color = Color(0, 0, 0, 0)
		s.border_color = Color(1, 1, 1, 0.0)
		s.shadow_size = 0
	return s


static func style_button(b: Button, base: Color, font_size := 32) -> void:
	for state in ["normal", "hover", "pressed", "disabled"]:
		b.add_theme_stylebox_override(state, button_style(base, state))
	b.add_theme_stylebox_override("focus", button_style(base, "focus"))
	b.add_theme_font_size_override("font_size", font_size)
	var dark := base.get_luminance() > 0.6
	var fc := Color("#2A1A05") if dark else TEXT
	for key in ["font_color", "font_hover_color", "font_pressed_color", "font_focus_color"]:
		b.add_theme_color_override(key, fc)


## A juicy button: squash on press, overshoot on release, click sound.
static func make_button(text: String, base: Color = VIOLET, min_size := Vector2(0, 96),
		font_size := 34, icon_id := "") -> Button:
	var b := Button.new()
	b.text = text
	b.custom_minimum_size = min_size
	b.focus_mode = Control.FOCUS_NONE
	style_button(b, base, font_size)
	if icon_id != "":
		var ic := IconView.new()
		ic.icon = icon_id
		ic.color = Color("#2A1A05") if base.get_luminance() > 0.6 else TEXT
		ic.custom_minimum_size = Vector2(44, 44)
		ic.size = Vector2(44, 44)
		ic.position = Vector2(22, (min_size.y - 44) * 0.5)
		b.add_child(ic)
		b.alignment = HORIZONTAL_ALIGNMENT_CENTER
	add_juice(b)
	return b


## Round icon button with a caption underneath (used by the game toolbar).
static func make_icon_button(icon_id: String, caption: String, base: Color = VIOLET,
		diameter := 108) -> Button:
	var b := Button.new()
	b.custom_minimum_size = Vector2(diameter, diameter)
	b.focus_mode = Control.FOCUS_NONE
	for state in ["normal", "hover", "pressed", "disabled", "focus"]:
		var st := button_style(base, state)
		st.set_corner_radius_all(diameter / 2)
		b.add_theme_stylebox_override(state, st)
	var ic := IconView.new()
	ic.icon = icon_id
	ic.color = TEXT
	ic.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	ic.offset_left = diameter * 0.22
	ic.offset_right = -diameter * 0.22
	ic.offset_top = diameter * 0.16
	ic.offset_bottom = -diameter * (0.28 if caption != "" else 0.18)
	b.add_child(ic)
	if caption != "":
		var l := make_label(caption, 19, TEXT)
		l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		l.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
		l.offset_top = -diameter * 0.32
		l.offset_bottom = -diameter * 0.06
		b.add_child(l)
	add_juice(b)
	return b


static func add_badge(parent: Control, text: String, color: Color = PINK) -> Label:
	var l := make_label(text, 20, Color.WHITE)
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	l.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	var st := flat(color, 16)
	st.content_margin_left = 9
	st.content_margin_right = 9
	st.content_margin_top = 1
	st.content_margin_bottom = 1
	l.add_theme_stylebox_override("normal", st)
	# Anchored top-left with a fixed offset: the parent's size is not final yet.
	l.position = Vector2(parent.custom_minimum_size.x - 40, -10)
	l.custom_minimum_size = Vector2(44, 32)
	parent.add_child(l)
	return l


static func add_juice(c: Control) -> void:
	c.resized.connect(func() -> void: c.pivot_offset = c.size * 0.5)
	if c is BaseButton:
		var b := c as BaseButton
		b.button_down.connect(func() -> void:
			var tw := b.create_tween()
			tw.tween_property(b, "scale", Vector2(0.92, 0.92), 0.07)
			AudioManager.play("click")
			AudioManager.vibrate(8)
		)
		b.button_up.connect(func() -> void:
			var tw := b.create_tween()
			tw.tween_property(b, "scale", Vector2.ONE, 0.22) \
				.set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
		)


static func make_label(text: String, size := 30, color: Color = TEXT, outline := 0) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", color)
	if outline > 0:
		l.add_theme_constant_override("outline_size", outline)
		l.add_theme_color_override("font_outline_color", Color(0.06, 0.03, 0.12, 0.9))
	l.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return l


static func coin_pill(amount: int) -> PanelContainer:
	var p := PanelContainer.new()
	p.add_theme_stylebox_override("panel", flat(Color(0, 0, 0, 0.35), 30, Color(GOLD, 0.5), 2))
	p.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var h := HBoxContainer.new()
	h.add_theme_constant_override("separation", 8)
	h.mouse_filter = Control.MOUSE_FILTER_IGNORE
	p.add_child(h)
	var ic := IconView.new()
	ic.icon = "coin"
	ic.custom_minimum_size = Vector2(40, 40)
	h.add_child(ic)
	var l := make_label(str(amount), 30, GOLD)
	l.name = "Amount"
	l.custom_minimum_size = Vector2(70, 0)
	h.add_child(l)
	return p


## Full-screen dimmer with a centred card. Returns {"root", "card", "body", "close"}.
static func make_modal(title: String, width := 600.0, closable := true) -> Dictionary:
	var root := Control.new()
	root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.theme = get_theme()
	root.mouse_filter = Control.MOUSE_FILTER_STOP
	var dim := ColorRect.new()
	dim.color = Color(0.03, 0.01, 0.08, 0.72)
	dim.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root.add_child(dim)
	var center := CenterContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	center.mouse_filter = Control.MOUSE_FILTER_IGNORE
	root.add_child(center)
	var card := PanelContainer.new()
	var st := flat(PANEL, 34, Color(PURPLE, 0.55), 3)
	st.content_margin_left = 34
	st.content_margin_right = 34
	st.content_margin_top = 30
	st.content_margin_bottom = 34
	st.shadow_color = Color(VIOLET, 0.35)
	st.shadow_size = 30
	card.add_theme_stylebox_override("panel", st)
	card.custom_minimum_size = Vector2(width, 0)
	center.add_child(card)
	var body := VBoxContainer.new()
	body.add_theme_constant_override("separation", 20)
	card.add_child(body)
	var head := HBoxContainer.new()
	body.add_child(head)
	var t := make_label(title, 44, GOLD, 6)
	t.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	t.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER if not closable else HORIZONTAL_ALIGNMENT_LEFT
	head.add_child(t)
	var close: Button = null
	if closable:
		close = make_icon_button("close", "", Color("#3A2A5C"), 72)
		head.add_child(close)
	card.resized.connect(func() -> void: card.pivot_offset = card.size * 0.5)
	return {"root": root, "card": card, "body": body, "close": close, "title": t}


static func pop_in(card: Control) -> void:
	card.scale = Vector2(0.86, 0.86)
	card.modulate.a = 0.0
	var tw := card.create_tween().set_parallel(true)
	tw.tween_property(card, "scale", Vector2.ONE, 0.28).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	tw.tween_property(card, "modulate:a", 1.0, 0.18)


static func close_modal(root: Control) -> void:
	var tw := root.create_tween()
	tw.tween_property(root, "modulate:a", 0.0, 0.15)
	tw.tween_callback(root.queue_free)


static func toast(parent: Node, text: String, y_from_bottom := 330.0) -> void:
	var l := make_label(text, 28, TEXT)
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	l.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	var st := flat(Color(0.1, 0.05, 0.2, 0.94), 24, Color(PURPLE, 0.6), 2)
	st.content_margin_left = 24
	st.content_margin_right = 24
	st.content_margin_top = 14
	st.content_margin_bottom = 14
	l.add_theme_stylebox_override("normal", st)
	l.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
	l.anchor_left = 0.08
	l.anchor_right = 0.92
	l.offset_left = 0
	l.offset_right = 0
	l.offset_top = -y_from_bottom
	l.offset_bottom = -y_from_bottom + 70
	l.modulate.a = 0.0
	parent.add_child(l)
	var tw := l.create_tween()
	tw.tween_property(l, "modulate:a", 1.0, 0.18)
	tw.parallel().tween_property(l, "offset_top", -y_from_bottom - 16, 0.18)
	tw.tween_interval(1.9)
	tw.tween_property(l, "modulate:a", 0.0, 0.3)
	tw.tween_callback(l.queue_free)


## Yes/No confirmation. `on_confirm` runs only when the player confirms.
static func confirm(parent: Node, title: String, message: String, ok_text: String,
		on_confirm: Callable, danger := false) -> void:
	var m := make_modal(title, 580.0, false)
	var msg := make_label(message, 28, TEXT_DIM)
	msg.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	msg.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	msg.custom_minimum_size = Vector2(500, 0)
	m["body"].add_child(msg)
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 18)
	m["body"].add_child(row)
	var cancel := make_button("Cancel", Color("#3A2A5C"), Vector2(0, 88), 30)
	cancel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	var ok := make_button(ok_text, Color("#E8364F") if danger else GOLD, Vector2(0, 88), 30)
	ok.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	row.add_child(cancel)
	row.add_child(ok)
	var root: Control = m["root"]
	cancel.pressed.connect(func() -> void: close_modal(root))
	ok.pressed.connect(func() -> void:
		close_modal(root)
		on_confirm.call()
	)
	parent.add_child(root)
	pop_in(m["card"])
