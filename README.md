# 🧟 Zombie Survival 3D

> A Three.js-powered zombie survival game inspired by 7 Days to Die, built with TypeScript and Vite

![Game Status](https://img.shields.io/badge/Status-In%20Development-orange)
![Three.js](https://img.shields.io/badge/Three.js-r170-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![Vite](https://img.shields.io/badge/Vite-7.0-purple)

## 🎮 Features

### ✅ Core Systems Implemented
- **🌍 3D World System** - GLB model loading with full Blender support
- **👤 First-Person Controls** - WASD movement + mouse look with pointer lock
- **🌅 Dynamic Day/Night Cycle** - 2-minute days with beautiful lighting transitions
- **🎨 Advanced Skybox System** - Panoramic and cubemap skybox support
- **🔊 3D Audio System** - Spatial audio with Web Audio API
- **⚡ Physics System** - Gravity, collision detection, and jumping mechanics
- **💾 Model Loading** - Automatic GLB/GLTF loading with animations and shadows

### 🚧 Planned Features
- **🧟 Zombie AI** - Intelligent zombie behavior and pathfinding
- **🏗️ Building System** - Block placement and destruction mechanics
- **🎒 Inventory System** - Resource management and crafting
- **💰 Survival Mechanics** - Health, hunger, and resource gathering
- **🔫 Combat System** - Weapons and zombie combat mechanics

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the repository
cd zombies

# Install dependencies
npm install

# Start development server
npm run dev
```

### 🎯 Controls
| Control | Action |
|---------|--------|
| **WASD** | Move around |
| **Mouse** | Look around |
| **Space** | Jump |
| **Click** | Lock mouse cursor |
| **Esc** | Unlock cursor |

## 📁 Project Structure

```
zombies/
├── src/
│   ├── Game.ts           # Main game orchestrator
│   ├── Player.ts         # First-person player controller
│   ├── World.ts          # 3D world and model management
│   ├── GameTime.ts       # Day/night cycle system
│   ├── SkyboxManager.ts  # Dynamic skybox rendering
│   ├── AudioManager.ts   # 3D audio system
│   ├── ModelLoader.ts    # GLB/GLTF model loading
│   └── main.ts           # Entry point and asset loading
├── public/
│   ├── models/           # GLB/GLTF 3D models
│   │   └── minecraft.glb # 🎮 Minecraft world terrain
│   ├── textures/         # Skybox and material textures
│   │   └── sky.png       # 🌅 Sky panoramic texture
│   └── sounds/           # Audio files (.mp3, .wav, .ogg)
└── package.json
```

## 🎨 Asset Pipeline

### 🏗️ 3D Models (GLB/GLTF)
- **Blender Export**: Use GLB format for best compatibility
- **Automatic Features**: Shadows, materials, and animations preserved
- **World Models**: Large terrain/environment models (like minecraft.glb)
- **Prop Models**: Buildings, vehicles, decorations

### 🌅 Skyboxes
- **Panoramic**: Single equirectangular image (like sky.png)
- **Cubemap**: 6 separate images for higher quality
- **Dynamic**: Automatically tinted based on time of day

### 🔊 Audio
- **Formats**: MP3, WAV, OGG supported
- **3D Spatial**: Positional audio with distance falloff
- **Synthetic**: Procedural sound generation for effects

## ⚙️ Technical Architecture

### 🏗️ Core Systems
```typescript
Game                    // Central coordinator
├── Player             // First-person controller + audio
├── World              // 3D scene + model management  
├── GameTime           // Day/night cycle + lighting
└── SkyboxManager      // Dynamic sky rendering
```

### 📦 Key Technologies
- **Three.js r170** - 3D rendering engine
- **GLTFLoader** - 3D model loading (.glb/.gltf)
- **Web Audio API** - High-performance 3D audio
- **Pointer Lock API** - First-person mouse controls
- **TypeScript** - Type-safe development
- **Vite** - Fast build system and dev server

## 🎮 Current World

The game currently loads:
- **🏔️ Minecraft World** (`minecraft.glb`) - Complete 3D terrain replacing default ground
- **🌌 Sky Panorama** (`sky.png`) - Beautiful skybox with day/night transitions
- **🔊 Jump Audio** - Synthetic jump sound effects

## 🔧 Development

### Adding New Models
```typescript
// Load terrain replacement
await game.replaceTerrainWithModel('./models/your-world.glb');

// Add props and buildings
await game.loadWorldModel('./models/house.glb', 
  new THREE.Vector3(x, y, z),    // position
  new THREE.Vector3(sx, sy, sz)  // scale
);
```

### Custom Skyboxes
```typescript
// Panoramic skybox
await game.loadSkyboxTexture('./textures/your-sky.png');

// Cubemap skybox (6 images)
await game.loadCubemapSkybox({
  px: './textures/right.jpg',  nx: './textures/left.jpg',
  py: './textures/top.jpg',    ny: './textures/bottom.jpg',
  pz: './textures/front.jpg',  nz: './textures/back.jpg'
});
```

### Audio Integration
```typescript
// Load custom sounds
await game.loadJumpSound('./sounds/jump.mp3');

// Play sounds with 3D positioning
audioManager.playSound('soundName', volume, pitch);
```

## 🛠️ Build Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🎯 Roadmap

### Phase 1: Foundation ✅
- [x] 3D world rendering
- [x] First-person controls
- [x] Day/night cycle
- [x] GLB model loading
- [x] Skybox system
- [x] Basic audio

### Phase 2: Zombies 🚧
- [ ] Zombie 3D models and animations
- [ ] Basic AI pathfinding
- [ ] Zombie spawning system
- [ ] Player health and damage

### Phase 3: Survival 📋
- [ ] Building and block system
- [ ] Inventory management
- [ ] Resource gathering
- [ ] Crafting mechanics

### Phase 4: Combat 🎯
- [ ] Weapon system
- [ ] Combat mechanics
- [ ] Zombie varieties
- [ ] Base defense

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📜 License

MIT License - feel free to use this code for learning and projects!

## 🎮 Credits

Built with passion for zombie survival games and modern web technologies. Inspired by the incredible gameplay of 7 Days to Die.

---

**🧟 Ready to survive the apocalypse? Start the game and explore your Minecraft world!** 