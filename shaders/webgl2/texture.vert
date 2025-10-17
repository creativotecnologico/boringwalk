attribute vec3 aPosition;
attribute vec2 aTexCoord;  // Coordenadas UV de la textura

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;
uniform sampler2D uDisplacement;  // Mapa de displacement
uniform float uDisplacementScale; // Escala del desplazamiento

varying vec2 vTexCoord;  // Pasar UV al fragment shader

void main() {
    vec3 displacedPosition = aPosition;

    // Leer valor del displacement map (0-1, en escala de grises)
    float height = texture2D(uDisplacement, aTexCoord).r;

    // Desplazar en el eje Y según el valor del displacement
    displacedPosition.y += height * uDisplacementScale;

    gl_Position = uProjection * uView * uModel * vec4(displacedPosition, 1.0);
    vTexCoord = aTexCoord;  // Pasar coordenadas UV
}
