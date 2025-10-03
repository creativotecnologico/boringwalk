// Controles simplificados - Solo WASD
class FirstPersonControls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;

        // Estado de teclas
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };

        // Configuración de movimiento
        this.moveSpeed = 3.0; // metros por segundo

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Solo eventos de teclado
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));
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
        }
    }

    update(deltaTime, player) {
        const distance = this.moveSpeed * deltaTime;

        // Solo adelante/atrás
        if (this.keys.forward) player.move('forward', distance);
        if (this.keys.backward) player.move('backward', distance);
        if (this.keys.left) player.move('left', distance);
        if (this.keys.right) player.move('right', distance);
    }
}
