precision mediump float;

varying vec2 vTexCoord;  // Recibir UV del vertex shader
uniform sampler2D uTexture;  // La textura a aplicar

void main() {
    // Muestrear el color de la textura en la coordenada UV
    gl_FragColor = texture2D(uTexture, vTexCoord);
}
