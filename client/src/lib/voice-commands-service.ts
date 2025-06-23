import { z } from "zod";

export const voiceCommandSchema = z.object({
  id: z.string(),
  trigger: z.string().min(1),
  response: z.string().min(1),
});

export type VoiceCommand = z.infer<typeof voiceCommandSchema>;

class VoiceCommandService {
  private commands: VoiceCommand[] = [];

  addCommand(command: Omit<VoiceCommand, "id">): VoiceCommand {
    const newCommand: VoiceCommand = {
      id: Date.now().toString(),
      ...command,
    };
    this.commands.push(newCommand);
    this.saveCommands();
    return newCommand;
  }

  removeCommand(id: string): void {
    this.commands = this.commands.filter(cmd => cmd.id !== id);
    this.saveCommands();
  }

  getCommands(): VoiceCommand[] {
    return [...this.commands];
  }

  findMatchingCommand(input: string): VoiceCommand | undefined {
    const normalizedInput = input.toLowerCase().trim();
    return this.commands.find(cmd => 
      normalizedInput.includes(cmd.trigger.toLowerCase())
    );
  }

  private saveCommands(): void {
    try {
      localStorage.setItem('voiceCommands', JSON.stringify(this.commands));
    } catch (error) {
      console.error('Error saving voice commands:', error);
    }
  }

  loadCommands(): void {
    try {
      const saved = localStorage.getItem('voiceCommands');
      if (saved) {
        this.commands = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading voice commands:', error);
      this.commands = [];
    }
  }
}

export const voiceCommandService = new VoiceCommandService();
voiceCommandService.loadCommands(); // Load saved commands on init
