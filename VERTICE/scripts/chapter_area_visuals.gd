extends Node2D

@export_range(1, 5) var area_id: int = 1

const SKY := Color("#26343d")
const STONE_DARK := Color("#303a3d")
const STONE := Color("#68716b")
const STONE_LIGHT := Color("#a09b83")
const STONE_EDGE := Color("#c0b69a")
const METAL_DARK := Color("#25343e")
const METAL := Color("#526875")
const METAL_LIGHT := Color("#9aabb0")
const GOLD := Color("#d5a45d")
const GOLD_DARK := Color("#795638")
const CYAN := Color("#79c3c5")
const GREEN := Color("#657d59")
const GLASS := Color("#75aeb3")
const DARK := Color("#172128")

func _draw() -> void:
	_draw_backdrop()
	match area_id:
		1: _draw_silence()
		2: _draw_vestige()
		3: _draw_memory()
		4: _draw_distortion()
		5: _draw_call()
	_draw_atmosphere()

func _draw_backdrop() -> void:
	draw_rect(Rect2(-300, 0, 2400, 640), Color("#35434a"))
	_box(-180, 120, 420, 390, 38, Color("#46534f"), Color("#29383b"), Color("#65716a"))
	_box(1180, 155, 480, 350, 45, Color("#3c4a4d"), Color("#26353a"), Color("#58666a"))
	draw_rect(Rect2(-300, 510, 2400, 130), Color("#263238"))
	for i in range(12):
		var x := -100.0 + i * 165.0
		draw_line(Vector2(x, 510), Vector2(x + 35, 475), Color(0.72, 0.75, 0.68, 0.22), 3.0)

func _box(x: float, y: float, w: float, h: float, d: float, front: Color, side: Color, top: Color) -> void:
	draw_colored_polygon(PackedVector2Array([
		Vector2(x + w, y), Vector2(x + w + d, y - d * 0.55),
		Vector2(x + w + d, y + h - d * 0.55), Vector2(x + w, y + h)
	]), side)
	draw_colored_polygon(PackedVector2Array([
		Vector2(x, y), Vector2(x + d, y - d * 0.55),
		Vector2(x + w + d, y - d * 0.55), Vector2(x + w, y)
	]), top)
	draw_rect(Rect2(x, y, w, h), front)
	draw_rect(Rect2(x, y, w, h), front.darkened(0.35), false, 3.0)
	draw_line(Vector2(x + 5, y + 5), Vector2(x + w - 5, y + 5), front.lightened(0.24), 2.0)

func _column(x: float, y: float, h: float, width: float, stone: Color) -> void:
	_box(x, y, width, h, 20, stone, stone.darkened(0.45), stone.lightened(0.22))
	draw_rect(Rect2(x - 9, y - 12, width + 18, 18), stone.lightened(0.25))
	draw_rect(Rect2(x - 13, y + h - 8, width + 26, 24), stone.darkened(0.1))
	for k in range(3):
		var yy := y + 35 + k * ((h - 60) / 3.0)
		draw_line(Vector2(x + 8, yy), Vector2(x + width - 8, yy), stone.darkened(0.3), 3.0)

func _arch(x: float, y: float, w: float, h: float, color: Color) -> void:
	_box(x, y + h * 0.35, 32, h * 0.65, 12, color, color.darkened(0.45), color.lightened(0.2))
	_box(x + w - 32, y + h * 0.35, 32, h * 0.65, 12, color, color.darkened(0.45), color.lightened(0.2))
	draw_rect(Rect2(x - 8, y + h * 0.35 - 12, w + 16, 28), color.lightened(0.18))
	draw_colored_polygon(PackedVector2Array([
		Vector2(x + 18, y + h * 0.38), Vector2(x + 18, y + h * 0.23),
		Vector2(x + w * 0.5, y), Vector2(x + w - 18, y + h * 0.23),
		Vector2(x + w - 18, y + h * 0.38)
	]), color)
	draw_colored_polygon(PackedVector2Array([
		Vector2(x + 48, y + h * 0.35), Vector2(x + w * 0.5, y + 34),
		Vector2(x + w - 48, y + h * 0.35)
	]), DARK)

func _window(x: float, y: float, w: float, h: float, glow: Color) -> void:
	draw_rect(Rect2(x - 8, y - 8, w + 16, h + 16), METAL_DARK)
	draw_rect(Rect2(x, y, w, h), Color("#17272d"))
	draw_rect(Rect2(x + 5, y + 5, w - 10, h - 10), glow.darkened(0.38))
	draw_line(Vector2(x + 8, y + 8), Vector2(x + w - 8, y + h - 8), glow.lightened(0.2), 2.0)
	draw_line(Vector2(x + w - 8, y + 8), Vector2(x + 8, y + h - 8), glow.darkened(0.15), 2.0)

