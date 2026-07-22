import * as ImagePicker from 'expo-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import type { VitalType } from '../../../types';

export type VitalScanResult =
  | { ok: true; value: string; raw: string }
  | { ok: false; reason: 'permission' | 'cancelled' | 'no_reading' | 'error'; raw?: string };

/**
 * Open the device camera, run on-device OCR (ML Kit) on the captured photo, and
 * extract a vital reading. No network — the image never leaves the device.
 *
 * OCR on glucometer / BP LCD (7-segment) displays is imperfect, so the caller
 * MUST let the user review and edit the extracted value before saving.
 */
export async function scanVitalFromCamera(vitalType: VitalType): Promise<VitalScanResult> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return { ok: false, reason: 'permission' };

  const shot = await ImagePicker.launchCameraAsync({ quality: 0.6, exif: false });
  const uri = shot.canceled ? undefined : shot.assets?.[0]?.uri;
  if (!uri) return { ok: false, reason: 'cancelled' };

  let raw = '';
  try {
    const result = await TextRecognition.recognize(uri);
    raw = result.text ?? '';
  } catch {
    return { ok: false, reason: 'error' };
  }

  const value = extractReading(raw, vitalType);
  if (!value) return { ok: false, reason: 'no_reading', raw };
  return { ok: true, value, raw };
}

/** Pull the most plausible reading out of raw OCR text. */
function extractReading(text: string, vitalType: VitalType): string | null {
  if (vitalType === 'blood_pressure') {
    // systolic/diastolic like "120/80" — fill the (single-value) field with systolic
    const bp = text.match(/(\d{2,3})\s*[/\\|]\s*(\d{2,3})/);
    if (bp?.[1]) return bp[1];
  }
  // Plausible standalone readings (glucose ~20–600 mg/dL, BP systolic ~70–250).
  const nums = (text.match(/\d{2,3}/g) ?? []).map(Number).filter((n) => n >= 20 && n <= 600);
  if (!nums.length) return null;
  // The largest plausible number on a meter display is usually the main reading.
  return String(Math.max(...nums));
}
