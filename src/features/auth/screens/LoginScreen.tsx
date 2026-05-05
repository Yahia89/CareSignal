import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { HeartPulse, Volume2, Activity, Users, Bell, Link as LinkIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen, Text, Button, Spacer, Card, NeumorphicView } from '../../../shared/components';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { authService } from '../services/authService';

export const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const { dispatch } = useAuth();
  const theme = useTheme();
  
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
      <Icon size={18} color={color || theme.colors.textSecondary} />
      <Spacer x="sm" />
      <Text variant="caption" color={color || theme.colors.textSecondary} style={{ flex: 1 }}>{text}</Text>
    </View>
  );

  return (
    <Screen style={{ backgroundColor: theme.colors.background }}>
      {/* Decorative background shapes */}
      <View style={[styles.decorativeShape, styles.topLeftShape, { backgroundColor: theme.colors.softMint }]} />
      <View style={[styles.decorativeShape, styles.topRightShape, { backgroundColor: theme.colors.softBlue }]} />
      <View style={[styles.decorativeShape, styles.bottomLeftShape, { backgroundColor: theme.colors.softBeige }]} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Logo */}
        <View style={styles.header}>
          <NeumorphicView 
            borderRadius={16} 
            containerStyle={styles.logoNeumorphic}
            style={styles.logoInner}
          >
            <HeartPulse size={24} color={theme.colors.secondary} strokeWidth={2.5} />
          </NeumorphicView>
          <View>
            <Text variant="subheading" color={theme.colors.secondary} style={styles.logoText}>MEDTECH CARE</Text>
            <Text variant="small" color={theme.colors.textSecondary}>CareSignal</Text>
          </View>
        </View>

        <Spacer y="xl" />

        {/* Main Selection Container */}
        <View style={styles.container}>
          {/* Senior App Section */}
          <NeumorphicView 
            borderRadius={32}
            containerStyle={styles.sectionNeumorphic}
            style={[styles.sectionCard, { backgroundColor: theme.colors.seniorCard }]}
          >
            <View style={styles.badgeContainer}>
              <View style={[styles.badge, { backgroundColor: '#1E293B' }]}>
                <Text variant="small" color="#94A3B8" style={{ fontWeight: '700' }}>SENIOR APP</Text>
              </View>
            </View>
            
            <Text variant="title" color="#FFFFFF" style={styles.cardTitle}>Daily check-ins made simple</Text>
            <Text variant="caption" color="#94A3B8" style={styles.cardDesc}>
              Voice-guided daily wellness check-ins with optional vital capture, one-tap help states, and a calm, senior-friendly experience.
            </Text>

            <Spacer y="lg" />
            
            <BulletPoint icon={HeartPulse} text="I'm OK / I Need Help / Urgent Help" color="#94A3B8" />
            <BulletPoint icon={Volume2} text="Voice prompts and replay support" color="#94A3B8" />
            <BulletPoint icon={Activity} text="Optional blood sugar and blood pressure capture" color="#94A3B8" />

            <Spacer y="xl" />

            <View style={styles.buttonRow}>
              <Button 
                title="Senior Login" 
                backgroundColor={theme.colors.secondary}
                loading={loading === 'elder'}
                onPress={() => handleLogin('elder')}
                style={{ flex: 1 }}
              />
              <Spacer x="md" />
              <Button 
                title="Sign Up" 
                variant="neumorphic"
                onPress={handleSignUp} 
                style={{ flex: 1 }}
              />
            </View>
          </NeumorphicView>

          <Spacer y="lg" />

          {/* Family App Section */}
          <Card style={[styles.sectionCard, { backgroundColor: '#FFFFFF' }]}>
            <View style={styles.badgeContainer}>
              <View style={[styles.badge, { backgroundColor: theme.colors.accent }]}>
                <Text variant="small" color={theme.colors.secondary} style={{ fontWeight: '700' }}>FAMILY APP</Text>
              </View>
            </View>

            <Text variant="title" color={theme.colors.text} style={styles.cardTitle}>Connected family visibility</Text>
            <Text variant="caption" color={theme.colors.textSecondary} style={styles.cardDesc}>
              Family members get live status, alert routing controls, optional vital capture settings, and secure linking to the senior account.
            </Text>

            <Spacer y="lg" />

            <BulletPoint icon={Users} text="Secure family-to-senior linking" />
            <BulletPoint icon={Bell} text="Alert preferences by response level" />
            <BulletPoint icon={LinkIcon} text="Family control over senior-side vital capture" />

            <Spacer y="xl" />

            <View style={styles.buttonRow}>
              <Button 
                title="Family Login" 
                backgroundColor={theme.colors.primary}
                loading={loading === 'family'}
                onPress={() => handleLogin('family')}
                style={{ flex: 1 }}
              />
              <Spacer x="md" />
              <Button 
                title="Sign Up" 
                variant="neumorphic"
                onPress={handleSignUp}
                style={{ flex: 1 }}
              />
            </View>

            <Spacer y="lg" />

            {/* Demo Note */}
            <View style={styles.demoNote}>
              <Text variant="small" color="#92400E">
                Demo accounts: <Text variant="small" color="#92400E" style={{ fontWeight: '700' }}>Eleanor / David Smith</Text> · password: <Text variant="small" color="#92400E" style={{ fontWeight: '700' }}>demo123</Text>
              </Text>
            </View>
          </Card>
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
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoNeumorphic: {
    marginRight: 12,
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
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cardTitle: {
    marginBottom: 12,
    fontSize: 28,
  },
  cardDesc: {
    marginBottom: 8,
    lineHeight: 22,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  demoNote: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  }
});
