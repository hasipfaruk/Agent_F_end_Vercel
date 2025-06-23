import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Trash2, Plus, Command } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface VoiceCommand {
  id: string;
  trigger: string;
  response: string;
}

export default function VoiceCommands() {
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [newTrigger, setNewTrigger] = useState("");
  const [newResponse, setNewResponse] = useState("");
  const { toast } = useToast();

  const addCommand = () => {
    if (!newTrigger.trim() || !newResponse.trim()) {
      toast({
        title: "Invalid Command",
        description: "Both trigger phrase and response are required.",
        variant: "destructive",
      });
      return;
    }

    const newCommand: VoiceCommand = {
      id: Date.now().toString(),
      trigger: newTrigger.trim().toLowerCase(),
      response: newResponse.trim(),
    };

    setCommands([...commands, newCommand]);
    setNewTrigger("");
    setNewResponse("");

    toast({
      title: "Command Added",
      description: "Your custom voice command has been added.",
    });
  };

  const removeCommand = (id: string) => {
    setCommands(commands.filter(cmd => cmd.id !== id));
    toast({
      title: "Command Removed",
      description: "Your custom voice command has been removed.",
    });
  };

  return (
    <Card className="w-full bg-gradient-to-br from-background to-secondary/5">
      <CardHeader className="flex flex-row items-center gap-2">
        <Command className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Custom Voice Commands</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Input
            placeholder="When I say... (e.g., 'what's the weather')"
            value={newTrigger}
            onChange={(e) => setNewTrigger(e.target.value)}
          />
          <Input
            placeholder="AI should respond... (e.g., 'Here's the current weather')"
            value={newResponse}
            onChange={(e) => setNewResponse(e.target.value)}
          />
          <Button 
            onClick={addCommand}
            className="w-full bg-primary"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Command
          </Button>
        </div>

        <div className="space-y-2">
          {commands.map((command) => (
            <div
              key={command.id}
              className="flex items-center justify-between p-3 bg-background rounded-lg border"
            >
              <div className="flex-1 mr-4">
                <p className="font-medium text-sm">"{command.trigger}"</p>
                <p className="text-sm text-muted-foreground">➔ "{command.response}"</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCommand(command.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
