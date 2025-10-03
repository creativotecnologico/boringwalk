// Sistema de Shaders
class Shader {
    constructor(gl, vertexSource, fragmentSource) {
        this.gl = gl;
        this.program = this.createProgram(vertexSource, fragmentSource);
        this.uniforms = {};
        this.attributes = {};
    }

    // Compilar shader
    compileShader(source, type) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Error compilando shader:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    // Crear programa
    createProgram(vertexSource, fragmentSource) {
        const vertexShader = this.compileShader(vertexSource, this.gl.VERTEX_SHADER);
        const fragmentShader = this.compileShader(fragmentSource, this.gl.FRAGMENT_SHADER);

        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Error enlazando programa:', this.gl.getProgramInfoLog(program));
            return null;
        }

        return program;
    }

    // Usar shader
    use() {
        this.gl.useProgram(this.program);
    }

    // Obtener ubicación de uniform
    getUniformLocation(name) {
        if (!this.uniforms[name]) {
            this.uniforms[name] = this.gl.getUniformLocation(this.program, name);
        }
        return this.uniforms[name];
    }

    // Obtener ubicación de attribute
    getAttributeLocation(name) {
        if (!this.attributes[name]) {
            this.attributes[name] = this.gl.getAttribLocation(this.program, name);
        }
        return this.attributes[name];
    }

    // Establecer uniform matrix
    setUniformMatrix4fv(name, value) {
        this.gl.uniformMatrix4fv(this.getUniformLocation(name), false, value);
    }

    // Establecer uniform vec3
    setUniform3f(name, x, y, z) {
        this.gl.uniform3f(this.getUniformLocation(name), x, y, z);
    }
}
