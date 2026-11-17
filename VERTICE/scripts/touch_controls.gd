extends CanvasLayer
class_name TouchControls

var sensitivity: float = 1.0
var horizontal_axis: float = 0.0
var vertical_axis: float = 0.0
var joystick_active: bool = false
var is_running: bool = false
var slide_requested: bool = false
var _joystick: Control

@onready var btn_jump: TouchScreenButton = $RightPad/BtnJump
@onready var btn_interact: TouchScreenButton = $RightPad/BtnInteract
@onready var btn_present: TouchScreenButton = $ResonancePad/BtnPresent
@onready var btn_echo: TouchScreenButton = $ResonancePad/BtnEcho
@onready var btn_ruptura: TouchScreenButton = $ResonancePad/BtnRuptura

const DEFAULT_LAYOUT := {
    "joystick": {"x": 0.19, "y": 0.78, "size": 180.0},
    "jump": {"x": 0.83, "y": 0.77, "size": 110.0},
    "interact": {"x": 0.70, "y": 0.87, "size": 84.0},
    "present": {"x": 0.69, "y": 0.68, "size": 72.0},
    "echo": {"x": 0.81, "y": 0.63, "size": 72.0},
    "ruptura": {"x": 0.92, "y": 0.70, "size": 72.0}
}

const BUTTON_STYLES := {
    "jump": {"label": "PULO", "color": Color(0.95, 0.64, 0.24, 1.0)},
    "interact": {"label": "USAR", "color": Color(0.95, 0.72, 0.34, 1.0)},
    "present": {"label": "PRES", "color": Color(0.86, 0.89, 0.94, 1.0)},
    "echo": {"label": "ECO", "color": Color(0.95, 0.72, 0.34, 1.0)},
    "ruptura": {"label": "RUPT", "color": Color(1.0, 0.56, 0.22, 1.0)}
}

func _ready() -> void:
    sensitivity = float(SaveManager.data.get("touch_sensitivity", 1.0))
    add_to_group("touch_controls")

    _joystick = Control.new()
    _joystick.name = "VirtualJoystick"
    _joystick.set_script(load("res://scripts/virtual_joystick.gd"))
    add_child(_joystick)
    _joystick.direction_changed.connect(_on_joystick_changed)

    _prepare_button_parents()
    _setup_button_visuals()
    apply_saved_layout()

    if not ResonanceSystem.state_unlocked.is_connected(_refresh_unlocks):
        ResonanceSystem.state_unlocked.connect(_refresh_unlocks)
    _refresh_unlocks(0)

func _prepare_button_parents() -> void:
    for path in ["RightPad", "ResonancePad"]:
        var pad := get_node_or_null(path) as Control
        if pad:
            pad.anchor_left = 0.0
            pad.anchor_top = 0.0
            pad.anchor_right = 1.0
            pad.anchor_bottom = 1.0
            pad.offset_left = 0.0
            pad.offset_top = 0.0
            pad.offset_right = 0.0
            pad.offset_bottom = 0.0

func _setup_button_visuals() -> void:
    _style_button(btn_jump, "jump", 110.0)
    _style_button(btn_interact, "interact", 84.0)
    _style_button(btn_present, "present", 72.0)
    _style_button(btn_echo, "echo", 72.0)
    _style_button(btn_ruptura, "ruptura", 72.0)

func _style_button(btn: TouchScreenButton, key: String, button_size: float) -> void:
    if btn == null:
        return
    var style: Dictionary = BUTTON_STYLES[key]
    var accent: Color = style["color"]
    var shape := CircleShape2D.new()
    shape.radius = button_size * 0.5
    btn.shape = shape
    btn.shape_centered = true
    btn.passby_press = false
    btn.texture_normal = _build_button_texture(int(button_size), accent)

    var label := btn.get_node_or_null("ControlLabel") as Label
    if label == null:
        label = Label.new()
        label.name = "ControlLabel"
        btn.add_child(label)
    label.text = str(style["label"])
    label.position = Vector2(-button_size * 0.5, -button_size * 0.5)
    label.size = Vector2(button_size, button_size)
    label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
    label.add_theme_font_size_override("font_size", maxi(10, int(button_size * 0.15)))
    label.add_theme_color_override("font_color", accent)
    label.mouse_filter = Control.MOUSE_FILTER_IGNORE

func _build_button_texture(size_px: int, accent: Color) -> ImageTexture:
    var side := maxi(32, size_px)
    var img := Image.create(side, side, false, Image.FORMAT_RGBA8)
    var center := Vector2(side * 0.5, side * 0.5)
    var radius := side * 0.48
    for y in range(side):
        for x in range(side):
            var distance := Vector2(x + 0.5, y + 0.5).distance_to(center)
            if distance <= radius:
                if distance >= radius - 3.0:
                    img.set_pixel(x, y, Color(accent.r, accent.g, accent.b, 0.88))
                else:
                    img.set_pixel(x, y, Color(0.035, 0.045, 0.065, 0.82))
    return ImageTexture.create_from_image(img)

func apply_saved_layout() -> void:
    var viewport_size := get_viewport().get_visible_rect().size
    if viewport_size.x <= 0.0 or viewport_size.y <= 0.0:
        return

    var layout: Dictionary = SaveManager.data.get("touch_layout", DEFAULT_LAYOUT)
    var joystick_data: Dictionary = layout.get("joystick", DEFAULT_LAYOUT["joystick"])
    var joystick_size := clampf(float(joystick_data.get("size", 180.0)), 120.0, 260.0)
    _joystick.anchor_left = 0.0
    _joystick.anchor_top = 0.0
    _joystick.anchor_right = 0.0
    _joystick.anchor_bottom = 0.0
    _joystick.size = Vector2(joystick_size, joystick_size)
    _joystick.position = Vector2(
        viewport_size.x * float(joystick_data.get("x", 0.19)) - joystick_size * 0.5,
        viewport_size.y * float(joystick_data.get("y", 0.78)) - joystick_size * 0.5
    )

    _apply_button_layout(btn_jump, "jump", layout, viewport_size)
    _apply_button_layout(btn_interact, "interact", layout, viewport_size)
    _apply_button_layout(btn_present, "present", layout, viewport_size)
    _apply_button_layout(btn_echo, "echo", layout, viewport_size)
    _apply_button_layout(btn_ruptura, "ruptura", layout, viewport_size)

func _apply_button_layout(btn: TouchScreenButton, key: String, layout: Dictionary, viewport_size: Vector2) -> void:
    if btn == null:
        return
    var item: Dictionary = layout.get(key, DEFAULT_LAYOUT[key])
    var x := clampf(float(item.get("x", DEFAULT_LAYOUT[key]["x"])), 0.05, 0.98)
    var y := clampf(float(item.get("y", DEFAULT_LAYOUT[key]["y"])), 0.08, 0.96)
    var button_size := clampf(float(item.get("size", DEFAULT_LAYOUT[key]["size"])), 48.0, 150.0)
    btn.position = Vector2(viewport_size.x * x, viewport_size.y * y)
    _style_button(btn, key, button_size)

func _on_joystick_changed(direction: Vector2, active: bool) -> void:
    horizontal_axis = direction.x
    vertical_axis = direction.y
    joystick_active = active
    var strength := direction.length()
    is_running = active and strength >= 0.72
    slide_requested = is_running and direction.y >= 0.56

func _refresh_unlocks(_id: int) -> void:
    if btn_echo:
        btn_echo.visible = ResonanceSystem.unlocked_echo
    if btn_ruptura:
        btn_ruptura.visible = ResonanceSystem.unlocked_ruptura
