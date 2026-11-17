extends Node2D


const FAR := Color("#111923")
const MID := Color("#202d38")
const STONE := Color("#34424c")
const EDGE := Color("#586873")
const GOLD := Color("#b68b54")
const CYAN := Color("#72a9ad")
const DARK := Color("#0b1119")

@export_range(1, 5) var area_id: int = 1

func _draw() -> void:
	_draw_horizon()
	match area_id:
		1:
			_draw_silence()
		2:
			_draw_vestige()
		3:
			_draw_memory()
		4:
			_draw_distortion()
		5:
			_draw_call()
	_draw_ground_details()
	_draw_material_layers()
	_draw_architectural_details()
	_draw_ambient_motes()

func _draw_horizon() -> void:
	for i in range(9):
		var x := float(i) * 190.0 - 80.0
		var h := 150.0 + float((i * 73) % 170)
		var w := 42.0 + float((i * 29) % 55)
		draw_colored_polygon(PackedVector2Array([
			Vector2(x, 570), Vector2(x + 12, 570 - h),
			Vector2(x + w * 0.5, 570 - h - 28),
			Vector2(x + w, 570 - h), Vector2(x + w + 18, 570)
		]), FAR)
		draw_line(Vector2(x + 12, 570 - h),
			Vector2(x + w * 0.5, 570 - h - 28), MID, 2.0)

func _draw_silence() -> void:
	_pillar(250, 600, 70, 310)
	_pillar(625, 600, 58, 270)
	_pillar(1120, 600, 82, 340)
	_pillar(1430, 600, 48, 220)
	_arch(450, 420, 205, 34)
	_arch(1210, 450, 145, 27)
	_ruin(780, 580, 110, 190)
	_draw_waterline(0, 1530, 605)
	_rune_column(275, 440)
	_rune_column(1140, 420)


func _draw_vestige() -> void:
	for i in range(7):
		var x := 100.0 + i * 205.0
		_draw_beam(x, 170, x - 70, 590, 12.0, Color("#35434b"))
		_draw_beam(x + 15, 170, x + 90, 590, 8.0, Color("#273640"))
		_draw_beam(x - 70, 320, x + 90, 320, 17.0, Color("#52616a"))
		draw_line(Vector2(x - 70, 313), Vector2(x + 90, 313),
			Color("#a9b4b1", 0.7), 2.0)
		draw_circle(Vector2(x, 320), 8.0, Color("#101820"))
		draw_circle(Vector2(x, 320), 4.0, Color("#b68b54"))
		_draw_cable(x - 70, 320, x - 115, 480)
		_draw_cable(x + 90, 320, x + 130, 490)

	_pillar(380, 590, 90, 260)
	_pillar(1180, 590, 110, 330)
	_gear(760, 285, 54)


