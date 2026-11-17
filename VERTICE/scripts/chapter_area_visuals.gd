extends Node2D

@export_range(1, 5) var area_id: int = 1

const FAR := Color("#263746")
const MID := Color("#354b5b")
const STONE := Color("#526574")
const EDGE := Color("#8295a1")
const GOLD := Color("#b68b54")
const CYAN := Color("#72a9ad")
const DARK := Color("#1b2935")

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
		draw_line(Vector2(x, 170), Vector2(x - 70, 590), EDGE, 5.0)
		draw_line(Vector2(x + 15, 170), Vector2(x + 90, 590), MID, 3.0)
		draw_line(Vector2(x - 70, 320), Vector2(x + 90, 320), STONE, 8.0)
		draw_circle(Vector2(x, 320), 7.0, GOLD)
		draw_line(Vector2(x - 70, 320), Vector2(x + 90, 320), EDGE, 1.5)
		_draw_cable(x - 70, 320, x - 115, 480)
		_draw_cable(x + 90, 320, x + 130, 490)
	_pillar(380, 590, 90, 260)
	_pillar(1180, 590, 110, 330)
	_gear(760, 285, 54)

func _draw_memory() -> void:
	for i in range(6):
		var x := 130.0 + i * 235.0
		var y := 205.0 + float((i % 3) * 55)
		draw_colored_polygon(PackedVector2Array([
			Vector2(x - 70, y + 120), Vector2(x - 45, y - 20),
			Vector2(x, y - 65), Vector2(x + 48, y - 20),
			Vector2(x + 70, y + 120)
		]), MID)
		draw_polyline(PackedVector2Array([
			Vector2(x - 45, y + 90), Vector2(x - 20, y + 20),
			Vector2(x, y - 30), Vector2(x + 25, y + 20),
			Vector2(x + 48, y + 90)
		]), EDGE, 2.0, true)
		draw_circle(Vector2(x, y - 65), 5.0, CYAN)
		draw_line(Vector2(x, y + 120), Vector2(x, 590), EDGE, 2.0)
		_draw_fragments(x, y + 145)
	_arch(750, 390, 115, 22)
	_arch(1280, 410, 155, 25)

func _draw_distortion() -> void:
	for i in range(6):
		var x := 170.0 + i * 245.0
		var offset := float((i % 2) * 65)
		draw_colored_polygon(PackedVector2Array([
			Vector2(x - 60, 590), Vector2(x - 30, 230 + offset),
			Vector2(x + 55, 190 + offset), Vector2(x + 90, 590)
		]), MID)
		draw_line(Vector2(x - 30, 230 + offset),
			Vector2(x + 55, 190 + offset), CYAN, 2.0)
		draw_line(Vector2(x, 250 + offset),
			Vector2(x + 15, 560), EDGE, 2.0)
		draw_circle(Vector2(x + 12, 360 + offset), 5.0, GOLD)
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
	draw_colored_polygon(PackedVector2Array([
		Vector2(x - width * 0.5, base),
		Vector2(x - width * 0.42, top + 18),
		Vector2(x - width * 0.25, top),
		Vector2(x + width * 0.35, top + 8),
		Vector2(x + width * 0.5, base)
	]), MID)
	draw_line(Vector2(x - width * 0.25, top),
		Vector2(x - width * 0.18, base), EDGE, 2.0)
	draw_line(Vector2(x + width * 0.35, top + 8),
		Vector2(x + width * 0.5, base), DARK, 3.0)
	draw_line(Vector2(x - width * 0.5, top + 18),
		Vector2(x + width * 0.42, top + 18), EDGE, 3.0)

func _arch(x: float, y: float, radius: float, thickness: float) -> void:
	draw_arc(Vector2(x, y), radius, PI, TAU, 48, MID, thickness, true)
	draw_arc(Vector2(x, y), radius, PI, TAU, 48, EDGE, 2.0, true)
	draw_line(Vector2(x - radius, y), Vector2(x - radius, 590), MID, thickness)
	draw_line(Vector2(x + radius, y), Vector2(x + radius, 590), MID, thickness)
	draw_circle(Vector2(x, y - radius), 4.0, GOLD)

func _ruin(x: float, y: float, width: float, height: float) -> void:
	draw_colored_polygon(PackedVector2Array([
		Vector2(x - width * 0.5, y),
		Vector2(x - width * 0.4, y - height),
		Vector2(x - 8, y - height + 25),
		Vector2(x + 12, y - height - 12),
		Vector2(x + width * 0.5, y - height + 15),
		Vector2(x + width * 0.5, y)
	]), STONE)
	draw_polyline(PackedVector2Array([
		Vector2(x - 8, y - height + 25),
		Vector2(x - 18, y - height + 65),
		Vector2(x + 5, y - height + 95),
		Vector2(x - 3, y - height + 130)
	]), EDGE, 2.0, true)

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

