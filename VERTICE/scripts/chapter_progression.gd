extends Node

# Progressão completa entre Capítulos I a VI
signal memory_unlocked(memory_id: String, total_found: int)

const CHAPTER_SCENES := {
	1: "res://scenes/world_chapter_1.tscn",
	2: "res://scenes/world_chapter_2_threshold.tscn",
	3: "res://scenes/world_chapter_3_city.tscn",
	4: "res://scenes/world_chapter_4_abyss.tscn",
	5: "res://scenes/world_chapter_5_convergence.tscn",
	6: "res://scenes/world_chapter_6_threshold.tscn"
}

const CHAPTER_MEMORIES_TOTAL := {
	1: 4,
	2: 5,
	3: 4,
	4: 4,
	5: 4,
	6: 4
}

const CHAPTER_TITLES := {
	1: {"roman": "I", "title": "O Despertar", "subtitle": "Ruínas do Subsolo"},
	2: {"roman": "II", "title": "O Chamado", "subtitle": "Torres Invertidas"},
	3: {"roman": "III", "title": "A Cidade Esquecida", "subtitle": "Arcos Submersos"},
	4: {"roman": "IV", "title": "O Abismo das Memórias", "subtitle": "Ecos Profundos"},
	5: {"roman": "V", "title": "A Convergência", "subtitle": "O Núcleo Industrial"},
	6: {"roman": "VI", "title": "O Limiar da Existência", "subtitle": "O Vértice Final"}
}

var unlocked_chapter: int = 1
var completed_chapters: Array[int] = []
var discovered_memories: PackedStringArray = PackedStringArray()

# Aliases de compatibilidade com scripts legados
const CHAPTER_I_SCENE := "res://scenes/world_chapter_1.tscn"
const CHAPTER_II_SCENE := "res://scenes/world_chapter_2_threshold.tscn"
var chapter_1_completed: bool = false
var chapter_2_completed: bool = false

func _ready() -> void:
	load_from_save(SaveManager.data)

func get_scene_path(chapter_num: int) -> String:
	return str(CHAPTER_SCENES.get(clampi(chapter_num, 1, 6), CHAPTER_SCENES[1]))

func _memory_belongs_to_chapter(mem_id: String, chapter_num: int) -> bool:
	if chapter_num == 1:
		return not mem_id.begins_with("mem_c")
	return mem_id.begins_with("mem_c%d_" % chapter_num)

func register_memory(memory_id: String) -> void:
	if memory_id.is_empty() or discovered_memories.has(memory_id):
		return
	discovered_memories.append(memory_id)
	emit_signal("memory_unlocked", memory_id, get_chapter_memory_count(GameManager.current_chapter))
	SaveManager.save_progress()

func get_chapter_memory_count(chapter_or_c2) -> int:
	var chap := 2 if (typeof(chapter_or_c2) == TYPE_BOOL and chapter_or_c2) else (1 if typeof(chapter_or_c2) == TYPE_BOOL else int(chapter_or_c2))
	var c := 0
	for m in discovered_memories:
		if _memory_belongs_to_chapter(m, chap):
			c += 1
	return c

func get_chapter_memory_total(chapter_or_c2) -> int:
	var chap := 2 if (typeof(chapter_or_c2) == TYPE_BOOL and chapter_or_c2) else (1 if typeof(chapter_or_c2) == TYPE_BOOL else int(chapter_or_c2))
	return int(CHAPTER_MEMORIES_TOTAL.get(chap, 4))

func mark_chapter_completed(chapter_num: int) -> void:
	var chap := clampi(chapter_num, 1, 6)
	if not completed_chapters.has(chap):
		completed_chapters.append(chap)
	if chap == 1:
		chapter_1_completed = true
	elif chap == 2:
		chapter_2_completed = true
	if chap < 6:
		unlocked_chapter = maxi(unlocked_chapter, chap + 1)
	SaveManager.save_progress()

func mark_chapter_1_completed() -> void:
	mark_chapter_completed(1)

func mark_chapter_2_completed() -> void:
	mark_chapter_completed(2)

func is_chapter_unlocked(chapter_num: int) -> bool:
	return chapter_num <= unlocked_chapter

func reset_progression() -> void:
	unlocked_chapter = 1
	completed_chapters.clear()
	chapter_1_completed = false
	chapter_2_completed = false
	discovered_memories.clear()

func load_from_save(data: Dictionary) -> void:
	chapter_1_completed = bool(data.get("chapter_1_completed", false))
	chapter_2_completed = bool(data.get("chapter_2_completed", false))
	unlocked_chapter = clampi(int(data.get("unlocked_chapter", 2 if chapter_1_completed else 1)), 1, 6)

	completed_chapters.clear()
	var comp = data.get("completed_chapters", [])
	if typeof(comp) == TYPE_ARRAY:
		for item in comp:
			var cid := clampi(int(item), 1, 6)
			if not completed_chapters.has(cid):
				completed_chapters.append(cid)
	if chapter_1_completed and not completed_chapters.has(1):
		completed_chapters.append(1)
	if chapter_2_completed and not completed_chapters.has(2):
		completed_chapters.append(2)

	var arr = data.get("discovered_memories", [])
	discovered_memories.clear()
	if typeof(arr) == TYPE_ARRAY:
		for item in arr:
			var s := str(item)
			if not s.is_empty() and not discovered_memories.has(s):
				discovered_memories.append(s)

func serialize() -> Dictionary:
	var mem_arr: Array[String] = []
	for m in discovered_memories:
		mem_arr.append(m)
	var comp_arr: Array[int] = []
	for c in completed_chapters:
		comp_arr.append(c)
	return {
		"unlocked_chapter": unlocked_chapter,
		"completed_chapters": comp_arr,
		"chapter_1_completed": chapter_1_completed,
		"chapter_2_completed": chapter_2_completed,
		"discovered_memories": mem_arr
	}

func transition_to_chapter_2() -> void:
	GameManager.start_chapter(2)
