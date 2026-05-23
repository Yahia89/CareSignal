import { StyleSheet } from 'react-native';
import {
  spacing,
  figmaColor,
  figmaFont,
  figmaRadius,
} from '../../../shared/design';
import { interFamilyForWeight } from '../../../shared/design/tokens/utils';

export const settingsScreenStyles = StyleSheet.create({
  // Header
  header: {
    backgroundColor: figmaColor.headerBg,
    paddingTop: spacing[8],
    paddingBottom: spacing[16],
  },
  logoSlot: {
    paddingHorizontal: spacing[20],
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[20],
    marginTop: spacing[8],
  },
  headerTitle: {
    fontFamily: interFamilyForWeight(700),
    fontSize: figmaFont.h2,
    color: figmaColor.titleNavy,
    marginLeft: spacing[8],
  },
  shadowFade1: {
    position: 'absolute',
    bottom: -4,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: figmaColor.shadowSoft,
  },
  shadowFade2: {
    position: 'absolute',
    bottom: -8,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: figmaColor.shadowSofter,
  },

  // Body
  scrollContent: {
    paddingHorizontal: spacing[20],
    paddingTop: spacing[24],
    paddingBottom: spacing[24],
  },
  eyebrow: {
    fontFamily: interFamilyForWeight(400),
    fontSize: figmaFont.body,
    color: figmaColor.bodyDark,
    marginBottom: spacing[6],
  },
  heading: {
    fontFamily: interFamilyForWeight(600),
    fontSize: figmaFont.h3,
    color: figmaColor.bodyDark,
    lineHeight: 26,
  },

  // Cards
  card: {
    backgroundColor: figmaColor.cardBg,
    borderRadius: figmaRadius.cardLg,
    padding: spacing[20],
  },
  cardEyebrow: {
    fontFamily: interFamilyForWeight(400),
    fontSize: figmaFont.body,
    color: figmaColor.bodyDark,
    marginBottom: spacing[8],
  },
  sectionTitle: {
    fontFamily: interFamilyForWeight(700),
    fontSize: figmaFont.h2,
    color: figmaColor.titleNavy,
    marginBottom: spacing[16],
  },

  // Vital row
  vitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vitalTitle: {
    fontFamily: interFamilyForWeight(700),
    fontSize: figmaFont.h2,
    color: figmaColor.titleNavy,
    marginBottom: 4,
  },
  vitalDescription: {
    fontFamily: interFamilyForWeight(400),
    fontSize: figmaFont.small,
    color: figmaColor.bodyDark,
    lineHeight: 18,
  },

  // Toggle
  toggleTrack: {
    width: 52,
    height: 30,
    borderRadius: figmaRadius.toggle,
    padding: 3,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: figmaColor.surface,
  },
  toggleKnobOn: {
    alignSelf: 'flex-end',
  },
  toggleKnobOff: {
    alignSelf: 'flex-start',
  },

  // Checkbox row (outlined button look)
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: figmaColor.surface,
    borderWidth: 1,
    borderColor: figmaColor.border,
    borderRadius: 12,
    paddingHorizontal: spacing[16],
    paddingVertical: 14,
    marginBottom: spacing[12],
  },
  checkboxLabel: {
    flex: 1,
    fontFamily: interFamilyForWeight(400),
    fontSize: figmaFont.bodyXl,
    color: figmaColor.titleNavy,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: figmaColor.titleNavy,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxOn: {
    backgroundColor: figmaColor.green,
    borderColor: figmaColor.green,
  },

  bodyText: { fontFamily: interFamilyForWeight(400), fontSize: figmaFont.body, color: figmaColor.bodyDark },
  smallMuted: { fontFamily: interFamilyForWeight(400), fontSize: figmaFont.caption, color: figmaColor.textMuted },

  // Action links
  linkBtn: {
    backgroundColor: figmaColor.surface,
    borderWidth: 1,
    borderColor: figmaColor.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  linkBtnText: {
    fontFamily: interFamilyForWeight(600),
    fontSize: figmaFont.bodyLg,
    color: figmaColor.titleNavy,
  },
  retryBtn: {
    alignSelf: 'flex-start',
    backgroundColor: figmaColor.surface,
    borderWidth: 1,
    borderColor: figmaColor.border,
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[8],
    borderRadius: figmaRadius.fieldSm,
  },
  retryBtnText: {
    fontFamily: interFamilyForWeight(600),
    fontSize: figmaFont.small,
    color: figmaColor.titleNavy,
  },
});
