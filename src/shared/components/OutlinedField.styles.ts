import { Platform, StyleSheet } from 'react-native';
import { spacing, borderRadius, colors, typography, figmaFont } from '../design';
import { interFamilyForWeight } from '../design/tokens/utils';

/**
 * Styles for OutlinedField — kept in a separate module so the
 * StyleSheet.create() call runs once at module load, not on every render.
 */
export const outlinedFieldStyles = StyleSheet.create({
  outer: { marginBottom: spacing[12] },
  wrap: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.inputFill.light,
    borderRadius: 14, // moderate corner radius — matches Figma fields
    paddingHorizontal: spacing[20],
    flexDirection: 'row',
    alignItems: 'center',
  },
  wrapError: { borderColor: colors.semantic.error },
  input: {
    flex: 1,
    fontSize: typography.fontSize.field,
    color: colors.text.primary,
    fontFamily: interFamilyForWeight(400),
    paddingVertical: spacing[12],
    padding: 0,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null),
  },
  inputWithToggle: {
    paddingRight: spacing[8],
  },
  toggleBtn: {
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[4],
    marginLeft: spacing[4],
  },
  toggleText: {
    fontSize: 13,
    color: colors.text.primary,
    fontFamily: interFamilyForWeight(600),
  },
  errorText: {
    marginTop: spacing[4],
    marginLeft: spacing[12],
    fontSize: figmaFont.caption,
    color: colors.semantic.error,
  },
});
