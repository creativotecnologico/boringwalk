// BoringWalk - Nuevo main usando ECS + WebGL Engine

// ========== SHADERS DE COLOR (ORIGINAL) ==========
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

// ========== SHADERS DE TEXTURA (NUEVO) ==========
const vertexShaderTextureSource = `
    attribute vec3 aPosition;
    attribute vec2 aTexCoord;  // Coordenadas UV de la textura

    uniform mat4 uModel;
    uniform mat4 uView;
    uniform mat4 uProjection;
    uniform sampler2D uDisplacement;  // Mapa de displacement
    uniform float uDisplacementScale; // Escala del desplazamiento

    varying vec2 vTexCoord;  // Pasar UV al fragment shader

    void main() {
        vec3 displacedPosition = aPosition;

        // Leer valor del displacement map (0-1, en escala de grises)
        float height = texture2D(uDisplacement, aTexCoord).r;

        // Desplazar en el eje Y según el valor del displacement
        displacedPosition.y += height * uDisplacementScale;

        gl_Position = uProjection * uView * uModel * vec4(displacedPosition, 1.0);
        vTexCoord = aTexCoord;  // Pasar coordenadas UV
    }
`;

const fragmentShaderTextureSource = `
    precision mediump float;

    varying vec2 vTexCoord;  // Recibir UV del vertex shader
    uniform sampler2D uTexture;  // La textura a aplicar

    void main() {
        // Muestrear el color de la textura en la coordenada UV
        gl_FragColor = texture2D(uTexture, vTexCoord);
    }
`;

// Variables globales
let engine;
let world;
let camera;
let terrain;
let playerEntity;
let worldCameraEntity;
let terrainMarkerEntity;
let gridEntity;
let playerCameraFrustumEntity;
let cameraMode = 'player'; // 'player' o 'world'

// Sistemas
let renderSystem;
let physicsSystem;
let inputSystem;

// Estado
let lastTime = 0;
let frameCount = 0;
let fps = 0;
let fpsTime = 0;
let wireframeMode = false;

// Estadísticas del terreno
let terrainStats = {
    vertices: 0,
    triangles: 0,
    memoryMB: 0
};

// Canvas de texto
let textCanvas;
let textCtx;

// Inicializar
function init() {
    const canvas = document.getElementById('canvas');

    // Configurar canvas de texto
    textCanvas = document.getElementById('textCanvas');
    textCtx = textCanvas.getContext('2d');
    textCanvas.width = canvas.width;
    textCanvas.height = canvas.height;

    // Crear WebGL Engine
    engine = new WebGLEngine(canvas);

    // Crear shader de colores (original)
    engine.createShader('main', vertexShaderSource, fragmentShaderSource);

    // Crear shader de texturas (nuevo)
    engine.createShader('texture', vertexShaderTextureSource, fragmentShaderTextureSource);

    // Usar shader de colores por defecto
    engine.useShader('main');

    // Crear cámara
    camera = new Camera(75, engine.getAspectRatio(), 0.1, 1000);

    // Crear mundo ECS
    world = new World();

    // Crear sistemas
    renderSystem = world.addSystem(new RenderSystem(engine));
    renderSystem.setCamera(camera);

    physicsSystem = world.addSystem(new PhysicsSystem());

    inputSystem = world.addSystem(new InputSystem());

    // Crear escena
    createScene();

    // Listeners de teclado
    setupKeyboardListeners();

    // Listeners de ratón
    setupMouseListeners();

    // Actualizar aspect ratio cuando se redimensiona
    window.addEventListener('resize', () => {
        camera.setAspect(engine.getAspectRatio());
    });

    // Iniciar loop
    requestAnimationFrame(render);
}

