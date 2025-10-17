# Ejemplo de Flujo - Sistema de Shaders

## Escenario: Inicialización de la Aplicación

### 1. Usuario Abre la Aplicación
```
Usuario → Navegador → index.html → main.js
```

### 2. Detección de API de Renderizado

```javascript
// main.js - línea ~50
async function init() {
    // Detectar automáticamente la mejor API disponible
    renderer = await Renderer.factory('webgl');
    
    console.log(`Renderer detectado: ${renderer.api.toUpperCase()}`);
    // Output: "Renderer detectado: WEBGL"
}
```

**Resultado:**
```
✓ WebGL disponible → WebGLRenderer creado
  renderer.api = 'webgl'
```

### 3. Carga de Shaders

```javascript
// main.js - continúa...
const shaders = await renderer.loadShaders();
```

**Detrás de escenas (Renderer.js):**

```javascript
async loadShaders() {
    // 1. Construir ruta basada en API
    const shaderBasePath = `../shaders/${this.api}`;  // '../shaders/webgl'
    
    // 2. Cargar configuración
    const listResponse = await fetch(`${shaderBasePath}/list.json`);
    const shaderList = await listResponse.json();
    
    // 3. Para cada shader en la lista...
    for (const shaderDef of shaderList.shaders) {
        // 3a. Cargar vertex shader
        const vertexSource = await this._loadShaderFile(
            `${shaderBasePath}/${shaderDef.vertex}`
        );
        // Carga: ../shaders/webgl/color.vert
        
        // 3b. Cargar fragment shader
        const fragmentSource = await this._loadShaderFile(
            `${shaderBasePath}/${shaderDef.fragment}`
        );
        // Carga: ../shaders/webgl/color.frag
        
        // 3c. Agregar a array de resultados
        loadedShaders.push({
            name: shaderDef.name,              // 'main'
            description: shaderDef.description, // 'Shader de color básico...'
            vertexSource,                       // Código GLSL del vertex shader
            fragmentSource,                     // Código GLSL del fragment shader
            uniforms: shaderDef.uniforms,      // ['uModel', 'uView', 'uProjection']
            attributes: shaderDef.attributes   // ['aPosition', 'aColor']
        });
    }
    
    return loadedShaders;
}
```

**Resultado:**
```javascript
[
  {
    name: 'main',
    description: 'Shader de color básico...',
    vertexSource: 'attribute vec3 aPosition;\n...',
    fragmentSource: 'precision mediump float;\n...',
    uniforms: ['uModel', 'uView', 'uProjection'],
    attributes: ['aPosition', 'aColor']
  },
  {
    name: 'texture',
    description: 'Shader de textura con displacement...',
    vertexSource: 'attribute vec3 aPosition;\n...',
    fragmentSource: 'precision mediump float;\n...',
    uniforms: ['uModel', 'uView', 'uProjection', 'uTexture', ...],
    attributes: ['aPosition', 'aTexCoord']
  }
]
```

### 4. Compilación de Shaders

```javascript
// main.js - continúa...
for (const shader of shaders) {
    engine.createShader(shader.name, shader.vertexSource, shader.fragmentSource);
    console.log(`✓ Shader '${shader.name}' creado: ${shader.description}`);
}

// Console output:
// ✓ Shader 'main' creado: Shader de color básico...
// ✓ Shader 'texture' creado: Shader de textura con displacement...
```

**Detrás de escenas (ShaderManager.js):**

```javascript
createShader(name, vertexSource, fragmentSource) {
    // 1. Compilar vertex shader
    const vertexShader = this.compileShader(vertexSource, gl.VERTEX_SHADER);
    
    // 2. Compilar fragment shader
    const fragmentShader = this.compileShader(fragmentSource, gl.FRAGMENT_SHADER);
    
    // 3. Enlazar programa
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    // 4. Guardar en mapa de programas
    this.programs.set(name, {
        program,
        vertexShader,
        fragmentShader
    });
}
```

### 5. Uso de Shaders

```javascript
// En cualquier parte de la aplicación...

// Renderizar geometría con colores
engine.useShader('main');
renderColoredGeometry();

// Renderizar terreno con texturas
engine.useShader('texture');
renderTerrain();
```

## Diagrama de Flujo Completo

```
┌──────────────┐
│   index.html │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   main.js    │
│   init()     │
└──────┬───────┘
       │
       ├─► 1. Renderer.factory('webgl')
       │   └─► WebGLRenderer creado
       │
       ├─► 2. renderer.loadShaders()
       │   │
       │   ├─► Fetch: shaders/webgl/list.json
       │   │   └─► { shaders: [...] }
       │   │
       │   ├─► Para cada shader en lista:
       │   │   ├─► Fetch: shaders/webgl/color.vert
       │   │   ├─► Fetch: shaders/webgl/color.frag
       │   │   ├─► Fetch: shaders/webgl/texture.vert
       │   │   └─► Fetch: shaders/webgl/texture.frag
       │   │
       │   └─► Retorna: [{ name, vertexSource, fragmentSource, ... }]
       │
       ├─► 3. engine.createShader(...) × 2
       │   └─► ShaderManager compila y enlaza
       │
       └─► 4. engine.useShader('main')
           └─► Shader activo listo para renderizar
```

## Ejemplo Real de Peticiones HTTP

Cuando la aplicación se carga:

```
GET /shaders/webgl/list.json
  ← 200 OK (152 bytes)
  
GET /shaders/webgl/color.vert
  ← 200 OK (287 bytes)
  
GET /shaders/webgl/color.frag
  ← 200 OK (134 bytes)
  
GET /shaders/webgl/texture.vert
  ← 200 OK (623 bytes)
  
GET /shaders/webgl/texture.frag
  ← 200 OK (198 bytes)
```

**Total:** ~1.4 KB de shaders cargados

## Ventaja del Sistema

Si mañana añadimos soporte para WebGL2:

```javascript
// NO requiere cambios en el código
renderer = await Renderer.factory('webgl2');
const shaders = await renderer.loadShaders();
// Automáticamente carga desde shaders/webgl2/
```

Los shaders se cargan desde `shaders/webgl2/` en lugar de `shaders/webgl/`, sin cambiar ni una línea de código de la aplicación! 🎉
