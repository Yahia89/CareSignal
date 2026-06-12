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
  // ─── Vital capture card (matches greeting card's soft surface) ─────────
  vitalCaptureCard: {
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
    // Stretches to fill its flex column (voiceCol); content centered.
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[6],
    backgroundColor: '#FBFDFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 10,
    paddingHorizontal: spacing[16],
    // Rounded-rectangle with a little more curve on the ends (matches Figma).
    borderRadius: 18,
    borderCurve: 'continuous',
    shadowColor: '#5B7FA8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 5,
  },
  voicePillText: {
    fontSize: 14,
    fontFamily: interFamilyForWeight(600),
    color: NAVY,
  },
  // Two equal flex columns so Voice ON and Warm Voice are exactly the same width.
  // minWidth:0 lets each column shrink to its true half (defeats flex min-content).
  voiceCol: {
    flex: 1,
    minWidth: 0,
  },
  voiceDropdownWrap: {
    flex: 1,
    minWidth: 0,
  },
  // Soft-pill override for the voice OutlinedSelect so it matches the "Voice ON"
  // pill (design shows a matched pair, not an outlined box).
  // Strip the OutlinedSelect's default marginBottom and force it to fill its
  // column so the Warm Voice pill is exactly the Voice ON width.
  voiceSelectOuter: { marginBottom: 0, width: '100%' },
  voiceSelectField: {
    // Match the Voice ON pill exactly (its base OutlinedSelect wrap forces
    // minHeight 48 — override to the Voice ON height).
    minHeight: 40,
    backgroundColor: '#FBFDFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    // Rounded-rectangle with a little more curve on the ends (matches Figma).
    borderRadius: 18,
    borderCurve: 'continuous',
    paddingVertical: 10,
    paddingHorizontal: spacing[16],
    shadowColor: '#5B7FA8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 5,
  },

  // ─── Rich status action cards ────────────────────────────────────────
  // Soft raised (neumorphic) shadow so the pills float above the page,
  // matching the design.
  statusCard: {
    width: '100%',
    minHeight: 76,
    // Rounded-rectangle (not a full capsule) with iOS continuous corners to
    // match the Figma daily-check pills.
    borderRadius: borderRadius['3xl'],
    borderCurve: 'continuous',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[16],
    paddingHorizontal: spacing[20],
    gap: spacing[16],
    // Soft neumorphic lift — clearly visible (matches the design's float).
    shadowColor: '#3A5575',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
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
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 5,
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
