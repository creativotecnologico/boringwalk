// WorldCamera - Cámara libre del mundo con rotación de ratón
class WorldCamera {
    constructor() {
        // Posición de la cámara libre
        this.position = new Vec3(0, 10, 10);

        // Ángulos de rotación (en radianes)
        this.yaw = 0; // Rotación horizontal
        this.pitch = -Math.PI / 6; // Rotación vertical (mirando un poco hacia abajo)

        // Sensibilidad del ratón
        this.mouseSensitivity = 0.002;

        // Velocidad de movimiento
        this.moveSpeed = 5.0;

        // Estado del ratón
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        // Estado de teclas
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            up: false,
            down: false
        };
    }

    // Inicializar listeners de eventos
    setupEventListeners(canvas) {
        // Mouse events
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));

        // Keyboard events
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    onMouseDown(event) {
        this.isDragging = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    }

    onMouseUp(event) {
        this.isDragging = false;
    }

    onMouseMove(event) {
        if (!this.isDragging) return;

        const deltaX = event.clientX - this.lastMouseX;
        const deltaY = event.clientY - this.lastMouseY;

        this.yaw += deltaX * this.mouseSensitivity;
        this.pitch += deltaY * this.mouseSensitivity;

        // Limitar pitch para evitar gimbal lock
        const maxPitch = Math.PI / 2 - 0.01;
        this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));

        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    }

    onKeyDown(event) {
        switch(event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.keys.forward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.keys.backward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = true;
                break;
            case 'Space':
                this.keys.up = true;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.keys.down = true;
                break;
        }
    }

    onKeyUp(event) {
        switch(event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.keys.forward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.keys.backward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = false;
                break;
            case 'Space':
                this.keys.up = false;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.keys.down = false;
                break;
        }
    }

    // Actualizar posición de la cámara
    update(deltaTime) {
        const distance = this.moveSpeed * deltaTime;

        // Calcular vectores de dirección
        const forward = {
            x: Math.sin(this.yaw) * Math.cos(this.pitch),
            y: -Math.sin(this.pitch),
            z: -Math.cos(this.yaw) * Math.cos(this.pitch)
        };

        const right = {
            x: Math.cos(this.yaw),
            y: 0,
            z: Math.sin(this.yaw)
        };

        // Movimiento
        if (this.keys.forward) {
            this.position.x += forward.x * distance;
            this.position.y += forward.y * distance;
            this.position.z += forward.z * distance;
        }
        if (this.keys.backward) {
            this.position.x -= forward.x * distance;
            this.position.y -= forward.y * distance;
            this.position.z -= forward.z * distance;
        }
        if (this.keys.right) {
            this.position.x += right.x * distance;
            this.position.z += right.z * distance;
        }
        if (this.keys.left) {
            this.position.x -= right.x * distance;
            this.position.z -= right.z * distance;
        }
        if (this.keys.up) {
            this.position.y += distance;
        }
        if (this.keys.down) {
            this.position.y -= distance;
        }
    }

    // Obtener posición de la cámara
    getPosition() {
        return this.position;
    }

    // Obtener el target (punto hacia donde mira)
    getTarget() {
        // Calcular el punto hacia donde mira la cámara
        const distance = 10; // Distancia arbitraria para el target

        const targetX = this.position.x + Math.sin(this.yaw) * Math.cos(this.pitch) * distance;
        const targetY = this.position.y - Math.sin(this.pitch) * distance;
        const targetZ = this.position.z - Math.cos(this.yaw) * Math.cos(this.pitch) * distance;

        return new Vec3(targetX, targetY, targetZ);
    }
}