function createScene() {
    // Cargar texturas del terreno
    engine.textureManager.loadTexture('./data/textures/terrain/Terrain003/Terrain003_2K_Color.png', 'terrain_diffuse');
    engine.textureManager.loadTexture('./data/textures/terrain/Terrain003/Terrain003_2K_Protrusion.png', 'terrain_displacement');
    engine.textureManager.loadTexture('./data/textures/terrain/Terrain003/Terrain003_2K.png', 'terrain_height');

    // Cargar height map y crear terreno
    engine.textureManager.loadImageData('./data/textures/terrain/Terrain003/Terrain003_2K.png', (imageData) => {
        if (imageData) {
            console.log(`Height map cargado: ${imageData.width}x${imageData.height}`);

            // Crear terreno con height map (2000x2000 metros, resolución 2m)
            terrain = new TerrainMesh(engine, 2000, 2000, 2, false); // No auto-generar
            terrain.generateHeightMap(imageData, 100); // Escala de altura: 100 metros
            terrain.generate();

            // Calcular estadísticas del terreno
            const numVerticesX = Math.floor(2000 / 2) + 1;
            const numVerticesZ = Math.floor(2000 / 2) + 1;
            const totalVertices = numVerticesX * numVerticesZ;
            const totalTriangles = (numVerticesX - 1) * (numVerticesZ - 1) * 2;

            // Estimar memoria (aproximado)
            const vertexBufferSize = totalVertices * 3 * 4; // 3 floats (x,y,z) * 4 bytes
            const colorBufferSize = totalVertices * 3 * 4; // 3 floats (r,g,b) * 4 bytes
            const uvBufferSize = totalVertices * 2 * 4; // 2 floats (u,v) * 4 bytes
            const indexBufferSize = totalTriangles * 3 * 4; // 3 indices * 4 bytes (Uint32)
            const totalMemoryMB = (vertexBufferSize + colorBufferSize + uvBufferSize + indexBufferSize) / (1024 * 1024);

            // Guardar estadísticas
            terrainStats.vertices = totalVertices;
            terrainStats.triangles = totalTriangles;
            terrainStats.memoryMB = totalMemoryMB;

            console.log(`=== Estadísticas del Terreno ===`);
            console.log(`Vértices: ${totalVertices.toLocaleString()}`);
            console.log(`Triángulos: ${totalTriangles.toLocaleString()}`);
            console.log(`Memoria GPU (estimada): ${totalMemoryMB.toFixed(2)} MB`);

            // Habilitar textura en el terreno
            terrain.useTexture = true;
            terrain.textureName = 'terrain_diffuse';
            terrain.displacementName = 'terrain_displacement';

            // Crear entidad del terreno
            const terrainEntity = world.createEntity('Terrain');
            terrainEntity.addComponent(new Transform(new Vec3(0, 0, 0)));
            terrainEntity.addComponent(new MeshRenderer(terrain));

            physicsSystem.setTerrain(terrain);
        } else {
            console.error('Error cargando height map, usando terreno aleatorio');
            createTerrainFallback();
        }
    });

    // Función de fallback si falla la carga
    function createTerrainFallback() {
        terrain = new TerrainMesh(engine, 500, 500, 2);
        terrain.useTexture = true;
        terrain.textureName = 'terrain_diffuse';
        terrain.displacementName = 'terrain_displacement';

        const terrainEntity = world.createEntity('Terrain');
        terrainEntity.addComponent(new Transform(new Vec3(0, 0, 0)));
        terrainEntity.addComponent(new MeshRenderer(terrain));

        physicsSystem.setTerrain(terrain);
    }

    // Crear entidad del jugador
    playerEntity = world.createEntity('Player');
    const playerTransform = new Transform(new Vec3(0, 0, 5));
    playerTransform.pivot = new Vec3(0, 0.9, 0); // Pivote en la base de la cápsula

    const playerController = new PlayerController();

    playerEntity.addComponent(playerTransform);
    playerEntity.addComponent(new MeshRenderer(Primitives.createCapsule(engine)));
    playerEntity.addComponent(playerController);

    playerController.loadState();


    // Crear collider para el jugador
    const collider = new Collider('capsule');
    collider.bounds = { height: 1.8 };
    playerEntity.addComponent(collider);

    // Crear eje de debug para el jugador
    const axisEntity = world.createEntity('PlayerAxis');
    axisEntity.addComponent(new Transform(new Vec3(0, 0, 0)));
    axisEntity.addComponent(new MeshRenderer(Primitives.createAxis(engine, 1.0)));

    // Guardar referencia para actualizar posición
    playerEntity.axisEntity = axisEntity;

    // Crear cámara del mundo
    worldCameraEntity = world.createEntity('WorldCamera');
    worldCameraEntity.addComponent(new Transform(new Vec3(0, 10, 10)));
    const worldCameraController = new WorldCameraController();
    worldCameraEntity.addComponent(worldCameraController);
    worldCameraController.onAttach();

    // Crear gizmo de ejes del mundo (brújula)
    const worldAxisGizmo = world.createEntity('WorldAxisGizmo');
    worldAxisGizmo.addComponent(new Transform(new Vec3(0, 0, 0)));
    worldAxisGizmo.addComponent(new MeshRenderer(Primitives.createAxis(engine, 0.15)));
    worldAxisGizmo.addComponent(new WorldAxisGizmo());

    // Crear marcador del punto de referencia del terreno
    terrainMarkerEntity = world.createEntity('TerrainMarker');
    terrainMarkerEntity.addComponent(new Transform(new Vec3(0, 0, 0)));
    terrainMarkerEntity.addComponent(new MeshRenderer(Primitives.createMarker(engine, 0.15, [1, 1, 0])));

    // Crear grid de depuración (tablero de ajedrez)
    gridEntity = world.createEntity('Grid');
    gridEntity.addComponent(new Transform(new Vec3(0, 0, 0)));
    gridEntity.addComponent(new MeshRenderer(Primitives.createGrid(engine, 500, 500, 10)));

    // Crear frustum de cámara del jugador (visible solo en modo mundo)
    playerCameraFrustumEntity = world.createEntity('PlayerCameraFrustum');
    playerCameraFrustumEntity.addComponent(new Transform(new Vec3(0, 0, 0)));
    const frustumMesh = Primitives.createCameraFrustum(engine, 75, engine.getAspectRatio(), 0.1, 50, [1, 1, 0]);
    const frustumRenderer = new MeshRenderer(frustumMesh);
    frustumRenderer.visible = false; // Oculto por defecto
    playerCameraFrustumEntity.addComponent(frustumRenderer);
}

