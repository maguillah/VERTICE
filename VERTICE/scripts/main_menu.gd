extends Control
class_name MainMenu

@onready var btn_start: Button = $MenuPanel/VBox/BtnStart
@onready var btn_continue: Button = $MenuPanel/VBox/BtnContinue
@onready var chapter_selector: HBoxContainer = $MenuPanel/VBox/ChapterSelector
@onready var btn_settings: Button = $MenuPanel/VBox/BtnSettings
@onready var btn_credits: Button = $MenuPanel/VBox/BtnCredits
@onready var settings_panel: Control = $SettingsMenu
@onready var credits_panel: Control = $CreditsMenu
@onready var btn_credits_close: Button = $CreditsMenu/Center/CloseButton

func _ready() -> void:
	SaveManager.load_all()
	ChapterProgression.load_from_save(SaveManager.data)
	if btn_continue:
		btn_continue.disabled = not SaveManager.has_saved_game()
	if chapter_selector:
		var romans := ["I", "II", "III", "IV", "V", "VI"]
		for idx in range(6):
			var chap_num := idx + 1
			var btn := Button.new()
			btn.text = romans[idx]
			btn.custom_minimum_size = Vector2(40, 32)
			btn.disabled = not ChapterProgression.is_chapter_unlocked(chap_num)
			btn.pressed.connect(func(): GameManager.start_chapter(chap_num))
			chapter_selector.add_child(btn)
	if btn_start:
		btn_start.pressed.connect(func(): GameManager.start_new_game())
	if btn_continue:
		btn_continue.pressed.connect(func(): GameManager.continue_game())
	if btn_settings:
		btn_settings.pressed.connect(func():
			if settings_panel:
				settings_panel.visible = true
		)
	if btn_credits:
		btn_credits.pressed.connect(func():
			if credits_panel:
				credits_panel.visible = true
		)
	if btn_credits_close:
		btn_credits_close.pressed.connect(func():
			if credits_panel:
				credits_panel.visible = false
		)
