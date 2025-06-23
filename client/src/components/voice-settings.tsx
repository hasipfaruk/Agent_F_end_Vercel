import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { voiceService, type VoiceOption } from "@/lib/voice-service";
import { useToast } from "@/hooks/use-toast";
import { Mic2 } from "lucide-react";

export default function VoiceSettings() {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("21m00Tcm4TlvDq8ikWAM");
  const [stability, setStability] = useState(0.75);
  const [similarityBoost, setSimilarityBoost] = useState(0.75);
  const [style, setStyle] = useState(0.5);
  const [speakerBoost, setSpeakerBoost] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    try {
      const availableVoices = await voiceService.getAvailableVoices();
      setVoices(availableVoices);
    } catch (error) {
      toast({
        title: "Error loading voices",
        description: "Failed to load available voices. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVoiceChange = (value: string) => {
    setSelectedVoice(value);
    voiceService.setVoice(value);
  };

  const handleSettingsChange = () => {
    voiceService.updateSettings({
      stability,
      similarityBoost,
      style,
      speakerBoost,
    });
  };

  return (
    <Card className="w-full bg-gradient-to-br from-background to-secondary/5">
      <CardHeader className="flex flex-row items-center gap-2">
        <Mic2 className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Voice Settings</h3>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Voice Selection</Label>
          <Select value={selectedVoice} onValueChange={handleVoiceChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.voice_id} value={voice.voice_id}>
                  {voice.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Stability ({stability})</Label>
            <Slider
              value={[stability]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={([value]) => {
                setStability(value);
                handleSettingsChange();
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Similarity Boost ({similarityBoost})</Label>
            <Slider
              value={[similarityBoost]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={([value]) => {
                setSimilarityBoost(value);
                handleSettingsChange();
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Style ({style})</Label>
            <Slider
              value={[style]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={([value]) => {
                setStyle(value);
                handleSettingsChange();
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Speaker Boost</Label>
            <Switch
              checked={speakerBoost}
              onCheckedChange={(checked) => {
                setSpeakerBoost(checked);
                handleSettingsChange();
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