func _draw_memory() -> void:
	for i in range(6):
		var x := 130.0 + i * 235.0
		var y := 205.0 + float((i % 3) * 55)

		var front := PackedVector2Array([
			Vector2(x - 70, y + 120),
			Vector2(x - 45, y - 20),
			Vector2(x, y - 65),
			Vector2(x + 48, y - 20),
			Vector2(x + 70, y + 120)
		])

		var side := PackedVector2Array([
			Vector2(x + 48, y - 20),
			Vector2(x + 70, y + 120),
			Vector2(x + 84, y + 128),
			Vector2(x + 62, y - 13)
		])

		# Sombra e corpo da estrutura.
		draw_colored_polygon(front, Color("#293944"))
		draw_colored_polygon(side, Color("#111d26"))
		draw_colored_polygon(PackedVector2Array([
			Vector2(x - 45, y - 20), Vector2(x, y - 65),
			Vector2(x + 48, y - 20), Vector2(x + 40, y - 9),
			Vector2(x, y - 48), Vector2(x - 36, y - 9)
		]), Color("#687a80"))

		# Moldura interna profunda.
		draw_polyline(PackedVector2Array([
			Vector2(x - 45, y + 90), Vector2(x - 20, y + 20),
			Vector2(x, y - 30), Vector2(x + 25, y + 20),
			Vector2(x + 48, y + 90)
		]), Color("#8b9a9b"), 5.0, true)
		draw_polyline(PackedVector2Array([
			Vector2(x - 35, y + 88), Vector2(x - 14, y + 23),
			Vector2(x, y - 12), Vector2(x + 18, y + 23),
			Vector2(x + 37, y + 88)
		]), Color("#172630"), 3.0, true)

		# Placas, rebites e núcleo de memória.
		draw_line(Vector2(x - 56, y + 108), Vector2(x + 56, y + 108),
			Color("#a0aaa5", 0.55), 3.0)
		draw_circle(Vector2(x, y - 65), 9.0, Color("#101820"))
		draw_circle(Vector2(x, y - 65), 5.0, Color("#72a9ad"))
		draw_line(Vector2(x, y + 120), Vector2(x, 590),
			Color("#718087", 0.7), 3.0)
		draw_line(Vector2(x + 5, y + 125), Vector2(x + 5, 590),
			Color("#111d26"), 3.0)
		_draw_fragments(x, y + 145)

	_arch(750, 390, 115, 22)
	_arch(1280, 410, 155, 25)


func _draw_distortion() -> void:
	for i in range(6):
		var x := 170.0 + i * 245.0
		var offset := float((i % 2) * 65)

		var a := Vector2(x - 60, 590)
		var b := Vector2(x - 30, 230 + offset)
		var c := Vector2(x + 55, 190 + offset)
		var d := Vector2(x + 90, 590)

		# Face principal e lateral, preservando a inclinação original.
		draw_colored_polygon(PackedVector2Array([
			a + Vector2(8, 5), b + Vector2(8, 5),
			c + Vector2(8, 5), d + Vector2(8, 5)
		]), Color("#080e14"))
		draw_colored_polygon(PackedVector2Array([
			b, c, c + Vector2(18, 5), b + Vector2(18, 5)
		]), Color("#718087"))
		draw_colored_polygon(PackedVector2Array([
			a, b, c, d
		]), Color("#344653"))

		# Reforço estrutural e bordas de luz.
		_draw_beam(x - 30, 230 + offset, x - 60, 590,
			8.0, Color("#52636b"))
		_draw_beam(x + 55, 190 + offset, x + 90, 590,
			10.0, Color("#273640"))
		draw_line(b, c, Color("#a6b6b4", 0.8), 3.0)
		draw_line(Vector2(x, 250 + offset),
			Vector2(x + 15, 560), Color("#a0aaa5", 0.55), 3.0)

		# Placas de fixação.
		for yy in [290.0 + offset * 0.25, 390.0 + offset * 0.5,
				490.0 + offset * 0.65]:
			var px := x + 12.0
			draw_rect(Rect2(px - 9, yy - 5, 18, 10), Color("#172630"))
			draw_circle(Vector2(px, yy), 3.0, Color("#b68b54"))

	_draw_broken_ring(480, 340, 115)
	_draw_broken_ring(1120, 300, 150)
	_gear(800, 410, 38)


func _draw_call() -> void:
	_pillar(170, 600, 85, 350)
	_pillar(440, 600, 65, 280)
	_pillar(1310, 600, 95, 390)
	_pillar(1530, 600, 70, 300)
	_arch(760, 430, 265, 48)
	_arch(1160, 420, 185, 32)
	_arch(760, 430, 205, 3)
	_draw_broken_ring(760, 330, 95)
	_draw_rune_field(1160, 320)
	_draw_waterline(0, 1650, 610)

func _draw_ground_details() -> void:
	for i in range(24):
		var x := float(i) * 67.0 + 18.0
		var y := 574.0 + float((i * 13) % 30)
		draw_line(Vector2(x, y), Vector2(x + 18, y - 2), EDGE, 1.4)
		if i % 4 == 0:
			draw_circle(Vector2(x + 28, y - 12), 2.2, GOLD)


