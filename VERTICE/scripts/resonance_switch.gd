extends Area2D
class_name ResonanceSwitch

enum SwitchType { UNLOCK_ECO, UNLOCK_RUPTURA, PUZZLE_ANCHOR, FREQUENCY_SWITCH, CHAPTER_THRESHOLD }

@export var switch_type: SwitchType = SwitchType.PUZZLE_ANCHOR
@export var anchor_id: String = "anchor_1"

var _activated: bool = false
var _t: float = 0.0

@onready var shard_poly: Polygon2D = $ShardPoly
@onready var node_light: PointLight2D = $NodeLight

func _ready() -> void:
	body_entered.connect(_on_body_entered)
	body_exited.connect(_on_body_exited)
	_restore_activated_state()

func _process(delta: float) -> void:
	_t += delta
	if shard_poly:
		shard_poly.position.y = -44.0 + sin(_t * 2.8) * 3.5
	queue_redraw()

func _draw() -> void:
	var cy := -44.0 + sin(_t * 2.8) * 3.5
	var col := Color(0.49, 0.88, 0.66, 0.55) if _activated else Color(0.96, 0.66, 0.26, 0.52)
	var ang := _t * (0.65 if _activated else 1.15)
	draw_arc(Vector2(0.0, cy), 17.0, ang, ang + PI * 1.25, 16, col, 1.4)
	draw_arc(Vector2(0.0, cy), 17.0, ang + PI * 1.45, ang + PI * 1.9, 8, col, 1.4)

func _restore_activated_state() -> void:
	match switch_type:
		SwitchType.UNLOCK_ECO:
			_activated = ResonanceSystem.unlocked_echo
		SwitchType.UNLOCK_RUPTURA:
			_activated = ResonanceSystem.unlocked_ruptura
		SwitchType.PUZZLE_ANCHOR:
			_activated = ResonanceSystem.is_anchor_active(anchor_id)
		SwitchType.FREQUENCY_SWITCH:
			_activated = ResonanceSystem.frequency_switch_active
		SwitchType.CHAPTER_THRESHOLD:
			_activated = false
	_update_visual()

func _update_visual() -> void:
	if shard_poly:
		shard_poly.color = Color(0.49, 0.88, 0.66, 1.0) if _activated else Color(0.96, 0.66, 0.26, 1.0)
	if node_light:
		node_light.color = Color(0.49, 0.88, 0.66, 1.0) if _activated else Color(0.96, 0.64, 0.24, 1.0)
		node_light.energy = 1.1 if _activated else 1.5

func _on_body_entered(body: Node) -> void:
	if body is PlayerController:
		(body as PlayerController).set_nearby_interactable(self)

func _on_body_exited(body: Node) -> void:
	if body is PlayerController:
		(body as PlayerController).set_nearby_interactable(null)

func interact(_player: PlayerController) -> void:
	if _activated and switch_type != SwitchType.CHAPTER_THRESHOLD:
		return
	_activated = true
	_update_visual()
	AudioManager.play_sfx("checkpoint", 1.1)

	match switch_type:
		SwitchType.UNLOCK_ECO:
			ResonanceSystem.unlock_state(ResonanceSystem.State.ECO)
			ResonanceSystem.set_state(ResonanceSystem.State.ECO)
			GameManager.request_cinematic_focus(global_position + Vector2(0, -36), 1.18, 1.15, false)
		SwitchType.UNLOCK_RUPTURA:
			ResonanceSystem.unlock_state(ResonanceSystem.State.RUPTURA)
			ResonanceSystem.set_state(ResonanceSystem.State.RUPTURA)
			GameManager.request_cinematic_focus(global_position + Vector2(0, -36), 1.18, 1.15, false)
		SwitchType.PUZZLE_ANCHOR:
			ResonanceSystem.register_puzzle_anchor(anchor_id, true)
			if ResonanceSystem.puzzle_bridge_locked:
				for gate in get_tree().get_nodes_in_group("ruptura_gates"):
					if gate is RupturaGate and (gate as RupturaGate).permanent_when_puzzle_solved:
						GameManager.request_cinematic_focus(gate.global_position + Vector2(0, -85), 1.02, 1.45, true)
						break
		SwitchType.FREQUENCY_SWITCH:
			ResonanceSystem.set_frequency_switch(true)
		SwitchType.CHAPTER_THRESHOLD:
			GameManager.request_cinematic_focus(global_position + Vector2(70, -85), 0.92, 1.5, true)
			await get_tree().create_timer(1.3).timeout
			if is_inside_tree():
				GameManager.complete_chapter()
