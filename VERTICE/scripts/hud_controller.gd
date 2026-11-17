extends CanvasLayer
class_name HudController

@onready var area_label: Label = $TopLeft/AreaTitle
@onready var state_label: Label = $TopLeft/StateLabel
@onready var memory_label: Label = $TopLeft/MemoryLabel
@onready var reject_label: Label = $TopLeft/RejectLabel
@onready var ruptura_bar: ProgressBar = $TopLeft/RupturaBar
@onready var pause_btn: Button = $TopRight/PauseButton
@onready var pause_panel: Control = $PauseOverlay
@onready var btn_resume: Button = $PauseOverlay/PauseMenu/Center/Resume
@onready var btn_restart: Button = $PauseOverlay/PauseMenu/Center/Restart
@onready var btn_exit_menu: Button = $PauseOverlay/PauseMenu/Center/ExitToMenu
@onready var chapter_end_panel: Control = $ChapterEndOverlay
@onready var chapter_end_kicker: Label = $ChapterEndOverlay/Panel/VBox/Kicker
@onready var chapter_end_title: Label = $ChapterEndOverlay/Panel/VBox/Title
@onready var chapter_end_summary: Label = $ChapterEndOverlay/Panel/VBox/Summary
@onready var btn_next_chapter: Button = $ChapterEndOverlay/Panel/VBox/BtnChapter2
@onready var btn_replay: Button = $ChapterEndOverlay/Panel/VBox/BtnReplay
@onready var btn_end_menu: Button = $ChapterEndOverlay/Panel/VBox/BtnMenu

var _bar_top: ColorRect
var _bar_bottom: ColorRect
var _letterbox_timer: float = 0.0
var _letterbox_duration: float = 0.0
var _reject_timer: float = 0.0

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	ResonanceSystem.state_changed.connect(_on_state_changed)
	ResonanceSystem.resonance_rejected.connect(_on_resonance_rejected)
	ResonanceSystem.ruptura_energy_changed.connect(_on_energy_changed)
	ChapterProgression.memory_unlocked.connect(_on_memory_unlocked)
	GameManager.area_changed.connect(_on_area_changed)
	GameManager.chapter_completed.connect(_on_chapter_completed)
	GameManager.cinematic_focus_requested.connect(_on_cinematic_focus_requested)
	_build_letterbox_bars()

	if pause_btn:
		pause_btn.pressed.connect(_on_pause_pressed)
	if btn_resume:
		btn_resume.pressed.connect(_on_pause_pressed)
	if btn_restart:
		btn_restart.pressed.connect(func(): GameManager.start_chapter(GameManager.current_chapter))
	if btn_exit_menu:
		btn_exit_menu.pressed.connect(func(): GameManager.return_to_main_menu())

	if btn_next_chapter:
		btn_next_chapter.pressed.connect(func(): GameManager.advance_to_next_chapter())
	if btn_replay:
		btn_replay.pressed.connect(func(): GameManager.start_chapter(1 if GameManager.current_chapter == 6 else GameManager.current_chapter))
	if btn_end_menu:
		btn_end_menu.pressed.connect(func(): GameManager.return_to_main_menu())

	var default_area := (GameManager.current_chapter - 1) * 5 + 1
	var info: Dictionary = GameManager.AREAS.get(GameManager.current_area, GameManager.AREAS.get(default_area, GameManager.AREAS[1]))
	if area_label:
		area_label.text = str(info.get("title", "O Primeiro Silêncio"))

	_update_state_text(ResonanceSystem.current_state)
	_on_energy_changed(ResonanceSystem.ruptura_energy)
	_refresh_memories_label()

	if reject_label:
		reject_label.visible = false
	if pause_panel:
		pause_panel.visible = false
	if chapter_end_panel:
		chapter_end_panel.visible = false

func _build_letterbox_bars() -> void:
	_bar_top = ColorRect.new()
	_bar_top.color = Color(0.012, 0.016, 0.028, 0.92)
	_bar_top.anchor_right = 1.0
	_bar_top.offset_bottom = 0.0
	_bar_top.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_bar_top)

	_bar_bottom = ColorRect.new()
	_bar_bottom.color = Color(0.012, 0.016, 0.028, 0.92)
	_bar_bottom.anchor_top = 1.0
	_bar_bottom.anchor_right = 1.0
	_bar_bottom.anchor_bottom = 1.0
	_bar_bottom.offset_top = 0.0
	_bar_bottom.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_bar_bottom)

func _on_cinematic_focus_requested(_pos: Vector2, _zoom: float, duration: float, use_letterbox: bool) -> void:
	if use_letterbox:
		_letterbox_duration = maxf(0.1, duration)
		_letterbox_timer = _letterbox_duration

