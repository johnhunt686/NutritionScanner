import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { AppButton } from '../components/ui/AppButton';
import { theme } from '../theme';
import { useDatabase } from '../../db/useDatabase';

const { semanticColors, spacing, border, typography, radii } = theme;

type Props = NativeStackScreenProps<RootStackParamList, 'IngredientDetailed'>;

type IngredientDetails = {
  name: string;
  formalName: string;
  summary: string;
  tags: Array<{
    id: number;
    name: string;
    color: string | null;
  }>;
};

export default function IngredientDetailed({ route, navigation }: Props) {
  const { ingredientId } = route.params;
  const { getIngredientProfile } = useDatabase();
  const [ingredient, setIngredient] = useState<IngredientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadIngredient() {
      setLoading(true);
      setError(null);

      try {
        const profile = await getIngredientProfile(ingredientId);

        if (!profile) {
          setIngredient(null);
          setError('This ingredient could not be found.');
          return;
        }

        const description = profile.descriptions[0];
        const summary =
          description?.descriptionLong?.trim() ||
          description?.descriptionShort?.trim() ||
          'No summary is available for this ingredient yet.';

        setIngredient({
          name: profile.commonName ?? profile.formalName,
          formalName: profile.formalName,
          summary,
          tags: profile.tags,
        });
      } catch (loadError) {
        console.error('Failed to load ingredient details:', loadError);
        setIngredient(null);
        setError('Ingredient details could not be loaded.');
      } finally {
        setLoading(false);
      }
    }

    void loadIngredient();
  }, [ingredientId, getIngredientProfile]);

  if (loading) {
    return (
      <View style={styles.centeredState}>
        <ActivityIndicator color={semanticColors.theme.primary} />
        <Text style={styles.stateText}>Loading ingredient...</Text>
      </View>
    );
  }

  if (!ingredient) {
    return (
      <View style={styles.centeredState}>
        <Text style={styles.stateText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{ingredient.name}</Text>
        <Text style={styles.formalName}>{ingredient.formalName}</Text>
      </View>

      <View style={[styles.section, styles.tagsSection]}>
        <View style={styles.tags}>
          <View style={styles.tagIcon}>
            <Ionicons name="pricetag-outline" size={18} color={semanticColors.theme.secondary} />
          </View>
          {ingredient.tags.length > 0 ? (
            ingredient.tags.map((tag) => (
              <View key={tag.id} style={styles.tag}>
                <View
                  style={[
                    styles.tagColor,
                    { backgroundColor: tag.color ?? semanticColors.theme.secondary },
                  ]}
                />
                <Text style={styles.tagText}>{tag.name}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No tags</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.summary}>{ingredient.summary}</Text>
      </View>

      <View style={styles.action}>
        <AppButton
          label="Research/Sources"
          onPress={() => navigation.navigate('Sources', { ingredientId })}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  stateText: {
    color: semanticColors.theme.primaryAccent,
    fontSize: typography.fontSizes.medium,
    fontFamily: typography.fonts.body,
    textAlign: 'center',
  },
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  name: {
    color: semanticColors.theme.text,
    fontSize: typography.fontSizes.display,
    fontFamily: typography.fonts.heading,
    fontWeight: typography.fontWeights.bold,
  },
  formalName: {
    marginTop: spacing.xs,
    color: semanticColors.theme.primaryAccent,
    fontSize: typography.fontSizes.medium,
    fontFamily: typography.fonts.body,
  },
  section: {
    paddingVertical: spacing.lg,
  },
  tagsSection: {
    paddingTop: spacing.sm,
    borderBottomWidth: border.medium,
    borderBottomColor: semanticColors.theme.primary,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    color: semanticColors.theme.primary,
    fontSize: typography.fontSizes.large,
    fontFamily: typography.fonts.heading,
    fontWeight: typography.fontWeights.bold,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  tagIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: semanticColors.theme.content,
    borderRadius: radii.full,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: semanticColors.theme.content,
    borderRadius: radii.full,
  },
  tagColor: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
  },
  tagText: {
    color: semanticColors.theme.text,
    fontSize: typography.fontSizes.small,
    fontFamily: typography.fonts.body,
  },
  emptyText: {
    color: semanticColors.theme.primaryAccent,
    fontSize: typography.fontSizes.small,
    fontFamily: typography.fonts.body,
  },
  summary: {
    color: semanticColors.theme.text,
    fontSize: typography.fontSizes.medium,
    fontFamily: typography.fonts.body,
    lineHeight: typography.fontSizes.medium * typography.lineHeights.normal,
  },
  action: {
    marginTop: spacing.lg,
  },
});
