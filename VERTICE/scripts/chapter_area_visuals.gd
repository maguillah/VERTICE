extends Node2D

@export_range(1, 5) var area_id: int = 1

const FAR := Color("#111923")
const MID := Color("#202d38")
const STONE := Color("#34424c")
const EDGE := Color("#586873")
const GOLD := Color("#b68b54")
const CYAN := Color("#72a9ad")
const DARK := Color("#0b1119")

var _animation_time: float = 0.0
var _redraw_accumulator: float = 0.0

func _process(delta: float) -> void:
    if not is_visible_in_tree():
        return

    _animation_time += delta
    _redraw_accumulator += delta

    if _redraw_accumulator >= 1.0 / 20.0:
        _redraw_accumulator = 0.0
        queue_redraw()

func _draw() -> void:
	_draw_horizon()
	_draw_contact_shadows()
    _draw_environment_lighting()
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



func _draw_contact_shadow(center: Vector2, radius_x: float, radius_y: float, alpha: float) -> void:
    var points := PackedVector2Array()
    for i in range(25):
        var angle := TAU * float(i) / 24.0
        points.append(center + Vector2(cos(angle) * radius_x, sin(angle) * radius_y))
    draw_colored_polygon(points, Color(0.012, 0.020, 0.028, alpha))


func _draw_contact_shadows() -> void:
    match area_id:
        1:
            _draw_contact_shadow(Vector2(250, 592), 62, 12, 0.48)
            _draw_contact_shadow(Vector2(625, 592), 52, 10, 0.45)
            _draw_contact_shadow(Vector2(1120, 592), 73, 13, 0.50)
            _draw_contact_shadow(Vector2(1430, 592), 44, 9, 0.42)
            _draw_contact_shadow(Vector2(780, 586), 88, 15, 0.55)
        2:
            _draw_contact_shadow(Vector2(380, 590), 90, 14, 0.48)
            _draw_contact_shadow(Vector2(1180, 590), 110, 16, 0.52)
            _draw_contact_shadow(Vector2(760, 340), 68, 12, 0.30)
        3:
            for i in range(6):
                var x := 130.0 + float(i) * 235.0
                _draw_contact_shadow(Vector2(x, 580), 66, 13, 0.46)
        4:
            for i in range(6):
                var x := 170.0 + float(i) * 245.0
                _draw_contact_shadow(Vector2(x + 15.0, 585), 58, 12, 0.48)
        5:
            _draw_contact_shadow(Vector2(170, 592), 76, 14, 0.50)
            _draw_contact_shadow(Vector2(440, 592), 58, 12, 0.45)
            _draw_contact_shadow(Vector2(1310, 592), 85, 15, 0.52)
            _draw_contact_shadow(Vector2(1530, 592), 64, 13, 0.48)
            _draw_contact_shadow(Vector2(760, 590), 145, 16, 0.38)

