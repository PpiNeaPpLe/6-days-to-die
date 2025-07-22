import * as THREE from 'three';
import { Player } from './Player';
import { World } from './World';
import { GameTime } from './GameTime';
import { SkyboxManager } from './SkyboxManager';

export class Game {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private player: Player;
  private world: World;
  private gameTime: GameTime;
  private skyboxManager: SkyboxManager;
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
    this.skyboxManager = new SkyboxManager(this.scene);

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

  // Public methods for loading content
  public async loadWorldModel(modelPath: string, position?: THREE.Vector3, scale?: THREE.Vector3): Promise<THREE.Group> {
    return this.world.loadWorldModel(modelPath, position, scale);
  }

  public async replaceTerrainWithModel(modelPath: string): Promise<THREE.Group> {
    return this.world.replaceGroundWithModel(modelPath);
  }

  public async loadSkyboxTexture(texturePath: string): Promise<void> {
    return this.skyboxManager.loadSkyboxTexture(texturePath);
  }

  public async loadCubemapSkybox(paths: {
    px: string; nx: string; py: string; 
    ny: string; pz: string; nz: string;
  }): Promise<void> {
    return this.skyboxManager.loadCubemapSkybox(paths);
  }

  public async loadJumpSound(audioPath: string): Promise<void> {
    const audioManager = this.player.getAudioManager();
    return audioManager.loadSound('jump', audioPath);
  }

  private gameLoop(): void {
    if (!this.isRunning) return;

    requestAnimationFrame(() => this.gameLoop());

    // Update all game systems
    const deltaTime = 0.016; // ~60fps
    
    this.player.update(deltaTime);
    this.gameTime.update(deltaTime);
    
    // Update skybox based on time of day
    this.skyboxManager.updateSkyColor(this.gameTime.getCurrentTime());
    
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

  // Utility methods for development
  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getWorld(): World {
    return this.world;
  }

  public getPlayer(): Player {
    return this.player;
  }
} 