// Player - Entidad del jugador (cápsula)
class Player {
    constructor(gl) {
        this.gl = gl;
        this.radius = 0.4; // Radio de la cápsula
        this.height = 1.8; // Altura total (típica de humano)

        // Cargar estado desde localStorage
        this.loadState();

        // Pivote (desplazamiento local desde position para el origen de la geometría)
        // Por defecto en (0,0,0) = centro del objeto
        // Pivote en la base de la cápsula
        this.pivot = new Vec3(0, this.height / 2, 0);

        this.geometry = null;

        // Eje de debug
        this.axis = new Axis(gl, 1.0);

        this.createGeometry();
    }

    // Cargar estado desde localStorage
    loadState() {
        const savedViewMode = localStorage.getItem('boringwalk_viewMode');
        const savedPosition = localStorage.getItem('boringwalk_playerPosition');

        // Cargar modo de vista
        this.viewMode = savedViewMode || 'first';

        // Cargar posición
        if (savedPosition) {
            const pos = JSON.parse(savedPosition);
            this.position = new Vec3(pos.x, pos.y, pos.z);
        } else {
            // Posición por defecto
            this.position = new Vec3(0, -this.height / 2, 5);
        }
    }

    // Guardar estado en localStorage
    saveState() {
        localStorage.setItem('boringwalk_viewMode', this.viewMode);
        localStorage.setItem('boringwalk_playerPosition', JSON.stringify({
            x: this.position.x,
            y: this.position.y,
            z: this.position.z
        }));
    }

    // Crear geometría de cápsula (cilindro + 2 hemisferios)
    createGeometry() {
        const vertices = [];
        const colors = [];
        const indices = [];

        const segments = 16; // Segmentos alrededor
        const heightSegments = 4; // Segmentos verticales del cilindro

        const cylinderHeight = this.height - 2 * this.radius; // Altura del cilindro (sin las esferas)
        const color = [0.8, 0.3, 0.3]; // Color rojizo para el personaje

        let vertexIndex = 0;

        // === PARTE 1: CILINDRO CENTRAL ===
        for (let i = 0; i <= heightSegments; i++) {
            const y = -cylinderHeight / 2 + (i / heightSegments) * cylinderHeight;

            for (let j = 0; j <= segments; j++) {
                const angle = (j / segments) * Math.PI * 2;
                const x = Math.cos(angle) * this.radius;
                const z = Math.sin(angle) * this.radius;

                vertices.push(x, y, z);
                colors.push(color[0], color[1], color[2]);
            }
        }

        // Índices del cilindro
        for (let i = 0; i < heightSegments; i++) {
            for (let j = 0; j < segments; j++) {
                const first = i * (segments + 1) + j;
                const second = first + segments + 1;

                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }

        vertexIndex = vertices.length / 3;

        // === PARTE 2: HEMISFERIO SUPERIOR ===
        const hemisphereSegments = 8;
        for (let i = 0; i <= hemisphereSegments; i++) {
            const theta = (i / hemisphereSegments) * (Math.PI / 2); // Solo mitad superior
            const y = cylinderHeight / 2 + Math.sin(theta) * this.radius;
            const r = Math.cos(theta) * this.radius;

            for (let j = 0; j <= segments; j++) {
                const angle = (j / segments) * Math.PI * 2;
                const x = Math.cos(angle) * r;
                const z = Math.sin(angle) * r;

                vertices.push(x, y, z);
                colors.push(color[0], color[1], color[2]);
            }
        }

        // Índices del hemisferio superior
        const topStart = vertexIndex;
        for (let i = 0; i < hemisphereSegments; i++) {
            for (let j = 0; j < segments; j++) {
                const first = topStart + i * (segments + 1) + j;
                const second = first + segments + 1;

                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }

        vertexIndex = vertices.length / 3;

        // === PARTE 3: HEMISFERIO INFERIOR ===
        for (let i = 0; i <= hemisphereSegments; i++) {
            const theta = (i / hemisphereSegments) * (Math.PI / 2);
            const y = -cylinderHeight / 2 - Math.sin(theta) * this.radius;
            const r = Math.cos(theta) * this.radius;

            for (let j = 0; j <= segments; j++) {
                const angle = (j / segments) * Math.PI * 2;
                const x = Math.cos(angle) * r;
                const z = Math.sin(angle) * r;

                vertices.push(x, y, z);
                colors.push(color[0], color[1], color[2]);
            }
        }

        // Índices del hemisferio inferior
        const bottomStart = vertexIndex;
        for (let i = 0; i < hemisphereSegments; i++) {
            for (let j = 0; j < segments; j++) {
                const first = bottomStart + i * (segments + 1) + j;
                const second = first + segments + 1;

                indices.push(first, first + 1, second);
                indices.push(second, first + 1, second + 1);
            }
        }

        // Crear buffers
        this.geometry = new Geometry(this.gl);

        const verticesArray = new Float32Array(vertices);
        const colorsArray = new Float32Array(colors);
        const indicesArray = new Uint16Array(indices);

        this.geometry.vertexCount = indicesArray.length;

        // Vertex buffer
        this.geometry.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.geometry.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, verticesArray, this.gl.STATIC_DRAW);

        // Color buffer
        this.geometry.colorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.geometry.colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, colorsArray, this.gl.STATIC_DRAW);

        // Index buffer
        this.geometry.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.geometry.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indicesArray, this.gl.STATIC_DRAW);

