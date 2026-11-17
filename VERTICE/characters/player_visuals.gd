extends Node2D
class_name PlayerVisuals

# Protagonista humano adulto em 2D articulado: cinemática inversa, capa de 7 nós, agachar, escalar, empurrar e dissolução
var _time: float = 0.0
var _walk_cycle: float = 0.0
var _squash: Vector2 = Vector2.ONE
var _facing: float = 1.0
var _flare_timer: float = 0.0
var _reject_timer: float = 0.0
var _interact_timer: float = 0.0
var _land_crouch: float = 0.0
var _awaken_progress: float = 1.0
var _dying_progress: float = 0.0
var _is_dying: bool = false
var _cloak_nodes: Array[Vector2] = []

var _torso_poly: Polygon2D
var _collar_poly: Polygon2D
var _head_poly: Polygon2D
var _cloak_poly: Polygon2D
var _leg_l: Line2D
var _leg_r: Line2D
var _arm_l: Line2D
var _arm_r: Line2D
var _core_sprite: Sprite2D
var _core_light: PointLight2D
var _core_ring: Line2D

func _ready() -> void:
	for i in range(7):
		_cloak_nodes.append(Vector2(-float(i) * 3.2, -34.0 + float(i) * 3.8))
	_build_articulated_2d_body()

func _build_articulated_2d_body() -> void:
	_cloak_poly = Polygon2D.new()
	_cloak_poly.color = Color(0.05, 0.06, 0.078, 0.96)
	add_child(_cloak_poly)

	_leg_l = Line2D.new()
	_leg_l.width = 4.2
	_leg_l.default_color = Color(0.04, 0.048, 0.062, 1.0)
	_leg_l.joint_mode = Line2D.LINE_JOINT_ROUND
	_leg_l.begin_cap_mode = Line2D.LINE_CAP_ROUND
	_leg_l.end_cap_mode = Line2D.LINE_CAP_ROUND
	add_child(_leg_l)

	_leg_r = Line2D.new()
	_leg_r.width = 4.4
	_leg_r.default_color = Color(0.065, 0.075, 0.095, 1.0)
	_leg_r.joint_mode = Line2D.LINE_JOINT_ROUND
	_leg_r.begin_cap_mode = Line2D.LINE_CAP_ROUND
	_leg_r.end_cap_mode = Line2D.LINE_CAP_ROUND
	add_child(_leg_r)

	_arm_l = Line2D.new()
	_arm_l.width = 3.2
	_arm_l.default_color = Color(0.045, 0.052, 0.068, 1.0)
	_arm_l.joint_mode = Line2D.LINE_JOINT_ROUND
	_arm_l.begin_cap_mode = Line2D.LINE_CAP_ROUND
	_arm_l.end_cap_mode = Line2D.LINE_CAP_ROUND
	add_child(_arm_l)

	_torso_poly = Polygon2D.new()
	_torso_poly.color = Color(0.085, 0.096, 0.12, 1.0)
	_torso_poly.polygon = PackedVector2Array([
		Vector2(-5.8, -39), Vector2(5.8, -39),
		Vector2(4.4, -20), Vector2(-4.4, -20)
	])
	add_child(_torso_poly)

	_collar_poly = Polygon2D.new()
	_collar_poly.color = Color(0.11, 0.125, 0.155, 1.0)
	_collar_poly.polygon = PackedVector2Array([
		Vector2(-5.5, -41), Vector2(4.2, -41),
		Vector2(4.2, -38), Vector2(-5.5, -38)
	])
	add_child(_collar_poly)

	_head_poly = Polygon2D.new()
	_head_poly.color = Color(0.11, 0.12, 0.145, 1.0)
	var head_pts := PackedVector2Array()
	for i in range(10):
		var a := float(i) * TAU / 10.0
		head_pts.append(Vector2(cos(a) * 4.8, -46.5 + sin(a) * 5.6))
	_head_poly.polygon = head_pts
	add_child(_head_poly)

	_arm_r = Line2D.new()
	_arm_r.width = 3.4
	_arm_r.default_color = Color(0.095, 0.105, 0.13, 1.0)
	_arm_r.joint_mode = Line2D.LINE_JOINT_ROUND
	_arm_r.begin_cap_mode = Line2D.LINE_CAP_ROUND
	_arm_r.end_cap_mode = Line2D.LINE_CAP_ROUND
	add_child(_arm_r)

	_core_ring = Line2D.new()
	_core_ring.width = 1.8
	_core_ring.default_color = Color(1.0, 0.7, 0.3, 0.0)
	_core_ring.begin_cap_mode = Line2D.LINE_CAP_ROUND
	_core_ring.end_cap_mode = Line2D.LINE_CAP_ROUND
	var ring_points := PackedVector2Array()
	for i in range(33):
		var angle := TAU * float(i) / 32.0
		ring_points.append(Vector2(cos(angle), sin(angle)))
	_core_ring.points = ring_points
	_core_ring.visible = false
	add_child(_core_ring)
	_core_sprite = Sprite2D.new()
	_core_sprite.texture = TextureFactory2D.tex_core_glow
	_core_sprite.position = Vector2(2.4, -32.0)
	_core_sprite.scale = Vector2(0.38, 0.38)
	add_child(_core_sprite)

	_core_light = PointLight2D.new()
	_core_light.texture = TextureFactory2D.tex_core_glow
	_core_light.position = Vector2(2.4, -32.0)
	_core_light.color = Color(0.95, 0.64, 0.24, 1.0)
	_core_light.energy = 1.15
	_core_light.texture_scale = 3.6
	add_child(_core_light)

