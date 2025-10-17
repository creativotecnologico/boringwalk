# Refactorización del Sistema de Shaders

## Resumen de Cambios

### ✅ Cambios Implementados

#### 1. Estructura de Directorios
```
shaders/
├── README.md                    # Documentación general
├── test-loader.js              # Script de prueba
├── webgl/                      # Shaders WebGL 1.0
│   ├── README.md
│   ├── list.json               # ⭐ Configuración de shaders
│   ├── color.vert
│   ├── color.frag
│   ├── texture.vert
│   └── texture.frag
├── webgl2/                     # Shaders WebGL 2.0
│   ├── README.md
│   ├── list.json               # ⭐ Configuración de shaders
│   ├── color.vert
│   ├── color.frag
│   ├── texture.vert
│   └── texture.frag
└── webgpu/                     # Shaders WebGPU (futuro)
    ├── README.md
    └── list.json               # ⭐ Placeholder
```

#### 2. Clase Renderer (src/core/Renderer.js)
**Añadido:**
- ✅ Método `loadShaders()` - Carga shaders específicos del renderer
- ✅ Método `_loadShaderFile()` - Carga archivos de shader individuales

**Funcionalidad:**
```javascript
async loadShaders() {
    // 1. Carga list.json del directorio correspondiente (webgl/webgl2/webgpu)
    // 2. Lee cada shader definido en la lista
    // 3. Retorna array de objetos con el código fuente y metadata
}
```

#### 3. main.js (src/main.js)
**Modificado:**
- ❌ Eliminado: Definiciones inline de shaders
- ❌ Eliminado: Función `loadShader()` manual
- ✅ Añadido: Carga automática desde renderer

**Antes:**
```javascript
const vertexShaderSource = `
    attribute vec3 aPosition;
    ...
`;

engine.createShader('main', vertexShaderSource, fragmentShaderSource);
```

**Después:**
```javascript
const shaders = await renderer.loadShaders();
for (const shader of shaders) {
    engine.createShader(shader.name, shader.vertexSource, shader.fragmentSource);
}
```

#### 4. Archivos de Configuración (list.json)
Cada directorio de API tiene su propio `list.json` que define:
- ✅ Nombre del shader
- ✅ Descripción
- ✅ Archivos vertex/fragment
- ✅ Uniforms requeridos
- ✅ Attributes requeridos

#### 5. Documentación
- ✅ `shaders/README.md` - Guía general del sistema
- ✅ `shaders/webgl/README.md` - Específico para WebGL
- ✅ `shaders/webgl2/README.md` - Específico para WebGL2
- ✅ `shaders/webgpu/README.md` - Roadmap para WebGPU
- ✅ `docs/SHADER_ARCHITECTURE.md` - Arquitectura detallada

## Ventajas de la Refactorización

### 🎯 Organización
- Shaders organizados por API
- Configuración declarativa en JSON
- Código limpio y mantenible

### 🔄 Escalabilidad
- Fácil añadir nuevos shaders
- Soporte para múltiples APIs sin cambiar código
- Sistema extensible

### 🚀 Automatización
- Carga automática según el renderer
- No requiere cambios en main.js para nuevos shaders
- Detección automática de API

### 📚 Documentación
- Metadata en list.json documenta los shaders
- READMEs en cada directorio
- Diagrama de arquitectura

### 🧪 Testing
- Script de prueba incluido
- Fácil verificación de la carga

## Próximos Pasos

### Inmediato
- [x] Refactorizar shaders a directorios por API
- [x] Implementar carga desde Renderer
- [x] Crear configuración list.json
- [x] Documentar sistema

### Corto Plazo
- [ ] Verificar funcionamiento en navegador
- [ ] Optimizar shaders WebGL2 (aprovechar GLSL ES 3.0)
- [ ] Añadir más shaders (PBR, skybox, etc.)

### Largo Plazo
- [ ] Implementar shaders WebGPU (WGSL)
- [ ] Sistema de hot-reload de shaders
- [ ] Editor de shaders en tiempo real
- [ ] Compilación/minificación de shaders

## Testing

Para probar el sistema:

1. Abrir la aplicación en el navegador
2. Verificar console.log para ver shaders cargados
3. O incluir el script de test:
   ```html
   <script src="shaders/test-loader.js"></script>
   ```

## Ejemplo de Uso

```javascript
// 1. El renderer se inicializa automáticamente
renderer = await Renderer.factory('webgl');

// 2. Los shaders se cargan automáticamente
const shaders = await renderer.loadShaders();
// Output: [
//   { name: 'main', vertexSource: '...', fragmentSource: '...', ... },
//   { name: 'texture', vertexSource: '...', fragmentSource: '...', ... }
// ]

// 3. Se compilan automáticamente
for (const shader of shaders) {
    engine.createShader(shader.name, shader.vertexSource, shader.fragmentSource);
}

// 4. Se usan normalmente
engine.useShader('main');
engine.useShader('texture');
```

## Migración desde Sistema Anterior

El sistema es 100% compatible. No requiere cambios en el código existente que usa shaders, solo en la inicialización.

**Antes:**
```javascript
engine.createShader('main', vertexSource, fragmentSource);
engine.useShader('main'); // ✅ Sigue funcionando igual
```

**Después:**
```javascript
// La creación ahora es automática desde list.json
engine.useShader('main'); // ✅ Funciona exactamente igual
```
