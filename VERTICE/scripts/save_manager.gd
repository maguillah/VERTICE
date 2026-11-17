extends Node

const SAVE_PATH := "user://vertice_save.json"

var data: Dictionary = {
	"has_save": false,
	"chapter_number": 1,
	"unlocked_chapter": 1,
	"completed_chapters": [],
	"area_id": 1,
	"checkpoint_id": "cp_area_1",
	"checkpoint_pos": {"x": 160.0, "y": 420.0},
	"unlocked_echo": false,
	"unlocked_ruptura": false,
	"resonance_state": 0,
	"ruptura_energy": 1.0,
	"frequency_switch_active": false,
	"puzzle_anchors": [],
	"puzzle_bridge_locked": false,
	"chapter_1_completed": false,
	"chapter_2_completed": false,
	"discovered_memories": [],
	"master_volume": 0.85,
	"muted": false,
	"touch_sensitivity": 1.0,
	"quality": 1
}

func _ready() -> void:
	load_all()

func has_saved_game() -> bool:
	return bool(data.get("has_save", false))

func load_all() -> void:
	if not FileAccess.file_exists(SAVE_PATH):
		return
	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if file == null:
		return
	var parsed = JSON.parse_string(file.get_as_text())
	if typeof(parsed) == TYPE_DICTIONARY:
		for k in parsed.keys():
			data[k] = parsed[k]

func save_progress() -> void:
	data["has_save"] = true
	data["chapter_number"] = clampi(GameManager.current_chapter, 1, 6)
	data["area_id"] = GameManager.current_area
	data["checkpoint_id"] = GameManager.active_checkpoint_id
	data["checkpoint_pos"] = {
		"x": GameManager.active_checkpoint_pos.x,
		"y": GameManager.active_checkpoint_pos.y
	}
	data["unlocked_echo"] = ResonanceSystem.unlocked_echo
	data["unlocked_ruptura"] = ResonanceSystem.unlocked_ruptura
	data["resonance_state"] = ResonanceSystem.current_state
	data["ruptura_energy"] = ResonanceSystem.ruptura_energy
	data["frequency_switch_active"] = ResonanceSystem.frequency_switch_active
	var active_anchors: Array[String] = []
	for key in ResonanceSystem.puzzle_anchors.keys():
		if ResonanceSystem.puzzle_anchors[key]:
			active_anchors.append(str(key))
	data["puzzle_anchors"] = active_anchors
	data["puzzle_bridge_locked"] = ResonanceSystem.puzzle_bridge_locked
	data["quality"] = GameManager.current_quality
	var chap := ChapterProgression.serialize()
	data["unlocked_chapter"] = chap["unlocked_chapter"]
	data["completed_chapters"] = chap["completed_chapters"]
	data["chapter_1_completed"] = chap["chapter_1_completed"]
	data["chapter_2_completed"] = chap["chapter_2_completed"]
	data["discovered_memories"] = chap["discovered_memories"]
	_write_file()

func save_settings(volume: float, muted: bool, sensitivity: float, quality: int) -> void:
	data["master_volume"] = clampf(volume, 0.0, 1.0)
	data["muted"] = muted
	data["touch_sensitivity"] = clampf(sensitivity, 0.5, 2.0)
	data["quality"] = clampi(quality, 0, 2)
	_write_file()

func reset_progress() -> void:
	data["has_save"] = false
	data["chapter_number"] = 1
	data["unlocked_chapter"] = 1
	data["completed_chapters"] = []
	data["area_id"] = 1
	data["checkpoint_id"] = "cp_area_1"
	data["checkpoint_pos"] = {"x": 160.0, "y": 420.0}
	data["unlocked_echo"] = false
	data["unlocked_ruptura"] = false
	data["resonance_state"] = 0
	data["ruptura_energy"] = 1.0
	data["frequency_switch_active"] = false
	data["puzzle_anchors"] = []
	data["puzzle_bridge_locked"] = false
	data["chapter_1_completed"] = false
	data["chapter_2_completed"] = false
	data["discovered_memories"] = []
	_write_file()

func _write_file() -> void:
	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file == null:
		return
	file.store_string(JSON.stringify(data, "\t"))
