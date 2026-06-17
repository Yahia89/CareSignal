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
  // Name + status pill sit together (pill right after the name), not pushed to
  // opposite edges — matches the design. The name shrinks if it's very long.
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusName: {
    fontFamily: interFamilyForWeight(700),
    fontSize: figmaFont.h1,
    lineHeight: figmaFont.h1,
    color: figmaColor.titleNavy,
    flexShrink: 1,
    marginRight: spacing[12],
  },
  // Compact badge that hugs its label (design: ~45px for "OK"), not a fixed
  // wide pill. 14px bold white text, vertically centered with the name.
  statusPill: {
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[8],
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPillText: {
    fontFamily: interFamilyForWeight(700),
    fontSize: figmaFont.bodyLg,
    lineHeight: figmaFont.bodyLg,
    color: figmaColor.surface,
    letterSpacing: 0.3,
  },

  // ── Stat grid ─────────────────────────────────────────────────────────────
  gridRow: { flexDirection: 'row' },
  statCard: {
    flex: 1,
    backgroundColor: figmaColor.surface,
    borderRadius: figmaRadius.card,
    padding: 14,
    shadowColor: '#3A5575',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.17,
    shadowRadius: 16,
    elevation: 6,
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
    backgroundColor: figmaColor.surface,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: spacing[16],
    gap: spacing[8],
    shadowColor: '#3A5575',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.17,
    shadowRadius: 16,
    elevation: 6,
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
    backgroundColor: figmaColor.surface,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
    shadowColor: '#3A5575',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.17,
    shadowRadius: 16,
    elevation: 6,
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
  // Outer light card containing the reading row + Delete/Save pill buttons.
  vitalCard: {
    backgroundColor: figmaColor.surface,
    borderRadius: figmaRadius.cardLg,
    padding: spacing[16],
    shadowColor: '#3A5575',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.17,
    shadowRadius: 16,
    elevation: 6,
  },
  vitalCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vitalCardLabel: {
    fontFamily: interFamilyForWeight(700),
    fontSize: figmaFont.h3,
    color: figmaColor.titleNavy,
    marginBottom: 2,
  },
  vitalCardValue: {
    fontFamily: interFamilyForWeight(400),
    fontSize: figmaFont.bodyLg,
    color: figmaColor.bodyDark,
  },
  vitalCardTime: {
    fontFamily: interFamilyForWeight(400),
    fontSize: 12,
    color: figmaColor.textMuted,
    marginTop: 3,
  },
  // Image thumbnail on right (senior's uploaded reading photo)
  vitalCardThumb: {
    width: 84,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#E3EDF3',
    marginLeft: spacing[12],
    overflow: 'hidden',
  },
  vitalCardThumbImg: {
    width: '100%',
    height: '100%',
  },
  vitalCardThumbPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Delete / Save — two separate rounded pill buttons with a gap
  vitalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[12],
    marginTop: spacing[16],
  },
  vitalActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[8],
    backgroundColor: figmaColor.surface,
    borderRadius: figmaRadius.pill,
    paddingVertical: spacing[12],
    shadowColor: '#3A5575',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  vitalActionText: {
    fontFamily: interFamilyForWeight(500),
    fontSize: figmaFont.bodyLg,
    color: figmaColor.titleNavy,
  },
  // Empty state
  vitalsEmptyCard: {
    backgroundColor: figmaColor.surface,
    borderRadius: figmaRadius.card,
    padding: spacing[16],
    shadowColor: '#3A5575',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.17,
    shadowRadius: 16,
    elevation: 6,
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
