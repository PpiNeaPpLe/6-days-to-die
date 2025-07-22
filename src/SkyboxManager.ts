import * as THREE from 'three';

export class SkyboxManager {
  private scene: THREE.Scene;
  private skyGeometry!: THREE.SphereGeometry;
  private skyMaterial!: THREE.MeshBasicMaterial;
  private skyMesh!: THREE.Mesh;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.createSkybox();
  }

  private createSkybox(): void {
    // Create a large sphere that surrounds the scene
    this.skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    
    // Create material with a gradient that simulates sky
    this.skyMaterial = new THREE.MeshBasicMaterial({
      side: THREE.BackSide, // Render inside of sphere
    });

    this.skyMesh = new THREE.Mesh(this.skyGeometry, this.skyMaterial);
    this.scene.add(this.skyMesh);

    // Set initial day sky
    this.updateSkyColor(0.5); // Start at noon
  }

  public updateSkyColor(timeOfDay: number): void {
    // timeOfDay: 0-1 where 0.5 is noon, 0/1 is midnight
    let skyColor: THREE.Color;

    if (timeOfDay >= 0.25 && timeOfDay <= 0.75) {
      // Day time - bright blue sky
      skyColor = new THREE.Color(0x87CEEB);
    } else if (timeOfDay < 0.1 || timeOfDay > 0.9) {
      // Night time - dark blue/black
      skyColor = new THREE.Color(0x0a0a1a);
    } else {
      // Dawn/Dusk - interpolate between colors
      const isDown = timeOfDay < 0.25;
      const factor = isDown 
        ? (timeOfDay + 0.1) / 0.25  // Dawn: 0-1
        : 1 - ((timeOfDay - 0.75) / 0.25); // Dusk: 1-0

      const nightColor = new THREE.Color(0x0a0a1a);
      const dayColor = new THREE.Color(0x87CEEB);
      const sunsetColor = new THREE.Color(0xff6b35); // Orange sunset

      if (factor < 0.5) {
        // Night to sunset
        skyColor = nightColor.clone().lerp(sunsetColor, factor * 2);
      } else {
        // Sunset to day
        skyColor = sunsetColor.clone().lerp(dayColor, (factor - 0.5) * 2);
      }
    }

    this.skyMaterial.color = skyColor;
  }

  public async loadSkyboxTexture(texturePath: string): Promise<void> {
    try {
      const loader = new THREE.TextureLoader();
      const texture = await new Promise<THREE.Texture>((resolve, reject) => {
        loader.load(texturePath, resolve, undefined, reject);
      });

      // Update material to use texture
      this.skyMaterial.map = texture;
      this.skyMaterial.needsUpdate = true;
      
      console.log(`✅ Skybox texture loaded: ${texturePath}`);
    } catch (error) {
      console.error(`❌ Failed to load skybox texture: ${texturePath}`, error);
    }
  }

  public async loadCubemapSkybox(paths: {
    px: string; nx: string; py: string; 
    ny: string; pz: string; nz: string;
  }): Promise<void> {
    try {
      const loader = new THREE.CubeTextureLoader();
      const texture = await new Promise<THREE.CubeTexture>((resolve, reject) => {
        loader.load([
          paths.px, paths.nx, // positive X, negative X
          paths.py, paths.ny, // positive Y, negative Y  
          paths.pz, paths.nz  // positive Z, negative Z
        ], resolve, undefined, reject);
      });

      // Remove the sphere skybox and use environment map instead
      this.scene.remove(this.skyMesh);
      this.scene.background = texture;
      
      console.log('✅ Cubemap skybox loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load cubemap skybox:', error);
    }
  }

  public dispose(): void {
    this.skyGeometry.dispose();
    this.skyMaterial.dispose();
    if (this.skyMaterial.map) {
      this.skyMaterial.map.dispose();
    }
  }
} 