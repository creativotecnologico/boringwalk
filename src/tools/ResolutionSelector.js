// Resolution Selector - UI Helper para cambiar resoluciones

class ResolutionSelector {
    constructor(engine, textCanvas = null) {
        this.engine = engine;
        this.textCanvas = textCanvas;
        this.element = null;
        this.createUI();
    }

    createUI() {
        // Crear contenedor
        const container = document.createElement('div');
        container.id = 'resolution-selector';
        container.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
        `;

        // Título
        const title = document.createElement('div');
        title.textContent = '🖥️ Resolución';
        title.style.marginBottom = '5px';
        title.style.fontWeight = 'bold';
        container.appendChild(title);

        // Select de resoluciones
        const select = document.createElement('select');
        select.style.cssText = `
            width: 100%;
            padding: 5px;
            background: #333;
            color: white;
            border: 1px solid #555;
            border-radius: 3px;
            cursor: pointer;
        `;

        // Añadir opciones
        const resolutions = this.engine.getAvailableResolutions();
        resolutions.forEach(res => {
            if (res.key === 'custom') return; // Omitir custom del selector
            
            const option = document.createElement('option');
            option.value = res.key;
            option.textContent = res.label;
            option.selected = (res.key === this.engine.currentResolution);
            select.appendChild(option);
        });

        // Event listener
        select.addEventListener('change', (e) => {
            this.changeResolution(e.target.value);
        });

        container.appendChild(select);

        // Info adicional
        const info = document.createElement('div');
        info.style.marginTop = '5px';
        info.style.fontSize = '10px';
        info.style.opacity = '0.7';
        info.id = 'resolution-info';
        this.updateInfo(info);
        container.appendChild(info);

        // Botón de toggle
        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = '−';
        toggleBtn.style.cssText = `
            position: absolute;
            top: 5px;
            right: 5px;
            background: transparent;
            color: white;
            border: none;
            cursor: pointer;
            font-size: 16px;
            padding: 0;
            width: 20px;
            height: 20px;
        `;
        toggleBtn.addEventListener('click', () => this.toggle());
        container.appendChild(toggleBtn);

        document.body.appendChild(container);
        this.element = container;
        this.infoElement = info;
        this.toggleBtn = toggleBtn;
    }

    changeResolution(resolutionKey) {
        this.engine.setResolution(resolutionKey, this.textCanvas);
        this.updateInfo(this.infoElement);
        console.log(`✓ Resolución cambiada a: ${this.engine.getResolution().label}`);
    }

    updateInfo(element) {
        const res = this.engine.getResolution();
        const aspect = this.engine.getAspectRatio().toFixed(3);
        element.textContent = `${res.width}x${res.height} (${aspect}:1)`;
    }

    toggle() {
        const content = this.element.querySelectorAll('div, select');
        const isHidden = content[0].style.display === 'none';
        
        content.forEach(el => {
            el.style.display = isHidden ? 'block' : 'none';
        });
        
        this.toggleBtn.textContent = isHidden ? '−' : '+';
    }

    destroy() {
        if (this.element) {
            this.element.remove();
        }
    }
}

// Uso:
// const selector = new ResolutionSelector(engine, textCanvas);
