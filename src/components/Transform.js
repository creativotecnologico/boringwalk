// Transform - Componente de transformación (posición, rotación, escala)
class Transform extends Component {
    constructor(position = null, rotation = null, scale = null) {
        super();
        this.position = position || new Vec3(0, 0, 0);
        this.rotation = rotation || new Vec3(0, 0, 0); // Euler angles en radianes
        this.scale = scale || new Vec3(1, 1, 1);
        this.pivot = new Vec3(0, 0, 0); // Punto de pivote local
    }

    // Obtener matriz de modelo
    getModelMatrix() {
        // Crear matrices de rotación (orden: Y * X * Z)
        let rotationMatrix = Mat4.identity();

        if (this.rotation.y !== 0) {
            rotationMatrix = rotationMatrix.multiply(Mat4.rotationY(this.rotation.y));
        }
        if (this.rotation.x !== 0) {
            rotationMatrix = rotationMatrix.multiply(Mat4.rotationX(this.rotation.x));
        }
        if (this.rotation.z !== 0) {
            rotationMatrix = rotationMatrix.multiply(Mat4.rotationZ(this.rotation.z));
        }

        // Crear matriz de traslación
        const translationMatrix = Mat4.translation(
            this.position.x + this.pivot.x,
            this.position.y + this.pivot.y,
            this.position.z + this.pivot.z
        );

        // Multiplicar: Traslación * Rotación (para rotar en el lugar y luego mover)
        return translationMatrix.multiply(rotationMatrix);
    }

    // Trasladar
    translate(x, y, z) {
        this.position.x += x;
        this.position.y += y;
        this.position.z += z;
    }

    // Establecer posición
    setPosition(x, y, z) {
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
    }
}
