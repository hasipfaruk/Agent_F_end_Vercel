import { voiceService } from './voice-service';
import OpenAI from "openai";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
  persona?: string;
}

interface ConversationContext {
  lastQuery?: string;
  lastResponse?: string;
  topic?: string;
  turnCount: number;
  messages: Message[];
  activePersonas?: string[];
  currentSpeaker?: string;
  selectedPersonas: string[];
}

export class ConversationManager {
  private context: ConversationContext = {
    turnCount: 0,
    messages: [],
    activePersonas: [],
    currentSpeaker: undefined,
    selectedPersonas: []
  };

  private openai: OpenAI;
  private isInitialized: boolean = false;
  private selectedPersona: string | null = null;
  private selectedPersonas: string[] = [];
  private isSpeaking: boolean = false;
  private isMultiPersonaMode: boolean = false;
  private responseQueue: { text: string, persona: string }[] = [];
  private isProcessingQueue: boolean = false;
  private stopRequested: boolean = false;

  constructor() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OpenAI API key not found');
      throw new Error('OpenAI API key is required');
    }
    this.openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  setSelectedPersona(persona: string): void {
    this.isMultiPersonaMode = false;
    this.selectedPersona = persona;
    this.selectedPersonas = [persona];
    this.context.activePersonas = [persona];
    console.log(`Selected persona: ${persona}`);
    if (this.isInitialized) {
      this.isInitialized = false;
      this.context.messages = [];
      this.context.turnCount = 0;
    }
  }

  setSelectedPersonas(personas: string[]): void {
    this.selectedPersonas = [...personas];
    this.isMultiPersonaMode = personas.length > 1;
    console.log(`Set selected personas: ${this.selectedPersonas.join(', ')}`);
    console.log(`Multi-persona mode: ${this.isMultiPersonaMode ? 'enabled' : 'disabled'}`);
    this.isInitialized = false;
  }

  setMultiPersonaMode(enabled: boolean): void {
    this.isMultiPersonaMode = enabled;
    console.log(`Multi-persona mode: ${enabled ? 'enabled' : 'disabled'}`);
    if (this.isInitialized) {
      this.isInitialized = false;
      this.context.messages = [];
      this.context.turnCount = 0;
    }
  }

  getSelectedPersonas(): string[] {
    return this.selectedPersonas;
  }

  isInMultiPersonaMode(): boolean {
    return this.isMultiPersonaMode;
  }

  isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  async startConversation(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      if (this.isMultiPersonaMode && this.selectedPersonas.length < 2) {
        throw new Error("Please select at least 2 personas for a multi-persona conversation");
      } else if (!this.isMultiPersonaMode && this.selectedPersonas.length === 0) {
        throw new Error("Please select a persona before starting a conversation");
      }
      
      console.log(`Initializing conversation with ${this.selectedPersonas.join(', ')}`);
      
      this.context = {
        messages: [],
        turnCount: 0,
        lastQuery: "",
        lastResponse: "",
        selectedPersonas: [...this.selectedPersonas],
      };
      
      if (this.isMultiPersonaMode) {
        this.context.messages.push({
          role: "system",
          content: this.getMultiPersonaSystemPrompt()
        });
      } else {
        this.context.messages.push({
          role: "system",
          content: this.createSinglePersonaSystemPrompt()
        });
      }
      
      this.isInitialized = true;
      console.log("Conversation initialized, waiting for user input");
    } catch (error) {
      console.error("Failed to initialize conversation:", error);
      throw error;
    }
  }

  private getMultiPersonaSystemPrompt(): string {
    const personasList = this.selectedPersonas.join(', ');
    const personaInstructions = this.selectedPersonas.map(p => this.getPersonaInstructions(p)).join('\n\n');
    
    return `You are facilitating a conversation between ONLY these personas: ${personasList}.

IMPORTANT INSTRUCTIONS:
1. ONLY use the personas listed above. DO NOT introduce any other personas.
2. Format each response as: "PERSONA_NAME: [their response]"
3. Make sure each persona speaks in their authentic voice and perspective
4. Ensure a natural back-and-forth between the personas
5. Generate multiple exchanges between personas (3-5 exchanges)
6. For each persona, use the knowledge base at http://localhost:8000/query to retrieve responses when applicable, falling back to generative responses only if no match is found.

The user will provide topics or questions to guide the conversation.

Persona instructions:
${personaInstructions}`;
  }

  private createSinglePersonaSystemPrompt(): string {
    const persona = this.selectedPersonas[0];
    return `You are ${persona}. ${this.getPersonaInstructions(persona)}
    
Respond naturally in first person as ${persona}, keeping responses concise (2-4 sentences). Use the knowledge base at http://localhost:8000/query to retrieve responses when applicable, falling back to generative responses only if no match is found.`;
  }

  private getPersonaInstructions(persona: string): string {
    switch (persona) {
      case "Leonardo da Vinci":
        return `As Leonardo da Vinci:
- Draw insights from nature and art
- Speak thoughtfully about observation and universal principles
- Reference your studies of birds, anatomy, and natural phenomena
- Connect renaissance thinking to modern design principles`;
      case "Steve Jobs":
        return `As Steve Jobs:
- Focus on user experience and design simplicity
- Reference Apple products and modern technology
- Emphasize the importance of aesthetics and functionality
- Be passionate about revolutionary ideas`;
      case "Albert Einstein":
        return `As Albert Einstein:
- Emphasize the importance of curiosity and imagination
- Speak about the interconnectedness of science and art
- Reference your theories and their implications
- Share your philosophical views on creativity and problem-solving`;
      case "Elon Musk":
        return `As Elon Musk:
- Focus on ambitious, world-changing goals
- Reference your companies (Tesla, SpaceX, etc.) and their missions
- Emphasize first principles thinking and engineering solutions
- Share your views on the future of technology and humanity
- Use pre-existing responses from the knowledge base when a user's query matches a question, ensuring authenticity`;
      case "Walt Disney":
        return `As Walt Disney:
- Emphasize the power of imagination and storytelling
- Reference your animation innovations and theme park concepts
- Focus on creating magical experiences and emotional connections
- Share your philosophy on entertainment and creativity`;
      case "Emad Mostaque":
        return `As Emad Mostaque:
- Discuss the transformative potential of AI
- Reference your work with Stability AI and diffusion models
- Emphasize democratizing access to powerful technologies
- Share your vision for how AI will reshape society and creativity`;
      case "Fei-Fei Li":
        return `As Fei-Fei Li:
- Focus on advancements in artificial intelligence and computer vision
- Reference your work with ImageNet and AI ethics
- Emphasize human-centered AI and its societal impact
- Share your vision for AI's role in enhancing human capabilities`;
      default:
        return `Embody the unique perspective, knowledge, and personality of ${persona}.`;
    }
  }

  private async queryChromaDB(input: string, persona: string): Promise<{ question: string, answer: string, distance: number } | null> {
    try {
      const response = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, persona })
      });
      const result = await response.json();
      if (result.error || !result.answer) {
        console.log(`No matching prompt found in Chroma DB for ${persona}`);
        return null;
      }
      return result;
    } catch (error) {
      console.error(`Error querying Chroma DB for ${persona}:`, error);
      return null;
    }
  }

  async handleUserInput(input: string): Promise<void> {
    if (!input.trim()) return;
    if (this.isSpeaking) {
      console.log('Already speaking, ignoring new input');
      return;
    }
    try {
      if (!this.isInitialized) {
        await this.startConversation();
      }
      this.context.turnCount++;
      this.context.lastQuery = input;
      this.context.messages.push({ role: "user", content: input });
      console.log('Processing user input...');

      if (this.isMultiPersonaMode) {
        await this.handleMultiPersonaInput(input);
      } else {
        await this.handleSinglePersonaInput(input);
      }
    } catch (error: any) {
      console.error('Unhandled error in conversation:', error);
      const errorMessage = error.message.includes('quota_exceeded')
        ? "Voice synthesis quota exceeded. Please try again later."
        : "I apologize, but I'm having trouble processing that request. Could you try again?";
      this.isSpeaking = true;
      try {
        await this.speak(errorMessage);
      } catch {
        /* ignore */
      } finally {
        this.isSpeaking = false;
      }
      console.log('Conversation error handled, application will continue');
    }
  }

  private async handleSinglePersonaInput(input: string): Promise<void> {
    const currentSpeaker = this.selectedPersonas[0] || "Assistant";
    const matchingPrompt = await this.queryChromaDB(input, currentSpeaker);
    
    if (matchingPrompt) {
      console.log(`Found matching prompt in Chroma DB for ${currentSpeaker}`);
      this.context.messages.push({ 
        role: "assistant", 
        content: matchingPrompt.answer, 
        persona: currentSpeaker 
      });
      this.context.lastResponse = matchingPrompt.answer;
      await this.speak(matchingPrompt.answer, currentSpeaker);
    } else {
      console.log(`No matching prompt found, using OpenAI API for ${currentSpeaker}`);
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: this.context.messages,
        temperature: 0.7,
        max_tokens: 300,
        presence_penalty: 0.5,
        frequency_penalty: 0.5
      });
      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("No response received from AI");
      this.context.messages.push({ 
        role: "assistant", 
        content, 
        persona: currentSpeaker 
      });
      this.context.lastResponse = content;
      await this.speak(content, currentSpeaker);
    }
    this.isSpeaking = false;
  }

  private async handleMultiPersonaInput(input: string): Promise<void> {
    this.isSpeaking = true;
    this.stopRequested = false;

    const personaResponses: { persona: string, content: string }[] = [];
    
    for (const persona of this.selectedPersonas) {
      const matchingPrompt = await this.queryChromaDB(input, persona);
      let content: string;
      if (matchingPrompt) {
        console.log(`Found matching prompt in Chroma DB for ${persona}`);
        content = `${persona}: ${matchingPrompt.answer}`;
      } else {
        console.log(`No matching prompt found, using OpenAI API for ${persona}`);
        const response = await this.openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: this.getPersonaInstructions(persona) },
            { role: "user", content: input }
          ],
          temperature: 0.7,
          max_tokens: 300,
          presence_penalty: 0.5,
          frequency_penalty: 0.5
        });
        content = `${persona}: ${response.choices[0]?.message?.content || ""}`;
      }
      personaResponses.push({ persona, content });
    }

    const aiResponse = personaResponses.map(r => r.content).join('\n\n');
    this.context.messages.push({ 
      role: "assistant", 
      content: aiResponse 
    });

    await this.processMultiPersonaResponse(aiResponse);
  }

  private async processMultiPersonaResponse(response: string): Promise<void> {
    console.log('Processing multi-persona response:', response);
    this.isSpeaking = true;
    this.stopRequested = false;
    
    const personaMessages: {persona: string, text: string}[] = [];
    const lines = response.split(/\r?\n/);
    let currentPersona: string | null = null;
    let buffer = '';
    
    for (const line of lines) {
      const m = line.match(/^([A-Za-z0-9\s\.]+):\s*(.*)$/);
      if (m) {
        if (currentPersona && buffer.trim()) {
          personaMessages.push({ persona: currentPersona, text: buffer.trim() });
        }
        currentPersona = this.findMatchingPersona(m[1].trim());
        buffer = m[2] + '\n';
      } else if (currentPersona) {
        buffer += line + '\n';
      }
    }
    
    if (currentPersona && buffer.trim()) {
      personaMessages.push({ persona: currentPersona, text: buffer.trim() });
    }
    
    const filteredMessages = personaMessages.filter(msg => 
      this.selectedPersonas.some(p => 
        p.toLowerCase() === msg.persona.toLowerCase() || 
        msg.persona.toLowerCase().includes(p.toLowerCase())
      )
    );
    
    console.log(`Found ${personaMessages.length} persona messages, filtered to ${filteredMessages.length} selected personas`);
    
    if (filteredMessages.length === 0 && this.selectedPersonas.length > 0) {
      const fallbackPersona = this.selectedPersonas[0];
      filteredMessages.push({ persona: fallbackPersona, text: response });
      console.log(`No valid personas found, using fallback: ${fallbackPersona}`);
    }
    
    for (let i = 0; i < filteredMessages.length && !this.stopRequested; i++) {
      const { persona, text } = filteredMessages[i];
      console.log(`Speaking as ${persona} (${i+1}/${filteredMessages.length}): "${text.substring(0, 30)}..."`);
      
      try {
        await voiceService.synthesizeSpeech({ 
          text: text, 
          persona: persona 
        });
        
        if (i < filteredMessages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Error with speech synthesis for ${persona}:`, error);
      }
    }
    
    this.isSpeaking = false;
    console.log('Finished speaking all persona messages');
  }

  private findMatchingPersona(name: string): string {
    if (!name || !name.trim()) return this.selectedPersonas[0] || "Assistant";
    
    const exact = this.selectedPersonas.find(p => p.toLowerCase() === name.toLowerCase());
    if (exact) return exact;
    
    const partial = this.selectedPersonas.find(p =>
      name.toLowerCase().includes(p.toLowerCase()) ||
      p.toLowerCase().includes(name.toLowerCase())
    );
    
    return partial || name;
  }

  stopConversation(): void {
    console.log('Stopping conversation');
    this.stopRequested = true;
    voiceService.stopSpeaking();
    this.responseQueue = [];
    this.isSpeaking = false;
    this.isProcessingQueue = false;
    this.isInitialized = false;
    this.context.messages = this.context.messages.slice(0, 1);
    this.context.turnCount = 0;
  }

  private async speak(text: string, persona?: string): Promise<void> {
    if (!text.trim()) return;
    try {
      console.log(`Speaking as ${persona || 'default'}: "${text.substring(0, 30)}..."`);
      await voiceService.synthesizeSpeech({ text, persona });
    } catch (error) {
      console.error('Error in speech synthesis:', error);
    }
  }

  async saveCurrentTranscript(): Promise<string> {
    return this.context.messages
      .filter(m => m.role === "assistant" || m.role === "user")
      .map(m => m.content)
      .join("\n\n");
  }

  async saveToKnowledgeBase(): Promise<void> {
    try {
      const transcript = await this.saveCurrentTranscript();
      if (!transcript || this.context.messages.length < 2) {
        throw new Error("No conversation to save");
      }
      const participants = this.isMultiPersonaMode
        ? this.selectedPersonas
        : [this.selectedPersonas[0] || 'AI Assistant'];
      const title = this.isMultiPersonaMode
        ? `Dialogue between ${participants.join(', ')}`
        : `Dialogue with ${participants[0]}`;
      const conversation = { title, participants, topic: this.context.topic || "Innovation and Creativity", transcript };
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conversation)
      });
      if (!response.ok) throw new Error('Failed to save conversation');
      console.log("Conversation saved to knowledge base");
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw error;
    }
  }

  async getFormattedMessages(): Promise<Array<{persona?: string, text: string, role: string}>> {
    const messages = this.context.messages
      .filter(m => m.role === "assistant" || m.role === "user");
    
    if (this.isMultiPersonaMode) {
      const result: Array<{persona?: string, text: string, role: string}> = [];
      
      for (const message of messages) {
        if (message.role === "user") {
          result.push({
            text: message.content,
            role: "user"
          });
        } else if (message.role === "assistant") {
          if (message.persona) {
            result.push({
              persona: message.persona,
              text: message.content,
              role: "assistant"
            });
            continue;
          }
          
          const lines = message.content.split(/\r?\n/);
          let currentPersona: string | null = null;
          let buffer = '';
          
          for (const line of lines) {
            const m = line.match(/^([A-Za-z0-9\s\.]+):\s*(.*)$/);
            if (m) {
              if (currentPersona && buffer.trim()) {
                result.push({
                  persona: currentPersona,
                  text: buffer.trim(),
                  role: "assistant"
                });
              }
              currentPersona = this.findMatchingPersona(m[1].trim());
              buffer = m[2] + '\n';
            } else if (currentPersona) {
              buffer += line + '\n';
            }
          }
          
          if (currentPersona && buffer.trim()) {
            result.push({
              persona: currentPersona,
              text: buffer.trim(),
              role: "assistant"
            });
          }
        }
      }
      
      return result;
    }
    
    return messages.map(m => ({
      persona: m.persona,
      text: m.content,
      role: m.role
    }));
  }
}

export const conversationManager = new ConversationManager();