func _on_resonance_rejected() -> void:
	_reject_timer = 1.35
	if reject_label:
		reject_label.visible = true

func _process(delta: float) -> void:
	if _reject_timer > 0.0:
		_reject_timer = maxf(0.0, _reject_timer - delta)
		if _reject_timer <= 0.0 and reject_label:
			reject_label.visible = false

	if _letterbox_timer > 0.0 and _bar_top and _bar_bottom:
		_letterbox_timer = maxf(0.0, _letterbox_timer - delta)
		var p := 1.0 - (_letterbox_timer / maxf(0.01, _letterbox_duration))
		var frac := (p / 0.18) if p < 0.18 else ((1.0 - p) / 0.18 if p > 0.82 else 1.0)
		var h := 34.0 * clampf(frac, 0.0, 1.0)
		_bar_top.offset_bottom = h
		_bar_bottom.offset_top = -h
	elif _bar_top and _bar_bottom and _bar_top.offset_bottom > 0.0:
		_bar_top.offset_bottom = 0.0
		_bar_bottom.offset_top = 0.0

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("pause") and not GameManager.chapter_finished:
		_on_pause_pressed()

func _on_pause_pressed() -> void:
	if GameManager.chapter_finished:
		return
	GameManager.toggle_pause()
	if pause_panel:
		pause_panel.visible = GameManager.is_paused

func _on_state_changed(new_state: int, _prev: int) -> void:
	_update_state_text(new_state)

func _update_state_text(state_id: int) -> void:
	if not state_label:
		return
	match state_id:
		0:
			state_label.text = "RESSONÂNCIA · PRESENTE"
			state_label.modulate = Color(0.86, 0.89, 0.94, 1.0)
		1:
			state_label.text = "RESSONÂNCIA · ECO"
			state_label.modulate = Color(0.95, 0.68, 0.30, 1.0)
		2:
			state_label.text = "RESSONÂNCIA · RUPTURA"
			state_label.modulate = Color(1.0, 0.56, 0.22, 1.0)

func _on_energy_changed(ratio: float) -> void:
	if ruptura_bar:
		ruptura_bar.value = ratio * 100.0
		ruptura_bar.visible = ResonanceSystem.unlocked_ruptura

func _on_memory_unlocked(_id: String, _total: int) -> void:
	_refresh_memories_label()

func _refresh_memories_label() -> void:
	if memory_label:
		memory_label.visible = ResonanceSystem.unlocked_echo
		memory_label.text = "Memórias %d/%d" % [
			ChapterProgression.get_chapter_memory_count(GameManager.current_chapter),
			ChapterProgression.get_chapter_memory_total(GameManager.current_chapter)
		]

func _on_area_changed(_id: int, area_title: String, _sub: String) -> void:
	if area_label:
		area_label.text = area_title

func _on_chapter_completed() -> void:
	if pause_panel:
		pause_panel.visible = false
	var chap := clampi(GameManager.current_chapter, 1, 6)
	var meta: Dictionary = ChapterProgression.CHAPTER_TITLES.get(chap, ChapterProgression.CHAPTER_TITLES[1])
	var found := ChapterProgression.get_chapter_memory_count(chap)
	var total := ChapterProgression.get_chapter_memory_total(chap)

	if area_label:
		area_label.text = "%s · Fim do Capítulo %s" % [str(meta["title"]), str(meta["roman"])]
	if chapter_end_kicker:
		chapter_end_kicker.text = "JORNADA CONCLUÍDA" if chap == 6 else ("CAPÍTULO %s CONCLUÍDO" % str(meta["roman"]))
	if chapter_end_title:
		chapter_end_title.text = str(meta["title"]).to_upper()
	if chapter_end_summary:
		if chap == 6:
			chapter_end_summary.text = "Memórias do Limiar: %d/%d · Todos os 6 capítulos alinhados no Núcleo" % [found, total]
		else:
			var next_meta: Dictionary = ChapterProgression.CHAPTER_TITLES.get(chap + 1, meta)
			chapter_end_summary.text = "Memórias Despertadas: %d/%d · Capítulo %s desbloqueado" % [found, total, str(next_meta["roman"])]
	if btn_next_chapter:
		if chap < 6:
			var next_meta: Dictionary = ChapterProgression.CHAPTER_TITLES.get(chap + 1, meta)
			btn_next_chapter.text = "Avançar · Capítulo %s (%s)" % [str(next_meta["roman"]), str(next_meta["title"])]
		else:
			btn_next_chapter.text = "Jogar Capítulo VI Novamente"
	if btn_replay:
		btn_replay.text = "Recomeçar Capítulo I" if chap == 6 else "Jogar Novamente"
	if chapter_end_panel:
		chapter_end_panel.visible = true