func _draw_environment_lighting() -> void:
    var center := Vector2(780.0, 430.0)
    var light_color := Color(0.36, 0.66, 0.72)
    var pulse := 0.5 + 0.5 * sin(_animation_time * 0.72)
    var flicker := 1.0

    match area_id:
        1:
            center = Vector2(780.0, 430.0)
            light_color = Color(0.36, 0.66, 0.72)
        2:
            center = Vector2(760.0, 285.0)
            light_color = Color(0.78, 0.57, 0.34)
            pulse = 0.5 + 0.5 * sin(_animation_time * 1.8)
        3:
            center = Vector2(835.0, 350.0)
            light_color = Color(0.48, 0.72, 0.82)
            pulse = 0.5 + 0.5 * sin(_animation_time * 0.95)
        4:
            center = Vector2(800.0, 410.0)
            light_color = Color(0.32, 0.78, 0.79)
            pulse = 0.5 + 0.5 * sin(_animation_time * 2.6)
            flicker = 0.82 + 0.18 * sin(_animation_time * 13.0)
        5:
            center = Vector2(760.0, 330.0)
            light_color = Color(0.78, 0.67, 0.48)
            pulse = 0.5 + 0.5 * sin(_animation_time * 1.25)

    var strength := (0.72 + pulse * 0.28) * flicker
    var beam := PackedVector2Array([
        Vector2(center.x - 24.0, center.y - 360.0),
        Vector2(center.x + 24.0, center.y - 360.0),
        Vector2(center.x + 150.0 + pulse * 18.0, center.y + 150.0),
        Vector2(center.x - 150.0 - pulse * 18.0, center.y + 150.0)
    ])

    draw_colored_polygon(beam, Color(light_color.r, light_color.g, light_color.b, 0.018 * strength))
    draw_circle(center, 190.0 + pulse * 12.0, Color(light_color.r, light_color.g, light_color.b, 0.012 * strength))
    draw_circle(center, 122.0 + pulse * 8.0, Color(light_color.r, light_color.g, light_color.b, 0.018 * strength))
    draw_circle(center, 62.0 + pulse * 5.0, Color(light_color.r, light_color.g, light_color.b, 0.024 * strength))

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
    # Tubulacoes industriais no plano de fundo.
    _draw_pipe(Vector2(75, 118), Vector2(1450, 118), 9.0, Color("#87979a"))
    _draw_pipe(Vector2(75, 151), Vector2(1450, 151), 13.0, Color("#9ba7a2"))

    for i in range(7):
        var x := 100.0 + i * 205.0

        _draw_beam(
            Vector2(x, 170),
            Vector2(x - 70, 590),
            12.0, Color("#aab7b5")
        )
        _draw_beam(
            Vector2(x + 15, 170),
            Vector2(x + 90, 590),
            8.0, Color("#788b91")
        )
        _draw_beam(
            Vector2(x - 70, 320),
            Vector2(x + 90, 320),
            15.0, Color("#9ca9a5")
        )

        draw_circle(Vector2(x, 320), 7.0, GOLD)
        _draw_cable(x - 70, 320, x - 115, 480)
        _draw_cable(x + 90, 320, x + 130, 490)

    _pillar(380, 590, 90, 260)
    _pillar(1180, 590, 110, 330)
    _gear(760, 285, 54, _animation_time * 0.65)
    _draw_steam_leaks()


func _draw_steam_leaks() -> void:
    var leaks := [
        Vector2(520.0, 151.0),
        Vector2(1080.0, 118.0),
        Vector2(1360.0, 151.0)
    ]

    for leak_index in range(leaks.size()):
        var origin: Vector2 = leaks[leak_index]

        for i in range(3):
            var phase := fposmod(
                _animation_time * 0.38 + float(leak_index) * 0.31 + float(i) * 0.23,
                1.0
            )
            var rise := phase * 38.0
            var drift := sin(_animation_time * 1.7 + float(i) * 1.9 + float(leak_index)) * 5.0
            var alpha := sin(phase * PI) * 0.22

            var wisp := PackedVector2Array([
                origin + Vector2(0.0, -rise),
                origin + Vector2(drift * 0.45, -rise - 7.0),
                origin + Vector2(drift, -rise - 15.0),
                origin + Vector2(drift * 0.7 - 2.0, -rise - 23.0)
            ])

            draw_polyline(
                wisp,
                Color(0.72, 0.82, 0.84, alpha),
                2.0,
                true
            )
            draw_circle(
                origin + Vector2(drift, -rise - 15.0),
                1.5,
                Color(0.78, 0.86, 0.87, alpha * 0.65)
            )


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
	_draw_memory_echoes()


func _draw_memory_echoes() -> void:
	for i in range(6):
		var x := 130.0 + float(i) * 235.0
		var y := 205.0 + float((i % 3) * 55)
		var phase := _animation_time * 0.72 + float(i) * 0.91
		var orbit_radius := 34.0 + sin(phase * 0.8) * 7.0
		var center := Vector2(x, y + 25.0)
		var orb := center + Vector2(
			cos(phase) * orbit_radius,
			sin(phase * 1.3) * orbit_radius * 0.65
		)

		draw_arc(
			center, orbit_radius, phase, phase + PI * 1.35,
			28, Color(0.45, 0.82, 0.88, 0.12), 1.3
		)
		draw_line(
			Vector2(x, y - 65.0), orb,
			Color(0.48, 0.82, 0.88, 0.09), 1.0
		)
		draw_circle(
			orb, 7.0 + sin(phase * 2.0) * 1.5,
			Color(0.38, 0.82, 0.91, 0.10)
		)
		draw_circle(
			orb, 2.2,
			Color(0.75, 0.94, 0.95, 0.72)
		)

		for shard in range(3):
			var shard_phase := phase * 0.65 + float(shard) * 2.1
			var shard_center := center + Vector2(
				cos(shard_phase) * (48.0 + shard * 9.0),
				sin(shard_phase * 1.2) * 30.0 - 12.0
			)
			var shard_points := PackedVector2Array([
				shard_center + Vector2(0.0, -5.0),
				shard_center + Vector2(3.5, 0.0),
				shard_center + Vector2(0.0, 5.0),
				shard_center + Vector2(-3.5, 0.0)
			])
			draw_colored_polygon(
				shard_points,
				Color(0.55, 0.85, 0.89, 0.24 + 0.12 * sin(shard_phase))
			)

