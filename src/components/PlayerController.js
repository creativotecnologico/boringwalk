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

        // Head bobbing (balanceo de cabeza)
        this.bobTime = 0;
        this.bobSpeed = 8.0; // Velocidad del balanceo
        this.bobAmount = 0.08; // Altura del balanceo (8cm)
        this.bobAmountSide = 0.04; // Balanceo lateral (4cm)
        this.isMoving = false;
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

        // Marcar que el jugador se está moviendo
        this.isMoving = true;

        this.saveState();
    }

    update(deltaTime) {
        // Actualizar balanceo de cabeza
        if (this.isMoving) {
            this.bobTime += deltaTime * this.bobSpeed;
        } else {
            // Volver suavemente a la posición neutral
            this.bobTime = this.bobTime * 0.9;
        }

        // Reset flag de movimiento (se actualizará en el siguiente frame si sigue moviéndose)
        this.isMoving = false;
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

            // Calcular balanceo de cabeza
            const bobOffsetY = Math.sin(this.bobTime) * this.bobAmount;
            const bobOffsetX = Math.cos(this.bobTime * 0.5) * this.bobAmountSide;

            // Aplicar balanceo en el sistema de coordenadas del jugador
            const cos = Math.cos(this.yaw);
            const sin = Math.sin(this.yaw);

            return new Vec3(
                transform.position.x + (bobOffsetX * cos),
                transform.position.y + eyeHeight + bobOffsetY,
                transform.position.z + (bobOffsetX * sin)
            );
        } else {
            // Tercera persona: cámara detrás del jugador con rotación elíptica
            const distanceHorizontal = 5; // Distancia horizontal desde el jugador
            const distanceVertical = 3;   // Distancia vertical (más corta para forma ovalada)

            // Limitar pitch para evitar que la cámara pase por debajo del terreno
            const limitedPitch = Math.max(-Math.PI * 0.4, Math.min(Math.PI * 0.4, this.pitch));

            // Calcular posición con elipse (distancia vertical escalada)
            const camX = transform.position.x - Math.sin(this.yaw) * Math.cos(limitedPitch) * distanceHorizontal;
            const camY = transform.position.y + this.height + Math.sin(limitedPitch) * distanceVertical;
            const camZ = transform.position.z - Math.cos(this.yaw) * Math.cos(limitedPitch) * distanceHorizontal;

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
            // Tercera persona: mirar hacia los hombros/cuello (60% de la altura)
            const targetHeight = this.height * 0.6;
            return new Vec3(
                transform.position.x,
                transform.position.y + targetHeight,
                transform.position.z
            );
        }
    }
}
