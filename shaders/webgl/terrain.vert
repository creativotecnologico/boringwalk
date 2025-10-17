attribute vec3 aPosition;
attribute vec3 aColor;
attribute vec3 aNormal;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;
uniform vec3 uCameraPosition; // Posición de la cámara para calcular distancia

varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vPosition;
varying float vDistance; // Distancia desde la cámara para la niebla

void main() {
    vec4 worldPosition = uModel * vec4(aPosition, 1.0);
    gl_Position = uProjection * uView * worldPosition;

    // Pasar color del bioma
    vColor = aColor;

    // Transformar normal al espacio del mundo
    vNormal = mat3(uModel) * aNormal;

    // Posición en espacio del mundo para iluminación
    vPosition = worldPosition.xyz;
    
    // Calcular distancia desde la cámara para la niebla
    vDistance = length(uCameraPosition - worldPosition.xyz);
}