func _pillar(x: float, base: float, width: float, height: float) -> void:
	var top := base - height
	var left := x - width * 0.5
	var right := x + width * 0.5

	var front := PackedVector2Array([
		Vector2(left, base), Vector2(left + width * 0.08, top + 18),
		Vector2(x - width * 0.25, top), Vector2(x + width * 0.35, top + 8),
		Vector2(right, base)
	])

	# Sombra projetada e lateral escura.
	draw_colored_polygon(PackedVector2Array([
		Vector2(left + 8, base + 5), Vector2(left + width * 0.08 + 8, top + 23),
		Vector2(x - width * 0.25 + 8, top + 5),
		Vector2(x + width * 0.35 + 8, top + 13), Vector2(right + 8, base + 5)
	]), Color("#080e14"))

	draw_colored_polygon(PackedVector2Array([
		Vector2(x + width * 0.12, top + 3),
		Vector2(x + width * 0.35, top + 8),
		Vector2(right, base), Vector2(x + width * 0.27, base)
	]), Color("#111c25"))

	draw_colored_polygon(front, Color("#344653"))
	draw_colored_polygon(PackedVector2Array([
		Vector2(left, base), Vector2(left + width * 0.08, top + 18),
		Vector2(x - width * 0.25, top), Vector2(x - width * 0.18, base)
	]), Color("#52636b"))

	# Capitel e friso superior.
	draw_colored_polygon(PackedVector2Array([
		Vector2(x - width * 0.32, top + 2),
		Vector2(x + width * 0.35, top + 10),
		Vector2(x + width * 0.42, top + 25),
		Vector2(x - width * 0.38, top + 17)
	]), Color("#718087"))
	draw_line(Vector2(left + 4, top + 20), Vector2(right - 4, top + 27),
		Color("#9aa6a5", 0.65), 2.0)

	# Juntas, sulcos e desgaste da superfície.
	for i in range(1, 5):
		var yy := top + 35.0 + float(i) * (height - 45.0) / 5.0
		draw_line(Vector2(left + 12, yy), Vector2(right - 10, yy + 3),
			Color("#172630", 0.75), 2.0)
		draw_line(Vector2(left + 14, yy + 3), Vector2(right - 12, yy + 6),
			Color("#839096", 0.25), 1.0)

	draw_line(Vector2(x - width * 0.18, top + 30),
		Vector2(x - width * 0.14, base - 15), Color("#a0aaa5", 0.42), 2.0)
	draw_line(Vector2(right - 8, top + 35),
		Vector2(right - 5, base - 12), Color("#080e14", 0.8), 3.0)

	for yy in [top + 48.0, base - 42.0]:
		draw_circle(Vector2(x - width * 0.28, yy), 4.0, Color("#101820"))
		draw_circle(Vector2(x - width * 0.28, yy), 2.0, Color("#a18b69"))



func _arch(x: float, y: float, radius: float, thickness: float) -> void:
	# A sombra deslocada separa o arco do fundo.
	draw_arc(Vector2(x + 5, y + 7), radius, PI, TAU, 64,
		Color("#080e14"), thickness + 18.0, true)
	draw_arc(Vector2(x, y), radius, PI, TAU, 64,
		Color("#182630"), thickness + 12.0, true)
	draw_arc(Vector2(x, y - 2), radius, PI, TAU, 64,
		Color("#52636b"), thickness, true)
	draw_arc(Vector2(x, y - 5), radius, PI, TAU, 64,
		Color("#829096", 0.75), 2.5, true)
	draw_arc(Vector2(x, y + 5), radius - thickness * 0.45,
		PI, TAU, 64, Color("#17232b"), 3.0, true)

	# Pés e placas de ancoragem.
	for side in [-1.0, 1.0]:
		var px := x + radius * side
		draw_line(Vector2(px + 4, y), Vector2(px + 4, 588),
			Color("#080e14"), thickness + 9.0)
		draw_line(Vector2(px, y), Vector2(px, 588),
			Color("#344653"), thickness + 3.0)
		draw_line(Vector2(px - thickness * 0.25, y + 10),
			Vector2(px - thickness * 0.25, 580),
			Color("#879397", 0.55), 2.0)
		draw_rect(Rect2(px - thickness * 0.7, 565,
			thickness * 1.4, 13), Color("#182630"))
		draw_rect(Rect2(px - thickness * 0.7, 565,
			thickness * 1.4, 3), Color("#89969a", 0.7))

	for i in range(1, 8):
		var angle := PI + TAU * 0.5 * float(i) / 8.0
		var pos := Vector2(x, y) + Vector2(cos(angle), sin(angle)) * radius
		draw_circle(pos, 3.5, Color("#101820"))
		draw_circle(pos, 1.7, Color("#b68b54"))

	draw_circle(Vector2(x, y - radius), 5.0, Color("#b68b54"))



