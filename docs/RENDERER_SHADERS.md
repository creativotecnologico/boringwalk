# Gestión de Shaders en Renderer

## Cambios Implementados

### Movido la compilación de shaders al Renderer

Ahora la clase `Renderer` es responsable de:
1. **Cargar** los shaders desde archivos (método `loadShaders()`)
2. **Compilar** los shaders según la API (método `createShader()`)
3. **Activar** shaders (método `useShader()`)

### Arquitectura

```
┌─────────────────────────────────────┐
│          Renderer Base              │
│  ┌───────────────────────────────┐  │
│  │ loadShaders()                 │  │ ← Carga desde shaders/{api}/list.json
│  │  - Lee list.json              │  │
│  │  - Carga archivos .vert/.frag │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ createShader(name, vs, fs)    │  │ ← Compila shaders
│  │  - Compila vertex shader      │  │
│  │  - Compila fragment shader    │  │
│  │  - Enlaza programa            │  │
│  │  - Guarda en Map<name, prog> │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ useShader(name)               │  │ ← Activa shader
│  │  - gl.useProgram(...)         │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
           ▲           ▲           ▲
           │           │           │
    ┌──────┴─────┐ ┌──┴────┐ ┌────┴─────┐
    │  WebGL     │ │WebGL2 │ │  WebGPU  │
    │  Renderer  │ │Render.│ │ Renderer │
    └────────────┘ └───────┘ └──────────┘
```

### Métodos Implementados

#### 1. `loadShaders()` - Heredado de Renderer base
```javascript
async loadShaders() {
    // 1. Carga list.json según API
    const shaderList = await fetch(`../shaders/${this.api}/list.json`);
    
    // 2. Para cada shader, carga vertex y fragment
    for (const shaderDef of shaderList.shaders) {
        const vertexSource = await this._loadShaderFile(...);
        const fragmentSource = await this._loadShaderFile(...);
        loadedShaders.push({ name, vertexSource, fragmentSource, ... });
    }
    
    return loadedShaders;
}
```

#### 2. `createShader(name, vertexSource, fragmentSource)` - En Renderer base
```javascript
createShader(name, vertexSource, fragmentSource) {
    // WebGL / WebGL2
    if (this.api === 'webgl' || this.api === 'webgl2') {
        const gl = this.gl;
        
        // Compilar shaders
        const vertexShader = this._compileShader(gl, vertexSource, gl.VERTEX_SHADER);
        const fragmentShader = this._compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER);
        
        // Enlazar programa
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        
        // Validar
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error(`No se pudo enlazar el shader '${name}'`);
        }
        
        // Guardar
        this.shaders.set(name, {
            program,
            vertexShader,
            fragmentShader,
            uniforms: new Map(),
            attributes: new Map()
        });
        
        return program;
    }
    
    // WebGPU - TODO
    else if (this.api === 'webgpu') {
        throw new Error('WebGPU shaders no implementados aún');
    }
}
```

#### 3. `_compileShader(gl, source, type)` - Helper privado
```javascript
_compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compilando shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    
    return shader;
}
```

#### 4. `useShader(name)` - Activar shader
```javascript
useShader(name) {
    const shader = this.shaders.get(name);
    
    if (!shader) {
        console.warn(`Shader '${name}' no encontrado`);
        return null;
    }
    
    // WebGL / WebGL2
    if (this.api === 'webgl' || this.api === 'webgl2') {
        this.gl.useProgram(shader.program);
        this.currentShader = shader;
    }
    
    return shader;
}
```

### Uso desde main.js

```javascript
async function init() {
    // 1. Crear renderer
    renderer = await Renderer.factory('webgl');
    
    // 2. Cargar shaders
    const shaders = await renderer.loadShaders();
    
    // 3. Compilar shaders
    for (const shader of shaders) {
        renderer.createShader(shader.name, shader.vertexSource, shader.fragmentSource);
    }
    
    // 4. Activar shader
    renderer.useShader('main');
}
```

### Ventajas

✅ **Encapsulación**: El renderer maneja toda la lógica de shaders
✅ **Consistencia**: Mismo código para WebGL y WebGL2
✅ **Extensibilidad**: Fácil añadir soporte para WebGPU
✅ **Independencia**: No depende de un "engine" externo
✅ **Reutilización**: Los métodos helper son compartidos

### Compatibilidad

#### WebGL 1.0 ✅
- Compilación GLSL ES 1.0
- `gl.createShader`, `gl.shaderSource`, `gl.compileShader`
- `gl.createProgram`, `gl.attachShader`, `gl.linkProgram`

#### WebGL 2.0 ✅
- Mismo proceso que WebGL 1.0
- Soporta GLSL ES 3.0 (shaders más avanzados)

#### WebGPU ⏳
- TODO: Implementar con WGSL
- Diferente API: `device.createShaderModule()`

### Estado de las Propiedades

Cada renderer ahora tiene:
```javascript
{
    api: 'webgl' | 'webgl2' | 'webgpu',
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    canvas: HTMLCanvasElement,
    shaders: Map<string, ShaderProgram>,
    currentShader: ShaderProgram | null
}
```

### Migración

**Antes:**
```javascript
engine.createShader('main', vertexSource, fragmentSource);
engine.useShader('main');
```

**Ahora:**
```javascript
renderer.createShader('main', vertexSource, fragmentSource);
renderer.useShader('main');
```

Si existe un `engine` separado, se puede mantener compatibilidad:
```javascript
// Compilar en renderer
renderer.createShader('main', vertexSource, fragmentSource);

// También registrar en engine (si existe)
if (engine && engine.createShader) {
    engine.createShader('main', vertexSource, fragmentSource);
}
```

### Próximos Pasos

- [ ] Implementar `createShader()` para WebGPU (WGSL)
- [ ] Añadir métodos helper para obtener ubicaciones de uniforms/attributes
- [ ] Implementar caché de shaders compilados
- [ ] Añadir validación avanzada de shaders
- [ ] Hot-reload de shaders en desarrollo

### Ejemplo Completo

```javascript
// Inicialización
const renderer = await Renderer.factory('webgl');
const shaders = await renderer.loadShaders();

// Compilación
for (const shader of shaders) {
    try {
        renderer.createShader(shader.name, shader.vertexSource, shader.fragmentSource);
        console.log(`✓ Shader '${shader.name}' compilado exitosamente`);
    } catch (error) {
        console.error(`✗ Error compilando shader '${shader.name}':`, error);
    }
}

// Uso
renderer.useShader('main');        // Shader de colores
// ... renderizar geometría ...

renderer.useShader('texture');     // Shader de texturas
// ... renderizar terreno ...
```

## Resumen

Ahora el **Renderer** es completamente autónomo para manejar shaders:
1. **Carga** desde archivos
2. **Compila** según API
3. **Activa** para uso
4. **Gestiona** caché de programas

Todo centralizado y con la misma interfaz para WebGL, WebGL2 y (futuro) WebGPU. 🎨✨
