// Entity - Entidad base del sistema ECS
class Entity {
    static nextId = 0;

    constructor(name = 'Entity') {
        this.id = Entity.nextId++;
        this.name = name;
        this.components = new Map(); // Map<ComponentType, Component>
        this.active = true;
        this.world = null; // Referencia al mundo
    }

    // Añadir componente
    addComponent(component) {
        const type = component.constructor.name;
        this.components.set(type, component);
        component.entity = this;

        // Re-registrar en los sistemas del mundo si existe
        if (this.world) {
            for (const system of this.world.systems) {
                system.registerEntity(this);
            }
        }

        return this;
    }

    // Obtener componente por tipo
    getComponent(ComponentType) {
        const type = ComponentType.name;
        return this.components.get(type);
    }

    // Verificar si tiene componente
    hasComponent(ComponentType) {
        const type = ComponentType.name;
        return this.components.has(type);
    }

    // Remover componente
    removeComponent(ComponentType) {
        const type = ComponentType.name;
        const component = this.components.get(type);
        if (component) {
            component.entity = null;
            this.components.delete(type);
        }
        return this;
    }

    // Obtener todos los componentes
    getAllComponents() {
        return Array.from(this.components.values());
    }

    // Destruir entidad
    destroy() {
        this.components.clear();
        this.active = false;
    }
}
