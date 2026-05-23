import { StyleSheet } from 'react-native';
import { spacing, borderRadius, colors, getShadowStyle, figmaFont } from '../design';
import { interFamilyForWeight } from '../design/tokens/utils';

/**
 * Styles for OutlinedSelect — kept in a separate module so the
 * StyleSheet.create() call runs once at module load, not on every render.
 */
export const outlinedSelectStyles = StyleSheet.create({
  outer: { marginBottom: spacing[12] },
  wrap: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.inputFill.light,
    borderRadius: 14, // moderate corner radius — matches Figma dropdowns
    paddingHorizontal: spacing[20],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wrapError: { borderColor: colors.semantic.error },
  wrapDisabled: { opacity: 0.5 },
  errorText: {
    marginTop: spacing[4],
    marginLeft: spacing[12],
    fontSize: figmaFont.caption,
    color: colors.semantic.error,
  },
  value: {
    fontSize: figmaFont.bodyLg,
    fontFamily: interFamilyForWeight(500),
    color: colors.text.primary,
    flex: 1,
  },
  placeholder: {
    fontSize: figmaFont.bodyLg,
    fontFamily: interFamilyForWeight(400),
    color: colors.text.placeholder,
    flex: 1,
  },

  // Modal dropdown sheet
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: spacing[24],
  },
  sheet: {
    backgroundColor: colors.surface.light,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    maxHeight: '50%',
    ...getShadowStyle('lg'),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[16],
    paddingHorizontal: spacing[20],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  optionLabel: {
    fontSize: figmaFont.bodyXl,
    fontFamily: interFamilyForWeight(400),
    color: colors.text.primary,
  },
  optionLabelActive: {
    fontFamily: interFamilyForWeight(700),
    color: colors.accent.primary,
  },
});
