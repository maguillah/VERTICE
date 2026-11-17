extends Node2D
class_name ChapterBuilder

# Construtor modular 2D para os Capítulos III, IV, V e VI no Godot 4.3
@export var chapter_id: int = 3

const RESONANCE_NODE_SCENE := preload("res://scenes/resonance_node.tscn")
const CHECKPOINT_SCENE := preload("res://scenes/checkpoint.tscn")
const SPATIAL_GATE_SCENE := preload("res://scenes/spatial_gate.tscn")
const ECHO_MEMORY_SCENE := preload("res://scenes/echo_memory.tscn")

func _ready() -> void:
	GameManager.current_chapter = chapter_id
	GameManager.in_chapter_2 = false
	GameManager.chapter_finished = false
	ResonanceSystem.unlocked_echo = true
	ResonanceSystem.unlocked_ruptura = true
	AudioManager.set_chapter_mood(chapter_id)
	var min_area := (chapter_id - 1) * 5 + 1
	if GameManager.current_area < min_area or GameManager.current_area > min_area + 4:
		GameManager.set_area(min_area)
	_build_chapter_geometry()

func _add_platform(pos: Vector2, sz: Vector2, mode: int = ResonanceObject.Mode.ALWAYS_SOLID, move_off: Vector2 = Vector2.ZERO, period: float = 0.0, metal: bool = false, wet: bool = true) -> void:
	var body := ResonanceObject.new()
	body.object_mode = mode
	body.size = sz
	body.move_offset = move_off
	body.move_period = period
	body.use_oxidized_metal = metal
	body.use_wet_concrete = wet and not metal
	body.position = pos
	var col := CollisionShape2D.new()
	col.name = "CollisionShape2D"
	var rect := RectangleShape2D.new()
	rect.size = sz
	col.shape = rect
	body.add_child(col)
	add_child(body)

func _add_area_trigger(x: float, area_id: int) -> void:
	var trig := AreaTransition.new()
	trig.area_id = area_id
	trig.collision_layer = 4
	trig.collision_mask = 2
	trig.position = Vector2(x, 320.0)
	var col := CollisionShape2D.new()
	var rect := RectangleShape2D.new()
	rect.size = Vector2(60.0, 520.0)
	col.shape = rect
	trig.add_child(col)
	add_child(trig)

func _add_checkpoint(cp_id: String, pos: Vector2, area_id: int) -> void:
	var cp := CHECKPOINT_SCENE.instantiate()
	cp.position = pos
	cp.set("checkpoint_id", cp_id)
	cp.set("area_id", area_id)
	add_child(cp)

func _add_node(pos: Vector2, sw_type: int, aid: String = "") -> void:
	var n := RESONANCE_NODE_SCENE.instantiate()
	n.position = pos
	n.set("switch_type", sw_type)
	if not aid.is_empty():
		n.set("anchor_id", aid)
	add_child(n)

func _add_gate(pos: Vector2, req_freq: bool = false, perm: bool = true) -> void:
	var g := SPATIAL_GATE_SCENE.instantiate()
	g.position = pos
	g.set("requires_frequency_switch", req_freq)
	g.set("permanent_when_puzzle_solved", perm)
	add_child(g)

func _add_memory(pos: Vector2, mem_id: String, pose: int = 0) -> void:
	var m := ECHO_MEMORY_SCENE.instantiate()
	m.position = pos
	m.set("memory_id", mem_id)
	m.set("pose_kind", pose)
	add_child(m)

func _add_climb(pos: Vector2, h: float, is_rope: bool = true) -> void:
	var c := ClimbZone.new()
	c.position = pos
	c.zone_height = h
	c.is_rope = is_rope
	add_child(c)

func _add_push_block(pos: Vector2) -> void:
	var b := PushBlock.new()
	b.position = pos
	add_child(b)

func _add_hazard(pos: Vector2, w: float, surge: bool = false) -> void:
	var h := HazardZone.new()
	h.position = pos
	h.hazard_size = Vector2(w, 22.0)
	h.is_ruptura_surge = surge
	add_child(h)

func _add_creature(pos: Vector2, kind: int, min_x: float, max_x: float, spd: float = 55.0) -> void:
	var cr := CreatureEntity.new()
	cr.position = pos
	cr.kind = kind
	cr.patrol_min_x = min_x
	cr.patrol_max_x = max_x
	cr.base_speed = spd
	add_child(cr)

func _add_vegetation(pos: Vector2, w: float = 84.0) -> void:
	var veg := VegetationCluster.new()
	veg.position = pos
	veg.width = w
	add_child(veg)

