// WebGLEngine - Motor principal que encapsula toda la funcionalidad WebGL
class WebGLEngine {
    constructor(canvas) {
        this.context = new WebGLContext(canvas);
        this.gl = this.context.gl;

        this.shaderManager = new ShaderManager(this.gl);
        this.bufferManager = new BufferManager(this.gl);
        this.textureManager = new TextureManager(this.gl);

        this.wireframeMode = false;
    }

    // Limpiar pantalla
    clear(r = 0, g = 0, b = 0, a = 1) {
        this.context.clear(r, g, b, a);
    }

    // Obtener aspect ratio
    getAspectRatio() {
        return this.context.getAspectRatio();
    }

    // Crear shader program
    createShader(name, vertexSource, fragmentSource) {
        return this.shaderManager.createProgram(name, vertexSource, fragmentSource);
    }

    // Usar shader
    useShader(name) {
        return this.shaderManager.useProgram(name);
    }

    // Establecer uniforms
    setUniformMatrix4fv(name, value) {
        this.shaderManager.setUniformMatrix4fv(name, value);
    }

    setUniform3f(name, x, y, z) {
        this.shaderManager.setUniform3f(name, x, y, z);
    }

    // Crear buffers
    createVertexBuffer(name, data, usage) {
        return this.bufferManager.createVertexBuffer(name, data, usage);
    }

    createIndexBuffer(name, data, usage) {
        return this.bufferManager.createIndexBuffer(name, data, usage);
    }

    // Vincular atributos
    bindAttribute(buffer, attributeName, size, type, normalized, stride, offset) {
        const location = this.shaderManager.getAttributeLocation(attributeName);
        if (location !== -1) {
            this.bufferManager.bindAttribute(buffer, location, size, type, normalized, stride, offset);
        }
    }

    // Dibujar
    drawArrays(mode, first, count) {
        this.gl.drawArrays(mode, first, count);
    }

    drawElements(mode, count, type, offset) {
        this.gl.drawElements(mode, count, type, offset);
    }

    // Toggle wireframe
    toggleWireframe() {
        this.wireframeMode = !this.wireframeMode;
    }

    isWireframe() {
        return this.wireframeMode;
    }
}
