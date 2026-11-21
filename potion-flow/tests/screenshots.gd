extends Node
## Captures screenshots of the real screens for visual review.
##   godot --path . res://tests/Screenshots.tscn -- <output_dir>

const GAME_SCENE := preload("res://scenes/Game.tscn")

var out_dir := "user://screenshots"


func _ready() -> void:
	var args := OS.get_cmdline_user_args()
	if not args.is_empty():
		out_dir = args[0]
	DirAccess.make_dir_recursive_absolute(out_dir)
	SaveManager.save_path = "user://screenshot_save.json"
	SaveManager.data = SaveManager.defaults()
	SaveManager.set_value("daily", "last_claim_day", 999999)  # suppress the daily popup
	await _run()
	get_tree().quit()


func _snap(name: String) -> void:
	await RenderingServer.frame_post_draw
	get_viewport().get_texture().get_image().save_png(out_dir.path_join(name + ".png"))
	print("saved ", name)


func _wait(t: float) -> void:
	await get_tree().create_timer(t).timeout


func _run() -> void:
	var menu: Node = load("res://scenes/MainMenu.tscn").instantiate()
	add_child(menu)
	await _wait(1.2)
	await _snap("01_home")
	menu.queue_free()

	GameManager.pending_level = 40
	var game: GameController = GAME_SCENE.instantiate()
	add_child(game)
	await _wait(1.0)
	await _snap("02_game")
	var mv: Vector2i = Solver.solve(game.board)["moves"][0]
	game.tap_bottle(mv.x)
	await _wait(0.25)
	await _snap("03_selected")
	game.tap_bottle(mv.y)
	await _wait(0.45)
	await _snap("04_pouring")
	await _wait(1.0)
	game.request_hint()
	await _wait(0.6)
	await _snap("05_hint")
	for m in Solver.solve(game.board)["moves"]:
		game.tap_bottle(m.x)
		game.tap_bottle(m.y)
		while game.play_state == GameController.PlayState.POURING:
			await get_tree().process_frame
	await _wait(0.5)
	await _snap("06_win_burst")
	await _wait(1.6)
	await _snap("07_level_complete")
	game.queue_free()

	GameManager.pending_level = 140
	game = GAME_SCENE.instantiate()
	add_child(game)
	await _wait(1.0)
	await _snap("08_hard_level")
	var shop := ShopPanel.new()
	game._overlay_layer.add_child(shop)
	await _wait(0.6)
	await _snap("09_shop")
	shop.queue_free()
	var settings := SettingsPanel.new()
	game._overlay_layer.add_child(settings)
	await _wait(0.6)
	await _snap("10_settings")
