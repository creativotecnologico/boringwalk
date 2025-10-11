# BoringWalk - Roadmap de Desarrollo

**Fecha de creación:** 11 de octubre de 2025

Este documento define las fases de desarrollo del proyecto BoringWalk, donde cada fase culmina con una versión estable y funcional del videojuego.

---

## Fase 0: Fundación (v0.1.0) ✅ COMPLETADA

**Objetivo:** Establecer la arquitectura base y los sistemas fundamentales.

**Entregables:**
- ✅ Arquitectura ECS implementada
- ✅ Motor WebGL funcional
- ✅ Sistema de renderizado básico
- ✅ Terreno procedural con colisiones
- ✅ Control de cámara primera/tercera persona
- ✅ Sistema de input (teclado/ratón)

**Versión estable:** v0.1.0 (Estado actual)

---

## Fase 1: Sistema de Texturas (v0.2.0)

**Objetivo:** Implementar carga y renderizado de texturas con sistema avanzado para terreno.

**Características principales:**
- TextureManager para carga de texturas
- Shader con soporte para texturas
- **Texture splatting** para terreno (blend de múltiples texturas)
- **Splatmap** - mapa de control para definir zonas (caminos, vegetación, arena, río, etc.)
- **Height-based texturing** - texturas automáticas según altura del terreno
- UV mapping para geometría
- Sistema de 4+ texturas para terreno (hierba, piedra, arena, tierra)

**Criterios de estabilidad:**
- Texturas se cargan correctamente
- Splatmap funciona sin artefactos visuales
- Blend suave entre texturas del terreno
- No hay memory leaks en carga de texturas
- Rendimiento estable con 8+ texturas

**Versión estable:** v0.2.0

---

## Fase 2: Iluminación Básica (v0.3.0)

**Objetivo:** Añadir iluminación direccional y ambiental.

**Características principales:**
- Luz direccional (sol)
- Luz ambiental
- Cálculo de normales en terreno
- Shaders con iluminación Phong básica


**Criterios de estabilidad:**
- Iluminación visible y consistente
- Sin artefactos visuales
- Performance sin degradación

**Versión estable:** v0.3.0

---

## Fase 3: Props Estáticos (v0.4.0)

**Objetivo:** Sistema para colocar objetos en el mundo.

**Características principales:**
- Clase PropEntity
- Geometrías básicas (cubo, esfera, cilindro)
- Sistema de posicionamiento en terreno
- 3-5 props diferentes


**Criterios de estabilidad:**
- Props se renderizan correctamente
- Colisiones básicas funcionan
- Fácil añadir nuevos props

**Versión estable:** v0.4.0

---

## Fase 4: Skybox y Niebla (v0.5.0)

**Objetivo:** Mejorar atmósfera visual del mundo.

**Características principales:**
- Skybox con 6 texturas
- Niebla atmosférica basada en distancia
- Configuración de colores de cielo


**Criterios de estabilidad:**
- Skybox sin costuras visibles
- Niebla suave y configurable
- Performance estable

**Versión estable:** v0.5.0

---

## Fase 5: Sistema de Colisiones Avanzado (v0.6.0)

**Objetivo:** Detección de colisiones con objetos del mundo.

**Características principales:**
- AABB (Axis-Aligned Bounding Box)
- Colisión esfera-esfera
- CollisionSystem en ECS
- Collision layers


**Criterios de estabilidad:**
- Colisiones precisas y consistentes
- Sin atravesar objetos
- Performance con 50+ colliders

**Versión estable:** v0.6.0

---

## Fase 6: UI Básica (v0.7.0)

**Objetivo:** Sistema de interfaz de usuario.

**Características principales:**
- Canvas 2D overlay
- HUD básico (crosshair, info debug)
- Menú de pausa
- UISystem en ECS


**Criterios de estabilidad:**
- UI responsive en diferentes resoluciones
- Menús navegables con teclado
- Sin lag en renderizado UI

**Versión estable:** v0.7.0

---

## Fase 7: Sistema de Audio (v0.8.0)

**Objetivo:** Sistema completo de audio espacial, música y efectos de sonido.

