// TerrainMesh - Terreno adaptado al nuevo sistema
class TerrainMesh extends Mesh {
    constructor(engine, width = 50, depth = 20, resolution = 1, autoGenerate = true) {
        super(engine);

        this.width = width;
        this.depth = depth;
        this.resolution = resolution;
        this.heightMap = null;
        this.triangles = [];
        this.useTexture = false; // Marcar si usa textura
        this.textureName = null; // Nombre de la textura a usar
        this.displacementName = null; // Nombre del displacement map
        this.displacementScale = 0.9; // Escala del desplazamiento

        if (autoGenerate) {
            this.generateHeightMap();
            this.generate();
        }
    }

    // Generar mapa de alturas desde imagen o aleatorio
    generateHeightMap(imageData = null, heightScale = 50) {
        const numVerticesX = Math.floor(this.width / this.resolution) + 1;
        const numVerticesZ = Math.floor(this.depth / this.resolution) + 1;

        this.heightMap = [];

        if (imageData) {
            // Generar desde imagen
            const imgWidth = imageData.width;
            const imgHeight = imageData.height;
            const pixels = imageData.data;

            for (let z = 0; z < numVerticesZ; z++) {
                this.heightMap[z] = [];
                for (let x = 0; x < numVerticesX; x++) {
                    // Mapear coordenadas del terreno a coordenadas de la imagen
                    const imgX = Math.floor((x / (numVerticesX - 1)) * (imgWidth - 1));
                    const imgY = Math.floor((z / (numVerticesZ - 1)) * (imgHeight - 1));

                    // Obtener píxel (RGBA)
                    const pixelIndex = (imgY * imgWidth + imgX) * 4;
                    const r = pixels[pixelIndex];

                    // Convertir a altura (0-255 -> 0-heightScale)
                    this.heightMap[z][x] = (r / 255) * heightScale;
                }
            }
        } else {
            // Generar aleatoriamente
            for (let z = 0; z < numVerticesZ; z++) {
                this.heightMap[z] = [];
                for (let x = 0; x < numVerticesX; x++) {
                    this.heightMap[z][x] = Math.random() * 5;
                }
            }
            this.smoothHeightMap(2);
        }
    }

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

                    if (x > 0) { sum += this.heightMap[z][x - 1]; count++; }
                    if (x < numVerticesX - 1) { sum += this.heightMap[z][x + 1]; count++; }
                    if (z > 0) { sum += this.heightMap[z - 1][x]; count++; }
                    if (z < numVerticesZ - 1) { sum += this.heightMap[z + 1][x]; count++; }

