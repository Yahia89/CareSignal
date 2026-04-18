import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types';
import { AppButton } from '../../components/common/AppButton';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props): React.JSX.Element {
  const { isLoading, loginAsElder, loginAsFamily } = useAuth();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Fade in on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for heart icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.18,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim, fadeAnim, slideAnim]);

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View
        style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        {/* Logo Area */}
        <View style={styles.logoSection}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <View style={styles.iconCircle}>
              <Ionicons name="heart" size={52} color={Colors.urgent} />
            </View>
          </Animated.View>
          <Text style={styles.appName}>CareSignal™</Text>
          <Text style={styles.tagline}>Peace of Mind Between Visits</Text>
        </View>

        {/* Feature bullets */}
        <View style={styles.features}>
          {[
            { icon: 'checkmark-circle', text: 'Daily safety check-ins for elders' },
            { icon: 'notifications', text: 'Instant alerts for your family' },
            { icon: 'shield-checkmark', text: 'Simple, trusted, private' },
          ].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons name={f.icon as any} size={20} color={Colors.primary} />
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* CTAs */}
        <View style={styles.ctas}>
          <AppButton
            label="I'm a Family Member"
            variant="primary"
            fullWidth
            size="lg"
            leftIcon={<Ionicons name="people" size={20} color={Colors.textInverse} />}
            onPress={() => navigation.navigate('SignIn')}
          />
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>
          <AppButton
            label="I'm an Elder"
            variant="secondary"
            fullWidth
            size="lg"
            leftIcon={<Ionicons name="person" size={20} color={Colors.primary} />}
            onPress={() => navigation.navigate('SignIn')}
          />
        </View>

        {/* Demo shortcuts */}
        <View style={styles.demoSection}>
          <Text style={styles.demoLabel}>Demo quick access:</Text>
          <View style={styles.demoRow}>
            <AppButton
              label="Elder Demo"
              variant="ghost"
              size="sm"
              loading={isLoading}
              onPress={loginAsElder}
            />
            <AppButton
              label="Family Demo"
              variant="ghost"
              size="sm"
              loading={isLoading}
              onPress={loginAsFamily}
            />
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.huge,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FDF2F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.urgent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  appName: {
    fontSize: Typography.fontSize3xl,
    fontWeight: Typography.fontWeightExtraBold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: Typography.fontSizeLg,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  features: {
    marginBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  featureText: {
    fontSize: Typography.fontSizeMd,
    color: Colors.textSecondary,
  },
  ctas: {
    gap: Spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizeSm,
  },
  demoSection: {
    marginTop: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  demoLabel: {
    fontSize: Typography.fontSizeXs,
    color: Colors.textDisabled,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  demoRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});
