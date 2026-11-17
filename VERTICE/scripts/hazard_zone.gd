extends Area2D
class_name HazardZone

@export var hazard_size: Vector2 = Vector2(90.0, 24.0)
@export var is_ruptura_surge: bool = false

var _t: float = 0.0

func _ready() -> void:
	collision_layer = 4
	collision_mask = 2
	var col := CollisionShape2D.new()
	var rect := RectangleShape2D.new()
	rect.size = hazard_size
	col.shape = rect
	col.position = Vector2(0.0, -hazard_size.y * 0.5)
	add_child(col)
	body_entered.connect(_on_body_entered)

func _process(delta: float) -> void:
	_t += delta
	queue_redraw()

func _draw() -> void:
	var neutralized := is_ruptura_surge and ResonanceSystem.current_state == ResonanceSystem.State.RUPTURA
	var col := Color(0.95, 0.62, 0.24, 0.35) if neutralized else (Color(0.95, 0.26, 0.22, 0.82) if is_ruptura_surge else Color(0.55, 0.60, 0.68, 0.9))
	var count := maxi(3, int(hazard_size.x / 14.0))
	var step := hazard_size.x / float(count)
	var x0 := -hazard_size.x * 0.5
	for i in range(count):
		var sx := x0 + float(i) * step
		var tip_y := -hazard_size.y * (0.55 if neutralized else (0.85 + 0.15 * sin(_t * 6.0 + float(i))))
		var tri := PackedVector2Array([
			Vector2(sx + 1.0, 0.0),
			Vector2(sx + step * 0.5, tip_y),
			Vector2(sx + step - 1.0, 0.0)
		])
		draw_colored_polygon(tri, col)

func _on_body_entered(body: Node) -> void:
	if body is PlayerController:
		if is_ruptura_surge and ResonanceSystem.current_state == ResonanceSystem.State.RUPTURA:
			return
		(body as PlayerController).trigger_death_recover()
