# BoringWalk

**BoringWalk** es un simulador de caminata en 3D de mundo abierto, desarrollado desde cero con vanilla JavaScript y WebGL. El objetivo es crear una experiencia relajante de exploración donde el jugador puede caminar libremente por paisajes variados, disfrutando de la atmósfera visual y sonora del entorno.

## 🎮 Concepto del Juego

BoringWalk no tiene objetivos complejos, misiones o narrativa. Es simplemente un espacio para **caminar, explorar y desconectar**. El jugador se mueve por un mundo abierto con diferentes biomas, terrenos, agua, flora y fauna, disfrutando de la libertad de movimiento y la belleza del entorno.

### Características principales:
- 🌍 **Mundo abierto** explorable con múltiples biomas
- 🚶 **Walking simulator** sin combate ni mecánicas complejas
- 🎨 **Gráficos WebGL** renderizados en tiempo real
- 🌊 **Sistema de agua** con ríos, lagos y océano
- 🎵 **Audio espacial 3D** con música adaptativa
- 🦌 **Fauna del entorno** con animales animados
- 🌤️ **Sistema de clima dinámico** y ciclo día/noche
- 🎮 **Controles primera/tercera persona**

## 📋 Desarrollo por Fases

El proyecto se desarrolla siguiendo un **roadmap de 42 fases** (v0.1.0 a v1.0.0), donde cada fase culmina con una versión estable y jugable del juego. Este enfoque permite:

- ✅ **Versiones jugables desde el inicio** - Cada fase produce una build funcional
- 📦 **Releases incrementales** - Los usuarios pueden probar el juego mientras se desarrolla
- 🔄 **Iteración continua** - Feedback temprano para mejorar el desarrollo
- 📊 **Progreso visible** - Fácil seguimiento del avance del proyecto
- 🐛 **Estabilidad garantizada** - Cada versión cumple criterios estrictos de calidad

Puedes consultar el plan completo en [ROADMAP.md](ROADMAP.md).

### Estado actual: **Fase 0 (v0.1.0) ✅ Completada**

La arquitectura base ECS (Entity Component System) está implementada y funcional, con sistema de renderizado, físicas básicas y control del jugador.

## 🚀 Cómo Jugar

Este es un proyecto basado en navegador sin necesidad de build. Solo necesitas un servidor HTTP local:

```bash
# Opción 1: Python
python3 -m http.server 8000

# Opción 2: Node.js
npx serve
```

Luego abre en tu navegador:
- **Versión ECS (recomendada):** `http://localhost:8000/index_ecs.html`
- **Versión clásica:** `http://localhost:8000/index.html`

### Controles:
- **WASD** - Movimiento del jugador
- **Mouse** - Rotación de cámara (click para capturar puntero)
- **F3** - Toggle wireframe
- **F4** - Cambiar entre primera/tercera persona
- **F5** - Cambiar a cámara libre del mundo

## 🏗️ Arquitectura

BoringWalk utiliza una arquitectura **ECS (Entity Component System)** moderna con abstracción del motor WebGL:

```
src/
├── ecs/          # Core ECS (World, Entity, Component, System)
├── engine/       # WebGL Engine (Context, Shaders, Buffers, Textures)
├── components/   # Componentes ECS (Transform, MeshRenderer, etc.)
├── systems/      # Sistemas ECS (Render, Physics, Input)
├── geometry/     # Meshes (Terrain, Primitives)
└── math/         # Utilidades matemáticas (Vec3, Mat4)
```

## 📅 Próximas Fases

- **v0.2.0** - Sistema de texturas con texture splatting y height-based texturing
- **v0.3.0** - Iluminación básica (direccional + ambiental)
- **v0.4.0** - Props estáticos para poblar el mundo
- **v0.5.0** - Skybox y niebla atmosférica
- ...

Ver [ROADMAP.md](ROADMAP.md) para el plan completo de desarrollo.

## 🎯 Filosofía del Proyecto

BoringWalk es un proyecto experimental que busca:

1. **Simplicidad técnica** - Vanilla JS, sin frameworks pesados
2. **Desarrollo transparente** - Todo el código es open source
3. **Experiencia relajante** - Sin presiones, solo exploración
4. **Aprendizaje continuo** - Implementar sistemas 3D desde cero
5. **Comunidad constructiva** - Feedback y colaboración bienvenidos

## 🛠️ Stack Tecnológico

- **JavaScript (ES6)** - Lenguaje principal
- **WebGL** - Renderizado 3D
- **Web Audio API** - Sistema de audio espacial
- **HTML5 Canvas** - UI overlay
- **Sin dependencias externas** - Todo construido from scratch

## 📖 Documentación

- [ROADMAP.md](ROADMAP.md) - Plan de desarrollo completo
- [CLAUDE.md](CLAUDE.md) - Guías del proyecto y arquitectura
- Más documentación se añadirá en futuras fases

## 🤝 Contribuir

Este es un proyecto personal en desarrollo activo. Si quieres contribuir:

1. Revisa el [ROADMAP.md](ROADMAP.md) para ver las próximas fases
2. Abre un issue para discutir ideas o reportar bugs
3. Los pull requests son bienvenidos para mejoras o correcciones

## 📜 Licencia

Por definir. El proyecto será open source pero aún no se ha elegido licencia específica.

## 👤 Autor

Desarrollado por **Carlos Barcala Pérez**

---

**BoringWalk** - *A veces lo aburrido es lo que necesitas* 🚶‍♂️