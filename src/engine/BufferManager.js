// BufferManager - Gestiona buffers de WebGL (VBO, IBO)
class BufferManager {
    constructor(gl) {
        this.gl = gl;
        this.buffers = new Map(); // Map<name, buffer>
    }

    // Crear buffer de vértices
    createVertexBuffer(name, data, usage = null) {
        const gl = this.gl;
        const buffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), usage || gl.STATIC_DRAW);

        this.buffers.set(name, {
            buffer,
            type: gl.ARRAY_BUFFER,
            length: data.length
        });

        return buffer;
    }

    // Crear buffer de índices
    createIndexBuffer(name, data, usage = null) {
        const gl = this.gl;
        const buffer = gl.createBuffer();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), usage || gl.STATIC_DRAW);

        this.buffers.set(name, {
            buffer,
            type: gl.ELEMENT_ARRAY_BUFFER,
            length: data.length
        });

        return buffer;
    }

    // Vincular buffer a un atributo
    bindAttribute(buffer, attributeLocation, size, type = null, normalized = false, stride = 0, offset = 0) {
        const gl = this.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(
            attributeLocation,
            size,
            type || gl.FLOAT,
            normalized,
            stride,
            offset
        );
        gl.enableVertexAttribArray(attributeLocation);
    }

    // Obtener buffer por nombre
    getBuffer(name) {
        return this.buffers.get(name);
    }

    // Eliminar buffer
    deleteBuffer(name) {
        const bufferData = this.buffers.get(name);
        if (bufferData) {
            this.gl.deleteBuffer(bufferData.buffer);
            this.buffers.delete(name);
        }
    }

    // Limpiar todos los buffers
    clear() {
        for (const [name, bufferData] of this.buffers) {
            this.gl.deleteBuffer(bufferData.buffer);
        }
        this.buffers.clear();
    }
}
