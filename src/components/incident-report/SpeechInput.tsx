import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SpeechInputProps {
  onTranscript: (text: string) => void;
}

export const SpeechInput = ({ onTranscript }: SpeechInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        variant: "destructive",
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support speech recognition. Please try using Chrome.",
      });
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "Listening...",
        description: "Start speaking to record your report.",
      });
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error with speech recognition. Please try again.",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }
      
      if (finalTranscript) {
        onTranscript(finalTranscript);
        toast({
          title: "Text Captured",
          description: "Your speech has been converted to text.",
        });
      }
    };

    recognition.start();
  };

  const stopListening = () => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.stop();
    setIsListening(false);
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={isListening ? stopListening : startListening}
      className="gap-2"
    >
      {isListening ? (
        <>
          <MicOff className="h-4 w-4" />
          Stop Dictation
        </>
      ) : (
        <>
          <Mic className="h-4 w-4" />
          Start Dictation
        </>
      )}
    </Button>
  );
};