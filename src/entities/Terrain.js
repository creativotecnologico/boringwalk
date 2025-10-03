// Terrain - Terreno compuesto de Squares
class Terrain {
    constructor(gl, width = 50, depth = 20, resolution = 1, useHeightMap = true) {
        this.gl = gl;
        this.width = width;
        this.depth = depth;
        this.resolution = resolution; // Tamaño de cada cuadrado en metros
        this.squares = [];
        this.triangles = []; // Lista de triángulos para colisiones
        this.geometry = null;
        this.heightMap = null;

        // Generar mapa de alturas si está habilitado
        if (useHeightMap) {
            this.generateHeightMap();
        }

        this.generate();
        this.createGeometry();
    }

    // Generar mapa de alturas aleatorio
    generateHeightMap() {
        const numVerticesX = Math.floor(this.width / this.resolution) + 1;
        const numVerticesZ = Math.floor(this.depth / this.resolution) + 1;

        this.heightMap = [];

        // Generar alturas aleatorias con ruido simple
        for (let z = 0; z < numVerticesZ; z++) {
            this.heightMap[z] = [];
            for (let x = 0; x < numVerticesX; x++) {
                // Ruido aleatorio simple
                const height = Math.random() * 3; // Entre 0 y 3 metros

                // Opcional: suavizar usando promedio de vecinos
                this.heightMap[z][x] = height;
            }
        }

        // Aplicar suavizado simple (promedio de vecinos)
        this.smoothHeightMap(2); // 2 pasadas de suavizado
    }

    // Suavizar el mapa de alturas
    smoothHeightMap(passes = 1) {
        const numVerticesX = Math.floor(this.width / this.resolution) + 1;
        const numVerticesZ = Math.floor(this.depth / this.resolution) + 1;

        for (let pass = 0; pass < passes; pass++) {
            const smoothed = [];

            for (let z = 0; z < numVerticesZ; z++) {
                smoothed[z] = [];
                for (let x = 0; x < numVerticesX; x++) {
                    let sum = this.heightMap[z][x];
                    let count = 1;

                    // Promediar con vecinos
                    if (x > 0) {
                        sum += this.heightMap[z][x - 1];
                        count++;
                    }
                    if (x < numVerticesX - 1) {
                        sum += this.heightMap[z][x + 1];
                        count++;
                    }
                    if (z > 0) {
                        sum += this.heightMap[z - 1][x];
                        count++;
                    }
                    if (z < numVerticesZ - 1) {
                        sum += this.heightMap[z + 1][x];
                        count++;
                    }

                    smoothed[z][x] = sum / count;
                }
            }

            this.heightMap = smoothed;
        }
    }

    // Obtener altura del mapa en un índice de vértice
    getHeightMapValue(x, z) {
        if (!this.heightMap) return 0;

        const numVerticesZ = this.heightMap.length;
        const numVerticesX = this.heightMap[0].length;

        if (z < 0 || z >= numVerticesZ || x < 0 || x >= numVerticesX) {
            return 0;
        }

        return this.heightMap[z][x];
    }

    // Generar conjunto de squares
    generate() {
        // Número de squares en cada dirección
        const numSquaresX = Math.floor(this.width / this.resolution);
        const numSquaresZ = Math.floor(this.depth / this.resolution);

        // Centrar el terreno en el origen
        const offsetX = -this.width / 2;
        const offsetZ = -this.depth / 2;

        for (let z = 0; z < numSquaresZ; z++) {
            for (let x = 0; x < numSquaresX; x++) {
                const x0 = offsetX + x * this.resolution;
                const z0 = offsetZ + z * this.resolution;
                const x1 = x0 + this.resolution;
                const z1 = z0 + this.resolution;

                // Obtener alturas de los 4 vértices del square desde el heightMap
                const y0 = this.getHeightMapValue(x, z);
                const y1 = this.getHeightMapValue(x + 1, z);
                const y2 = this.getHeightMapValue(x + 1, z + 1);
                const y3 = this.getHeightMapValue(x, z + 1);

                // Crear vértices del square con alturas
                const v0 = new Vec3(x0, y0, z0);
                const v1 = new Vec3(x1, y1, z0);
                const v2 = new Vec3(x1, y2, z1);
                const v3 = new Vec3(x0, y3, z1);

                // Color del terreno basado en altura (más claro = más alto)
                const avgHeight = (y0 + y1 + y2 + y3) / 4;
                const heightFactor = Math.min(1.0, avgHeight / 3.0); // Normalizar entre 0-1

                // Verde más claro para zonas altas, más oscuro para zonas bajas
                const color = [
                    0.2 + heightFactor * 0.3,  // R
                    0.5 + heightFactor * 0.3,  // G
                    0.2 + heightFactor * 0.2   // B
                ];

                // Crear square
                const square = new Square(v0, v1, v2, v3, color);
                this.squares.push(square);

                // Guardar los 2 triángulos del square para colisiones
                // Triángulo 1: v0, v1, v2
                this.triangles.push({
                    v0: new Vec3(v0.x, v0.y, v0.z),
                    v1: new Vec3(v1.x, v1.y, v1.z),
                    v2: new Vec3(v2.x, v2.y, v2.z)
                });
                // Triángulo 2: v0, v2, v3
                this.triangles.push({
                    v0: new Vec3(v0.x, v0.y, v0.z),
                    v2: new Vec3(v2.x, v2.y, v2.z),
                    v3: new Vec3(v3.x, v3.y, v3.z)
                });
            }
        }
    }

