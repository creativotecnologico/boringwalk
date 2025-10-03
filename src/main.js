// BoringWalk - Motor 3D desde cero
// Punto de entrada principal

// Shaders
const vertexShaderSource = `
    attribute vec3 aPosition;
    attribute vec3 aColor;

    uniform mat4 uModel;
    uniform mat4 uView;
    uniform mat4 uProjection;

    varying vec3 vColor;

    void main() {
        gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
        vColor = aColor;
    }
`;

const fragmentShaderSource = `
    precision mediump float;

    varying vec3 vColor;

    void main() {
        gl_FragColor = vec4(vColor, 1.0);
    }
`;

// Variables globales
let renderer, camera, shader, controls, debugMode;
let terrain, player;
let worldCamera; // Cámara libre del mundo
let cameraMode = 'player'; // 'player' o 'world'
let lastTime = 0;
let frameCount = 0;
let fps = 0;
let fpsTime = 0;

// Inicializar
function init() {
    const canvas = document.getElementById('canvas');

    // Crear renderer
    renderer = new Renderer(canvas);

    // Crear shader
    shader = new Shader(renderer.gl, vertexShaderSource, fragmentShaderSource);

    // Crear cámara
    camera = new Camera(75, renderer.getAspectRatio(), 0.1, 1000);

    // Crear controles
    controls = new FirstPersonControls(camera, canvas);

    // Crear cámara del mundo
    worldCamera = new WorldCamera();
    worldCamera.setupEventListeners(canvas);

    // Crear modo debug
    debugMode = new DebugMode(renderer.gl);

    // Listeners de teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F3') {
            e.preventDefault();
            debugMode.toggle();
        }
        if (e.key === 'F4') {
            e.preventDefault();
            player.toggleView();
        }
        if (e.key === 'F5') {
            e.preventDefault();
            cameraMode = cameraMode === 'player' ? 'world' : 'player';
            console.log(`Cámara: ${cameraMode === 'player' ? 'Jugador' : 'Mundo Libre'}`);
        }
    });

    // Crear entidades del mundo
    createScene();

    // Actualizar aspect ratio cuando se redimensiona
    window.addEventListener('resize', () => {
        camera.setAspect(renderer.getAspectRatio());
    });

    // Iniciar loop de renderizado
    requestAnimationFrame(render);
}

// Crear escena con entidades
function createScene() {
    const gl = renderer.gl;

    // Crear terreno de 50x20 unidades
    terrain = new Terrain(gl, 100, 50, 1);

    // Crear jugador
    player = new Player(gl);
}

// Loop de renderizado
function render(time) {
    time *= 0.001; // Convertir a segundos
    const deltaTime = time - lastTime;
    lastTime = time;

    // Calcular FPS
    frameCount++;
    fpsTime += deltaTime;
    if (fpsTime >= 1.0) {
        fps = frameCount;
        frameCount = 0;
        fpsTime = 0;
    }

    // Actualizar según el modo de cámara
    let cameraPos, cameraTarget;

    if (cameraMode === 'player') {
        // Modo jugador: actualizar controles y colisión
        controls.update(deltaTime, player);
        player.applyTerrainCollision(terrain);

        // Usar posición y target del jugador
        cameraPos = player.getCameraPosition();
        cameraTarget = player.getCameraTarget();
    } else {
        // Modo mundo: actualizar cámara libre
        worldCamera.update(deltaTime);

        // Usar posición y target de la cámara del mundo
        cameraPos = worldCamera.getPosition();
        cameraTarget = worldCamera.getTarget();
    }

    // Crear matriz de vista usando la posición del jugador
    const viewMatrix = Mat4.lookAt(cameraPos, cameraTarget, { x: 0, y: 1, z: 0 });
    const projectionMatrix = camera.getProjectionMatrix();

    // Actualizar info de debug
    debugMode.updateInfo(camera, fps);

    // Actualizar info del jugador
    document.getElementById('view-mode').textContent = player.viewMode === 'first' ? 'Primera Persona' : 'Tercera Persona';
    document.getElementById('player-pos').textContent = `(${player.position.x.toFixed(2)}, ${player.position.y.toFixed(2)}, ${player.position.z.toFixed(2)})`;
    document.getElementById('camera-pos').textContent = `(${cameraPos.x.toFixed(2)}, ${cameraPos.y.toFixed(2)}, ${cameraPos.z.toFixed(2)})`;
    document.getElementById('camera-target').textContent = `(${cameraTarget.x.toFixed(2)}, ${cameraTarget.y.toFixed(2)}, ${cameraTarget.z.toFixed(2)})`;

    // Limpiar pantalla
    renderer.clear();

    // Usar shader
    shader.use();

    shader.setUniformMatrix4fv('uView', viewMatrix.elements);
    shader.setUniformMatrix4fv('uProjection', projectionMatrix.elements);

    const wireframe = debugMode.isEnabled();

    // Renderizar terreno
    const terrainModel = Mat4.identity();
    shader.setUniformMatrix4fv('uModel', terrainModel.elements);
    terrain.render(shader, wireframe);

    // Renderizar jugador
    // En cámara del mundo, siempre mostrar el jugador
    // En cámara del jugador, solo mostrar en tercera persona
    if (cameraMode === 'world' || player.viewMode === 'third') {
        player.render(shader, wireframe);
    }

    // Siguiente frame
    requestAnimationFrame(render);
}

// Iniciar cuando el DOM esté listo
window.addEventListener('DOMContentLoaded', init);
