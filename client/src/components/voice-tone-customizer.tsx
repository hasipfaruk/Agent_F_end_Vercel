import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { voiceService } from "@/lib/voice-service";
import { useToast } from "@/hooks/use-toast";

interface VoiceSettings {
  stability: number;
  similarityBoost: number;
  style: number;
}

const DEFAULT_LEONARDO_SETTINGS: VoiceSettings = {
  stability: 0.85,
  similarityBoost: 0.80,
  style: 0.35
};

const DEFAULT_JOBS_SETTINGS: VoiceSettings = {
  stability: 0.67,
  similarityBoost: 0.85,
  style: 0.65
};

export default function VoiceToneCustomizer() {
  const [selectedPersona, setSelectedPersona] = useState<string>("leonardo");
  const [settings, setSettings] = useState<VoiceSettings>(
    selectedPersona === "leonardo" ? DEFAULT_LEONARDO_SETTINGS : DEFAULT_JOBS_SETTINGS
  );
  const { toast } = useToast();

  const handlePersonaChange = (value: string) => {
    setSelectedPersona(value);
    setSettings(value === "leonardo" ? DEFAULT_LEONARDO_SETTINGS : DEFAULT_JOBS_SETTINGS);
  };

  const handleSettingChange = (setting: keyof VoiceSettings, value: number) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
  };

  const handlePreview = async () => {
    try {
      const previewText = selectedPersona === "leonardo"
        ? "The beauty of design lies in its harmony with nature's principles."
        : "Design is not just what it looks like. Design is how it works.";

      await voiceService.synthesizeSpeech({
        text: previewText,
        persona: selectedPersona === "leonardo" ? "Leonardo da Vinci" : "Steve Jobs"
      });

      toast({
        title: "Preview played",
        description: "Voice settings applied successfully.",
      });
    } catch (error) {
      toast({
        title: "Preview failed",
        description: "Failed to play voice preview. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setSettings(selectedPersona === "leonardo" ? DEFAULT_LEONARDO_SETTINGS : DEFAULT_JOBS_SETTINGS);
    toast({
      title: "Settings reset",
      description: "Voice settings have been reset to default values.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Voice Tone Customizer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Persona</label>
          <Select value={selectedPersona} onValueChange={handlePersonaChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="leonardo">Leonardo da Vinci</SelectItem>
              <SelectItem value="jobs">Steve Jobs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Stability ({settings.stability.toFixed(2)})</label>
            <Slider
              value={[settings.stability]}
              onValueChange={([value]) => handleSettingChange("stability", value)}
              min={0}
              max={1}
              step={0.01}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Similarity Boost ({settings.similarityBoost.toFixed(2)})</label>
            <Slider
              value={[settings.similarityBoost]}
              onValueChange={([value]) => handleSettingChange("similarityBoost", value)}
              min={0}
              max={1}
              step={0.01}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Style ({settings.style.toFixed(2)})</label>
            <Slider
              value={[settings.style]}
              onValueChange={([value]) => handleSettingChange("style", value)}
              min={0}
              max={1}
              step={0.01}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handlePreview} className="flex-1">
            Preview Voice
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}