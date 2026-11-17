extends Node

var ambient_player: AudioStreamPlayer
var sfx_player: AudioStreamPlayer

var master_volume: float = 0.85
var is_muted: bool = false

var _sounds: Dictionary = {}

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	ambient_player = AudioStreamPlayer.new()
	sfx_player = AudioStreamPlayer.new()
	add_child(ambient_player)
	add_child(sfx_player)

	_load_streams()
	master_volume = float(SaveManager.data.get("master_volume", 0.85))
	is_muted = bool(SaveManager.data.get("muted", false))
	apply_volume()

	if _sounds.has("ambient"):
		ambient_player.stream = _sounds["ambient"]
		ambient_player.play()

func _load_streams() -> void:
	var paths := {
		"ambient": "res://audio/ambient_drone.wav",
		"jump": "res://audio/sfx_jump.wav",
		"land": "res://audio/sfx_land.wav",
		"echo": "res://audio/sfx_echo.wav",
		"ruptura": "res://audio/sfx_ruptura.wav",
		"presente": "res://audio/sfx_presente.wav",
		"checkpoint": "res://audio/sfx_checkpoint.wav"
	}
	for key in paths.keys():
		if ResourceLoader.exists(paths[key]):
			_sounds[key] = load(paths[key])

func apply_volume() -> void:
	var linear := 0.0 if is_muted else master_volume
	var db := linear_to_db(maxf(0.0001, linear))
	ambient_player.volume_db = db - 6.0
	sfx_player.volume_db = db

func set_master_volume(val: float) -> void:
	master_volume = clampf(val, 0.0, 1.0)
	apply_volume()

func set_muted(muted: bool) -> void:
	is_muted = muted
	apply_volume()

func set_chapter_mood(chapter_num: int) -> void:
	if ambient_player:
		var pitches := {1: 1.0, 2: 0.94, 3: 0.9, 4: 0.86, 5: 1.04, 6: 1.12}
		ambient_player.pitch_scale = float(pitches.get(chapter_num, 1.0))

func play_sfx(sound_name: String, pitch: float = 1.0) -> void:
	if is_muted or not _sounds.has(sound_name):
		return
	sfx_player.stream = _sounds[sound_name]
	sfx_player.pitch_scale = pitch
	sfx_player.play()

func play_spatial_sfx(sound_name: String, world_pos: Vector2, pitch: float = 1.0) -> void:
	if is_muted or not _sounds.has(sound_name):
		return
	var p := AudioStreamPlayer2D.new()
	p.stream = _sounds[sound_name]
	p.pitch_scale = pitch
	p.volume_db = linear_to_db(maxf(0.0001, master_volume))
	p.max_distance = 1200.0
	p.global_position = world_pos
	var root := get_tree().current_scene
	if root:
		root.add_child(p)
		p.finished.connect(p.queue_free)
		p.play()

func play_resonance_transition(state_id: int) -> void:
	match state_id:
		0:
			play_sfx("presente", 1.0)
		1:
			play_sfx("echo", 1.0)
		2:
			play_sfx("ruptura", 0.96)