func _pipe(points: PackedVector2Array, width: float, color: Color) -> void:
	draw_polyline(points, Color("#18252b"), width + 8, true)
	draw_polyline(points, color.darkened(0.35), width, true)
	draw_polyline(points, color.lightened(0.3), maxf(2.0, width * 0.18), true)
	for p in points:
		draw_circle(p, width * 0.55, METAL_DARK)
		draw_circle(p, width * 0.25, color.lightened(0.3))

func _plant(x: float, y: float, scale: float) -> void:
	draw_line(Vector2(x, y), Vector2(x - 8 * scale, y - 48 * scale), Color("#435b43"), 5 * scale)
	draw_line(Vector2(x, y - 15 * scale), Vector2(x + 23 * scale, y - 38 * scale), GREEN, 4 * scale)
	draw_line(Vector2(x - 3 * scale, y - 25 * scale), Vector2(x - 27 * scale, y - 48 * scale), GREEN, 4 * scale)
	draw_colored_polygon(PackedVector2Array([
		Vector2(x - 8 * scale, y - 48 * scale),
		Vector2(x - 36 * scale, y - 60 * scale),
		Vector2(x - 22 * scale, y - 37 * scale)
	]), Color("#81956a"))
	draw_colored_polygon(PackedVector2Array([
		Vector2(x + 12 * scale, y - 30 * scale),
		Vector2(x + 40 * scale, y - 45 * scale),
		Vector2(x + 23 * scale, y - 20 * scale)
	]), Color("#718b5b"))

func _lamp(x: float, y: float, glow: Color) -> void:
	draw_rect(Rect2(x - 7, y - 5, 14, 24), GOLD_DARK)
	draw_circle(Vector2(x, y - 8), 13, Color(glow.r, glow.g, glow.b, 0.18))
	draw_circle(Vector2(x, y - 8), 6, glow)
	draw_line(Vector2(x, y + 15), Vector2(x, y + 35), GOLD_DARK, 3.0)

func _draw_silence() -> void:
	# Templo antigo parcialmente soterrado
	_box(-80, 185, 370, 340, 42, Color("#777565"), Color("#414b48"), Color("#a29b7d"))
	_box(300, 270, 220, 250, 28, Color("#656d61"), Color("#343f3d"), Color("#8d907b"))
	_arch(470, 115, 310, 400, Color("#777b6b"))
	_column(825, 115, 395, 66, Color("#8b8975"))
	_column(1110, 145, 365, 72, Color("#777d70"))
	_box(1270, 250, 390, 270, 38, Color("#686e62"), Color("#343f3e"), Color("#93927a"))
	_arch(1320, 190, 290, 330, Color("#72796e"))
	for x in [40, 350, 900, 1190, 1640]:
		_box(x, 420, 95, 95, 18, STONE, STONE_DARK, STONE_LIGHT)
		draw_line(Vector2(x + 12, 445), Vector2(x + 78, 445), STONE_EDGE.darkened(0.3), 3)
	_window(585, 255, 55, 105, GOLD)
	_window(1390, 300, 48, 90, GOLD)
	_plant(90, 510, 1.1)
	_plant(250, 510, 0.8)
	_plant(1040, 510, 1.0)
	_plant(1580, 510, 1.2)
	_lamp(520, 400, GOLD)
	_lamp(1455, 405, GOLD)

func _draw_ellipse(center: Vector2, radii: Vector2, color: Color) -> void:
        var points := PackedVector2Array()
        for i in range(40):
                var angle := TAU * float(i) / 40.0
                points.append(center + Vector2(cos(angle) * radii.x, sin(angle) * radii.y))
        draw_colored_polygon(points, color)

