import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  TextInputProps,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { spacing, borderRadius, colors } from '../../../shared/design';

/**
 * Outlined text field used by the new auth screens (Login / SignUp).
 *
 * Visual: transparent fill, light gray border, navy text, gray placeholder.
 * Pass `error` to switch to an error state (red border + message below).
 */
export type OutlinedFieldProps = TextInputProps & {
  error?: string | undefined;
  containerStyle?: StyleProp<ViewStyle>;
};

export const OutlinedField = ({ error, containerStyle, style, ...props }: OutlinedFieldProps) => (
  <View style={[styles.outer, containerStyle]}>
    <View style={[styles.wrap, error ? styles.wrapError : null]}>
      <TextInput
        {...props}
        placeholderTextColor={colors.text.secondary}
        style={[styles.input, style]}
      />
    </View>
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  outer: { marginBottom: spacing[12] },
  wrap: {
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[16],
    minHeight: 52,
    justifyContent: 'center',
  },
  wrapError: { borderColor: colors.semantic.error },
  input: {
    fontSize: 16,
    color: colors.text.primary,
    paddingVertical: Platform.OS === 'ios' ? spacing[12] : spacing[8],
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  errorText: {
    marginTop: spacing[4],
    marginLeft: spacing[4],
    fontSize: 12,
    color: colors.semantic.error,
  },
});
