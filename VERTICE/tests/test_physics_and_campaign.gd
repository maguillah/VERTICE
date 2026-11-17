extends SceneTree

# Teste headless GDScript (para execução em ambiente com binário Godot 4.3: godot --headless --path VERTICE -s res://tests/test_physics_and_campaign.gd)
func _init() -> void:
	var errors: Array[String] = []
	var required_scenes := [
		"res://scenes/main.tscn",
		"res://scenes/world_chapter_1.tscn",
		"res://scenes/world_chapter_2_threshold.tscn",
		"res://scenes/world_chapter_3_city.tscn",
		"res://scenes/world_chapter_4_abyss.tscn",
		"res://scenes/world_chapter_5_convergence.tscn",
		"res://scenes/world_chapter_6_threshold.tscn"
	]
	for p in required_scenes:
		if not ResourceLoader.exists(p):
			errors.append("Cena ausente: %s" % p)

	var player_scene := load("res://scenes/player.tscn") as PackedScene
	if player_scene == null:
		errors.append("Falha ao carregar player.tscn")
	else:
		var inst := player_scene.instantiate() as CharacterBody2D
		if inst == null:
			errors.append("player.tscn não instancia CharacterBody2D")
		else:
			if not inst.floor_stop_on_slope or inst.floor_snap_length < 4.0:
				errors.append("Configuração anti-deslizamento de solo ausente em player.tscn")
			inst.free()

	if errors.is_empty():
		print("VERTICE GODOT TEST PASS: 7 cenas e física do Player validadas.")
		quit(0)
	else:
		for e in errors:
			push_error(e)
		quit(1)