                    smoothed[z][x] = sum / count;
                }
            }

            this.heightMap = smoothed;
        }
    }

    getHeightMapValue(x, z) {
        if (!this.heightMap) return 0;

        const numVerticesZ = this.heightMap.length;
        const numVerticesX = this.heightMap[0].length;

        if (z < 0 || z >= numVerticesZ || x < 0 || x >= numVerticesX) {
            return 0;
        }

        return this.heightMap[z][x];
    }

    generate() {
        const vertices = [];
        const colors = [];
        const uvs = [];
        const indices = [];

        const numSquaresX = Math.floor(this.width / this.resolution);
        const numSquaresZ = Math.floor(this.depth / this.resolution);

        const offsetX = -this.width / 2;
        const offsetZ = -this.depth / 2;

        let indexOffset = 0;

        for (let z = 0; z < numSquaresZ; z++) {
            for (let x = 0; x < numSquaresX; x++) {
                const x0 = offsetX + x * this.resolution;
                const z0 = offsetZ + z * this.resolution;
                const x1 = x0 + this.resolution;
                const z1 = z0 + this.resolution;

                const y0 = this.getHeightMapValue(x, z);
                const y1 = this.getHeightMapValue(x + 1, z);
                const y2 = this.getHeightMapValue(x + 1, z + 1);
                const y3 = this.getHeightMapValue(x, z + 1);

                const v0 = new Vec3(x0, y0, z0);
                const v1 = new Vec3(x1, y1, z0);
                const v2 = new Vec3(x1, y2, z1);
                const v3 = new Vec3(x0, y3, z1);

                // Añadir vértices
                vertices.push(v0.x, v0.y, v0.z);
                vertices.push(v1.x, v1.y, v1.z);
                vertices.push(v2.x, v2.y, v2.z);
                vertices.push(v3.x, v3.y, v3.z);

                // Coordenadas UV normalizadas para todo el terreno (0-1)
                const u0 = (x0 - offsetX) / this.width;
                const v0_uv = (z0 - offsetZ) / this.depth;
                const u1 = (x1 - offsetX) / this.width;
                const v1_uv = (z1 - offsetZ) / this.depth;

                // Añadir UVs para cada vértice
                uvs.push(u0, v0_uv);      // v0
                uvs.push(u1, v0_uv);      // v1
                uvs.push(u1, v1_uv);      // v2
                uvs.push(u0, v1_uv);      // v3

                // Color basado en altura
                const avgHeight = (y0 + y1 + y2 + y3) / 4;
                const heightFactor = Math.min(1.0, avgHeight / 3.0);

                const color = [
                    0.2 + heightFactor * 0.3,
                    0.5 + heightFactor * 0.3,
                    0.2 + heightFactor * 0.2
                ];

                for (let i = 0; i < 4; i++) {
                    colors.push(color[0], color[1], color[2]);
                }

                // Índices
                indices.push(indexOffset + 0, indexOffset + 1, indexOffset + 2);
                indices.push(indexOffset + 0, indexOffset + 2, indexOffset + 3);

                // Guardar triángulos para colisiones
                this.triangles.push({
                    v0: new Vec3(v0.x, v0.y, v0.z),
                    v1: new Vec3(v1.x, v1.y, v1.z),
                    v2: new Vec3(v2.x, v2.y, v2.z)
                });
                this.triangles.push({
                    v0: new Vec3(v0.x, v0.y, v0.z),
                    v2: new Vec3(v2.x, v2.y, v2.z),
                    v3: new Vec3(v3.x, v3.y, v3.z)
                });

                indexOffset += 4;
            }
        }

        this.createBuffers(vertices, colors, indices, uvs);
    }

    // Obtener altura en una posición XZ
    getHeightAt(worldX, worldZ) {
        const offsetX = -this.width / 2;
        const offsetZ = -this.depth / 2;

        const localX = worldX - offsetX;
        const localZ = worldZ - offsetZ;

        const gridX = Math.floor(localX / this.resolution);
        const gridZ = Math.floor(localZ / this.resolution);

        const numSquaresX = Math.floor(this.width / this.resolution);
        const numSquaresZ = Math.floor(this.depth / this.resolution);

        if (gridX < 0 || gridX >= numSquaresX || gridZ < 0 || gridZ >= numSquaresZ) {
            return 0;
        }

        const squareIndex = gridZ * numSquaresX + gridX;
        const tri1Index = squareIndex * 2;
        const tri2Index = squareIndex * 2 + 1;

        const tri1 = this.triangles[tri1Index];
        const tri2 = this.triangles[tri2Index];

        const fx = (localX / this.resolution) - gridX;
        const fz = (localZ / this.resolution) - gridZ;

        // Los triángulos están divididos así:
        // T1 (tri1): v0(0,0), v1(1,0), v2(1,1)
        // T2 (tri2): v0(0,0), v2(1,1), v3(0,1)
        // La diagonal va de v0 a v2
        // Si fx >= fz, estamos en T1 (abajo-derecha)
        // Si fx < fz, estamos en T2 (arriba-izquierda)

        let triangle;
        if (fx >= fz) {
            triangle = tri1; // Triángulo inferior derecho
        } else {
            triangle = tri2; // Triángulo superior izquierdo
        }

        return this.getHeightOnTriangle(worldX, worldZ, triangle);
    }

    getHeightOnTriangle(x, z, triangle) {
        const vert0 = triangle.v0;
        const vert1 = triangle.v1 || triangle.v2; // Si no hay v1, usar v2
        const vert2 = triangle.v2 || triangle.v3; // Si no hay v2 (caso imposible), usar v3

        // Si es el segundo triángulo (v0, v2, v3)
        let v1, v2;
        if (triangle.v3) {
            // Segundo triángulo: v0, v2, v3
            v1 = triangle.v2;
            v2 = triangle.v3;
        } else {
            // Primer triángulo: v0, v1, v2
            v1 = triangle.v1;
            v2 = triangle.v2;
        }

        const edge1 = { x: v1.x - vert0.x, y: v1.y - vert0.y, z: v1.z - vert0.z };
        const edge2 = { x: v2.x - vert0.x, y: v2.y - vert0.y, z: v2.z - vert0.z };

        const nx = edge1.y * edge2.z - edge1.z * edge2.y;
        const ny = edge1.z * edge2.x - edge1.x * edge2.z;
        const nz = edge1.x * edge2.y - edge1.y * edge2.x;

        if (Math.abs(ny) < 0.0001) {
            return (vert0.y + v1.y + v2.y) / 3;
        }

        const y = vert0.y - (nx * (x - vert0.x) + nz * (z - vert0.z)) / ny;
        return y;
    }
}
