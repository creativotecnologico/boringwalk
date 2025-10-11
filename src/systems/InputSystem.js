// InputSystem - Sistema de entrada (teclado, ratón)
class InputSystem extends System {
    constructor() {
        super();
        this.keys = {};
        this.mouseState = {
            x: 0,
            y: 0,
            deltaX: 0,
            deltaY: 0,
            buttons: {}
        };

        this.setupListeners();
    }

    setupListeners() {
        // Teclado
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Ratón
        document.addEventListener('mousemove', (e) => {
            const deltaX = e.movementX || 0;
            const deltaY = e.movementY || 0;

            this.mouseState.deltaX = deltaX;
            this.mouseState.deltaY = deltaY;
            this.mouseState.x = e.clientX;
            this.mouseState.y = e.clientY;
        });

        document.addEventListener('mousedown', (e) => {
            this.mouseState.buttons[e.button] = true;
        });

        document.addEventListener('mouseup', (e) => {
            this.mouseState.buttons[e.button] = false;
        });
    }

    isKeyPressed(keyCode) {
        return this.keys[keyCode] || false;
    }

    isMouseButtonPressed(button) {
        return this.mouseState.buttons[button] || false;
    }

    getMouseDelta() {
        const delta = {
            x: this.mouseState.deltaX,
            y: this.mouseState.deltaY
        };

        // Reset delta después de leer
        this.mouseState.deltaX = 0;
        this.mouseState.deltaY = 0;

        return delta;
    }

    updateEntity(entity, deltaTime) {
        // InputSystem no actualiza entidades directamente
        // Otros sistemas pueden consultar el estado del input
    }
}
