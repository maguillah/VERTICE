extends Area2D
class_name ClimbZone

@export var zone_width: float = 28.0
@export var zone_height: float = 180.0
@export var is_rope: bool = true

var _t: float = 0.0

func _ready() -> void:
	collision_layer = 4
	collision_mask = 2
	var col := CollisionShape2D.new()
	var rect := RectangleShape2D.new()
	rect.size = Vector2(zone_width, zone_height)
	col.shape = rect
	col.position = Vector2(0.0, -zone_height * 0.5)
	add_child(col)
	body_entered.connect(_on_body_entered)
	body_exited.connect(_on_body_exited)

func _process(delta: float) -> void:
	_t += delta
	queue_redraw()

func _draw() -> void:
	if is_rope:
		var sway := sin(_t * 1.4) * 2.5
		draw_line(Vector2(0.0, -zone_height), Vector2(sway, 0.0), Color(0.45, 0.42, 0.38, 0.9), 3.0)
		var y := -16.0
		while y > -zone_height + 10.0:
			draw_circle(Vector2(sway * (1.0 + y / zone_height), y), 2.2, Color(0.75, 0.65, 0.48, 0.7))
			y -= 28.0
	else:
		draw_line(Vector2(-8.0, -zone_height), Vector2(-8.0, 0.0), Color(0.24, 0.28, 0.35, 0.95), 2.5)
		draw_line(Vector2(8.0, -zone_height), Vector2(8.0, 0.0), Color(0.24, 0.28, 0.35, 0.95), 2.5)
		var ry := -18.0
		while ry > -zone_height + 12.0:
			draw_line(Vector2(-8.0, ry), Vector2(8.0, ry), Color(0.38, 0.43, 0.52, 0.9), 2.0)
			ry -= 22.0

func _on_body_entered(body: Node) -> void:
	if body is PlayerController:
		(body as PlayerController).set_climb_zone(self, true)

func _on_body_exited(body: Node) -> void:
	if body is PlayerController:
		(body as PlayerController).set_climb_zone(self, false)
