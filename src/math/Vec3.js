// Vector 3D
class Vec3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    // Suma de vectores
    add(v) {
        return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    // Resta de vectores
    sub(v) {
        return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    // Multiplicación por escalar
    multiplyScalar(s) {
        return new Vec3(this.x * s, this.y * s, this.z * s);
    }

    // Producto punto
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    // Producto cruz
    cross(v) {
        return new Vec3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    // Longitud del vector
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    // Normalizar vector
    normalize() {
        const len = this.length();
        if (len === 0) return new Vec3(0, 0, 0);
        return new Vec3(this.x / len, this.y / len, this.z / len);
    }

    // Clonar vector
    clone() {
        return new Vec3(this.x, this.y, this.z);
    }
}
