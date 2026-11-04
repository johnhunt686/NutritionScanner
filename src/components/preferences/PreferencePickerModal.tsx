import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CoolModal } from '../ui/modal';
import { theme } from '../../theme';
import type { PickerOption } from './types';
import { useAppSettings, vibrateIfEnabled } from '../../state/AppSettingsContext';

const { spacing, border, typography, radii } = theme;

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
  const { colors, settings } = useAppSettings();
  const styles = createStyles(colors.theme);

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
                onPress={() => {
                  vibrateIfEnabled(settings.vibrations);
                  onToggle(option.id);
                }}
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

const createStyles = (colors: import('../../theme/colors').SemanticThemeColors) =>
  StyleSheet.create({
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
      borderBottomColor: colors.border,
    },
    optionRowSelected: {
      backgroundColor: colors.primaryAccent,
      borderRadius: radii.small,
    },
    optionLabel: {
      color: colors.text,
      fontSize: typography.fontSizes.medium,
      fontFamily: typography.fonts.body,
      flexShrink: 1,
    },
    checkmark: {
      width: 22,
      height: 22,
      borderRadius: radii.small,
      borderWidth: border.thin,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    checkmarkSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    checkmarkText: {
      color: colors.background,
      fontWeight: typography.fontWeights.bold,
    },
    modalEmpty: {
      color: colors.text,
      fontFamily: typography.fonts.body,
      fontSize: typography.fontSizes.medium,
      paddingVertical: spacing.sm,
    },
  });
