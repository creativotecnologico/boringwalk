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

    render(viewMatrix, projectionMatrix, wireframe = false) {
        if (!this.camera) return;

        for (const entity of this.entities) {
            if (!entity.active) continue;

            const transform = entity.getComponent(Transform);
            const meshRenderer = entity.getComponent(MeshRenderer);

            if (!meshRenderer.visible || !meshRenderer.mesh) continue;

            const mesh = meshRenderer.mesh;

            const gl = this.engine.gl;

            // Cambiar shader según si la malla usa textura
            if (mesh.useTexture && mesh.textureName) {
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

            if (mesh.useTexture && mesh.textureName) {
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
