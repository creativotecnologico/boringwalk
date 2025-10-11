// Mesh - Clase base de geometría adaptada al WebGLEngine
class Mesh {
    constructor(engine) {
        this.engine = engine;
        this.vertexBuffer = null;
        this.colorBuffer = null;
        this.uvBuffer = null;
        this.indexBuffer = null;
        this.wireframeIndexBuffer = null;
        this.vertexCount = 0;
        this.wireframeVertexCount = 0;
    }

    // Crear buffers de geometría
    createBuffers(vertices, colors, indices, uvs = null) {
        const gl = this.engine.gl;

        // Vertex buffer
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // Color buffer
        this.colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

        // UV buffer (opcional)
        if (uvs) {
            this.uvBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
        }

        // Index buffer (usar Uint32 si hay muchos vértices)
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        // Determinar si necesitamos Uint32 o Uint16 (sin spread operator para arrays grandes)
        let maxIndex = 0;
        for (let i = 0; i < indices.length; i++) {
            if (indices[i] > maxIndex) maxIndex = indices[i];
        }

        if (maxIndex > 65535) {
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);
            this.indexType = gl.UNSIGNED_INT;
        } else {
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
            this.indexType = gl.UNSIGNED_SHORT;
        }

        this.vertexCount = indices.length;

        // Crear wireframe indices
        this.createWireframeIndices(indices);
    }

    createWireframeIndices(indices) {
        const gl = this.engine.gl;
        const wireframeIndices = [];

        for (let i = 0; i < indices.length; i += 3) {
            const v0 = indices[i];
            const v1 = indices[i + 1];
            const v2 = indices[i + 2];

            wireframeIndices.push(v0, v1);
            wireframeIndices.push(v1, v2);
            wireframeIndices.push(v2, v0);
        }

        this.wireframeIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.wireframeIndexBuffer);

        // Usar mismo tipo que el index buffer principal (sin spread operator)
        let maxWireframeIndex = 0;
        for (let i = 0; i < wireframeIndices.length; i++) {
            if (wireframeIndices[i] > maxWireframeIndex) maxWireframeIndex = wireframeIndices[i];
        }

        if (maxWireframeIndex > 65535) {
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(wireframeIndices), gl.STATIC_DRAW);
            this.wireframeIndexType = gl.UNSIGNED_INT;
        } else {
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(wireframeIndices), gl.STATIC_DRAW);
            this.wireframeIndexType = gl.UNSIGNED_SHORT;
        }

        this.wireframeVertexCount = wireframeIndices.length;
    }

    // Renderizar
    render(engine, wireframe = false) {
        const gl = engine.gl;

        // Obtener ubicaciones de atributos
        const aPosition = engine.shaderManager.getAttributeLocation('aPosition');
        const aColor = engine.shaderManager.getAttributeLocation('aColor');
        const aTexCoord = engine.shaderManager.getAttributeLocation('aTexCoord');

        // Desactivar aTexCoord si existe (evitar interferencia de shaders de textura)
        if (aTexCoord !== -1) {
            gl.disableVertexAttribArray(aTexCoord);
        }

        // Bind vertex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPosition);

        // Bind color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aColor);

        // Dibujar
        if (wireframe && this.wireframeIndexBuffer) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.wireframeIndexBuffer);
            gl.drawElements(gl.LINES, this.wireframeVertexCount, this.wireframeIndexType || gl.UNSIGNED_SHORT, 0);
        } else {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.drawElements(gl.TRIANGLES, this.vertexCount, this.indexType || gl.UNSIGNED_SHORT, 0);
        }
    }

    // Renderizar con textura
    renderTextured(engine, wireframe = false) {
        const gl = engine.gl;

        // Obtener ubicaciones de atributos
        const aPosition = engine.shaderManager.getAttributeLocation('aPosition');
        const aTexCoord = engine.shaderManager.getAttributeLocation('aTexCoord');

        // Bind vertex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPosition);

        // Bind UV buffer
        if (this.uvBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
            gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(aTexCoord);
        }

        // Dibujar
        if (wireframe && this.wireframeIndexBuffer) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.wireframeIndexBuffer);
            gl.drawElements(gl.LINES, this.wireframeVertexCount, this.wireframeIndexType || gl.UNSIGNED_SHORT, 0);
        } else {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.drawElements(gl.TRIANGLES, this.vertexCount, this.indexType || gl.UNSIGNED_SHORT, 0);
        }
    }

    // Destruir buffers
    destroy() {
        const gl = this.engine.gl;
        if (this.vertexBuffer) gl.deleteBuffer(this.vertexBuffer);
        if (this.colorBuffer) gl.deleteBuffer(this.colorBuffer);
        if (this.uvBuffer) gl.deleteBuffer(this.uvBuffer);
        if (this.indexBuffer) gl.deleteBuffer(this.indexBuffer);
        if (this.wireframeIndexBuffer) gl.deleteBuffer(this.wireframeIndexBuffer);
    }
}
