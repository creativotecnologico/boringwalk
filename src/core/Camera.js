// Cámara de primera persona
class Camera {
    constructor(fov = 75, aspect = 1, near = 0.1, far = 1000) {
        this.position = new Vec3(0, 1.6, 5); // Altura de ojos humanos (~1.6m)
        this.front = new Vec3(0, 0, -1);
        this.up = new Vec3(0, 1, 0);
        this.right = new Vec3(1, 0, 0);
        this.worldUp = new Vec3(0, 1, 0);

        // Ángulos de Euler
        this.yaw = -90; // Mirar hacia -Z
        this.pitch = 0;

        // Parámetros de proyección
        this.fov = fov * Math.PI / 180; // Convertir a radianes
        this.aspect = aspect;
        this.near = near;
        this.far = far;

        this.updateVectors();
    }

    // Actualizar vectores de la cámara basados en los ángulos de Euler
    updateVectors() {
        const yawRad = this.yaw * Math.PI / 180;
        const pitchRad = this.pitch * Math.PI / 180;

        // Calcular el vector front
        this.front = new Vec3(
            Math.cos(yawRad) * Math.cos(pitchRad),
            Math.sin(pitchRad),
            Math.sin(yawRad) * Math.cos(pitchRad)
        ).normalize();

        // Recalcular right y up
        this.right = this.front.cross(this.worldUp).normalize();
        this.up = this.right.cross(this.front).normalize();
    }

    // Obtener matriz de vista
    getViewMatrix() {
        const center = this.position.add(this.front);
        return Mat4.lookAt(this.position, center, this.up);
    }

    // Obtener matriz de proyección
    getProjectionMatrix() {
        return Mat4.perspective(this.fov, this.aspect, this.near, this.far);
    }

    // Mover la cámara
    move(direction, distance) {
        // Usar solo el yaw para el movimiento (ignorar pitch)
        const yawRad = this.yaw * Math.PI / 180;
        const forward = new Vec3(Math.cos(yawRad), 0, Math.sin(yawRad)).normalize();
        const right = new Vec3(-Math.sin(yawRad), 0, Math.cos(yawRad)).normalize();

        switch(direction) {
            case 'forward':
                this.position = this.position.add(forward.multiplyScalar(distance));
                break;
            case 'backward':
                this.position = this.position.sub(forward.multiplyScalar(distance));
                break;
            case 'left':
                this.position = this.position.sub(right.multiplyScalar(distance));
                break;
            case 'right':
                this.position = this.position.add(right.multiplyScalar(distance));
                break;
        }
    }

    // Rotar la cámara
    rotate(yawOffset, pitchOffset) {
        this.yaw += yawOffset;
        this.pitch += pitchOffset;

        // Sin límites - permite rotación completa en 360°

        this.updateVectors();
    }

    // Actualizar aspect ratio
    setAspect(aspect) {
        this.aspect = aspect;
    }
}
