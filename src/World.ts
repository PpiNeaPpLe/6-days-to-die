import * as THREE from 'three';

export class World {
  private scene: THREE.Scene;
  private worldSize: number = 50;
  private blockSize: number = 1;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.generateTerrain();
    this.setupLighting();
  }

  private generateTerrain(): void {
    // Create ground plane
    const groundGeometry = new THREE.PlaneGeometry(this.worldSize, this.worldSize);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x3a5f3a, // Dark green
      side: THREE.DoubleSide 
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Add some basic terrain features
    this.generateTrees();
    this.generateRocks();
  }

  private generateTrees(): void {
    const treeCount = 20;
    
    for (let i = 0; i < treeCount; i++) {
      const tree = this.createTree();
      
      // Random position within world bounds
      const x = (Math.random() - 0.5) * (this.worldSize - 10);
      const z = (Math.random() - 0.5) * (this.worldSize - 10);
      
      tree.position.set(x, 0, z);
      this.scene.add(tree);
    }
  }

  private createTree(): THREE.Group {
    const tree = new THREE.Group();
    
    // Tree trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 4);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 2;
    trunk.castShadow = true;
    tree.add(trunk);
    
    // Tree leaves
    const leavesGeometry = new THREE.SphereGeometry(2.5);
    const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 5;
    leaves.castShadow = true;
    tree.add(leaves);
    
    return tree;
  }

  private generateRocks(): void {
    const rockCount = 15;
    
    for (let i = 0; i < rockCount; i++) {
      const rock = this.createRock();
      
      // Random position
      const x = (Math.random() - 0.5) * (this.worldSize - 5);
      const z = (Math.random() - 0.5) * (this.worldSize - 5);
      
      rock.position.set(x, 0.5, z);
      this.scene.add(rock);
    }
  }

  private createRock(): THREE.Mesh {
    const size = 0.5 + Math.random() * 1.5;
    const rockGeometry = new THREE.DodecahedronGeometry(size);
    const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
    
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    rock.castShadow = true;
    rock.receiveShadow = true;
    
    // Random rotation
    rock.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    
    return rock;
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
} 