**Características principales:**
- AudioManager con Web Audio API
- Audio espacial 3D con atenuación por distancia
- Sistema de música adaptativa (cambios según zona/situación)
- Efectos de sonido ambientales (viento, agua, pájaros)
- Efectos de sonido del jugador (pasos según superficie)
- Control de volumen por categoría (música, SFX, ambiente)
- Crossfade entre pistas musicales
- Sistema de audio streaming para archivos grandes
- Soporte para formatos OGG/MP3/WAV


**Criterios de estabilidad:**
- Audio sin cortes ni glitches
- Volumen espacial correcto
- Transiciones musicales suaves
- Performance sin impacto notable
- Fácil añadir nuevos sonidos

**Versión estable:** v0.8.0

---

## Fase 8: Sistema de Interacción (v0.9.0)

**Objetivo:** Objetos interactuables en el mundo.

**Características principales:**
- InteractableComponent
- Raycast para detección
- UI de prompt de interacción
- 2-3 objetos interactuables (puerta, cofre)


**Criterios de estabilidad:**
- Detección de interacción precisa
- Feedback visual claro
- Sistema extensible

**Versión estable:** v0.9.0

---

## Fase 9: Sistema de Guardado (v0.10.0)

**Objetivo:** Persistencia de estado del juego.

**Características principales:**
- SaveManager con localStorage
- Serialización de entidades
- Guardado automático
- Múltiples slots de guardado


**Criterios de estabilidad:**
- Guardado/carga sin pérdida de datos
- Estado del mundo se restaura correctamente
- No corrompe datos existentes

**Versión estable:** v0.10.0

---

## Fase 10: Sistema de Partículas (v0.11.0)

**Objetivo:** Efectos visuales con partículas.

**Características principales:**
- ParticleSystem básico
- Emisores configurables
- 2-3 efectos (humo, chispas, polvo)
- Instancing para performance


**Criterios de estabilidad:**
- 100+ partículas sin lag
- Efectos visuales atractivos
- Fácil crear nuevos efectos

**Versión estable:** v0.11.0

---

## Fase 11: Inventario del Jugador (v0.12.0)

**Objetivo:** Sistema de inventario básico.

**Características principales:**
- InventoryComponent
- Items recogibles
- UI de inventario (grid)
- 5-10 items diferentes


**Criterios de estabilidad:**
- Items se guardan correctamente
- UI de inventario funcional
- Fácil añadir nuevos items

**Versión estable:** v0.12.0

---

## Fase 12: Sistema de Personajes (v0.13.0)

**Objetivo:** Cargar y renderizar modelos de personajes 3D.

**Características principales:**
- CharacterMesh para modelos humanoides
- Carga de modelos OBJ/GLTF básico
- Sistema de esqueleto simple
- Modelo del jugador visible en tercera persona
- 1-2 NPCs estáticos con modelos

**Criterios de estabilidad:**
- Modelos se cargan sin errores
- Personajes visibles en escena
- Performance estable con 5+ personajes
- Fácil importar nuevos modelos

**Versión estable:** v0.13.0

---

## Fase 13: Sistema de Animaciones (v0.14.0)

**Objetivo:** Animar personajes del jugador y NPCs.

**Características principales:**
- AnimationComponent
- Sistema de skeletal animation básico
- Animaciones: idle, walk, run
- Blending entre animaciones
- Aplicado a jugador y NPCs

**Criterios de estabilidad:**
- Animaciones fluidas
- Transiciones suaves
- Performance con múltiples personajes animados
- Sincronización con movimiento

**Versión estable:** v0.14.0

---

## Fase 14: Animales del Entorno (v0.15.0)

**Objetivo:** Añadir fauna al mundo.

**Características principales:**
- AnimalEntity con IA básica
- 2-3 tipos de animales (pájaro, conejo, ciervo)
- Comportamiento: idle, wander, flee
- Animaciones de animales
- Spawn en zonas específicas

**Criterios de estabilidad:**
- Animales se mueven de forma creíble
- IA básica funciona sin bugs
- Performance con 10+ animales
- Comportamiento predecible

**Versión estable:** v0.15.0

---

## Fase 15: Zonas y Checkpoints (v0.16.0)

**Objetivo:** Dividir el mundo en áreas.

**Características principales:**
- Sistema de zonas
- Triggers de área
- Checkpoints automáticos
- Transiciones entre zonas


**Criterios de estabilidad:**
- Transiciones suaves
- Checkpoints funcionan correctamente
- Fácil definir nuevas zonas

**Versión estable:** v0.16.0

---

## Fase 16: Sistema de Sombras (v0.17.0)