func _build_chapter_geometry() -> void:
	var base_area := (chapter_id - 1) * 5 + 1
	var pfx := "c%d" % chapter_id

	# Área 1 — Entrada, vegetação viva e caixa empilhável para subir
	_add_platform(Vector2(280, 440), Vector2(560, 56), ResonanceObject.Mode.ALWAYS_SOLID, Vector2.ZERO, 0.0, chapter_id == 5, true)
	_add_checkpoint("cp_%s_area_1" % pfx, Vector2(160, 412), base_area)
	_add_vegetation(Vector2(230, 412), 110.0)
	_add_push_block(Vector2(360, 412))
	_add_platform(Vector2(690, 392), Vector2(210, 40), ResonanceObject.Mode.ALWAYS_SOLID, Vector2.ZERO, 0.0, true, false)
	_add_platform(Vector2(980, 360), Vector2(180, 26), ResonanceObject.Mode.ECHO_ONLY)
	_add_memory(Vector2(980, 347), "mem_%s_1" % pfx, 0)

	# Área 2 — Elevador cíclico + Guardião / Espectro
	_add_area_trigger(1160, base_area + 1)
	_add_platform(Vector2(1420, 405), Vector2(480, 52), ResonanceObject.Mode.ALWAYS_SOLID)
	_add_checkpoint("cp_%s_area_2" % pfx, Vector2(1240, 379), base_area + 1)
	_add_vegetation(Vector2(1310, 379), 90.0)
	_add_creature(Vector2(1480, 379), CreatureEntity.Kind.HOLLOW_WARDEN if chapter_id != 4 else CreatureEntity.Kind.ARCHIVE_STALKER, 1340, 1610, 52.0 + float(chapter_id) * 4.0)
	_add_platform(Vector2(1800, 375), Vector2(140, 24), ResonanceObject.Mode.ALWAYS_SOLID, Vector2(0, -110), 4.6, true, false)
	_add_platform(Vector2(2120, 290), Vector2(280, 38), ResonanceObject.Mode.ALWAYS_SOLID)
	_add_node(Vector2(2160, 271), ResonanceSwitch.SwitchType.PUZZLE_ANCHOR, "%s_anchor_1" % pfx)

	# Área 3 — Escalada vertical + perigos + Memória Eco
	_add_area_trigger(2360, base_area + 2)
	_add_platform(Vector2(2680, 410), Vector2(540, 52), ResonanceObject.Mode.ALWAYS_SOLID)
	_add_checkpoint("cp_%s_area_3" % pfx, Vector2(2460, 384), base_area + 2)
	_add_hazard(Vector2(2650, 384), 86.0, chapter_id >= 4)
	_add_climb(Vector2(2860, 384), 175.0, chapter_id % 2 == 1)
	_add_platform(Vector2(2980, 230), Vector2(260, 34), ResonanceObject.Mode.ALWAYS_SOLID)
	_add_memory(Vector2(2980, 213), "mem_%s_2" % pfx, 1)
	_add_platform(Vector2(3280, 340), Vector2(190, 28), ResonanceObject.Mode.ECHO_ONLY)
	_add_creature(Vector2(3280, 300), CreatureEntity.Kind.VEIL_WISP, 3190, 3380, 58.0)

	# Área 4 — Sifão de Ruptura, Âncoras 2 e 3 + Interruptor de Frequência
	_add_area_trigger(3520, base_area + 3)
	_add_platform(Vector2(3470, 366), Vector2(140, 26), ResonanceObject.Mode.ALWAYS_SOLID)
	_add_platform(Vector2(4000, 400), Vector2(880, 52), ResonanceObject.Mode.ALWAYS_SOLID)
	_add_checkpoint("cp_%s_area_4" % pfx, Vector2(3620, 374), base_area + 3)
	_add_vegetation(Vector2(3710, 374), 95.0)
	_add_node(Vector2(3820, 374), ResonanceSwitch.SwitchType.PUZZLE_ANCHOR, "%s_anchor_2" % pfx)
	_add_platform(Vector2(4050, 300), Vector2(150, 24), ResonanceObject.Mode.RUPTURA_SHIFT, Vector2.ZERO, 0.0, true, false)
	_add_memory(Vector2(4050, 288), "mem_%s_3" % pfx, 2)
	_add_node(Vector2(4220, 374), ResonanceSwitch.SwitchType.FREQUENCY_SWITCH)
	_add_gate(Vector2(4390, 374), true, false)
	_add_platform(Vector2(4760, 390), Vector2(480, 50), ResonanceObject.Mode.ALWAYS_SOLID)
	_add_creature(Vector2(4740, 365), CreatureEntity.Kind.ARCHIVE_STALKER, 4610, 4920, 66.0)
	_add_node(Vector2(4910, 365), ResonanceSwitch.SwitchType.PUZZLE_ANCHOR, "%s_anchor_3" % pfx)

	# Área 5 — Portão Harmônico e Limiar do Capítulo
	_add_platform(Vector2(5065, 378), Vector2(120, 28), ResonanceObject.Mode.ALWAYS_SOLID)
	_add_area_trigger(5120, base_area + 4)
	_add_platform(Vector2(5560, 390), Vector2(820, 56), ResonanceObject.Mode.ALWAYS_SOLID)
	_add_checkpoint("cp_%s_area_5" % pfx, Vector2(5240, 362), base_area + 4)
	_add_vegetation(Vector2(5340, 362), 120.0)
	_add_gate(Vector2(5520, 362), false, true)
	_add_memory(Vector2(5660, 362), "mem_%s_4" % pfx, 2)
	_add_node(Vector2(5860, 362), ResonanceSwitch.SwitchType.CHAPTER_THRESHOLD)