func _draw_call_pulse() -> void:
	var pulse := 0.5 + 0.5 * sin(_animation_time * 1.35)
	var center := Vector2(760.0, 330.0)
	var rune_center := Vector2(1160.0, 320.0)

	for i in range(3):
		var radius := 75.0 + float(i) * 24.0 + pulse * 9.0
		var alpha := 0.07 + pulse * 0.055 - float(i) * 0.012
		draw_arc(
			center, radius,
			_animation_time * 0.12 + float(i),
			_animation_time * 0.12 + float(i) + TAU * 0.78,
			72, Color(0.48, 0.86, 0.89, alpha), 2.0
		)

	draw_circle(
		center, 35.0 + pulse * 7.0,
		Color(0.40, 0.78, 0.84, 0.035 + pulse * 0.035)
	)

	for i in range(8):
		var angle := TAU * float(i) / 8.0 + _animation_time * 0.16
		var inner := rune_center + Vector2(cos(angle), sin(angle)) * 28.0
		var outer := rune_center + Vector2(cos(angle), sin(angle)) * (43.0 + pulse * 9.0)
		draw_line(
			inner, outer,
			Color(0.72, 0.84, 0.72, 0.12 + pulse * 0.12), 1.5
		)
		draw_circle(
			outer, 2.0 + pulse,
			Color(0.86, 0.77, 0.58, 0.28 + pulse * 0.22)
		)

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
    _draw_distortion_pulse()
    var damaged_rotation := (
        _animation_time * 0.22
        + sin(_animation_time * 4.8) * 0.12
        + sin(_animation_time * 1.35) * 0.07
        + sin(_animation_time * 11.0) * 0.018
    )
    _gear(800, 410, 38, damaged_rotation)



func _draw_distortion_pulse() -> void:
    var pulse := 0.5 + 0.5 * sin(_animation_time * 2.4)
    var center := Vector2(800.0, 410.0)

    draw_circle(center, 84.0 + pulse * 8.0, Color(0.22, 0.67, 0.72, 0.025 + pulse * 0.018))
    draw_circle(center, 64.0 + pulse * 5.0, Color(0.28, 0.78, 0.80, 0.035 + pulse * 0.025))
    draw_circle(center, 47.0 + pulse * 3.0, Color(0.42, 0.85, 0.84, 0.045 + pulse * 0.025))
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
	_draw_call_pulse()

func _draw_ground_details() -> void:
	for i in range(24):
		var x := float(i) * 67.0 + 18.0
		var y := 574.0 + float((i * 13) % 30)
		draw_line(Vector2(x, y), Vector2(x + 18, y - 2), EDGE, 1.4)
		if i % 4 == 0:
			draw_circle(Vector2(x + 28, y - 12), 2.2, GOLD)

func _pillar(x: float, base: float, width: float, height: float) -> void:
    var top := base - height
    var front := PackedVector2Array([
        Vector2(x - width * 0.5, base),
        Vector2(x - width * 0.42, top + 18),
        Vector2(x - width * 0.25, top),
        Vector2(x + width * 0.35, top + 8),
        Vector2(x + width * 0.5, base)
    ])

    var depth := maxf(width * 0.22, 8.0)
    var side := PackedVector2Array([
        front[2], front[3], front[4],
        front[4] + Vector2(depth, 5),
        front[3] + Vector2(depth, 2),
        front[2] + Vector2(depth, 2)
    ])

    draw_colored_polygon(side, Color("#101820"))
    _draw_stone_surface(front, Color("#d0d5d2"))

    var cap := PackedVector2Array([
        front[1], front[2], front[3],
        front[3] + Vector2(depth, -5),
        front[2] + Vector2(depth, -5)
    ])
    draw_colored_polygon(cap, Color("#667680"))

    draw_line(front[2], front[1], Color("#a1aaa7", 0.55), 2.0)
    draw_line(front[3], front[4], Color("#111a20", 0.8), 3.0)
    draw_line(
        Vector2(x - width * 0.5, top + 18),
        Vector2(x + width * 0.42, top + 18),
        Color("#9aa6a5", 0.45), 2.0
    )

    for i in range(1, 4):
        var yy := top + height * float(i) * 0.24
        draw_line(
            Vector2(x - width * 0.34, yy),
            Vector2(x + width * 0.32, yy + 2.0),
            Color("#111a20", 0.42), 1.5
        )
