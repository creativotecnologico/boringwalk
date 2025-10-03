// Modo de depuración
class DebugMode {
    constructor(gl) {
        this.gl = gl;
        this.enabled = false;
        this.wireframeExtension = null;

        // Intentar obtener extensión de wireframe (no disponible en WebGL estándar)
        // En su lugar, usaremos LINE_STRIP para simular wireframe
    }

    toggle() {
        this.enabled = !this.enabled;
        console.log(`Debug Mode: ${this.enabled ? 'ON' : 'OFF'}`);

        // Actualizar UI
        this.updateUI();
    }

    updateUI() {
        let debugInfo = document.getElementById('debug-info');

        if (!debugInfo) {
            debugInfo = document.createElement('div');
            debugInfo.id = 'debug-info';
            debugInfo.style.cssText = `
                position: absolute;
                top: 10px;
                left: 10px;
                background: rgba(0, 0, 0, 0.7);
                color: #0f0;
                padding: 10px;
                font-family: monospace;
                font-size: 12px;
                pointer-events: none;
                border: 1px solid #0f0;
            `;
            document.body.appendChild(debugInfo);
        }

        if (this.enabled) {
            debugInfo.style.display = 'block';
        } else {
            debugInfo.style.display = 'none';
        }
    }

    updateInfo(camera, fps) {
        if (!this.enabled) return;

        const debugInfo = document.getElementById('debug-info');
        if (debugInfo) {
            debugInfo.innerHTML = `
                <strong>DEBUG MODE [F3]</strong><br>
                FPS: ${fps.toFixed(1)}<br>
                Pos: ${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)}<br>
                Yaw: ${camera.yaw.toFixed(1)}° | Pitch: ${camera.pitch.toFixed(1)}°<br>
                <span style="color: yellow;">Wireframe: ON</span>
            `;
        }
    }

    isEnabled() {
        return this.enabled;
    }
}
