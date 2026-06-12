import { StyleSheet } from "react-native";
import { spacing, borderRadius } from "../../../shared/design";

export const pairingStyles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing[20],
    paddingVertical: spacing[40],
    flexGrow: 1,
  },
  inviteCode: {
    fontFamily: 'monospace',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 4,
    // Explicit lineHeight prevents clipping of the bold ascenders.
    // includeFontPadding: false on Android tightens it further.
    lineHeight: 40,
    paddingVertical: 4,
    textAlign: 'center',
    includeFontPadding: false,
  },
  copyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[12],
    paddingVertical: spacing[8],
    borderRadius: borderRadius.sm,
    // Tier C — small pill soft float (matches the design system).
    shadowColor: '#5B7FA8',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  codeInput: {
    fontFamily: 'monospace',
    fontSize: 28,
    letterSpacing: 6,
    textAlign: 'center',
  },
});
