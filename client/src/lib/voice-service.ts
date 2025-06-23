// Voice settings interface
export interface VoiceSettings {
  stability: number;
  similarityBoost: number;
  style: number;
  speakerBoost: boolean;
}

// Voice option interface
export interface VoiceOption {
  voice_id: string;
  name: string;
}

export class VoiceService {
  private apiUrl = '/api';
  private selectedVoice: string = "21m00Tcm4TlvDq8ikWAM";
  private settings: VoiceSettings = {
    stability: 0.75,
    similarityBoost: 0.75,
    style: 0.5,
    speakerBoost: true
  };
  private currentAudio: HTMLAudioElement | null = null;
  private isSpeaking: boolean = false;
  private audioContext: AudioContext | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private utteranceQueue: SpeechSynthesisUtterance[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.initVoices();
    
    // Reset the speaking state if the browser cancels speech
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      this.voices = window.speechSynthesis.getVoices();
    });
  }

  private initVoices() {
    // Load available voices
    this.voices = window.speechSynthesis.getVoices();
    
    // If voices aren't loaded yet, wait for them
    if (this.voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.voices = window.speechSynthesis.getVoices();
        console.log(`Loaded ${this.voices.length} voices for speech synthesis`);
      };
    }
  }

  async initAudio(): Promise<void> {
    try {
      // Preload audio context to handle autoplay restrictions
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const audioContext = new AudioContext();
        // Create and immediately suspend a short sound to initialize audio
        const oscillator = audioContext.createOscillator();
        oscillator.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(0.001);
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
        console.log('Audio system initialized');
      }
    } catch (error) {
      console.warn('Could not initialize audio system:', error);
    }
  }

  async speak(text: string, persona?: string): Promise<void> {
    try {
      console.log(`Attempting to speak: "${text.substring(0, 30)}..." as ${persona || 'default'}`);
      
      // Set speaking state
      this.isSpeaking = true;

      // Try server-side synthesis first
      try {
        console.log('Attempting server-side speech synthesis');
        const response = await fetch(`${this.apiUrl}/synthesize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text, persona })
        });

        if (!response.ok) {
          console.warn(`Voice API returned ${response.status}, falling back to browser speech`);
          throw new Error(`Voice API returned ${response.status}`);
        }

        // Check if the response is JSON (fallback indicator)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const fallbackData = await response.json();
          console.log('Server returned JSON instead of audio, using fallback speech:', fallbackData);
          return this.useBrowserSpeech(fallbackData.text || text, persona);
        }

        // Process audio response
        const blob = await response.blob();
        if (blob.size === 0) {
          console.warn('Received empty audio blob, falling back to browser speech');
          throw new Error('Empty audio response');
        }

        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        
        // Store reference to current audio
        this.currentAudio = audio;

        return new Promise((resolve, reject) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            this.currentAudio = null;
            this.isSpeaking = false;
            resolve();
          };

          audio.onerror = (err) => {
            console.error('Audio playback error:', err);
            URL.revokeObjectURL(audioUrl);
            this.currentAudio = null;
            this.isSpeaking = false;
            // Try browser speech as fallback
            this.useBrowserSpeech(text, persona)
              .then(resolve)
              .catch(reject);
          };

          // Pre-load the audio
          audio.load();

          // Try to play the audio
          audio.play().catch(err => {
            console.error('Error playing audio:', err);
            URL.revokeObjectURL(audioUrl);
            this.currentAudio = null;
            this.isSpeaking = false;
            // Try browser speech as fallback
            this.useBrowserSpeech(text, persona)
              .then(resolve)
              .catch(reject);
          });
        });
      } catch (error) {
        console.warn('Server-side synthesis failed, using browser speech:', error);
        return this.useBrowserSpeech(text, persona);
      }
    } catch (error) {
      console.error('All speech synthesis methods failed:', error);
      // Just resolve the promise to prevent blocking the conversation
      return Promise.resolve();
    }
  }

  async synthesizeSpeech({ text, persona }: { text: string; persona?: string }): Promise<void> {
    if (!text || !text.trim()) return;
    
    console.log(`VoiceService: Speaking as ${persona || 'default'}: "${text.substring(0, 30)}..."`);
    
    // Cancel any ongoing speech
    this.stopSpeaking();
    
    // Split text into smaller chunks (paragraphs or sentences)
    const chunks = this.splitIntoChunks(text);
    console.log(`Split text into ${chunks.length} chunks for ${persona}`);
    
    // Find a suitable voice
    if (this.voices.length === 0) {
      this.voices = window.speechSynthesis.getVoices();
    }
    
    let selectedVoice: SpeechSynthesisVoice | null = null;
    if (this.voices.length > 0) {
      // Try to find an English voice
      selectedVoice = this.voices.find(v => v.lang.includes('en')) || this.voices[0];
      if (selectedVoice) {
        console.log(`Using voice: ${selectedVoice.name} for ${persona || 'default'}`);
      }
    }
    
    this.isSpeaking = true;
    
    // Process each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      try {
        // Create a new utterance for this chunk
        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.rate = 0.9; // Slightly slower rate for better clarity
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        
        // Add to queue and speak
        this.utteranceQueue.push(utterance);
        
        await new Promise<void>((resolve) => {
          this.currentUtterance = utterance;
          
          utterance.onend = () => {
            console.log(`Finished chunk ${i+1}/${chunks.length} for ${persona}`);
            this.currentUtterance = null;
            resolve();
          };
          
          utterance.onerror = (event) => {
            console.error(`Speech synthesis error for chunk ${i+1}:`, event);
            this.currentUtterance = null;
            resolve(); // Resolve anyway to continue
          };
          
          // Start speaking
          window.speechSynthesis.speak(utterance);
          
          // Periodically check if speech synthesis has paused unexpectedly
          // This is a workaround for a common browser bug
          const checkInterval = setInterval(() => {
            if (window.speechSynthesis.paused) {
              console.log('Speech synthesis paused unexpectedly, resuming...');
              window.speechSynthesis.resume();
            }
          }, 1000);
          
          // Safety timeout for this chunk
          const wordCount = chunk.split(/\s+/).length;
          const estimatedSeconds = Math.max(5, Math.min(15, Math.ceil(wordCount / 2)));
          
          setTimeout(() => {
            clearInterval(checkInterval);
            
            if (this.currentUtterance === utterance) {
              console.log(`Chunk ${i+1} timeout after ${estimatedSeconds}s, moving to next`);
              window.speechSynthesis.cancel();
              this.currentUtterance = null;
              resolve();
            }
          }, estimatedSeconds * 1000);
        });
        
        // Small pause between chunks
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        console.error(`Error in speech synthesis for chunk ${i+1}:`, error);
        // Continue with next chunk
      }
    }
    
    this.isSpeaking = false;
    console.log(`Finished speaking all chunks for ${persona || 'default'}`);
    return Promise.resolve();
  }
  
  private splitIntoChunks(text: string): string[] {
    // First try to split by paragraphs
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0);
    
    if (paragraphs.length > 1) {
      return paragraphs;
    }
    
    // If there's only one paragraph, split by sentences
    const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
    
    // Group sentences into chunks of 1-2 sentences for better processing
    const chunks: string[] = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if (currentChunk && currentChunk.length + sentence.length > 100) {
        chunks.push(currentChunk);
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks.length > 0 ? chunks : [text];
  }

  private async useBrowserSpeech(text: string, persona?: string): Promise<void> {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);

      // Try to match a voice that sounds most like the persona
      if (persona && window.speechSynthesis.getVoices().length > 0) {
        const voices = window.speechSynthesis.getVoices();
        // Simple matching algorithm - could be improved
        const personaLower = persona.toLowerCase();
        const matchVoice = voices.find(v =>
          v.name.toLowerCase().includes(personaLower) ||
          (v.lang.startsWith('en') && v.name.includes('Male')) // default for most personas
        );

        if (matchVoice) {
          utterance.voice = matchVoice;
        }
      }

      utterance.onend = () => {
        this.isSpeaking = false;
        resolve();
      };

      this.isSpeaking = true;
      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Stops any ongoing speech synthesis
   */
  stopSpeaking(): void {
    console.log('Stopping speech synthesis');
    window.speechSynthesis.cancel();
    this.utteranceQueue = [];
    this.currentUtterance = null;
    this.isSpeaking = false;
  }

  startListening(): Promise<void> {
    console.log('Starting voice listening');
    // Implementation for voice listening
    return Promise.resolve();
  }

  async getAvailableVoices(): Promise<VoiceOption[]> {
    try {
      const response = await fetch(`${this.apiUrl}/voices`);

      if (!response.ok) {
        throw new Error(`Voice API returned ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching voices:', error);
      return [];
    }
  }

  setVoice(voiceId: string): void {
    this.selectedVoice = voiceId;
  }

  updateSettings(settings: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }
}

// Export a singleton instance
export const voiceService = new VoiceService();
