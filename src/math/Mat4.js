// Matriz 4x4 simplificada y correcta para WebGL
class Mat4 {
    constructor() {
        // Matriz identidad en column-major (WebGL)
        this.elements = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    static identity() {
        return new Mat4();
    }

    // Matriz de perspectiva (OpenGL: +Y arriba)
    static perspective(fovRadians, aspect, near, far) {
        const mat = new Mat4();
        const f = 1.0 / Math.tan(fovRadians / 2);
        const rangeInv = 1.0 / (near - far);

        mat.elements[0] = f / aspect;
        mat.elements[1] = 0;
        mat.elements[2] = 0;
        mat.elements[3] = 0;

        mat.elements[4] = 0;
        mat.elements[5] = f;  // Invertido: +Y hacia arriba
        mat.elements[6] = 0;
        mat.elements[7] = 0;

        mat.elements[8] = 0;
        mat.elements[9] = 0;
        mat.elements[10] = (near + far) * rangeInv;
        mat.elements[11] = -1;

        mat.elements[12] = 0;
        mat.elements[13] = 0;
        mat.elements[14] = near * far * rangeInv * 2;
        mat.elements[15] = 0;

        return mat;
    }

    // Matriz lookAt simple
    static lookAt(cameraPos, targetPos, upVec) {
        const mat = new Mat4();

        // Calcular vectores de la cámara
        const zAxis = {
            x: cameraPos.x - targetPos.x,
            y: cameraPos.y - targetPos.y,
            z: cameraPos.z - targetPos.z
        };
        const zLen = Math.sqrt(zAxis.x * zAxis.x + zAxis.y * zAxis.y + zAxis.z * zAxis.z);
        zAxis.x /= zLen;
        zAxis.y /= zLen;
        zAxis.z /= zLen;

        // X = up × z
        const xAxis = {
            x: upVec.y * zAxis.z - upVec.z * zAxis.y,
            y: upVec.z * zAxis.x - upVec.x * zAxis.z,
            z: upVec.x * zAxis.y - upVec.y * zAxis.x
        };
        const xLen = Math.sqrt(xAxis.x * xAxis.x + xAxis.y * xAxis.y + xAxis.z * xAxis.z);
        xAxis.x /= xLen;
        xAxis.y /= xLen;
        xAxis.z /= xLen;

        // Y = z × x
        const yAxis = {
            x: zAxis.y * xAxis.z - zAxis.z * xAxis.y,
            y: zAxis.z * xAxis.x - zAxis.x * xAxis.z,
            z: zAxis.x * xAxis.y - zAxis.y * xAxis.x
        };

        // Column-major: cada columna es un vector base
        mat.elements[0] = xAxis.x;
        mat.elements[1] = yAxis.x;
        mat.elements[2] = zAxis.x;
        mat.elements[3] = 0;

        mat.elements[4] = xAxis.y;
        mat.elements[5] = yAxis.y;
        mat.elements[6] = zAxis.y;
        mat.elements[7] = 0;

        mat.elements[8] = xAxis.z;
        mat.elements[9] = yAxis.z;
        mat.elements[10] = zAxis.z;
        mat.elements[11] = 0;

        mat.elements[12] = -(xAxis.x * cameraPos.x + xAxis.y * cameraPos.y + xAxis.z * cameraPos.z);
        mat.elements[13] = -(yAxis.x * cameraPos.x + yAxis.y * cameraPos.y + yAxis.z * cameraPos.z);
        mat.elements[14] = -(zAxis.x * cameraPos.x + zAxis.y * cameraPos.y + zAxis.z * cameraPos.z);
        mat.elements[15] = 1;

        return mat;
    }

    // Matriz de traslación
    static translation(x, y, z) {
        const mat = new Mat4();
        mat.elements[12] = x;
        mat.elements[13] = y;
        mat.elements[14] = z;
        return mat;
    }

    // Matriz de rotación en X (pitch)
    static rotationX(angleRadians) {
        const mat = new Mat4();
        const c = Math.cos(angleRadians);
        const s = Math.sin(angleRadians);

        mat.elements[5] = c;
        mat.elements[6] = -s;
        mat.elements[9] = s;
        mat.elements[10] = c;

        return mat;
    }

    // Matriz de rotación en Y (yaw)
    static rotationY(angleRadians) {
        const mat = new Mat4();
        const c = Math.cos(angleRadians);
        const s = Math.sin(angleRadians);

        mat.elements[0] = c;
        mat.elements[2] = s;
        mat.elements[8] = -s;
        mat.elements[10] = c;

        return mat;
    }

    // Matriz de rotación en Z (roll)
    static rotationZ(angleRadians) {
        const mat = new Mat4();
        const c = Math.cos(angleRadians);
        const s = Math.sin(angleRadians);

        mat.elements[0] = c;
        mat.elements[1] = -s;
        mat.elements[4] = s;
        mat.elements[5] = c;

        return mat;
    }

    // Matriz de proyección ortográfica
    static ortho(left, right, bottom, top, near, far) {
        const mat = new Mat4();
        const e = mat.elements;

        const w = right - left;
        const h = top - bottom;
        const d = far - near;

        e[0] = 2 / w;
        e[5] = 2 / h;
        e[10] = -2 / d;
        e[12] = -(right + left) / w;
        e[13] = -(top + bottom) / h;
        e[14] = -(far + near) / d;
        e[15] = 1;

        return mat;
    }

    // Multiplicar matrices (column-major order)
    multiply(other) {
        const a = this.elements;
        const b = other.elements;
        const result = new Mat4();
        const r = result.elements;

        // Column-major: resultado[columna][fila]
        for (let col = 0; col < 4; col++) {
            for (let row = 0; row < 4; row++) {
                r[col * 4 + row] =
                    a[0 * 4 + row] * b[col * 4 + 0] +
                    a[1 * 4 + row] * b[col * 4 + 1] +
                    a[2 * 4 + row] * b[col * 4 + 2] +
                    a[3 * 4 + row] * b[col * 4 + 3];
            }
        }

        return result;
    }
}
