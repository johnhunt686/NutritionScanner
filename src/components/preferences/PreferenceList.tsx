import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';
import { PreferenceRow } from './PreferenceRow';
import type { PreferenceRecord } from './types';
import { useThemeColors } from '../../state/AppSettingsContext';

const { spacing, typography } = theme;

type PreferenceListProps = {
  loading: boolean;
  preferences: PreferenceRecord[];
  onToggle: (item: PreferenceRecord, value: boolean) => void;
  onDelete: (item: PreferenceRecord) => void;
};

export function PreferenceList({ loading, preferences, onToggle, onDelete }: PreferenceListProps) {
  const colors = useThemeColors();
  const styles = createStyles(colors.theme);

  if (loading) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator color={colors.theme.primary} />
        <Text style={styles.emptyText}>Loading preferences...</Text>
      </View>
    );
  }

  if (preferences.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No saved preferences yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      {preferences.map((preference) => {
        const label = preference.formalName ?? preference.tagName ?? 'Preference';

        return (
          <PreferenceRow
            key={preference.preferenceId}
            label={label}
            type={preference.ingredientId ? 'ingredient' : 'tag'}
            value={Boolean(preference.alert)}
            onValueChange={(nextValue) => {
              void onToggle(preference, nextValue);
            }}
            onDelete={() => {
              void onDelete(preference);
            }}
          />
        );
      })}
    </ScrollView>
  );
}

const createStyles = (colors: import('../../theme/colors').SemanticThemeColors) =>
  StyleSheet.create({
    loadingState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing.xl,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing.xl,
    },
    emptyText: {
      color: colors.text,
      fontSize: typography.fontSizes.medium,
      fontFamily: typography.fonts.body,
      marginTop: spacing.sm,
    },
  });
