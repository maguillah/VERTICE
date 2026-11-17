extends Area2D
class_name Checkpoint

@export var checkpoint_id: String = "cp_area_1"
@export var area_id: int = 1

var _ignited: bool = false
var _t: float = 0.0

@onready var lantern_light: PointLight2D = $LanternLight
@onready var orb_poly: Polygon2D = $OrbPoly

func _ready() -> void:
	body_entered.connect(_on_body_entered)
	_ignited = (GameManager.active_checkpoint_id == checkpoint_id and SaveManager.has_saved_game()) or (area_id < GameManager.current_area and SaveManager.has_saved_game())
	if lantern_light:
		lantern_light.texture = TextureFactory2D.tex_core_glow
		lantern_light.energy = 1.9 if _ignited else 0.45
	if orb_poly:
		orb_poly.color = Color(1.0, 0.78, 0.42, 1.0) if _ignited else Color(0.52, 0.58, 0.68, 1.0)

func _process(delta: float) -> void:
	_t += delta
	if not _ignited:
		for body in get_overlapping_bodies():
			if body is PlayerController and (body as PlayerController).is_on_floor() and (body as PlayerController).velocity.y <= 80.0:
				_ignite()
				break
	if _ignited:
		queue_redraw()

func _draw() -> void:
	if not _ignited:
		return
	var r := 14.0 + sin(_t * 3.2) * 1.6
	draw_arc(Vector2(0.0, -64.0), r, 0.0, TAU, 20, Color(1.0, 0.74, 0.36, 0.42), 1.4)

func _on_body_entered(body: Node) -> void:
	if body is PlayerController and not _ignited:
		if (body as PlayerController).is_on_floor() and (body as PlayerController).velocity.y <= 80.0:
			_ignite()

func _ignite() -> void:
	_ignited = true
	if lantern_light:
		lantern_light.energy = 1.9
	if orb_poly:
		orb_poly.color = Color(1.0, 0.78, 0.42, 1.0)
	GameManager.register_checkpoint(checkpoint_id, global_position + Vector2(0.0, -6.0), area_id)
	AudioManager.play_sfx("checkpoint", 1.0)
