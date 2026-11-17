extends CharacterBody2D
class_name PlayerController

@export var walk_speed: float = 225.0
@export var run_speed: float = 345.0
@export var crouch_speed: float = 115.0
@export var acceleration: float = 2100.0
@export var friction: float = 4200.0
@export var air_friction: float = 850.0
@export var jump_velocity: float = -560.0
@export var gravity_scale: float = 1350.0
@export var coyote_time_max: float = 0.11
@export var jump_buffer_max: float = 0.12

var _coyote_timer: float = 0.0
var _jump_buffer_timer: float = 0.0
var _was_on_floor: bool = true
var _prev_vy: float = 0.0
var _facing: float = 1.0
var _nearby_interactable: Node = null
var _dust_particles: CPUParticles2D
var _is_crouching: bool = false
var _is_climbing: bool = false
var _is_pushing: bool = false
var _dying_timer: float = 0.0
var _recover_timer: float = 0.0
var _active_climb_zone: Node2D = null

@onready var visuals: PlayerVisuals = $Visuals

func _ready() -> void:
	add_to_group("player")
	global_position = GameManager.active_checkpoint_pos
	ResonanceSystem.state_changed.connect(_on_resonance_changed)
	ResonanceSystem.resonance_rejected.connect(_on_resonance_rejected)
	_setup_footstep_particles()
	if visuals and (not SaveManager.has_saved_game() or GameManager.just_started_chapter):
		GameManager.just_started_chapter = false
		visuals.start_awaken()
		GameManager.request_cinematic_focus(global_position + Vector2(24, -26), 1.22, 1.55, true)

func _setup_footstep_particles() -> void:
	_dust_particles = CPUParticles2D.new()
	_dust_particles.emitting = false
	_dust_particles.one_shot = true
	_dust_particles.explosiveness = 0.9
	_dust_particles.amount = 8
	_dust_particles.lifetime = 0.36
	_dust_particles.direction = Vector2(0.0, -1.0)
	_dust_particles.spread = 65.0
	_dust_particles.initial_velocity_min = 24.0
	_dust_particles.initial_velocity_max = 64.0
	_dust_particles.gravity = Vector2(0.0, 90.0)
	_dust_particles.scale_amount_min = 1.6
	_dust_particles.scale_amount_max = 2.8
	_dust_particles.color = Color(0.68, 0.74, 0.84, 0.45)
	_dust_particles.position = Vector2(0.0, -2.0)
	add_child(_dust_particles)

func _emit_step_dust(bias: float = 0.0) -> void:
	if _dust_particles and GameManager.current_quality != GameManager.QualityLevel.LOW:
		_dust_particles.direction = Vector2(bias * 0.65, -1.0).normalized()
		_dust_particles.restart()
		_dust_particles.emitting = true

func is_crouching() -> bool:
	return _is_crouching

func is_climbing() -> bool:
	return _is_climbing

func is_recovering() -> bool:
	return _recover_timer > 0.0 or _dying_timer > 0.0

func set_climb_zone(zone: Node2D, inside: bool) -> void:
	if inside:
		_active_climb_zone = zone
	elif _active_climb_zone == zone:
		_active_climb_zone = null
		_is_climbing = false

func trigger_death_recover() -> void:
	if _dying_timer > 0.0:
		return
	_dying_timer = 0.8
	_is_climbing = false
	_is_crouching = false
	velocity = Vector2.ZERO
	AudioManager.play_sfx("ruptura", 0.72)
	if visuals:
		visuals.start_dying()

func _finish_death_respawn() -> void:
	velocity = Vector2.ZERO
	global_position = GameManager.active_checkpoint_pos
	_recover_timer = 0.65
	_is_climbing = false
	_is_crouching = false
	ResonanceSystem.set_state(ResonanceSystem.State.PRESENTE, true, true)
	if visuals:
		visuals.end_dying()

