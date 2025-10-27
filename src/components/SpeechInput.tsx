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
  const [retryCount, setRetryCount] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isManualStopRef = useRef(false);

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
    recognition.maxAlternatives = 1;

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
        
        console.log('🎯 Complete transcript:', newTranscript.trim());
        
        // Parse the complete accumulated transcript, not just the final chunk
        const command = parseVoiceCommand(newTranscript.trim());
        
        console.log('📋 Parsed command result:', command);
        
        if (command.type === 'create' && command.columns) {
          console.log('✅ Creating table with columns:', command.columns);
          onTableCreate(command.columns);
          toast({
            title: t('success'),
            description: t('tableCreated', { count: command.columns.length }),
          });
        } else if (command.type === 'add' && command.rowData) {
          console.log('✅ Adding row with data:', command.rowData);
          onRowAdd(command.rowData);
          toast({
            title: t('success'),
            description: t('rowAdded'),
          });
        } else {
          console.log('⚠️ Command not recognized as create or add');
        }
        
        // Reset retry count on successful recognition
        setRetryCount(0);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      // Handle network errors with automatic retry
      if (event.error === 'network') {
        if (!isManualStopRef.current && retryCount < 2) {
          console.log('Network error, retrying...', retryCount + 1);
          setRetryCount(prev => prev + 1);
          
          // Retry after a short delay
          setTimeout(() => {
            if (recognitionRef.current && isListening) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                console.error('Error restarting recognition:', e);
              }
            }
          }, 1500);
        } else {
          toast({
            title: t('error'),
            description: 'Speech recognition unavailable. Try using the published app or a different browser.',
            variant: 'destructive',
          });
          setIsListening(false);
          setRetryCount(0);
        }
      } else if (event.error === 'not-allowed') {
        toast({
          title: t('error'),
          description: 'Microphone access denied. Please allow microphone permissions in your browser settings.',
          variant: 'destructive',
        });
        setIsListening(false);
      } else if (event.error === 'no-speech') {
        // Don't show error for no-speech, it's normal
        console.log('No speech detected');
      } else if (event.error === 'aborted') {
        // Recognition was aborted, likely user stopped it
        setIsListening(false);
      } else {
        toast({
          title: t('error'),
          description: `Speech recognition error: ${event.error}`,
          variant: 'destructive',
        });
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      console.log('Recognition ended');
      setInterimTranscript('');
      
      // Auto-restart if it wasn't manually stopped and we're supposed to be listening
      if (!isManualStopRef.current && isListening) {
        console.log('Auto-restarting recognition...');
        try {
          recognition.start();
        } catch (e) {
          console.error('Error auto-restarting:', e);
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    recognition.onstart = () => {
      console.log('Recognition started');
      setRetryCount(0);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        isManualStopRef.current = true;
        recognitionRef.current.stop();
      }
    };
  }, [onTableCreate, onRowAdd, t, transcript, isListening, retryCount]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      isManualStopRef.current = true;
      recognitionRef.current.stop();
      setIsListening(false);
      setRetryCount(0);
    } else {
      isManualStopRef.current = false;
      setRetryCount(0);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error('Error starting recognition:', e);
        toast({
          title: t('error'),
          description: 'Could not start speech recognition. Please try again.',
          variant: 'destructive',
        });
      }
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
        
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Note:</strong> If speech recognition doesn't work in preview, try:
            <br />• Publish the app and use the live version
            <br />• Use Chrome or Edge browser
            <br />• Grant microphone permissions when prompted
          </p>
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
