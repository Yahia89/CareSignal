import * as Speech from 'expo-speech';
import { useCallback } from 'react';

export interface VoiceOptions extends Speech.SpeechOptions {
  force?: boolean;
}

export const useVoiceAssistant = (enabled: boolean = true) => {
  const speak = useCallback(async (text: string, options?: VoiceOptions) => {
    const { force, ...speechOptions } = options || {};
    
    console.log(`[VoiceAssistant] Attempt: "${text}" | Enabled: ${enabled} | Force: ${force}`);
    
    if (!enabled && !force) {
      return;
    }
    
    try {
      // Check if thing is already speaking
      const isCurrentlySpeaking = await Speech.isSpeakingAsync();
      if (isCurrentlySpeaking) {
        await Speech.stop();
      }

      Speech.speak(text, {
        language: 'en',
        pitch: 1.0,
        rate: 0.9,
        // Reliability: omit complex options first
        onStart: () => console.log('[VoiceAssistant] Started speaking'),
        onDone: () => console.log('[VoiceAssistant] Finished speaking'),
        onError: (err) => console.error('[VoiceAssistant] Error during speech', err),
        ...speechOptions,
      });
    } catch (error) {
      console.warn('[VoiceAssistant] Exception in speak()', error);
    }
  }, [enabled]);

  const stop = useCallback(() => {
    Speech.stop();
  }, []);

  return { speak, stop };
};