func _draw_vestige() -> void:
	# Fábrica abandonada, com caldeiras, tubos e passarelas
	_box(-80, 165, 430, 330, 35, Color("#45565c"), Color("#26383e"), Color("#65767a"))
	_box(400, 110, 370, 390, 38, Color("#354952"), Color("#1e3038"), Color("#60727a"))
	_box(870, 175, 330, 325, 30, Color("#4b5a5d"), Color("#26383d"), Color("#74817d"))
	_box(1250, 130, 440, 370, 42, Color("#3b4b51"), Color("#202f35"), Color("#66757a"))
	# Caldeiras e tanques
	for spec in [[110.0, 285.0, 95.0, 180.0], [690.0, 260.0, 105.0, 220.0], [1320.0, 265.0, 125.0, 215.0]]:
		var x: float = spec[0]
		var y: float = spec[1]
		var w: float = spec[2]
		var h: float = spec[3]
		draw_rect(Rect2(x, y, w, h), METAL_DARK)
		draw_rect(Rect2(x + 9, y + 8, w - 18, h - 16), METAL)
		_draw_ellipse(Vector2(x + w * 0.5, y + 8), Vector2(w * 0.5, 15), METAL_LIGHT)
		_draw_ellipse(Vector2(x + w * 0.5, y + h - 8), Vector2(w * 0.5, 15), METAL_DARK)
		draw_line(Vector2(x + 18, y + 28), Vector2(x + 18, y + h - 25), METAL_LIGHT, 4)
		draw_circle(Vector2(x + w * 0.5, y + h * 0.45), 17, GOLD_DARK)
		draw_circle(Vector2(x + w * 0.5, y + h * 0.45), 9, GOLD)
	# Estrutura metálica e tubulações
	for x in [35, 390, 810, 1215, 1640]:
		_box(x, 90, 26, 420, 12, METAL, METAL_DARK, METAL_LIGHT)
		draw_rect(Rect2(x - 18, 100, 62, 14), METAL_LIGHT)
		draw_rect(Rect2(x - 18, 480, 62, 18), METAL_DARK)
	_pipe(PackedVector2Array([Vector2(x + 13, 165), Vector2(x + 13, 120), Vector2(x + 180, 120), Vector2(x + 180, 215)]), 13, METAL_LIGHT)
	_pipe(PackedVector2Array([Vector2(520, 180), Vector2(520, 145), Vector2(1020, 145), Vector2(1020, 240)]), 10, GOLD_DARK)
	_pipe(PackedVector2Array([Vector2(850, 410), Vector2(850, 350), Vector2(1160, 350), Vector2(1160, 420)]), 15, METAL_LIGHT)
	# Janelas de inspeção e painéis
	_window(465, 230, 75, 90, CYAN)
	_window(950, 235, 65, 100, GOLD)
	_window(1455, 220, 70, 100, CYAN)
	for x in [580, 1110, 1580]:
		draw_rect(Rect2(x, 390, 55, 65), METAL_DARK)
		draw_rect(Rect2(x + 7, 398, 41, 25), Color("#293d43"))
		for k in range(3):
			draw_circle(Vector2(x + 14 + k * 14, 438), 4, GOLD if k == 0 else CYAN)

func _draw_memory() -> void:
	# Câmara de vidro e cristais
	_box(-100, 180, 370, 330, 35, Color("#46565a"), Color("#263b43"), Color("#748b8a"))
	_box(360, 145, 260, 360, 30, Color("#40555d"), Color("#243940"), Color("#718b91"))
	_box(1030, 160, 310, 350, 32, Color("#40555d"), Color("#243940"), Color("#718b91"))
	_arch(610, 95, 490, 420, Color("#66858a"))
	# Grandes janelas de vidro
	for x in [55, 420, 1170, 1480]:
		_window(x, 230, 95, 155, GLASS)
	# Cristais facetados
	for spec in [[300.0, 420.0, 80.0], [720.0, 395.0, 130.0], [960.0, 410.0, 90.0], [1390.0, 420.0, 115.0]]:
		var x: float = spec[0]
		var y: float = spec[1]
		var h: float = spec[2]
		draw_colored_polygon(PackedVector2Array([
			Vector2(x, y), Vector2(x + 18, y - h * 0.65),
			Vector2(x + 48, y - h), Vector2(x + 82, y - h * 0.45),
			Vector2(x + 70, y)
		]), Color("#4e9298"))
		draw_colored_polygon(PackedVector2Array([
			Vector2(x + 48, y - h), Vector2(x + 82, y - h * 0.45),
			Vector2(x + 70, y), Vector2(x + 48, y - h * 0.2)
		]), Color("#a2d2ca", 0.75))
		draw_line(Vector2(x + 48, y - h + 8), Vector2(x + 48, y - 12), Color("#d0f2e7", 0.8), 3)
	# Núcleo dimensional
	draw_circle(Vector2(850, 255), 92, Color(0.25, 0.75, 0.78, 0.12))
	draw_circle(Vector2(850, 255), 62, Color("#285b64"))
	draw_circle(Vector2(850, 255), 43, Color("#77c7c6"))
	draw_circle(Vector2(850, 255), 20, Color("#e2e7c9"))
	for i in range(8):
		var a := TAU * float(i) / 8.0
		var p := Vector2(850, 255) + Vector2(cos(a), sin(a)) * 112.0
		draw_circle(p, 8, GOLD)

