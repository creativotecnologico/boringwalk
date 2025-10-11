// System - Sistema base del ECS
class System {
    constructor() {
        this.entities = []; // Entidades que coinciden con los componentes requeridos
        this.requiredComponents = []; // Tipos de componentes requeridos
        this.enabled = true;
    }

    // Verificar si una entidad tiene los componentes requeridos
    entityMatches(entity) {
        return this.requiredComponents.every(ComponentType =>
            entity.hasComponent(ComponentType)
        );
    }

    // Registrar una entidad en el sistema
    registerEntity(entity) {
        if (this.entityMatches(entity) && !this.entities.includes(entity)) {
            this.entities.push(entity);
            this.onEntityAdded(entity);
        }
    }

    // Desregistrar una entidad del sistema
    unregisterEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
            this.entities.splice(index, 1);
            this.onEntityRemoved(entity);
        }
    }

    // Actualizar todas las entidades del sistema
    update(deltaTime) {
        if (!this.enabled) return;

        for (const entity of this.entities) {
            if (entity.active) {
                this.updateEntity(entity, deltaTime);
            }
        }
    }

    // Métodos para sobrescribir en sistemas específicos
    onEntityAdded(entity) {}
    onEntityRemoved(entity) {}
    updateEntity(entity, deltaTime) {}
}
