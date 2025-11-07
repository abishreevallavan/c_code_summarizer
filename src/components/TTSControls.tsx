import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Volume2, VolumeX, Pause } from "lucide-react";
import { toast } from "sonner";

interface TTSControlsProps {
  text: string;
}

export const TTSControls = ({ text }: TTSControlsProps) => {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported("speechSynthesis" in window);
  }, []);

  const handleSpeak = () => {
    if (!supported) {
      toast.error("Text-to-speech is not supported in your browser");
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    if (!text) {
      toast.error("No text to read");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => {
      setSpeaking(false);
      toast.error("Error reading text");
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  if (!supported) {
    return null;
  }

  return (
    <Card className="border-border p-3">
      <div className="flex items-center gap-2">
        <Button
          onClick={handleSpeak}
          variant={speaking ? "secondary" : "default"}
          size="sm"
          disabled={!text}
          className="gap-2"
        >
          {speaking ? (
            <>
              <Pause className="h-4 w-4" />
              Pause
            </>
          ) : (
            <>
              <Volume2 className="h-4 w-4" />
              Read Summary
            </>
          )}
        </Button>
        {speaking && (
          <Button onClick={handleStop} variant="outline" size="sm" className="gap-2">
            <VolumeX className="h-4 w-4" />
            Stop
          </Button>
        )}
      </div>
    </Card>
  );
};
