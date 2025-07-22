import * as THREE from 'three';
import { Player } from './Player';
import { World } from './World';
import { GameTime } from './GameTime';

export class Game {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private player: Player;
  private world: World;
  private gameTime: GameTime;
  private isRunning: boolean = false;

  constructor() {
    // Initialize Three.js components
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x87CEEB, 10, 100);
    
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Add renderer to DOM
    const container = document.getElementById('gameContainer');
    if (container) {
      container.appendChild(this.renderer.domElement);
    }

    // Initialize game systems
    this.world = new World(this.scene);
    this.player = new Player(this.camera, this.scene);
    this.gameTime = new GameTime(this.scene);

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.gameLoop();
    console.log('🧟 Zombie Survival Game Started!');
  }

  public stop(): void {
    this.isRunning = false;
  }

  private gameLoop(): void {
    if (!this.isRunning) return;

    requestAnimationFrame(() => this.gameLoop());

    // Update all game systems
    const deltaTime = 0.016; // ~60fps
    
    this.player.update(deltaTime);
    this.gameTime.update(deltaTime);
    this.updateUI();

    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }

  private updateUI(): void {
    const healthElement = document.getElementById('health');
    const timeElement = document.getElementById('gameTime');
    
    if (healthElement) {
      healthElement.textContent = this.player.getHealth().toString();
    }
    
    if (timeElement) {
      timeElement.textContent = this.gameTime.getTimeOfDay();
    }
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
} 