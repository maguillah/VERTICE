extends Node2D
class_name Chapter2ThresholdController

# Controlador completo do Capítulo II: A Convergência (5 áreas 2D interligadas)
func _ready() -> void:
	GameManager.in_chapter_2 = true
	GameManager.chapter_finished = false
	ResonanceSystem.unlocked_echo = true
	ResonanceSystem.unlocked_ruptura = true
	if GameManager.current_area < 6:
		GameManager.set_area(6)