func _arch(x: float, y: float, radius: float, thickness: float) -> void:
    var inner_radius := maxf(radius - thickness, radius * 0.55)
    var depth := maxf(thickness * 0.28, 7.0)

    # Apoios verticais com volume, mantendo os pontos originais.
    _pillar(x - radius, 590.0, thickness, 590.0 - y)
    _pillar(x + radius, 590.0, thickness, 590.0 - y)

    # Anel superior construído em segmentos para acompanhar a curvatura.
    var outer: Array[Vector2] = []
    var inner: Array[Vector2] = []

    for i in range(33):
        var angle := PI + PI * float(i) / 32.0
        outer.append(Vector2(
            x + cos(angle) * radius,
            y + sin(angle) * radius
        ))
        inner.append(Vector2(
            x + cos(angle) * inner_radius,
            y + sin(angle) * inner_radius
        ))

    for i in range(32):
        var front := PackedVector2Array([
            outer[i],
            outer[i + 1],
            inner[i + 1],
            inner[i]
        ])

        var offset := Vector2(depth, depth * 0.45)
        var side := PackedVector2Array([
            outer[i] + offset,
            outer[i + 1] + offset,
            inner[i + 1] + offset,
            inner[i] + offset
        ])

        draw_colored_polygon(side, Color("#101820"))
        _draw_stone_surface(front, Color("#c0c8c5"))

        draw_line(
            outer[i], outer[i + 1],
            Color("#7f8d8d", 0.8), 1.5
        )
        draw_line(
            inner[i], inner[i + 1],
            Color("#172129", 0.9), 2.0
        )

    draw_circle(Vector2(x, y - radius), 4.0, GOLD)
func _ruin(x: float, y: float, width: float, height: float) -> void:
    var front := PackedVector2Array([
        Vector2(x - width * 0.5, y),
        Vector2(x - width * 0.4, y - height),
        Vector2(x - 8, y - height + 25),
        Vector2(x + 12, y - height - 12),
        Vector2(x + width * 0.5, y - height + 15),
        Vector2(x + width * 0.5, y)
    ])

    var offset := Vector2(10.0, 5.0)

    # Faces laterais escuras para revelar a espessura da ruína.
    for i in range(front.size()):
        var next := (i + 1) % front.size()
        var side := PackedVector2Array([
            front[i],
            front[next],
            front[next] + offset,
            front[i] + offset
        ])
        draw_colored_polygon(side, Color("#101820"))

    # Superfície frontal de pedra.
    _draw_stone_surface(front, Color("#c0c8c5"))

    # Bordas quebradas e desgaste.
    draw_line(front[1], front[2], Color("#9aa6a5", 0.65), 2.0)
    draw_line(front[2], front[3], Color("#7f8d8d", 0.75), 2.0)
    draw_line(front[3], front[4], Color("#9aa6a5", 0.55), 2.0)
    draw_line(front[4], front[5], Color("#172129", 0.8), 2.5)

    # Rachadura original preservada.
    draw_polyline(PackedVector2Array([
        Vector2(x - 8, y - height + 25),
        Vector2(x - 18, y - height + 65),
        Vector2(x + 5, y - height + 95),
        Vector2(x - 3, y - height + 130)
    ]), Color("#172129", 0.9), 2.0, true)
func _rune_column(x: float, y: float) -> void:
	for i in range(4):
		var yy := y + i * 28.0
		draw_line(Vector2(x - 7, yy), Vector2(x + 7, yy + 10), GOLD, 1.5)
		draw_circle(Vector2(x, yy + 16), 2.0, CYAN)

