// Sistema de renderizado WebGL
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!this.gl) {
            alert('WebGL no está soportado en tu navegador');
            return;
        }

        this.setupCanvas();
        this.setupWebGL();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        });
    }

    setupWebGL() {
        const gl = this.gl;

        // Configurar viewport
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        // Habilitar depth test
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        // Configurar color de limpieza
        gl.clearColor(0.5, 0.7, 0.9, 1.0); // Cielo azul claro
    }

    clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    getAspectRatio() {
        return this.canvas.width / this.canvas.height;
    }
}