func _ruin(x: float, y: float, width: float, height: float) -> void:
	var top := y - height
	draw_colored_polygon(PackedVector2Array([
		Vector2(x - width * 0.5 + 9, y + 5),
		Vector2(x - width * 0.4 + 9, top - 5),
		Vector2(x - 8 + 9, top + 20),
		Vector2(x + 12 + 9, top - 17),
		Vector2(x + width * 0.5 + 9, top + 10),
		Vector2(x + width * 0.5 + 9, y + 5)
	]), Color("#090f15"))

	draw_colored_polygon(PackedVector2Array([
		Vector2(x + 12, top - 17), Vector2(x + width * 0.5, top + 10),
		Vector2(x + width * 0.5, y), Vector2(x + 12, y)
	]), Color("#172630"))

	draw_colored_polygon(PackedVector2Array([
		Vector2(x - width * 0.5, y),
		Vector2(x - width * 0.4, top),
		Vector2(x - 8, top + 25),
		Vector2(x + 12, top - 12),
		Vector2(x + width * 0.5, top + 15),
		Vector2(x + width * 0.5, y)
	]), Color("#52616a"))

	draw_line(Vector2(x - width * 0.4, top + 8),
		Vector2(x + width * 0.5, top + 22), Color("#9aa4a1", 0.55), 3.0)
	draw_polyline(PackedVector2Array([
		Vector2(x - 8, top + 25), Vector2(x - 18, top + 65),
		Vector2(x + 5, top + 95), Vector2(x - 3, top + 130),
		Vector2(x + 12, y - 18)
	]), Color("#18242c"), 3.0, true)
	draw_line(Vector2(x - 6, top + 27), Vector2(x + 1, top + 55),
		Color("#a3aaa2", 0.55), 1.5)


func _rune_column(x: float, y: float) -> void:
	for i in range(4):
		var yy := y + i * 28.0
		draw_line(Vector2(x - 7, yy), Vector2(x + 7, yy + 10), GOLD, 1.5)
		draw_circle(Vector2(x, yy + 16), 2.0, CYAN)

func _draw_waterline(x1: float, x2: float, y: float) -> void:
	for i in range(15):
		var x := x1 + float(i) * ((x2 - x1) / 15.0)
		var length := 25.0 + float((i * 17) % 75)
		draw_line(Vector2(x, y), Vector2(x + length, y), CYAN, 1.0)
		draw_line(Vector2(x + 12, y + 5), Vector2(x + length * 0.65, y + 5), EDGE, 1.0)


