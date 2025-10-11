// World - Gestiona todas las entidades y sistemas del ECS
class World {
    constructor() {
        this.entities = [];
        this.systems = [];
    }

    // Crear una nueva entidad
    createEntity(name) {
        const entity = new Entity(name);
        entity.world = this; // Asignar referencia al mundo
        this.entities.push(entity);

        // Registrar la entidad en todos los sistemas
        for (const system of this.systems) {
            system.registerEntity(entity);
        }

        return entity;
    }

    // Eliminar una entidad
    destroyEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
            // Desregistrar de todos los sistemas
            for (const system of this.systems) {
                system.unregisterEntity(entity);
            }

            entity.destroy();
            this.entities.splice(index, 1);
        }
    }

    // Añadir un sistema
    addSystem(system) {
        this.systems.push(system);

        // Registrar todas las entidades existentes en el nuevo sistema
        for (const entity of this.entities) {
            system.registerEntity(entity);
        }

        return system;
    }

    // Obtener sistema por tipo
    getSystem(SystemType) {
        return this.systems.find(s => s instanceof SystemType);
    }

    // Actualizar todos los sistemas
    update(deltaTime) {
        for (const system of this.systems) {
            system.update(deltaTime);
        }
    }

    // Obtener todas las entidades con ciertos componentes
    getEntitiesWithComponents(...ComponentTypes) {
        return this.entities.filter(entity =>
            ComponentTypes.every(ComponentType => entity.hasComponent(ComponentType))
        );
    }

    // Limpiar el mundo
    clear() {
        for (const entity of this.entities) {
            entity.destroy();
        }
        this.entities = [];
        this.systems = [];
    }
}
