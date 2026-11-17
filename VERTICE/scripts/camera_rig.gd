extends Camera2D
class_name CameraRig

@export var target_path: NodePath
@export var look_ahead_distance: float = 95.0
@export var smooth_speed: float = 5.2
@export var base_zoom: float = 1.06

var _target: Node2D
var _shake_strength: float = 0.0
var _target_zoom: float = 1.06
var _base_pos: Vector2 = Vector2(160.0, 340.0)
var _focus_timer: float = 0.0
var _focus_pos: Vector2 = Vector2.ZERO
var _focus_zoom: float = 1.06

func _ready() -> void:
	zoom = Vector2(base_zoom, base_zoom)
	if not target_path.is_empty():
		_target = get_node_or_null(target_path)
	ResonanceSystem.state_changed.connect(_on_state_changed)
	GameManager.area_changed.connect(_on_area_changed)
	GameManager.cinematic_focus_requested.connect(_on_cinematic_focus)

func _process(delta: float) -> void:
	if _target == null and _focus_timer <= 0.0:
		return

	var desired := _base_pos
	var desired_zoom := _target_zoom
	if _focus_timer > 0.0:
		_focus_timer = maxf(0.0, _focus_timer - delta)
		desired = _focus_pos
		desired_zoom = _focus_zoom
	elif _target != null:
		var vel_x := 0.0
		if _target is CharacterBody2D:
			vel_x = (_target as CharacterBody2D).velocity.x
		var ahead := clampf(vel_x * 0.26, -look_ahead_distance, look_ahead_distance)
		desired = Vector2(_target.global_position.x + ahead, _target.global_position.y - 38.0)

	_base_pos = _base_pos.lerp(desired, clampf(smooth_speed * delta, 0.0, 1.0))

	var z := lerpf(zoom.x, desired_zoom, 2.8 * delta)
	zoom = Vector2(z, z)

	if _shake_strength > 0.15:
		offset = Vector2(
			randf_range(-_shake_strength, _shake_strength),
			randf_range(-_shake_strength, _shake_strength)
		)
		_shake_strength = lerpf(_shake_strength, 0.0, 10.0 * delta)
	else:
		offset = Vector2.ZERO

	global_position = _base_pos

func add_shake(amount: float) -> void:
	_shake_strength = maxf(_shake_strength, amount)

func _on_cinematic_focus(world_pos: Vector2, target_z: float, duration: float, _use_letterbox: bool) -> void:
	_focus_pos = world_pos
	_focus_zoom = target_z
	_focus_timer = duration

func _on_state_changed(new_state: int, _prev: int) -> void:
	if new_state == ResonanceSystem.State.RUPTURA:
		add_shake(7.5)
	elif new_state == ResonanceSystem.State.ECO:
		add_shake(3.0)

func _on_area_changed(area_id: int, _title: String, _sub: String) -> void:
	# Enquadramento cinematográfico mais amplo em O Chamado (Área 5) e A Convergência (Área 10)
	_target_zoom = 0.84 if (area_id == 5 or area_id == 10) else base_zoom
