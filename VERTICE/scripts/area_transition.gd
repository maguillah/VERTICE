extends Area2D
class_name AreaTransition

const FOREGROUND_SCRIPT = preload("res://scripts/transition_foreground.gd")

@export var area_id: int = 1
var _transitioning: bool = false

func _ready() -> void:
    body_entered.connect(_on_body_entered)

func _on_body_entered(body: Node) -> void:
    if not body is PlayerController or _transitioning:
        return
    if GameManager.current_area == area_id:
        return
    _transitioning = true
    await _play_transition()

func _play_transition() -> void:
    var overlay := CanvasLayer.new()
    overlay.layer = 100
    overlay.process_mode = Node.PROCESS_MODE_ALWAYS
    get_tree().root.add_child(overlay)

    var curtain := ColorRect.new()
    curtain.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    curtain.color = Color("#080d16")
    curtain.mouse_filter = Control.MOUSE_FILTER_IGNORE
    curtain.scale = Vector2(1.0, 0.0)
    overlay.add_child(curtain)

    await get_tree().process_frame

    var viewport_size := get_viewport().get_visible_rect().size
    curtain.pivot_offset = Vector2(0.0, viewport_size.y)

    var accent := ColorRect.new()
    accent.position = Vector2(0.0, viewport_size.y * 0.68)
    accent.size = Vector2(viewport_size.x, 3.0)
    accent.mouse_filter = Control.MOUSE_FILTER_IGNORE

    match area_id:
        1: accent.color = Color("#72a9ad")
        2: accent.color = Color("#b68b54")
        3: accent.color = Color("#91a9bd")
        4: accent.color = Color("#72d0d0")
        _: accent.color = Color("#c49a65")

    curtain.add_child(accent)

    var foreground := Node2D.new()
    foreground.set_script(FOREGROUND_SCRIPT)
    foreground.set("area_id", area_id)
    foreground.position = Vector2(-viewport_size.x * 0.95, 0.0)
    overlay.add_child(foreground)

    var sweep := create_tween()
    sweep.set_pause_mode(Tween.TWEEN_PAUSE_PROCESS)
    sweep.set_trans(Tween.TRANS_CUBIC)
    sweep.set_ease(Tween.EASE_IN_OUT)
    sweep.tween_property(foreground, "position:x", viewport_size.x * 0.95, 1.42)

    var cover := create_tween()
    cover.set_pause_mode(Tween.TWEEN_PAUSE_PROCESS)
    cover.set_trans(Tween.TRANS_CUBIC)
    cover.set_ease(Tween.EASE_IN_OUT)
    cover.tween_property(curtain, "scale:y", 1.0, 0.62)
    await cover.finished

    GameManager.set_area(area_id)
    await get_tree().create_timer(0.18, true).timeout

    var reveal := create_tween()
    reveal.set_pause_mode(Tween.TWEEN_PAUSE_PROCESS)
    reveal.set_trans(Tween.TRANS_CUBIC)
    reveal.set_ease(Tween.EASE_IN_OUT)
    reveal.tween_property(curtain, "scale:y", 0.0, 0.62)
    await reveal.finished
    await sweep.finished

    overlay.queue_free()
    _transitioning = false