func _draw_waterline(x1: float, x2: float, y: float) -> void:
    for i in range(15):
        var progress := float(i) / 15.0
        var x := x1 + progress * (x2 - x1)
        var length := 25.0 + float((i * 17) % 75)
        var wave := sin(_animation_time * 1.8 + float(i) * 0.72) * 2.2
        var secondary_wave := sin(_animation_time * 1.15 + float(i) * 0.43) * 1.2
        var surface_y := y + wave

        draw_line(
            Vector2(x, surface_y),
            Vector2(x + length, surface_y + secondary_wave),
            Color(CYAN, 0.62),
            1.2
        )
        draw_line(
            Vector2(x + 12, surface_y + 5.0),
            Vector2(x + length * 0.65, surface_y + 5.0 + secondary_wave),
            Color(EDGE, 0.55),
            1.0
        )

func _draw_cable(x1: float, y1: float, x2: float, y2: float) -> void:
    var a := Vector2(x1, y1)
    var b := Vector2(x2, y2)
    var direction := b - a

    if direction.length_squared() < 0.01:
        return

    var normal := direction.normalized().orthogonal() * 2.2
    var offset := Vector2(3.0, 4.0)

    var front := PackedVector2Array([
        a + normal, b + normal,
        b - normal, a - normal
    ])

    var side := PackedVector2Array([
        a + normal, b + normal,
        b + normal + offset, a + normal + offset
    ])

    draw_colored_polygon(side, Color("#0b1119"))
    _draw_metal_surface(front, Color("#b5c0bf"))
    draw_line(a - normal * 0.45, b - normal * 0.45,
        Color("#d0d8d5", 0.65), 1.2)

func _draw_pipe(a: Vector2, b: Vector2, radius: float, tint: Color) -> void:
    var direction := b - a
    if direction.length_squared() < 0.01:
        return

    var phase := _animation_time * 2.0 + radius
    var vibration := sin(phase) * 0.75
    var animated_a := a + Vector2(0.0, vibration)
    var animated_b := b + Vector2(0.0, vibration)

    var normal := direction.normalized().orthogonal() * radius
    var depth := Vector2(3.0, radius * 0.65)

    var front := PackedVector2Array([
        animated_a - normal,
        animated_b - normal,
        animated_b + normal,
        animated_a + normal
    ])

    var side := PackedVector2Array([
        animated_a + normal,
        animated_b + normal,
        animated_b + normal + depth,
        animated_a + normal + depth
    ])

    draw_colored_polygon(side, Color("#080e14"))
    _draw_metal_surface(front, tint)

    draw_line(
        animated_a - normal * 0.82,
        animated_b - normal * 0.82,
        Color("#e0e5dc", 0.72),
        2.0
    )
    draw_line(
        animated_a + normal * 0.78,
        animated_b + normal * 0.78,
        Color("#111820", 0.90),
        2.5
    )

    for t in [0.08, 0.92]:
        var center := animated_a.lerp(animated_b, t)
        var band_a := center - normal * 1.12
        var band_b := center + normal * 1.12
        draw_line(band_a, band_b, Color("#252f35"), 6.0)
        draw_line(band_a, band_b, Color("#b68b54", 0.82), 2.0)

    var pulse_t := fposmod(_animation_time * 0.16 + radius * 0.013, 1.0)
    var pulse_center := animated_a.lerp(animated_b, pulse_t)
    var pulse_alpha := 0.20 + (sin(_animation_time * 3.0 + radius) + 1.0) * 0.12

    draw_line(
        pulse_center - normal * 0.72,
        pulse_center + normal * 0.72,
        Color(CYAN.r, CYAN.g, CYAN.b, pulse_alpha),
        3.0
    )
    draw_circle(
        pulse_center,
        radius * 0.30,
        Color(CYAN.r, CYAN.g, CYAN.b, pulse_alpha * 0.35)
    )

    draw_circle(animated_a, radius * 0.72, Color("#26343a"))
    draw_circle(animated_a, radius * 0.43, Color("#101920"))
    draw_circle(animated_b, radius * 0.72, Color("#26343a"))
    draw_circle(animated_b, radius * 0.43, Color("#101920"))


