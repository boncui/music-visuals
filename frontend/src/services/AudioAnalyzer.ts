'use client';

export interface AudioData {
  bass: number;
  mid: number;
  treble: number;
  volume: number;
  beat: boolean;
  frequencyData: number[];
  timeDomainData: number[];
}

export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private animationId: number | null = null;
  private isListening = false;
  
  // Audio analysis parameters
  private readonly sampleRate = 44100;
  private readonly fftSize = 1024; // Reduced for faster response
  private readonly smoothingTimeConstant = 0.3; // Reduced for more sensitivity
  
  // Frequency bands
  private readonly bassRange: [number, number] = [20, 250];
  private readonly midRange: [number, number] = [250, 4000];
  private readonly trebleRange: [number, number] = [4000, 20000];
  
  // Beat detection
  private lastBeatTime = 0;
  private beatThreshold = 0.05; // Lowered for more sensitivity
  private beatDecayRate = 0.9; // Faster decay
  private beatMinInterval = 80; // ms - faster beat detection
  
  // Callbacks
  private onAudioData: ((data: AudioData) => void) | null = null;
  private onError: ((error: string) => void) | null = null;

  constructor() {
    // Don't initialize audio context immediately - wait for user interaction
    // console.log('AudioAnalyzer constructor called');
  }

  private async initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // console.log('Audio context created:', this.audioContext.state);
      
      // Resume context if suspended (required for user interaction)
      if (this.audioContext.state === 'suspended') {
        // console.log('Resuming suspended audio context...');
        await this.audioContext.resume();
        // console.log('Audio context resumed:', this.audioContext.state);
      }
      
      // console.log('Audio context initialized successfully:', this.audioContext.state);
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      this.onError?.(`Failed to initialize audio context: ${error}`);
    }
  }

  async startListening(): Promise<boolean> {
    try {
      // console.log('Starting microphone listening...');
      
      if (!this.audioContext) {
        // console.log('Audio context not found, initializing...');
        await this.initAudioContext();
      }

      if (!this.audioContext) {
        throw new Error('Audio context not available');
      }

      // Ensure audio context is running
      if (this.audioContext.state === 'suspended') {
        // console.log('Audio context suspended, resuming...');
        await this.audioContext.resume();
        // console.log('Audio context state after resume:', this.audioContext.state);
      }

      // console.log('Requesting microphone access...');
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: this.sampleRate,
          channelCount: 1
        }
      });

      // console.log('Microphone access granted, creating audio nodes...');
      // Create audio nodes
      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      
      // Configure analyser
      this.analyser.fftSize = this.fftSize;
      this.analyser.smoothingTimeConstant = this.smoothingTimeConstant;
      
      // console.log('Analyser configured:', {
      //   fftSize: this.analyser.fftSize,
      //   frequencyBinCount: this.analyser.frequencyBinCount,
      //   smoothingTimeConstant: this.analyser.smoothingTimeConstant
      // });
      
      // Connect nodes
      this.microphone.connect(this.analyser);
      
      // Start analysis loop
      this.isListening = true;
      // console.log('Starting audio analysis loop...');
      this.analyzeAudio();
      
      // console.log('Microphone listening started successfully');
      return true;
    } catch (error) {
      console.error('Failed to start listening:', error);
      this.onError?.(`Microphone access denied: ${error}`);
      return false;
    }
  }

  stopListening() {
    this.isListening = false;
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }
    
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
  }

  private analyzeAudio() {
    if (!this.isListening || !this.analyser) return;

    // Get frequency and time domain data
    const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    const timeDomainData = new Uint8Array(this.analyser.frequencyBinCount);
    
    this.analyser.getByteFrequencyData(frequencyData);
    this.analyser.getByteTimeDomainData(timeDomainData);

    // Debug: Log raw data occasionally
    // if (Math.random() < 0.01) { // 1% chance to log
    //   console.log('Raw frequency data sample:', Array.from(frequencyData.slice(0, 10)));
    //   console.log('Raw time domain data sample:', Array.from(timeDomainData.slice(0, 10)));
    //   console.log('Frequency data max:', Math.max(...frequencyData));
    //   console.log('Time domain data max:', Math.max(...timeDomainData));
    // }

    // Calculate frequency bands
    const bass = this.calculateFrequencyBand(frequencyData, this.bassRange);
    const mid = this.calculateFrequencyBand(frequencyData, this.midRange);
    const treble = this.calculateFrequencyBand(frequencyData, this.trebleRange);
    
    // Calculate overall volume
    const volume = this.calculateVolume(timeDomainData);
    
    // Beat detection
    const beat = this.detectBeat(bass, volume);
    
    // Create audio data object
    const audioData: AudioData = {
      bass: bass,
      mid: mid,
      treble: treble,
      volume: volume,
      beat: beat,
      frequencyData: Array.from(frequencyData),
      timeDomainData: Array.from(timeDomainData)
    };

    // Debug: Log processed data occasionally
    // if (Math.random() < 0.01) { // 1% chance to log
    //   console.log('Processed audio data:', {
    //     bass: bass.toFixed(3),
    //     mid: mid.toFixed(3),
    //     treble: treble.toFixed(3),
    //     volume: volume.toFixed(3),
    //     beat: beat
    //   });
    // }

    // Call callback
    this.onAudioData?.(audioData);

    // Continue analysis
    this.animationId = requestAnimationFrame(() => this.analyzeAudio());
  }

  private calculateFrequencyBand(frequencyData: Uint8Array, range: [number, number]): number {
    const nyquist = this.sampleRate / 2;
    const lowIndex = Math.floor((range[0] / nyquist) * frequencyData.length);
    const highIndex = Math.floor((range[1] / nyquist) * frequencyData.length);
    
    let sum = 0;
    let count = 0;
    for (let i = lowIndex; i <= highIndex && i < frequencyData.length; i++) {
      sum += frequencyData[i];
      count++;
    }
    
    if (count === 0) return 0;
    
    const average = sum / count;
    const normalized = average / 255;
    
    // More aggressive amplification for better sensitivity
    const amplified = Math.min(1, normalized * 4);
    
    // Debug occasionally
    // if (Math.random() < 0.005) {
    //   console.log(`Frequency band [${range[0]}-${range[1]}Hz]:`, {
    //     lowIndex,
    //     highIndex,
    //     average,
    //     normalized: normalized.toFixed(3),
    //     amplified: amplified.toFixed(3)
    //   });
    // }
    
    return amplified;
  }

  private calculateVolume(timeDomainData: Uint8Array): number {
    let sum = 0;
    for (let i = 0; i < timeDomainData.length; i++) {
      const sample = (timeDomainData[i] - 128) / 128;
      sum += sample * sample;
    }
    const rms = Math.sqrt(sum / timeDomainData.length);
    
    // More aggressive amplification for better sensitivity
    const amplified = Math.min(1, rms * 5);
    
    // Debug occasionally
    // if (Math.random() < 0.005) {
    //   console.log('Volume calculation:', {
    //     rms: rms.toFixed(3),
    //     amplified: amplified.toFixed(3)
    //   });
    // }
    
    return amplified;
  }

  private detectBeat(bass: number, volume: number): boolean {
    const now = Date.now();
    const beatEnergy = bass * volume;
    
    // More sensitive beat detection
    const dynamicThreshold = Math.max(0.05, this.beatThreshold);
    
    if (beatEnergy > dynamicThreshold && now - this.lastBeatTime > this.beatMinInterval) {
      this.lastBeatTime = now;
      this.beatThreshold = Math.max(0.05, this.beatThreshold * this.beatDecayRate);
      
      // Debug occasionally
      // if (Math.random() < 0.1) {
      //   console.log('Beat detected!', {
      //     beatEnergy: beatEnergy.toFixed(3),
      //     threshold: dynamicThreshold.toFixed(3),
      //     bass: bass.toFixed(3),
      //     volume: volume.toFixed(3)
      //   });
      // }
      
      return true;
    }
    
    // Gradually increase threshold
    this.beatThreshold = Math.min(0.6, this.beatThreshold + 0.0005);
    return false;
  }

  // Public methods for callbacks
  setOnAudioData(callback: (data: AudioData) => void) {
    this.onAudioData = callback;
  }

  setOnError(callback: (error: string) => void) {
    this.onError = callback;
  }

  // Check if browser supports required APIs
  static isSupported(): boolean {
    return !!(
      window.AudioContext || 
      (window as any).webkitAudioContext
    ) && !!(
      navigator.mediaDevices && 
      navigator.mediaDevices.getUserMedia
    );
  }

  // Getters
  get isActive(): boolean {
    return this.isListening;
  }

  get audioContextState(): string {
    return this.audioContext?.state || 'closed';
  }
}
