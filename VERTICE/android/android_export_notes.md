# Configuração Android & Perfil OPPO A5 — VÉRTICE

- **Dispositivo de referência**: OPPO A5 / Snapdragon 6s 4G Gen 1 / Adreno 619 / 6 GB RAM.
- **Renderer**: `gl_compatibility` (OpenGL ES 3.0 mobile) para máxima estabilidade térmica e zero stutters de compilação de shaders Vulkan em GPUs intermediárias.
- **Meta de desempenho**: 30 FPS estáveis no perfil padrão (`Engine.max_fps = 30`), com opção de 60 FPS no menu de qualidade.
- **Técnicas de otimização aplicadas**:
  - Shaders single-pass (`volumetric_fog.gdshader` e `resonance_shift.gdshader`) sem post-processing multi-pass ou glow fullscreen pesado.
  - Iluminação 2D simulada por gradiente aditivo (`core_glow.gdshader`) em vez de `PointLight2D` com shadow casters caros.
  - Compressão VRAM ETC2/ASTC habilitada em `project.godot`.
  - Controles touchscreen dedicados com área mínima >= 64px e ajuste de sensibilidade persistido em `user://vertice_save.json`.