**Objetivo:** Shadow mapping básico.

**Características principales:**
- Shadow map rendering
- PCF (Percentage Closer Filtering)
- Sombras de luz direccional
- Toggle de sombras


**Criterios de estabilidad:**
- Sombras sin artefactos graves
- Performance aceptable (45+ FPS)
- Configuración de calidad

**Versión estable:** v0.17.0

---

## Fase 17: Post-Procesado Básico (v0.18.0)

**Objetivo:** Efectos de post-procesado.

**Características principales:**
- Framebuffer rendering
- Bloom básico
- Ajuste de color/saturación
- Toggle de efectos


**Criterios de estabilidad:**
- Efectos sin artefactos
- Performance estable
- Configurable por usuario

**Versión estable:** v0.18.0

---

## Fase 18: Ciclo Día/Noche (v0.19.0)

**Objetivo:** Iluminación dinámica basada en tiempo.

**Características principales:**
- TimeManager
- Color de luz cambiante
- Skybox dinámico
- Velocidad de ciclo configurable


**Criterios de estabilidad:**
- Transiciones suaves
- Iluminación creíble
- Performance estable

**Versión estable:** v0.19.0

---

## Fase 19: Sistema de Clima (v0.20.0)

**Objetivo:** Estados de clima dinámico.

**Características principales:**
- WeatherSystem
- Lluvia con partículas
- Niebla dinámica
- 2-3 estados de clima


**Criterios de estabilidad:**
- Efectos visuales convincentes
- Transiciones suaves
- Performance aceptable

**Versión estable:** v0.20.0

---

## Fase 20: Sistema de Agua (v0.21.0)

**Objetivo:** Implementar agua realista para ríos, lagos y mar.

**Características principales:**
- WaterMesh con shader especializado
- Reflexiones y refracciones básicas
- Animación de ondas (wave animation)
- Transparencia y profundidad del agua
- Ríos con flow map (dirección de flujo)
- Mar/océano con olas
- Integración con splatmap del terreno
- Colisión con superficie del agua

**Criterios de estabilidad:**
- Agua se renderiza correctamente
- Animación fluida sin stuttering
- Performance aceptable con múltiples cuerpos de agua
- Transición suave entre terreno y agua
- Reflexiones sin artefactos graves

**Versión estable:** v0.21.0

---

## Fase 21: Contenido - Primera Área (v0.22.0)

**Objetivo:** Primera zona completa del juego.

**Características principales:**
- Diseño de nivel
- 20+ props colocados variados
- Puntos de interés visual
- Animales en el área
- Variedad de terreno


**Criterios de estabilidad:**
- Área explorable de inicio a fin
- Sin bugs bloqueantes
- Experiencia coherente (5-10 min)

**Versión estable:** v0.22.0

---

## Fase 22: Configuración de Gráficos (v0.23.0)

**Objetivo:** Opciones de calidad visual.

**Características principales:**
- Menú de configuración
- Presets (bajo/medio/alto)
- Configuración individual de efectos
- Guardado de preferencias


**Criterios de estabilidad:**
- Configuración funciona en todos los niveles
- Cambios aplicados en tiempo real
- Presets balanceados

**Versión estable:** v0.23.0

---

## Fase 23: Contenido - Áreas 2 y 3 (v0.24.0)

**Objetivo:** Expandir contenido jugable.

**Características principales:**
- 2 áreas nuevas diseñadas con biomas diferentes
- 30+ nuevos props variados
- Más tipos de animales
- Paisajes únicos por área


**Criterios de estabilidad:**
- Áreas completas y explorables
- Variedad visual notable
- Experiencia total: 15-20 minutos

**Versión estable:** v0.24.0

---

## Fase 24: Sistema de Achievements (v0.25.0)

**Objetivo:** Logros y estadísticas.

**Características principales:**
- AchievementManager
- UI de logros
- 10+ achievements
- Persistencia de progreso


**Criterios de estabilidad:**
- Achievements se desbloquean correctamente
- UI clara y accesible
- Notificaciones visuales

**Versión estable:** v0.25.0

---

## Fase 25: Optimización - LOD System (v0.26.0)

**Objetivo:** Level of Detail para performance.

**Características principales:**
- LODComponent
- Múltiples niveles de detalle
- Distancia-based switching
- Aplicado a props principales


