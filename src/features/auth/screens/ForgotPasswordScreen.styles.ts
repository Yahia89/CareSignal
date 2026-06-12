import { StyleSheet } from "react-native";
import { spacing, figmaColor, figmaFont, figmaRadius } from "../../../shared/design";
import { interFamilyForWeight } from "../../../shared/design/tokens/utils";

export const forgotPasswordStyles = StyleSheet.create({
  header: { backgroundColor: figmaColor.headerBg, paddingTop: spacing[8], paddingBottom: spacing[16] },
  logoSlot: { paddingHorizontal: spacing[20] },
  backRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing[20], marginTop: spacing[8] },
  headerTitle: { fontFamily: interFamilyForWeight(700), fontSize: figmaFont.h2, color: figmaColor.titleNavy, marginLeft: spacing[8] },
  shadowFade1: { position: 'absolute', bottom: -4, left: 0, right: 0, height: 2, backgroundColor: figmaColor.shadowSoft },
  shadowFade2: { position: 'absolute', bottom: -8, left: 0, right: 0, height: 1, backgroundColor: figmaColor.shadowSofter },

  scrollContent: { paddingHorizontal: spacing[20], paddingTop: spacing[24], paddingBottom: spacing[40] },
  eyebrow: { fontFamily: interFamilyForWeight(400), fontSize: figmaFont.body, color: figmaColor.bodyDark, marginBottom: spacing[6] },
  heading: { fontFamily: interFamilyForWeight(600), fontSize: figmaFont.h1, color: figmaColor.bodyDark, lineHeight: 30 },

  h1: { fontFamily: interFamilyForWeight(700), fontSize: figmaFont.h1, color: figmaColor.titleNavy },
  bodyMuted: { fontFamily: interFamilyForWeight(400), fontSize: figmaFont.body, color: figmaColor.bodyDark, lineHeight: 20 },

  card: {
    backgroundColor: figmaColor.cardBg,
    borderRadius: figmaRadius.card,
    padding: spacing[20],
    // Tier A — white card soft float (matches the design system).
    shadowColor: '#3A5575',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.17,
    shadowRadius: 16,
    elevation: 6,
  },
  successCard: { alignItems: 'flex-start', borderWidth: 1, borderColor: figmaColor.green },

  primaryBtn: {
    backgroundColor: figmaColor.titleNavy,
    paddingVertical: 14,
    borderRadius: figmaRadius.btn,
    alignItems: 'center',
    // Tier C — primary-CTA soft float.
    shadowColor: '#5B7FA8',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryBtnText: { fontFamily: interFamilyForWeight(600), fontSize: figmaFont.bodyLg, color: figmaColor.textInverse },

  linkBtn: {
    backgroundColor: figmaColor.surface,
    borderWidth: 1,
    borderColor: figmaColor.border,
    paddingVertical: 14,
    borderRadius: figmaRadius.btn,
    alignItems: 'center',
    // Tier C — secondary-button soft float.
    shadowColor: '#5B7FA8',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  linkBtnText: { fontFamily: interFamilyForWeight(600), fontSize: figmaFont.bodyLg, color: figmaColor.titleNavy },
});
