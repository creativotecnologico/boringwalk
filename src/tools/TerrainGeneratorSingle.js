// TerrainGeneratorSingle.js
// Utilidad para generar terrenos completos de una vez
// Para uso en terrenos estáticos de 5km x 5km

// Utilidad para crear noise determinista
class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }

    random() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
}

class Noise {
    constructor(seed) {
        this.seed = seed;
        this.p = [];
        const rng = new SeededRandom(seed);

        for (let i = 0; i < 256; i++) {
            this.p[i] = Math.floor(rng.random() * 256);
        }
        for (let i = 0; i < 256; i++) {
            this.p[256 + i] = this.p[i];
        }
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(t, a, b) {
        return a + t * (b - a);
    }

    grad(hash, x, y) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    perlin2(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);

        const u = this.fade(x);
        const v = this.fade(y);

        const a = this.p[X] + Y;
        const aa = this.p[a];
        const ab = this.p[a + 1];
        const b = this.p[X + 1] + Y;
        const ba = this.p[b];
        const bb = this.p[b + 1];

        return this.lerp(v,
            this.lerp(u, this.grad(this.p[aa], x, y), this.grad(this.p[ba], x - 1, y)),
            this.lerp(u, this.grad(this.p[ab], x, y - 1), this.grad(this.p[bb], x - 1, y - 1))
        );
    }
}

// FBM (Fractal Brownian Motion)
function fbm(noise, x, y, octaves, persistence = 0.5) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
        total += noise.perlin2(x * frequency, y * frequency) * amplitude;
        maxValue += amplitude;
        amplitude *= persistence;
        frequency *= 2;
    }

    return total / maxValue;
}

// Definición de biomas adaptados a rangos de -12m a 450m
const BIOMES = {
    DEEP_OCEAN: {
        name: 'Océano Profundo',
        color: [0.10, 0.30, 0.48], // #1a4d7a
        minHeight: -50,
        maxHeight: -15
    },
    OCEAN: {
        name: 'Océano',
        color: [0.16, 0.50, 0.72], // #2980b9
        minHeight: -15,
        maxHeight: -1
    },
    BEACH: {
        name: 'Playa',
        color: [0.96, 0.82, 0.25], // #f4d03f
        minHeight: -1,
        maxHeight: 5
    },
    PLAINS: {
        name: 'Llanura',
        color: [0.32, 0.76, 0.20], // #52c234
        minHeight: 5,
        maxHeight: 50
    },
    FOREST: {
        name: 'Bosque',
        color: [0.15, 0.68, 0.38], // #27ae60
        minHeight: 50,
        maxHeight: 120
    },
    HILLS: {
        name: 'Colinas',
        color: [0.50, 0.55, 0.55], // #7f8c8d
        minHeight: 120,
        maxHeight: 220
    },
    MOUNTAINS: {
        name: 'Montañas',
        color: [0.58, 0.65, 0.65], // #95a5a6
        minHeight: 220,
        maxHeight: 350
    },
    SNOW_PEAKS: {
        name: 'Picos Nevados',
        color: [0.93, 0.94, 0.95], // #ecf0f1
        minHeight: 350,
        maxHeight: 650
    }
};

function getBiome(height) {
    for (const biome of Object.values(BIOMES)) {
        if (height >= biome.minHeight && height < biome.maxHeight) {
            return biome;
        }
    }
    return BIOMES.SNOW_PEAKS;
}

// Obtener bioma basado en el valor de noise (0-1) en lugar de altura
function getBiomeFromValue(t) {
    if (t < 0.35) {
        return BIOMES.DEEP_OCEAN;
    } else if (t < 0.42) {
        return BIOMES.OCEAN;
    } else if (t < 0.52) {
        return BIOMES.BEACH;
    } else if (t < 0.62) {
        return BIOMES.PLAINS;
    } else if (t < 0.72) {
        return BIOMES.FOREST;
    } else if (t < 0.85) {
        return BIOMES.HILLS;
    } else {
        return BIOMES.SNOW_PEAKS;
    }
}

