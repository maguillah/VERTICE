shader_type canvas_item;

// Shader leve para Adreno 619 (single-pass): transição visual entre PRESENTE, ECO e RUPTURA
uniform int resonance_state : hint_range(0, 2) = 0; // 0 = PRESENTE, 1 = ECO, 2 = RUPTURA
uniform float transition_progress : hint_range(0.0, 1.0) = 1.0;
uniform vec4 amber_color : source_color = vec4(0.898, 0.596, 0.220, 1.0);
uniform float pulse_speed = 2.2;

void fragment() {
	vec2 uv = UV;
	vec4 tex = texture(TEXTURE, uv);
	float t = TIME * pulse_speed;

	if (resonance_state == 1) {
		// ECO: Silhueta translúcida com borda âmbar e linhas de memória sutis
		float scan = 0.85 + 0.15 * sin(uv.y * 48.0 - t);
		float edge_x = min(uv.x, 1.0 - uv.x);
		float edge_y = min(uv.y, 1.0 - uv.y);
		float border = 1.0 - smoothstep(0.01, 0.06, min(edge_x, edge_y));
		vec3 eco_tint = mix(tex.rgb * vec3(0.72, 0.65, 0.55), amber_color.rgb, 0.35 + border * 0.55);
		COLOR = vec4(eco_tint * scan, tex.a * (0.68 + border * 0.28) * transition_progress);
	} else if (resonance_state == 2) {
		// RUPTURA: Distorção espacial sutil e realce âmbar-cobre nas arestas
		float wave = sin(uv.y * 24.0 + t * 1.8) * 0.008;
		vec4 shifted = texture(TEXTURE, clamp(uv + vec2(wave, 0.0), 0.0, 1.0));
		float rim = abs(sin((uv.x + uv.y) * 18.0 - t));
		vec3 rup_col = mix(shifted.rgb, amber_color.rgb * 1.15, 0.25 + rim * 0.2);
		COLOR = vec4(rup_col, shifted.a);
	} else {
		// PRESENTE: Preto mineral e cinza frio
		COLOR = tex;
	}
}
