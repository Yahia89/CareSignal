import React, { useCallback, useRef, useState } from 'react';
import {
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  value: string;
  onChange: (value: string) => void;
}

export function OTPInput({
  length = 6,
  onComplete,
  value,
  onChange,
}: OTPInputProps): React.JSX.Element {
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [focused, setFocused] = useState<number>(-1);

  const handleChange = useCallback(
    (text: string, index: number) => {
      // Handle paste: if more than 1 char typed at once
      if (text.length > 1) {
        const digits = text.replace(/\D/g, '').slice(0, length);
        const newValue = digits.padEnd(length, ' ').slice(0, length);
        const filled = digits.slice(0, length);
        onChange(filled);
        if (filled.length >= length) {
          onComplete(filled);
          inputRefs.current[length - 1]?.blur();
        } else {
          inputRefs.current[filled.length]?.focus();
        }
        return;
      }

      const digit = text.replace(/\D/g, '');
      const chars = value.split('');
      chars[index] = digit;
      const newValue = chars.join('').slice(0, length);
      onChange(newValue);

      if (digit && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      if (newValue.replace(/\s/g, '').length >= length) {
        onComplete(newValue);
      }
    },
    [value, length, onChange, onComplete],
  );

  const handleKeyPress = useCallback(
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
      if (e.nativeEvent.key === 'Backspace') {
        if (!value[index] && index > 0) {
          const chars = value.split('');
          chars[index - 1] = '';
          onChange(chars.join(''));
          inputRefs.current[index - 1]?.focus();
        } else {
          const chars = value.split('');
          chars[index] = '';
          onChange(chars.join(''));
        }
      }
    },
    [value, onChange],
  );

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, i) => (
        <TouchableOpacity
          key={i}
          activeOpacity={1}
          onPress={() => inputRefs.current[i]?.focus()}
        >
          <TextInput
            ref={(ref) => {
              inputRefs.current[i] = ref;
            }}
            style={[
              styles.box,
              focused === i && styles.boxFocused,
              value[i] ? styles.boxFilled : null,
            ]}
            maxLength={6}
            keyboardType="number-pad"
            value={value[i] ?? ''}
            onChangeText={(t) => handleChange(t, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            onFocus={() => setFocused(i)}
            onBlur={() => setFocused(-1)}
            selectTextOnFocus
            caretHidden
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    textAlign: 'center',
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
  },
  boxFocused: {
    borderColor: Colors.primary,
  },
  boxFilled: {
    borderColor: Colors.primaryLight,
    backgroundColor: '#EBF5FB',
  },
});
