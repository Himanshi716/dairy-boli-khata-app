
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface VoiceInputProps {
  onResult: (transcript: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

export const VoiceInput = ({ onResult, isListening, setIsListening }: VoiceInputProps) => {
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'hi-IN'; // Hindi first, but it can handle English too
      
      recognitionInstance.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
      };
      
      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
        
        if (finalTranscript) {
          console.log('Final transcript:', finalTranscript);
          onResult(finalTranscript);
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'no-speech') {
          toast.error('कुछ सुनाई नहीं दिया / No speech detected');
        } else if (event.error === 'not-allowed') {
          toast.error('माइक की अनुमति दें / Please allow microphone access');
        } else {
          toast.error('आवाज़ की समस्या / Speech recognition error');
        }
      };
      
      recognitionInstance.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    } else {
      toast.error('आपका ब्राउज़र voice input को support नहीं करता / Browser does not support voice input');
    }
  }, [onResult, setIsListening]);

  const startListening = () => {
    if (recognition && !isListening) {
      setTranscript('');
      recognition.start();
      toast.success('बोलना शुरू करें... / Start speaking...');
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <Button
          onClick={isListening ? stopListening : startListening}
          size="lg"
          className={`w-32 h-32 rounded-full text-2xl transition-all duration-300 ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg' 
              : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          {isListening ? '🔴' : '🎤'}
        </Button>
      </div>
      
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">
          {isListening ? 'सुन रहा हूँ... / Listening...' : 'बोलने के लिए दबाएं / Tap to speak'}
        </p>
      </div>
      
      {transcript && (
        <div className="bg-gray-100 p-3 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Transcript:</p>
          <p className="text-gray-800">{transcript}</p>
        </div>
      )}
    </div>
  );
};
