import './style.css';
import { Game } from './Game';
import * as THREE from 'three';

// Initialize the game
const game = new Game();

// Start the game
game.start();

// Example usage - You can uncomment and modify these when you have your GLB files
async function loadGameAssets() {
  try {
    // Example: Load a terrain model (replace with your GLB file path)
    // await game.replaceTerrainWithModel('./models/terrain.glb');
    
    // Example: Load additional world objects
    // await game.loadWorldModel('./models/house.glb', new THREE.Vector3(10, 0, 10), new THREE.Vector3(1, 1, 1));
    // await game.loadWorldModel('./models/tree.glb', new THREE.Vector3(-15, 0, 5), new THREE.Vector3(2, 2, 2));
    
    // Example: Load skybox texture (single panoramic image)
    // await game.loadSkyboxTexture('./textures/skybox.jpg');
    
    // Example: Load cubemap skybox (6 separate images)
    // await game.loadCubemapSkybox({
    //   px: './textures/skybox/px.jpg', // positive X
    //   nx: './textures/skybox/nx.jpg', // negative X
    //   py: './textures/skybox/py.jpg', // positive Y
    //   ny: './textures/skybox/ny.jpg', // negative Y
    //   pz: './textures/skybox/pz.jpg', // positive Z
    //   nz: './textures/skybox/nz.jpg'  // negative Z
    // });
    
    // Example: Load jump sound (replace with your audio file)
    // await game.loadJumpSound('./sounds/jump.mp3');
    
    console.log('🎮 Game assets loaded successfully!');
  } catch (error) {
    console.error('❌ Failed to load some game assets:', error);
    console.log('ℹ️ This is normal if you haven\'t added GLB files yet');
  }
}

// Load assets after a short delay to let the game initialize
setTimeout(loadGameAssets, 1000);

// Handle page visibility changes (pause/resume)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('Game paused (tab hidden)');
  } else {
    console.log('Game resumed (tab visible)');
  }
});

// Handle errors gracefully
window.addEventListener('error', (event) => {
  console.error('Game error:', event.error);
  alert('A game error occurred. Check the console for details.');
});

console.log('🧟 Zombie Survival 3D - Starting...');
console.log('📁 To add your models:');
console.log('  1. Put GLB files in zombies/public/models/');
console.log('  2. Put textures in zombies/public/textures/');
console.log('  3. Put sounds in zombies/public/sounds/');
console.log('  4. Uncomment the loading code in main.ts');
console.log('  5. Update the file paths to match your files');
