// TextureManager - Gestiona la carga y manejo de texturas WebGL
class TextureManager {
    constructor(gl) {
        this.gl = gl;
        this.textures = new Map(); // Cachear texturas por nombre
    }

    // Cargar textura desde URL
    loadTexture(url, name) {
        const gl = this.gl;

        // Crear textura WebGL
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Imagen temporal de 1 píxel mientras carga
        const pixel = new Uint8Array([200, 200, 200, 255]); // Gris
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        // Cargar imagen real
        const image = new Image();
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

            // Verificar si es potencia de 2
            if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
                // Generar mipmaps para mejor calidad
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            } else {
                // No potencia de 2: usar filtrado simple
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            }

            // Filtro de magnificación
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

            console.log(`Textura cargada: ${name} (${image.width}x${image.height})`);
        };

        image.onerror = () => {
            console.error(`Error cargando textura: ${url}`);
        };

        image.src = url;

        // Guardar en caché
        this.textures.set(name, texture);
        return texture;
    }

    // Obtener textura por nombre
    getTexture(name) {
        return this.textures.get(name);
    }

    // Verificar si un número es potencia de 2
    isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }

    // Cargar imagen y obtener píxeles (para height maps)
    loadImageData(url, callback) {
        const image = new Image();
        image.onload = () => {
            // Crear canvas temporal para leer píxeles
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);

            // Obtener datos de píxeles
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            callback(imageData);
        };

        image.onerror = () => {
            console.error(`Error cargando imagen para height map: ${url}`);
            callback(null);
        };

        image.src = url;
    }

    // Enlazar textura a una unidad de textura
    bindTexture(name, textureUnit = 0) {
        const gl = this.gl;
        const texture = this.textures.get(name);

        if (texture) {
            gl.activeTexture(gl.TEXTURE0 + textureUnit);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            return true;
        }

        console.warn(`Textura no encontrada: ${name}`);
        return false;
    }
}
