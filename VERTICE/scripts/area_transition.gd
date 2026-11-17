extends Area2D
class_name AreaTransition

@export var area_id: int = 1

func _ready() -> void:
	body_entered.connect(_on_body_entered)

func _on_body_entered(body: Node) -> void:
	if body is PlayerController:
		GameManager.set_area(area_id)
