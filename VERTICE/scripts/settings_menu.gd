extends Control
class_name SettingsMenu

@onready var volume_slider: HSlider = $Panel/VBox/VolumeSlider
@onready var sensitivity_slider: HSlider = $Panel/VBox/SensitivitySlider
@onready var quality_option: OptionButton = $Panel/VBox/QualityOption
@onready var close_btn: Button = $Panel/VBox/CloseButton

func _ready() -> void:
	if volume_slider:
		volume_slider.value = float(SaveManager.data.get("master_volume", 0.85))
		volume_slider.value_changed.connect(_on_volume_changed)
	if sensitivity_slider:
		sensitivity_slider.value = float(SaveManager.data.get("touch_sensitivity", 1.0))
		sensitivity_slider.value_changed.connect(_on_sensitivity_changed)
	if quality_option:
		quality_option.clear()
		quality_option.add_item("Baixa (OPPO A5 · 30 FPS)")
		quality_option.add_item("Média (Equilibrada)")
		quality_option.add_item("Alta (60 FPS)")
		quality_option.selected = int(SaveManager.data.get("quality", 1))
		quality_option.item_selected.connect(_on_quality_selected)
	if close_btn:
		close_btn.pressed.connect(func():
			SaveManager.save_settings(
				AudioManager.master_volume,
				AudioManager.is_muted,
				float(SaveManager.data.get("touch_sensitivity", 1.0)),
				GameManager.current_quality
			)
			visible = false
		)

func _on_volume_changed(val: float) -> void:
	AudioManager.set_master_volume(val)

func _on_sensitivity_changed(val: float) -> void:
	SaveManager.data["touch_sensitivity"] = val

func _on_quality_selected(idx: int) -> void:
	GameManager.apply_quality(idx)
