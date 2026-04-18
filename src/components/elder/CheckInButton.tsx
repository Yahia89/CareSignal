import React, { useCallback, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';

interface CheckInButtonProps {
  label: string;
  sublabel?: string;
  icon: keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
  textColor?: string;
  onPress: () => void;
  disabled?: boolean;
}

export function CheckInButton({
  label,
  sublabel,
  icon,
  backgroundColor,
  textColor = Colors.textInverse,
  onPress,
  disabled = false,
}: CheckInButtonProps): React.JSX.Element {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 6,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor }, disabled && styles.disabled]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={30} color={textColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.label, { color: textColor }]}>{label}</Text>
          {sublabel && (
            <Text style={[styles.sublabel, { color: textColor }]}>{sublabel}</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={22} color={`${textColor}99`} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 90,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: Typography.fontSizeXl,
    fontWeight: Typography.fontWeightBold,
  },
  sublabel: {
    fontSize: Typography.fontSizeSm,
    opacity: 0.85,
    marginTop: 2,
  },
});
