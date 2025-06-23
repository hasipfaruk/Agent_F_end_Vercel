
/**
 * A fallback voice service that uses the Web Speech API
 * This is used when ElevenLabs is not available
 */

class FallbackVoiceService {
  private voices: SpeechSynthesisVoice[] = [];
  private leonardoVoice: SpeechSynthesisVoice | null = null;
  private jobsVoice: SpeechSynthesisVoice | null = null;
  
  constructor() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.initVoices();
      // Web Speech API loads voices asynchronously
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoices();
      };
    }
  }
  
  private initVoices() {
    this.voices = window.speechSynthesis.getVoices();
    
    // Try to find deep male voices for Leonardo
    this.leonardoVoice = this.voices.find(v => 
      v.lang.includes('it') && v.name.includes('Male')
    ) || this.voices.find(v => 
      v.lang.includes('en') && v.name.includes('Male')
    ) || this.voices[0];
    
    // Try to find American male voice for Jobs
    this.jobsVoice = this.voices.find(v => 
      v.lang.includes('en-US') && v.name.includes('Male')
    ) || this.voices.find(v => 
      v.lang.includes('en') && v.name.includes('Male')
    ) || this.voices[0];
  }
  
  speak(text: string, persona?: string): Promise<void> {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis not available in this environment');
      return Promise.resolve();
    }
    
    window.speechSynthesis.cancel(); // Clear any pending speech
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Select voice based on persona
    if (persona?.toLowerCase().includes('leonardo')) {
      utterance.voice = this.leonardoVoice;
      utterance.rate = 0.9;
      utterance.pitch = 0.8;
      utterance.rate = 0.9; // Slower for Leonardo
      utterance.pitch = 0.8; // Deeper voice
    } else {
      utterance.voice = this.jobsVoice;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
    }
    
    // Cancel any current speech
    window.speechSynthesis.cancel();
    
    // Speak the new text
    window.speechSynthesis.speak(utterance);
    
    return new Promise<void>((resolve) => {
      utterance.onend = () => resolve();
    });
  }
}

export const fallbackVoiceService = new FallbackVoiceService();
