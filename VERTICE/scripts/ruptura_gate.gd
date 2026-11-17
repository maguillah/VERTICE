extends StaticBody2D
class_name RupturaGate

@export var open_offset: Vector2 = Vector2(0.0, -175.0)
@export var open_in_ruptura: bool = true
@export var requires_frequency_switch: bool = false
@export var permanent_when_puzzle_solved: bool = true

var _closed_pos: Vector2
var _is_open: bool = false

@onready var collision_shape: CollisionShape2D = $CollisionShape2D

func _ready() -> void:
	add_to_group("ruptura_gates")
	_closed_pos = position
	ResonanceSystem.state_changed.connect(_on_state_changed)
	ResonanceSystem.puzzle_node_updated.connect(_on_puzzle_updated)
	ResonanceSystem.frequency_switch_changed.connect(_on_frequency_changed)
	_evaluate_open(ResonanceSystem.current_state)
	if _is_open:
		position = _closed_pos + open_offset

func _process(delta: float) -> void:
	var target := _closed_pos + open_offset if _is_open else _closed_pos
	position = position.lerp(target, clampf(5.5 * delta, 0.0, 1.0))
	queue_redraw()

func _draw() -> void:
	# Engrenagem mecânica centrada no portão (-90px) e nervuras blindadas horizontais
	var angle := (position.y - _closed_pos.y) * 0.04
	var gear_col := Color(0.49, 0.86, 0.66, 0.72) if _is_open else Color(0.90, 0.60, 0.22, 0.72)
	var center := Vector2(0.0, -90.0)
	draw_circle(center, 10.5, Color(0.08, 0.10, 0.13, 0.92))
	draw_arc(center, 10.5, 0.0, TAU, 16, gear_col, 2.0)
	for i in range(4):
		var a := angle + float(i) * PI * 0.5
		var dir := Vector2(cos(a), sin(a)) * 12.5
		draw_line(center - dir, center + dir, Color(0.14, 0.18, 0.24, 0.95), 3.0)
	for ry in [-152.0, -120.0, -60.0, -28.0]:
		draw_line(Vector2(-17.0, ry), Vector2(17.0, ry), Color(0.03, 0.04, 0.06, 0.75), 3.0)

func _evaluate_open(state_id: int) -> void:
	if permanent_when_puzzle_solved and ResonanceSystem.puzzle_bridge_locked:
		_is_open = true
	elif requires_frequency_switch:
		_is_open = ResonanceSystem.frequency_switch_active and (state_id == ResonanceSystem.State.RUPTURA or not open_in_ruptura)
	elif open_in_ruptura:
		_is_open = (state_id == ResonanceSystem.State.RUPTURA)
	else:
		_is_open = false
	if collision_shape:
		collision_shape.set_deferred("disabled", _is_open)

func _on_state_changed(new_state: int, _prev: int) -> void:
	_evaluate_open(new_state)

func _on_frequency_changed(_active: bool) -> void:
	_evaluate_open(ResonanceSystem.current_state)

func _on_puzzle_updated(count: int, total: int) -> void:
	if permanent_when_puzzle_solved and count >= total:
		_is_open = true
		if collision_shape:
			collision_shape.set_deferred("disabled", true)

func would_block_rect_in_state(world_rect: Rect2, target_state: int) -> bool:
	var will_open := false
	if permanent_when_puzzle_solved and ResonanceSystem.puzzle_bridge_locked:
		will_open = true
	elif requires_frequency_switch:
		will_open = ResonanceSystem.frequency_switch_active and (target_state == ResonanceSystem.State.RUPTURA or not open_in_ruptura)
	elif open_in_ruptura:
		will_open = (target_state == ResonanceSystem.State.RUPTURA)
	if will_open:
		return false
	var my_rect := Rect2(global_position + Vector2(-19.0, -180.0), Vector2(38.0, 180.0))
	return my_rect.intersects(world_rect)

