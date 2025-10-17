#version 300 es
precision mediump float;

in vec3 vPosition;

uniform vec3 uFogColor; // Color de la niebla para el cielo

out vec4 fragColor;

void main() {
    // Normalizar posición para obtener dirección
    vec3 dir = normalize(vPosition);

    // Calcular factor basado en altura (y)
    // -1 = horizonte, +1 = cenit
    float heightFactor = dir.y;

    // Colores del cielo
    vec3 skyColorTop = vec3(0.2, 0.5, 0.9);      // Azul cielo arriba
    vec3 skyColorHorizon = vec3(0.7, 0.85, 1.0); // Azul claro en horizonte

    // Interpolación suave
    float t = smoothstep(-0.2, 0.8, heightFactor);
    vec3 skyColor = mix(skyColorHorizon, skyColorTop, t);
    
    // Mezclar con niebla - más intenso en el horizonte y medio cielo
    float horizonFog = smoothstep(0.6, -0.3, heightFactor);
    skyColor = mix(skyColor, uFogColor, horizonFog * 0.85);

    fragColor = vec4(skyColor, 1.0);
}
