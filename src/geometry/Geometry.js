// Sistema de geometría
class Geometry {
    constructor(gl) {
        this.gl = gl;
        this.vertexBuffer = null;
        this.colorBuffer = null;
        this.indexBuffer = null;
        this.wireframeIndexBuffer = null;
        this.vertexCount = 0;
        this.wireframeVertexCount = 0;
    }

    // Crear un plano (suelo)
    static createPlane(gl, size = 10) {
        const geometry = new Geometry(gl);

        // Vértices del plano (Y = 0)
        const vertices = new Float32Array([
            -size, 0, -size,  // 0
             size, 0, -size,  // 1
             size, 0,  size,  // 2
            -size, 0,  size   // 3
        ]);

        // Colores (gris claro para el suelo)
        const colors = new Float32Array([
            0.7, 0.7, 0.7,
            0.7, 0.7, 0.7,
            0.7, 0.7, 0.7,
            0.7, 0.7, 0.7
        ]);

        // Índices para formar 2 triángulos
        const indices = new Uint16Array([
            0, 1, 2,
            0, 2, 3
        ]);

        geometry.vertexCount = indices.length;

        // Crear buffers
        geometry.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, geometry.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        geometry.colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, geometry.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

        geometry.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        return geometry;
    }

    // Crear un cubo
    static createCube(gl, size = 1) {
        const geometry = new Geometry(gl);
        const s = size / 2;

        // Vértices del cubo
        const vertices = new Float32Array([
            // Frente
            -s, -s,  s,   s, -s,  s,   s,  s,  s,  -s,  s,  s,
            // Atrás
            -s, -s, -s,  -s,  s, -s,   s,  s, -s,   s, -s, -s,
            // Arriba
            -s,  s, -s,  -s,  s,  s,   s,  s,  s,   s,  s, -s,
            // Abajo
            -s, -s, -s,   s, -s, -s,   s, -s,  s,  -s, -s,  s,
            // Derecha
             s, -s, -s,   s,  s, -s,   s,  s,  s,   s, -s,  s,
            // Izquierda
            -s, -s, -s,  -s, -s,  s,  -s,  s,  s,  -s,  s, -s
        ]);

        // Colores variados para cada cara
        const colors = new Float32Array([
            // Frente - rojo
            1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
            // Atrás - verde
            0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
            // Arriba - azul
            0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
            // Abajo - amarillo
            1, 1, 0,  1, 1, 0,  1, 1, 0,  1, 1, 0,
            // Derecha - magenta
            1, 0, 1,  1, 0, 1,  1, 0, 1,  1, 0, 1,
            // Izquierda - cyan
            0, 1, 1,  0, 1, 1,  0, 1, 1,  0, 1, 1
        ]);

        // Índices
        const indices = new Uint16Array([
            0,  1,  2,   0,  2,  3,   // Frente
            4,  5,  6,   4,  6,  7,   // Atrás
            8,  9, 10,   8, 10, 11,   // Arriba
            12, 13, 14,  12, 14, 15,  // Abajo
            16, 17, 18,  16, 18, 19,  // Derecha
            20, 21, 22,  20, 22, 23   // Izquierda
        ]);

        geometry.vertexCount = indices.length;

        // Crear buffers
        geometry.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, geometry.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        geometry.colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, geometry.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

        geometry.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        return geometry;
    }

    // Renderizar geometría
    render(shader, wireframe = false) {
        const gl = this.gl;

        // Vincular vertex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        const positionLocation = shader.getAttributeLocation('aPosition');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        // Vincular color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        const colorLocation = shader.getAttributeLocation('aColor');
        gl.enableVertexAttribArray(colorLocation);
        gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

        if (wireframe && this.wireframeIndexBuffer) {
            // Dibujar en modo wireframe usando el buffer de líneas
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.wireframeIndexBuffer);
            gl.drawElements(gl.LINES, this.wireframeVertexCount, gl.UNSIGNED_SHORT, 0);
        } else {
            // Dibujar normalmente con triángulos
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_SHORT, 0);
        }
    }

    // Crear índices de wireframe a partir de triángulos
    createWireframeIndices(triangleIndices) {
        const wireframeIndices = [];

        // Cada triángulo tiene 3 vértices, crear 3 líneas
        for (let i = 0; i < triangleIndices.length; i += 3) {
            const v0 = triangleIndices[i];
            const v1 = triangleIndices[i + 1];
            const v2 = triangleIndices[i + 2];

            // Línea 1: v0 -> v1
            wireframeIndices.push(v0, v1);
            // Línea 2: v1 -> v2
            wireframeIndices.push(v1, v2);
            // Línea 3: v2 -> v0
            wireframeIndices.push(v2, v0);
        }

        return wireframeIndices;
    }
}