class TerrainGeneratorSingle {
    constructor(seed) {
        this.seed = seed;
        this.heightNoise = new Noise(seed);
        this.biomeNoise = new Noise(seed + 1000);
        this.detailNoise = new Noise(seed + 2000);
        this.thresholdNoise = new Noise(seed + 3000);
        this.snowThresholdNoise = new Noise(seed + 4000); // Nuevo: variación específica para montañas nevadas
    }

    /**
     * Genera un terreno completo de una vez
     * @param {number} sizeX - Tamaño en X (metros)
     * @param {number} sizeZ - Tamaño en Z (metros)
     * @param {number} resolution - Resolución (metros por vértice)
     * @returns {Object} { heightMap, colorMap, vertices, indices, normals }
     */
    generate(sizeX = 5000, sizeZ = 5000, resolution = 5) {
        const startTime = performance.now();

        // Calcular número de vértices
        const verticesX = Math.floor(sizeX / resolution) + 1;
        const verticesZ = Math.floor(sizeZ / resolution) + 1;
        const totalVertices = verticesX * verticesZ;

        console.log(`Generando terreno de ${sizeX}x${sizeZ}m con resolución ${resolution}m`);
        console.log(`Vértices: ${verticesX}x${verticesZ} = ${totalVertices.toLocaleString()}`);

        // Arrays de datos
        const heightMap = new Float32Array(totalVertices);
        const colorMap = new Float32Array(totalVertices * 3); // RGB
        const vertices = new Float32Array(totalVertices * 3); // XYZ
        const normals = new Float32Array(totalVertices * 3); // XYZ

        // Generar altura y color para cada vértice
        for (let z = 0; z < verticesZ; z++) {
            for (let x = 0; x < verticesX; x++) {
                const idx = z * verticesX + x;

                // Coordenadas del mundo (centradas en 0,0)
                const worldX = (x * resolution - sizeX / 2) / 100;
                const worldZ = (z * resolution - sizeZ / 2) / 100;

                // Generar valor de bioma (escala grande)
                const biomeValue = fbm(this.biomeNoise, worldX * 0.3, worldZ * 0.3, 3);

                // Noise base para altura
                const baseNoise = fbm(this.heightNoise, worldX * 0.5, worldZ * 0.5, 4);

                // Generar variación de umbrales (±15m)
                const thresholdVariation = fbm(this.thresholdNoise, worldX * 0.8, worldZ * 0.8, 2) * 15;
                
                // Variación específica para montañas nevadas (±100m)
                const snowThresholdVariation = fbm(this.snowThresholdNoise, worldX * 0.6, worldZ * 0.6, 3) * 100;

                // Mapear biomeValue a altura con interpolación suave
                // biomeValue va de -1 a 1, normalizamos a 0-1
                const t = (biomeValue + 1) / 2; // 0 a 1

                let height;

                if (t < 0.35) {
                    // Océano profundo a océano: -50m a -1m
                    const localT = t / 0.35;
                    height = (-50 + thresholdVariation) + localT * 49 + baseNoise * 5;
                } else if (t < 0.42) {
                    // Océano a playa: -1m a 5m
                    const localT = (t - 0.35) / 0.07;
                    height = (-1 + thresholdVariation) + localT * 6 + baseNoise * 2;
                } else if (t < 0.52) {
                    // Playa a llanuras: 5m a 50m
                    const localT = (t - 0.42) / 0.10;
                    height = (5 + thresholdVariation) + localT * 45 + baseNoise * 8;
                } else if (t < 0.62) {
                    // Llanuras a bosque: 50m a 120m
                    const localT = (t - 0.52) / 0.10;
                    height = (50 + thresholdVariation) + localT * 70 + baseNoise * 15;
                } else if (t < 0.72) {
                    // Bosque a colinas: 120m a 220m
                    const localT = (t - 0.62) / 0.10;
                    const smoothT = localT * localT * (3 - 2 * localT); // Smoothstep
                    height = (120 + thresholdVariation) + smoothT * 100 + baseNoise * 25;
                } else if (t < 0.85) {
                    // Colinas a montañas: 220m a 350m
                    const localT = (t - 0.72) / 0.13;
                    const smoothT = localT * localT * (3 - 2 * localT);
                    height = (220 + thresholdVariation) + smoothT * 130 + baseNoise * 40;
                } else {
                    // Montañas a picos nevados: 350m a 650m
                    const localT = (t - 0.85) / 0.15;
                    const smoothT = localT * localT * (3 - 2 * localT);
                    height = (350 + snowThresholdVariation) + smoothT * 300 + baseNoise * 60;
                }

                // Añadir detalle fino más suave
                const detail = fbm(this.detailNoise, worldX * 3, worldZ * 3, 3) * 1.5;
                height += detail;

                // Añadir elevación en los bordes del mapa (paredes naturales)
                const normalizedX = (x * resolution - sizeX / 2) / (sizeX / 2); // -1 a 1
                const normalizedZ = (z * resolution - sizeZ / 2) / (sizeZ / 2); // -1 a 1

                // Distancia al borde más cercano (0 en el centro, 1 en los bordes)
                const distToBorder = Math.max(Math.abs(normalizedX), Math.abs(normalizedZ));

                // Crear zona de transición suave que empieza al 70% del mapa
                const borderStart = 0.70;
                const borderInfluence = Math.max(0, (distToBorder - borderStart) / (1.0 - borderStart));

                // Función de suavizado (smoothstep cúbico para transición muy gradual)
                const smoothBorder = borderInfluence * borderInfluence * (3 - 2 * borderInfluence);

                // Elevar altura en los bordes (hasta 300m adicionales)
                const borderHeight = smoothBorder * 300;
                height += borderHeight;

                // Guardar altura
                heightMap[idx] = height;

                // Obtener bioma y color
                const biome = getBiome(height);
                colorMap[idx * 3] = biome.color[0];
                colorMap[idx * 3 + 1] = biome.color[1];
                colorMap[idx * 3 + 2] = biome.color[2];

                // Guardar posición del vértice (centrado en 0,0,0)
                const vx = x * resolution - sizeX / 2;
                const vy = height;
                const vz = z * resolution - sizeZ / 2;

                vertices[idx * 3] = vx;
                vertices[idx * 3 + 1] = vy;
                vertices[idx * 3 + 2] = vz;

                // Debug: imprimir primeros vértices
                if (idx < 5) {
                    console.log(`Vértice ${idx}: (${vx.toFixed(1)}, ${vy.toFixed(1)}, ${vz.toFixed(1)})`);
                }
            }
        }

        // Calcular normales
        this.calculateNormals(vertices, normals, verticesX, verticesZ);

        // Generar índices para triángulos
        const numTriangles = (verticesX - 1) * (verticesZ - 1) * 2;
        const indices = new Uint32Array(numTriangles * 3);

        let idxOffset = 0;
        for (let z = 0; z < verticesZ - 1; z++) {
            for (let x = 0; x < verticesX - 1; x++) {
                const topLeft = z * verticesX + x;
                const topRight = topLeft + 1;
                const bottomLeft = (z + 1) * verticesX + x;
                const bottomRight = bottomLeft + 1;

                // Primer triángulo
                indices[idxOffset++] = topLeft;
                indices[idxOffset++] = bottomLeft;
                indices[idxOffset++] = topRight;

                // Segundo triángulo
                indices[idxOffset++] = topRight;
                indices[idxOffset++] = bottomLeft;
                indices[idxOffset++] = bottomRight;
            }
        }

        const endTime = performance.now();
        const generationTime = (endTime - startTime).toFixed(2);

        console.log(`Terreno generado en ${generationTime}ms`);
        console.log(`Triángulos: ${numTriangles.toLocaleString()}`);

        return {
            heightMap,
            colorMap,
            vertices,
            normals,
            indices,
            sizeX,
            sizeZ,
            resolution,
            verticesX,
            verticesZ,
            numTriangles,
            generationTime
        };
    }

