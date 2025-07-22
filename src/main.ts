import './style.css';
import { Game } from './Game';
import * as THREE from 'three';

// Initialize the game
const game = new Game();

// Start the game
game.start();

// Load the user's specific assets
async function loadGameAssets() {
  try {
    console.log('🎮 Loading game assets...');
    
    // Load the Minecraft world as terrain replacement
    console.log('🏔️ Loading Minecraft world terrain...');
    await game.replaceTerrainWithModel('./models/minecraft.glb');
    
    // Load the sky panoramic texture
    console.log('🌅 Loading sky texture...');
    await game.loadSkyboxTexture('./textures/sky.png');
    
    console.log('✅ All game assets loaded successfully!');
    console.log('🎯 Game ready! Click to lock cursor and use WASD to explore your Minecraft world!');
    
  } catch (error) {
    console.error('❌ Failed to load some game assets:', error);
    console.log('🔧 Troubleshooting:');
    console.log('  - Make sure minecraft.glb is in public/models/');
    console.log('  - Make sure sky.png is in public/textures/');
    console.log('  - Check browser console for detailed errors');
  }
}

// Example of how to add more models later:
async function loadAdditionalModels() {
  try {
    // Example: Add buildings or props to your Minecraft world
    // await game.loadWorldModel('./models/house.glb', new THREE.Vector3(10, 0, 10), new THREE.Vector3(1, 1, 1));
    // await game.loadWorldModel('./models/tree.glb', new THREE.Vector3(-15, 0, 5), new THREE.Vector3(2, 2, 2));
    
    // Example: Load jump sound (if you add one)
    // await game.loadJumpSound('./sounds/jump.mp3');
  } catch (error) {
    console.error('❌ Failed to load additional models:', error);
  }
}

// Load assets after a short delay to let the game initialize
setTimeout(loadGameAssets, 1000);

// Handle page visibility changes (pause/resume)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('⏸️ Game paused (tab hidden)');
  } else {
    console.log('▶️ Game resumed (tab visible)');
  }
});

// Handle errors gracefully
window.addEventListener('error', (event) => {
  console.error('💥 Game error:', event.error);
  alert('A game error occurred. Check the console for details.');
});

console.log('🧟 Zombie Survival 3D - Starting...');
console.log('📁 Your assets:');
console.log('  🏔️ Minecraft world: public/models/minecraft.glb');
console.log('  🌌 Sky texture: public/textures/sky.png');
console.log('  🔊 Jump sound: Synthetic (built-in)');
console.log('');
console.log('🎮 Ready to explore your Minecraft zombie survival world!');
