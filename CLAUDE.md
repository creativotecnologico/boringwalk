# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BoringWalk is a 3D walking simulator built from scratch using vanilla JavaScript and WebGL. The project implements two parallel architectures:

1. **Original architecture** (index.html + src/main.js) - Object-oriented approach with entity classes
2. **ECS architecture** (index_ecs.html + src/main_ecs.js) - Entity Component System pattern with WebGL engine abstraction

Both architectures implement the same functionality: a first/third-person walking simulator with terrain collision and camera controls.

## Running the Project

This is a browser-based project with no build step. To run:

1. Serve the directory with any HTTP server (required for ES modules):
   ```bash
   python3 -m http.server 8000
   # or
   npx serve
   ```

2. Open in browser:
   - ECS architecture: `http://localhost:8000/index_ecs.html`

## Controls

- **WASD** - Player movement
- **Mouse** - Camera rotation (click to capture pointer)
- **F3** - Toggle wireframe mode
- **F4** - Toggle first/third person view
- **F5** - Switch between player camera and free world camera

## Architecture Overview

### Original Architecture (index.html)

Classic object-oriented design:
- **Renderer** (src/core/Renderer.js) - WebGL context and canvas management
- **Shader** (src/core/Shader.js) - Shader program compilation and uniform management
- **Camera** (src/core/Camera.js) - Perspective projection matrix
- **Entities** (src/entities/) - Player, Terrain, Square classes
- **Controls** (src/controls/FirstPersonControls.js) - Mouse and keyboard input

### ECS Architecture (index_ecs.html)

Entity Component System pattern with engine abstraction:

**Core ECS** (src/ecs/):
- **World** - Manages all entities and systems
- **Entity** - Container for components
- **Component** - Pure data (Transform, MeshRenderer, PlayerController, etc.)
- **System** - Logic that operates on entities with specific components

**WebGL Engine** (src/engine/):
- **WebGLEngine** - Main engine facade that coordinates:
  - **WebGLContext** - Context initialization and canvas management
  - **ShaderManager** - Shader program creation and uniform handling
  - **BufferManager** - Vertex/index buffer management

**Systems** (src/systems/):
- **RenderSystem** - Renders entities with Transform + MeshRenderer components
- **PhysicsSystem** - Handles terrain collision for entities with Collider component
- **InputSystem** - Keyboard input state management

**Components** (src/components/):
- **Transform** - Position, rotation, scale, and model matrix
- **MeshRenderer** - Mesh reference and visibility flag
- **PlayerController** - Player movement, camera, and view mode
- **WorldCameraController** - Free-floating camera controls
- **Collider** - Collision shape (capsule) and bounds

### Math Library (src/math/)

- **Vec3** - 3D vector operations
- **Mat4** - 4x4 matrix operations (model, view, projection matrices)

### Geometry (src/geometry/)

- **Geometry** (original) - Vertex/index buffer management for original architecture
- **Mesh** (ECS) - Base mesh class with render methods
- **Primitives** - Factory for capsule and axis meshes
- **TerrainMesh** - Procedural terrain generation with height sampling

## Key Implementation Details

### ECS Entity Creation Pattern

```javascript
const entity = world.createEntity('EntityName');
entity.addComponent(new Transform(new Vec3(x, y, z)));
entity.addComponent(new MeshRenderer(mesh));
```

### System Registration

Systems automatically track entities with required components:
```javascript
class MySystem extends System {
    constructor() {
        super();
        this.requiredComponents = [Transform, MeshRenderer];
    }
}
```

### Terrain Collision

Both architectures use height-based collision. The terrain generates heights using sine waves:
```javascript
terrain.getHeightAt(x, z) // Returns Y coordinate
```

### Camera Modes

Both architectures support three camera modes:
- **Player First Person** - Camera at player eye level
- **Player Third Person** - Camera behind and above player
- **World Free Camera** - Orbital camera independent of player

### Shader Pipeline

Both use the same vertex/fragment shaders:
- Vertex shader: Transforms position through model-view-projection matrices
- Fragment shader: Applies vertex colors
- Shaders defined inline in main.js and main_ecs.js

## File Loading Order

Scripts must be loaded in dependency order (see index_ecs.html lines 25-62):
1. Math utilities (Vec3, Mat4)
2. Engine layer (WebGLContext, ShaderManager, BufferManager, WebGLEngine)
3. ECS core (Component, Entity, System, World)
4. Components (Transform, MeshRenderer, etc.)
5. Systems (RenderSystem, PhysicsSystem, InputSystem)
6. Geometry (Mesh, Primitives, TerrainMesh)
7. Main entry point (main_ecs.js)

## Asset Organization

### Texture Directory Structure

```
./data/textures/
  ├── terrain/     # Terrain textures
  ├── props/       # Object/prop textures
  └── ui/          # UI textures
```

### Texture Naming Convention

Textures follow a standardized naming pattern: `[material]_[type].[ext]`

**Texture Types:**
- `_diffuse` or `_albedo` - Base color map
- `_disp` or `_height` - Displacement/height map (grayscale)
- `_normal` - Normal map
- `_roughness` - Roughness map
- `_metallic` - Metallic map
- `_ao` - Ambient occlusion map

**Examples:**
- `grass_diffuse.jpg` - Grass color texture
- `grass_disp.jpg` - Grass height map
- `rock_normal.png` - Rock normal map

**Recommended Texture Sizes:**
- Terrain textures: 1024x1024 (tileable)
- Props/objects: 512x512 or 1024x1024
- UI elements: 256x256 or 512x512
- Always use power-of-2 dimensions for optimal WebGL performance

## Development Notes

- No transpilation or bundling - pure ES5 classes loaded via script tags
- All files use class-based architecture (ES6 classes with ES5 semantics)
- WebGL uses attribute/uniform names prefixed with 'a' and 'u' respectively
- The ECS architecture is the newer, more maintainable implementation
- Player state is persisted to localStorage (position, rotation, view mode)
