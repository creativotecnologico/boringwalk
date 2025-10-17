# Clase Engine

La clase `Engine` es el punto de entrada principal para trabajar con el sistema de renderizado. Encapsula el renderer y proporciona una API unificada para gestionar shaders, buffers, texturas y estado de renderizado.

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                     Engine                           │
│  ┌───────────────────────────────────────────────┐  │
│  │  renderer: Renderer                           │  │
│  │  gl: WebGLRenderingContext                    │  │
│  │  shaderManager: ShaderManager                 │  │
│  │  bufferManager: BufferManager                 │  │
│  │  textureManager: TextureManager               │  │
│  │  wireframeMode: boolean                       │  │
│  └───────────────────────────────────────────────┘  │
│                                                      │
│  Métodos:                                            │
│  ├─ Renderizado: clear(), getAspectRatio()          │
│  ├─ Shaders: createShader(), useShader()            │
│  ├─ Uniforms: setUniformMatrix4fv(), etc.           │
│  ├─ Buffers: createVertexBuffer(), etc.             │
│  ├─ Dibujo: drawArrays(), drawElements()            │
│  └─ Estado: enableDepthTest(), etc.                 │
└─────────────────────────────────────────────────────┘
           │
           │ contiene
           ▼
┌─────────────────────────────────────────────────────┐
│                  Renderer                            │
│  ┌───────────────────────────────────────────────┐  │
│  │  api: 'webgl' | 'webgl2' | 'webgpu'          │  │
│  │  gl: WebGLRenderingContext                    │  │
│  │  canvas: HTMLCanvasElement                    │  │
│  │  shaders: Map<name, program>                  │  │
│  └───────────────────────────────────────────────┘  │
│                                                      │
│  Métodos:                                            │
│  ├─ loadShaders() - Carga desde archivos            │
│  ├─ createShader() - Compila shaders                │
│  └─ useShader() - Activa shader                     │
└─────────────────────────────────────────────────────┘
```

## Creación del Engine

### Factory Method

```javascript
const engine = await Engine.create('webgl'); // o 'webgl2', 'webgpu'
```

El método estático `create()`:
1. Crea el renderer apropiado
2. Configura el contexto WebGL (depth test, blending, etc.)
3. Habilita extensiones necesarias
4. Inicializa los managers
5. Retorna la instancia de Engine lista para usar

### Construcción Manual

```javascript
const renderer = await Renderer.factory('webgl');
const engine = new Engine(renderer);
```

## API del Engine

### 🎨 Renderizado

#### `clear(r, g, b, a)`
Limpia el buffer de color y profundidad.
```javascript
engine.clear(); // Negro por defecto
engine.clear(0.1, 0.1, 0.1, 1.0); // Gris oscuro
```

#### `getAspectRatio()`
Obtiene la relación de aspecto del canvas.
```javascript
const aspect = engine.getAspectRatio(); // width / height
```

### 🎭 Shaders

#### `createShader(name, vertexSource, fragmentSource)`
Compila y crea un programa de shader.
```javascript
engine.createShader('main', vertexShader, fragmentShader);
```

#### `useShader(name)`
Activa un shader previamente compilado.
```javascript
engine.useShader('main');
```

### 📊 Uniforms

#### `setUniformMatrix4fv(name, value)`
Establece una matriz 4x4.
```javascript
engine.setUniformMatrix4fv('uModel', modelMatrix.elements);
```

#### `setUniform3f(name, x, y, z)`
Establece un vector de 3 componentes.
```javascript
engine.setUniform3f('uColor', 1.0, 0.0, 0.0); // Rojo
```

#### `setUniform1f(name, value)`
Establece un float.
```javascript
engine.setUniform1f('uTime', time);
```

#### `setUniform1i(name, value)`
Establece un entero (útil para samplers).
```javascript
engine.setUniform1i('uTexture', 0); // Textura en unidad 0
```

### 📦 Buffers

#### `createVertexBuffer(name, data, usage)`
Crea un buffer de vértices.
```javascript
const vertices = [0, 0, 0, 1, 0, 0, 1, 1, 0];
engine.createVertexBuffer('myVertices', vertices, gl.STATIC_DRAW);
```

#### `createIndexBuffer(name, data, usage)`
Crea un buffer de índices.
```javascript
const indices = [0, 1, 2];
engine.createIndexBuffer('myIndices', indices, gl.STATIC_DRAW);
```

#### `bindAttribute(buffer, attributeName, size, type, normalized, stride, offset)`
Vincula un buffer a un atributo del shader.
```javascript
engine.bindAttribute(vertexBuffer, 'aPosition', 3, gl.FLOAT, false, 0, 0);
```

### 🖼️ Dibujo

#### `drawArrays(mode, first, count)`
Dibuja usando arrays.
```javascript
engine.drawArrays(gl.TRIANGLES, 0, vertexCount);
```

#### `drawElements(mode, count, type, offset)`
Dibuja usando índices.
```javascript
engine.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
```

### ⚙️ Estado de Renderizado

#### `enableDepthTest()` / `disableDepthTest()`
```javascript
engine.enableDepthTest();
```

#### `enableBlend()` / `disableBlend()`
```javascript
engine.enableBlend();
```

#### `setCullFace(enabled)`
```javascript
engine.setCullFace(true); // Activa backface culling
```

### 📋 Información

#### `getInfo()`
Obtiene información del sistema de renderizado.
```javascript
const info = engine.getInfo();
console.log(info.renderer);           // "WebGL 2.0"
console.log(info.vendor);             // "WebKit"
console.log(info.maxTextureSize);     // 16384
```

## Managers Internos

El engine proporciona acceso directo a los managers:

### ShaderManager
```javascript
engine.shaderManager.createProgram(name, vs, fs);
engine.shaderManager.useProgram(name);
engine.shaderManager.getUniformLocation(name);
engine.shaderManager.getAttributeLocation(name);
```

### BufferManager
```javascript
engine.bufferManager.createVertexBuffer(name, data);
engine.bufferManager.createIndexBuffer(name, data);
engine.bufferManager.getBuffer(name);
```

### TextureManager
```javascript
engine.textureManager.loadTexture(url, name);
engine.textureManager.bindTexture(name, unit);
engine.textureManager.loadImageData(url, callback);
```

## Ejemplo de Uso Completo

```javascript
// 1. Inicializar
async function init() {
    // Crear engine
    const engine = await Engine.create('webgl');
    
    // Cargar shaders
    const shaders = await engine.renderer.loadShaders();
    for (const shader of shaders) {
        engine.createShader(shader.name, shader.vertexSource, shader.fragmentSource);
    }
    
    // Cargar texturas
    engine.textureManager.loadTexture('./texture.png', 'myTexture');
    
    // Crear geometría
    const vertices = [/* ... */];
    const indices = [/* ... */];
    const vertexBuffer = engine.createVertexBuffer('verts', vertices);
    const indexBuffer = engine.createIndexBuffer('indices', indices);
    
    return engine;
}

