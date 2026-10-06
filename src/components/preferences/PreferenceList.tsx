import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';
import { PreferenceRow } from './PreferenceRow';
import type { PreferenceRecord } from './types';

const { semanticColors, spacing, typography } = theme;

type PreferenceListProps = {
  loading: boolean;
  preferences: PreferenceRecord[];
  onToggle: (item: PreferenceRecord, value: boolean) => void;
  onDelete: (item: PreferenceRecord) => void;
};

export function PreferenceList({ loading, preferences, onToggle, onDelete }: PreferenceListProps) {
  if (loading) {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator color={semanticColors.theme.primary} />
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

const styles = StyleSheet.create({
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
    color: semanticColors.theme.text,
    fontSize: typography.fontSizes.medium,
    fontFamily: typography.fonts.body,
    marginTop: spacing.sm,
  },
});
