import React, { useEffect, useRef, useState } from 'react';
import { Camera, Maximize2, Navigation } from 'lucide-react';

// Utilidad para crear noise determinista
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }
  
  random() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

class Noise {
  constructor(seed) {
    this.seed = seed;
    this.p = [];
    const rng = new SeededRandom(seed);
    
    for (let i = 0; i < 256; i++) {
      this.p[i] = Math.floor(rng.random() * 256);
    }
    for (let i = 0; i < 256; i++) {
      this.p[256 + i] = this.p[i];
    }
  }
  
  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  
  lerp(t, a, b) {
    return a + t * (b - a);
  }
  
  grad(hash, x, y) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }
  
  perlin2(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    
    const u = this.fade(x);
    const v = this.fade(y);
    
    const a = this.p[X] + Y;
    const aa = this.p[a];
    const ab = this.p[a + 1];
    const b = this.p[X + 1] + Y;
    const ba = this.p[b];
    const bb = this.p[b + 1];
    
    return this.lerp(v,
      this.lerp(u, this.grad(this.p[aa], x, y), this.grad(this.p[ba], x - 1, y)),
      this.lerp(u, this.grad(this.p[ab], x, y - 1), this.grad(this.p[bb], x - 1, y - 1))
    );
  }
}

// FBM (Fractal Brownian Motion)
function fbm(noise, x, y, octaves, persistence = 0.5) {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;
  
  for (let i = 0; i < octaves; i++) {
    total += noise.perlin2(x * frequency, y * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= 2;
  }
  
  return total / maxValue;
}

// Definición de biomas
const BIOMES = {
  DEEP_OCEAN: { 
    name: 'Océano Profundo', 
    color: '#1a4d7a',
    minHeight: -50,
    maxHeight: -20
  },
  OCEAN: { 
    name: 'Océano', 
    color: '#2980b9',
    minHeight: -20,
    maxHeight: -5
  },
  BEACH: { 
    name: 'Playa', 
    color: '#f4d03f',
    minHeight: -5,
    maxHeight: 2
  },
  PLAINS: { 
    name: 'Llanura', 
    color: '#52c234',
    minHeight: 2,
    maxHeight: 15
  },
  FOREST: { 
    name: 'Bosque', 
    color: '#27ae60',
    minHeight: 15,
    maxHeight: 35
  },
  HILLS: { 
    name: 'Colinas', 
    color: '#7f8c8d',
    minHeight: 35,
    maxHeight: 60
  },
  MOUNTAINS: { 
    name: 'Montañas', 
    color: '#95a5a6',
    minHeight: 60,
    maxHeight: 100
  },
  SNOW_PEAKS: { 
    name: 'Picos Nevados', 
    color: '#ecf0f1',
    minHeight: 100,
    maxHeight: 150
  }
};

function getBiome(height) {
  for (const biome of Object.values(BIOMES)) {
    if (height >= biome.minHeight && height < biome.maxHeight) {
      return biome;
    }
  }
  return BIOMES.SNOW_PEAKS;
}

class ChunkGenerator {
  constructor(seed, chunkSize = 32) {
    this.seed = seed;
    this.chunkSize = chunkSize;
    this.heightNoise = new Noise(seed);
    this.biomeNoise = new Noise(seed + 1000);
    this.detailNoise = new Noise(seed + 2000);
  }
  
  generateChunk(chunkX, chunkZ) {
    const size = this.chunkSize;
    const heightMap = [];
    const biomeMap = [];
    
    for (let z = 0; z < size; z++) {
      for (let x = 0; x < size; x++) {
        const worldX = (chunkX * size + x) / 100;
        const worldZ = (chunkZ * size + z) / 100;
        
        // Generar valor de bioma (escala grande)
        const biomeValue = fbm(this.biomeNoise, worldX * 0.3, worldZ * 0.3, 3);
        
        // Altura base según bioma
        let height;
        
        if (biomeValue < -0.4) {
          // Océano profundo
          height = fbm(this.heightNoise, worldX, worldZ, 2) * 20 - 35;
        } else if (biomeValue < -0.2) {
          // Océano
          height = fbm(this.heightNoise, worldX, worldZ, 2) * 10 - 12;
        } else if (biomeValue < -0.05) {
          // Playa/Costa
          height = fbm(this.heightNoise, worldX, worldZ, 2) * 5 - 2;
        } else if (biomeValue < 0.2) {
          // Llanuras
          height = fbm(this.heightNoise, worldX, worldZ, 3) * 12 + 5;
        } else if (biomeValue < 0.4) {
          // Bosque/Colinas
          height = fbm(this.heightNoise, worldX, worldZ, 4) * 25 + 20;
        } else if (biomeValue < 0.6) {
          // Montañas medianas
          const base = fbm(this.heightNoise, worldX, worldZ, 5);
          height = Math.pow(Math.abs(base), 1.5) * 70 + 30;
        } else {
          // Montañas altas
          const base = fbm(this.heightNoise, worldX, worldZ, 6);
          height = Math.pow(Math.abs(base), 1.2) * 100 + 50;
        }
        
        // Añadir detalle fino
        const detail = fbm(this.detailNoise, worldX * 4, worldZ * 4, 2) * 3;
        height += detail;
        
        heightMap.push(height);
        biomeMap.push(getBiome(height));
      }
    }
    
    return { heightMap, biomeMap };
  }
}

const TerrainChunkSystem = () => {
  const canvasRef = useRef(null);
  const [seed, setSeed] = useState(12345);
  const [viewDistance, setViewDistance] = useState(3);
  const [playerPos, setPlayerPos] = useState({ x: 0, z: 0 });
  const [chunks, setChunks] = useState(new Map());
  const [stats, setStats] = useState({ loaded: 0, generated: 0 });
  const generatorRef = useRef(null);
  
  useEffect(() => {
    generatorRef.current = new ChunkGenerator(seed, 32);
    setChunks(new Map());
    setStats({ loaded: 0, generated: 0 });
  }, [seed]);
  
  useEffect(() => {
    if (!generatorRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const chunkSize = 32;
    const cellSize = 4;
    
    // Calcular chunks visibles
    const playerChunkX = Math.floor(playerPos.x / chunkSize);
    const playerChunkZ = Math.floor(playerPos.z / chunkSize);
    
    const newChunks = new Map();
    let generated = 0;
    
    // Generar chunks en rango
    for (let cz = playerChunkZ - viewDistance; cz <= playerChunkZ + viewDistance; cz++) {
      for (let cx = playerChunkX - viewDistance; cx <= playerChunkX + viewDistance; cx++) {
        const key = `${cx},${cz}`;
        
        if (chunks.has(key)) {
          newChunks.set(key, chunks.get(key));
        } else {
          const chunk = generatorRef.current.generateChunk(cx, cz);
          newChunks.set(key, chunk);
          generated++;
        }
      }
    }
    
    setChunks(newChunks);
    setStats({ loaded: newChunks.size, generated: stats.generated + generated });
    
    // Renderizar
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    for (const [key, chunk] of newChunks) {
      const [cx, cz] = key.split(',').map(Number);
      
      for (let z = 0; z < chunkSize; z++) {
        for (let x = 0; x < chunkSize; x++) {
          const idx = z * chunkSize + x;
          const biome = chunk.biomeMap[idx];
          
          const screenX = centerX + (cx * chunkSize + x - playerPos.x) * cellSize;
          const screenY = centerY + (cz * chunkSize + z - playerPos.z) * cellSize;
          
          ctx.fillStyle = biome.color;
          ctx.fillRect(screenX, screenY, cellSize, cellSize);
        }
      }
    }
    
    // Dibujar jugador
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Dibujar grid de chunks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let cz = playerChunkZ - viewDistance; cz <= playerChunkZ + viewDistance + 1; cz++) {
      for (let cx = playerChunkX - viewDistance; cx <= playerChunkX + viewDistance + 1; cx++) {
        const screenX = centerX + (cx * chunkSize - playerPos.x) * cellSize;
        const screenY = centerY + (cz * chunkSize - playerPos.z) * cellSize;
        ctx.strokeRect(screenX, screenY, chunkSize * cellSize, chunkSize * cellSize);
      }
    }
    
  }, [playerPos, viewDistance, chunks, seed]);
  
  const handleKeyDown = (e) => {
    const speed = e.shiftKey ? 5 : 1;
    
    switch(e.key) {
      case 'w':
      case 'ArrowUp':
        setPlayerPos(p => ({ ...p, z: p.z - speed }));
        break;
      case 's':
      case 'ArrowDown':
        setPlayerPos(p => ({ ...p, z: p.z + speed }));
        break;
      case 'a':
      case 'ArrowLeft':
        setPlayerPos(p => ({ ...p, x: p.x - speed }));
        break;
      case 'd':
      case 'ArrowRight':
        setPlayerPos(p => ({ ...p, x: p.x + speed }));
        break;
    }
  };
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return (
    <div className="w-full h-full bg-gray-900 text-white p-4 flex flex-col gap-4">
      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Navigation className="w-6 h-6" />
          Sistema de Generación de Chunks con Biomas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm mb-2">Seed del Mundo</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                className="flex-1 bg-gray-700 rounded px-3 py-2"
              />
              <button
                onClick={() => setSeed(Math.floor(Math.random() * 1000000))}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              >
                Aleatorio
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm mb-2">Distancia de Visión: {viewDistance} chunks</label>
            <input
              type="range"
              min="1"
              max="8"
              value={viewDistance}
              onChange={(e) => setViewDistance(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="flex flex-col justify-center">
            <div className="text-sm text-gray-400">Chunks cargados: {stats.loaded}</div>
            <div className="text-sm text-gray-400">Chunks generados: {stats.generated}</div>
            <div className="text-sm text-gray-400">
              Posición: X:{Math.floor(playerPos.x)} Z:{Math.floor(playerPos.z)}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-700 rounded p-3 text-sm">
          <strong>Controles:</strong> WASD o Flechas para mover | Shift + Tecla para mover más rápido
        </div>
      </div>
      
      <div className="flex-1 bg-gray-800 rounded-lg p-4 flex gap-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="bg-black rounded border-2 border-gray-700 flex-1"
        />
        
        <div className="w-48 bg-gray-700 rounded p-4 overflow-y-auto">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Maximize2 className="w-4 h-4" />
            Biomas
          </h3>
          {Object.entries(BIOMES).map(([key, biome]) => (
            <div key={key} className="mb-3 text-sm">
              <div className="flex items-center gap-2 mb-1">
                <div 
                  className="w-6 h-6 rounded border border-gray-500"
                  style={{ backgroundColor: biome.color }}
                />
                <span className="font-medium">{biome.name}</span>
              </div>
              <div className="text-xs text-gray-400 ml-8">
                {biome.minHeight}m - {biome.maxHeight}m
              </div>
            </div>
          ))}
          
          <div className="mt-6 pt-4 border-t border-gray-600">
            <h4 className="font-bold mb-2 text-sm">Características:</h4>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• Generación procedural</li>
              <li>• 8 biomas únicos</li>
              <li>• Transiciones suaves</li>
              <li>• Chunks infinitos</li>
              <li>• Carga/descarga automática</li>
              <li>• Sistema determinista</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-3">
        <details className="text-sm">
          <summary className="cursor-pointer font-bold mb-2">ℹ️ Información Técnica</summary>
          <div className="text-gray-300 space-y-2 mt-2">
            <p><strong>Sistema de Chunks:</strong> Cada chunk es de 32×32 celdas. Se generan dinámicamente según la posición del jugador.</p>
            <p><strong>Generación de Biomas:</strong> Usa múltiples capas de Perlin noise con diferentes frecuencias y amplitudes.</p>
            <p><strong>Optimización:</strong> Solo se mantienen chunks dentro del rango de visión. Los distantes se descargan automáticamente.</p>
            <p><strong>Determinismo:</strong> El mismo seed siempre genera el mismo mundo, perfecto para multijugador.</p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default TerrainChunkSystem;