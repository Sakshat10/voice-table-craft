import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { parseVoiceCommand, type TableColumn, type TableRow } from '@/utils/commandParser';

interface SpeechInputProps {
  onTableCreate: (columns: TableColumn[]) => void;
  onRowAdd: (rowData: string[]) => void;
}

const SpeechInput = ({ onTableCreate, onRowAdd }: SpeechInputProps) => {
  const { t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        title: t('error'),
        description: t('browserNotSupported'),
        variant: 'destructive',
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setInterimTranscript(interim);

      if (final) {
        const newTranscript = transcript + ' ' + final;
        setTranscript(newTranscript);
        
        // Parse the command
        const command = parseVoiceCommand(final);
        
        if (command.type === 'create' && command.columns) {
          onTableCreate(command.columns);
          toast({
            title: t('success'),
            description: t('tableCreated', { count: command.columns.length }),
          });
        } else if (command.type === 'add' && command.rowData) {
          onRowAdd(command.rowData);
          toast({
            title: t('success'),
            description: t('rowAdded'),
          });
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        toast({
          title: t('error'),
          description: `Speech recognition error: ${event.error}`,
          variant: 'destructive',
        });
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTableCreate, onRowAdd, t, transcript]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      setInterimTranscript('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div className="relative">
          {isListening && (
            <>
              <div className="absolute inset-0 rounded-full bg-accent animate-ripple"></div>
              <div className="absolute inset-0 rounded-full bg-accent animate-ripple" style={{ animationDelay: '0.5s' }}></div>
            </>
          )}
          <Button
            onClick={toggleListening}
            size="lg"
            className={`relative z-10 h-24 w-24 rounded-full ${
              isListening 
                ? 'gradient-accent shadow-glow animate-pulse-listening' 
                : 'gradient-primary'
            }`}
          >
            {isListening ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
          </Button>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm font-medium">
          {isListening ? t('listening') : t('notListening')}
        </p>
      </div>

      {(transcript || interimTranscript) && (
        <Card className="p-4 shadow-card">
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">{t('transcript')}</h3>
          <p className="text-foreground">
            {transcript}
            {interimTranscript && (
              <span className="text-muted-foreground italic"> {interimTranscript}</span>
            )}
          </p>
        </Card>
      )}

      <Card className="p-4 shadow-card bg-secondary/50">
        <h3 className="text-sm font-semibold mb-3 text-primary">{t('exampleCommands')}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-accent font-bold">•</span>
            <p className="text-muted-foreground">{t('exampleCreate')}</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-accent font-bold">•</span>
            <p className="text-muted-foreground">{t('exampleAdd')}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SpeechInput;

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}
