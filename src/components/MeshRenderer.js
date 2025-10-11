// MeshRenderer - Componente de renderizado de malla
class MeshRenderer extends Component {
    constructor(mesh = null) {
        super();
        this.mesh = mesh; // Referencia a la geometría
        this.material = null; // Material/shader (futuro)
        this.visible = true;
    }

    setMesh(mesh) {
        this.mesh = mesh;
    }

    setVisible(visible) {
        this.visible = visible;
    }
}
