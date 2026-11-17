extends Node2D
class_name CorePulse

var _t: float = 0.0
@export var base_scale: float = 1.0

func _process(delta: float) -> void:
	_t += delta
	var pulse := 1.0 + 0.14 * sin(_t * 2.8)
	if ResonanceSystem.current_state == ResonanceSystem.State.RUPTURA:
		pulse = 1.0 + 0.25 * sin(_t * 7.5)
	elif ResonanceSystem.current_state == ResonanceSystem.State.ECO:
		pulse = 1.0 + 0.18 * sin(_t * 4.2)
	scale = Vector2.ONE * base_scale * pulse
