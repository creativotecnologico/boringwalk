// Engine - Clase principal que encapsula el renderer y gestiona recursos

class Engine {
    // Listado de resoluciones disponibles
    static RESOLUTIONS = {
        '720p': { width: 1280, height: 720, label: 'HD (1280x720)' },
        '1080p': { width: 1920, height: 1080, label: 'Full HD (1920x1080)' },
        '1440p': { width: 2560, height: 1440, label: '2K (2560x1440)' },
        '4k': { width: 3840, height: 2160, label: '4K (3840x2160)' },
        'custom': { width: 800, height: 600, label: 'Custom (800x600)' }
    };

    // Resolución por defecto
    static DEFAULT_RESOLUTION = '1080p';

    constructor(renderer) {
        this.renderer = renderer;
        this.gl = renderer.gl;
        
        // Inicializar managers
        this.shaderManager = new ShaderManager(this.gl);
        this.bufferManager = new BufferManager(this.gl);
        this.textureManager = new TextureManager(this.gl);
        
        // Estado
        this.wireframeMode = false;
        this.currentResolution = Engine.DEFAULT_RESOLUTION;
    }

    // ========== MÉTODOS DE RESOLUCIÓN ==========

    setResolution(resolutionKey, syncTextCanvas = null) {
        const resolution = Engine.RESOLUTIONS[resolutionKey];
        if (!resolution) {
            console.warn(`Resolución '${resolutionKey}' no encontrada. Usando ${Engine.DEFAULT_RESOLUTION}`);
            return this.setResolution(Engine.DEFAULT_RESOLUTION, syncTextCanvas);
        }

        const canvas = this.renderer.canvas;
        canvas.width = resolution.width;
        canvas.height = resolution.height;
        
        // Actualizar viewport
        this.gl.viewport(0, 0, resolution.width, resolution.height);
        
        // Sincronizar canvas de texto si se proporciona
        if (syncTextCanvas) {
            syncTextCanvas.width = resolution.width;
            syncTextCanvas.height = resolution.height;
        }
        
        this.currentResolution = resolutionKey;
        console.log(`Resolución establecida: ${resolution.label}`);
        
        return resolution;
    }

    setCustomResolution(width, height, syncTextCanvas = null) {
        const canvas = this.renderer.canvas;
        canvas.width = width;
        canvas.height = height;
        
        // Actualizar viewport
        this.gl.viewport(0, 0, width, height);
        
        // Sincronizar canvas de texto si se proporciona
        if (syncTextCanvas) {
            syncTextCanvas.width = width;
            syncTextCanvas.height = height;
        }
        
        // Actualizar resolución custom
        Engine.RESOLUTIONS.custom.width = width;
        Engine.RESOLUTIONS.custom.height = height;
        Engine.RESOLUTIONS.custom.label = `Custom (${width}x${height})`;
        
        this.currentResolution = 'custom';
        console.log(`Resolución custom establecida: ${width}x${height}`);
        
        return { width, height };
    }

    getResolution() {
        return Engine.RESOLUTIONS[this.currentResolution];
    }

    getAvailableResolutions() {
        return Object.keys(Engine.RESOLUTIONS).map(key => ({
            key,
            ...Engine.RESOLUTIONS[key]
        }));
    }

    // ========== MÉTODOS DE RENDERIZADO ==========

