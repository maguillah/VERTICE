extends Node

signal area_changed(area_id: int, area_title: String, area_subtitle: String)
signal quality_changed(quality_level: int)
signal auto_quality_adjusted(new_quality: int)
signal cinematic_focus_requested(world_pos: Vector2, target_zoom: float, duration: float, use_letterbox: bool)
signal chapter_completed

enum QualityLevel { LOW = 0, MEDIUM = 1, HIGH = 2 }

const AREAS := {
	1: {"title": "O Primeiro Silêncio", "subtitle": "Cap. I · Área I — Despertar"},
	2: {"title": "O Vestígio", "subtitle": "Cap. I · Área II — Traços Ocultos"},
	3: {"title": "A Memória", "subtitle": "Cap. I · Área III — Ressonância Eco"},
	4: {"title": "A Distorção", "subtitle": "Cap. I · Área IV — Ressonância Ruptura"},
	5: {"title": "O Chamado", "subtitle": "Cap. I · Área V — O Limiar"},
	6: {"title": "O Silêncio Profundo", "subtitle": "Cap. II · Área I — A Antecâmara"},
	7: {"title": "O Pêndulo de Fase", "subtitle": "Cap. II · Área II — Fase Alternada"},
	8: {"title": "O Arquivo de Ecos", "subtitle": "Cap. II · Área III — Vestígios Superpostos"},
	9: {"title": "O Abismo Invertido", "subtitle": "Cap. II · Área IV — Fratura Dupla"},
	10: {"title": "O Chamado Consolidado", "subtitle": "Cap. II · Área V — Torre Norte"},
	11: {"title": "Portão Submerso", "subtitle": "Cap. III · Área I — A Cidade Esquecida"},
	12: {"title": "Viaduto de Cinza", "subtitle": "Cap. III · Área II — Arcos Caídos"},
	13: {"title": "Jardim Petrificado", "subtitle": "Cap. III · Área III — Vegetação Suspensa"},
	14: {"title": "Galeria dos Sentinelas", "subtitle": "Cap. III · Área IV — Passagem Oculta"},
	15: {"title": "Nave do Relógio", "subtitle": "Cap. III · Área V — Portal da Cidade"},
	16: {"title": "Margem do Esquecimento", "subtitle": "Cap. IV · Área I — O Abismo das Memórias"},
	17: {"title": "Escadaria Subterrânea", "subtitle": "Cap. IV · Área II — Cordas e Degraus"},
	18: {"title": "Câmara das Silhuetas", "subtitle": "Cap. IV · Área III — Testemunhas"},
	19: {"title": "Santuário do Eco", "subtitle": "Cap. IV · Área IV — Pontes Invisíveis"},
	20: {"title": "Fenda Memória", "subtitle": "Cap. IV · Área V — Fundo do Abismo"},
	21: {"title": "Forja Silenciosa", "subtitle": "Cap. V · Área I — A Convergência"},
	22: {"title": "Elevadores de Ferro", "subtitle": "Cap. V · Área II — Contrapesos"},
	23: {"title": "Eixo de Frequência", "subtitle": "Cap. V · Área III — Máquinas Paradas"},
	24: {"title": "Núcleo Instável", "subtitle": "Cap. V · Área IV — Saturação"},
	25: {"title": "Câmara da Convergência", "subtitle": "Cap. V · Área V — Harmonia Final"},
	26: {"title": "O Último Degrau", "subtitle": "Cap. VI · Área I — O Limiar da Existência"},
	27: {"title": "Horizonte Partido", "subtitle": "Cap. VI · Área II — Ruína Luminosa"},
	28: {"title": "Ponte das Três Cores", "subtitle": "Cap. VI · Área III — Síntese"},
	29: {"title": "Vórtice Silencioso", "subtitle": "Cap. VI · Área IV — Ascensão"},
	30: {"title": "O Vértice", "subtitle": "Cap. VI · Área V — Além do Limiar"}
}

var current_chapter: int = 1
var current_area: int = 1
var current_quality: int = QualityLevel.MEDIUM
var is_paused: bool = false
var chapter_finished: bool = false
var in_chapter_2: bool = false
var just_started_chapter: bool = false
var active_checkpoint_pos: Vector2 = Vector2(160.0, 420.0)
var active_checkpoint_id: String = "cp_area_1"

var _low_fps_timer: float = 0.0
var _auto_scaled_once: bool = false

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	apply_quality(SaveManager.data.get("quality", QualityLevel.MEDIUM))

func _process(delta: float) -> void:
	if is_paused or current_quality == QualityLevel.LOW or _auto_scaled_once:
		return
	var fps := Engine.get_frames_per_second()
	if fps > 0 and fps < 24.0:
		_low_fps_timer += delta
		if _low_fps_timer >= 2.5:
			_auto_scaled_once = true
			apply_quality(current_quality - 1)
			emit_signal("auto_quality_adjusted", current_quality)
	else:
		_low_fps_timer = 0.0

