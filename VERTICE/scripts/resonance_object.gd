extends StaticBody2D
class_name ResonanceObject

enum Mode {
	ALWAYS_SOLID = 0,
	ECHO_ONLY = 1,
	PRESENT_ONLY = 2,
	RUPTURA_SHIFT = 3
}

@export var object_mode: Mode = Mode.ECHO_ONLY
@export var size: Vector2 = Vector2(220.0, 36.0)
@export var ruptura_offset: Vector2 = Vector2(0.0, -155.0)
@export var shift_speed: float = 5.2
@export var move_offset: Vector2 = Vector2.ZERO
@export var move_period: float = 0.0
@export var move_phase: float = 0.0
@export var use_wet_concrete: bool = false
@export var use_oxidized_metal: bool = false

var _origin_pos: Vector2
var _target_pos: Vector2
var _shader_mat: ShaderMaterial
var _visual_rect: TextureRect
var _elapsed: float = 0.0

@onready var collision_shape: CollisionShape2D = $CollisionShape2D

func _ready() -> void:
	add_to_group("resonance_objects")
	_origin_pos = position
	_target_pos = _origin_pos
	_setup_visual_2d()
	ResonanceSystem.state_changed.connect(_on_state_changed)
	_apply_state(ResonanceSystem.current_state)

func _setup_visual_2d() -> void:
	_visual_rect = TextureRect.new()
	_visual_rect.size = size
	_visual_rect.position = -size * 0.5
	_visual_rect.stretch_mode = TextureRect.STRETCH_TILE
	_visual_rect.texture_repeat = CanvasItem.TEXTURE_REPEAT_ENABLED
	if use_oxidized_metal:
		_visual_rect.texture = TextureFactory2D.tex_oxidized_metal
	elif use_wet_concrete:
		_visual_rect.texture = TextureFactory2D.tex_wet_concrete
	else:
		_visual_rect.texture = TextureFactory2D.tex_concrete

	if object_mode != Mode.ALWAYS_SOLID:
		_shader_mat = ShaderMaterial.new()
		_shader_mat.shader = load("res://shaders/resonance_shift.gdshader")
		_visual_rect.material = _shader_mat

	add_child(_visual_rect)
	queue_redraw()

func _draw() -> void:
	var half := size * 0.5
	if object_mode == Mode.ALWAYS_SOLID and size.x >= 140.0 and size.y < 180.0 and move_period <= 0.0:
		var sx := -half.x + 26.0
		while sx < half.x - 20.0:
			draw_rect(Rect2(sx, half.y, 12.0, 220.0), Color(0.035, 0.047, 0.068, 0.96))
			draw_rect(Rect2(sx, half.y, 2.0, 220.0), Color(0.35, 0.42, 0.52, 0.12))
			sx += 180.0
	if object_mode == Mode.ALWAYS_SOLID or object_mode == Mode.RUPTURA_SHIFT:
		draw_rect(Rect2(-half.x, half.y - 3.5, size.x, 3.5), Color(0.01, 0.015, 0.025, 0.58))
		var rim_col := Color(0.60, 0.72, 0.88, 0.34) if use_wet_concrete else (Color(0.72, 0.58, 0.45, 0.28) if use_oxidized_metal else Color(0.50, 0.56, 0.66, 0.22))
		draw_rect(Rect2(-half.x, -half.y, size.x, 2.5), rim_col)
		if move_period > 0.0:
			draw_rect(Rect2(-12.0, -2.0, 24.0, 4.0), Color(0.90, 0.60, 0.22, 0.55))

func _physics_process(delta: float) -> void:
	if delta <= 0.0:
		return
	var prev_pos := position
	if object_mode == Mode.RUPTURA_SHIFT:
		position = position.lerp(_target_pos, clampf(shift_speed * delta, 0.0, 1.0))
		constant_linear_velocity = (position - prev_pos) / delta
	elif move_period > 0.0 and (move_offset.x != 0.0 or move_offset.y != 0.0):
		_elapsed += delta
		var omega := TAU / move_period
		var frac := 0.5 - 0.5 * cos(_elapsed * omega + move_phase)
		position = _origin_pos + move_offset * frac
		constant_linear_velocity = (position - prev_pos) / delta

func would_block_rect_in_state(world_rect: Rect2, target_state: int) -> bool:
	var solid_in_target := false
	match object_mode:
		Mode.ALWAYS_SOLID, Mode.RUPTURA_SHIFT:
			solid_in_target = true
		Mode.ECHO_ONLY:
			solid_in_target = (target_state == ResonanceSystem.State.ECO)
		Mode.PRESENT_ONLY:
			solid_in_target = (target_state == ResonanceSystem.State.PRESENTE)
	if not solid_in_target:
		return false
	var my_rect := Rect2(global_position - size * 0.5, size)
	return my_rect.intersects(world_rect)

func _on_state_changed(new_state: int, _prev: int) -> void:
	_apply_state(new_state)

func _apply_state(state_id: int) -> void:
	match object_mode:
		Mode.ALWAYS_SOLID:
			_set_solid(true)
			if _visual_rect:
				_visual_rect.modulate = Color(1, 1, 1, 1)
		Mode.ECHO_ONLY:
			var is_echo := state_id == ResonanceSystem.State.ECO
			_set_solid(is_echo)
			if _shader_mat:
				_shader_mat.set_shader_parameter("resonance_state", 1 if is_echo else 0)
				_shader_mat.set_shader_parameter("transition_progress", 1.0 if is_echo else 0.18)
			if _visual_rect:
				_visual_rect.modulate = Color(1.0, 0.85, 0.62, 0.92 if is_echo else 0.16)
		Mode.PRESENT_ONLY:
			var is_pres := state_id == ResonanceSystem.State.PRESENTE
			_set_solid(is_pres)
			if _shader_mat:
				_shader_mat.set_shader_parameter("resonance_state", 0 if is_pres else 1)
				_shader_mat.set_shader_parameter("transition_progress", 1.0 if is_pres else 0.14)
			if _visual_rect:
				_visual_rect.modulate = Color(0.88, 0.91, 0.96, 1.0 if is_pres else 0.14)
		Mode.RUPTURA_SHIFT:
			_set_solid(true)
			var is_rup := state_id == ResonanceSystem.State.RUPTURA
			_target_pos = _origin_pos + ruptura_offset if is_rup else _origin_pos
			if _shader_mat:
				_shader_mat.set_shader_parameter("resonance_state", 2 if is_rup else 0)
			if _visual_rect:
				_visual_rect.modulate = Color(1.0, 0.72, 0.42, 1.0) if is_rup else Color(0.92, 0.94, 0.98, 1.0)

func _set_solid(enabled: bool) -> void:
	if collision_shape:
		collision_shape.set_deferred("disabled", not enabled)
