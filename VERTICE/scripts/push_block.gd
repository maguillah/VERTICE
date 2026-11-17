extends CharacterBody2D
class_name PushBlock

@export var size: Vector2 = Vector2(46.0, 46.0)
@export var gravity_scale: float = 1280.0

var _push_vx: float = 0.0

func _ready() -> void:
	collision_layer = 1
	collision_mask = 1
	floor_snap_length = 4.0
	var col := CollisionShape2D.new()
	var rect := RectangleShape2D.new()
	rect.size = size
	col.shape = rect
	col.position = Vector2(0.0, -size.y * 0.5)
	add_child(col)
	queue_redraw()

func apply_push(vx: float) -> void:
	_push_vx = vx

func _physics_process(delta: float) -> void:
	if not is_on_floor():
		velocity.y = minf(840.0, velocity.y + gravity_scale * delta)
	velocity.x = move_toward(velocity.x, _push_vx, 1200.0 * delta)
	_push_vx = move_toward(_push_vx, 0.0, 2200.0 * delta)
	move_and_slide()

func _draw() -> void:
	var half := size.x * 0.5
	draw_rect(Rect2(-half, -size.y, size.x, size.y), Color(0.14, 0.16, 0.21, 1.0))
	draw_rect(Rect2(-half, -size.y, size.x, size.y), Color(0.36, 0.42, 0.52, 0.42), false, 2.0)
	draw_line(Vector2(-half + 6.0, -size.y + 6.0), Vector2(half - 6.0, -6.0), Color(0.90, 0.60, 0.22, 0.35), 2.0)
	draw_line(Vector2(half - 6.0, -size.y + 6.0), Vector2(-half + 6.0, -6.0), Color(0.90, 0.60, 0.22, 0.35), 2.0)
