import * as THREE from 'three';
import { AudioManager } from './AudioManager';
import { World } from './World';

export class Player {
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private world: World;
  private velocity: THREE.Vector3;
  private isLocked: boolean = false;
  private health: number = 100;
  private audioManager: AudioManager;
  
  // Movement settings
  private moveSpeed: number = 15;
  private jumpSpeed: number = 18;
  private gravity: number = -30;
  private isOnGround: boolean = false;
  
  // Player capsule collision settings
  private playerHeight: number = 1.8;
  private playerRadius: number = 0.4;
  private capsuleHeight: number = this.playerHeight - this.playerRadius * 2; // Height of cylindrical part
  
  // Camera/head rotation settings
  private yaw: number = 0; // Left/right rotation (unlimited)
  private pitch: number = 0; // Up/down rotation (limited)
  private maxPitch: number = Math.PI / 3; // 60 degrees up/down limit
  private mouseSensitivity: number = 0.002;
  
  // Controls
  private keys: { [key: string]: boolean } = {};
  private mouseMovement: { x: number; y: number } = { x: 0, y: 0 };

  constructor(camera: THREE.PerspectiveCamera, scene: THREE.Scene, world: World) {
    this.camera = camera;
    this.scene = scene;
    this.world = world;
    this.velocity = new THREE.Vector3();
    this.audioManager = new AudioManager();
    
    // Set initial player position (will be updated when terrain loads)
    this.camera.position.set(0, 10, 5);
    
    this.setupControls();
    this.initializeAudio();
  }

  private async initializeAudio(): Promise<void> {
    await this.audioManager.createAndLoadBasicSounds();
  }

  public setSpawnPosition(position: THREE.Vector3): void {
    this.camera.position.copy(position);
    this.velocity.set(0, 0, 0);
    // Reset camera rotation when spawning
    this.yaw = 0;
    this.pitch = 0;
    this.updateCameraRotation();
    console.log(`👤 Player spawned at: (${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)})`);
  }

