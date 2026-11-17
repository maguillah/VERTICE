# VÉRTICE: O Limiar da Existência — Projeto Godot 4.3 (Exclusivamente 2D · Capítulos I–VI · Android ARM64)

## 1. Arquitetura 100% 2D & Sistemas Implementados
- **Motor & Renderização (`project.godot` + `export_presets.cfg`)**: Godot 4.3 `gl_compatibility` / `mobile`, `arm64-v8a` apenas, `min_sdk 24`, `target_sdk 34`, meta de **30 FPS** com fallback automático de escala no **OPPO A5 (Snapdragon 6s 4G Gen 1 / Adreno 619 / 6 GB RAM)**. Zero nós 3D em todo o projeto.
- **Física 2D Corrigida (`player.tscn` + `player_controller.gd` + `resonance_object.gd` + `checkpoint.gd`)**:
  - `CollisionShape2D` retangular plano (`18x52px`) com `floor_stop_on_slope = true`, `floor_constant_speed = true`, `floor_snap_length = 6.0` e `platform_on_leave = 2`.
  - Fricção em solo `4200.0`, corte de inércia horizontal no pouso (`*= 0.2`) quando sem input, plataformas móveis sincronizadas em `_physics_process` com `constant_linear_velocity` e ativação de checkpoint restrita a pouso real no solo.
- **Campanha Completa (Capítulos I a VI)**:
  - `world_chapter_1.tscn` (O Despertar)
  - `world_chapter_2_threshold.tscn` (O Chamado)
  - `world_chapter_3_city.tscn` (A Cidade Esquecida)
  - `world_chapter_4_abyss.tscn` (O Abismo das Memórias)
  - `world_chapter_5_convergence.tscn` (A Convergência)
  - `world_chapter_6_threshold.tscn` (O Limiar da Existência)
- **Mecânicas Adicionais**: Três estados de Ressonância (`PRESENTE`, `ECO`, `RUPTURA`) com guarda física anti-sobreposição (`ResonanceSystem.would_overlap_player`), agachar/furtividade (`crouch`), escalada em cordas/escadas (`ClimbZone`), blocos empurráveis (`PushBlock`), vegetação reativa (`VegetationCluster`), perigos (`HazardZone`) e 3 criaturas originais (`CreatureEntity`).

## 2. Como Compilar o APK Instalável
O contêiner atual não possui `godot` nem Android SDK/NDK instalados, portanto o binário `.apk` não foi compilado localmente aqui. O projeto já inclui um workflow automatizado em `.github/workflows/build_android_apk.yml` além das instruções manuais:

1. **Via GitHub Actions**: Ao enviar o repositório para o GitHub, execute o workflow manual/push `Build VÉRTICE Android APK` para gerar e baixar o artefato `VERTICE_Capitulo1_a_6.apk`.
2. **Localmente (Godot 4.3)**:
   - Instale o **Godot Engine 4.3** (Standard) e os **Export Templates 4.3**.
   - Instale **Android SDK (API 34)**, **Build-Tools 34.0.0**, **NDK r23c+** e **OpenJDK 17**.
   - Configure `Editor > Editor Settings > Export > Android` (Android SDK + `debug.keystore`).
   - Abra `VERTICE/project.godot` e execute `Project > Export... > Android > Export Project...` (`android/build/VERTICE_Capitulo1_a_6.apk`).
   - Instale no **OPPO A5** com `adb install -r VERTICE_Capitulo1_a_6.apk`.
