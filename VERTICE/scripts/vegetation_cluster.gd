extends Node2D
class_name VegetationCluster

@export var width: float = 80.0
@export var blade_count: int = 12
@export var base_color: Color = Color(0.22, 0.34, 0.28, 0.85)

var _t: float = 0.0
var _bend_impulse: float = 0.0

func _process(delta: float) -> void:
	_t += delta
	var players := get_tree().get_nodes_in_group("player")
	if not players.is_empty() and players[0] is PlayerController:
		var p := players[0] as PlayerController
		var dx := p.global_position.x - global_position.x
		if absf(dx) < width * 0.65 and absf(p.global_position.y - global_position.y) < 36.0:
			_bend_impulse = clampf(p.velocity.x * 0.045, -12.0, 12.0)
	_bend_impulse = lerpf(_bend_impulse, 0.0, clampf(delta * 4.0, 0.0, 1.0))
	queue_redraw()

func _draw() -> void:
	for i in range(blade_count):
		var frac := (float(i) / maxf(1.0, float(blade_count - 1))) - 0.5
		var bx := frac * width
		var h := 14.0 + fmod(float(i * 7), 11.0)
		var sway := sin(_t * 1.9 + float(i) * 0.7) * 3.0 + _bend_impulse
		draw_line(Vector2(bx, 0.0), Vector2(bx + sway, -h), base_color, 1.8)
