import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { conversationManager } from "@/lib/conversation-manager";

export default function ConversationDisplay() {
  const [transcript, setTranscript] = useState<string>("");
  const [formattedTranscript, setFormattedTranscript] = useState<Array<{persona?: string, text: string, role: string}>>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Update transcript every second
    const interval = setInterval(async () => {
      const currentTranscript = await conversationManager.saveCurrentTranscript();
      setTranscript(currentTranscript);
      
      // Get the formatted messages from conversation manager
      const messages = await conversationManager.getFormattedMessages();
      setFormattedTranscript(messages);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSave = async () => {
    try {
      await conversationManager.saveToKnowledgeBase();
      toast({
        title: "Success",
        description: "Conversation saved to knowledge base",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save conversation",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Conversation Transcript</CardTitle>
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save to Knowledge Base
        </Button>
      </CardHeader>
      <CardContent>
        <div className="bg-muted p-4 rounded-lg min-h-[200px] max-h-[400px] overflow-y-auto whitespace-pre-wrap">
          {formattedTranscript.length > 0 ? (
            <div className="space-y-4">
              {formattedTranscript.map((message, index) => (
                <div key={index} className={`${message.role === 'user' ? 'text-blue-500' : ''}`}>
                  {message.persona && message.role !== 'user' && (
                    <span className="font-bold text-primary">{message.persona}: </span>
                  )}
                  {message.role === 'user' && <span className="font-bold">You: </span>}
                  <span>{message.text}</span>
                </div>
              ))}
            </div>
          ) : (
            "Conversation will appear here..."
          )}
        </div>
      </CardContent>
    </Card>
  );
}
