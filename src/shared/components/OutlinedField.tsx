import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { colors } from '../design';
import { outlinedFieldStyles as styles } from './OutlinedField.styles';

/**
 * Outlined text field used by the auth screens. Fully rounded by default
 * (matches the dropdown pill aesthetic). Override via `style` (input) and
 * `containerStyle` / `wrapStyle` (wrappers) when a screen needs a tweak.
 *
 * When `secureTextEntry` is true, a Show/Hide toggle is rendered inside the
 * field to let the user reveal the password.
 */
export type OutlinedFieldProps = TextInputProps & {
  error?: string | undefined;
  /** Outer wrapper style — wraps the field + error text. */
  containerStyle?: StyleProp<ViewStyle>;
  /** Pill wrapper style — apply when overriding the border / fill / radius. */
  wrapStyle?: StyleProp<ViewStyle>;
  /** TextInput style. (TextInputProps already declares this; re-stated for docs.) */
  style?: StyleProp<TextStyle>;
};

export const OutlinedField = ({
  error,
  containerStyle,
  wrapStyle,
  style,
  secureTextEntry,
  ...props
}: OutlinedFieldProps) => {
  const isPassword = !!secureTextEntry;
  const [visible, setVisible] = useState(false);
  const effectiveSecure = isPassword && !visible;

  return (
    <View style={[styles.outer, containerStyle]}>
      <View style={[styles.wrap, error ? styles.wrapError : null, wrapStyle]}>
        <TextInput
          {...props}
          secureTextEntry={effectiveSecure}
          placeholderTextColor={colors.text.placeholder}
          style={[styles.input, isPassword ? styles.inputWithToggle : null, style]}
        />
        {isPassword ? (
          <TouchableOpacity
            onPress={() => setVisible((v) => !v)}
            style={styles.toggleBtn}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Hide password' : 'Show password'}
            activeOpacity={0.6}
          >
            <Text style={styles.toggleText}>{visible ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};
