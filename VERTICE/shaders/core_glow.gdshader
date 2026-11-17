shader_type canvas_item;

uniform vec4 core_color : source_color = vec4(0.95, 0.64, 0.24, 1.0);
uniform float pulse_intensity : hint_range(0.2, 2.5) = 1.0;

void fragment() {
	vec2 centered = UV - vec2(0.5);
	float dist = length(centered) * 2.0;
	float halo = exp(-dist * 3.2) * pulse_intensity;
	float center_dot = smoothstep(0.24, 0.05, dist);
	float alpha = clamp(halo * 0.75 + center_dot, 0.0, 1.0);
	vec3 rgb = mix(core_color.rgb, vec3(1.0, 0.92, 0.76), center_dot * 0.8);
	COLOR = vec4(rgb, alpha);
}
