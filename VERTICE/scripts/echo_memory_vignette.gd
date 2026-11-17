extends Area2D
class_name EchoMemoryVignette

# Narrativa ambiental não verbal: silhueta fantasmagórica 2D visível somente no estado ECO
@export var memory_id: String = "mem_1"
@export var pose_kind: int = 0 # 0 = observador em pé, 1 = figura ajoelhada, 2 = dois ecos unidos

var _t: float = 0.0
var _discovered: bool = false
var _figure_poly: Polygon2D

func _ready() -> void:
	body_entered.connect(_on_body_entered)
	_discovered = ChapterProgression.discovered_memories.has(memory_id)
	_figure_poly = Polygon2D.new()
	_figure_poly.color = Color(0.95, 0.72, 0.36, 0.0)
	if pose_kind == 1:
		_figure_poly.polygon = PackedVector2Array([
			Vector2(-7, 0), Vector2(9, 0), Vector2(6, -18),
			Vector2(2, -32), Vector2(-4, -30), Vector2(-8, -14)
		])
	elif pose_kind == 2:
		_figure_poly.polygon = PackedVector2Array([
			Vector2(-12, 0), Vector2(12, 0), Vector2(10, -40),
			Vector2(4, -52), Vector2(-4, -48), Vector2(-10, -36)
		])
	else:
		_figure_poly.polygon = PackedVector2Array([
			Vector2(-6, 0), Vector2(6, 0), Vector2(5, -42),
			Vector2(0, -54), Vector2(-5, -42)
		])
	add_child(_figure_poly)
	ResonanceSystem.state_changed.connect(_on_state_changed)
	_refresh_visibility(ResonanceSystem.current_state)

func _process(delta: float) -> void:
	_t += delta
	if _figure_poly and ResonanceSystem.current_state == ResonanceSystem.State.ECO:
		_figure_poly.position.y = sin(_t * 2.2) * 2.0
	queue_redraw()

func _draw() -> void:
	if ResonanceSystem.current_state != ResonanceSystem.State.ECO:
		return
	var alpha := 0.38 if _discovered else 0.62
	for k in range(3):
		var my := -fmod(_t * 18.0 + float(k) * 21.0, 52.0)
		var mx := sin(_t * 2.6 + float(k) * 2.0) * 9.0
		draw_circle(Vector2(mx, my), 1.6, Color(1.0, 0.82, 0.52, alpha))

func _on_state_changed(new_state: int, _prev: int) -> void:
	_refresh_visibility(new_state)

func _refresh_visibility(state_id: int) -> void:
	if _figure_poly:
		var is_echo := state_id == ResonanceSystem.State.ECO
		_figure_poly.color.a = (0.42 if _discovered else 0.72) if is_echo else 0.05
		set_process(is_echo)
		queue_redraw()

func _on_body_entered(body: Node) -> void:
	if body is PlayerController and not _discovered and ResonanceSystem.current_state == ResonanceSystem.State.ECO:
		_discovered = true
		ChapterProgression.register_memory(memory_id)
		_refresh_visibility(ResonanceSystem.current_state)
		AudioManager.play_sfx("echo", 1.15)
