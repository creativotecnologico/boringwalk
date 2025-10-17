// Script de prueba para verificar la carga de shaders

async function testShaderLoading() {
    console.log('=== Test de Carga de Shaders ===\n');
    
    const apis = ['webgl', 'webgl2', 'webgpu'];
    
    for (const api of apis) {
        console.log(`\n--- Testing ${api.toUpperCase()} ---`);
        
        try {
            // Cargar list.json
            const response = await fetch(`../shaders/${api}/list.json`);
            if (!response.ok) {
                throw new Error(`No se pudo cargar list.json`);
            }
            
            const shaderList = await response.json();
            console.log(`✓ list.json cargado: ${shaderList.shaders?.length || 0} shaders definidos`);
            
            if (shaderList.shaders && shaderList.shaders.length > 0) {
                for (const shader of shaderList.shaders) {
                    console.log(`\n  Shader: ${shader.name}`);
                    console.log(`  Descripción: ${shader.description}`);
                    console.log(`  Vertex: ${shader.vertex}`);
                    console.log(`  Fragment: ${shader.fragment}`);
                    console.log(`  Uniforms: ${shader.uniforms.join(', ')}`);
                    console.log(`  Attributes: ${shader.attributes.join(', ')}`);
                    
                    // Intentar cargar los archivos
                    try {
                        const vertResponse = await fetch(`../shaders/${api}/${shader.vertex}`);
                        const fragResponse = await fetch(`../shaders/${api}/${shader.fragment}`);
                        
                        if (vertResponse.ok && fragResponse.ok) {
                            const vertSource = await vertResponse.text();
                            const fragSource = await fragResponse.text();
                            console.log(`  ✓ Archivos cargados (${vertSource.length + fragSource.length} bytes)`);
                        } else {
                            console.log(`  ✗ Error al cargar archivos`);
                        }
                    } catch (error) {
                        console.log(`  ✗ Error: ${error.message}`);
                    }
                }
            } else {
                console.log('  (Sin shaders definidos)');
            }
            
        } catch (error) {
            console.log(`✗ Error: ${error.message}`);
        }
    }
    
    console.log('\n=== Test Completado ===');
}

// Ejecutar test si se carga la página
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        // Agregar botón de test a la página
        const button = document.createElement('button');
        button.textContent = 'Test Shader Loading';
        button.style.position = 'fixed';
        button.style.top = '10px';
        button.style.right = '10px';
        button.style.zIndex = '10000';
        button.style.padding = '10px';
        button.onclick = testShaderLoading;
        document.body.appendChild(button);
    });
}
