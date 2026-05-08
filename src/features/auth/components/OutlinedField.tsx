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
import { spacing, borderRadius, colors, typography } from '../../../shared/design';

/**
 * Outlined text field used by the auth screens.
 *
 * Exact Figma values (Med-Tech-Care):
 *   - Height 41, border 1px #8D98A7, radius 8
 *   - Fill #F1F5F9 (subtle blue-tint, NOT transparent)
 *   - Placeholder: Segoe UI 400 / 15px / #A6B1C3
 *
 * `error` prop turns the border red and shows a 12px message below.
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
        placeholderTextColor={colors.text.placeholder}
        style={[styles.input, style]}
      />
    </View>
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  outer: { marginBottom: spacing[12] },
  wrap: {
    height: 41,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.inputFill.light,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing[16],
    justifyContent: 'center',
  },
  wrapError: { borderColor: colors.semantic.error },
  input: {
    fontSize: typography.fontSize.field,
    fontWeight: '400',
    color: colors.text.primary,
    fontFamily: typography.fontFamily.default,
    padding: 0, // RN Android adds 4px default; kill it so 15px text is centered in a 41px box
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  errorText: {
    marginTop: spacing[4],
    marginLeft: spacing[4],
    fontSize: 12,
    color: colors.semantic.error,
  },
});
