extends Node

signal state_changed(new_state: int, previous_state: int)
signal state_unlocked(state_id: int)
signal state_rejected
signal resonance_rejected
signal ruptura_energy_changed(ratio: float)
signal puzzle_node_updated(activated_count: int, total_required: int)
signal frequency_switch_changed(active: bool)

enum State { PRESENTE = 0, ECO = 1, RUPTURA = 2 }

var current_state: int = State.PRESENTE
var unlocked_echo: bool = false
var unlocked_ruptura: bool = false

var ruptura_energy: float = 1.0
@export var ruptura_drain_per_sec: float = 0.14
@export var ruptura_recharge_per_sec: float = 0.28

var puzzle_anchors: Dictionary = {}
var puzzle_bridge_locked: bool = false
var frequency_switch_active: bool = false

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_PAUSABLE

func _process(delta: float) -> void:
	if current_state == State.RUPTURA:
		ruptura_energy = maxf(0.0, ruptura_energy - ruptura_drain_per_sec * delta)
		emit_signal("ruptura_energy_changed", ruptura_energy)
		if ruptura_energy <= 0.0:
			if not set_state(State.PRESENTE, true, false):
				set_state(State.ECO if unlocked_echo else State.PRESENTE, true, true)
	elif ruptura_energy < 1.0:
		ruptura_energy = minf(1.0, ruptura_energy + ruptura_recharge_per_sec * delta)
		emit_signal("ruptura_energy_changed", ruptura_energy)

func _get_player_rect() -> Rect2:
	var players := get_tree().get_nodes_in_group("player")
	if players.is_empty():
		return Rect2()
	var p := players[0]
	if p is Node2D:
		var pos := (p as Node2D).global_position
		return Rect2(pos.x - 8.0, pos.y - 48.0, 16.0, 44.0)
	return Rect2()

func would_overlap_player(target_state: int) -> bool:
	var p_rect := _get_player_rect()
	if p_rect.size == Vector2.ZERO:
		return false
	for obj in get_tree().get_nodes_in_group("resonance_objects"):
		if obj and obj.has_method("would_block_rect_in_state"):
			if obj.would_block_rect_in_state(p_rect, target_state):
				return true
	for gate in get_tree().get_nodes_in_group("ruptura_gates"):
		if gate and gate.has_method("would_block_rect_in_state"):
			if gate.would_block_rect_in_state(p_rect, target_state):
				return true
	return false

func set_state(target_state: int, save_change: bool = true, force: bool = false) -> bool:
	if target_state == current_state:
		return true
	if target_state == State.ECO and not unlocked_echo:
		return false
	if target_state == State.RUPTURA and (not unlocked_ruptura or ruptura_energy < 0.15):
		return false
	if not force and would_overlap_player(target_state):
		emit_signal("state_rejected")
		emit_signal("resonance_rejected")
		AudioManager.play_sfx("ruptura", 0.58)
		return false
	var prev := current_state
	current_state = target_state
	emit_signal("state_changed", current_state, prev)
	AudioManager.play_resonance_transition(current_state)
	if save_change and SaveManager.has_saved_game():
		SaveManager.save_progress()
	return true

func unlock_state(target_state: int) -> void:
	if target_state == State.ECO and not unlocked_echo:
		unlocked_echo = true
		emit_signal("state_unlocked", State.ECO)
		SaveManager.save_progress()
	elif target_state == State.RUPTURA and not unlocked_ruptura:
		unlocked_ruptura = true
		emit_signal("state_unlocked", State.RUPTURA)
		SaveManager.save_progress()

func set_frequency_switch(active: bool, persist: bool = true) -> void:
	frequency_switch_active = active
	emit_signal("frequency_switch_changed", active)
	if persist:
		SaveManager.save_progress()

func get_required_anchors() -> int:
	return 2 if GameManager.current_chapter == 1 else 3

func register_puzzle_anchor(anchor_id: String, active: bool, persist: bool = true) -> void:
	puzzle_anchors[anchor_id] = active
	var required := get_required_anchors()
	var count := 0
	for key in puzzle_anchors.keys():
		if puzzle_anchors[key]:
			count += 1
	puzzle_bridge_locked = count >= required
	emit_signal("puzzle_node_updated", count, required)
	if persist:
		SaveManager.save_progress()

func is_anchor_active(anchor_id: String) -> bool:
	return bool(puzzle_anchors.get(anchor_id, false))

func prepare_chapter(chapter_num: int) -> void:
	unlocked_echo = chapter_num >= 2
	unlocked_ruptura = chapter_num >= 2
	current_state = State.PRESENTE
	ruptura_energy = 1.0
	puzzle_anchors.clear()
	puzzle_bridge_locked = false
	frequency_switch_active = false
	emit_signal("state_unlocked", State.ECO if unlocked_echo else -1)
	if unlocked_ruptura:
		emit_signal("state_unlocked", State.RUPTURA)
	emit_signal("frequency_switch_changed", false)
	emit_signal("puzzle_node_updated", 0, get_required_anchors())
	emit_signal("ruptura_energy_changed", 1.0)
	emit_signal("state_changed", current_state, current_state)

func prepare_chapter_2() -> void:
	prepare_chapter(2)

func restore_from_save(saved: Dictionary) -> void:
	unlocked_echo = bool(saved.get("unlocked_echo", false))
	unlocked_ruptura = bool(saved.get("unlocked_ruptura", false))
	ruptura_energy = clampf(float(saved.get("ruptura_energy", 1.0)), 0.0, 1.0)
	frequency_switch_active = bool(saved.get("frequency_switch_active", false))

	var required := get_required_anchors()
	puzzle_anchors.clear()
	var anchors = saved.get("puzzle_anchors", [])
	var count := 0
	if typeof(anchors) == TYPE_ARRAY:
		for a in anchors:
			var aid := str(a)
			puzzle_anchors[aid] = true
			count += 1
	puzzle_bridge_locked = bool(saved.get("puzzle_bridge_locked", false)) or count >= required

	var saved_state := int(saved.get("resonance_state", State.PRESENTE))
	if saved_state == State.ECO and not unlocked_echo:
		saved_state = State.PRESENTE
	elif saved_state == State.RUPTURA and (not unlocked_ruptura or ruptura_energy < 0.15):
		saved_state = State.PRESENTE

	var prev := current_state
	current_state = saved_state
	emit_signal("state_unlocked", State.ECO if unlocked_echo else -1)
	emit_signal("frequency_switch_changed", frequency_switch_active)
	emit_signal("puzzle_node_updated", count, required)
	emit_signal("ruptura_energy_changed", ruptura_energy)
	emit_signal("state_changed", current_state, prev)

func reset_states() -> void:
	current_state = State.PRESENTE
	unlocked_echo = false
	unlocked_ruptura = false
	ruptura_energy = 1.0
	puzzle_anchors.clear()
	puzzle_bridge_locked = false
	frequency_switch_active = false
	emit_signal("state_changed", current_state, current_state)
	emit_signal("ruptura_energy_changed", ruptura_energy)
	emit_signal("frequency_switch_changed", false)
	emit_signal("puzzle_node_updated", 0, get_required_anchors())
