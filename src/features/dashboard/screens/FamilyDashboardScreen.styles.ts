import { StyleSheet } from 'react-native';
import {
  spacing,
  figmaColor,
  figmaFont,
  figmaRadius,
} from '../../../shared/design';
import { interFamilyForWeight } from '../../../shared/design/tokens/utils';

export const familyDashboardStyles = StyleSheet.create({
  // Header
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

  // Body
  scrollContent: {
    paddingHorizontal: spacing[20],
    paddingTop: spacing[20],
    paddingBottom: spacing[24],
  },

  // Type
  smallEyebrow: { fontFamily: interFamilyForWeight(400), fontSize: figmaFont.body, color: figmaColor.bodyDark, marginBottom: spacing[6] },
  eyebrowMd: { fontFamily: interFamilyForWeight(500), fontSize: figmaFont.body, color: figmaColor.bodyDark },
  h1: { fontFamily: interFamilyForWeight(700), fontSize: figmaFont.h1, color: figmaColor.titleNavy },
  bodyMuted: { fontFamily: interFamilyForWeight(400), fontSize: figmaFont.body, color: figmaColor.bodyDark, lineHeight: 20 },

  // Status row
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusName: { fontFamily: interFamilyForWeight(700), fontSize: figmaFont.h1, color: figmaColor.titleNavy, flex: 1, paddingRight: spacing[12] },
  statusPill: {
    paddingHorizontal: spacing[20],
    paddingVertical: spacing[8],
    borderRadius: 20,
    minWidth: 84,
    alignItems: 'center',
  },
  statusPillText: { fontFamily: interFamilyForWeight(700), fontSize: figmaFont.bodyXl, color: figmaColor.surface, letterSpacing: 0.5 },

  // About
  aboutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: figmaColor.cardBg,
    borderWidth: 1,
    borderColor: figmaColor.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: spacing[16],
  },
  aboutLabel: {
    flex: 1,
    fontFamily: interFamilyForWeight(600),
    fontSize: figmaFont.bodyLg,
    color: figmaColor.titleNavy,
    marginLeft: spacing[8],
  },
  aboutBody: {
    backgroundColor: figmaColor.cardBg,
    borderWidth: 1,
    borderColor: figmaColor.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: spacing[16],
    marginTop: -spacing[2],
  },

  // Stat grid
  grid: {},
  gridRow: { flexDirection: 'row' },
  statCard: {
    flex: 1,
    backgroundColor: figmaColor.surface,
    borderWidth: 1,
    borderColor: figmaColor.border,
    borderRadius: figmaRadius.card,
    padding: 14,
  },
  statEyebrow: { fontFamily: interFamilyForWeight(400), fontSize: figmaFont.caption, color: figmaColor.textMuted, marginBottom: 4 },
  statValue: { fontFamily: interFamilyForWeight(700), fontSize: figmaFont.h3, color: figmaColor.titleNavy, marginBottom: 4 },
  statHint: { fontFamily: interFamilyForWeight(400), fontSize: figmaFont.caption, color: figmaColor.textMuted },

  // Card
  card: {
    backgroundColor: figmaColor.cardBg,
    borderRadius: figmaRadius.card,
  },

  // Response rows
  responseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: figmaColor.surface,
    borderWidth: 1,
    borderColor: figmaColor.border,
    borderRadius: figmaRadius.pill,
    paddingHorizontal: spacing[16],
    paddingVertical: spacing[12],
  },
  responseLabel: {
    fontFamily: interFamilyForWeight(500),
    fontSize: figmaFont.body,
    color: figmaColor.titleNavy,
    marginLeft: 10,
    flex: 1,
  },
  responseValue: { fontFamily: interFamilyForWeight(700) },

  // Routing cards
  routingCard: {
    backgroundColor: figmaColor.cardBg,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: spacing[16],
  },
  routingEyebrow: { fontFamily: interFamilyForWeight(400), fontSize: figmaFont.caption, color: figmaColor.textMuted, marginBottom: 4 },
  routingValue: { fontFamily: interFamilyForWeight(600), fontSize: figmaFont.bodyXl, color: figmaColor.titleNavy },

  // Buttons
  primaryBtn: {
    backgroundColor: figmaColor.titleNavy,
    paddingVertical: spacing[12],
    paddingHorizontal: spacing[20],
    borderRadius: figmaRadius.btn,
    alignSelf: 'flex-start',
  },
  primaryBtnText: { fontFamily: interFamilyForWeight(600), fontSize: figmaFont.body, color: figmaColor.surface },
});
