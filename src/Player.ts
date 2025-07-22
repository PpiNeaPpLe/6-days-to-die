import * as THREE from 'three';
import { AudioManager } from './AudioManager';

export class Player {
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private velocity: THREE.Vector3;
  private isLocked: boolean = false;
  private health: number = 100;
  private audioManager: AudioManager;
  
  // Movement settings
  private moveSpeed: number = 10;
  private jumpSpeed: number = 15;
  private gravity: number = -30;
  private isOnGround: boolean = false;
  
  // Controls
  private keys: { [key: string]: boolean } = {};
  private mouseMovement: { x: number; y: number } = { x: 0, y: 0 };

  constructor(camera: THREE.PerspectiveCamera, scene: THREE.Scene) {
    this.camera = camera;
    this.scene = scene;
    this.velocity = new THREE.Vector3();
    this.audioManager = new AudioManager();
    
    // Set initial player position (above ground)
    this.camera.position.set(0, 5, 5);
    
    this.setupControls();
    this.initializeAudio();
  }

  private async initializeAudio(): Promise<void> {
    await this.audioManager.createAndLoadBasicSounds();
  }

  private setupControls(): void {
    // Keyboard controls
    document.addEventListener('keydown', (event) => {
      this.keys[event.code.toLowerCase()] = true;
    });

    document.addEventListener('keyup', (event) => {
      this.keys[event.code.toLowerCase()] = false;
    });

    // Mouse controls
    document.addEventListener('click', () => {
      if (!this.isLocked) {
        document.body.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isLocked = document.pointerLockElement === document.body;
    });

    document.addEventListener('mousemove', (event) => {
      if (this.isLocked) {
        this.mouseMovement.x = event.movementX || 0;
        this.mouseMovement.y = event.movementY || 0;
      }
    });
  }

  public update(deltaTime: number): void {
    this.handleMouseLook();
    this.handleMovement(deltaTime);
    this.applyGravity(deltaTime);
    this.checkGroundCollision();
  }

  private handleMouseLook(): void {
    if (!this.isLocked) return;

    const sensitivity = 0.002;
    
    // Rotate camera horizontally
    this.camera.rotation.y -= this.mouseMovement.x * sensitivity;
    
    // Rotate camera vertically (with limits)
    this.camera.rotation.x -= this.mouseMovement.y * sensitivity;
    this.camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.camera.rotation.x));
    
    // Reset mouse movement
    this.mouseMovement.x = 0;
    this.mouseMovement.y = 0;
  }

  private handleMovement(deltaTime: number): void {
    const direction = new THREE.Vector3();
    
    // Get camera direction for movement
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0; // Don't move up/down with camera pitch
    forward.normalize();
    
    const right = new THREE.Vector3();
    right.crossVectors(forward, this.camera.up).normalize();

    // Handle WASD movement
    if (this.keys['keyw'] || this.keys['arrowup']) {
      direction.add(forward);
    }
    if (this.keys['keys'] || this.keys['arrowdown']) {
      direction.sub(forward);
    }
    if (this.keys['keya'] || this.keys['arrowleft']) {
      direction.sub(right);
    }
    if (this.keys['keyd'] || this.keys['arrowright']) {
      direction.add(right);
    }

    // Jump with sound
    if (this.keys['space'] && this.isOnGround) {
      this.velocity.y = this.jumpSpeed;
      this.isOnGround = false;
      
      // Play jump sound
      this.audioManager.createJumpSound();
    }

    // Apply movement
    if (direction.length() > 0) {
      direction.normalize();
      direction.multiplyScalar(this.moveSpeed * deltaTime);
      this.camera.position.add(direction);
    }
  }

  private applyGravity(deltaTime: number): void {
    this.velocity.y += this.gravity * deltaTime;
    this.camera.position.y += this.velocity.y * deltaTime;
  }

  private checkGroundCollision(): void {
    // Simple ground collision at y = 1.8 (player height above ground)
    const groundLevel = 1.8;
    
    if (this.camera.position.y <= groundLevel) {
      this.camera.position.y = groundLevel;
      this.velocity.y = 0;
      this.isOnGround = true;
    } else {
      this.isOnGround = false;
    }
  }

  public getHealth(): number {
    return this.health;
  }

  public takeDamage(amount: number): void {
    this.health = Math.max(0, this.health - amount);
  }

  public getPosition(): THREE.Vector3 {
    return this.camera.position.clone();
  }

  public getAudioManager(): AudioManager {
    return this.audioManager;
  }
} 