    clear(r = 0.1, g = 0.1, b = 0.1, a = 1.0) {
        this.gl.clearColor(r, g, b, a);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    getAspectRatio() {
        return this.renderer.canvas.width / this.renderer.canvas.height;
    }

    // ========== MÉTODOS DE SHADERS ==========

    createShader(name, vertexSource, fragmentSource) {
        return this.shaderManager.createProgram(name, vertexSource, fragmentSource);
    }

    useShader(name) {
        return this.shaderManager.useProgram(name);
    }

    getCurrentProgram() {
        return this.shaderManager.currentProgram ? this.shaderManager.currentProgram.program : null;
    }

    // ========== MÉTODOS DE UNIFORMS ==========

    setUniformMatrix4fv(name, value) {
        this.shaderManager.setUniformMatrix4fv(name, value);
    }

    setUniform3f(name, x, y, z) {
        this.shaderManager.setUniform3f(name, x, y, z);
    }

    setUniform3fv(name, value) {
        const location = this.shaderManager.getUniformLocation(name);
        if (location !== null) {
            this.gl.uniform3fv(location, value);
        }
    }

    setUniform1f(name, value) {
        const location = this.shaderManager.getUniformLocation(name);
        if (location !== null) {
            this.gl.uniform1f(location, value);
        }
    }

    setUniform1i(name, value) {
        const location = this.shaderManager.getUniformLocation(name);
        if (location !== null) {
            this.gl.uniform1i(location, value);
        }
    }

    // ========== MÉTODOS DE BUFFERS ==========

    createVertexBuffer(name, data, usage) {
        return this.bufferManager.createVertexBuffer(name, data, usage);
    }

    createIndexBuffer(name, data, usage) {
        return this.bufferManager.createIndexBuffer(name, data, usage);
    }

    bindAttribute(buffer, attributeName, size, type, normalized, stride, offset) {
        const location = this.shaderManager.getAttributeLocation(attributeName);
        if (location !== -1) {
            this.bufferManager.bindAttribute(buffer, location, size, type, normalized, stride, offset);
        }
    }

    // ========== MÉTODOS DE DIBUJO ==========

    drawArrays(mode, first, count) {
        this.gl.drawArrays(mode, first, count);
    }

    drawElements(mode, count, type, offset) {
        this.gl.drawElements(mode, count, type, offset);
    }

    // ========== MÉTODOS DE ESTADO ==========

    enableDepthTest() {
        this.gl.enable(this.gl.DEPTH_TEST);
    }

    disableDepthTest() {
        this.gl.disable(this.gl.DEPTH_TEST);
    }

    enableBlend() {
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    }

    disableBlend() {
        this.gl.disable(this.gl.BLEND);
    }

    setCullFace(enabled) {
        if (enabled) {
            this.gl.enable(this.gl.CULL_FACE);
            this.gl.cullFace(this.gl.BACK);
        } else {
            this.gl.disable(this.gl.CULL_FACE);
        }
    }

    // ========== INFORMACIÓN ==========

    getInfo() {
        return {
            renderer: this.renderer.api,
            vendor: this.gl.getParameter(this.gl.VENDOR),
            rendererInfo: this.gl.getParameter(this.gl.RENDERER),
            version: this.gl.getParameter(this.gl.VERSION),
            shadingLanguageVersion: this.gl.getParameter(this.gl.SHADING_LANGUAGE_VERSION),
            maxTextureSize: this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE),
            maxVertexAttributes: this.gl.getParameter(this.gl.MAX_VERTEX_ATTRIBS),
            maxVaryingVectors: this.gl.getParameter(this.gl.MAX_VARYING_VECTORS),
            maxVertexTextureImageUnits: this.gl.getParameter(this.gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
            maxTextureImageUnits: this.gl.getParameter(this.gl.MAX_TEXTURE_IMAGE_UNITS),
            maxCombinedTextureImageUnits: this.gl.getParameter(this.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS)
        };
    }

    // ========== FACTORY METHOD ==========

    static async create(preferredApi = null, resolution = null) {
        // Crear renderer
        const renderer = await Renderer.factory(preferredApi);
        
        // Configurar WebGL
        const gl = renderer.gl;
        
        // Habilitar depth test
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        
        // Habilitar blending
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        
        // Habilitar extensión para índices de 32 bits
        const ext = gl.getExtension('OES_element_index_uint');
        if (ext) {
            console.log('✓ OES_element_index_uint habilitado - Soporte para meshes grandes');
        } else {
            console.warn('⚠ OES_element_index_uint no disponible - Limitado a 65535 vértices');
        }
        
        // Crear engine
        const engine = new Engine(renderer);
        
        // Establecer resolución (por defecto 1080p)
        const resolutionKey = resolution || Engine.DEFAULT_RESOLUTION;
        engine.setResolution(resolutionKey);
        
        return engine;
    }
}