func _physics_process(delta: float) -> void:
	_recover_timer = maxf(0.0, _recover_timer - delta)
	if _dying_timer > 0.0:
		_dying_timer = maxf(0.0, _dying_timer - delta)
		if visuals:
			visuals.update_motion(Vector2.ZERO, false, _facing, false, false, false, false, delta)
		if _dying_timer <= 0.0:
			_finish_death_respawn()
		return

	var prev_vy := velocity.y
	var awaken_locked := visuals != null and visuals.is_awakening()
	var axis := 0.0 if awaken_locked else Input.get_axis("move_left", "move_right")
	var down_held := not awaken_locked and (Input.is_action_pressed("crouch") or Input.is_action_pressed("climb_down"))
	var up_held := not awaken_locked and Input.is_action_pressed("climb_up")
	var v_axis := (1.0 if down_held else 0.0) - (1.0 if up_held else 0.0)
	var is_running := Input.is_action_pressed("run")

	if _active_climb_zone != null and not awaken_locked and absf(v_axis) > 0.1 and not _is_climbing:
		_is_climbing = true
		_is_crouching = false
		velocity = Vector2.ZERO

	_is_pushing = false

	if _is_climbing and _active_climb_zone != null:
		velocity.x = axis * 120.0
		velocity.y = v_axis * 155.0
		global_position.x = lerpf(global_position.x, _active_climb_zone.global_position.x, clampf(8.0 * delta, 0.0, 1.0))
		if absf(axis) > 0.05:
			_facing = signf(axis)
		if Input.is_action_just_pressed("jump"):
			_is_climbing = false
			velocity.y = -520.0
			AudioManager.play_sfx("jump", randf_range(0.95, 1.05))
		move_and_slide()
		if visuals:
			visuals.update_motion(velocity, false, _facing, false, false, true, false, delta)
		return

	# Gravidade 2D e estabilização de pouso sem deslizamento
	if not is_on_floor():
		velocity.y = minf(920.0, velocity.y + gravity_scale * delta)
		_coyote_timer = maxf(0.0, _coyote_timer - delta)
	else:
		_coyote_timer = coyote_time_max
		if not _was_on_floor:
			# Corta inércia horizontal residual no toque se nenhuma direção estiver pressionada
			if absf(axis) <= 0.05:
				velocity.x *= 0.2
				if absf(velocity.x) < 20.0:
					velocity.x = 0.0
			if _prev_vy >= 160.0:
				var heavy := _prev_vy > 620.0
				AudioManager.play_sfx("land", randf_range(0.88, 1.06))
				if visuals:
					visuals.trigger_land_squash(heavy)
				_emit_step_dust()

	_was_on_floor = is_on_floor()
	_prev_vy = prev_vy

	_is_crouching = not awaken_locked and is_on_floor() and down_held
	var sens := float(SaveManager.data.get("touch_sensitivity", 1.0))
	var max_spd := crouch_speed if _is_crouching else (run_speed if is_running else walk_speed)
	var target_speed := axis * max_spd
	var accel := (acceleration if is_on_floor() else 1400.0) * clampf(sens, 0.75, 1.4)
	var fric := friction if is_on_floor() else air_friction

	if absf(axis) > 0.05:
		if is_on_floor() and absf(velocity.x) > 155.0 and signf(velocity.x) != signf(axis):
			if visuals:
				visuals.trigger_turn_skid()
			_emit_step_dust(-signf(axis))
		_facing = signf(axis)
		velocity.x = move_toward(velocity.x, target_speed, accel * delta)
	else:
		velocity.x = move_toward(velocity.x, 0.0, fric * delta)
		if is_on_floor() and absf(velocity.x) < 20.0:
			velocity.x = 0.0

	if not awaken_locked and Input.is_action_just_pressed("jump"):
		_jump_buffer_timer = jump_buffer_max
	else:
		_jump_buffer_timer = maxf(0.0, _jump_buffer_timer - delta)

	if _jump_buffer_timer > 0.0 and _coyote_timer > 0.0:
		velocity.y = jump_velocity
		_jump_buffer_timer = 0.0
		_coyote_timer = 0.0
		_is_crouching = false
		AudioManager.play_sfx("jump", randf_range(0.95, 1.05))
		_emit_step_dust()
		if visuals:
			visuals.trigger_jump_stretch()

	if Input.is_action_just_released("jump") and velocity.y < -180.0:
		velocity.y *= 0.56

	if Input.is_action_just_pressed("state_present"):
		ResonanceSystem.set_state(ResonanceSystem.State.PRESENTE)
	elif Input.is_action_just_pressed("state_echo"):
		ResonanceSystem.set_state(ResonanceSystem.State.ECO)
	elif Input.is_action_just_pressed("state_ruptura"):
		ResonanceSystem.set_state(ResonanceSystem.State.RUPTURA)

	if Input.is_action_just_pressed("interact") and _nearby_interactable != null:
		if visuals:
			visuals.trigger_interact()
		if _nearby_interactable.has_method("interact"):
			_nearby_interactable.interact(self)

	move_and_slide()

	# Empurrar PushBlocks 2D sem empurrões instáveis
	for i in range(get_slide_collision_count()):
		var col := get_slide_collision(i)
		var collider := col.get_collider()
		if collider and collider.has_method("apply_push") and absf(col.get_normal().x) > 0.7 and absf(axis) > 0.05:
			collider.apply_push(axis * 105.0)
			_is_pushing = true

	if visuals:
		visuals.update_motion(velocity, is_on_floor(), _facing, is_running and not _is_crouching, _is_crouching, false, _is_pushing, delta)

	if global_position.y > 920.0:
		trigger_death_recover()

func _on_resonance_changed(_new_state: int, _prev: int) -> void:
	if visuals:
		visuals.trigger_resonance_flare()

func _on_resonance_rejected() -> void:
	if visuals:
		visuals.trigger_resonance_reject()

func respawn_at_checkpoint() -> void:
	_finish_death_respawn()

func set_nearby_interactable(node: Node) -> void:
	_nearby_interactable = node
