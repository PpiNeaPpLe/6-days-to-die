import './style.css';
import { Game } from './Game';

// Initialize the game
const game = new Game();

// Start the game
game.start();

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
