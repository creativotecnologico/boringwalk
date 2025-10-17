// RenderSystem - Sistema de renderizado que usa WebGLEngine
class RenderSystem extends System {
    constructor(engine) {
        super();
        this.engine = engine;
        this.requiredComponents = [Transform, MeshRenderer];
        this.camera = null;
    }

    setCamera(camera) {
        this.camera = camera;
    }

    render(viewMatrix, projectionMatrix, wireframe = false, useMap = false) {
        if (!this.camera) return;

        // Parámetros de niebla blanca realista
        const fogColor = [0.85, 0.85, 1.0];  // Blanco ligeramente azulado
        const fogNear = 500.0;  // Distancia donde empieza la niebla
        const fogFar = 2500.0;  // Distancia donde la niebla es total

        for (const entity of this.entities) {
            if (!entity.active) continue;

            const transform = entity.getComponent(Transform);
            const meshRenderer = entity.getComponent(MeshRenderer);

            if (!meshRenderer.visible || !meshRenderer.mesh) continue;

            const mesh = meshRenderer.mesh;

            const gl = this.engine.gl;

            // Cambiar shader según el tipo de malla
            if (mesh instanceof SkyMesh) {
                // Usar shader de cielo
                this.engine.useShader('sky');
                
                // Aplicar color de niebla al cielo para coherencia
                this.engine.setUniform3fv('uFogColor', fogColor);
            } else if (mesh instanceof ProceduralTerrainMesh) {
                // Usar shader de terreno con normales
                this.engine.useShader('terrain');

                if (useMap) {
                    // Modo mapa: luz ambiental muy fuerte para ver todo bien iluminado
                    this.engine.setUniform3fv('uLightDirection', [0.0, 1.0, 0.0]);
                    this.engine.setUniform3fv('uLightColor', [0.5, 0.5, 0.5]);
                    this.engine.setUniform3fv('uAmbientColor', [0.8, 0.8, 0.8]);
                } else {
                    // Luz del sol desde arriba y lateral (mejor para ver relieve)
                    this.engine.setUniform3fv('uLightDirection', [0.6, 1.2, 0.4]);
                    this.engine.setUniform3fv('uLightColor', [1.2, 1.15, 1.0]);
                    // Luz ambiental fuerte para ver bien los colores
                    this.engine.setUniform3fv('uAmbientColor', [0.5, 0.52, 0.55]);
                }
                
                // Configurar niebla blanca
                this.engine.setUniform3fv('uFogColor', fogColor);
                this.engine.setUniform1f('uFogNear', fogNear);
                this.engine.setUniform1f('uFogFar', fogFar);
                
                // Posición de la cámara para calcular distancias
                const cameraPos = this.camera.position;
                this.engine.setUniform3fv('uCameraPosition', [cameraPos.x, cameraPos.y, cameraPos.z]);
            } else if (mesh.useTexture && mesh.textureName) {
                this.engine.useShader('texture');

                // Enlazar textura diffuse
                this.engine.textureManager.bindTexture(mesh.textureName, 0);
                const uTexture = this.engine.shaderManager.getUniformLocation('uTexture');
                gl.uniform1i(uTexture, 0); // Usar unidad de textura 0

                // Enlazar textura de displacement si existe
                if (mesh.displacementName) {
                    this.engine.textureManager.bindTexture(mesh.displacementName, 1);
                    const uDisplacement = this.engine.shaderManager.getUniformLocation('uDisplacement');
                    gl.uniform1i(uDisplacement, 1); // Usar unidad de textura 1

                    // Escala del displacement (ajustar según necesidad)
                    const uDisplacementScale = this.engine.shaderManager.getUniformLocation('uDisplacementScale');
                    gl.uniform1f(uDisplacementScale, mesh.displacementScale || 0.5);
                }
            } else {
                // Desactivar atributo de textura antes de cambiar shader
                const prevShader = this.engine.shaderManager.currentProgram;
                if (prevShader) {
                    const aTexCoord = gl.getAttribLocation(prevShader.program, 'aTexCoord');
                    if (aTexCoord !== -1) {
                        gl.disableVertexAttribArray(aTexCoord);
                    }
                }

                this.engine.useShader('main');
            }

            // Obtener matriz de modelo
            const modelMatrix = transform.getModelMatrix();

            // Establecer uniforms
            this.engine.setUniformMatrix4fv('uModel', modelMatrix.elements);
            this.engine.setUniformMatrix4fv('uView', viewMatrix.elements);
            this.engine.setUniformMatrix4fv('uProjection', projectionMatrix.elements);

            // Renderizar la malla (el grid nunca en wireframe)
            const useWireframe = wireframe && !mesh.isGrid;

            // Pasar parámetro de mapa al terreno
            if (mesh instanceof ProceduralTerrainMesh) {
                mesh.render(this.engine, useWireframe, useMap);
            } else if (mesh.useTexture && mesh.textureName) {
                mesh.renderTextured(this.engine, useWireframe);
            } else {
                mesh.render(this.engine, useWireframe);
            }
        }
    }

    updateEntity(entity, deltaTime) {
        // El renderizado se hace en render(), no en update
    }
}