func _draw_beam(x1: float, y1: float, x2: float, y2: float,
		thickness: float, material: Color) -> void:
	var a := Vector2(x1, y1)
	var b := Vector2(x2, y2)
	var direction := (b - a).normalized()
	var normal := Vector2(-direction.y, direction.x) * thickness * 0.5
	var offset := Vector2(3, 5)

	draw_colored_polygon(PackedVector2Array([
		a + normal + offset, b + normal + offset,
		b - normal + offset, a - normal + offset
	]), Color("#080e14"))

	draw_colored_polygon(PackedVector2Array([
		a + normal, b + normal, b - normal, a - normal
	]), material)

	draw_line(a + normal * 0.62, b + normal * 0.62,
		Color("#a9b4b1", 0.68), maxf(1.0, thickness * 0.13))
	draw_line(a - normal * 0.72, b - normal * 0.72,
		Color("#101a22", 0.9), maxf(1.0, thickness * 0.16))

	for t in [0.18, 0.82]:
		var pos := a.lerp(b, t)
		draw_circle(pos, thickness * 0.18, Color("#111a20"))
		draw_circle(pos, thickness * 0.09, Color("#b68b54"))


func _draw_cable(x1: float, y1: float, x2: float, y2: float) -> void:
	_draw_beam(x1, y1, x2, y2, 9.0, Color("#35434a"))
	draw_line(Vector2(x1, y1), Vector2(x2, y2),
		Color("#b0aaa0", 0.8), 1.4)



func _gear(x: float, y: float, radius: float) -> void:
	var center := Vector2(x, y)
	var teeth := PackedVector2Array()

	for i in range(16):
		var angle := TAU * float(i) / 16.0
		var radial := Vector2(cos(angle), sin(angle))
		var tangent := Vector2(-radial.y, radial.x)
		var outer := radius + 10.0
		var inner := radius - 2.0
		var half := 5.0
		var c := center + radial * inner
		var d := center + radial * outer
		teeth.append(c - tangent * half)
		teeth.append(d - tangent * half)
		teeth.append(d + tangent * half)
		teeth.append(c + tangent * half)

	draw_circle(center + Vector2(4, 6), radius + 8.0, Color("#080e14"))
	draw_colored_polygon(teeth, Color("#17232b"))
	draw_circle(center, radius, Color("#52616a"))
	draw_arc(center, radius - 3.0, 0, TAU, 64, Color("#9aa4a1"), 3.0)
	draw_arc(center, radius * 0.78, 0, TAU, 64, Color("#182630"), 7.0)
	draw_arc(center, radius * 0.70, 0, TAU, 64, Color("#b68b54"), 2.0)

	draw_circle(center, radius * 0.38, Color("#172630"))
	draw_circle(center, radius * 0.23, Color("#718087"))
	draw_circle(center, radius * 0.12, Color("#101820"))
	draw_circle(center, 4.0, Color("#72a9ad"))

	for i in range(8):
		var angle := TAU * float(i) / 8.0
		var pos := center + Vector2(cos(angle), sin(angle)) * radius * 0.56
		draw_circle(pos, 4.0, Color("#101820"))
		draw_circle(pos, 2.0, Color("#c1a071"))


func _draw_fragments(x: float, y: float) -> void:
	draw_colored_polygon(PackedVector2Array([
		Vector2(x - 28, y), Vector2(x - 8, y - 25),
		Vector2(x + 18, y - 12), Vector2(x + 30, y + 10)
	]), STONE)
	draw_line(Vector2(x - 28, y), Vector2(x + 30, y + 10), EDGE, 2.0)


func _draw_broken_ring(x: float, y: float, radius: float) -> void:
	var center := Vector2(x, y)
	draw_arc(center + Vector2(4, 6), radius, 0.2, 2.2, 48,
		Color("#080e14"), 21.0, true)
	draw_arc(center + Vector2(4, 6), radius, 2.65, 5.5, 48,
		Color("#080e14"), 21.0, true)
	draw_arc(center, radius, 0.2, 2.2, 48,
		Color("#35434b"), 16.0, true)
	draw_arc(center, radius, 2.65, 5.5, 48,
		Color("#35434b"), 16.0, true)
	draw_arc(center + Vector2(0, -3), radius, 0.2, 2.2, 48,
		Color("#9aa4a1", 0.75), 2.0, true)
	draw_arc(center + Vector2(0, -3), radius, 2.65, 5.5, 48,
		Color("#9aa4a1", 0.75), 2.0, true)
	draw_arc(center, radius + 13.0, 0.3, 1.8, 32,
		Color("#b68b54"), 3.0, true)
	draw_circle(center, 11.0, Color("#101820"))
	draw_circle(center, 6.0, Color("#b68b54"))


