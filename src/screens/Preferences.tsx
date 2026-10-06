import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  deletePreference,
  getAllIngredients,
  getAllTags,
  getPreferences,
  upsertPreference,
} from '../../db/queries';
import { PreferenceActionBar } from '../components/preferences/PreferenceActionBar';
import { PreferenceList } from '../components/preferences/PreferenceList';
import { PreferencePickerModal } from '../components/preferences/PreferencePickerModal';
import type {
  IngredientOption,
  PreferenceRecord,
  TagOption,
} from '../components/preferences/types';
import { theme } from '../theme';

const { semanticColors, spacing } = theme;

export default function Preferences() {
  const [preferences, setPreferences] = useState<PreferenceRecord[]>([]);
  const [ingredientOptions, setIngredientOptions] = useState<IngredientOption[]>([]);
  const [tagOptions, setTagOptions] = useState<TagOption[]>([]);
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<number[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [ingredientModalVisible, setIngredientModalVisible] = useState(false);
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPreferences = async () => {
    try {
      const rows = (await getPreferences()) as PreferenceRecord[];
      setPreferences(rows);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSelectionOptions = async () => {
    try {
      const [ingredientsData, tagsData] = await Promise.all([getAllIngredients(), getAllTags()]);
      setIngredientOptions(ingredientsData as IngredientOption[]);
      setTagOptions(tagsData as TagOption[]);
    } catch (error) {
      console.error('Failed to load selection options:', error);
    }
  };

  useEffect(() => {
    void Promise.all([loadPreferences(), loadSelectionOptions()]);
  }, []);

  const handleToggle = async (item: PreferenceRecord, value: boolean) => {
    const targetId = item.ingredientId ?? item.tagId;
    if (targetId === null || targetId === undefined) {
      return;
    }

    setPreferences((current) =>
      current.map((preference) =>
        preference.preferenceId === item.preferenceId ? { ...preference, alert: value } : preference,
      ),
    );

    try {
      await upsertPreference(value, item.ingredientId ?? undefined, item.tagId ?? undefined);
      await loadPreferences();
    } catch (error) {
      console.error('Failed to update preference:', error);
      await loadPreferences();
    }
  };

  const handleDeletePreference = async (item: PreferenceRecord) => {
    try {
      await deletePreference(item.ingredientId ?? undefined, item.tagId ?? undefined);
      await loadPreferences();
    } catch (error) {
      console.error('Failed to remove preference:', error);
      await loadPreferences();
    }
  };

  const addSelectedIngredients = async () => {
    if (selectedIngredientIds.length === 0) {
      setIngredientModalVisible(false);
      return;
    }

    try {
      await Promise.all(
        selectedIngredientIds.map((ingredientId) => upsertPreference(true, ingredientId, undefined)),
      );
      setSelectedIngredientIds([]);
      setIngredientModalVisible(false);
      await loadPreferences();
    } catch (error) {
      console.error('Failed to add ingredient preferences:', error);
      setSelectedIngredientIds([]);
      setIngredientModalVisible(false);
    }
  };

  const addSelectedTags = async () => {
    if (selectedTagIds.length === 0) {
      setTagModalVisible(false);
      return;
    }

    try {
      await Promise.all(selectedTagIds.map((tagId) => upsertPreference(true, undefined, tagId)));
      setSelectedTagIds([]);
      setTagModalVisible(false);
      await loadPreferences();
    } catch (error) {
      console.error('Failed to add tag preferences:', error);
      setSelectedTagIds([]);
      setTagModalVisible(false);
    }
  };

  const toggleIngredientSelection = (ingredientId: number) => {
    setSelectedIngredientIds((current) =>
      current.includes(ingredientId)
        ? current.filter((id) => id !== ingredientId)
        : [...current, ingredientId],
    );
  };

  const toggleTagSelection = (tagId: number) => {
    setSelectedTagIds((current) =>
      current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId],
    );
  };

  return (
    <View style={styles.container}>
      <PreferenceActionBar
        onAddIngredient={() => setIngredientModalVisible(true)}
        onAddTag={() => setTagModalVisible(true)}
      />

      <PreferenceList
        loading={loading}
        preferences={preferences}
        onToggle={handleToggle}
        onDelete={handleDeletePreference}
      />

      <PreferencePickerModal
        visible={ingredientModalVisible}
        title="Choose ingredients"
        options={ingredientOptions}
        selectedIds={selectedIngredientIds}
        onToggle={toggleIngredientSelection}
        onClose={() => setIngredientModalVisible(false)}
        onConfirm={addSelectedIngredients}
      />

      <PreferencePickerModal
        visible={tagModalVisible}
        title="Choose tags"
        options={tagOptions}
        selectedIds={selectedTagIds}
        onToggle={toggleTagSelection}
        onClose={() => setTagModalVisible(false)}
        onConfirm={addSelectedTags}
        renderOptionLabel={(option) => (
          <View style={styles.tagMeta}>
            <View
              style={[
                styles.tagSwatch,
                { backgroundColor: option.color ?? semanticColors.theme.primary },
              ]}
            />
            <Text style={styles.optionLabel}>{option.name ?? 'Tag'}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  tagMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 1,
  },
  tagSwatch: {
    width: 14,
    height: 14,
    borderRadius: 6,
  },
  optionLabel: {
    color: semanticColors.theme.text,
    fontSize: 16,
    fontFamily: 'System',
    flexShrink: 1,
  },
});
