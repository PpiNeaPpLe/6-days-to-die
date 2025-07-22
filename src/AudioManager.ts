export class AudioManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private isInitialized: boolean = false;

  constructor() {
    // Audio context will be created on first user interaction
  }

  private async initializeAudio(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isInitialized = true;
      console.log('🔊 Audio system initialized');
    } catch (error) {
      console.error('❌ Failed to initialize audio:', error);
    }
  }

  public async loadSound(name: string, url: string): Promise<void> {
    await this.initializeAudio();
    
    if (!this.audioContext) return;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.sounds.set(name, audioBuffer);
      console.log(`✅ Sound loaded: ${name}`);
    } catch (error) {
      console.error(`❌ Failed to load sound ${name}:`, error);
    }
  }

  public async playSound(name: string, volume: number = 1, pitch: number = 1): Promise<void> {
    await this.initializeAudio();
    
    if (!this.audioContext || !this.sounds.has(name)) return;

    try {
      const audioBuffer = this.sounds.get(name)!;
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = audioBuffer;
      source.playbackRate.value = pitch;
      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
    } catch (error) {
      console.error(`❌ Failed to play sound ${name}:`, error);
    }
  }

  public createJumpSound(): void {
    // Create a simple synthetic jump sound if no audio file is available
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Jump sound parameters
      oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.3);
    } catch (error) {
      console.error('❌ Failed to create jump sound:', error);
    }
  }

  public async createAndLoadBasicSounds(): Promise<void> {
    await this.initializeAudio();
    
    // For now, we'll use synthetic sounds. Later you can replace with actual audio files
    console.log('🎵 Basic synthetic sounds ready (jump sound will be generated on-demand)');
  }
} 