    // Crear geometría para renderizar
    createGeometry() {
        const vertices = [];
        const colors = [];
        const indices = [];

        let indexOffset = 0;

        this.squares.forEach(square => {
            // Añadir vértices
            vertices.push(...square.getVerticesArray());

            // Añadir colores
            colors.push(...square.getColorsArray());

            // Añadir índices (ajustados por el offset)
            square.indices.forEach(idx => {
                indices.push(idx + indexOffset);
            });

            indexOffset += 4; // 4 vértices por square
        });

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

            // Tres líneas por cada triángulo
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

    // Renderizar terreno
    render(shader, wireframe = false) {
        if (this.geometry) {
            this.geometry.render(shader, wireframe);
        }
    }

    // Obtener altura del terreno en una posición XZ usando el triángulo correcto
    getHeightAt(worldX, worldZ) {
        // Convertir de coordenadas del mundo a índices del grid
        const offsetX = -this.width / 2;
        const offsetZ = -this.depth / 2;

        const localX = worldX - offsetX;
        const localZ = worldZ - offsetZ;

        // Obtener índices en el grid
        const gridX = Math.floor(localX / this.resolution);
        const gridZ = Math.floor(localZ / this.resolution);

        // Verificar límites
        const numSquaresX = Math.floor(this.width / this.resolution);
        const numSquaresZ = Math.floor(this.depth / this.resolution);

        if (gridX < 0 || gridX >= numSquaresX || gridZ < 0 || gridZ >= numSquaresZ) {
            return 0;
        }

        // Calcular índice del square
        const squareIndex = gridZ * numSquaresX + gridX;

        // Cada square tiene 2 triángulos
        const tri1Index = squareIndex * 2;
        const tri2Index = squareIndex * 2 + 1;

        const tri1 = this.triangles[tri1Index];
        const tri2 = this.triangles[tri2Index];

        // Determinar qué triángulo contiene el punto usando coordenadas baricéntricas
        // Para el square: v0(x0,z0), v1(x1,z0), v2(x1,z1), v3(x0,z1)
        // Tri1: v0, v1, v2
        // Tri2: v0, v2, v3

        const fx = (localX / this.resolution) - gridX;
        const fz = (localZ / this.resolution) - gridZ;

        let triangle;
        if (fx + fz <= 1.0) {
            // Punto está en el triángulo 1 (v0, v1, v2)
            triangle = tri1;
        } else {
            // Punto está en el triángulo 2 (v0, v2, v3)
            triangle = tri2;
        }

        // Calcular altura usando el plano del triángulo
        return this.getHeightOnTriangle(worldX, worldZ, triangle);
    }

    // Calcular altura de un punto XZ sobre un triángulo 3D
    getHeightOnTriangle(x, z, triangle) {
        // Obtener los 3 vértices del triángulo
        // Tri1: { v0, v1, v2 }
        // Tri2: { v0, v2, v3 }
        let vert0, vert1, vert2;

        if (triangle.v1) {
            // Triángulo 1: v0, v1, v2
            vert0 = triangle.v0;
            vert1 = triangle.v1;
            vert2 = triangle.v2;
        } else {
            // Triángulo 2: v0, v2, v3
            vert0 = triangle.v0;
            vert1 = triangle.v2;
            vert2 = triangle.v3;
        }

        // Calcular el plano del triángulo usando la ecuación del plano
        // Plano: ax + by + cz + d = 0
        // Normal del plano: (v1-v0) × (v2-v0)

        const edge1 = { x: vert1.x - vert0.x, y: vert1.y - vert0.y, z: vert1.z - vert0.z };
        const edge2 = { x: vert2.x - vert0.x, y: vert2.y - vert0.y, z: vert2.z - vert0.z };

        // Producto cruz para obtener la normal
        const nx = edge1.y * edge2.z - edge1.z * edge2.y;
        const ny = edge1.z * edge2.x - edge1.x * edge2.z;
        const nz = edge1.x * edge2.y - edge1.y * edge2.x;

        // Ecuación del plano: nx*(x-v0.x) + ny*(y-v0.y) + nz*(z-v0.z) = 0
        // Resolver para y:
        // ny*(y-v0.y) = -nx*(x-v0.x) - nz*(z-v0.z)
        // y = v0.y - (nx*(x-v0.x) + nz*(z-v0.z)) / ny

        if (Math.abs(ny) < 0.0001) {
            // Triángulo vertical, usar altura promedio
            return (vert0.y + vert1.y + vert2.y) / 3;
        }

        const y = vert0.y - (nx * (x - vert0.x) + nz * (z - vert0.z)) / ny;
        return y;
    }
}
