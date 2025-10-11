// Collider - Componente de colisión
class Collider extends Component {
    constructor(type = 'box') {
        super();
        this.type = type; // 'box', 'sphere', 'capsule', 'mesh'
        this.bounds = null; // Límites de colisión
    }
}