function setupKeyboardListeners() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F3') {
            e.preventDefault();
            wireframeMode = !wireframeMode;
            engine.wireframeMode = wireframeMode;
        }
        if (e.key === 'F4') {
            e.preventDefault();
            const playerController = playerEntity.getComponent(PlayerController);
            if (playerController) {
                playerController.toggleView();
            }
        }
        if (e.key === 'F5') {
            e.preventDefault();
            cameraMode = cameraMode === 'player' ? 'world' : 'player';
            console.log(`Cámara: ${cameraMode === 'player' ? 'Jugador' : 'Mundo Libre'}`);
        }
        if (e.key === 'F6') {
            e.preventDefault();
            const gridRenderer = gridEntity.getComponent(MeshRenderer);
            if (gridRenderer) {
                gridRenderer.visible = !gridRenderer.visible;
                console.log(`Grid: ${gridRenderer.visible ? 'Visible' : 'Oculto'}`);
            }
        }
    });
}

function setupMouseListeners() {
    const canvas = document.getElementById('canvas');

    // Capturar puntero al hacer clic en el canvas
    canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
    });

    // Manejar movimiento del ratón cuando está capturado
    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement === canvas) {
            if (cameraMode === 'player') {
                const playerController = playerEntity.getComponent(PlayerController);
                if (playerController) {
                    // Actualizar rotación de la cámara (funciona en primera y tercera persona)
                    playerController.yaw -= e.movementX * playerController.mouseSensitivity;
                    playerController.pitch -= e.movementY * playerController.mouseSensitivity;

                    // Limitar pitch para evitar gimbal lock
                    const maxPitch = Math.PI / 2 - 0.1;
                    playerController.pitch = Math.max(-maxPitch, Math.min(maxPitch, playerController.pitch));
                }
            } else {
                // Modo cámara libre (invertido)
                const worldCameraController = worldCameraEntity.getComponent(WorldCameraController);
                if (worldCameraController) {
                    worldCameraController.yaw += e.movementX * 0.002;
                    worldCameraController.pitch += e.movementY * 0.002;

                    // Limitar pitch
                    const maxPitch = Math.PI / 2 - 0.1;
                    worldCameraController.pitch = Math.max(-maxPitch, Math.min(maxPitch, worldCameraController.pitch));
                }
            }
        }
    });

    // Mostrar mensaje cuando se capture/libere el puntero
    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === canvas) {
            console.log('Ratón capturado - Mueve el ratón para mirar');
        } else {
            console.log('Ratón liberado - Presiona ESC para salir del modo captura');
        }
    });

    // Controlar zoom con rueda del ratón (solo en modo mundo)
    canvas.addEventListener('wheel', (e) => {
        if (cameraMode === 'world') {
            e.preventDefault();
            const worldCameraController = worldCameraEntity.getComponent(WorldCameraController);
            if (worldCameraController) {
                // Scroll arriba = aumentar velocidad, Scroll abajo = reducir velocidad
                const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
                worldCameraController.moveSpeed *= zoomFactor;
                worldCameraController.fastMoveSpeed *= zoomFactor;

                // Limitar velocidades
                worldCameraController.moveSpeed = Math.max(1, Math.min(100, worldCameraController.moveSpeed));
                worldCameraController.fastMoveSpeed = Math.max(5, Math.min(500, worldCameraController.fastMoveSpeed));
            }
        }
    });
}