func _draw_beam(a: Vector2, b: Vector2, width: float, tint: Color) -> void:
    var direction := b - a
    if direction.length_squared() < 0.01:
        return

    var normal := direction.normalized().orthogonal() * width * 0.5
    var depth := Vector2(4.0, 5.0)

    var front := PackedVector2Array([
        a + normal,
        b + normal,
        b - normal,
        a - normal
    ])

    var side := PackedVector2Array([
        a + normal,
        b + normal,
        b + normal + depth,
        a + normal + depth
    ])

    draw_colored_polygon(side, Color("#0b1119"))
    _draw_metal_surface(front, tint)

    draw_line(
        a + normal, b + normal,
        Color("#d0d8d5", 0.72), 1.8
    )
    draw_line(
        a - normal, b - normal,
        Color("#111a20", 0.85), 2.0
    )

    draw_circle(a, maxf(width * 0.10, 2.0), Color("#b68b54"))
    draw_circle(b, maxf(width * 0.10, 2.0), Color("#b68b54"))

func _gear(x: float, y: float, radius: float, rotation: float = 0.0) -> void:
    var center := Vector2(x, y)
    var front := PackedVector2Array()

    # Dentes distribuídos ao redor da engrenagem.
    for i in range(48):
        var angle := TAU * float(i) / 48.0 + rotation
        var tooth_radius := radius * (1.12 if i % 4 < 2 else 0.94)
        front.append(center + Vector2(cos(angle), sin(angle)) * tooth_radius)

    var offset := Vector2(7.0, 5.0)
    var side := PackedVector2Array()

    for point in front:
        side.append(point + offset)

    draw_colored_polygon(side, Color("#0b1119"))
    _draw_metal_surface(front, Color("#b7c1bf"))

    # Cubo central e eixo.
    draw_circle(center, radius * 0.29, Color("#17232b"))
    draw_arc(center, radius * 0.29, 0.0, TAU, 32,
        Color("#d0b17a"), 2.5)
    draw_circle(center, radius * 0.12, Color("#667780"))
    draw_circle(center, 4.0, CYAN)

    # Raios metálicos.
    for i in range(8):
        var angle := TAU * float(i) / 8.0 + rotation
        var inner_point := center + Vector2(cos(angle), sin(angle)) * radius * 0.3
        var outer_point := center + Vector2(cos(angle), sin(angle)) * radius * 0.82
        draw_line(inner_point, outer_point, Color("#26343c"), 5.0)
        draw_line(inner_point, outer_point, Color("#aab6b4", 0.75), 1.5)
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
        var base_x := fmod(float(i) * 137.0 + float(area_id) * 53.0, span)
        var base_y := 105.0 + fmod(float(i) * 83.0, 405.0)
        var drift_x := sin(_animation_time * 0.22 + float(i) * 1.7) * 13.0
        var drift_y := sin(_animation_time * 0.38 + float(i) * 0.91) * 9.0
        var x := fposmod(base_x + drift_x, span)
        var y := base_y + drift_y
        var radius := 1.0 + float(i % 3) * 0.65
        var alpha := 0.12 + float(i % 4) * 0.045
        var tint := Color(CYAN.r, CYAN.g, CYAN.b, alpha)

        if i % 5 == 0:
            tint = Color(GOLD.r, GOLD.g, GOLD.b, alpha)

        draw_circle(Vector2(x, y), radius, tint)

    for i in range(8):
        var x := 95.0 + float(i) * 190.0
        var y := 155.0 + float((i * 47) % 220)
        var pulse := 0.65 + (sin(_animation_time * 1.4 + float(i)) + 1.0) * 0.35

        draw_circle(
            Vector2(x, y),
            5.0,
            Color(CYAN.r, CYAN.g, CYAN.b, 0.055 * pulse)
        )
        draw_circle(
            Vector2(x, y),
            1.8,
            Color(0.82, 0.96, 0.96, 0.30 * pulse)
        )

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
				_draw_beam(Vector2(140, y), Vector2(1430, y + 12), 9.0, Color("#9ca9a5"))
			for x in [180.0, 470.0, 760.0, 1050.0, 1340.0]:
				_draw_beam(Vector2(x, 285), Vector2(x + 18, 495), 9.0, Color("#9ca9a5"))
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
				_draw_beam(Vector2(x, 210), Vector2(x + lean, 515), 9.0, Color("#89969b"))
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

