import React, { memo, useState } from 'react';
import { View, TextInput as RNTextInput, TextInputProps, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Text } from './Text';
import { NeumorphicView } from './NeumorphicView';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  /**
   * 'neumorphic' (default) — inset neumorphic look, suits the blue-grey #E9EFFA background.
   * 'flat' — soft bordered style, suits white card backgrounds.
   */
  variant?: 'neumorphic' | 'flat';
}

export const Input = memo(({ label, error, style, variant = 'neumorphic', ...props }: InputProps) => {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  if (variant === 'flat') {
    return (
      <View style={styles.container}>
        {label && (
          <View style={styles.labelContainer}>
            <Text variant="small" color={theme.colors.textSecondary}>{label}</Text>
          </View>
        )}
        <View
          style={[
            styles.flatWrap,
            focused && { borderColor: theme.colors.secondary, borderWidth: 1.5 },
          ]}
        >
          <RNTextInput
            style={[
              styles.input,
              {
                color: theme.colors.text,
                paddingHorizontal: theme.spacing.md,
                fontSize: 15,
              },
              style,
            ]}
            placeholderTextColor="#A0AABA"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...props}
          />
        </View>
        {error && (
          <Text variant="small" color={theme.colors.danger} style={styles.errorText}>
            {error}
          </Text>
        )}
      </View>
    );
  }

  // Default: neumorphic inset (for blue-grey background)
  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text variant="small" color={theme.colors.textSecondary}>{label}</Text>
        </View>
      )}
      <NeumorphicView
        inset
        borderRadius={theme.radii.md}
        style={{ padding: 0 }}
      >
        <RNTextInput
          style={[
            styles.input,
            {
              color: theme.colors.text,
              paddingHorizontal: theme.spacing.md,
              fontSize: 16,
            },
            style,
          ]}
          placeholderTextColor={theme.colors.textSecondary + '80'}
          {...props}
        />
      </NeumorphicView>
      {error && (
        <Text variant="small" color={theme.colors.danger} style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 12,
  },
  labelContainer: {
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    height: 50,
  },
  flatWrap: {
    backgroundColor: '#F1F5FB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8E2EF',
    // Inset shadow simulation for flat style
    shadowColor: '#B8C6D9',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 1,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
  },
});
