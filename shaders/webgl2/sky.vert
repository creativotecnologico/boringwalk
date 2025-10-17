#version 300 es

in vec3 aPosition;

uniform mat4 uView;
uniform mat4 uProjection;

out vec3 vPosition;

void main() {
    vPosition = aPosition;

    // Remover traslación de la view matrix para que el cielo siga la cámara
    mat4 viewNoTranslation = uView;
    viewNoTranslation[3][0] = 0.0;
    viewNoTranslation[3][1] = 0.0;
    viewNoTranslation[3][2] = 0.0;

    vec4 pos = uProjection * viewNoTranslation * vec4(aPosition, 1.0);
    gl_Position = pos.xyww; // z = w para que esté en el far plane
}
