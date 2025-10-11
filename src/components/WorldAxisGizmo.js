// WorldAxisGizmo - Componente para ejes de debug anclados a la cámara
class WorldAxisGizmo extends Component {
    constructor() {
        super();
        this.viewportPosition = new Vec3(0.85, 0.85, 0); // Posición normalizada en viewport (0-1)
        this.scale = 0.1; // Escala del gizmo
    }

    // Calcular posición en espacio de vista (relativa a la cámara)
    getViewSpacePosition(camera, aspectRatio) {
        // Convertir de posición de viewport (0-1) a espacio de clip
        const clipX = (this.viewportPosition.x * 2 - 1) * aspectRatio;
        const clipY = this.viewportPosition.y * 2 - 1;
        const clipZ = -2; // Profundidad fija delante de la cámara

        return new Vec3(clipX, clipY, clipZ);
    }
}
