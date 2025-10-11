// WebGLContext - Maneja el contexto WebGL y configuración
class WebGLContext {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = this.initGL();

        if (!this.gl) {
            throw new Error('WebGL no está soportado en este navegador');
        }

        this.setupGL();
    }

    initGL() {
        const gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        return gl;
    }

    setupGL() {
        const gl = this.gl;

        // Habilitar extensión para índices de 32 bits (necesario para terrenos grandes)
        const ext = gl.getExtension('OES_element_index_uint');
        if (!ext) {
            console.warn('OES_element_index_uint no soportado, limitado a 65535 vértices');
        } else {
            console.log('OES_element_index_uint habilitado - soporte para meshes grandes');
        }

        // Habilitar depth test
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        // Habilitar blending para transparencia
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // Configurar viewport
        this.resize();

        // Listener para redimensionamiento
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const gl = this.gl;
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;

        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
            gl.viewport(0, 0, displayWidth, displayHeight);
        }
    }

    clear(r = 0, g = 0, b = 0, a = 1) {
        const gl = this.gl;
        gl.clearColor(r, g, b, a);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    getAspectRatio() {
        return this.canvas.width / this.canvas.height;
    }
}
