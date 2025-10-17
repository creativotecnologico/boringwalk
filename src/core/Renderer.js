// Clase base abstracta para renderizadores
class Renderer {
    constructor() {
        this.api = 'none';
        this.canvas = null;
    }

    // Factory method estático para crear el renderizador apropiado
    static async factory(preferredApi = null) {
        // Si se especifica una API preferida, intentar usarla primero
        if (preferredApi) {
            const renderer = await Renderer._tryCreateRenderer(preferredApi);
            if (renderer) {
                return renderer;
            }
            console.warn(`No se pudo crear renderer con API preferida: ${preferredApi}. Detectando automáticamente...`);
        }

        // Detección automática: WebGPU -> WebGL2 -> WebGL
        // 1. Intentar WebGPU
        let renderer = await Renderer._tryCreateRenderer('webgpu');
        if (renderer) return renderer;

        // 2. Intentar WebGL2
        renderer = await Renderer._tryCreateRenderer('webgl2');
        if (renderer) return renderer;

        // 3. Intentar WebGL
        renderer = await Renderer._tryCreateRenderer('webgl');
        if (renderer) return renderer;

        // 4. Ninguna API disponible
        throw new Error('No hay API de renderizado disponible (WebGPU, WebGL2 o WebGL)');
    }

    // Método privado para intentar crear un renderizador específico
    static async _tryCreateRenderer(api) {
        try {
            switch (api) {
                case 'webgpu':
                    return await WebGPURenderer.create();
                case 'webgl2':
                    return await WebGL2Renderer.create();
                case 'webgl':
                    return await WebGLRenderer.create();
                default:
                    return null;
            }
        } catch (error) {
            console.warn(`Error al crear renderer ${api}:`, error);
            return null;
        }
    }

    // Cargar shaders específicos para este renderer
    async loadShaders() {
        const shaderBasePath = `../shaders/${this.api}`;
        
        try {
            // Cargar el archivo list.json
            const listResponse = await fetch(`${shaderBasePath}/list.json`);
            if (!listResponse.ok) {
                throw new Error(`No se pudo cargar list.json para ${this.api}`);
            }
            
            const shaderList = await listResponse.json();
            const loadedShaders = [];
            
            // Cargar cada shader definido en la lista
            for (const shaderDef of shaderList.shaders) {
                const [vertexSource, fragmentSource] = await Promise.all([
                    this._loadShaderFile(`${shaderBasePath}/${shaderDef.vertex}`),
                    this._loadShaderFile(`${shaderBasePath}/${shaderDef.fragment}`)
                ]);
                
                loadedShaders.push({
                    name: shaderDef.name,
                    description: shaderDef.description,
                    vertexSource,
                    fragmentSource,
                    uniforms: shaderDef.uniforms || [],
                    attributes: shaderDef.attributes || []
                });
            }
            
            return loadedShaders;
        } catch (error) {
            console.error(`Error al cargar shaders para ${this.api}:`, error);
            throw error;
        }
    }

    // Método privado para cargar un archivo de shader
    async _loadShaderFile(path) {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Error al cargar shader: ${path}`);
        }
        return await response.text();
    }

    // Compilar shader (WebGL/WebGL2)
    _compileShader(gl, source, type) {
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

    // Crear programa de shader (WebGL/WebGL2)
    createShader(name, vertexSource, fragmentSource) {
        // Para WebGL y WebGL2, el proceso es el mismo
        if (this.api === 'webgl' || this.api === 'webgl2') {
            const gl = this.gl;

            const vertexShader = this._compileShader(gl, vertexSource, gl.VERTEX_SHADER);
            const fragmentShader = this._compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER);

            if (!vertexShader || !fragmentShader) {
                throw new Error(`No se pudo compilar el shader '${name}'`);
            }

            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);

            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                const error = gl.getProgramInfoLog(program);
                console.error('Error enlazando programa:', error);
                throw new Error(`No se pudo enlazar el shader '${name}': ${error}`);
            }

            // Guardar el programa compilado
            if (!this.shaders) {
                this.shaders = new Map();
            }

            this.shaders.set(name, {
                program,
                vertexShader,
                fragmentShader,
                uniforms: new Map(),
                attributes: new Map()
            });

            return program;
        } 
        // Para WebGPU, sería diferente (WGSL)
        else if (this.api === 'webgpu') {
            // TODO: Implementar compilación de shaders WebGPU (WGSL)
            throw new Error('Compilación de shaders WebGPU no implementada aún');
        }
        
        throw new Error(`API de renderizado no soportada: ${this.api}`);
    }

    // Usar un shader compilado
    useShader(name) {
        if (!this.shaders || !this.shaders.has(name)) {
            console.warn(`Shader '${name}' no encontrado`);
            return null;
        }

        const shader = this.shaders.get(name);
        
        if (this.api === 'webgl' || this.api === 'webgl2') {
            this.gl.useProgram(shader.program);
            this.currentShader = shader;
        }

        return shader;
    }

    // Obtener el shader activo actual
    getCurrentShader() {
        return this.currentShader;
    }

    // Método a implementar por las subclases
    getInfo() {
        return {
            api: this.api,
            canvas: this.canvas
        };
    }
}
