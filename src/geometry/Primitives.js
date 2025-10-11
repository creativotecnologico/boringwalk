// Primitives - Geometrías básicas
class Primitives {
    // Crear cápsula (cilindro + 2 hemisferios)
    static createCapsule(engine, radius = 0.4, height = 1.8, color = [0.8, 0.3, 0.3]) {
        const vertices = [];
        const colors = [];
        const indices = [];

        const segments = 16;
        const heightSegments = 4;
        const cylinderHeight = height - 2 * radius;

        let vertexIndex = 0;

        // Cilindro central
        for (let i = 0; i <= heightSegments; i++) {
            const y = -cylinderHeight / 2 + (i / heightSegments) * cylinderHeight;

            for (let j = 0; j <= segments; j++) {
                const angle = (j / segments) * Math.PI * 2;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;

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

        // Hemisferio superior
        const hemisphereSegments = 8;
        for (let i = 0; i <= hemisphereSegments; i++) {
            const theta = (i / hemisphereSegments) * (Math.PI / 2);
            const y = cylinderHeight / 2 + Math.sin(theta) * radius;
            const r = Math.cos(theta) * radius;

            for (let j = 0; j <= segments; j++) {
                const angle = (j / segments) * Math.PI * 2;
                const x = Math.cos(angle) * r;
                const z = Math.sin(angle) * r;

                vertices.push(x, y, z);
                colors.push(color[0], color[1], color[2]);
            }
        }

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

        // Hemisferio inferior
        for (let i = 0; i <= hemisphereSegments; i++) {
            const theta = (i / hemisphereSegments) * (Math.PI / 2);
            const y = -cylinderHeight / 2 - Math.sin(theta) * radius;
            const r = Math.cos(theta) * radius;

            for (let j = 0; j <= segments; j++) {
                const angle = (j / segments) * Math.PI * 2;
                const x = Math.cos(angle) * r;
                const z = Math.sin(angle) * r;

                vertices.push(x, y, z);
                colors.push(color[0], color[1], color[2]);
            }
        }

        const bottomStart = vertexIndex;
        for (let i = 0; i < hemisphereSegments; i++) {
            for (let j = 0; j < segments; j++) {
                const first = bottomStart + i * (segments + 1) + j;
                const second = first + segments + 1;

                indices.push(first, first + 1, second);
                indices.push(second, first + 1, second + 1);
            }
        }

        const mesh = new Mesh(engine);
        mesh.createBuffers(vertices, colors, indices);
        return mesh;
    }

    // Crear eje de coordenadas
    static createAxis(engine, size = 1.0) {
        const arrowSize = size * 0.15;
        const arrowWidth = size * 0.05;

        const vertices = [];
        const colors = [];

        // Eje X (rojo)
        vertices.push(0, 0, 0, size, 0, 0);
        colors.push(1, 0, 0, 1, 0, 0);

        const xArrowBase = size - arrowSize;
        vertices.push(size, 0, 0, xArrowBase, arrowWidth, 0);
        vertices.push(size, 0, 0, xArrowBase, -arrowWidth, 0);
        colors.push(1, 0, 0, 1, 0, 0);
        colors.push(1, 0, 0, 1, 0, 0);

        // Eje Y (verde)
        vertices.push(0, 0, 0, 0, size, 0);
        colors.push(0, 1, 0, 0, 1, 0);

        const yArrowBase = size - arrowSize;
        vertices.push(0, size, 0, arrowWidth, yArrowBase, arrowWidth);
        vertices.push(0, size, 0, -arrowWidth, yArrowBase, -arrowWidth);
        colors.push(0, 1, 0, 0, 1, 0);
        colors.push(0, 1, 0, 0, 1, 0);

        // Eje Z (azul)
        vertices.push(0, 0, 0, 0, 0, size);
        colors.push(0, 0, 1, 0, 0, 1);

        const zArrowBase = size - arrowSize;
        vertices.push(0, 0, size, 0, arrowWidth, zArrowBase);
        vertices.push(0, 0, size, 0, -arrowWidth, zArrowBase);
        colors.push(0, 0, 1, 0, 0, 1);
        colors.push(0, 0, 1, 0, 0, 1);

        // Crear mesh especial para líneas
        const mesh = new Mesh(engine);
        const gl = engine.gl;

        mesh.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        mesh.colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        mesh.vertexCount = vertices.length / 3;
        mesh.isLineGeometry = true; // Marca especial

        return mesh;
    }

    // Crear ojos para la cápsula (2 pequeñas esferas)
    static createEyes(engine, eyeSize = 0.1, separation = 0.3, forwardOffset = 0.4) {
        const vertices = [];
        const colors = [];
        const indices = [];

        // Ojo izquierdo (esfera simple)
        const segments = 8;
        let vertexOffset = 0;

        // Ojo izquierdo
        for (let lat = 0; lat <= segments; lat++) {
            const theta = (lat * Math.PI) / segments;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let lon = 0; lon <= segments; lon++) {
                const phi = (lon * 2 * Math.PI) / segments;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = -separation / 2 + cosPhi * sinTheta * eyeSize;
                const y = 0.5 + cosTheta * eyeSize; // Altura de los ojos
                const z = forwardOffset + sinPhi * sinTheta * eyeSize;

                vertices.push(x, y, z);
                colors.push(0.1, 0.1, 0.1); // Color oscuro para los ojos
            }
        }

        // Índices para ojo izquierdo
        for (let lat = 0; lat < segments; lat++) {
            for (let lon = 0; lon < segments; lon++) {
                const first = lat * (segments + 1) + lon;
                const second = first + segments + 1;

                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }

        vertexOffset = vertices.length / 3;

        // Ojo derecho
        for (let lat = 0; lat <= segments; lat++) {
            const theta = (lat * Math.PI) / segments;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let lon = 0; lon <= segments; lon++) {
                const phi = (lon * 2 * Math.PI) / segments;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = separation / 2 + cosPhi * sinTheta * eyeSize;
                const y = 0.5 + cosTheta * eyeSize;
                const z = forwardOffset + sinPhi * sinTheta * eyeSize;

                vertices.push(x, y, z);
                colors.push(0.1, 0.1, 0.1);
            }
        }

        // Índices para ojo derecho
        for (let lat = 0; lat < segments; lat++) {
            for (let lon = 0; lon < segments; lon++) {
                const first = vertexOffset + lat * (segments + 1) + lon;
                const second = first + segments + 1;

                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }

        const mesh = new Mesh(engine);
        mesh.createBuffers(vertices, colors, indices);
        return mesh;
    }

    // Crear grid tipo tablero de ajedrez con coordenadas
    static createGrid(engine, width = 50, depth = 50, cellSize = 1) {
        const vertices = [];
        const colors = [];
        const indices = [];

        const numCellsX = Math.floor(width / cellSize);
        const numCellsZ = Math.floor(depth / cellSize);

        const offsetX = -width / 2;
        const offsetZ = -depth / 2;

        let indexOffset = 0;

        // Color para casillas alternas (blanco semi-transparente y gris semi-transparente)
        const color1 = [0.9, 0.9, 0.9, 0.3]; // Blanco transparente
        const color2 = [0.4, 0.4, 0.4, 0.3]; // Gris transparente

        for (let z = 0; z < numCellsZ; z++) {
            for (let x = 0; x < numCellsX; x++) {
                const x0 = offsetX + x * cellSize;
                const z0 = offsetZ + z * cellSize;
                const x1 = x0 + cellSize;
                const z1 = z0 + cellSize;
                const y = 0.01; // Ligeramente sobre el suelo para evitar z-fighting

                // Determinar color (patrón de ajedrez)
                const color = ((x + z) % 2 === 0) ? color1 : color2;

                // Vértices del cuadrado (quad)
                vertices.push(x0, y, z0);
                vertices.push(x1, y, z0);
                vertices.push(x1, y, z1);
                vertices.push(x0, y, z1);

                // Colores (con alpha para transparencia)
                for (let i = 0; i < 4; i++) {
                    colors.push(color[0], color[1], color[2]);
                }

                // Índices (2 triángulos por cuadrado)
                indices.push(indexOffset + 0, indexOffset + 1, indexOffset + 2);
                indices.push(indexOffset + 0, indexOffset + 2, indexOffset + 3);

                indexOffset += 4;
            }
        }

        const mesh = new Mesh(engine);
        mesh.createBuffers(vertices, colors, indices);
        mesh.isGrid = true; // Marcar como grid para renderizado especial

        // Crear líneas de texto para las coordenadas (solo cada 5 unidades)
        mesh.gridLines = this.createGridLines(engine, width, depth, cellSize);

        return mesh;
    }

    // Crear líneas para mostrar coordenadas en el grid
    static createGridLines(engine, width, depth, cellSize) {
        const vertices = [];
        const colors = [];

        const numCellsX = Math.floor(width / cellSize);
        const numCellsZ = Math.floor(depth / cellSize);
        const offsetX = -width / 2;
        const offsetZ = -depth / 2;
        const y = 0.02;

        const lineColor = [0, 0, 0]; // Negro para las líneas

        // Crear líneas de borde para cada celda (cada 5 unidades)
        for (let z = 0; z <= numCellsZ; z += 5) {
            const worldZ = offsetZ + z * cellSize;

            // Línea horizontal
            vertices.push(offsetX, y, worldZ);
            vertices.push(offsetX + width, y, worldZ);
            colors.push(...lineColor, ...lineColor);
        }

        for (let x = 0; x <= numCellsX; x += 5) {
            const worldX = offsetX + x * cellSize;

            // Línea vertical
            vertices.push(worldX, y, offsetZ);
            vertices.push(worldX, y, offsetZ + depth);
            colors.push(...lineColor, ...lineColor);
        }

        const mesh = new Mesh(engine);
        const gl = engine.gl;

        mesh.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        mesh.colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        mesh.vertexCount = vertices.length / 3;
        mesh.isLineGeometry = true;

        return mesh;
    }

    // Crear frustum de cámara (pirámide truncada)
    static createCameraFrustum(engine, fov = 75, aspect = 16/9, near = 0.1, far = 50, color = [1, 1, 0]) {
        const vertices = [];
        const colors = [];

        // Calcular dimensiones del frustum
        const tanHalfFov = Math.tan((fov * Math.PI / 180) / 2);

        // Near plane
        const nearHeight = 2 * tanHalfFov * near;
        const nearWidth = nearHeight * aspect;
        const nearHalfWidth = nearWidth / 2;
        const nearHalfHeight = nearHeight / 2;

        // Far plane
        const farHeight = 2 * tanHalfFov * far;
        const farWidth = farHeight * aspect;
        const farHalfWidth = farWidth / 2;
        const farHalfHeight = farHeight / 2;

        // 8 vértices del frustum (mirando hacia +Z, opuesto a la convención OpenGL)
        // Near plane (4 vértices)
        const nTL = [-nearHalfWidth, nearHalfHeight, near];   // Top Left
        const nTR = [nearHalfWidth, nearHalfHeight, near];    // Top Right
        const nBL = [-nearHalfWidth, -nearHalfHeight, near];  // Bottom Left
        const nBR = [nearHalfWidth, -nearHalfHeight, near];   // Bottom Right

        // Far plane (4 vértices)
        const fTL = [-farHalfWidth, farHalfHeight, far];
        const fTR = [farHalfWidth, farHalfHeight, far];
        const fBL = [-farHalfWidth, -farHalfHeight, far];
        const fBR = [farHalfWidth, -farHalfHeight, far];

        // Líneas del frustum (12 aristas)
        // Near plane (4 aristas)
        vertices.push(...nTL, ...nTR);
        vertices.push(...nTR, ...nBR);
        vertices.push(...nBR, ...nBL);
        vertices.push(...nBL, ...nTL);

        // Far plane (4 aristas)
        vertices.push(...fTL, ...fTR);
        vertices.push(...fTR, ...fBR);
        vertices.push(...fBR, ...fBL);
        vertices.push(...fBL, ...fTL);

        // Conectores near-far (4 aristas)
        vertices.push(...nTL, ...fTL);
        vertices.push(...nTR, ...fTR);
        vertices.push(...nBL, ...fBL);
        vertices.push(...nBR, ...fBR);

        // Colores (amarillo para todas las líneas)
        for (let i = 0; i < 24; i++) { // 12 líneas * 2 vértices = 24 vértices
            colors.push(color[0], color[1], color[2]);
        }

        // Crear mesh para líneas
        const mesh = new Mesh(engine);
        const gl = engine.gl;

        mesh.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        mesh.colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        mesh.vertexCount = vertices.length / 3;
        mesh.isLineGeometry = true;

        return mesh;
    }

    // Crear un pequeño cubo marcador
    static createMarker(engine, size = 0.1, color = [1, 1, 0]) {
        const s = size / 2;
        const vertices = [
            // Front
            -s, -s, s,  s, -s, s,  s, s, s,  -s, s, s,
            // Back
            -s, -s, -s,  -s, s, -s,  s, s, -s,  s, -s, -s,
            // Top
            -s, s, -s,  -s, s, s,  s, s, s,  s, s, -s,
            // Bottom
            -s, -s, -s,  s, -s, -s,  s, -s, s,  -s, -s, s,
            // Right
            s, -s, -s,  s, s, -s,  s, s, s,  s, -s, s,
            // Left
            -s, -s, -s,  -s, -s, s,  -s, s, s,  -s, s, -s
        ];

        const colors = [];
        for (let i = 0; i < 24; i++) {
            colors.push(color[0], color[1], color[2]);
        }

        const indices = [
            0, 1, 2,  0, 2, 3,    // Front
            4, 5, 6,  4, 6, 7,    // Back
            8, 9, 10,  8, 10, 11, // Top
            12, 13, 14,  12, 14, 15, // Bottom
            16, 17, 18,  16, 18, 19, // Right
            20, 21, 22,  20, 22, 23  // Left
        ];

        const mesh = new Mesh(engine);
        mesh.createBuffers(vertices, colors, indices);
        return mesh;
    }
}

// Extender Mesh para renderizar líneas
Mesh.prototype.renderLines = function(engine) {
    const gl = engine.gl;

    const aPosition = engine.shaderManager.getAttributeLocation('aPosition');
    const aColor = engine.shaderManager.getAttributeLocation('aColor');

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColor);

    gl.drawArrays(gl.LINES, 0, this.vertexCount);
};
