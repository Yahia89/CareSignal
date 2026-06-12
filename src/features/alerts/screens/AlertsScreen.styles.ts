import { StyleSheet } from "react-native";
import { spacing, borderRadius } from "../../../shared/design";

export const alertsStyles = StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing[20],
    paddingVertical: spacing[24],
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[16],
    borderLeftWidth: 4,
    borderRadius: borderRadius.lg,
    // Tier A — override NeuCard's diagonal md shadow with the straight-down
    // soft float used across the rest of the app.
    shadowColor: '#3A5575',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.17,
    shadowRadius: 16,
    elevation: 6,
  },
  rowIconWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeWrap: {
    flex: 1,
    padding: spacing[20],
    justifyContent: 'center',
  },
});
