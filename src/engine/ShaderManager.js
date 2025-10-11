// ShaderManager - Gestiona la compilación y uso de shaders
class ShaderManager {
    constructor(gl) {
        this.gl = gl;
        this.programs = new Map(); // Map<name, ShaderProgram>
        this.currentProgram = null;
    }

    // Compilar shader
    compileShader(source, type) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Error compilando shader:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    // Crear programa de shader
    createProgram(name, vertexSource, fragmentSource) {
        const gl = this.gl;

        const vertexShader = this.compileShader(vertexSource, gl.VERTEX_SHADER);
        const fragmentShader = this.compileShader(fragmentSource, gl.FRAGMENT_SHADER);

        if (!vertexShader || !fragmentShader) {
            return null;
        }

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Error enlazando programa:', gl.getProgramInfoLog(program));
            return null;
        }

        // Guardar programa
        const shaderProgram = {
            program,
            uniforms: new Map(),
            attributes: new Map()
        };

        this.programs.set(name, shaderProgram);
        return shaderProgram;
    }

    // Usar programa
    useProgram(name) {
        const shaderProgram = this.programs.get(name);
        if (shaderProgram) {
            this.gl.useProgram(shaderProgram.program);
            this.currentProgram = shaderProgram;
        }
        return shaderProgram;
    }

    // Obtener ubicación de uniform
    getUniformLocation(name) {
        if (!this.currentProgram) return null;

        if (!this.currentProgram.uniforms.has(name)) {
            const location = this.gl.getUniformLocation(this.currentProgram.program, name);
            this.currentProgram.uniforms.set(name, location);
        }

        return this.currentProgram.uniforms.get(name);
    }

    // Obtener ubicación de attribute
    getAttributeLocation(name) {
        if (!this.currentProgram) return null;

        if (!this.currentProgram.attributes.has(name)) {
            const location = this.gl.getAttribLocation(this.currentProgram.program, name);
            this.currentProgram.attributes.set(name, location);
        }

        return this.currentProgram.attributes.get(name);
    }

    // Establecer uniform matrix4fv
    setUniformMatrix4fv(name, value) {
        const location = this.getUniformLocation(name);
        if (location !== null) {
            this.gl.uniformMatrix4fv(location, false, value);
        }
    }

    // Establecer uniform vec3
    setUniform3f(name, x, y, z) {
        const location = this.getUniformLocation(name);
        if (location !== null) {
            this.gl.uniform3f(location, x, y, z);
        }
    }
}
