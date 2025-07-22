import * as THREE from 'three';
import { ModelLoader } from './ModelLoader';

export class World {
  private scene: THREE.Scene;
  private modelLoader: ModelLoader;
  private worldSize: number = 50;
  private loadedModels: THREE.Group[] = [];

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

  public replaceGroundWithModel(modelPath: string): Promise<THREE.Group> {
    // Remove the basic ground plane
    const ground = this.scene.getObjectByName('ground');
    if (ground) {
      this.scene.remove(ground);
    }

    // Load the terrain model
    return this.loadWorldModel(modelPath);
  }

  private setupLighting(): void {
    // Ambient light for general illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 5);
    directionalLight.castShadow = true;
    
    // Configure shadow settings
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -25;
    directionalLight.shadow.camera.right = 25;
    directionalLight.shadow.camera.top = 25;
    directionalLight.shadow.camera.bottom = -25;
    
    this.scene.add(directionalLight);
  }

  public getWorldSize(): number {
    return this.worldSize;
  }

  public getLoadedModels(): THREE.Group[] {
    return [...this.loadedModels];
  }

  public clearAllModels(): void {
    this.loadedModels.forEach(model => {
      this.scene.remove(model);
    });
    this.loadedModels = [];
    console.log('🗑️ All loaded models cleared');
  }
} 