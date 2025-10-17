# Shaders WebGL2

Shaders GLSL ES 3.0 para WebGL 2.0

## Shaders Disponibles

### main (color)
Shader básico para renderizado con colores por vértice.

**Archivos:**
- `color.vert` - Vertex shader
- `color.frag` - Fragment shader

**Uniforms:**
- `uModel` (mat4) - Matriz de modelo
- `uView` (mat4) - Matriz de vista
- `uProjection` (mat4) - Matriz de proyección

**Attributes:**
- `aPosition` (vec3) - Posición del vértice
- `aColor` (vec3) - Color del vértice

### texture
Shader para renderizado con texturas y displacement mapping.

**Archivos:**
- `texture.vert` - Vertex shader
- `texture.frag` - Fragment shader

**Uniforms:**
- `uModel` (mat4) - Matriz de modelo
- `uView` (mat4) - Matriz de vista
- `uProjection` (mat4) - Matriz de proyección
- `uTexture` (sampler2D) - Textura difusa
- `uDisplacement` (sampler2D) - Mapa de desplazamiento
- `uDisplacementScale` (float) - Escala del desplazamiento

**Attributes:**
- `aPosition` (vec3) - Posición del vértice
- `aTexCoord` (vec2) - Coordenadas UV

## Compatibilidad

- WebGL 2.0
- GLSL ES 3.0
- Soportado en navegadores modernos (Chrome 56+, Firefox 51+, Safari 15+)

## Notas

Actualmente los shaders son idénticos a los de WebGL 1.0 para mantener compatibilidad.
En futuras versiones se pueden optimizar aprovechando las características de GLSL ES 3.0:
- Mejores opciones de texturizado
- Uniform buffer objects
- Transform feedback
- Etc.
