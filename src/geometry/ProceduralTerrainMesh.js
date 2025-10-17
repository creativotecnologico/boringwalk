// ProceduralTerrainMesh - Terreno procedural completo usando TerrainGeneratorSingle
// Para terrenos grandes estáticos de 5km x 5km
class ProceduralTerrainMesh extends Mesh {
    constructor(engine, seed = 12345, sizeX = 5000, sizeZ = 5000, resolution = 5) {
        super(engine);

        this.seed = seed;
        this.sizeX = sizeX;
        this.sizeZ = sizeZ;
        this.resolution = resolution;
        this.terrainData = null;
        this.triangles = [];

        console.log(`Creando terreno procedural: ${sizeX}x${sizeZ}m, resolución ${resolution}m, seed ${seed}`);
    }

    /**
     * Genera el terreno usando TerrainGeneratorSingle
     */
    generate() {
        // Crear generador
        const generator = new TerrainGeneratorSingle(this.seed);

        // Generar datos del terreno
        this.terrainData = generator.generate(this.sizeX, this.sizeZ, this.resolution);

        console.log(`Terreno generado: ${this.terrainData.numTriangles.toLocaleString()} triángulos en ${this.terrainData.generationTime}ms`);

        // Crear triángulos para colisiones
        this.createTrianglesFromData();

        // Crear buffers de GPU
        this.createBuffersWithNormals(
            this.terrainData.vertices,
            this.terrainData.colorMap,
            this.terrainData.normals,
            this.terrainData.indices
        );

        // Generar versión simplificada para mapa (resolución 10x menor)
        this.generateMapVersion(generator);

        return this.terrainData;
    }

    /**
     * Genera versión de baja resolución para mapa
     * Toma 1 de cada 10 vértices del terreno original
     */
    generateMapVersion(generator) {
        const skipFactor = 2; // Tomar 1 de cada 10 vértices
        const { vertices, colorMap, normals, verticesX, verticesZ } = this.terrainData;

        // Calcular dimensiones del mapa
        const mapVerticesX = Math.floor(verticesX / skipFactor) + 1;
        const mapVerticesZ = Math.floor(verticesZ / skipFactor) + 1;
        const mapTotalVertices = mapVerticesX * mapVerticesZ;

        console.log(`Generando mapa: ${mapVerticesX}x${mapVerticesZ} vértices (1 de cada ${skipFactor})`);

        // Arrays para mapa
        const mapVertices = new Float32Array(mapTotalVertices * 3);
        const mapColors = new Float32Array(mapTotalVertices * 3);
        const mapNormals = new Float32Array(mapTotalVertices * 3);

        // Copiar vértices saltando
        let mapIdx = 0;
        for (let z = 0; z < mapVerticesZ; z++) {
            for (let x = 0; x < mapVerticesX; x++) {
                // Índice en el terreno original
                const origX = x * skipFactor;
                const origZ = z * skipFactor;

                // Asegurarse de no salir de límites
                const clampedX = Math.min(origX, verticesX - 1);
                const clampedZ = Math.min(origZ, verticesZ - 1);

                const origIdx = clampedZ * verticesX + clampedX;

                // Copiar posición
                mapVertices[mapIdx * 3 + 0] = vertices[origIdx * 3 + 0];
                mapVertices[mapIdx * 3 + 1] = vertices[origIdx * 3 + 1];
                mapVertices[mapIdx * 3 + 2] = vertices[origIdx * 3 + 2];

                // Copiar color
                mapColors[mapIdx * 3 + 0] = colorMap[origIdx * 3 + 0];
                mapColors[mapIdx * 3 + 1] = colorMap[origIdx * 3 + 1];
                mapColors[mapIdx * 3 + 2] = colorMap[origIdx * 3 + 2];

                // Copiar normal
                mapNormals[mapIdx * 3 + 0] = normals[origIdx * 3 + 0];
                mapNormals[mapIdx * 3 + 1] = normals[origIdx * 3 + 1];
                mapNormals[mapIdx * 3 + 2] = normals[origIdx * 3 + 2];

                mapIdx++;
            }
        }

        // Generar índices para mapa
        const numTriangles = (mapVerticesX - 1) * (mapVerticesZ - 1) * 2;
        // Usar Uint32Array si el número de vértices supera 65535
        const mapIndices = mapTotalVertices > 65535
            ? new Uint32Array(numTriangles * 3)
            : new Uint16Array(numTriangles * 3);

        let idxPos = 0;
        for (let z = 0; z < mapVerticesZ - 1; z++) {
            for (let x = 0; x < mapVerticesX - 1; x++) {
                const topLeft = z * mapVerticesX + x;
                const topRight = topLeft + 1;
                const bottomLeft = (z + 1) * mapVerticesX + x;
                const bottomRight = bottomLeft + 1;

                // Triángulo 1
                mapIndices[idxPos++] = topLeft;
                mapIndices[idxPos++] = bottomLeft;
                mapIndices[idxPos++] = topRight;

                // Triángulo 2
                mapIndices[idxPos++] = topRight;
                mapIndices[idxPos++] = bottomLeft;
                mapIndices[idxPos++] = bottomRight;
            }
        }

        console.log(`Mapa generado: ${numTriangles.toLocaleString()} triángulos (${(numTriangles / this.terrainData.numTriangles * 100).toFixed(1)}% del original)`);

        // Crear buffers separados para mapa
        this.createMapBuffers(
            mapVertices,
            mapColors,
            mapNormals,
            mapIndices
        );

        this.mapIndexCount = mapIndices.length;
    }

