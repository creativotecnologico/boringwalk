#version 300 es
precision mediump float;

in vec3 vColor;
in vec3 vNormal;
in vec3 vPosition;
in float vDistance;

uniform vec3 uLightDirection; // Dirección de la luz del sol
uniform vec3 uLightColor;     // Color de la luz
uniform vec3 uAmbientColor;   // Color ambiental
uniform vec3 uFogColor;       // Color de la niebla
uniform float uFogNear;       // Distancia donde empieza la niebla
uniform float uFogFar;        // Distancia donde la niebla es total

out vec4 fragColor;

void main() {
    // Normalizar normal
    vec3 normal = normalize(vNormal);

    // Luz direccional (sol) - invertir dirección para que apunte hacia la superficie
    vec3 lightDir = normalize(-uLightDirection);
    float diffuse = max(dot(normal, lightDir), 0.0);

    // Componente ambiental (base)
    vec3 ambient = uAmbientColor * vColor;

    // Componente difusa (iluminación direccional)
    vec3 diffuseColor = uLightColor * vColor * diffuse;

    // Añadir sombras suaves en pendientes
    float slope = 1.0 - abs(normal.y); // Pendiente (0 = plano, 1 = vertical)
    vec3 slopeShadow = vec3(1.0 - slope * 0.3);

    // Color final sin niebla
    vec3 finalColor = (ambient + diffuseColor * 0.8) * slopeShadow;

    // Calcular factor de niebla (0 = sin niebla, 1 = niebla total)
    float fogFactor = smoothstep(uFogNear, uFogFar, vDistance);
    
    // Mezclar color final con color de niebla
    vec3 colorWithFog = mix(finalColor, uFogColor, fogFactor);

    fragColor = vec4(colorWithFog, 1.0);
}
