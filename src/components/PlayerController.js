// PlayerController - Componente de control del jugador
class PlayerController extends Component {
    constructor() {
        super();
        this.moveSpeed = 3.0;
        this.height = 1.8;
        this.viewMode = 'first'; // 'first' o 'third'
        this.yaw = 0; // Rotación horizontal (izquierda/derecha)
        this.pitch = 0; // Rotación vertical (arriba/abajo)
        this.mouseSensitivity = 0.002;
    }

    move(direction, distance) {
        const transform = this.entity.getComponent(Transform);
        if (!transform) return;

        // Calcular vectores de movimiento basados en la rotación yaw (horizontal)
        const forward = {
            x: Math.sin(this.yaw),
            z: Math.cos(this.yaw)
        };
        const right = {
            x: Math.cos(this.yaw),
            z: -Math.sin(this.yaw)
        };

        switch(direction) {
            case 'forward':
                transform.position.x += forward.x * distance;
                transform.position.z += forward.z * distance;
                break;
            case 'backward':
                transform.position.x -= forward.x * distance;
                transform.position.z -= forward.z * distance;
                break;
            case 'left':
                transform.position.x += right.x * distance;
                transform.position.z += right.z * distance;
                break;
            case 'right':
                transform.position.x -= right.x * distance;
                transform.position.z -= right.z * distance;
                break;
        }

        this.saveState();
    }

    toggleView() {
        this.viewMode = this.viewMode === 'first' ? 'third' : 'first';
        console.log(`Vista: ${this.viewMode === 'first' ? 'Primera Persona' : 'Tercera Persona'}`);
        this.saveState();
    }

    // Guardar/Cargar estado desde localStorage
    saveState() {
        const transform = this.entity.getComponent(Transform);
        if (!transform) return;

        localStorage.setItem('boringwalk_viewMode', this.viewMode);
        localStorage.setItem('boringwalk_playerPosition', JSON.stringify({
            x: transform.position.x,
            y: transform.position.y,
            z: transform.position.z
        }));
    }

    loadState() {
        const savedViewMode = localStorage.getItem('boringwalk_viewMode');
        const savedPosition = localStorage.getItem('boringwalk_playerPosition');

        if (savedViewMode) {
            this.viewMode = savedViewMode;
        }

        if (savedPosition) {
            const pos = JSON.parse(savedPosition);
            const transform = this.entity.getComponent(Transform);
            if (transform) {
                transform.position.x = pos.x;
                transform.position.y = pos.y;
                transform.position.z = pos.z;
            }
        }
    }

    getCameraPosition() {
        const transform = this.entity.getComponent(Transform);
        if (!transform) return new Vec3(0, 0, 0);

        if (this.viewMode === 'first') {
            const eyeHeight = this.height * 0.9; // Altura de los ojos (90% de la altura total)
            return new Vec3(
                transform.position.x,
                transform.position.y + eyeHeight,
                transform.position.z
            );
        } else {
            // Tercera persona: cámara detrás del jugador según yaw y pitch
            const distance = 5;
            const camX = transform.position.x - Math.sin(this.yaw) * Math.cos(this.pitch) * distance;
            const camY = transform.position.y + this.height - Math.sin(this.pitch) * distance;
            const camZ = transform.position.z - Math.cos(this.yaw) * Math.cos(this.pitch) * distance;

            return new Vec3(camX, camY, camZ);
        }
    }

    getCameraTarget() {
        const transform = this.entity.getComponent(Transform);
        if (!transform) return new Vec3(0, 0, -10);

        if (this.viewMode === 'first') {
            const eyeHeight = this.height * 0.9;
            // Calcular dirección de mirada basada en yaw y pitch
            const targetDistance = 10;
            const targetX = transform.position.x + Math.sin(this.yaw) * Math.cos(this.pitch) * targetDistance;
            const targetY = transform.position.y + eyeHeight + Math.sin(this.pitch) * targetDistance;
            const targetZ = transform.position.z + Math.cos(this.yaw) * Math.cos(this.pitch) * targetDistance;

            return new Vec3(targetX, targetY, targetZ);
        } else {
            return new Vec3(
                transform.position.x,
                transform.position.y + 1.8,
                transform.position.z
            );
        }
    }
}