    /**
     * Crea buffers específicos para el mapa
     */
    createMapBuffers(vertices, colors, normals, indices) {
        const gl = this.engine.gl;

        // Buffer de posiciones mapa
        this.mapPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mapPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        // Buffer de colores mapa
        this.mapColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mapColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

        // Buffer de normales mapa
        this.mapNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mapNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

        // Buffer de índices mapa
        this.mapIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mapIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        // Guardar si usa UNSIGNED_INT o UNSIGNED_SHORT
        let maxIndex = 0;
        for (let i = 0; i < indices.length; i++) {
            if (indices[i] > maxIndex) maxIndex = indices[i];
        }
        this.mapIndexType = maxIndex > 65535 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;

        console.log('Buffers mapa creados - Max índice:', maxIndex, 'Tipo:', this.mapIndexType === gl.UNSIGNED_INT ? 'UINT' : 'USHORT');
    }

    /**
     * Crea buffers con soporte para normales
     */
    createBuffersWithNormals(vertices, colors, normals, indices) {
        const gl = this.engine.gl;

        // Buffer de posiciones
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        // Buffer de colores
        this.colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

        // Buffer de normales
        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

        // Buffer de índices
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        this.indexCount = indices.length;
        this.vertexCount = vertices.length / 3;

        console.log(`Buffers creados: ${this.vertexCount.toLocaleString()} vértices, ${this.indexCount.toLocaleString()} índices`);
    }

    /**
     * Crea estructura de triángulos para colisiones
     */
    createTrianglesFromData() {
        const { vertices, indices } = this.terrainData;

        this.triangles = [];

        for (let i = 0; i < indices.length; i += 3) {
            const i0 = indices[i];
            const i1 = indices[i + 1];
            const i2 = indices[i + 2];

            const v0 = new Vec3(vertices[i0 * 3], vertices[i0 * 3 + 1], vertices[i0 * 3 + 2]);
            const v1 = new Vec3(vertices[i1 * 3], vertices[i1 * 3 + 1], vertices[i1 * 3 + 2]);
            const v2 = new Vec3(vertices[i2 * 3], vertices[i2 * 3 + 1], vertices[i2 * 3 + 2]);

            this.triangles.push({ v0, v1, v2 });
        }

        console.log(`Estructura de colisión creada: ${this.triangles.length.toLocaleString()} triángulos`);
    }

    /**
     * Crea buffer de índices para wireframe
     */
    createWireframeBuffer() {
        const gl = this.engine.gl;
        const { indices } = this.terrainData;

        // Convertir triángulos a líneas (cada triángulo genera 3 líneas)
        const lineIndices = new Uint32Array((indices.length / 3) * 6);
        let lineIdx = 0;

        for (let i = 0; i < indices.length; i += 3) {
            const i0 = indices[i];
            const i1 = indices[i + 1];
            const i2 = indices[i + 2];

            // Línea 1: i0 -> i1
            lineIndices[lineIdx++] = i0;
            lineIndices[lineIdx++] = i1;

            // Línea 2: i1 -> i2
            lineIndices[lineIdx++] = i1;
            lineIndices[lineIdx++] = i2;

            // Línea 3: i2 -> i0
            lineIndices[lineIdx++] = i2;
            lineIndices[lineIdx++] = i0;
        }

        this.wireframeIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.wireframeIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, lineIndices, gl.STATIC_DRAW);
        this.wireframeIndexCount = lineIndices.length;

