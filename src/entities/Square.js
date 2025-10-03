// Square - Representa un cuadrado (4 vértices, 2 triángulos)
class Square {
    constructor(v0, v1, v2, v3, color = [0.5, 0.5, 0.5]) {
        // 4 vértices del cuadrado (Vec3)
        this.vertices = [v0, v1, v2, v3];

        // Color RGB del cuadrado
        this.color = color;

        // Índices para formar 2 triángulos
        // v0 -- v1
        // |  \  |
        // v3 -- v2
        this.indices = [0, 1, 2, 0, 2, 3];
    }

    // Obtener array plano de vértices
    getVerticesArray() {
        const arr = [];
        this.vertices.forEach(v => {
            arr.push(v.x, v.y, v.z);
        });
        return arr;
    }

    // Obtener array de colores (repetido para cada vértice)
    getColorsArray() {
        const arr = [];
        for (let i = 0; i < 4; i++) {
            arr.push(this.color[0], this.color[1], this.color[2]);
        }
        return arr;
    }
}