// 2. Renderizar
function render(engine, modelMatrix, viewMatrix, projectionMatrix) {
    // Limpiar
    engine.clear(0.1, 0.1, 0.1);
    
    // Activar shader
    engine.useShader('main');
    
    // Establecer uniforms
    engine.setUniformMatrix4fv('uModel', modelMatrix.elements);
    engine.setUniformMatrix4fv('uView', viewMatrix.elements);
    engine.setUniformMatrix4fv('uProjection', projectionMatrix.elements);
    
    // Vincular atributos
    engine.bindAttribute(vertexBuffer, 'aPosition', 3, engine.gl.FLOAT, false, 0, 0);
    
    // Dibujar
    engine.gl.bindBuffer(engine.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    engine.drawElements(engine.gl.TRIANGLES, indexCount, engine.gl.UNSIGNED_SHORT, 0);
}
```

## Ventajas

✅ **API Unificada**: Una sola interfaz para todo el sistema de renderizado
✅ **Encapsulación**: Toda la complejidad de WebGL está oculta
✅ **Managers Integrados**: Shaders, buffers y texturas en un solo lugar
✅ **Extensible**: Fácil añadir nuevas funcionalidades
✅ **Compatible**: Funciona con WebGL, WebGL2 y (futuro) WebGPU

## Integración con el Renderer

El engine usa internamente el renderer para:
- Detectar la API disponible (WebGL, WebGL2, WebGPU)
- Acceder al contexto WebGL
- Cargar shaders desde archivos
- Gestionar el canvas

Pero expone una API más simple y completa para el resto de la aplicación.

## Migración

**Antes** (sin Engine):
```javascript
const renderer = await Renderer.factory('webgl');
const gl = renderer.gl;
const shaderManager = new ShaderManager(gl);
const textureManager = new TextureManager(gl);
// ... configurar todo manualmente
```

**Ahora** (con Engine):
```javascript
const engine = await Engine.create('webgl');
// Todo listo para usar!
```

## Próximos Pasos

- [ ] Añadir soporte para framebuffers
- [ ] Implementar sistema de luces
- [ ] Añadir profiling/stats de renderizado
- [ ] Soporte para instanced rendering
- [ ] Hot-reload de shaders en desarrollo

## Resumen

La clase `Engine` es el punto central de toda la funcionalidad de renderizado:
1. **Inicialización simple** con `Engine.create()`
2. **API completa** para shaders, buffers, texturas
3. **Managers integrados** para gestión de recursos
4. **Configuración automática** de WebGL

Todo lo que necesitas para renderizar en un solo lugar. 🚀✨
