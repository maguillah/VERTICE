shader_type canvas_item;

// Névoa volumétrica simulada de baixo custo para hardware intermediário Android
uniform vec4 fog_color : source_color = vec4(0.14, 0.16, 0.20, 0.22);
uniform vec4 resonance_tint : source_color = vec4(0.898, 0.596, 0.220, 0.14);
uniform float resonance_mix : hint_range(0.0, 1.0) = 0.0;
uniform float drift_speed = 0.025;
uniform float density : hint_range(0.0, 1.0) = 0.32;

float hash(vec2 p) {
	return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	vec2 u = f * f * (3.0 - 2.0 * f);
	return mix(
		mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
		mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
		u.y
	);
}

void fragment() {
	vec2 uv = UV;
	float n1 = noise(uv * vec2(3.5, 2.0) + vec2(TIME * drift_speed, 0.0));
	float n2 = noise(uv * vec2(7.0, 4.0) - vec2(TIME * drift_speed * 0.6, TIME * 0.008));
	float mist = (n1 * 0.65 + n2 * 0.35) * density;
	float vertical_fade = smoothstep(0.0, 0.35, uv.y) * smoothstep(1.0, 0.25, uv.y);
	vec4 col = mix(fog_color, resonance_tint, resonance_mix);
	COLOR = vec4(col.rgb, col.a * mist * vertical_fade);
}