**Criterios de estabilidad:**
- Mejora de FPS notable (10-20%)
- Transiciones suaves
- Sin pop-in visible

**Versión estable:** v0.26.0

---

## Fase 26: Optimización - Culling (v0.27.0)

**Objetivo:** Frustum y occlusion culling.

**Características principales:**
- Frustum culling mejorado
- Occlusion culling básico
- Debugging visualización
- Stats de objetos renderizados


**Criterios de estabilidad:**
- Reducción de draw calls (30-50%)
- Performance mejorada en escenas grandes
- Sin objetos culleados incorrectamente

**Versión estable:** v0.27.0

---

## Fase 27: Optimización - Asset Loading (v0.28.0)

**Objetivo:** Carga optimizada de recursos.

**Características principales:**
- Asset streaming
- Lazy loading de texturas
- Loading screen
- Preload crítico


**Criterios de estabilidad:**
- Tiempo de carga inicial < 5s
- Sin stuttering al cargar assets
- Progress bar funcional

**Versión estable:** v0.28.0

---

## Fase 28: World Streaming (v0.29.0)

**Objetivo:** Carga dinámica del mundo abierto por regiones.

**Características principales:**
- Sistema de chunks/sectores del mundo
- Streaming de terreno por proximidad del jugador
- Carga asíncrona desde servidor (fetch API)
- Descarga de chunks al alejarse
- Sistema de tiles para dividir el mundo
- Nivel de detalle por distancia (cerca/lejos)
- Cache local de chunks visitados
- Indicador de carga en background

**Criterios de estabilidad:**
- Transiciones suaves entre chunks sin stuttering
- Carga en background sin bloquear gameplay
- Memoria controlada (liberar chunks lejanos)
- Manejo correcto de errores de red
- Performance estable durante streaming

**Versión estable:** v0.29.0

---

## Fase 29: Optimización - WebAssembly (v0.30.0)

**Objetivo:** Integrar WebAssembly para optimizar sistemas críticos.

**Características principales:**
- Módulos WASM para cálculos de física
- Operaciones de matriz optimizadas en WASM
- Procesamiento de colisiones en WASM
- Sistema de culling en WASM
- Fallback a JavaScript si WASM no disponible

**Criterios de estabilidad:**
- Mejora de performance del 20-40% en sistemas críticos
- Compatibilidad con todos los navegadores modernos
- Sin errores de integración JS/WASM
- Tiempos de carga aceptables

**Versión estable:** v0.30.0

---

## Fase 30: Contenido - Áreas 4 y 5 (v0.31.0)

**Objetivo:** Contenido final del mundo.

**Características principales:**
- 2 áreas finales con paisajes espectaculares
- 40+ props adicionales
- Todos los tipos de biomas
- Puntos de interés memorables


**Criterios de estabilidad:**
- Mundo completo explorable
- Experiencia total: 30-45 minutos
- Sin bugs bloqueantes

**Versión estable:** v0.31.0

---

## Fase 31: Pulido Visual Final (v0.32.0)

**Objetivo:** Mejoras visuales finales.

**Características principales:**
- Ajustes de iluminación
- Mejoras en shaders
- Efectos adicionales
- Color grading final


**Criterios de estabilidad:**
- Look visual consistente
- Sin glitches visuales
- Performance estable

**Versión estable:** v0.32.0

---

## Fase 32: Accesibilidad (v0.33.0)

**Objetivo:** Opciones de accesibilidad.

**Características principales:**
- Controles remapeables
- Ajuste de sensibilidad
- Subtítulos
- Modo daltonismo


**Criterios de estabilidad:**
- Opciones funcionales
- UI accesible
- Configuración persiste

**Versión estable:** v0.33.0

---

## Fase 33: Testing Alpha (v0.34.0)

**Objetivo:** Primera ronda de testing externo.

**Características principales:**
- Bug tracking
- Feedback de 5-10 testers
- Corrección de bugs críticos
- Documentación de issues


**Criterios de estabilidad:**
- 0 bugs críticos
- Lista de bugs conocidos documentada
- Feedback registrado

**Versión estable:** v0.34.0 (Alpha)

---

## Fase 34: Corrección Post-Alpha (v0.35.0)

**Objetivo:** Corregir problemas del alpha testing.

**Características principales:**
- Fix de bugs reportados
- Mejoras de UX
- Balance de dificultad
- Optimizaciones menores


