// BoringWalk - Nuevo main usando ECS + WebGL Engine

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
let cameraMode = 'player'; // 'player', 'world' o 'map'
let mapMode = false;

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

// Renderer
let renderer;

// Control de pantalla de inicio
let gameStarted = false;

// Función para actualizar barra de progreso
function updateLoadingProgress(progress, message) {
    const progressFill = document.getElementById('progress-fill');
    const loadingDetails = document.getElementById('loading-details');
    
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }
    if (loadingDetails) {
        loadingDetails.textContent = message;
    }
}

// Función para ocultar pantalla de inicio
function hideStartScreen() {
    const startScreen = document.getElementById('start-screen');
    startScreen.classList.add('hidden');
    
    // Eliminar después de la transición
    setTimeout(() => {
        startScreen.style.display = 'none';
    }, 500);
}

// Inicializar
async function init() {
    updateLoadingProgress(5, 'Inicializando motor gráfico...');
    
    const canvas = document.getElementById('canvas');

    // Crear engine (incluye renderer y managers)
    try {
        engine = await Engine.create('webgl', '1080p'); // API y resolución por defecto
        renderer = engine.renderer;
        
        updateLoadingProgress(15, `Renderer: ${renderer.api.toUpperCase()} - ${engine.getResolution().label}`);
        
        console.log(`Renderer detectado: ${renderer.api.toUpperCase()}`);
        console.log(`Resolución: ${engine.getResolution().label}`);
        console.log('Engine info:', engine.getInfo());
        
        // Si el renderer ya tiene un canvas, usarlo en lugar del del HTML
        if (renderer.canvas) {
            // Reemplazar el canvas del HTML con el del renderer
            const oldCanvas = document.getElementById('canvas');
            renderer.canvas.id = 'canvas';
            oldCanvas.parentNode.replaceChild(renderer.canvas, oldCanvas);
        }

    } catch (error) {
        console.error('Error al inicializar engine:', error);
        alert('Tu navegador no soporta WebGL. Por favor, usa un navegador moderno.');
        return;
    }

    // Configurar canvas de texto (después de tener el canvas final con resolución)
    textCanvas = document.getElementById('textCanvas');
    textCtx = textCanvas.getContext('2d');
    textCanvas.width = renderer.canvas.width;
    textCanvas.height = renderer.canvas.height;

    // Cargar y compilar shaders
    try {
        updateLoadingProgress(25, 'Cargando shaders...');
        const shaders = await renderer.loadShaders();
        console.log(`Cargados ${shaders.length} shaders para ${renderer.api}:`, shaders.map(s => s.name));

        updateLoadingProgress(35, 'Compilando shaders...');
        // Compilar cada shader en el engine
        for (const shader of shaders) {
            engine.createShader(shader.name, shader.vertexSource, shader.fragmentSource);
            console.log(`✓ Shader '${shader.name}' compilado: ${shader.description}`);
        }

        // Usar shader de colores por defecto
        engine.useShader('main');
        updateLoadingProgress(45, 'Shaders compilados correctamente');
    } catch (error) {
        console.error('Error al cargar shaders:', error);
        alert('Error al cargar los shaders. Por favor, verifica que los archivos existen.');
        return;
    }

    updateLoadingProgress(50, 'Configurando cámara y sistemas...');
    
    // Crear cámara (far plane aumentado para ver terreno desde lejos)
    camera = new Camera(75, engine.getAspectRatio(), 0.1, 10000);

    // Crear mundo ECS
    world = new World();

    // Crear sistemas
    renderSystem = world.addSystem(new RenderSystem(engine));
    renderSystem.setCamera(camera);

    physicsSystem = world.addSystem(new PhysicsSystem());

    inputSystem = world.addSystem(new InputSystem());

    updateLoadingProgress(60, 'Generando escena...');
    
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

    updateLoadingProgress(100, '¡Listo para comenzar!');
    
    // Iniciar loop
    requestAnimationFrame(render);
}

