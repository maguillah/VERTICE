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

func _ready() -> void:
    sensitivity = float(SaveManager.data.get("touch_sensitivity", 1.0))
    add_to_group("touch_controls")

    _joystick = Control.new()
    _joystick.name = "VirtualJoystick"
    _joystick.set_script(load("res://scripts/virtual_joystick.gd"))
    _joystick.anchor_left = 0.0
    _joystick.anchor_right = 0.0
    _joystick.anchor_top = 1.0
    _joystick.anchor_bottom = 1.0
    _joystick.offset_left = 24.0
    _joystick.offset_top = -204.0
    _joystick.offset_right = 204.0
    _joystick.offset_bottom = -24.0
    add_child(_joystick)
    _joystick.connect("direction_changed", _on_joystick_changed)

    _setup_button_visuals()
    if not ResonanceSystem.state_unlocked.is_connected(_refresh_unlocks):
        ResonanceSystem.state_unlocked.connect(_refresh_unlocks)
    _refresh_unlocks(0)

func _setup_button_visuals() -> void:
    _configure_touch_btn(btn_interact, Vector2(84, 68), "USAR", Color(0.95, 0.72, 0.34, 1.0), false)
    _configure_touch_btn(btn_jump, Vector2(90, 90), "PULO", Color(0.95, 0.64, 0.24, 1.0), false)
    _configure_touch_btn(btn_present, Vector2(68, 54), "PRES", Color(0.86, 0.89, 0.94, 1.0), false)
    _configure_touch_btn(btn_echo, Vector2(68, 54), "ECO", Color(0.95, 0.72, 0.34, 1.0), false)
    _configure_touch_btn(btn_ruptura, Vector2(68, 54), "RUPT", Color(1.0, 0.56, 0.22, 1.0), false)

func _on_joystick_changed(direction: Vector2, active: bool) -> void:
    horizontal_axis = direction.x
    vertical_axis = direction.y
    joystick_active = active
    var strength := direction.length()
    is_running = active and strength >= 0.72
    slide_requested = is_running and direction.y >= 0.56

func _configure_touch_btn(btn: TouchScreenButton, btn_size: Vector2, label_text: String, accent: Color, passby: bool) -> void:
    if btn == null:
        return
    var shape := RectangleShape2D.new()
    shape.size = btn_size
    btn.shape = shape
    btn.shape_centered = true
    btn.passby_press = passby
    btn.texture_normal = _build_button_texture(int(btn_size.x), int(btn_size.y), accent)

    var lbl := Label.new()
    lbl.text = label_text
    lbl.size = btn_size
    lbl.position = Vector2.ZERO
    lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
    lbl.add_theme_font_size_override("font_size", 13)
    lbl.add_theme_color_override("font_color", accent)
    btn.add_child(lbl)

func _build_button_texture(w: int, h: int, border_col: Color) -> ImageTexture:
    var img := Image.create(w, h, false, Image.FORMAT_RGBA8)
    var bg := Color(0.05, 0.06, 0.08, 0.68)
    var edge := Color(border_col.r, border_col.g, border_col.b, 0.72)
    for y in range(h):
        for x in range(w):
            var is_border := x == 0 or y == 0 or x == w - 1 or y == h - 1
            img.set_pixel(x, y, edge if is_border else bg)
    return ImageTexture.create_from_image(img)

func _refresh_unlocks(_id: int) -> void:
    if btn_echo:
        btn_echo.visible = ResonanceSystem.unlocked_echo
    if btn_ruptura:
        btn_ruptura.visible = ResonanceSystem.unlocked_ruptura
