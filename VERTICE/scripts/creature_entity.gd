extends Node2D
class_name CreatureEntity

enum Kind { VEIL_WISP = 0, HOLLOW_WARDEN = 1, ARCHIVE_STALKER = 2 }

@export var kind: Kind = Kind.VEIL_WISP
@export var patrol_min_x: float = -120.0
@export var patrol_max_x: float = 120.0
@export var base_speed: float = 55.0

var _origin_x: float = 0.0
var _dir: float = 1.0
var _t: float = 0.0
var _alert_level: float = 0.0
var _state: String = "patrol" # patrol | alert | calmed

func _ready() -> void:
	_origin_x = global_position.x
	if patrol_min_x > patrol_max_x:
		var tmp := patrol_min_x
		patrol_min_x = patrol_max_x
		patrol_max_x = tmp

func _physics_process(delta: float) -> void:
	_t += delta
	var players := get_tree().get_nodes_in_group("player")
	var player: PlayerController = players[0] as PlayerController if not players.is_empty() and players[0] is PlayerController else null

	var in_echo := ResonanceSystem.current_state == ResonanceSystem.State.ECO
	if kind == Kind.VEIL_WISP:
		_state = "calmed" if in_echo else "patrol"
		global_position.x += _dir * base_speed * (0.55 if in_echo else 1.0) * delta
		if global_position.x >= patrol_max_x:
			global_position.x = patrol_max_x
			_dir = -1.0
		elif global_position.x <= patrol_min_x:
			global_position.x = patrol_min_x
			_dir = 1.0
		global_position.y += sin(_t * 2.4) * 18.0 * delta
		if player and not player.is_recovering() and not in_echo:
			var dist := global_position.distance_to(player.global_position + Vector2(0, -26))
			if dist < 24.0:
				player.trigger_death_recover()
	else:
		var crouched := player != null and player.is_crouching()
		var detect_range := (115.0 if crouched else 245.0) if kind == Kind.HOLLOW_WARDEN else (140.0 if crouched else 290.0)
		var detected := false
		if player and not player.is_recovering():
			var d := global_position.distance_to(player.global_position + Vector2(0, -26))
			var same_height := absf(player.global_position.y - global_position.y) < 110.0
			var facing_player := (player.global_position.x - global_position.x) * _dir > -36.0
			if in_echo and kind == Kind.HOLLOW_WARDEN:
				detected = false
			elif d < detect_range and same_height and (facing_player or d < 85.0):
				detected = true

		if detected:
			_alert_level = minf(1.0, _alert_level + delta * 1.3)
			_state = "alert"
			_dir = signf(player.global_position.x - global_position.x)
			if _dir == 0.0:
				_dir = 1.0
			global_position.x = clampf(global_position.x + _dir * base_speed * 1.45 * delta, patrol_min_x, patrol_max_x)
			var contact := global_position.distance_to(player.global_position + Vector2(0, -26))
			if contact < 26.0:
				player.trigger_death_recover()
		else:
			_alert_level = maxf(0.0, _alert_level - delta * 0.7)
			_state = "calmed" if in_echo else "patrol"
			global_position.x += _dir * base_speed * delta
			if global_position.x >= patrol_max_x:
				global_position.x = patrol_max_x
				_dir = -1.0
			elif global_position.x <= patrol_min_x:
				global_position.x = patrol_min_x
				_dir = 1.0
	queue_redraw()

func _draw() -> void:
	var pulse := 0.5 + 0.5 * sin(_t * 3.4)
	if kind == Kind.VEIL_WISP:
		var col := Color(0.95, 0.72, 0.34, 0.86) if _state == "calmed" else Color(0.58, 0.80, 0.96, 0.82)
		draw_circle(Vector2.ZERO, 18.0 + pulse * 4.0, Color(col.r, col.g, col.b, 0.14))
		draw_circle(Vector2.ZERO, 7.0, col)
		draw_line(Vector2.ZERO, Vector2(-_dir * 26.0, sin(_t * 4.0) * 6.0), Color(col.r, col.g, col.b, 0.45), 2.5)
	elif kind == Kind.HOLLOW_WARDEN:
		var eye := Color(0.96, 0.36, 0.24, 0.95) if _state == "alert" else (Color(0.95, 0.72, 0.34, 0.85) if _state == "calmed" else Color(0.84, 0.68, 0.46, 0.75))
		var body_pts := PackedVector2Array([
			Vector2(-14, 0), Vector2(14, 0), Vector2(10, -48), Vector2(3, -64), Vector2(-6, -60), Vector2(-12, -40)
		])
		draw_colored_polygon(body_pts, Color(0.04, 0.05, 0.08, 0.96))
		draw_circle(Vector2(_dir * 4.0, -54.0), 3.0 + pulse * 0.8, eye)
		if _state != "calmed":
			var cone_len := 180.0 if _state == "alert" else 130.0
			var cone := PackedVector2Array([
				Vector2(_dir * 5.0, -54.0),
				Vector2(_dir * cone_len, -76.0),
				Vector2(_dir * cone_len, -10.0)
			])
			draw_colored_polygon(cone, Color(eye.r, eye.g, eye.b, 0.14 if _state == "alert" else 0.07))
	else:
		# Archive Stalker
		var eye := Color(0.96, 0.32, 0.24, 0.96) if _state == "alert" else Color(0.92, 0.62, 0.28, 0.82)
		var pts := PackedVector2Array([
			Vector2(-18, 0), Vector2(-6, -24), Vector2(10, -26), Vector2(20, 0), Vector2(6, -12), Vector2(-6, -12)
		])
		draw_colored_polygon(pts, Color(0.05, 0.06, 0.09, 0.96))
		draw_circle(Vector2(_dir * 12.0, -20.0), 2.8 + pulse * 0.7, eye)
