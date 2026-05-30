import { StyleSheet } from 'react-native';
import { spacing, figmaColor, figmaFont, figmaRadius } from '../../../shared/design';
import { interFamilyForWeight } from '../../../shared/design/tokens/utils';

export const familyDashboardStyles = StyleSheet.create({
  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: figmaColor.headerBg,
    paddingTop: spacing[8],
    paddingBottom: spacing[16],
  },
  logoSlot: { paddingHorizontal: spacing[8] },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[20],
    marginTop: spacing[8],
  },
  dailyCheckin: {
    fontFamily: interFamilyForWeight(700),
    fontSize: figmaFont.h3,
    color: figmaColor.titleNavy,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: figmaColor.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: figmaColor.surface,
  },
  shadowFade1: {
    position: 'absolute', bottom: -4, left: 0, right: 0, height: 2,
    backgroundColor: figmaColor.shadowSoft,
  },
  shadowFade2: {
    position: 'absolute', bottom: -8, left: 0, right: 0, height: 1,
    backgroundColor: figmaColor.shadowSofter,
  },

  // ── Body ──────────────────────────────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: spacing[20],
    paddingTop: spacing[20],
    paddingBottom: spacing[24],
  },

  // ── Typography ────────────────────────────────────────────────────────────
  smallEyebrow: {
    fontFamily: interFamilyForWeight(400),
    fontSize: figmaFont.body,
    color: figmaColor.bodyDark,
    marginBottom: spacing[6],
  },
  h1: {
    fontFamily: interFamilyForWeight(700),
    fontSize: figmaFont.h1,
    color: figmaColor.titleNavy,
  },
  bodyMuted: {
    fontFamily: interFamilyForWeight(400),
    fontSize: figmaFont.body,
    color: figmaColor.bodyDark,
    lineHeight: 20,
  },
  sectionTitle: {
    fontFamily: interFamilyForWeight(700),
    fontSize: figmaFont.h3,
    color: figmaColor.titleNavy,
  },

  // ── Status row ────────────────────────────────────────────────────────────
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusName: {
    fontFamily: interFamilyForWeight(700),
    fontSize: figmaFont.h1,
    color: figmaColor.titleNavy,
    flex: 1,
    paddingRight: spacing[12],
  },
  statusPill: {
    paddingHorizontal: spacing[20],
    paddingVertical: spacing[8],
    borderRadius: 20,
    minWidth: 84,
    alignItems: 'center',
  },
  statusPillText: {
    fontFamily: interFamilyForWeight(700),
    fontSize: figmaFont.bodyXl,
    color: figmaColor.surface,
    letterSpacing: 0.5,
  },

  // ── Stat grid ─────────────────────────────────────────────────────────────
  gridRow: { flexDirection: 'row' },
  statCard: {
    flex: 1,
    backgroundColor: figmaColor.surface,
    borderWidth: 1,
    borderColor: figmaColor.border,
    borderRadius: figmaRadius.card,
    padding: 14,
  },
  statEyebrow: {
    fontFamily: interFamilyForWeight(400),
    fontSize: figmaFont.caption,
    color: figmaColor.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: interFamilyForWeight(700),
    fontSize: figmaFont.h3,
    color: figmaColor.titleNavy,
    marginBottom: 4,
  },
  statHint: {
    fontFamily: interFamilyForWeight(400),
    fontSize: figmaFont.caption,
    color: figmaColor.textMuted,
  },

  // ── Collapsible (Responsive Rating / About the App style) ─────────────────
  collapsibleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: figmaColor.cardBg,
    borderWidth: 1,
    borderColor: figmaColor.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: spacing[16],
    gap: spacing[8],
  },
  collapsibleBtnOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  collapsibleLabel: {
    flex: 1,
    fontFamily: interFamilyForWeight(600),
    fontSize: figmaFont.bodyLg,
    color: figmaColor.titleNavy,
  },
  collapsibleBody: {
    backgroundColor: figmaColor.cardBg,
    borderWidth: 1,
    borderColor: figmaColor.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
  },

  // ── Responsive Rating rows ─────────────────────────────────────────────────
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[8],
    gap: spacing[8],
  },
  ratingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ratingRowLabel: {
    flex: 1,
    fontFamily: interFamilyForWeight(500),
    fontSize: figmaFont.body,
    color: figmaColor.titleNavy,
  },
  ratingRowValue: {
    fontFamily: interFamilyForWeight(700),
    fontSize: figmaFont.caption,
    color: figmaColor.textMuted,
    letterSpacing: 0.3,
  },
  ratingDivider: {
    height: 1,
    backgroundColor: figmaColor.border,
  },

  // ── Vitals Snapshot ───────────────────────────────────────────────────────
  vitalCard: {
    backgroundColor: figmaColor.surface,
    borderWidth: 1,
    borderColor: figmaColor.border,
    borderRadius: figmaRadius.card,
    overflow: 'hidden',
  },
  vitalCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[16],
  },
  vitalIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: figmaColor.pageBg,
    borderWidth: 1,
    borderColor: figmaColor.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vitalCardLabel: {
    fontFamily: interFamilyForWeight(700),
    fontSize: figmaFont.bodyLg,
    color: figmaColor.titleNavy,
    marginBottom: 2,
  },
  vitalCardValue: {
    fontFamily: interFamilyForWeight(400),
    fontSize: figmaFont.body,
    color: figmaColor.bodyDark,
  },
  // Image thumbnail on right (blood pressure cuff)
  vitalCardThumb: {
    width: 72,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#E3EDF3',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing[12],
    overflow: 'hidden',
  },
  vitalCardThumbInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Divider between info and Delete/Save row
  vitalDivider: {
    height: 1,
    backgroundColor: figmaColor.border,
  },
  // Delete / Save action row
  vitalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vitalActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[12],
    gap: spacing[8],
  },
  vitalActionSep: {
    width: 1,
    height: 28,
    backgroundColor: figmaColor.border,
  },
  vitalActionText: {
    fontFamily: interFamilyForWeight(500),
    fontSize: figmaFont.bodyLg,
    color: figmaColor.titleNavy,
  },
  // Empty state
  vitalsEmptyCard: {
    backgroundColor: figmaColor.surface,
    borderWidth: 1,
    borderColor: figmaColor.border,
    borderRadius: figmaRadius.card,
    padding: spacing[16],
  },
  vitalsEmptyText: {
    fontFamily: interFamilyForWeight(400),
    fontSize: figmaFont.body,
    color: figmaColor.textMuted,
    lineHeight: 20,
  },

  // ── Generic card ──────────────────────────────────────────────────────────
  card: {
    backgroundColor: figmaColor.cardBg,
    borderRadius: figmaRadius.card,
  },

  // ── Buttons ───────────────────────────────────────────────────────────────
  primaryBtn: {
    backgroundColor: figmaColor.titleNavy,
    paddingVertical: spacing[12],
    paddingHorizontal: spacing[20],
    borderRadius: figmaRadius.btn,
    alignSelf: 'flex-start',
  },
  primaryBtnText: {
    fontFamily: interFamilyForWeight(600),
    fontSize: figmaFont.body,
    color: figmaColor.surface,
  },
});