**Criterios de estabilidad:**
- 80%+ de bugs alpha resueltos
- Mejoras de UX implementadas
- Performance mejorada

**Versión estable:** v0.35.0

---

## Fase 35: Telemetría Opcional (v0.36.0)

**Objetivo:** Analytics para entender uso.

**Características principales:**
- TelemetryManager (opt-in)
- Eventos de gameplay
- Estadísticas anónimas
- Respeto a privacidad


**Criterios de estabilidad:**
- Sistema opt-in claro
- No afecta performance
- GDPR compliant

**Versión estable:** v0.36.0

---

## Fase 36: Testing Beta (v0.37.0)

**Objetivo:** Segunda ronda de testing más amplia.

**Características principales:**
- Bug tracking extendido
- Feedback de 20-30 testers
- Testing en múltiples navegadores
- Testing en diferentes hardware


**Criterios de estabilidad:**
- 0 bugs críticos
- 0 bugs bloqueantes
- Performance aceptable en 90% configs

**Versión estable:** v0.37.0 (Beta)

---

## Fase 37: Corrección Post-Beta (v0.38.0)

**Objetivo:** Correcciones finales pre-release.

**Características principales:**
- Fix de todos los bugs beta
- Optimizaciones finales
- Pulido general
- Testing de regresión


**Criterios de estabilidad:**
- 100% bugs beta críticos resueltos
- No nuevos bugs introducidos
- Performance objetivo alcanzado

**Versión estable:** v0.38.0

---

## Fase 38: Documentación (v0.39.0)

**Objetivo:** Documentación completa del proyecto.

**Características principales:**
- README detallado
- Guía de instalación
- Troubleshooting guide
- Developer documentation
- Credits y licencias


**Criterios de estabilidad:**
- Documentación completa y clara
- Ejemplos funcionales
- FAQ útil

**Versión estable:** v0.39.0

---

## Fase 39: Release Candidate (v0.40.0)

**Objetivo:** Candidato final para lanzamiento.

**Características principales:**
- Testing exhaustivo final
- No nuevas features
- Solo bug fixes críticos
- Preparación de release


**Criterios de estabilidad:**
- 0 bugs conocidos críticos
- 0 bugs bloqueantes
- Testing en 10+ configuraciones OK

**Versión estable:** v0.40.0 (RC1)

---

## Fase 40: Landing Page (v0.41.0)

**Objetivo:** Sitio web del proyecto.

**Características principales:**
- Landing page HTML/CSS
- Screenshots y trailer
- Botón de jugar
- Links a documentación


**Criterios de estabilidad:**
- Site responsive
- Links funcionan
- Carga rápida

**Versión estable:** v0.41.0

---

## Fase 41: Pre-Launch Testing (v0.42.0)

**Objetivo:** Testing final pre-lanzamiento.

**Características principales:**
- Smoke testing completo
- Verificación de todos los sistemas
- Testing de deployment
- Backup de todo


**Criterios de estabilidad:**
- Todo funciona perfectamente
- Deploy process probado
- Rollback plan listo

**Versión estable:** v0.42.0

---

## Fase 42: Lanzamiento (v1.0.0)

**Objetivo:** Release oficial público.

**Características principales:**
- Deploy a hosting
- Anuncio público
- Monitoreo post-launch
- Soporte a usuarios


**Criterios de estabilidad:**
- Todos los criterios previos cumplidos
- Site accesible públicamente
- Sin issues críticos en primeras 24h

**Versión estable:** v1.0.0 (Lanzamiento oficial)

---

## Post-Lanzamiento (v1.1.0+)

**Posibles características futuras:**
- Multijugador básico
- Editor de niveles
- Mod support
- Nuevas áreas/contenido
- VR support
- Más opciones de personalización

---

## Notas de Desarrollo

### Criterios Generales de Estabilidad
Cada versión estable debe cumplir:
1. Sin errores críticos o bloqueantes conocidos
2. Rendimiento aceptable en hardware objetivo
3. Todas las características planificadas implementadas
4. Testing manual completado
5. Código revisado y documentado
6. Git tag creado con notas de release

### Flujo de Desarrollo
1. Desarrollo en rama `feature/*` o `dev`
2. Testing interno
3. Merge a `main` solo cuando se cumplan criterios
4. Tag de versión + release notes
5. Inicio de siguiente fase
