# Sistema de Resoluciones - Engine

El Engine incluye un sistema completo de gestión de resoluciones con presets predefinidos y soporte para resoluciones personalizadas.

## Resoluciones Predefinidas

```javascript
Engine.RESOLUTIONS = {
    '720p':  { width: 1280, height: 720,  label: 'HD (1280x720)' },
    '1080p': { width: 1920, height: 1080, label: 'Full HD (1920x1080)' },
    '1440p': { width: 2560, height: 1440, label: '2K (2560x1440)' },
    '4k':    { width: 3840, height: 2160, label: '4K (3840x2160)' },
    'custom': { width: 800, height: 600, label: 'Custom (800x600)' }
};

// Resolución por defecto
Engine.DEFAULT_RESOLUTION = '1080p'; // Full HD
```

## Uso

### Crear Engine con Resolución Específica

```javascript
// Usar resolución por defecto (1080p)
const engine = await Engine.create('webgl');

// Especificar resolución
const engine = await Engine.create('webgl', '720p');
const engine = await Engine.create('webgl', '1440p');
const engine = await Engine.create('webgl', '4k');
```

### Cambiar Resolución en Tiempo de Ejecución

```javascript
// Cambiar a una resolución predefinida
engine.setResolution('1080p');
engine.setResolution('4k');

// Con sincronización de canvas de texto
engine.setResolution('1440p', textCanvas);
```

### Resolución Personalizada

```javascript
// Establecer resolución custom
engine.setCustomResolution(1366, 768);

// Con sincronización de canvas de texto
engine.setCustomResolution(2048, 1152, textCanvas);
```

### Obtener Información de Resolución

```javascript
// Obtener resolución actual
const resolution = engine.getResolution();
console.log(resolution);
// { width: 1920, height: 1080, label: 'Full HD (1920x1080)' }

// Listar todas las resoluciones disponibles
const available = engine.getAvailableResolutions();
console.log(available);
// [
//   { key: '720p', width: 1280, height: 720, label: 'HD (1280x720)' },
//   { key: '1080p', width: 1920, height: 1080, label: 'Full HD (1920x1080)' },
//   ...
// ]

// Obtener clave de resolución actual
console.log(engine.currentResolution); // '1080p'
```

## Sincronización de Canvas

El sistema permite sincronizar automáticamente un canvas de texto (overlay) con el canvas principal:

```javascript
// En la inicialización
const textCanvas = document.getElementById('textCanvas');

// Al establecer resolución
engine.setResolution('1080p', textCanvas);

// Canvas principal y canvas de texto ahora tienen la misma resolución
console.log(engine.renderer.canvas.width);  // 1920
console.log(textCanvas.width);              // 1920
```

## Ejemplo Completo

```javascript
async function init() {
    // Crear engine con Full HD
    const engine = await Engine.create('webgl', '1080p');
    
    // Obtener canvas de texto
    const textCanvas = document.getElementById('textCanvas');
    textCanvas.width = engine.renderer.canvas.width;
    textCanvas.height = engine.renderer.canvas.height;
    
    // Mostrar resoluciones disponibles
    console.log('Resoluciones disponibles:');
    engine.getAvailableResolutions().forEach(res => {
        console.log(`  ${res.key}: ${res.label}`);
    });
    
    // Crear UI para cambiar resolución
    createResolutionSelector(engine, textCanvas);
}

function createResolutionSelector(engine, textCanvas) {
    const select = document.createElement('select');
    
    engine.getAvailableResolutions().forEach(res => {
        const option = document.createElement('option');
        option.value = res.key;
        option.textContent = res.label;
        option.selected = (res.key === engine.currentResolution);
        select.appendChild(option);
    });
    
    select.addEventListener('change', (e) => {
        engine.setResolution(e.target.value, textCanvas);
        console.log(`Resolución cambiada a: ${engine.getResolution().label}`);
    });
    
    document.body.appendChild(select);
}
```

## Efectos de Cambiar Resolución

Cuando se cambia la resolución:

1. ✅ **Canvas principal** se redimensiona
2. ✅ **Viewport WebGL** se actualiza automáticamente
3. ✅ **Canvas de texto** se sincroniza (si se proporciona)
4. ✅ **Aspect ratio** se recalcula automáticamente