        console.log(`Buffer wireframe creado: ${this.wireframeIndexCount.toLocaleString()} índices de líneas`);
    }

    /**
     * Renderiza el terreno con normales
     */
    render(engine, wireframe = false, useMap = false) {
        const gl = engine.gl;
        const program = engine.getCurrentProgram();

        if (!program) {
            console.error('No hay programa activo');
            return;
        }

        // Configurar atributos
        const aPosition = gl.getAttribLocation(program, 'aPosition');
        const aColor = gl.getAttribLocation(program, 'aColor');
        const aNormal = gl.getAttribLocation(program, 'aNormal');

        // Seleccionar buffers según modo
        const posBuffer = useMap ? this.mapPositionBuffer : this.positionBuffer;
        const colBuffer = useMap ? this.mapColorBuffer : this.colorBuffer;
        const normBuffer = useMap ? this.mapNormalBuffer : this.normalBuffer;
        const idxBuffer = useMap ? this.mapIndexBuffer : this.indexBuffer;
        const idxCount = useMap ? this.mapIndexCount : this.indexCount;
        const idxType = useMap ? (this.mapIndexType || gl.UNSIGNED_INT) : gl.UNSIGNED_INT;


        // Verificar que los buffers requeridos existen
        if (!posBuffer || !colBuffer || !normBuffer || !idxBuffer) {
            console.error('Faltan buffers requeridos');
            return;
        }

        // Verificar que los atributos existen
        if (aPosition === -1 || aColor === -1 || aNormal === -1) {
            console.error('Faltan atributos en shader:', { aPosition, aColor, aNormal });
            return;
        }

        // Posiciones
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.enableVertexAttribArray(aPosition);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

        // Colores
        gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
        gl.enableVertexAttribArray(aColor);
        gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);

        // Normales
        gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);
        gl.enableVertexAttribArray(aNormal);
        gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);

        // Habilitar extensión para índices de 32 bits si no está habilitada
        if (!this.ext) {
            this.ext = gl.getExtension('OES_element_index_uint');
            if (!this.ext) {
                console.error('OES_element_index_uint no está soportado');
                return;
            }
        }

        if (wireframe && !useMap) {
            // Crear buffer de líneas para wireframe si no existe
            if (!this.wireframeIndexBuffer) {
                this.createWireframeBuffer();
            }

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.wireframeIndexBuffer);
            gl.drawElements(gl.LINES, this.wireframeIndexCount, gl.UNSIGNED_INT, 0);
        } else {
            // Renderizar triángulos normales
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuffer);

            // Verificar que idxCount es válido
            if (!idxCount || idxCount <= 0) {
                console.error('idxCount inválido:', idxCount);
                return;
            }

            gl.drawElements(gl.TRIANGLES, idxCount, idxType, 0);
        }

        // Desactivar atributos
        if (aPosition !== -1) gl.disableVertexAttribArray(aPosition);
        if (aColor !== -1) gl.disableVertexAttribArray(aColor);
        if (aNormal !== -1) gl.disableVertexAttribArray(aNormal);
    }

    /**
     * Obtiene altura en una posición del mundo
     */
    getHeightAt(worldX, worldZ) {
        if (!this.terrainData) return 0;

        const generator = new TerrainGeneratorSingle(this.seed);
        return generator.getHeightAt(
            this.terrainData.heightMap,
            this.terrainData.verticesX,
            this.terrainData.verticesZ,
            this.sizeX,
            this.sizeZ,
            this.resolution,
            worldX,
            worldZ
        );
    }

    /**
     * Obtiene altura en triángulo (para física)
     */
    getHeightOnTriangle(x, z, triangle) {
        const v0 = triangle.v0;
        const v1 = triangle.v1;
        const v2 = triangle.v2;

        const edge1 = { x: v1.x - v0.x, y: v1.y - v0.y, z: v1.z - v0.z };
        const edge2 = { x: v2.x - v0.x, y: v2.y - v0.y, z: v2.z - v0.z };

        const nx = edge1.y * edge2.z - edge1.z * edge2.y;
        const ny = edge1.z * edge2.x - edge1.x * edge2.z;
        const nz = edge1.x * edge2.y - edge1.y * edge2.x;

        if (Math.abs(ny) < 0.0001) {
            return (v0.y + v1.y + v2.y) / 3;
        }

        const y = v0.y - (nx * (x - v0.x) + nz * (z - v0.z)) / ny;
        return y;
    }
}