func _draw_distortion() -> void:
	# Câmara partida e geometria deslocada
	_box(-90, 170, 330, 330, 42, Color("#5b5b56"), Color("#303d42"), Color("#858071"))
	_box(300, 100, 260, 160, 28, Color("#707268"), Color("#3b4545"), Color("#a39c85"))
	_box(630, 160, 240, 330, 35, Color("#4a5a60"), Color("#26383e"), Color("#77827c"))
	_box(1040, 115, 330, 360, 38, Color("#59615e"), Color("#303d40"), Color("#858678"))
	_box(1450, 210, 290, 290, 35, Color("#4d5959"), Color("#29383c"), Color("#777e76"))
	# Fragmentos suspensos, com faces e arestas
	_box(260, 65, 180, 52, 20, Color("#8a8270"), Color("#4a5050"), Color("#b4a88b"))
	_box(780, 70, 150, 58, 18, Color("#657579"), Color("#34454b"), Color("#9ba8a0"))
	_box(1190, 55, 210, 62, 24, Color("#77766a"), Color("#3b4648"), Color("#aaa28b"))
	# Fendas luminosas
	for x in [150, 510, 920, 1320, 1570]:
		draw_colored_polygon(PackedVector2Array([
			Vector2(x, 490), Vector2(x + 18, 390),
			Vector2(x + 31, 490)
		]), Color(0.35, 0.83, 0.81, 0.55))
		draw_line(Vector2(x + 18, 390), Vector2(x + 18, 490), CYAN, 3)
	# Arcos de contenção
	for x in [600, 1000, 1450]:
		_arch(x, 180, 170, 300, Color("#697c7c"))
		_window(x + 58, 300, 55, 85, CYAN)

func _draw_call() -> void:
	# Grande santuário de chegada e portal monumental
	_box(-100, 210, 360, 320, 42, Color("#777567"), Color("#3b4847"), Color("#a49b7f"))
	_box(280, 280, 270, 250, 32, Color("#666e65"), Color("#344143"), Color("#96947d"))
	_box(1110, 190, 620, 340, 48, Color("#656e66"), Color("#303f40"), Color("#95927c"))
	# Escadaria monumental
	for i in range(6):
		var x := 170.0 + i * 112.0
		var y := 470.0 - i * 25.0
		_box(x, y, 125, 45, 15, Color("#898675"), Color("#414a48"), Color("#b5aa8d"))
	# Portal com batentes espessos
	_box(690, 110, 65, 390, 28, Color("#7d806e"), Color("#424c49"), Color("#b1a78a"))
	_box(1030, 110, 65, 390, 28, Color("#7d806e"), Color("#424c49"), Color("#b1a78a"))
	_box(730, 85, 330, 65, 30, Color("#8d8974"), Color("#48514d"), Color("#c0b18d"))
	# Vão do portal
	draw_rect(Rect2(755, 150, 275, 340), Color("#102a34"))
	draw_rect(Rect2(775, 165, 235, 305), Color("#24515a"))
	draw_rect(Rect2(795, 180, 195, 275), Color("#397d7d"))
	draw_rect(Rect2(815, 195, 155, 245), Color("#70b7a9"))
	draw_rect(Rect2(840, 215, 105, 205), Color("#c1c99b"))
	# Anéis e travessas
	draw_arc(Vector2(892, 320), 145, PI, TAU, 64, GOLD, 9, true)
	draw_arc(Vector2(892, 320), 125, PI, TAU, 64, Color("#d8c28b"), 4, true)
	for x in [720, 1060]:
		draw_circle(Vector2(x, 190), 12, GOLD)
		draw_circle(Vector2(x, 190), 5, Color("#fff0c5"))
	_lamp(675, 410, GOLD)
	_lamp(1110, 410, GOLD)
	_plant(120, 520, 0.9)
	_plant(1510, 520, 1.1)

func _draw_atmosphere() -> void:
	# Pequenos pontos de luz e poeira, sem excesso de partículas
	for i in range(18):
		var x := float((i * 173 + area_id * 97) % 1680)
		var y := float(100 + (i * 71 + area_id * 43) % 340)
		draw_circle(Vector2(x, y), 2.2, Color(0.82, 0.79, 0.65, 0.42))