    /**
     * Calcula las normales para cada vértice
     */
    calculateNormals(vertices, normals, verticesX, verticesZ) {
        // Inicializar normales a 0
        normals.fill(0);

        // Para cada quad, calcular normal de cada triángulo y acumular en vértices
        for (let z = 0; z < verticesZ - 1; z++) {
            for (let x = 0; x < verticesX - 1; x++) {
                const topLeft = z * verticesX + x;
                const topRight = topLeft + 1;
                const bottomLeft = (z + 1) * verticesX + x;
                const bottomRight = bottomLeft + 1;

                // Primer triángulo (topLeft, bottomLeft, topRight)
                this.addTriangleNormal(vertices, normals, topLeft, bottomLeft, topRight);

                // Segundo triángulo (topRight, bottomLeft, bottomRight)
                this.addTriangleNormal(vertices, normals, topRight, bottomLeft, bottomRight);
            }
        }

        // Normalizar todas las normales
        for (let i = 0; i < normals.length; i += 3) {
            const nx = normals[i];
            const ny = normals[i + 1];
            const nz = normals[i + 2];
            const length = Math.sqrt(nx * nx + ny * ny + nz * nz);

            if (length > 0) {
                normals[i] /= length;
                normals[i + 1] /= length;
                normals[i + 2] /= length;
            }
        }
    }