```javascript
// Antes
console.log(engine.getAspectRatio()); // 1.777... (16:9)

// Cambiar a 4:3
engine.setCustomResolution(1600, 1200);

// Después
console.log(engine.getAspectRatio()); // 1.333... (4:3)
```

## Atajo de Teclado (Ejemplo)

```javascript
// Añadir F7 para cambiar resolución
const resolutions = ['720p', '1080p', '1440p', '4k'];
let currentIndex = 1; // Empezar en 1080p

document.addEventListener('keydown', (e) => {
    if (e.key === 'F7') {
        e.preventDefault();
        currentIndex = (currentIndex + 1) % resolutions.length;
        const newResolution = resolutions[currentIndex];
        engine.setResolution(newResolution, textCanvas);
        console.log(`Resolución: ${engine.getResolution().label}`);
    }
});
```

## Tabla de Resoluciones

| Clave    | Resolución   | Label                  | Aspect Ratio |
|----------|--------------|------------------------|--------------|
| `720p`   | 1280x720     | HD (1280x720)         | 16:9         |
| `1080p`  | 1920x1080    | Full HD (1920x1080)   | 16:9         |
| `1440p`  | 2560x1440    | 2K (2560x1440)        | 16:9         |
| `4k`     | 3840x2160    | 4K (3840x2160)        | 16:9         |
| `custom` | Variable     | Custom (WxH)          | Variable     |

## Consideraciones de Rendimiento

### Impacto en FPS

- **720p** → Más FPS, menor calidad visual
- **1080p** → Balance óptimo (recomendado)
- **1440p** → Buena calidad, requiere GPU potente
- **4K** → Mejor calidad, requiere GPU muy potente

### Recomendaciones

```javascript
// Detectar capacidades del dispositivo
function getRecommendedResolution() {
    const gpu = engine.getInfo().rendererInfo;
    
    // GPU integrada → 720p o 1080p
    if (gpu.includes('Intel')) {
        return '720p';
    }
    
    // GPU dedicada → 1080p o superior
    return '1080p';
}

// Aplicar resolución recomendada
const recommended = getRecommendedResolution();
engine.setResolution(recommended);
```

## Añadir Nuevas Resoluciones

```javascript
// Añadir resolución ultrawide
Engine.RESOLUTIONS['ultrawide'] = {
    width: 3440,
    height: 1440,
    label: 'Ultrawide (3440x1440)'
};

// Usar la nueva resolución
engine.setResolution('ultrawide');
```

## API Completa

### Propiedades Estáticas

- `Engine.RESOLUTIONS` - Objeto con todas las resoluciones
- `Engine.DEFAULT_RESOLUTION` - Clave de resolución por defecto ('1080p')

### Propiedades de Instancia

- `engine.currentResolution` - Clave de la resolución actual

### Métodos

- `setResolution(key, textCanvas?)` - Establece resolución predefinida
- `setCustomResolution(width, height, textCanvas?)` - Resolución personalizada
- `getResolution()` - Obtiene información de resolución actual
- `getAvailableResolutions()` - Lista todas las resoluciones disponibles
- `getAspectRatio()` - Calcula aspect ratio actual

## Integración con main.js

```javascript
async function init() {
    // Crear engine con resolución por defecto (1080p)
    engine = await Engine.create('webgl', '1080p');
    renderer = engine.renderer;
    
    console.log(`Resolución: ${engine.getResolution().label}`);
    
    // Configurar canvas de texto con la misma resolución
    const textCanvas = document.getElementById('textCanvas');
    const textCtx = textCanvas.getContext('2d');
    textCanvas.width = renderer.canvas.width;
    textCanvas.height = renderer.canvas.height;
    
    // Actualizar aspect ratio de la cámara
    camera = new Camera(75, engine.getAspectRatio(), 0.1, 1000);
}
```

## Resumen

✅ **5 resoluciones predefinidas** (720p, 1080p, 1440p, 4K, custom)
✅ **Resolución por defecto**: Full HD (1920x1080)
✅ **Cambio dinámico** en tiempo de ejecución
✅ **Sincronización automática** de canvas de texto
✅ **Viewport WebGL** actualizado automáticamente
✅ **API simple y clara**

El sistema de resoluciones está completamente integrado en el Engine y listo para usar! 🎨✨