func _draw_rune_field(x: float, y: float) -> void:
	for i in range(7):
		var angle := TAU * float(i) / 7.0
		var p := Vector2(x, y) + Vector2(cos(angle), sin(angle)) * 65.0
		draw_circle(p, 3.0, GOLD)
		draw_line(Vector2(x, y), p, Color(CYAN, 0.22), 1.0)


# FASE01_MATERIAL_PASS

func _draw_material_layers() -> void:
	# Acabamento localizado. Não aplicar texturas em placas gigantes
	# que escondam as formas originais da arquitetura.
	match area_id:
		1:
			for x in [250.0, 625.0, 1120.0, 1430.0]:
				draw_line(Vector2(x - 20, 565), Vector2(x + 20, 565),
					Color("#9aa4a1", 0.24), 1.5)
		2:
			for x in [180.0, 470.0, 760.0, 1050.0, 1340.0]:
				draw_circle(Vector2(x, 320), 5.0, Color("#101820"))
				draw_circle(Vector2(x, 320), 2.0, Color("#b68b54"))
		3:
			for x in [180.0, 415.0, 650.0, 885.0, 1120.0, 1355.0]:
				draw_line(Vector2(x, 245), Vector2(x, 350),
					Color("#a6b6b4", 0.28), 2.0)
		4:
			for x in [180.0, 385.0, 590.0, 795.0, 1000.0, 1205.0, 1410.0]:
				draw_circle(Vector2(x, 390), 4.0, Color("#101820"))
				draw_circle(Vector2(x, 390), 1.8, Color("#b68b54"))
		5:
			draw_arc(Vector2(850, 345), 82.0, 0.0, TAU, 64,
				Color("#a9b4b1", 0.35), 3.0)


func _draw_ambient_motes() -> void:
	var span := 1500.0
	if area_id == 5:
		span = 1650.0

	for i in range(30):
		var x := fmod(float(i) * 137.0 + float(area_id) * 53.0, span)
		var y := 105.0 + fmod(float(i) * 83.0, 405.0)
		var radius := 1.0 + float(i % 3) * 0.65
		var alpha := 0.12 + float(i % 4) * 0.045
		var tint := Color(CYAN.r, CYAN.g, CYAN.b, alpha)

		if i % 5 == 0:
			tint = Color(GOLD.r, GOLD.g, GOLD.b, alpha)

		draw_circle(Vector2(x, y), radius, tint)

	for i in range(8):
		var x := 95.0 + float(i) * 190.0
		var y := 155.0 + float((i * 47) % 220)
		draw_circle(Vector2(x, y), 5.0,
			Color(CYAN.r, CYAN.g, CYAN.b, 0.055))
		draw_circle(Vector2(x, y), 1.8,
			Color(0.82, 0.96, 0.96, 0.30))


