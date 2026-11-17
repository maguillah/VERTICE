extends Node

# Gerador procedural de texturas 2D leves para Adreno 619 (zero assets externos pesados)
var tex_concrete: ImageTexture
var tex_wet_concrete: ImageTexture
var tex_oxidized_metal: ImageTexture
var tex_carved_stone: ImageTexture
var tex_core_glow: ImageTexture

func _ready() -> void:
	tex_concrete = _build_concrete_texture(false)
	tex_wet_concrete = _build_concrete_texture(true)
	tex_oxidized_metal = _build_metal_texture()
	tex_carved_stone = _build_stone_texture()
	tex_core_glow = _build_radial_glow_texture(64)

func _hash2(x: int, y: int, seed_val: int) -> float:
	var n := (x * 374761393 + y * 668265263 + seed_val * 1442695041) & 0x7fffffff
	n = (n ^ (n >> 13)) * 1274126177
	return float((n ^ (n >> 16)) & 0xffff) / 65535.0

func _build_concrete_texture(wet: bool) -> ImageTexture:
	var size := 128
	var img := Image.create(size, size, false, Image.FORMAT_RGBA8)
	for y in range(size):
		for x in range(size):
			var grain := _hash2(x, y, 17)
			var blotch := _hash2(x >> 3, y >> 3, 53)
			var seep := _hash2(x >> 2, 0, 41)
			var base := 0.068 + grain * 0.028 + blotch * 0.024
			# Infiltração escura vertical e microfissuras com borda chanfrada
			if seep > 0.68 and y < int(36.0 + seep * 42.0):
				base *= 0.72
			if (y % 48 == 0 and grain > 0.42) or ((x + y * 2) % 97 == 0 and grain > 0.56):
				base *= 0.42
			elif y % 48 == 1:
				base += 0.025
			# Múltiplas veias úmidas e musgo discreto em superfícies molhadas
			var r := base * 0.88
			var g := base * 0.94
			var b := base * 1.06
			if wet:
				var moss := _hash2(x >> 4, y >> 4, 71)
				if moss > 0.74:
					g += 0.024
					r += 0.008
				if y < 10:
					var sheen := (1.0 - float(y) / 10.0) * 0.1
					r += sheen * 0.75
					g += sheen * 0.92
					b += sheen * 1.15
				elif (x % 13 == 0) and grain > 0.52:
					r += 0.02
					g += 0.028
					b += 0.04
			img.set_pixel(x, y, Color(r, g, b, 1.0))
	return ImageTexture.create_from_image(img)

func _build_metal_texture() -> ImageTexture:
	var size := 128
	var img := Image.create(size, size, false, Image.FORMAT_RGBA8)
	for y in range(size):
		for x in range(size):
			var brush := _hash2(x >> 2, y, 91)
			var rust := _hash2(x >> 3, y >> 3, 131)
			var scratch := ((x + y * 3) % 79 == 0 and brush > 0.58)
			var base := 0.075 + brush * 0.032 + (0.045 if scratch else 0.0)
			var r := base * 1.15 + (0.05 if rust > 0.7 else 0.0)
			var g := base * 0.96 + (0.02 if rust > 0.7 else 0.0)
			var b := base * 0.88
			if x % 32 == 0 or y % 64 == 0:
				r *= 0.52
				g *= 0.52
				b *= 0.52
			elif y % 64 == 1:
				r += 0.035
				g += 0.04
				b += 0.045
			# Rebites com contorno escuro
			if (x % 32 == 6 or x % 32 == 26) and (y % 32 == 6):
				r += 0.065
				g += 0.06
				b += 0.055
			img.set_pixel(x, y, Color(r, g, b, 1.0))
	return ImageTexture.create_from_image(img)

func _build_stone_texture() -> ImageTexture:
	var size := 128
	var img := Image.create(size, size, false, Image.FORMAT_RGBA8)
	for y in range(size):
		for x in range(size):
			var n := _hash2(x >> 1, y >> 1, 211)
			var strata := 0.5 + 0.5 * sin(float(y) * 0.19 + n * 1.8)
			var v := 0.055 + n * 0.025 + strata * 0.02
			# Juntas de alvenaria entalhada
			var row := y / 32
			var vert_offset := 42 if (row % 2 == 0) else 20
			if y % 32 == 0 or (x + vert_offset) % 64 == 0:
				v *= 0.45
			img.set_pixel(x, y, Color(v * 0.9, v * 0.95, v * 1.05, 1.0))
	return ImageTexture.create_from_image(img)

func _build_radial_glow_texture(size: int) -> ImageTexture:
	var img := Image.create(size, size, false, Image.FORMAT_RGBA8)
	var half := float(size) * 0.5
	for y in range(size):
		for x in range(size):
			var dx := (float(x) + 0.5 - half) / half
			var dy := (float(y) + 0.5 - half) / half
			var d := sqrt(dx * dx + dy * dy)
			var falloff := exp(-d * 3.1) * clampf(1.0 - d, 0.0, 1.0)
			img.set_pixel(x, y, Color(1.0, 0.86, 0.62, clampf(falloff, 0.0, 1.0)))
	return ImageTexture.create_from_image(img)
