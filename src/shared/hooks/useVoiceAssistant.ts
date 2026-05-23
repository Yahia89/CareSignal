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
      // Check if already speaking
      const isCurrentlySpeaking = await Speech.isSpeakingAsync();
      if (isCurrentlySpeaking) {
        await Speech.stop();
      }

      // Wrap Speech.speak in a promise for proper async handling
      return new Promise<void>((resolve, reject) => {
        try {
          Speech.speak(text, {
            language: 'en',
            pitch: 1.0,
            rate: 0.9,
            onStart: () => console.log('[VoiceAssistant] Started speaking'),
            onDone: () => {
              console.log('[VoiceAssistant] Finished speaking');
              resolve();
            },
            onError: (err) => {
              console.error('[VoiceAssistant] Error during speech', err);
              reject(err);
            },
            ...speechOptions,
          });
        } catch (err) {
          reject(err);
        }
      });
    } catch (error) {
      console.warn('[VoiceAssistant] Exception in speak()', error);
      throw error;
    }
  }, [enabled]);

  const stop = useCallback(() => {
    Speech.stop();
  }, []);

  return { speak, stop };
};
