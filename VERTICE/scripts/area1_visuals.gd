extends Node2D

func _ready() -> void:
	queue_redraw()

func _draw() -> void:
	var stone_far := Color("#283847")
	var stone_mid := Color("#3a4b5b")
	var edge := Color("#637887")
	var crack := Color("#84939e")
	var glow := Color("#b68b54")

	# Silhuetas arquitetônicas distantes
	draw_colored_polygon(PackedVector2Array([
		Vector2(0, 570), Vector2(90, 300), Vector2(155, 245),
		Vector2(220, 570)
	]), stone_far)

	draw_colored_polygon(PackedVector2Array([
		Vector2(1280, 570), Vector2(1360, 270),
		Vector2(1440, 220), Vector2(1530, 570)
	]), stone_far)

	# Grande arco monumental
	draw_rect(Rect2(255, 385, 48, 225), stone_mid)
	draw_rect(Rect2(625, 385, 48, 225), stone_mid)
	draw_arc(Vector2(450, 390), 185, PI, TAU, 64, stone_mid, 42.0, true)
	draw_arc(Vector2(450, 390), 185, PI, TAU, 64, edge, 3.0, true)

	# Segundo arco parcialmente destruído
	draw_rect(Rect2(1050, 420, 42, 190), stone_mid)
	draw_rect(Rect2(1330, 420, 42, 190), stone_mid)
	draw_arc(Vector2(1210, 420), 140, PI, TAU, 48, stone_mid, 34.0, true)
	draw_arc(Vector2(1210, 420), 140, PI, TAU, 48, edge, 2.5, true)

	# Marcas e fissuras nas estruturas
	draw_polyline(PackedVector2Array([
		Vector2(275, 470), Vector2(290, 488),
		Vector2(280, 515), Vector2(300, 535)
	]), crack, 2.0, true)

	draw_polyline(PackedVector2Array([
		Vector2(640, 445), Vector2(620, 470),
		Vector2(635, 495)
	]), crack, 2.0, true)

	draw_polyline(PackedVector2Array([
		Vector2(1065, 475), Vector2(1080, 490),
		Vector2(1070, 520)
	]), crack, 2.0, true)

	# Fragmentos e linhas arquitetônicas
	draw_line(Vector2(80, 570), Vector2(210, 570), edge, 3.0)
	draw_line(Vector2(1380, 570), Vector2(1530, 570), edge, 3.0)
	draw_line(Vector2(300, 405), Vector2(300, 590), crack, 1.5)
	draw_line(Vector2(630, 405), Vector2(630, 590), crack, 1.5)

	# Pequenos pontos de luz ambiental
	draw_circle(Vector2(450, 285), 4.0, glow)
	draw_circle(Vector2(1210, 325), 3.0, glow)
	draw_circle(Vector2(180, 505), 2.5, glow)

	# Detalhes sutis na base das ruínas
	for x in range(340, 590, 55):
		draw_line(Vector2(x, 580), Vector2(x + 18, 580), edge, 2.0)

	for x in range(1110, 1320, 50):
		draw_line(Vector2(x, 565), Vector2(x + 14, 565), edge, 2.0)
