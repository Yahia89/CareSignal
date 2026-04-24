import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const SENIOR_FEATURES = [
  "I'm OK / Need Help / Urgent Help",
  'Voice prompts and replay support',
  'Optional blood sugar and blood pressure capture',
];

const FAMILY_FEATURES = [
  'Secure family-to-senior linking',
  'Alert preferences by response level',
  'Family control over senior-side vital capture',
];

function LogoBrand({ dark }: { dark?: boolean }): React.JSX.Element {
  const color = dark ? Colors.textInverse : Colors.primary;
  const subColor = dark ? 'rgba(255,255,255,0.7)' : Colors.textSecondary;
  return (
    <View style={styles.brandRow}>
      <View style={[styles.brandIconBox, dark && styles.brandIconBoxDark]}>
        <Ionicons name="fitness-outline" size={22} color={dark ? Colors.textInverse : Colors.primary} />
      </View>
      <View>
        <Text style={[styles.brandName, { color }]}>MEDTECH CARE</Text>
        <Text style={[styles.brandSub, { color: subColor }]}>CareSignal</Text>
      </View>
    </View>
  );
}

export function WelcomeScreen({ navigation }: Props): React.JSX.Element {
  const { isLoading, loginAsElder, loginAsFamily } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <LogoBrand />
        </View>

        {/* Senior App Card */}
        <View style={styles.seniorCard}>
          <LogoBrand dark />
          <View style={styles.appBadge}>
            <Text style={styles.appBadgeText}>SENIOR APP</Text>
          </View>
          <Text style={styles.seniorTitle}>Daily check-ins made{'\n'}simple</Text>
          <Text style={styles.seniorDesc}>
            Voice-guided daily wellness check-ins with optional vital capture, one-tap help states, and a calm, senior-friendly experience.
          </Text>
          <View style={styles.featureList}>
            {SENIOR_FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={() => navigation.navigate('SignIn', { role: 'elder' })}
            >
              <Text style={styles.outlineBtnText}>Senior Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.solidBtnLight}
              onPress={() => navigation.navigate('SignUp', { role: 'elder' })}
            >
              <Text style={styles.solidBtnLightText}>Senior Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Family App Card */}
        <View style={styles.familyCard}>
          <View style={styles.appBadgeTeal}>
            <Text style={styles.appBadgeTealText}>FAMILY APP</Text>
          </View>
          <Text style={styles.familyTitle}>Connected family{'\n'}visibility</Text>
          <Text style={styles.familyDesc}>
            Family members get live status, alert routing controls, optional vital capture settings, and secure linking to the senior account.
          </Text>
          <View style={styles.featureList}>
            {FAMILY_FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                <Text style={styles.familyFeatureText}>{f}</Text>
              </View>
            ))}
          </View>
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.outlineBtnTeal}
              onPress={() => navigation.navigate('SignIn', { role: 'family' })}
            >
              <Text style={styles.outlineBtnTealText}>Family Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.solidBtnTeal}
              onPress={() => navigation.navigate('SignUp', { role: 'family' })}
            >
              <Text style={styles.solidBtnTealText}>Family Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Demo note */}
        <View style={styles.demoNote}>
          <Text style={styles.demoNoteText}>
            Senior: margaret@caresignal.com / senior123{'\n'}
            Family: david@caresignal.com / family123
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.backgroundMint,
  },
  scroll: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  brandIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIconBoxDark: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  brandName: {
    fontSize: 11,
    fontWeight: Typography.fontWeightBold,
    letterSpacing: 1.5,
    color: Colors.primary,
  },
  brandSub: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
  },

  // Senior Card (dark teal)
  seniorCard: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xxl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  appBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  appBadgeText: {
    fontSize: Typography.fontSizeXs,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textInverse,
    letterSpacing: 1,
  },
  seniorTitle: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textInverse,
    marginBottom: Spacing.sm,
    lineHeight: 32,
  },
  seniorDesc: {
    fontSize: Typography.fontSizeSm,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  featureList: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureText: {
    fontSize: Typography.fontSizeSm,
    color: 'rgba(255,255,255,0.85)',
    flex: 1,
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  outlineBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  outlineBtnText: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textInverse,
  },
  solidBtnLight: {
    flex: 1,
    backgroundColor: Colors.textInverse,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  solidBtnLightText: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.primary,
  },

  // Family Card (white)
  familyCard: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xxl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  appBadgeTeal: {
    alignSelf: 'flex-start',
    backgroundColor: `${Colors.primary}18`,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    marginBottom: Spacing.md,
  },
  appBadgeTealText: {
    fontSize: Typography.fontSizeXs,
    fontWeight: Typography.fontWeightBold,
    color: Colors.primary,
    letterSpacing: 1,
  },
  familyTitle: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    lineHeight: 32,
  },
  familyDesc: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  familyFeatureText: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
    flex: 1,
  },
  outlineBtnTeal: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  outlineBtnTealText: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textPrimary,
  },
  solidBtnTeal: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  solidBtnTealText: {
    fontSize: Typography.fontSizeMd,
    fontWeight: Typography.fontWeightSemiBold,
    color: Colors.textInverse,
  },

  // Demo note
  demoNote: {
    backgroundColor: `${Colors.warning}22`,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  demoNoteText: {
    fontSize: Typography.fontSizeSm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