function render(time) {
    time *= 0.001;
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
        // Actualizar controles del jugador
        const playerController = playerEntity.getComponent(PlayerController);
        const playerTransform = playerEntity.getComponent(Transform);

        if (inputSystem.isKeyPressed('KeyW') || inputSystem.isKeyPressed('ArrowUp')) {
            playerController.move('forward', playerController.moveSpeed * deltaTime);
        }
        if (inputSystem.isKeyPressed('KeyS') || inputSystem.isKeyPressed('ArrowDown')) {
            playerController.move('backward', playerController.moveSpeed * deltaTime);
        }
        if (inputSystem.isKeyPressed('KeyA') || inputSystem.isKeyPressed('ArrowLeft')) {
            playerController.move('left', playerController.moveSpeed * deltaTime);
        }
        if (inputSystem.isKeyPressed('KeyD') || inputSystem.isKeyPressed('ArrowRight')) {
            playerController.move('right', playerController.moveSpeed * deltaTime);
        }

        // Actualizar física
        world.update(deltaTime);

        // Obtener posición y target de la cámara del jugador
        cameraPos = playerController.getCameraPosition();
        cameraTarget = playerController.getCameraTarget();

        // Actualizar rotación del jugador según yaw de la cámara
        playerTransform.rotation.y = -playerController.yaw;

        // Actualizar posición y rotación del eje según la cámara
        if (playerEntity.axisEntity) {
            const axisTransform = playerEntity.axisEntity.getComponent(Transform);
            if (axisTransform) {
                axisTransform.position.x = playerTransform.position.x;
                axisTransform.position.y = playerTransform.position.y;
                axisTransform.position.z = playerTransform.position.z;
                // Rotar el eje según el yaw de la cámara (invertido para que Z apunte hacia donde mira)
                axisTransform.rotation.y = -playerController.yaw;
            }
        }

        // Actualizar marcador del punto de referencia del terreno
        if (terrainMarkerEntity && terrain) {
            const markerTransform = terrainMarkerEntity.getComponent(Transform);
            const groundHeight = terrain.getHeightAt(playerTransform.position.x, playerTransform.position.z);
            markerTransform.position.x = playerTransform.position.x;
            markerTransform.position.y = groundHeight;
            markerTransform.position.z = playerTransform.position.z;
        }

        // Mostrar/ocultar jugador según el modo de vista
        const meshRenderer = playerEntity.getComponent(MeshRenderer);
        if (meshRenderer) {
            meshRenderer.visible = (playerController.viewMode === 'third');
        }

        // Ocultar frustum en modo jugador
        const frustumRenderer = playerCameraFrustumEntity.getComponent(MeshRenderer);
        if (frustumRenderer) {
            frustumRenderer.visible = false;
        }
    } else {
        // Modo cámara del mundo
        const worldCameraController = worldCameraEntity.getComponent(WorldCameraController);
        worldCameraController.update(deltaTime, inputSystem);

        const worldCameraTransform = worldCameraEntity.getComponent(Transform);
        cameraPos = worldCameraTransform.position;
        cameraTarget = worldCameraController.getTarget();

        // Siempre mostrar el jugador en modo mundo
        const meshRenderer = playerEntity.getComponent(MeshRenderer);
        if (meshRenderer) {
            meshRenderer.visible = true;
        }

        // Mostrar frustum de cámara del jugador en modo mundo
        const frustumRenderer = playerCameraFrustumEntity.getComponent(MeshRenderer);
        const frustumTransform = playerCameraFrustumEntity.getComponent(Transform);
        if (frustumRenderer && frustumTransform) {
            frustumRenderer.visible = true;

            // Posicionar y rotar frustum según cámara del jugador
            const playerController = playerEntity.getComponent(PlayerController);
            const playerCameraPos = playerController.getCameraPosition();

            frustumTransform.position.x = playerCameraPos.x;
            frustumTransform.position.y = playerCameraPos.y;
            frustumTransform.position.z = playerCameraPos.z;

            // Rotar frustum según yaw y pitch de la cámara
            frustumTransform.rotation.y = -playerController.yaw;
            frustumTransform.rotation.x = playerController.pitch;
        }
    }

    // Crear matrices
    const viewMatrix = Mat4.lookAt(cameraPos, cameraTarget, { x: 0, y: 1, z: 0 });
    const projectionMatrix = camera.getProjectionMatrix();

    // Actualizar info de debug
    updateDebugInfo(cameraPos, cameraTarget);

    // Limpiar pantalla
    engine.clear();

    // Renderizar
    renderSystem.render(viewMatrix, projectionMatrix, wireframeMode);

    // Líneas del grid comentadas
    // if (gridEntity) {
    //     const gridRenderer = gridEntity.getComponent(MeshRenderer);
    //     if (gridRenderer && gridRenderer.visible && gridRenderer.mesh.gridLines) {
    //         const gridTransform = gridEntity.getComponent(Transform);
    //         const modelMatrix = gridTransform.getModelMatrix();
    //         engine.setUniformMatrix4fv('uModel', modelMatrix.elements);
    //         engine.setUniformMatrix4fv('uView', viewMatrix.elements);
    //         engine.setUniformMatrix4fv('uProjection', projectionMatrix.elements);
    //         gridRenderer.mesh.gridLines.renderLines(engine);
    //     }
    // }

    // Asegurar que usamos el shader de colores para los gizmos
    engine.useShader('main');

    // Desactivar atributos de textura si estaban activos
    const gl = engine.gl;
    const aTexCoord = gl.getAttribLocation(engine.shaderManager.programs.get('texture').program, 'aTexCoord');
    if (aTexCoord !== -1) {
        gl.disableVertexAttribArray(aTexCoord);
    }

    // Renderizar ejes del jugador (líneas)
    if (playerEntity.axisEntity) {
        const axisTransform = playerEntity.axisEntity.getComponent(Transform);
        const axisMesh = playerEntity.axisEntity.getComponent(MeshRenderer).mesh;

        if (axisTransform && axisMesh) {
            const modelMatrix = axisTransform.getModelMatrix();
            engine.setUniformMatrix4fv('uModel', modelMatrix.elements);
            engine.setUniformMatrix4fv('uView', viewMatrix.elements);
            engine.setUniformMatrix4fv('uProjection', projectionMatrix.elements);
            axisMesh.renderLines(engine);
        }
    }

    // Renderizar gizmo de ejes del mundo (brújula anclada)
    const worldAxisGizmos = world.getEntitiesWithComponents(WorldAxisGizmo, Transform, MeshRenderer);
    if (worldAxisGizmos.length > 0) {
        const gizmo = worldAxisGizmos[0];
        const gizmoMesh = gizmo.getComponent(MeshRenderer).mesh;

        // Posición fija en espacio de clip (esquina superior derecha)
        const gizmoModelMatrix = Mat4.translation(0.75, 0.85, -2);

        // Usar matriz identidad para la vista (sin transformación de cámara)
        const gizmoViewMatrix = Mat4.identity();

        engine.setUniformMatrix4fv('uModel', gizmoModelMatrix.elements);
        engine.setUniformMatrix4fv('uView', gizmoViewMatrix.elements);
        engine.setUniformMatrix4fv('uProjection', projectionMatrix.elements);
        gizmoMesh.renderLines(engine);
    }

    // Renderizar frustum de cámara del jugador (en modo mundo)
    if (playerCameraFrustumEntity) {
        const frustumRenderer = playerCameraFrustumEntity.getComponent(MeshRenderer);
        const frustumTransform = playerCameraFrustumEntity.getComponent(Transform);

        if (frustumRenderer && frustumRenderer.visible && frustumTransform) {
            const frustumMesh = frustumRenderer.mesh;
            const modelMatrix = frustumTransform.getModelMatrix();

            engine.setUniformMatrix4fv('uModel', modelMatrix.elements);
            engine.setUniformMatrix4fv('uView', viewMatrix.elements);
            engine.setUniformMatrix4fv('uProjection', projectionMatrix.elements);
            frustumMesh.renderLines(engine);
        }
    }

    // Etiquetas de coordenadas comentadas
    // renderGridLabels(viewMatrix, projectionMatrix);

    requestAnimationFrame(render);
}

