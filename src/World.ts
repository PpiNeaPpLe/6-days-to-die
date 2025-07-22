import * as THREE from 'three';
import { ModelLoader } from './ModelLoader';

export class World {
  private scene: THREE.Scene;
  private modelLoader: ModelLoader;
  private worldSize: number = 100; // Increased for larger world
  private loadedModels: THREE.Group[] = [];
  private terrainModel: THREE.Group | null = null;
  private collisionMeshes: THREE.Mesh[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.modelLoader = new ModelLoader();
    this.setupBasicWorld();
    this.setupLighting();
  }

  private setupBasicWorld(): void {
    // Create a simple ground plane as fallback
    const groundGeometry = new THREE.PlaneGeometry(this.worldSize, this.worldSize);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x3a5f3a,
      side: THREE.DoubleSide 
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.name = 'ground';
    this.scene.add(ground);

    console.log('🌍 Basic world setup complete. Ready to load GLB models!');
  }

  public async loadWorldModel(modelPath: string, position?: THREE.Vector3, scale?: THREE.Vector3): Promise<THREE.Group> {
    try {
      const model = await this.modelLoader.loadModel(modelPath);
      
      if (position) {
        model.position.copy(position);
      }
      
      if (scale) {
        model.scale.copy(scale);
      }
      
      this.scene.add(model);
      this.loadedModels.push(model);
      
      console.log(`🏗️ World model loaded: ${modelPath}`);
      return model;
    } catch (error) {
      console.error(`❌ Failed to load world model: ${modelPath}`, error);
      throw error;
    }
  }

  public async loadMultipleModels(models: Array<{
    path: string;
    position?: THREE.Vector3;
    scale?: THREE.Vector3;
    rotation?: THREE.Euler;
  }>): Promise<THREE.Group[]> {
    const loadPromises = models.map(async (modelConfig) => {
      try {
        const model = await this.modelLoader.loadModel(modelConfig.path);
        
        if (modelConfig.position) {
          model.position.copy(modelConfig.position);
        }
        
        if (modelConfig.scale) {
          model.scale.copy(modelConfig.scale);
        }
        
        if (modelConfig.rotation) {
          model.rotation.copy(modelConfig.rotation);
        }
        
        this.scene.add(model);
        this.loadedModels.push(model);
        
        return model;
      } catch (error) {
        console.error(`❌ Failed to load model: ${modelConfig.path}`, error);
        return null;
      }
    });

    const results = await Promise.all(loadPromises);
    const successfulModels = results.filter(model => model !== null) as THREE.Group[];
    
    console.log(`🎯 Loaded ${successfulModels.length}/${models.length} models successfully`);
    return successfulModels;
  }

  public async replaceGroundWithModel(modelPath: string): Promise<THREE.Group> {
    // Remove the basic ground plane
    const ground = this.scene.getObjectByName('ground');
    if (ground) {
      this.scene.remove(ground);
    }

    // Load the terrain model with much larger scaling for Minecraft world
    const terrainModel = await this.modelLoader.loadModel(modelPath);
    
    // Double the scale: 30x makes the world huge and each block ~3-4 meters
    const worldScale = 30;
    terrainModel.scale.set(worldScale, worldScale, worldScale);
    
    // Position it at ground level
    terrainModel.position.set(0, 0, 0);
    
    this.scene.add(terrainModel);
    this.loadedModels.push(terrainModel);
    this.terrainModel = terrainModel;
    
    // Collect all meshes for collision detection
    this.setupCollisionMeshes(terrainModel);
    
    console.log(`🏔️ Terrain model loaded and scaled to ${worldScale}x size (HUGE!)`);
    return terrainModel;
  }

  private setupCollisionMeshes(model: THREE.Group): void {
    this.collisionMeshes = [];
    
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        this.collisionMeshes.push(child);
      }
    });
    
    console.log(`🎯 Collision detection setup for ${this.collisionMeshes.length} meshes`);
  }

  public getTerrainHeightAt(x: number, z: number): number {
    if (this.collisionMeshes.length === 0) {
      return 0; // Fallback to ground level
    }

    // Cast a ray downward from high above to find terrain height
    const raycaster = new THREE.Raycaster();
    const rayOrigin = new THREE.Vector3(x, 200, z); // Start much higher for larger world
    const rayDirection = new THREE.Vector3(0, -1, 0); // Point downward
    
    raycaster.set(rayOrigin, rayDirection);
    
    const intersections = raycaster.intersectObjects(this.collisionMeshes, false);
    
    if (intersections.length > 0) {
      return intersections[0].point.y;
    }
    
    return 0; // Fallback
  }

  public checkCollision(position: THREE.Vector3, direction: THREE.Vector3, distance: number = 0.5): boolean {
    if (this.collisionMeshes.length === 0) {
      return false;
    }

    const raycaster = new THREE.Raycaster();
    raycaster.set(position, direction.clone().normalize());
    
    const intersections = raycaster.intersectObjects(this.collisionMeshes, false);
    
    return intersections.length > 0 && intersections[0].distance < distance;
  }

  public findSpawnPosition(): THREE.Vector3 {
    // Try to find a good spawn position on the terrain
    if (this.collisionMeshes.length === 0) {
      return new THREE.Vector3(0, 10, 10); // Fallback position
    }

    // Try several positions and pick the highest one (search wider area for larger world)
    const testPositions = [
      { x: 0, z: 0 },
      { x: 20, z: 20 },
      { x: -20, z: 20 },
      { x: 20, z: -20 },
      { x: -20, z: -20 },
      { x: 0, z: 30 },
      { x: 30, z: 0 },
      { x: -30, z: 0 },
      { x: 0, z: -30 },
      { x: 15, z: 15 },
      { x: -15, z: -15 }
    ];

    let bestPosition = new THREE.Vector3(0, 20, 10);
    let highestY = -100;

    for (const testPos of testPositions) {
      const terrainHeight = this.getTerrainHeightAt(testPos.x, testPos.z);
      if (terrainHeight > highestY) {
        highestY = terrainHeight;
        bestPosition = new THREE.Vector3(testPos.x, terrainHeight + 3, testPos.z); // 3 units above terrain
      }
    }

    console.log(`🎯 Spawn position found: (${bestPosition.x.toFixed(1)}, ${bestPosition.y.toFixed(1)}, ${bestPosition.z.toFixed(1)})`);
    return bestPosition;
  }

  private setupLighting(): void {
    // Ambient light for general illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 40, 10); // Higher for larger world
    directionalLight.castShadow = true;
    
    // Configure shadow settings for much larger world
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    
    this.scene.add(directionalLight);
  }

  public getWorldSize(): number {
    return this.worldSize;
  }

  public getLoadedModels(): THREE.Group[] {
    return [...this.loadedModels];
  }

  public getTerrainModel(): THREE.Group | null {
    return this.terrainModel;
  }

  public clearAllModels(): void {
    this.loadedModels.forEach(model => {
      this.scene.remove(model);
    });
    this.loadedModels = [];
    this.terrainModel = null;
    this.collisionMeshes = [];
    console.log('🗑️ All loaded models cleared');
  }
} 