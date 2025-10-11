// WorldCameraController - Componente de cámara libre del mundo
class WorldCameraController extends Component {
    constructor() {
        super();
        this.yaw = 0;
        this.pitch = -Math.PI / 6;
        this.mouseSensitivity = 0.002;
        this.moveSpeed = 10.0;
        this.fastMoveSpeed = 50.0; // Velocidad con Control
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
    }

    onAttach() {
        // Listeners de ratón ahora están en main.js usando Pointer Lock
        // this.setupListeners();
    }

    setupListeners() {
        // Ya no se usa - el control del ratón está en main.js con Pointer Lock
        /*
        const canvas = document.getElementById('canvas');

        canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });

        canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;

            const deltaX = e.clientX - this.lastMouseX;
            const deltaY = e.clientY - this.lastMouseY;

            this.yaw += deltaX * this.mouseSensitivity;
            this.pitch += deltaY * this.mouseSensitivity;

            const maxPitch = Math.PI / 2 - 0.01;
            this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));

            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });
        */
    }

    update(deltaTime, inputSystem) {
        if (!inputSystem) return;

        const transform = this.entity.getComponent(Transform);
        if (!transform) return;

        // Usar velocidad rápida si Control está presionado
        const isFastMode = inputSystem.isKeyPressed('ControlLeft') || inputSystem.isKeyPressed('ControlRight');
        const speed = isFastMode ? this.fastMoveSpeed : this.moveSpeed;
        const distance = speed * deltaTime;

        // Vectores de dirección
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
        if (inputSystem.isKeyPressed('KeyW') || inputSystem.isKeyPressed('ArrowUp')) {
            transform.position.x += forward.x * distance;
            transform.position.y += forward.y * distance;
            transform.position.z += forward.z * distance;
        }
        if (inputSystem.isKeyPressed('KeyS') || inputSystem.isKeyPressed('ArrowDown')) {
            transform.position.x -= forward.x * distance;
            transform.position.y -= forward.y * distance;
            transform.position.z -= forward.z * distance;
        }
        if (inputSystem.isKeyPressed('KeyD') || inputSystem.isKeyPressed('ArrowRight')) {
            transform.position.x += right.x * distance;
            transform.position.z += right.z * distance;
        }
        if (inputSystem.isKeyPressed('KeyA') || inputSystem.isKeyPressed('ArrowLeft')) {
            transform.position.x -= right.x * distance;
            transform.position.z -= right.z * distance;
        }
        if (inputSystem.isKeyPressed('Space')) {
            transform.position.y += distance;
        }
        if (inputSystem.isKeyPressed('ShiftLeft') || inputSystem.isKeyPressed('ShiftRight')) {
            transform.position.y -= distance;
        }
    }

    getTarget() {
        const transform = this.entity.getComponent(Transform);
        if (!transform) return new Vec3(0, 0, -10);

        const distance = 10;
        const targetX = transform.position.x + Math.sin(this.yaw) * Math.cos(this.pitch) * distance;
        const targetY = transform.position.y - Math.sin(this.pitch) * distance;
        const targetZ = transform.position.z - Math.cos(this.yaw) * Math.cos(this.pitch) * distance;

        return new Vec3(targetX, targetY, targetZ);
    }
}
