import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CoolModal } from '../ui/modal';
import { theme } from '../../theme';
import type { PickerOption } from './types';

const { semanticColors, spacing, border, typography, radii } = theme;

type PreferencePickerModalProps<T extends PickerOption> = {
  visible: boolean;
  title: string;
  options: T[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  onClose: () => void;
  onConfirm: () => void;
  renderOptionLabel?: (option: T) => React.ReactNode;
};

export function PreferencePickerModal<T extends PickerOption>({
  visible,
  title,
  options,
  selectedIds,
  onToggle,
  onClose,
  onConfirm,
  renderOptionLabel,
}: PreferencePickerModalProps<T>) {
  return (
    <CoolModal
      visible={visible}
      headerText={title}
      confirmText="Add selected"
      denyText="Close"
      onConfirm={onConfirm}
      onDeny={onClose}
      onRequestClose={onClose}
    >
      <ScrollView style={styles.modalList}>
        {options.length === 0 ? (
          <Text style={styles.modalEmpty}>No options available.</Text>
        ) : (
          options.map((option) => {
            const isSelected = selectedIds.includes(option.id);
            const label = option.formalName ?? option.name ?? 'Item';
            const commonLabel = option.commonName ? ` (${option.commonName})` : '';

            return (
              <Pressable
                key={option.id}
                style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                onPress={() => onToggle(option.id)}
              >
                {renderOptionLabel ? (
                  renderOptionLabel(option)
                ) : (
                  <Text style={styles.optionLabel}>{`${label}${commonLabel}`}</Text>
                )}

                <View style={[styles.checkmark, isSelected && styles.checkmarkSelected]}>
                  {isSelected ? <Text style={styles.checkmarkText}>✓</Text> : null}
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </CoolModal>
  );
}

const styles = StyleSheet.create({
  modalList: {
    maxHeight: 320,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: border.thin,
    borderBottomColor: semanticColors.theme.border,
  },
  optionRowSelected: {
    backgroundColor: semanticColors.theme.primaryAccent,
    borderRadius: radii.small,
  },
  optionLabel: {
    color: semanticColors.theme.text,
    fontSize: typography.fontSizes.medium,
    fontFamily: typography.fonts.body,
    flexShrink: 1,
  },
  checkmark: {
    width: 22,
    height: 22,
    borderRadius: radii.small,
    borderWidth: border.thin,
    borderColor: semanticColors.theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: semanticColors.theme.background,
  },
  checkmarkSelected: {
    backgroundColor: semanticColors.theme.primary,
    borderColor: semanticColors.theme.primary,
  },
  checkmarkText: {
    color: semanticColors.theme.background,
    fontWeight: typography.fontWeights.bold,
  },
  modalEmpty: {
    color: semanticColors.theme.text,
    fontFamily: typography.fonts.body,
    fontSize: typography.fontSizes.medium,
    paddingVertical: spacing.sm,
  },
});
