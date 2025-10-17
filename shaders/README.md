# Shaders

Este directorio contiene los shaders utilizados en el proyecto BoringWalk, organizados por API de renderizado.

## Estructura

```
shaders/
├── webgl/          # Shaders para WebGL 1.0 (GLSL ES 1.0)
│   ├── list.json   # Configuración de shaders
│   ├── color.vert
│   ├── color.frag
│   ├── texture.vert
│   └── texture.frag
├── webgl2/         # Shaders para WebGL 2.0 (GLSL ES 3.0)
│   ├── list.json
│   └── ...
└── webgpu/         # Shaders para WebGPU (WGSL)
    ├── list.json
    └── ...
```

## Sistema de Carga

Los shaders se cargan automáticamente según el renderer inicializado. El proceso es:

1. El `Renderer` determina qué API usar (webgl, webgl2, o webgpu)
2. Se carga el archivo `list.json` correspondiente
3. Se cargan los archivos de shader especificados en la lista
4. Los shaders se compilan y están disponibles en el engine

### Archivo list.json

Define los shaders disponibles para cada API:

```json
{
  "shaders": [
    {
      "name": "main",
      "description": "Shader de color básico",
      "vertex": "color.vert",
      "fragment": "color.frag",
      "uniforms": ["uModel", "uView", "uProjection"],
      "attributes": ["aPosition", "aColor"]
    }
  ]
}
```

## Uso desde el Código

```javascript
// Los shaders se cargan automáticamente en init()
const shaders = await renderer.loadShaders();

// El engine los compila automáticamente
for (const shader of shaders) {
    engine.createShader(shader.name, shader.vertexSource, shader.fragmentSource);
}

// Cambiar entre shaders
engine.useShader('main');     // Shader de colores
engine.useShader('texture');  // Shader de texturas
```

## Formatos por API

### WebGL / WebGL2
- `.vert` - Vertex Shader (GLSL)
- `.frag` - Fragment Shader (GLSL)

### WebGPU
- `.wgsl` - Compute/Vertex/Fragment Shader (WGSL)

## Añadir Nuevos Shaders

1. Crear los archivos del shader en el directorio apropiado
2. Agregar entrada en `list.json`
3. El sistema los cargará automáticamente
