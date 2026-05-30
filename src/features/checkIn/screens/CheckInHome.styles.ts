import { StyleSheet } from "react-native";
import { spacing, borderRadius, colors as staticColors } from "../../../shared/design";
import { interFamilyForWeight } from "../../../shared/design/tokens/utils";

// Layout + theme constants used only inside this screen's styles.
const FORM_MAX_WIDTH = 480;
const NAVY = staticColors.text.primary; // #36597D

export const checkInHomeStyles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing[48],
  },

  // ─── Header: logo (left) + Settings pill (right) ─────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[20],
    paddingTop: spacing[12],
    paddingBottom: spacing[8],
    alignSelf: 'center',
    width: '100%',
  },
  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[6],
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing[8],
    paddingHorizontal: spacing[16],
    borderRadius: borderRadius.full,
    shadowColor: '#5B7FA8',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 3,
  },
  settingsBtnText: {
    fontSize: 15,
    fontFamily: interFamilyForWeight(600),
    color: NAVY,
  },

  // Page content (greeting + voice + status + vital)
  pageContent: {
    paddingTop: spacing[8],
  },
  constrain: { width: '100%', alignSelf: 'center' },
  constrainTablet: { maxWidth: FORM_MAX_WIDTH },

  // ─── Greeting + voice card ───────────────────────────────────────────
  greetingCard: {
    padding: spacing[20],
    borderRadius: borderRadius.xl,
    backgroundColor: '#FFFFFF',
    shadowColor: '#5B7FA8',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 6,
  },
  eyebrow: {
    fontSize: 14,
    fontFamily: interFamilyForWeight(400),
    color: '#5B6470',
    marginBottom: spacing[2],
  },
  greeting: {
    fontSize: 24,
    lineHeight: 30,
    fontFamily: interFamilyForWeight(700),
    color: NAVY,
    letterSpacing: 0,
  },
  greetingSub: {
    fontSize: 15,
    fontFamily: interFamilyForWeight(400),
    color: '#333333',
    marginTop: spacing[2],
  },
  voiceReady: {
    fontSize: 14,
    fontFamily: interFamilyForWeight(700),
    color: NAVY,
  },

  // Voice pill row (Voice ON pill + Warm Voice dropdown)
  voicePillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[8],
  },
  voicePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[6],
    backgroundColor: '#F4F7FB',
    paddingVertical: spacing[8],
    paddingHorizontal: spacing[16],
    borderRadius: borderRadius.full,
    shadowColor: '#5B7FA8',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  voicePillText: {
    fontSize: 14,
    fontFamily: interFamilyForWeight(600),
    color: NAVY,
  },
  voiceDropdownWrap: {
    flex: 1,
    minWidth: 140,
  },

  // ─── Rich status action cards ────────────────────────────────────────
  statusCard: {
    width: '100%',
    minHeight: 76,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[16],
    paddingHorizontal: spacing[20],
    gap: spacing[16],
  },
  statusIconWrap: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTextCol: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 19,
    lineHeight: 24,
    fontFamily: interFamilyForWeight(700),
    letterSpacing: 0,
  },
  statusSubtitle: {
    fontSize: 14,
    fontFamily: interFamilyForWeight(400),
    color: '#444444',
    marginTop: spacing[2],
  },

  // Collapsed status (post check-in) — full pill to match Figma design.
  collapsedStatus: {
    width: '100%',
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[20],
    paddingHorizontal: spacing[24],
    gap: spacing[16],
  },
  statusLabelSmall: {
    fontSize: 13,
    fontFamily: interFamilyForWeight(400),
    color: '#5B6470',
  },
  checkedInHint: {
    fontSize: 13,
    fontFamily: interFamilyForWeight(400),
    color: '#5B6470',
    textAlign: 'center',
  },

  // ─── Bottom row: Replay Voice + Family View ──────────────────────────
  bottomRow: {
    flexDirection: 'row',
    gap: spacing[12],
  },
  bottomBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[8],
    backgroundColor: '#FFFFFF',
    minHeight: 52,
    borderRadius: borderRadius.full,
    shadowColor: '#5B7FA8',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 3,
  },
  bottomBtnText: {
    fontSize: 15,
    fontFamily: interFamilyForWeight(600),
    color: NAVY,
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
