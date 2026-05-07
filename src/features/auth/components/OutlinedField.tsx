import React from 'react';
import { View, TextInput, StyleSheet, Platform, TextInputProps, ViewStyle, StyleProp } from 'react-native';
import { spacing, borderRadius, colors } from '../../../shared/design';

/**
 * Outlined text field used by the new auth screens (Login / SignUp).
 *
 * Visual: transparent fill, light gray border, navy text, gray placeholder.
 * Matches the Figma "Med-Tech-Care" auth design exactly.
 *
 * Kept feature-local because the shared `Input` component still serves the
 * older neumorphic/flat variants used elsewhere in the app.
 */
export type OutlinedFieldProps = TextInputProps & {
  containerStyle?: StyleProp<ViewStyle>;
};

export const OutlinedField = ({ containerStyle, style, ...props }: OutlinedFieldProps) => (
  <View style={[styles.wrap, containerStyle]}>
    <TextInput
      {...props}
      placeholderTextColor={colors.text.secondary}
      style={[styles.input, style]}
    />
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[16],
    marginBottom: spacing[12],
    minHeight: 52,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    color: colors.text.primary,
    paddingVertical: Platform.OS === 'ios' ? spacing[12] : spacing[8],
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
});