# FASE01_ARCHITECTURE_PASS
func _draw_architectural_details() -> void:
	match area_id:
		1:
			# Ruínas monumentais e frisos de pedra
			for x in [205.0, 300.0, 1240.0, 1335.0]:
				draw_line(Vector2(x, 255), Vector2(x, 555),
					Color(0.65, 0.76, 0.82, 0.30), 3.0)
				draw_line(Vector2(x + 12, 270), Vector2(x + 12, 540),
					Color(0.65, 0.76, 0.82, 0.16), 1.5)
				for y in [300.0, 390.0, 480.0]:
					draw_circle(Vector2(x, y), 3.0,
						Color(0.82, 0.72, 0.52, 0.48))
			for i in range(8):
				var x := 360.0 + float(i) * 90.0
				draw_line(Vector2(x, 535), Vector2(x + 28, 520),
					Color(0.65, 0.76, 0.82, 0.20), 1.5)

		2:
			# Vigas, suportes e rebites industriais
			for y in [270.0, 292.0, 430.0]:
				draw_line(Vector2(140, y), Vector2(1430, y + 12),
					Color(0.55, 0.72, 0.75, 0.28), 4.0)
			for x in [180.0, 470.0, 760.0, 1050.0, 1340.0]:
				draw_line(Vector2(x, 285), Vector2(x + 18, 495),
					Color(0.55, 0.72, 0.75, 0.30), 5.0)
				draw_line(Vector2(x + 9, 300), Vector2(x + 27, 490),
					Color(0.80, 0.85, 0.82, 0.16), 1.5)
				for y in [320.0, 390.0, 460.0]:
					draw_circle(Vector2(x + 8, y), 3.5,
						Color(0.82, 0.66, 0.43, 0.55))
			for i in range(12):
				var x := 230.0 + float(i) * 100.0
				draw_line(Vector2(x, 305), Vector2(x + 35, 330),
					Color(0.55, 0.72, 0.75, 0.20), 1.5)

		3:
			# Molduras de memória e fragmentos suspensos
			for i in range(6):
				var x := 180.0 + float(i) * 235.0
				var y := 245.0 + float(i % 2) * 65.0
				draw_rect(Rect2(x, y, 92, 118), Color(0.52, 0.82, 0.86, 0.26), false, 2.0)
				draw_line(Vector2(x + 12, y + 18),
					Vector2(x + 80, y + 18),
					Color(0.82, 0.88, 0.84, 0.22), 1.5)
				draw_line(Vector2(x + 12, y + 96),
					Vector2(x + 80, y + 96),
					Color(0.82, 0.88, 0.84, 0.22), 1.5)
				draw_circle(Vector2(x + 46, y + 58), 5.0,
					Color(0.48, 0.91, 0.96, 0.38))
			for i in range(9):
				var x := 140.0 + float(i) * 155.0
				draw_line(Vector2(x, 180), Vector2(x - 18, 225),
					Color(0.52, 0.82, 0.86, 0.20), 1.5)

		4:
			# Estruturas deformadas e reforços expostos
			for i in range(7):
				var x := 180.0 + float(i) * 205.0
				var lean := 32.0 if i % 2 == 0 else -24.0
				draw_line(Vector2(x, 210), Vector2(x + lean, 515),
					Color(0.68, 0.72, 0.78, 0.28), 5.0)
				draw_line(Vector2(x + 8, 225),
					Vector2(x + lean + 8, 500),
					Color(0.88, 0.76, 0.61, 0.18), 1.5)
				for y in [290.0, 390.0, 490.0]:
					draw_circle(Vector2(x + lean * 0.5, y), 3.0,
						Color(0.88, 0.76, 0.61, 0.42))
			for y in [250.0, 470.0]:
				draw_line(Vector2(190, y), Vector2(1450, y - 25),
					Color(0.68, 0.72, 0.78, 0.18), 2.0)

		5:
			# Grande portal final, com anéis e inscrições
			for i in range(9):
				var x := 170.0 + float(i) * 180.0
				draw_line(Vector2(x, 250), Vector2(x + 22, 555),
					Color(0.78, 0.75, 0.66, 0.28), 4.0)
				draw_line(Vector2(x + 12, 265), Vector2(x + 34, 540),
					Color(0.90, 0.82, 0.65, 0.16), 1.5)
				draw_circle(Vector2(x + 11, 390), 4.0,
					Color(0.92, 0.72, 0.43, 0.48))
			for i in range(13):
				var x := 220.0 + float(i) * 110.0
				draw_line(Vector2(x, 555), Vector2(x + 18, 535),
					Color(0.90, 0.82, 0.65, 0.24), 2.0)
			draw_arc(Vector2(850, 345), 72.0, 0.0, TAU, 64, Color(0.48, 0.91, 0.96, 0.12), 2.0)
			draw_arc(Vector2(850, 345), 58.0, 0.0, TAU, 64, Color(0.92, 0.72, 0.43, 0.18), 1.5)
