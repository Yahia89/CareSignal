import { StyleSheet } from "react-native";
import { spacing, borderRadius, colors as staticColors } from "../../../shared/design";
import { interFamilyForWeight } from "../../../shared/design/tokens/utils";

// Layout + theme constants used only inside this screen's styles.
const FORM_MAX_WIDTH = 480;
const NAVY = staticColors.text.primary; // #36597D
const SHADOW_COLOR = '#C9D9E8';

export const checkInHomeStyles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing[48],
  },

  // White header section — full-width, distinct bg from the page.
  whiteHeader: {
    backgroundColor: '#FFFFFF',
    paddingTop: spacing[16],
  },
  headerInner: {
    paddingHorizontal: spacing[24],
    paddingBottom: spacing[4],
  },
  headerInnerTablet: {
    maxWidth: FORM_MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing[12],
    paddingBottom: spacing[4],
  },
  logoSlot: { flex: 1 },
  logoutBtn: {
    minHeight: 40,
    paddingHorizontal: spacing[16],
    borderRadius: borderRadius.full,
    marginLeft: spacing[12],
  },
  dailyCheckin: {
    fontSize: 18,
    fontFamily: interFamilyForWeight(700),
    color: NAVY,
    letterSpacing: 0,
    marginTop: spacing[8],
  },

  // Soft fade at the bottom of the white header (page-bg boundary).
  // Same technique as LogoCard's separator.
  shadowFade1: { height: 1, backgroundColor: SHADOW_COLOR, opacity: 1 },
  shadowFade2: { height: 1, backgroundColor: SHADOW_COLOR, opacity: 0.6 },
  shadowFade3: { height: 2, backgroundColor: SHADOW_COLOR, opacity: 0.3 },
  shadowFade4: { height: 3, backgroundColor: SHADOW_COLOR, opacity: 0.12 },

  // Page content (greeting + voice + status + vital)
  pageContent: {
    paddingTop: spacing[20],
  },
  constrain: { width: '100%', alignSelf: 'center' },
  constrainTablet: { maxWidth: FORM_MAX_WIDTH },

  // Greeting
  greeting: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: interFamilyForWeight(700),
    color: NAVY,
    letterSpacing: 0,
  },
  greetingSub: {
    fontSize: 14,
    fontFamily: interFamilyForWeight(400),
    color: '#333333',
  },
  voiceReady: {
    fontSize: 14,
    fontFamily: interFamilyForWeight(400),
    color: '#333333',
  },

  // Voice row — three controls share the row in equal thirds (Figma).
  voiceCard: {
    padding: spacing[16],
    borderRadius: borderRadius.xl,
    backgroundColor: '#FFFFFF',
    // Blue-tinted neumorphic shadow
    shadowColor: '#5B7FA8',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    columnGap: spacing[8],
    rowGap: spacing[8],
  },
  voiceBtn: {
    flexGrow: 1,
    flexBasis: 140,
    minHeight: 44,
    paddingHorizontal: spacing[12],
    borderRadius: borderRadius.full,
  },
  voiceSelectWrap: {
    // Dropdown takes whatever's left on a tablet (one row), full width on phones
    flexGrow: 1,
    flexBasis: 160,
    minWidth: 160,
  },

  // Status buttons
  statusBtn: {
    width: '100%',
    minHeight: 56,
    borderRadius: borderRadius.full,
  },

  // Vital
  vitalEyebrow: {
    fontSize: 14,
    fontFamily: interFamilyForWeight(400),
    color: '#333333',
  },
  vitalTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontFamily: interFamilyForWeight(700),
    color: NAVY,
    letterSpacing: 0,
  },
  vitalSelectsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  vitalCol: { flex: 1 },
  selectLabel: {
    fontSize: 13,
    fontFamily: interFamilyForWeight(400),
    color: '#333333',
    marginBottom: spacing[6],
    marginLeft: spacing[4],
  },

  vitalInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  scanBtn: {
    minHeight: 52,
    paddingHorizontal: spacing[20],
    borderRadius: borderRadius.md,
  },

  saveBtn: {
    width: '100%',
    minHeight: 56,
    borderRadius: borderRadius.full,
    marginTop: spacing[8],
  },

  // ─── Already-checked-in card (replaces the three status buttons) ─────
  alreadyCheckedIn: {
    backgroundColor: staticColors.surface.light,
    borderRadius: borderRadius.lg,
    padding: spacing[20],
    minHeight: 96,
    justifyContent: 'center',
  },
  alreadyCheckedInLabel: {
    fontSize: 16,
    fontFamily: interFamilyForWeight(500),
    color: NAVY,
  },
  alreadyCheckedInValue: {
    fontFamily: interFamilyForWeight(800),
    color: NAVY,
  },
  alreadyCheckedInHint: {
    fontSize: 13,
    fontFamily: interFamilyForWeight(400),
    color: '#333333',
    marginTop: spacing[6],
  },

  errorText: {
    fontSize: 13,
    fontFamily: interFamilyForWeight(500),
    color: staticColors.semantic.error,
    textAlign: 'center',
  },
  successText: {
    fontSize: 13,
    fontFamily: interFamilyForWeight(500),
    color: staticColors.semantic.success,
    textAlign: 'center',
  },
});
