# Sistema de Shaders - BoringWalk

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        main.js                               │
│                     (Aplicación)                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ 1. Inicializa
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Renderer.factory()                        │
│              (Detección automática de API)                   │
└──────────┬──────────────┬──────────────┬────────────────────┘
           │              │              │
    ┌──────▼─────┐ ┌─────▼──────┐ ┌─────▼──────┐
    │  WebGL     │ │  WebGL2    │ │  WebGPU    │
    │  Renderer  │ │  Renderer  │ │  Renderer  │
    └──────┬─────┘ └─────┬──────┘ └─────┬──────┘
           │              │              │
           │ 2. loadShaders()            │
           │              │              │
    ┌──────▼─────┐ ┌─────▼──────┐ ┌─────▼──────┐
    │  webgl/    │ │  webgl2/   │ │  webgpu/   │
    │  list.json │ │  list.json │ │  list.json │
    └──────┬─────┘ └─────┬──────┘ └─────┬──────┘
           │              │              │
           │ 3. Carga shaders definidos  │
           │              │              │
    ┌──────▼─────┐ ┌─────▼──────┐ ┌─────▼──────┐
    │ *.vert     │ │ *.vert     │ │ *.wgsl     │
    │ *.frag     │ │ *.frag     │ │            │
    └──────┬─────┘ └─────┬──────┘ └─────┬──────┘
           │              │              │
           └──────────────┴──────────────┘
                           │
                           │ 4. Retorna shaders cargados
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      ShaderManager                           │
│              (Compila y gestiona shaders)                    │
└─────────────────────────────────────────────────────────────┘
```

## Flujo de Carga

1. **Inicialización del Renderer**
   ```javascript
   renderer = await Renderer.factory('webgl');
   ```

2. **Carga de Shaders**
   ```javascript
   const shaders = await renderer.loadShaders();
   // Retorna: [{ name, description, vertexSource, fragmentSource, uniforms, attributes }, ...]
   ```

3. **Compilación en el Engine**
   ```javascript
   for (const shader of shaders) {
       engine.createShader(shader.name, shader.vertexSource, shader.fragmentSource);
   }
   ```

4. **Uso en la Aplicación**
   ```javascript
   engine.useShader('main');     // Cambiar a shader de colores
   engine.useShader('texture');  // Cambiar a shader de texturas
   ```

## Ventajas del Sistema

### ✅ Desacoplamiento
- Los shaders están separados del código de la aplicación
- Fácil de mantener y editar

### ✅ Flexibilidad
- Diferentes shaders para diferentes APIs (WebGL, WebGL2, WebGPU)
- Soporte para múltiples versiones de GLSL/WGSL

### ✅ Escalabilidad
- Añadir nuevos shaders es tan simple como:
  1. Crear los archivos .vert/.frag
  2. Agregar entrada en list.json

### ✅ Configuración Declarativa
- `list.json` documenta automáticamente los shaders disponibles
- Incluye metadata (uniforms, attributes, descripción)

### ✅ Detección Automática
- El sistema carga automáticamente los shaders correctos según el renderer
- No requiere cambios en el código de la aplicación

## Ejemplo de list.json

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
    },
    {
      "name": "pbr",
      "description": "Physically Based Rendering",
      "vertex": "pbr.vert",
      "fragment": "pbr.frag",
      "uniforms": ["uModel", "uView", "uProjection", "uLights"],
      "attributes": ["aPosition", "aNormal", "aTexCoord"]
    }
  ]
}
```

## Añadir Nuevos Shaders

1. **Crear archivos de shader** en el directorio apropiado:
   ```
   shaders/webgl/mi_shader.vert
   shaders/webgl/mi_shader.frag
   ```

2. **Actualizar list.json**:
   ```json
   {
     "name": "mi_shader",
     "description": "Mi nuevo shader increíble",
     "vertex": "mi_shader.vert",
     "fragment": "mi_shader.frag",
     "uniforms": ["uModel", "uView"],
     "attributes": ["aPosition"]
   }
   ```

3. **Usar en la aplicación**:
   ```javascript
   engine.useShader('mi_shader');
   ```

¡Eso es todo! El sistema se encarga del resto automáticamente.

## Testing

Para probar el sistema de carga de shaders, incluye el script de test:

```html
<script src="shaders/test-loader.js"></script>
```

Esto agregará un botón "Test Shader Loading" que verifica que todos los shaders se cargan correctamente.
