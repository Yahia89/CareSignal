import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { HeartPulse, Volume2, Activity, Users, Bell, Link as LinkIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, Text, Spacer, Card } from '../../../shared/components';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { NeuButton, NeuCard, useColors, useTokens, spacing, borderRadius, getShadowStyle } from '../../../shared/design';
import { authService } from '../services/authService';

export const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const { dispatch } = useAuth();
  const colors = useColors();
  const tokens = useTokens();

  const [loading, setLoading] = useState<string | null>(null);

  const handleLogin = async (role: 'elder' | 'family') => {
    setLoading(role);
    try {
      const response = await authService.login(role === 'elder' ? '123' : '456');
      // Override role just for demo purposes if needed, though service should return it
      dispatch({ 
        type: 'LOGIN', 
        payload: {
          ...response,
          user: { ...response.user, role }
        }
      });
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleSignUp = () => {
    console.log('Navigating to SignUp...');
    navigation.navigate('SignUp' as any);
  };

  const BulletPoint = ({ icon: Icon, text, color }: { icon: any, text: string, color?: string }) => (
    <View style={styles.bulletPoint}>
      <Icon size={18} color={color || colors.text.secondary} />
      <Spacer x="sm" />
      <Text variant="caption" color={color || colors.text.secondary} style={{ flex: 1 }}>{text}</Text>
    </View>
  );

  return (
    <Screen style={{ backgroundColor: colors.background }}>
      {/* Decorative background shapes */}
      <View style={[styles.decorativeShape, styles.topLeftShape, { backgroundColor: colors.accent.lighter }]} />
      <View style={[styles.decorativeShape, styles.topRightShape, { backgroundColor: colors.neutral[200] }]} />
      <View style={[styles.decorativeShape, styles.bottomLeftShape, { backgroundColor: colors.neutral[100] }]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Logo */}
        <View style={styles.header}>
          <View style={[styles.logoNeumorphic, getShadowStyle('md')]}>
            <HeartPulse size={24} color={colors.accent.primary} strokeWidth={2.5} />
          </View>
          <View>
            <Text variant="subheading" color={colors.accent.primary} style={styles.logoText}>MEDTECH CARE</Text>
            <Text variant="small" color={colors.text.secondary}>CareSignal</Text>
          </View>
        </View>

        <Spacer y="xl" />

        {/* Main Selection Container */}
        <View style={styles.container}>
          {/* Senior App Section */}
          <NeuCard style={[styles.sectionCard, { backgroundColor: colors.neutral[800] }]}>
            <View style={styles.badgeContainer}>
              <View style={[styles.badge, { backgroundColor: colors.neutral[900] }]}>
                <Text variant="small" color={colors.neutral[400]} style={{ fontWeight: '700' }}>SENIOR APP</Text>
              </View>
            </View>

            <Text variant="title" color={colors.text.inverse} style={styles.cardTitle}>Daily check-ins made simple</Text>
            <Text variant="caption" color={colors.neutral[300]} style={styles.cardDesc}>
              Voice-guided daily wellness check-ins with optional vital capture, one-tap help states, and a calm, senior-friendly experience.
            </Text>

            <Spacer y="lg" />

            <BulletPoint icon={HeartPulse} text="I'm OK / I Need Help / Urgent Help" color={colors.neutral[300]} />
            <BulletPoint icon={Volume2} text="Voice prompts and replay support" color={colors.neutral[300]} />
            <BulletPoint icon={Activity} text="Optional blood sugar and blood pressure capture" color={colors.neutral[300]} />

            <Spacer y="xl" />

            <View style={styles.buttonRow}>
              <NeuButton
                title="Senior Login"
                loading={loading === 'elder'}
                onPress={() => handleLogin('elder')}
                size="md"
                style={{ flex: 1 }}
              />
              <Spacer x="md" />
              <NeuButton
                title="Sign Up"
                variant="secondary"
                onPress={handleSignUp}
                size="md"
                style={{ flex: 1 }}
              />
            </View>
          </NeuCard>

          <Spacer y="lg" />

          {/* Family App Section */}
          <NeuCard style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
            <View style={styles.badgeContainer}>
              <View style={[styles.badge, { backgroundColor: colors.accent.lighter }]}>
                <Text variant="small" color={colors.accent.primary} style={{ fontWeight: '700' }}>FAMILY APP</Text>
              </View>
            </View>

            <Text variant="title" color={colors.text.primary} style={styles.cardTitle}>Connected family visibility</Text>
            <Text variant="caption" color={colors.text.secondary} style={styles.cardDesc}>
              Family members get live status, alert routing controls, optional vital capture settings, and secure linking to the senior account.
            </Text>

            <Spacer y="lg" />

            <BulletPoint icon={Users} text="Secure family-to-senior linking" />
            <BulletPoint icon={Bell} text="Alert preferences by response level" />
            <BulletPoint icon={LinkIcon} text="Family control over senior-side vital capture" />

            <Spacer y="xl" />

            <View style={styles.buttonRow}>
              <NeuButton
                title="Family Login"
                loading={loading === 'family'}
                onPress={() => handleLogin('family')}
                size="md"
                style={{ flex: 1 }}
              />
              <Spacer x="md" />
              <NeuButton
                title="Sign Up"
                variant="secondary"
                onPress={handleSignUp}
                size="md"
                style={{ flex: 1 }}
              />
            </View>

            <Spacer y="lg" />

            {/* Demo Note */}
            <View style={[styles.demoNote, { backgroundColor: colors.neutral[200] }]}>
              <Text variant="small" color={colors.neutral[700]}>
                Demo accounts: <Text variant="small" color={colors.neutral[700]} style={{ fontWeight: '700' }}>Eleanor / David Smith</Text> · password: <Text variant="small" color={colors.neutral[700]} style={{ fontWeight: '700' }}>demo123</Text>
              </Text>
            </View>
          </NeuCard>
        </View>
        <Spacer y="xxl" />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  decorativeShape: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.4,
  },
  topLeftShape: {
    width: 200,
    height: 200,
    top: -80,
    left: -50,
  },
  topRightShape: {
    width: 180,
    height: 180,
    top: -50,
    right: -50,
  },
  bottomLeftShape: {
    width: 220,
    height: 220,
    bottom: -100,
    left: -60,
  },
  scrollContent: {
    padding: spacing[20],
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoNeumorphic: {
    marginRight: spacing[4],
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: 0,
  },
  logoInner: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  logoText: {
    fontWeight: '800',
  },
  container: {
    width: '100%',
  },
  sectionNeumorphic: {
    marginBottom: 0,
  },
  sectionCard: {
    padding: spacing[20],
    borderRadius: borderRadius.xl,
    marginBottom: spacing[16],
  },
  badgeContainer: {
    flexDirection: 'row',
    marginBottom: spacing[16],
  },
  badge: {
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[6],
    borderRadius: borderRadius.sm,
  },
  cardTitle: {
    marginBottom: spacing[12],
    fontSize: 28,
  },
  cardDesc: {
    marginBottom: spacing[8],
    lineHeight: 22,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[12],
  },
  buttonRow: {
    flexDirection: 'row',
  },
  demoNote: {
    padding: spacing[12],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  }
});