        // Crear índices de wireframe
        const wireframeIndices = [];
        for (let i = 0; i < indices.length; i += 3) {
            const v0 = indices[i];
            const v1 = indices[i + 1];
            const v2 = indices[i + 2];

            wireframeIndices.push(v0, v1);
            wireframeIndices.push(v1, v2);
            wireframeIndices.push(v2, v0);
        }

        const wireframeIndicesArray = new Uint16Array(wireframeIndices);
        this.geometry.wireframeVertexCount = wireframeIndicesArray.length;

        // Wireframe index buffer
        this.geometry.wireframeIndexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.geometry.wireframeIndexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, wireframeIndicesArray, this.gl.STATIC_DRAW);
    }

    // Toggle entre primera y tercera persona
    toggleView() {
        this.viewMode = this.viewMode === 'first' ? 'third' : 'first';
        console.log(`Vista: ${this.viewMode === 'first' ? 'Primera Persona' : 'Tercera Persona'}`);
        this.saveState();
    }

    // Renderizar jugador
    render(shader, wireframe = false) {
        // Matriz del modelo con pivote
        // Trasladar a position, luego aplicar el offset del pivote
        const modelMatrix = Mat4.translation(
            this.position.x + this.pivot.x,
            this.position.y + this.pivot.y,
            this.position.z + this.pivot.z
        );
        shader.setUniformMatrix4fv('uModel', modelMatrix.elements);

        if (this.geometry) {
            this.geometry.render(shader, wireframe);
        }

        // Renderizar eje de debug en el pivote (centro del objeto)
        const pivotWorldPos = new Vec3(
            this.position.x + this.pivot.x,
            this.position.y + this.pivot.y,
            this.position.z + this.pivot.z
        );
        this.axis.render(shader, pivotWorldPos);
    }

    // Mover el jugador - SIMPLE: solo en Z (adelante/atrás)
    move(direction, distance) {
        switch(direction) {
            case 'forward':
                this.position.z -= distance;
                break;
            case 'backward':
                this.position.z += distance;
                break;
            case 'left':
                this.position.x -= distance;
                break;
            case 'right':
                this.position.x += distance;
                break;
        }
        this.saveState();
    }

    // Aplicar colisión con el terreno
    applyTerrainCollision(terrain) {
        // Obtener el punto más bajo del centro del personaje
        // La posición del jugador es el centro de la cápsula (altura/2 desde el suelo)
        // El punto más bajo está en position.y - height/2
        const groundHeight = terrain.getHeightAt(this.position.x, this.position.z);

        // Ajustar la posición Y para que el punto más bajo esté sobre el terreno
        this.position.y = groundHeight;
    }

    // Obtener posición de la cámara según el modo de vista
    getCameraPosition() {
        if (this.viewMode === 'first') {
            // Primera persona: cámara a la altura de los ojos
            const eyeHeight = this.height * 0.4;
            return new Vec3(this.position.x, this.position.y - 1, this.position.z);
        } else {
            // Tercera persona: cámara fija detrás (en +Z) y arriba
            return new Vec3(
                this.position.x,
                this.position.y + this.height,
                this.position.z + 5
            );
        }
    }

    // Obtener punto hacia donde mira la cámara
    getCameraTarget() {
        if (this.viewMode === 'first') {
            // Primera persona: mirar hacia -Z (adelante)
            const eyeHeight = this.height * 0.4;
            return new Vec3(this.position.x, this.position.y + eyeHeight, this.position.z - 10);
        } else {
            // Tercera persona: altura fija, solo cambiar Z
            return new Vec3(this.position.x, this.position.y, this.position.z);
        }
    }

}
