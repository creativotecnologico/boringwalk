// Component - Componente base del sistema ECS
class Component {
    constructor() {
        this.entity = null; // Referencia a la entidad propietaria
        this.enabled = true;
    }

    // Llamado cuando el componente es añadido a una entidad
    onAttach() {}

    // Llamado cuando el componente es removido de una entidad
    onDetach() {}

    // Llamado cada frame si está habilitado
    update(deltaTime) {}
}