// function renderGridLabels(viewMatrix, projectionMatrix) {
//     if (!gridEntity) return;
//     const gridRenderer = gridEntity.getComponent(MeshRenderer);
//     if (!gridRenderer || !gridRenderer.visible) {
//         textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
//         return;
//     }
//     textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
//     ...
// }

// function project3DTo2D(x, y, z, viewMatrix, projectionMatrix) {
//     ...
// }

function updateDebugInfo(cameraPos, cameraTarget) {
    const playerController = playerEntity.getComponent(PlayerController);
    const playerTransform = playerEntity.getComponent(Transform);

    const viewModeText = cameraMode === 'player'
        ? (playerController.viewMode === 'first' ? 'Primera Persona' : 'Tercera Persona')
        : 'Mundo Libre';

    document.getElementById('view-mode').textContent = viewModeText;
    document.getElementById('fps').textContent = fps;
    document.getElementById('vertices').textContent = terrainStats.vertices.toLocaleString();
    document.getElementById('triangles').textContent = terrainStats.triangles.toLocaleString();
    document.getElementById('memory').textContent = terrainStats.memoryMB.toFixed(2);
    document.getElementById('player-pos').textContent =
        `(${playerTransform.position.x.toFixed(2)}, ${playerTransform.position.y.toFixed(2)}, ${playerTransform.position.z.toFixed(2)})`;
    document.getElementById('camera-pos').textContent =
        `(${cameraPos.x.toFixed(2)}, ${cameraPos.y.toFixed(2)}, ${cameraPos.z.toFixed(2)})`;
    document.getElementById('camera-target').textContent =
        `(${cameraTarget.x.toFixed(2)}, ${cameraTarget.y.toFixed(2)}, ${cameraTarget.z.toFixed(2)})`;
}

// Iniciar cuando el DOM esté listo
window.addEventListener('DOMContentLoaded', init);
