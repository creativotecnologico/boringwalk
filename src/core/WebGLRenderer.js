// Renderizador WebGL (1.0)
class WebGLRenderer extends Renderer {
    constructor() {
        super();
        this.api = 'webgl';
        this.gl = null;
        this.shaders = new Map();
        this.currentShader = null;
    }

    static async create() {
        if (typeof document === 'undefined') {
            return null;
        }

        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!gl) {
            return null;
        }

        const renderer = new WebGLRenderer();
        renderer.canvas = canvas;
        renderer.gl = gl;

        return renderer;
    }

    getInfo() {
        return {
            ...super.getInfo(),
            gl: this.gl
        };
    }
}