    /**
     * Calcula la normal de un triángulo y la añade a los vértices
     */
    addTriangleNormal(vertices, normals, idx0, idx1, idx2) {
        // Obtener posiciones de los vértices
        const v0x = vertices[idx0 * 3];
        const v0y = vertices[idx0 * 3 + 1];
        const v0z = vertices[idx0 * 3 + 2];

        const v1x = vertices[idx1 * 3];
        const v1y = vertices[idx1 * 3 + 1];
        const v1z = vertices[idx1 * 3 + 2];

        const v2x = vertices[idx2 * 3];
        const v2y = vertices[idx2 * 3 + 1];
        const v2z = vertices[idx2 * 3 + 2];

        // Calcular vectores de los lados
        const edge1x = v1x - v0x;
        const edge1y = v1y - v0y;
        const edge1z = v1z - v0z;

        const edge2x = v2x - v0x;
        const edge2y = v2y - v0y;
        const edge2z = v2z - v0z;

        // Producto cruzado para obtener normal
        const nx = edge1y * edge2z - edge1z * edge2y;
        const ny = edge1z * edge2x - edge1x * edge2z;
        const nz = edge1x * edge2y - edge1y * edge2x;

        // Añadir normal a cada vértice del triángulo
        normals[idx0 * 3] += nx;
        normals[idx0 * 3 + 1] += ny;
        normals[idx0 * 3 + 2] += nz;

        normals[idx1 * 3] += nx;
        normals[idx1 * 3 + 1] += ny;
        normals[idx1 * 3 + 2] += nz;

        normals[idx2 * 3] += nx;
        normals[idx2 * 3 + 1] += ny;
        normals[idx2 * 3 + 2] += nz;
    }

    /**
     * Obtiene la altura en una posición del mundo (interpolación bilineal)
     */
    getHeightAt(heightMap, verticesX, verticesZ, sizeX, sizeZ, resolution, worldX, worldZ) {
        // Convertir coordenadas del mundo a coordenadas de grid
        const gridX = (worldX + sizeX / 2) / resolution;
        const gridZ = (worldZ + sizeZ / 2) / resolution;

        // Si está fuera del terreno, retornar 0
        if (gridX < 0 || gridX >= verticesX - 1 || gridZ < 0 || gridZ >= verticesZ - 1) {
            return 0;
        }

        // Obtener índices de los 4 vértices cercanos
        const x0 = Math.floor(gridX);
        const z0 = Math.floor(gridZ);
        const x1 = x0 + 1;
        const z1 = z0 + 1;

        // Obtener alturas de los 4 vértices
        const h00 = heightMap[z0 * verticesX + x0];
        const h10 = heightMap[z0 * verticesX + x1];
        const h01 = heightMap[z1 * verticesX + x0];
        const h11 = heightMap[z1 * verticesX + x1];

        // Factores de interpolación
        const fx = gridX - x0;
        const fz = gridZ - z0;

        // Interpolación bilineal
        const h0 = h00 * (1 - fx) + h10 * fx;
        const h1 = h01 * (1 - fx) + h11 * fx;
        const height = h0 * (1 - fz) + h1 * fz;

        return height;
    }
}

// Exportar para uso en Node.js o navegador
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TerrainGeneratorSingle, BIOMES, getBiome };
}
