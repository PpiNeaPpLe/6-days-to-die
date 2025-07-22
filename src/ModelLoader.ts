import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class ModelLoader {
  private loader: GLTFLoader;
  private loadingManager: THREE.LoadingManager;

  constructor() {
    this.loadingManager = new THREE.LoadingManager();
    this.loader = new GLTFLoader(this.loadingManager);

    // Setup loading callbacks
    this.loadingManager.onLoad = () => {
      console.log('🎯 All models loaded successfully!');
    };

    this.loadingManager.onProgress = (url, loaded, total) => {
      console.log(`📦 Loading: ${url} (${loaded}/${total})`);
    };

    this.loadingManager.onError = (url) => {
      console.error(`❌ Failed to load: ${url}`);
    };
  }

  public async loadModel(path: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => {
          // Enable shadows for all meshes in the model
          gltf.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          
          console.log(`✅ Loaded model: ${path}`);
          resolve(gltf.scene);
        },
        (progress) => {
          // Progress callback
        },
        (error) => {
          console.error(`❌ Error loading model ${path}:`, error);
          reject(error);
        }
      );
    });
  }

  public async loadModelWithAnimations(path: string): Promise<{ scene: THREE.Group; animations: THREE.AnimationClip[] }> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => {
          // Enable shadows
          gltf.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          
          console.log(`✅ Loaded animated model: ${path} with ${gltf.animations.length} animations`);
          resolve({ scene: gltf.scene, animations: gltf.animations });
        },
        undefined,
        (error) => {
          console.error(`❌ Error loading animated model ${path}:`, error);
          reject(error);
        }
      );
    });
  }
} 