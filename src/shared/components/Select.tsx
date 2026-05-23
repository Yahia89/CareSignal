import React, { memo, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, FlatList, Pressable } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Text } from './Text';
import { NeumorphicView } from './NeumorphicView';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  /**
   * 'neumorphic' (default) — inset neumorphic trigger, for the blue-grey background.
   * 'flat' — bordered trigger, for white card backgrounds.
   */
  variant?: 'neumorphic' | 'flat';
}

export const Select = memo(({
  label,
  options,
  value,
  onValueChange,
  placeholder = 'Select an option',
  variant = 'neumorphic',
}: SelectProps) => {
  const [visible, setVisible] = useState(false);
  const theme = useTheme();

  const selectedOption = options.find(opt => opt.value === value);

  const trigger = variant === 'flat' ? (
    <TouchableOpacity onPress={() => setVisible(true)}>
      <View style={styles.flatTrigger}>
        <Text
          variant="body"
          color={selectedOption ? theme.colors.text : '#A0AABA'}
          style={{ fontSize: 15 }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ChevronDown size={18} color="#64748B" />
      </View>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity onPress={() => setVisible(true)}>
      <NeumorphicView
        inset
        borderRadius={theme.radii.md}
        style={styles.triggerInner}
      >
        <Text variant="body" color={selectedOption ? theme.colors.text : theme.colors.textSecondary + '80'}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ChevronDown size={20} color={theme.colors.textSecondary} />
      </NeumorphicView>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text variant="small" color={theme.colors.textSecondary}>{label}</Text>
        </View>
      )}

      {trigger}

      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface, borderRadius: theme.radii.lg }]}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    onValueChange(item.value);
                    setVisible(false);
                  }}
                >
                  <Text variant="body" color={item.value === value ? theme.colors.secondary : theme.colors.text}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 12,
  },
  labelContainer: {
    marginBottom: 6,
    marginLeft: 4,
  },
  triggerInner: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    padding: 0,
  },
  flatTrigger: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#F1F5FB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8E2EF',
    shadowColor: '#B8C6D9',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    maxHeight: '50%',
    overflow: 'hidden',
  },
  option: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
});