func start_new_game() -> void:
	ChapterProgression.reset_progression()
	SaveManager.reset_progress()
	ResonanceSystem.reset_states()
	current_chapter = 1
	in_chapter_2 = false
	just_started_chapter = true
	active_checkpoint_id = "cp_area_1"
	active_checkpoint_pos = Vector2(160.0, 420.0)
	current_area = 1
	chapter_finished = false
	get_tree().paused = false
	is_paused = false
	get_tree().change_scene_to_file(ChapterProgression.get_scene_path(1))

func start_chapter(chapter_num: int) -> void:
	var chap := clampi(chapter_num, 1, 6)
	current_chapter = chap
	in_chapter_2 = (chap == 2)
	just_started_chapter = true
	chapter_finished = false
	current_area = (chap - 1) * 5 + 1
	active_checkpoint_id = "cp_area_1" if chap == 1 else "cp_c%d_area_1" % chap
	active_checkpoint_pos = Vector2(160.0, 420.0 if chap == 1 else 410.0)
	ResonanceSystem.prepare_chapter(chap)
	SaveManager.save_progress()
	get_tree().paused = false
	is_paused = false
	var scene_path := ChapterProgression.get_scene_path(chap)
	if ResourceLoader.exists(scene_path):
		get_tree().change_scene_to_file(scene_path)

func start_chapter_2() -> void:
	start_chapter(2)

func advance_to_next_chapter() -> void:
	if current_chapter < 6:
		start_chapter(current_chapter + 1)
	else:
		start_chapter(6)

func continue_game() -> void:
	SaveManager.load_all()
	var saved := SaveManager.data
	ChapterProgression.load_from_save(saved)
	current_chapter = clampi(int(saved.get("chapter_number", 1)), 1, 6)
	in_chapter_2 = (current_chapter == 2)
	just_started_chapter = false
	active_checkpoint_id = str(saved.get("checkpoint_id", "cp_area_1" if current_chapter == 1 else "cp_c%d_area_1" % current_chapter))
	var default_y := 420.0 if current_chapter == 1 else 410.0
	var pos_dict: Dictionary = saved.get("checkpoint_pos", {"x": 160.0, "y": default_y})
	active_checkpoint_pos = Vector2(
		float(pos_dict.get("x", 160.0)),
		float(pos_dict.get("y", default_y))
	)
	var min_area := (current_chapter - 1) * 5 + 1
	var max_area := min_area + 4
	current_area = clampi(int(saved.get("area_id", min_area)), min_area, max_area)
	ResonanceSystem.restore_from_save(saved)
	chapter_finished = false
	get_tree().paused = false
	is_paused = false
	get_tree().change_scene_to_file(ChapterProgression.get_scene_path(current_chapter))

func return_to_main_menu() -> void:
	is_paused = false
	chapter_finished = false
	in_chapter_2 = false
	get_tree().paused = false
	get_tree().change_scene_to_file("res://scenes/main.tscn")

func set_area(area_id: int) -> void:
	if current_area == area_id:
		return
	current_area = clampi(area_id, 1, 30)
	var info: Dictionary = AREAS.get(current_area, AREAS[1])
	emit_signal("area_changed", current_area, info["title"], info["subtitle"])
	SaveManager.save_progress()

func register_checkpoint(cp_id: String, pos: Vector2, area_id: int) -> void:
	active_checkpoint_id = cp_id
	active_checkpoint_pos = pos
	current_area = area_id
	SaveManager.save_progress()

func toggle_pause() -> void:
	if chapter_finished:
		return
	is_paused = not is_paused
	get_tree().paused = is_paused

func apply_quality(level: int) -> void:
	current_quality = clampi(level, QualityLevel.LOW, QualityLevel.HIGH)
	var vp := get_viewport()
	match current_quality:
		QualityLevel.LOW:
			Engine.max_fps = 30
			if vp:
				vp.content_scale_factor = 0.82
		QualityLevel.MEDIUM:
			Engine.max_fps = 30
			if vp:
				vp.content_scale_factor = 1.0
		QualityLevel.HIGH:
			Engine.max_fps = 60
			if vp:
				vp.content_scale_factor = 1.0
	emit_signal("quality_changed", current_quality)

func complete_chapter() -> void:
	if chapter_finished:
		return
	chapter_finished = true
	is_paused = true
	get_tree().paused = true
	ChapterProgression.mark_chapter_completed(current_chapter)
	emit_signal("chapter_completed")

func request_cinematic_focus(world_pos: Vector2, target_zoom: float, duration: float, use_letterbox: bool = true) -> void:
	emit_signal("cinematic_focus_requested", world_pos, target_zoom, duration, use_letterbox)