func _solve_ik(origin: Vector2, target: Vector2, l1: float, l2: float, bend_sign: float) -> Vector2:
	var delta := target - origin
	var max_reach := l1 + l2 - 0.35
	var min_reach := absf(l1 - l2) + 0.35
	var dist := clampf(delta.length(), min_reach, max_reach)
	var cos_a := clampf((l1 * l1 + dist * dist - l2 * l2) / (2.0 * l1 * dist), -1.0, 1.0)
	var base_ang := delta.angle()
	var joint_ang := base_ang + bend_sign * acos(cos_a)
	return origin + Vector2(cos(joint_ang), sin(joint_ang)) * l1

func update_motion(
	velocity: Vector2,
	on_floor: bool,
	facing: float,
	is_running: bool,
	is_crouching: bool = false,
	is_climbing: bool = false,
	is_pushing: bool = false,
	delta: float = 0.016,
	is_sliding: bool = false
) -> void:
	_time += delta
	_facing = facing
	_flare_timer = maxf(0.0, _flare_timer - delta * 2.2)
	_reject_timer = maxf(0.0, _reject_timer - delta)
	_interact_timer = maxf(0.0, _interact_timer - delta * 3.0)
	_land_crouch = maxf(0.0, _land_crouch - delta * 5.2)
	if _awaken_progress < 1.0:
		_awaken_progress = minf(1.0, _awaken_progress + delta * 0.62)
	if _is_dying:
		_dying_progress = minf(1.0, _dying_progress + delta * 1.25)
	else:
		_dying_progress = maxf(0.0, _dying_progress - delta * 3.0)
	modulate.a = clampf(1.0 - _dying_progress * 0.85, 0.15, 1.0)
	_squash = _squash.lerp(Vector2.ONE, clampf(14.0 * delta, 0.0, 1.0))

	var speed := absf(velocity.x)
	var speed_ratio := clampf(speed / 345.0, 0.0, 1.0)
	if is_climbing and absf(velocity.y) > 10.0:
		_walk_cycle += delta * 7.2
	elif on_floor and speed > 15.0:
		_walk_cycle += delta * (9.5 if is_running else 6.4) * (0.4 + speed_ratio * 0.8)

	var base_lean := 0.0 if is_climbing else ((0.1 if is_running else (0.16 if is_pushing else 0.05)) * speed_ratio if on_floor else clampf(velocity.y * 0.00025, -0.15, 0.15))
	var awaken_lean := (1.0 - _awaken_progress) * 0.28
	scale = Vector2(_facing * _squash.x, _squash.y)
	rotation = lerpf(rotation, (base_lean + awaken_lean) * _facing, 12.0 * delta)

	var breathe := sin(_time * 2.2) * 1.1 if speed < 15.0 else absf(sin(_walk_cycle * 2.0)) * 1.6
	var crouch_drop := (16.0 if is_sliding else (11.5 if is_crouching else 0.0)) + _land_crouch * 6.5 + (1.0 - _awaken_progress) * 14.5
	var hip_y := -21.5 + crouch_drop + breathe * 0.35
	var sh_y := -39.0 + crouch_drop * 0.92 + breathe * 0.55

	var stride := sin(_walk_cycle) * (10.5 if is_running else 7.2) * speed_ratio
	var lift_l := maxf(0.0, cos(_walk_cycle)) * (6.2 if is_running else 4.2) * speed_ratio
	var lift_r := maxf(0.0, -cos(_walk_cycle)) * (6.2 if is_running else 4.2) * speed_ratio

	if _awaken_progress < 0.96:
		var hip_l := Vector2(-2.0, hip_y)
		var foot_l := Vector2(-9.0, -1.0)
		_leg_l.points = PackedVector2Array([hip_l, _solve_ik(hip_l, foot_l, 11.5, 11.5, 1.0), foot_l, foot_l + Vector2(3.5, 0.2)])
		var hip_r := Vector2(2.0, hip_y)
		var foot_r := Vector2(7.0, 0.0)
		_leg_r.points = PackedVector2Array([hip_r, _solve_ik(hip_r, foot_r, 11.5, 11.5, -1.0), foot_r, foot_r + Vector2(3.8, 0.2)])
	elif is_climbing:
		var alt := sin(_walk_cycle) * 5.0
		var hip_l := Vector2(-1.5, hip_y)
		var foot_l := Vector2(2.0, -2.0 + alt)
		_leg_l.points = PackedVector2Array([hip_l, _solve_ik(hip_l, foot_l, 11.8, 11.8, -1.0), foot_l, foot_l + Vector2(3.8, 0.2)])
		var hip_r := Vector2(1.5, hip_y)
		var foot_r := Vector2(4.0, -2.0 - alt)
		_leg_r.points = PackedVector2Array([hip_r, _solve_ik(hip_r, foot_r, 11.8, 11.8, -1.0), foot_r, foot_r + Vector2(3.8, 0.2)])
	elif on_floor:
		var hip_l := Vector2(-1.5, hip_y)
		var foot_l := Vector2(-stride, -lift_l)
		_leg_l.points = PackedVector2Array([hip_l, _solve_ik(hip_l, foot_l, 11.8, 11.8, -1.0), foot_l, foot_l + Vector2(3.8, 0.2)])
		var hip_r := Vector2(1.5, hip_y)
		var foot_r := Vector2(stride, -lift_r)
		_leg_r.points = PackedVector2Array([hip_r, _solve_ik(hip_r, foot_r, 11.8, 11.8, -1.0), foot_r, foot_r + Vector2(3.8, 0.2)])
	else:
		var air_tuck := clampf(-velocity.y * 0.01, -3.5, 5.5)
		var hip_l := Vector2(-2.0, hip_y)
		var foot_l := Vector2(-6.5, -3.5 - air_tuck)
		_leg_l.points = PackedVector2Array([hip_l, _solve_ik(hip_l, foot_l, 11.8, 11.8, -1.0), foot_l, foot_l + Vector2(3.5, 0.2)])
		var hip_r := Vector2(2.0, hip_y)
		var foot_r := Vector2(4.2, -4.5 - air_tuck)
		_leg_r.points = PackedVector2Array([hip_r, _solve_ik(hip_r, foot_r, 11.8, 11.8, -1.0), foot_r, foot_r + Vector2(3.5, 0.2)])

	var reach := _interact_timer * 10.5
	var awaken_brace := (1.0 - _awaken_progress) * 9.0
	var arm_swing := sin(_walk_cycle) * (7.0 if is_climbing else (9.0 if is_running else 6.2)) * (1.0 if is_climbing else speed_ratio)
	var sh_l := Vector2(-2.0, sh_y + 2.0)
	var hand_l := Vector2(9.0 if is_pushing else (4.0 if is_climbing else -3.0 - arm_swing), sh_y + (6.0 if is_pushing else (-6.0 + arm_swing if is_climbing else 17.5)))

	var sh_r := Vector2(2.0, sh_y + 2.0)
	var hand_r := Vector2(11.0 if is_pushing else (4.0 if is_climbing else 3.0 + arm_swing + reach + awaken_brace * 0.6), sh_y + (5.0 if is_pushing else (-6.0 - arm_swing if is_climbing else 17.5 - reach * 0.65 + awaken_brace * 0.35)))
	if is_sliding:
		hand_l = Vector2(-1.0, sh_y + 18.0)
		hand_r = Vector2(14.0, sh_y + 12.0)
	_arm_l.points = PackedVector2Array([sh_l, _solve_ik(sh_l, hand_l, 9.5, 9.5, 1.0), hand_l])
	_arm_r.points = PackedVector2Array([sh_r, _solve_ik(sh_r, hand_r, 9.5, 9.5, 1.0), hand_r])

	_torso_poly.position.y = crouch_drop * 0.92 + breathe * 0.55
	_collar_poly.position.y = _torso_poly.position.y
	_head_poly.position = Vector2(speed_ratio * 1.4, _torso_poly.position.y)

	_cloak_nodes[0] = Vector2(-4.5, sh_y + 2.0)
	var local_wind := -speed * 0.032 - 4.5
	var air_lift := 0.0 if on_floor else clampf(-velocity.y * 0.012, -3.5, 5.5)
	for i in range(1, _cloak_nodes.size()):
		var prev := _cloak_nodes[i - 1]
		var wave := sin(_time * 5.8 + float(i) * 0.85) * (1.0 + float(i) * 0.22)
		var target := Vector2(prev.x + local_wind * 0.5 + wave, prev.y + 4.3 + air_lift * 0.35)
		_cloak_nodes[i] = _cloak_nodes[i].lerp(target, clampf((18.0 - float(i)) * delta, 0.0, 1.0))

	var cloak_pts := PackedVector2Array()
	for i in range(_cloak_nodes.size()):
		cloak_pts.append(_cloak_nodes[i])
	for i in range(_cloak_nodes.size() - 1, -1, -1):
		var pt := _cloak_nodes[i]
		cloak_pts.append(Vector2(pt.x - (3.5 + float(i) * 1.85), pt.y + 8.5 + float(i) * 1.9))
	_cloak_poly.polygon = cloak_pts

	var state := ResonanceSystem.current_state
	var pulse := 1.0 + 0.14 * sin(_time * 2.8)
	var core_col := Color(0.95, 0.64, 0.24, 1.0)
	if state == ResonanceSystem.State.ECO:
		pulse = 1.0 + 0.2 * sin(_time * 4.5)
		core_col = Color(1.0, 0.76, 0.36, 1.0)
	elif state == ResonanceSystem.State.RUPTURA:
		pulse = 1.0 + 0.28 * sin(_time * 8.2)
		core_col = Color(1.0, 0.48, 0.18, 1.0)
	if _reject_timer > 0.0:
		core_col = Color(1.0, 0.34, 0.24, 1.0)

	var flare_boost := (1.0 + _flare_timer * 1.25) * (0.45 + 0.55 * _awaken_progress)
	_core_sprite.position = Vector2(2.6, sh_y + 6.5)
	_core_sprite.scale = Vector2.ONE * (0.36 * pulse * flare_boost)
	_core_sprite.modulate = core_col
	_core_light.position = _core_sprite.position
	_core_light.color = core_col
	_core_light.energy = (1.1 + 0.25 * (pulse - 1.0)) * flare_boost
	_core_ring.position = _core_sprite.position
	if _flare_timer > 0.0:
		var flare_progress := clampf(1.0 - _flare_timer, 0.0, 1.0)
		_core_ring.scale = Vector2.ONE * (5.0 + flare_progress * 24.0)
		var ring_alpha := sin(flare_progress * PI) * 0.9
		_core_ring.default_color = Color(core_col.r, core_col.g, core_col.b, ring_alpha)
		_core_ring.visible = ring_alpha > 0.01
	else:
		_core_ring.visible = false

func start_awaken() -> void:
	_awaken_progress = 0.0

func is_awakening() -> bool:
	return _awaken_progress < 0.36

func start_dying() -> void:
	_is_dying = true
	_dying_progress = 0.0

func end_dying() -> void:
	_is_dying = false
	_dying_progress = 0.0
	modulate.a = 1.0

func trigger_jump_stretch() -> void:
	_squash = Vector2(0.84, 1.18)
	_land_crouch = 0.0

func trigger_land_squash(heavy: bool = false) -> void:
	_squash = Vector2(1.22, 0.78) if heavy else Vector2(1.14, 0.86)
	_land_crouch = 1.0 if heavy else 0.55

func trigger_turn_skid() -> void:
	_squash = Vector2(1.09, 0.93)

func trigger_resonance_flare() -> void:
	_flare_timer = 1.0

func trigger_resonance_reject() -> void:
	_reject_timer = 0.45

func trigger_interact() -> void:
	_interact_timer = 1.0
