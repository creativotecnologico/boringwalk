// SkyMesh - Esfera grande para el cielo con gradiente
class SkyMesh extends Mesh {
    constructor(engine, radius = 500) {
        super(engine);
        this.radius = radius;
        this.generate();
    }

    generate() {
        const segments = 32;
        const rings = 16;
        const vertices = [];
        const indices = [];

        // Generar vértices de la esfera
        for (let ring = 0; ring <= rings; ring++) {
            const theta = (ring * Math.PI) / rings;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let segment = 0; segment <= segments; segment++) {
                const phi = (segment * 2 * Math.PI) / segments;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;

                vertices.push(
                    x * this.radius,
                    y * this.radius,
                    z * this.radius
                );
            }
        }

        // Generar índices
        for (let ring = 0; ring < rings; ring++) {
            for (let segment = 0; segment < segments; segment++) {
                const first = ring * (segments + 1) + segment;
                const second = first + segments + 1;

                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }

        this.createSkyBuffers(vertices, indices);
    }

    createSkyBuffers(vertices, indices) {
        const gl = this.engine.gl;

        // Buffer de posiciones
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // Buffer de índices
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

        this.indexCount = indices.length;
        this.vertexCount = vertices.length / 3;
    }

    render(engine) {
        const gl = engine.gl;
        const program = engine.getCurrentProgram();

        if (!program) return;

        // Configurar atributo de posición
        const aPosition = gl.getAttribLocation(program, 'aPosition');
        if (aPosition !== -1) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
            gl.enableVertexAttribArray(aPosition);
            gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
        }

        // Renderizar
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0);

        // Desactivar atributos
        if (aPosition !== -1) {
            gl.disableVertexAttribArray(aPosition);
        }
    }
}
