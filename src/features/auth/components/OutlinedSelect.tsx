import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { spacing, borderRadius, colors, getShadowStyle } from '../../../shared/design';

/**
 * Outlined dropdown that visually mirrors `OutlinedField`.
 * Used for role/account-type selection on the auth screens.
 *
 * Picker is a centered modal sheet with a tap-outside-to-dismiss overlay.
 * Selected value is shown via the option's label; placeholder shows when
 * `value` is empty or doesn't match any option.
 */
export interface OutlinedSelectOption {
  label: string;
  value: string;
}

export interface OutlinedSelectProps {
  options: OutlinedSelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string | undefined;
  containerStyle?: StyleProp<ViewStyle>;
}

export const OutlinedSelect = ({
  options,
  value,
  onValueChange,
  placeholder = 'Select…',
  disabled = false,
  error,
  containerStyle,
}: OutlinedSelectProps) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={[styles.outer, containerStyle]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => !disabled && setOpen(true)}
        style={[
          styles.wrap,
          error ? styles.wrapError : null,
          disabled ? styles.wrapDisabled : null,
        ]}
      >
        <Text style={selected ? styles.value : styles.placeholder}>
          {selected ? selected.label : placeholder}
        </Text>
        <ChevronDown size={20} color={colors.text.secondary} />
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <FlatList
              data={options}
              keyExtractor={(o) => o.value}
              renderItem={({ item }) => {
                const active = item.value === value;
                return (
                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => {
                      onValueChange(item.value);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                      {item.label}
                    </Text>
                    {active && <Check size={18} color={colors.accent.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: { marginBottom: spacing[12] },
  wrap: {
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[16],
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wrapError: { borderColor: colors.semantic.error },
  wrapDisabled: { opacity: 0.5 },
  errorText: {
    marginTop: spacing[4],
    marginLeft: spacing[4],
    fontSize: 12,
    color: colors.semantic.error,
  },
  value: { fontSize: 16, color: colors.text.primary, flex: 1 },
  placeholder: { fontSize: 16, color: colors.text.secondary, flex: 1 },

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
  optionLabel: { fontSize: 16, color: colors.text.primary },
  optionLabelActive: { fontWeight: '700', color: colors.accent.primary },
});