func _draw_stone_surface(points: PackedVector2Array, tint: Color) -> void:
    if points.size() < 3:
        return

    var texture: Texture2D = TextureFactory2D.tex_carved_stone

    if texture == null:
        draw_colored_polygon(points, tint)
    else:
        var min_x := points[0].x
        var max_x := points[0].x
        var min_y := points[0].y
        var max_y := points[0].y

        for point in points:
            min_x = minf(min_x, point.x)
            max_x = maxf(max_x, point.x)
            min_y = minf(min_y, point.y)
            max_y = maxf(max_y, point.y)

        var uv := PackedVector2Array()
        var colors := PackedColorArray()
        var w := maxf(max_x - min_x, 1.0)
        var h := maxf(max_y - min_y, 1.0)

        for point in points:
            uv.append(Vector2((point.x - min_x) / w, (point.y - min_y) / h))
            colors.append(tint)

        draw_polygon(points, colors, uv, texture)

    var center := Vector2.ZERO
    for point in points:
        center += point
    center /= float(points.size())

    var outline := PackedVector2Array(points)
    outline.append(points[0])

    draw_polyline(
        outline,
        Color(0.035, 0.045, 0.052, 0.82),
        3.5,
        true
    )

    var bevel := PackedVector2Array()
    for point in points:
        bevel.append(point.lerp(center, 0.045))
    bevel.append(bevel[0])

    draw_polyline(
        bevel,
        Color(0.78, 0.84, 0.83, 0.27),
        1.8,
        true
    )

    for i in range(mini(points.size(), 3)):
        var origin := points[i]
        var direction := center - origin
        var side := Vector2(-direction.y, direction.x).normalized()

        var crack := PackedVector2Array([
            origin.lerp(center, 0.20),
            origin.lerp(center, 0.37) + side * 5.0,
            origin.lerp(center, 0.52) - side * 3.0,
            origin.lerp(center, 0.72) + side * 2.0
        ])

        draw_polyline(
            crack,
            Color(0.035, 0.043, 0.048, 0.82),
            2.2,
            true
        )

        draw_line(
            crack[0] + Vector2(-1.0, -1.0),
            crack[2] + Vector2(-1.0, -1.0),
            Color(0.78, 0.82, 0.78, 0.24),
            1.0,
            true
        )


func _draw_metal_surface(points: PackedVector2Array, tint: Color) -> void:
    if points.size() < 3:
        return

    var texture: Texture2D = TextureFactory2D.tex_oxidized_metal

    if texture == null:
        draw_colored_polygon(points, tint)
    else:
        var min_x := points[0].x
        var max_x := points[0].x
        var min_y := points[0].y
        var max_y := points[0].y

        for point in points:
            min_x = minf(min_x, point.x)
            max_x = maxf(max_x, point.x)
            min_y = minf(min_y, point.y)
            max_y = maxf(max_y, point.y)

        var size_x := maxf(max_x - min_x, 1.0)
        var size_y := maxf(max_y - min_y, 1.0)
        var uvs := PackedVector2Array()
        var colors := PackedColorArray()

        for point in points:
            uvs.append(Vector2(
                (point.x - min_x) / size_x,
                (point.y - min_y) / size_y
            ))
            colors.append(tint)

        draw_polygon(points, colors, uvs, texture)

    var center := Vector2.ZERO
    for point in points:
        center += point
    center /= float(points.size())

    var outline := PackedVector2Array(points)
    outline.append(points[0])

    draw_polyline(
        outline,
        Color(0.025, 0.035, 0.040, 0.88),
        3.0,
        true
    )

    var bevel := PackedVector2Array()
    for point in points:
        bevel.append(point.lerp(center, 0.055))
    bevel.append(bevel[0])

    draw_polyline(
        bevel,
        Color(0.86, 0.91, 0.88, 0.32),
        1.6,
        true
    )

    for i in range(points.size()):
        var a := points[i]
        var b := points[(i + 1) % points.size()]
        var bolt := a.lerp(b, 0.5)

        draw_circle(bolt, 3.2, Color(0.035, 0.043, 0.045, 0.88))
        draw_circle(bolt, 1.65, Color(0.72, 0.77, 0.73, 0.78))
        draw_circle(
            bolt + Vector2(-0.6, -0.7),
            0.65,
            Color(0.96, 0.97, 0.88, 0.72)
        )

        if i < 4:
            var scratch_start := a.lerp(center, 0.25)
            var scratch_end := a.lerp(center, 0.48)

            draw_line(
                scratch_start,
                scratch_end,
                Color(0.88, 0.91, 0.86, 0.25),
                1.3,
                true
            )

            var rust_point := a.lerp(center, 0.58)
            draw_circle(
                rust_point,
                2.0,
                Color(0.48, 0.25, 0.13, 0.38)
            )