func _draw_cable(x1: float, y1: float, x2: float, y2: float) -> void:
	draw_line(Vector2(x1, y1), Vector2(x2, y2), DARK, 4.0)
	draw_line(Vector2(x1, y1), Vector2(x2, y2), EDGE, 1.0)

func _gear(x: float, y: float, radius: float) -> void:
	draw_circle(Vector2(x, y), radius, DARK)
	draw_arc(Vector2(x, y), radius, 0, TAU, 32, EDGE, 5.0)
	draw_arc(Vector2(x, y), radius * 0.68, 0, TAU, 32, GOLD, 2.0)
	draw_circle(Vector2(x, y), radius * 0.22, MID)
	draw_circle(Vector2(x, y), 4.0, CYAN)
	for i in range(8):
		var angle := TAU * float(i) / 8.0
		var a := Vector2(cos(angle), sin(angle))
		draw_line(Vector2(x, y) + a * radius,
			Vector2(x, y) + a * (radius + 12.0), EDGE, 5.0)

func _draw_fragments(x: float, y: float) -> void:
	draw_colored_polygon(PackedVector2Array([
		Vector2(x - 28, y), Vector2(x - 8, y - 25),
		Vector2(x + 18, y - 12), Vector2(x + 30, y + 10)
	]), STONE)
	draw_line(Vector2(x - 28, y), Vector2(x + 30, y + 10), EDGE, 2.0)

func _draw_broken_ring(x: float, y: float, radius: float) -> void:
	draw_arc(Vector2(x, y), radius, 0.2, 2.2, 36, MID, 12.0, true)
	draw_arc(Vector2(x, y), radius, 2.65, 5.5, 36, MID, 12.0, true)
	draw_arc(Vector2(x, y), radius + 13.0, 0.3, 1.8, 24, EDGE, 2.0, true)
	draw_circle(Vector2(x, y), 7.0, GOLD)

func _draw_rune_field(x: float, y: float) -> void:
	for i in range(7):
		var angle := TAU * float(i) / 7.0
		var p := Vector2(x, y) + Vector2(cos(angle), sin(angle)) * 65.0
		draw_circle(p, 3.0, GOLD)
		draw_line(Vector2(x, y), p, Color(CYAN, 0.22), 1.0)


# FASE01_MATERIAL_PASS
func _draw_material_layers() -> void:
	match area_id:
		1:
			draw_texture_rect(TextureFactory2D.tex_wet_concrete,
				Rect2(0, 548, 1530, 64), true,
				Color(1.0, 1.0, 1.0, 0.20))
			draw_texture_rect(TextureFactory2D.tex_carved_stone,
				Rect2(205, 270, 95, 310), true,
				Color(0.85, 0.91, 1.0, 0.19))
			draw_texture_rect(TextureFactory2D.tex_core_glow,
				Rect2(1035, 365, 90, 90), false,
				Color(1.0, 0.78, 0.48, 0.16))
		2:
			draw_texture_rect(TextureFactory2D.tex_oxidized_metal,
				Rect2(120, 270, 1330, 235), true,
				Color(0.82, 0.94, 0.96, 0.20))
			draw_texture_rect(TextureFactory2D.tex_concrete,
				Rect2(180, 450, 1260, 100), true,
				Color(0.85, 0.90, 0.94, 0.17))
		3:
			draw_texture_rect(TextureFactory2D.tex_carved_stone,
				Rect2(100, 210, 1380, 310), true,
				Color(0.83, 0.91, 1.0, 0.17))
			draw_texture_rect(TextureFactory2D.tex_core_glow,
				Rect2(760, 280, 120, 120), false,
				Color(0.48, 0.91, 0.96, 0.17))
		4:
			draw_texture_rect(TextureFactory2D.tex_oxidized_metal,
				Rect2(180, 205, 1330, 300), true,
				Color(0.88, 0.91, 0.96, 0.19))
			draw_texture_rect(TextureFactory2D.tex_concrete,
				Rect2(220, 450, 1280, 90), true,
				Color(0.88, 0.84, 0.78, 0.17))
		5:
			draw_texture_rect(TextureFactory2D.tex_carved_stone,
				Rect2(80, 230, 1600, 350), true,
				Color(0.91, 0.88, 0.81, 0.18))
			draw_texture_rect(TextureFactory2D.tex_wet_concrete,
				Rect2(180, 570, 1500, 55), true,
				Color(0.79, 0.91, 0.96, 0.22))


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
