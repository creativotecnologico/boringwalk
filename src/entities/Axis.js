// Axis - Ejes de coordenadas para debug (X=rojo, Y=verde, Z=azul)
class Axis {
    constructor(gl, size = 1.0) {
        this.gl = gl;
        this.size = size;
        this.geometry = null;

        this.createGeometry();
    }

    createGeometry() {
        const arrowSize = this.size * 0.15; // Tamaño de la punta de flecha
        const arrowWidth = this.size * 0.05; // Ancho de la punta

        const vertices = [];
        const colors = [];

        // === EJE X (ROJO) - Solo positivo ===
        // Línea principal
        vertices.push(0, 0, 0, this.size, 0, 0);
        colors.push(1, 0, 0, 1, 0, 0);

        // Flecha (2 líneas formando una punta)
        const xArrowBase = this.size - arrowSize;
        vertices.push(this.size, 0, 0, xArrowBase, arrowWidth, 0); // Línea 1
        vertices.push(this.size, 0, 0, xArrowBase, -arrowWidth, 0); // Línea 2
        colors.push(1, 0, 0, 1, 0, 0);
        colors.push(1, 0, 0, 1, 0, 0);

        // === EJE Y (VERDE) - Solo positivo (arriba) ===
        // Línea principal
        vertices.push(0, 0, 0, 0, this.size, 0);
        colors.push(0, 1, 0, 0, 1, 0);

        // Flecha (apuntando hacia arriba en Y)
        const yArrowBase = this.size - arrowSize;
        vertices.push(0, this.size, 0, arrowWidth, yArrowBase, arrowWidth); // Línea 1
        vertices.push(0, this.size, 0, -arrowWidth, yArrowBase, -arrowWidth); // Línea 2
        colors.push(0, 1, 0, 0, 1, 0);
        colors.push(0, 1, 0, 0, 1, 0);

        // === EJE Z (AZUL) - Solo positivo (adelante) ===
        // Línea principal
        vertices.push(0, 0, 0, 0, 0, this.size);
        colors.push(0, 0, 1, 0, 0, 1);

        // Flecha (apuntando hacia adelante en Z)
        const zArrowBase = this.size - arrowSize;
        vertices.push(0, 0, this.size, 0, arrowWidth, zArrowBase); // Línea 1
        vertices.push(0, 0, this.size, 0, -arrowWidth, zArrowBase); // Línea 2
        colors.push(0, 0, 1, 0, 0, 1);
        colors.push(0, 0, 1, 0, 0, 1);

        // Crear buffers
        this.geometry = new Geometry(this.gl);

        const verticesArray = new Float32Array(vertices);
        const colorsArray = new Float32Array(colors);

        this.geometry.vertexCount = vertices.length / 3; // Total de vértices

        // Vertex buffer
        this.geometry.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.geometry.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, verticesArray, this.gl.STATIC_DRAW);

        // Color buffer
        this.geometry.colorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.geometry.colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, colorsArray, this.gl.STATIC_DRAW);
    }

    render(shader, position) {
        // Matriz de transformación en la posición dada
        const modelMatrix = Mat4.translation(position.x, position.y, position.z);
        shader.setUniformMatrix4fv('uModel', modelMatrix.elements);

        if (this.geometry) {
            // Renderizar como líneas
            const gl = this.gl;

            // Obtener ubicaciones de atributos
            const aPosition = shader.getAttributeLocation('aPosition');
            const aColor = shader.getAttributeLocation('aColor');

            // Bind vertex buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, this.geometry.vertexBuffer);
            gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aPosition);

            // Bind color buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, this.geometry.colorBuffer);
            gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aColor);

            // Dibujar líneas
            gl.drawArrays(gl.LINES, 0, this.geometry.vertexCount);
        }
    }
}
