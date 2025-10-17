// Renderizador WebGL2
class WebGL2Renderer extends Renderer {
    constructor() {
        super();
        this.api = 'webgl2';
        this.gl = null;
        this.shaders = new Map();
        this.currentShader = null;
    }

    static async create() {
        if (typeof document === 'undefined') {
            return null;
        }

        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2');

        if (!gl) {
            return null;
        }

        const renderer = new WebGL2Renderer();
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