  private setupControls(): void {
    // Keyboard controls
    document.addEventListener('keydown', (event) => {
      this.keys[event.code.toLowerCase()] = true;
    });

    document.addEventListener('keyup', (event) => {
      this.keys[event.code.toLowerCase()] = false;
    });

    // Mouse controls with human-like head movement
    document.addEventListener('click', () => {
      if (!this.isLocked) {
        document.body.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.isLocked = document.pointerLockElement === document.body;
      console.log(`🖱️ Mouse ${this.isLocked ? 'locked' : 'unlocked'}`);
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
    this.updateGroundPosition();
  }

  private handleMouseLook(): void {
    if (!this.isLocked) return;

    // Update yaw (left/right head rotation) - unlimited
    this.yaw -= this.mouseMovement.x * this.mouseSensitivity;
    
    // Update pitch (up/down head rotation) - limited like a human head
    this.pitch -= this.mouseMovement.y * this.mouseSensitivity;
    this.pitch = Math.max(-this.maxPitch, Math.min(this.maxPitch, this.pitch));
    
    // Apply rotation to camera
    this.updateCameraRotation();
    
    // Reset mouse movement
    this.mouseMovement.x = 0;
    this.mouseMovement.y = 0;
  }

  private updateCameraRotation(): void {
    // Set camera rotation using Euler angles in the correct order
    // YXZ order: Yaw (Y), then Pitch (X), then Roll (Z - always 0 for FPS)
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.set(this.pitch, this.yaw, 0);
  }

  private handleMovement(deltaTime: number): void {
    const moveVector = new THREE.Vector3();
    
    // Get movement directions based on camera yaw (ignore pitch for movement)
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    // Calculate desired movement direction
    if (this.keys['keyw'] || this.keys['arrowup']) {
      moveVector.add(forward);
    }
    if (this.keys['keys'] || this.keys['arrowdown']) {
      moveVector.sub(forward);
    }
    if (this.keys['keya'] || this.keys['arrowleft']) {
      moveVector.sub(right);
    }
    if (this.keys['keyd'] || this.keys['arrowright']) {
      moveVector.add(right);
    }

    // Jump with sound
    if (this.keys['space'] && this.isOnGround) {
      this.velocity.y = this.jumpSpeed;
      this.isOnGround = false;
      
      // Play jump sound
      this.audioManager.createJumpSound();
    }

    // Apply movement with capsule collision detection
    if (moveVector.length() > 0) {
      moveVector.normalize();
      moveVector.multiplyScalar(this.moveSpeed * deltaTime);
      
      // Test movement with capsule collision
      const newPosition = this.camera.position.clone().add(moveVector);
      
      if (this.canMoveTo(newPosition)) {
        this.camera.position.copy(newPosition);
      } else {
        // Try sliding along walls
        this.trySlideMovement(moveVector);
      }
    }
  }

  private canMoveTo(position: THREE.Vector3): boolean {
    // Check if the player's capsule can fit at this position
    return this.checkCapsuleCollision(position);
  }

  private checkCapsuleCollision(position: THREE.Vector3): boolean {
    // Check collision at multiple points of the capsule
    const checkPoints = [
      // Top of capsule
      new THREE.Vector3(position.x, position.y + this.capsuleHeight/2, position.z),
      // Middle of capsule
      new THREE.Vector3(position.x, position.y, position.z),
      // Bottom of capsule  
      new THREE.Vector3(position.x, position.y - this.capsuleHeight/2, position.z),
      // Sides of capsule (8 directions around the cylinder)
      ...this.getCapsuleSidePoints(position)
    ];

    // Check each point for collision
    for (const point of checkPoints) {
      if (this.world.checkCollision(point, new THREE.Vector3(0, 0, 1), 0.1)) {
        return false; // Collision detected
      }
    }
    
    return true; // No collision
  }

  private getCapsuleSidePoints(centerPosition: THREE.Vector3): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    const numChecks = 8; // Check 8 directions around the cylinder
    
    for (let i = 0; i < numChecks; i++) {
      const angle = (i / numChecks) * Math.PI * 2;
      const x = centerPosition.x + Math.cos(angle) * this.playerRadius;
      const z = centerPosition.z + Math.sin(angle) * this.playerRadius;
      
      // Check at multiple heights
      points.push(new THREE.Vector3(x, centerPosition.y + this.capsuleHeight/4, z));
      points.push(new THREE.Vector3(x, centerPosition.y, z));
      points.push(new THREE.Vector3(x, centerPosition.y - this.capsuleHeight/4, z));
    }
    
    return points;
  }

  private trySlideMovement(originalMovement: THREE.Vector3): void {
    // Try moving along each axis separately (wall sliding)
    const movements = [
      new THREE.Vector3(originalMovement.x, 0, 0), // X-only movement
      new THREE.Vector3(0, 0, originalMovement.z)  // Z-only movement
    ];

    for (const movement of movements) {
      if (movement.length() > 0) {
        const newPosition = this.camera.position.clone().add(movement);
        if (this.canMoveTo(newPosition)) {
          this.camera.position.copy(newPosition);
          break; // Successfully moved along one axis
        }
      }
    }
  }

  private applyGravity(deltaTime: number): void {
    // Apply gravity
    this.velocity.y += this.gravity * deltaTime;
    
    // Apply vertical movement with collision check
    const newPosition = this.camera.position.clone();
    newPosition.y += this.velocity.y * deltaTime;
    
    if (this.canMoveTo(newPosition)) {
      this.camera.position.y = newPosition.y;
    } else if (this.velocity.y < 0) {
      // Hit ground while falling
      this.velocity.y = 0;
      this.isOnGround = true;
    } else if (this.velocity.y > 0) {
      // Hit ceiling while jumping
      this.velocity.y = 0;
    }
  }

  private updateGroundPosition(): void {
    // Get terrain height at current X,Z position
    const terrainHeight = this.world.getTerrainHeightAt(this.camera.position.x, this.camera.position.z);
    const groundLevel = terrainHeight + this.playerHeight;
    
    // Check if we should be on the ground
    if (this.camera.position.y <= groundLevel) {
      this.camera.position.y = groundLevel;
      this.velocity.y = 0;
      this.isOnGround = true;
    } else {
      this.isOnGround = false;
    }

    // Prevent falling too far below terrain (safety net)
    if (this.camera.position.y < terrainHeight - 20) {
      // Respawn at a safe position
      const safePosition = this.world.findSpawnPosition();
      this.setSpawnPosition(safePosition);
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

  public isMouseLocked(): boolean {
    return this.isLocked;
  }

  public getYaw(): number {
    return this.yaw;
  }

  public getPitch(): number {
    return this.pitch;
  }
} 