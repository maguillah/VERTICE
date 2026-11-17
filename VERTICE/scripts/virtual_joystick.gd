extends Control

signal direction_changed(direction: Vector2, active: bool)

var direction := Vector2.ZERO
var _finger := -1
const DEADZONE := 0.12
const RADIUS := 76.0
const KNOB_RADIUS := 25.0

func _ready() -> void:
    mouse_filter = Control.MOUSE_FILTER_STOP
    queue_redraw()

func _gui_input(event: InputEvent) -> void:
    if event is InputEventScreenTouch:
        if event.pressed and _finger == -1:
            _finger = event.index
            _update_direction(event.position)
            accept_event()
        elif not event.pressed and event.index == _finger:
            _finger = -1
            _release()
            accept_event()
    elif event is InputEventScreenDrag and event.index == _finger:
        _update_direction(event.position)
        accept_event()

func _update_direction(position: Vector2) -> void:
    var offset := position - size * 0.5
    var distance := offset.length()
    if distance <= RADIUS * DEADZONE:
        direction = Vector2.ZERO
    else:
        var strength := clampf(distance / RADIUS, 0.0, 1.0)
        strength = (strength - DEADZONE) / (1.0 - DEADZONE)
        direction = offset.normalized() * strength
    direction_changed.emit(direction, direction.length() > 0.01)
    queue_redraw()

func _release() -> void:
    direction = Vector2.ZERO
    direction_changed.emit(direction, false)
    queue_redraw()

func _draw() -> void:
    var center := size * 0.5
    draw_circle(center, RADIUS, Color(0.035, 0.045, 0.06, 0.48))
    draw_arc(center, RADIUS, 0.0, TAU, 64, Color(0.78, 0.86, 0.98, 0.58), 2.0, true)
    draw_circle(center, 20.0, Color(0.65, 0.72, 0.82, 0.18))
    var knob := center + direction * (RADIUS - KNOB_RADIUS)
    draw_circle(knob, KNOB_RADIUS, Color(0.78, 0.85, 0.96, 0.72))
    draw_arc(knob, KNOB_RADIUS, 0.0, TAU, 40, Color(0.95, 0.72, 0.34, 0.9), 2.0, true)
