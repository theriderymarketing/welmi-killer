import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent
} from 'expo-speech-recognition';
import { useState } from 'react';

/**
 * Wrapper around expo-speech-recognition for on-device Apple Speech.
 * Free, FR/EN auto-detect, low latency.
 */
export function useVoiceRecognizer() {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  useSpeechRecognitionEvent('result', (e) => {
    if (e.results[0]) setTranscript(e.results[0].transcript);
  });
  useSpeechRecognitionEvent('end', () => setIsRecording(false));

  const start = async () => {
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) throw new Error('speech_permission_denied');

    setTranscript('');
    setIsRecording(true);
    ExpoSpeechRecognitionModule.start({
      lang: 'fr-FR',
      interimResults: true,
      continuous: false,
      requiresOnDeviceRecognition: true,
      addsPunctuation: true
    });
  };

  const stop = (): string => {
    ExpoSpeechRecognitionModule.stop();
    setIsRecording(false);
    return transcript;
  };

  return { transcript, isRecording, start, stop };
}