function createScene() {
    updateLoadingProgress(65, 'Creando cielo...');
    
    // Crear cielo con gradiente
    const skyMesh = new SkyMesh(engine, 2000);
    window.skyEntity = world.createEntity('Sky');
    window.skyEntity.addComponent(new Transform(new Vec3(0, 0, 0)));
    window.skyEntity.addComponent(new MeshRenderer(skyMesh));

    updateLoadingProgress(70, 'Generando terreno procedural 5km x 5km...');
    
    // Crear terreno procedural de 5km x 5km centrado en (0,0,0)
    const seed = Math.floor(Math.random() * 1000000);
    terrain = new ProceduralTerrainMesh(engine, seed, 5000, 5000, 5);
    const terrainData = terrain.generate();

    updateLoadingProgress(85, 'Procesando geometría del terreno...');

    // Guardar estadísticas del terreno
    terrainStats.vertices = terrainData.verticesX * terrainData.verticesZ;
    terrainStats.triangles = terrainData.numTriangles;

    // Estimar memoria
    const vertexBufferSize = terrainData.vertices.length * 4;
    const colorBufferSize = terrainData.colorMap.length * 4;
    const normalBufferSize = terrainData.normals.length * 4;
    const indexBufferSize = terrainData.indices.length * 4;
    const totalMemoryMB = (vertexBufferSize + colorBufferSize + normalBufferSize + indexBufferSize) / (1024 * 1024);
    terrainStats.memoryMB = totalMemoryMB;

    console.log(`=== Estadísticas del Terreno ===`);
    console.log(`Seed: ${seed}`);
    console.log(`Tamaño: ${terrainData.sizeX}x${terrainData.sizeZ}m`);
    console.log(`Resolución: ${terrainData.resolution}m`);
    console.log(`Vértices: ${terrainStats.vertices.toLocaleString()}`);
    console.log(`Triángulos: ${terrainStats.triangles.toLocaleString()}`);
    console.log(`Memoria GPU (estimada): ${totalMemoryMB.toFixed(2)} MB`);

    // Crear entidad del terreno
    const terrainEntity = world.createEntity('Terrain');
    terrainEntity.addComponent(new Transform(new Vec3(0, 0, 0)));
    terrainEntity.addComponent(new MeshRenderer(terrain));

    physicsSystem.setTerrain(terrain);

    updateLoadingProgress(90, 'Creando jugador y entidades...');

    // Crear entidad del jugador centrado en (0,0,0)
    playerEntity = world.createEntity('Player');
    const playerTransform = new Transform(new Vec3(0, 50, 0)); // Altura inicial: 50m
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
    // gridEntity = world.createEntity('Grid');
    // gridEntity.addComponent(new Transform(new Vec3(0, 0, 0)));
    // gridEntity.addComponent(new MeshRenderer(Primitives.createGrid(engine, 500, 500, 10)));

    // Crear frustum de cámara del jugador (visible solo en modo mundo)
    playerCameraFrustumEntity = world.createEntity('PlayerCameraFrustum');
    playerCameraFrustumEntity.addComponent(new Transform(new Vec3(0, 0, 0)));
    const frustumMesh = Primitives.createCameraFrustum(engine, 75, engine.getAspectRatio(), 0.1, 50, [1, 1, 0]);
    const frustumRenderer = new MeshRenderer(frustumMesh);
    frustumRenderer.visible = false; // Oculto por defecto
    playerCameraFrustumEntity.addComponent(frustumRenderer);
    
    updateLoadingProgress(95, 'Finalizando...');
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
        if (e.key === 'm' || e.key === 'M') {
            e.preventDefault();
            mapMode = !mapMode;
            console.log(`Mapa: ${mapMode ? 'Activado' : 'Desactivado'}`);
        }
        // if (e.key === 'F6') {
        //     e.preventDefault();
        //     const gridRenderer = gridEntity.getComponent(MeshRenderer);
        //     if (gridRenderer) {
        //         gridRenderer.visible = !gridRenderer.visible;
        //         console.log(`Grid: ${gridRenderer.visible ? 'Visible' : 'Oculto'}`);
        //     }
        // }
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

    if (mapMode) {
        // Modo mapa: vista desde arriba de TODO el mapa (centro en 0,0)
        // No se mueve, solo muestra el mapa completo con el jugador
        cameraPos = new Vec3(0, 400, 0);
        cameraTarget = new Vec3(0, 0, 0);

        // No actualizar física ni controles en modo mapa
    } else if (cameraMode === 'player') {
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

        // Actualizar PlayerController (head bobbing)
        playerController.update(deltaTime);

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

    // Crear matrices (usar vector "up" diferente en modo mapa porque miramos hacia abajo)
    const upVector = mapMode ? { x: 0, y: 0, z: -1 } : { x: 0, y: 1, z: 0 };
    const viewMatrix = Mat4.lookAt(cameraPos, cameraTarget, upVector);

    // Usar proyección ortográfica en modo mapa para ver todo el mapa
    let projectionMatrix;
    if (mapMode) {
        const orthoSize = 2600; // Mostrar 2600m a cada lado (5200m total, ligeramente más que el terreno de 5000m)
        const aspect = engine.getAspectRatio();
        // Ajustar según aspect ratio para que siempre se vea todo el mapa
        // Near/far: desde donde mira la cámara hacia abajo
        // Cámara a Y=400, terreno de Y=-12 a Y=450
        // Near debe ser negativo (450-400=50 hacia arriba), far debe cubrir hasta -12 (400+12=412 hacia abajo)
        if (aspect > 1) {
            // Pantalla más ancha que alta
            projectionMatrix = Mat4.ortho(-orthoSize * aspect, orthoSize * aspect, -orthoSize, orthoSize, -100, 500);
        } else {
            // Pantalla más alta que ancha
            projectionMatrix = Mat4.ortho(-orthoSize, orthoSize, -orthoSize / aspect, orthoSize / aspect, -100, 500);
        }
    } else {
        projectionMatrix = camera.getProjectionMatrix();
    }

    // Actualizar info de debug
    updateDebugInfo(cameraPos, cameraTarget);

    // Ocultar/mostrar cielo según modo mapa
    if (window.skyEntity) {
        const skyRenderer = window.skyEntity.getComponent(MeshRenderer);
        if (skyRenderer) {
            skyRenderer.visible = !mapMode;
        }
    }

    // Limpiar pantalla
    if (mapMode) {
        engine.clear(0.1, 0.1, 0.1, 1.0); // Fondo gris oscuro para mapa
    } else {
        engine.clear(0.0, 0.0, 0.0, 1.0); // Negro normal
    }

    // Renderizar (pasar modo mapa al sistema)
    renderSystem.render(viewMatrix, projectionMatrix, wireframeMode, mapMode);

    // Renderizar marcador del jugador en modo mapa
    if (mapMode) {
        const playerTransform = playerEntity.getComponent(Transform);
        const playerController = playerEntity.getComponent(PlayerController);
        const playerPos = playerTransform.position;

        // Dibujar marcador del jugador
        renderPlayerMarker(engine, playerPos, playerController.yaw, viewMatrix, projectionMatrix);
    }

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

// Función para renderizar el marcador del jugador en el mapa
function renderPlayerMarker(engine, playerPos, yaw, viewMatrix, projectionMatrix) {
    const gl = engine.gl;

    // Usar shader básico
    engine.useShader('main');

    // Crear geometría del marcador (triángulo que apunta en la dirección del jugador)
    const markerSize = 50; // 50m de tamaño
    const halfSize = markerSize / 2;

    // Vértices del triángulo (apunta hacia adelante en Z-)
    const forward = markerSize;
    const side = markerSize * 0.5;

    // Calcular rotación basada en yaw (invertir para que coincida con la dirección real)
    const cos = Math.cos(-yaw);
    const sin = Math.sin(-yaw);

    // Vértices del triángulo rotado
    const v0x = playerPos.x + (0 * cos - forward * sin);
    const v0z = playerPos.z + (0 * sin + forward * cos);

    const v1x = playerPos.x + (-side * cos - (-side) * sin);
    const v1z = playerPos.z + (-side * sin + (-side) * cos);

    const v2x = playerPos.x + (side * cos - (-side) * sin);
    const v2z = playerPos.z + (side * sin + (-side) * cos);

    const markerVertices = new Float32Array([
        v0x, playerPos.y + 10, v0z,  // Punta (adelante)
        v1x, playerPos.y + 10, v1z,  // Izquierda atrás
        v2x, playerPos.y + 10, v2z   // Derecha atrás
    ]);

    // Color del marcador (rojo brillante)
    const markerColors = new Float32Array([
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0
    ]);

    // Crear buffers temporales
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, markerVertices, gl.DYNAMIC_DRAW);

    const colBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, markerColors, gl.DYNAMIC_DRAW);

    // Obtener ubicaciones de atributos
    const program = engine.getCurrentProgram();
    const aPosition = gl.getAttribLocation(program, 'aPosition');
    const aColor = gl.getAttribLocation(program, 'aColor');

    // Configurar atributos
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
    gl.enableVertexAttribArray(aColor);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);

    // Configurar uniforms (sin transformación de modelo)
    const identityMatrix = Mat4.identity();
    engine.setUniformMatrix4fv('uModel', identityMatrix.elements);
    engine.setUniformMatrix4fv('uView', viewMatrix.elements);
    engine.setUniformMatrix4fv('uProjection', projectionMatrix.elements);

    // Renderizar triángulo
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Limpiar
    gl.disableVertexAttribArray(aPosition);
    gl.disableVertexAttribArray(aColor);
    gl.deleteBuffer(posBuffer);
    gl.deleteBuffer(colBuffer);
}

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
window.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-button');
    const loadingSection = document.getElementById('loading-section');
    
    startButton.addEventListener('click', async () => {
        // Ocultar botón y mostrar barra de carga
        startButton.style.display = 'none';
        loadingSection.classList.remove('hidden');
        
        // Iniciar carga del juego
        await init();
        
        // Una vez cargado, ocultar pantalla de inicio
        setTimeout(() => {
            hideStartScreen();
            gameStarted = true;
        }, 500);
    });
});
