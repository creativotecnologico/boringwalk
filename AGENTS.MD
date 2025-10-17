# Repository Guidelines

## Project Structure & Module Organization
BoringWalk is a browser-based 3D walking simulator. The entry point `index.html` streams ECS-style modules from `src/`, where `components/`, `systems/`, and `ecs/` implement the entity-component-system core, `engine/` wraps WebGL context, `geometry/` builds procedural meshes, and `math/` provides vector and matrix primitives. Domain-specific helpers live under `entities/` and shared UI styles sit in `style.css`. Runtime assets are versioned in `data/textures/` (organized by terrain, props, ui), while `resources/` holds larger raw texture packs; use those as sources, not direct imports. `terrain.html` plus its minimal scripts offer a stripped-down harness for terrain experiments.

## Build, Test, and Development Commands
- `python3 -m http.server 8000` — serve the repo root so script tags can load modules without CORS issues.
- `npx serve` — alternative static server if Node tooling is preferred.
- Navigate to `http://localhost:8000/index.html` for the main experience or `terrain.html` for terrain-only checks; stop the server with Ctrl+C.

## Coding Style & Naming Conventions
Stick to vanilla ES2015 classes with four-space indentation and trailing commas avoided. Files that declare classes use PascalCase (`src/components/Transform.js`), while utilities stay lowerCamel (`src/math/vecUtils.js` if introduced). Keep functions and variables camelCase, constants SCREAMING_SNAKE_CASE, and reuse existing shader and texture ids to prevent duplication. Run `eslint` locally if you add it, but match the current formatting when touching legacy files.

## Testing Guidelines
There is no automated harness yet; rely on manual verification. After changes, launch the server, ensure FPS, vertex/triangle counts, and player/camera readouts update sensibly, and exercise both player and free-camera modes. Use `terrain.html` to isolate terrain mesh or shader tweaks before merging.

## Commit & Pull Request Guidelines
Current history favors concise, descriptive commits (`Initial commit: BoringWalk 3D walking simulator`). Follow that shape: imperative mood, <=72 characters when possible, and elaborate in the body if needed. Pull requests should include a short problem/solution summary, manual test notes (what pages you loaded, key controls used), linked issues when applicable, and screenshots or GIFs whenever visuals change.

## Assets & Configuration Tips
Texture paths are case sensitive; keep exported assets under `data/textures/**` and update references in `src/main.js`'s texture manager calls. Large source images remain in `resources/`; compress before promoting them to `data/`. When adding shaders, register them through `WebGLEngine.createShader` to keep pipeline configuration centralized.