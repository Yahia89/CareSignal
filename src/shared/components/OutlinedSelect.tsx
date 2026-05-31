import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  FlatList,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { colors } from '../design';
import { outlinedSelectStyles as styles } from './OutlinedSelect.styles';

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
  /** Outer wrapper style — applied to the surrounding `<View>`. */
  style?: StyleProp<ViewStyle>;
  /** @deprecated alias for `style`, kept for backward compat. */
  containerStyle?: StyleProp<ViewStyle>;
  /** Style for the pill itself (border / radius / fill overrides). */
  fieldStyle?: StyleProp<ViewStyle>;
}

export const OutlinedSelect = ({
  options,
  value,
  onValueChange,
  placeholder = 'Select…',
  disabled = false,
  error,
  style,
  containerStyle,
  fieldStyle,
}: OutlinedSelectProps) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={[styles.outer, containerStyle, style]}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => !disabled && setOpen(true)}
        style={[
          styles.wrap,
          error ? styles.wrapError : null,
          disabled ? styles.wrapDisabled : null,
          fieldStyle,
        ]}
      >
        <Text
          style={selected ? styles.value : styles.placeholder}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
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

