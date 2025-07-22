import * as THREE from 'three';

export class GameTime {
  private scene: THREE.Scene;
  private currentTime: number = 0; // 0-1 represents full day cycle
  private dayLength: number = 120; // 2 minutes = 1 day
  private directionalLight: THREE.DirectionalLight | null = null;
  private ambientLight: THREE.AmbientLight | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.findLights();
  }

  private findLights(): void {
    // Find existing lights in the scene
    this.scene.traverse((object) => {
      if (object instanceof THREE.DirectionalLight) {
        this.directionalLight = object;
      }
      if (object instanceof THREE.AmbientLight) {
        this.ambientLight = object;
      }
    });
  }

  public update(deltaTime: number): void {
    // Advance time
    this.currentTime += deltaTime / this.dayLength;
    if (this.currentTime >= 1) {
      this.currentTime -= 1; // Reset to start of new day
    }

    this.updateLighting();
    this.updateSkyColor();
  }

  private updateLighting(): void {
    if (!this.directionalLight || !this.ambientLight) return;

    // Calculate sun position based on time
    const sunAngle = this.currentTime * Math.PI * 2;
    const sunHeight = Math.sin(sunAngle);
    
    // Position the sun
    const sunDistance = 20;
    this.directionalLight.position.set(
      Math.cos(sunAngle) * sunDistance,
      sunHeight * sunDistance,
      Math.sin(sunAngle) * sunDistance
    );

    // Adjust light intensity based on time of day
    let lightIntensity: number;
    let ambientIntensity: number;

    if (this.isDay()) {
      // Day time - bright
      lightIntensity = 0.8;
      ambientIntensity = 0.3;
    } else if (this.isNight()) {
      // Night time - dark
      lightIntensity = 0.1;
      ambientIntensity = 0.05;
    } else {
      // Dawn/Dusk - gradual transition
      const transition = this.getTransitionFactor();
      lightIntensity = 0.1 + (0.7 * transition);
      ambientIntensity = 0.05 + (0.25 * transition);
    }

    this.directionalLight.intensity = lightIntensity;
    this.ambientLight.intensity = ambientIntensity;
  }

  private updateSkyColor(): void {
    let skyColor: number;

    if (this.isDay()) {
      skyColor = 0x87CEEB; // Sky blue
    } else if (this.isNight()) {
      skyColor = 0x191970; // Midnight blue
    } else {
      // Dawn/Dusk - blend colors
      const transition = this.getTransitionFactor();
      const dayColor = new THREE.Color(0x87CEEB);
      const nightColor = new THREE.Color(0x191970);
      const blendedColor = nightColor.lerp(dayColor, transition);
      skyColor = blendedColor.getHex();
    }

    // Update scene fog color
    if (this.scene.fog instanceof THREE.Fog) {
      this.scene.fog.color.setHex(skyColor);
    }
  }

  private isDay(): boolean {
    return this.currentTime >= 0.25 && this.currentTime <= 0.75;
  }

  private isNight(): boolean {
    return this.currentTime < 0.1 || this.currentTime > 0.9;
  }

  private getTransitionFactor(): number {
    // Calculate how far through dawn/dusk transition we are
    if (this.currentTime < 0.25) {
      // Dawn
      return Math.max(0, (this.currentTime - 0.1) / 0.15);
    } else {
      // Dusk
      return Math.max(0, 1 - ((this.currentTime - 0.75) / 0.15));
    }
  }

  public getTimeOfDay(): string {
    if (this.isDay()) {
      return 'Day';
    } else if (this.isNight()) {
      return 'Night';
    } else if (this.currentTime < 0.25) {
      return 'Dawn';
    } else {
      return 'Dusk';
    }
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public getTimeString(): string {
    const hours = Math.floor(this.currentTime * 24);
    const minutes = Math.floor((this.currentTime * 24 - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
} 