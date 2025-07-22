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
    this.scene.fog = new THREE.Fog(0x87CEEB, 20, 300); // Much larger fog distance for 30x world
    
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

    // Initialize game systems (order matters!)
    this.world = new World(this.scene);
    this.player = new Player(this.camera, this.scene, this.world); // Pass world to player
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
    const terrainModel = await this.world.replaceGroundWithModel(modelPath);
    
    // After terrain loads, set player spawn position
    setTimeout(() => {
      const spawnPosition = this.world.findSpawnPosition();
      this.player.setSpawnPosition(spawnPosition);
      console.log('🎯 Player respawned on terrain');
    }, 500); // Small delay to ensure model is fully processed
    
    return terrainModel;
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

    // Show player position and rotation
    const playerPos = this.player.getPosition();
    const yaw = this.player.getYaw();
    const pitch = this.player.getPitch();
    
    const positionInfo = `X: ${playerPos.x.toFixed(1)}, Y: ${playerPos.y.toFixed(1)}, Z: ${playerPos.z.toFixed(1)}`;
    const rotationInfo = `Yaw: ${(yaw * 180 / Math.PI).toFixed(0)}°, Pitch: ${(pitch * 180 / Math.PI).toFixed(0)}°`;
    
    // Update or create position display
    let posElement = document.getElementById('position');
    if (!posElement) {
      posElement = document.createElement('div');
      posElement.id = 'position';
      document.getElementById('ui')?.appendChild(posElement);
    }
    posElement.textContent = positionInfo;

    // Update or create rotation display
    let rotElement = document.getElementById('rotation');
    if (!rotElement) {
      rotElement = document.createElement('div');
      rotElement.id = 'rotation';
      document.getElementById('ui')?.appendChild(rotElement);
    }
    rotElement.textContent = rotationInfo;
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