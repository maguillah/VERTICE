shader_type canvas_item;

// Reflexo 2D simulado e ondulação leve na superfície da água para Adreno 619
uniform vec4 deep_water_color : source_color = vec4(0.025, 0.034, 0.048, 0.92);
uniform vec4 highlight_color : source_color = vec4(0.898, 0.596, 0.220, 0.24);
uniform float resonance_mix : hint_range(0.0, 1.0) = 0.0;
uniform float wave_speed = 1.8;

void fragment() {
	vec2 uv = UV;
	float t = TIME * wave_speed;
	float ripple1 = sin(uv.x * 38.0 + t + uv.y * 14.0) * 0.5 + 0.5;
	float ripple2 = sin(uv.x * 84.0 - t * 1.4) * 0.5 + 0.5;
	float surface_line = smoothstep(0.08, 0.0, uv.y);
	float depth_grad = smoothstep(0.0, 1.0, uv.y);

	vec3 base = mix(deep_water_color.rgb * 1.35, deep_water_color.rgb * 0.55, depth_grad);
	float spec = (ripple1 * 0.6 + ripple2 * 0.4) * (1.0 - depth_grad * 0.85);
	vec3 glint = mix(vec3(0.32, 0.38, 0.48), highlight_color.rgb * 1.4, 0.35 + resonance_mix * 0.65);

	vec3 final_col = base + glint * (spec * 0.22 + surface_line * 0.35);
	COLOR = vec4(final_col, deep_water_color.a);
}
