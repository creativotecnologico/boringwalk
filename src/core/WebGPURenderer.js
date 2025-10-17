// Renderizador WebGPU
class WebGPURenderer extends Renderer {
    constructor() {
        super();
        this.api = 'webgpu';
        this.adapter = null;
        this.device = null;
        this.shaders = new Map();
        this.currentShader = null;
    }

    static async create() {
        if (typeof navigator === 'undefined' || !('gpu' in navigator)) {
            return null;
        }

        try {
            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) {
                return null;
            }

            const device = await adapter.requestDevice();
            if (!device) {
                return null;
            }

            const renderer = new WebGPURenderer();
            renderer.adapter = adapter;
            renderer.device = device;

            if (typeof document !== 'undefined') {
                renderer.canvas = document.createElement('canvas');
            }

            return renderer;
        } catch (error) {
            console.warn('Error al inicializar WebGPU:', error);
            return null;
        }
    }

    getInfo() {
        return {
            ...super.getInfo(),
            hasDevice: !!this.device,
            adapter: this.adapter,
            device: this.device
        };
    }
}
