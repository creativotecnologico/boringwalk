// PhysicsSystem - Sistema de física y colisiones
class PhysicsSystem extends System {
    constructor() {
        super();
        this.requiredComponents = [Transform, Collider];
        this.terrain = null;
    }

    setTerrain(terrain) {
        this.terrain = terrain;
    }

    updateEntity(entity, deltaTime) {
        const transform = entity.getComponent(Transform);
        const collider = entity.getComponent(Collider);

        // Aplicar colisión con el terreno si existe
        if (this.terrain && collider.type === 'capsule') {
            const groundHeight = this.terrain.getHeightAt(transform.position.x, transform.position.z);

            // Ajustar posición Y según la altura del terreno
            // (asumiendo que el collider tiene información de altura)
            if (collider.bounds && collider.bounds.height) {
                transform.position.y = groundHeight + collider.bounds.height / 2;
            } else {
                transform.position.y = groundHeight;
            }
        }
    }
}
