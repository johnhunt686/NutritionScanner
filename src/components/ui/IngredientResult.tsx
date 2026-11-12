import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useAppSettings, vibrateIfEnabled } from '../../state/AppSettingsContext';

const { spacing, border, typography, radii } = theme;

export type IngredientResultTag = {
  id: number;
  name: string;
  color: string | null;
};

export interface IngredientResultProps {
  name: string;
  description: string;
  tags?: IngredientResultTag[];
  status?: 'matched' | 'unmatched';
  onPress?: () => void;
}

export const IngredientResult: React.FC<IngredientResultProps> = ({
  name,
  description,
  tags = [],
  status = 'matched',
  onPress,
}) => {
  const { colors, settings } = useAppSettings();
  const styles = createStyles(colors.theme);
  const visibleTags = tags.slice(0, 2);
  const remainingTagCount = tags.length - visibleTags.length;
  const isUnmatched = status === 'unmatched';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        isUnmatched && styles.unmatchedContainer,
        pressed && onPress && styles.pressed,
      ]}
      onPress={() => {
        if (!onPress) return;
        vibrateIfEnabled(settings.vibrations);
        onPress();
      }}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={
        onPress ? `View details for ${name}` : `${name} was not found in the database`
      }
    >
      <View style={[styles.iconBadge, isUnmatched && styles.unmatchedIconBadge]}>
        <Ionicons
          name={isUnmatched ? 'alert-circle-outline' : 'nutrition-outline'}
          size={21}
          color={isUnmatched ? colors.theme.alert : colors.theme.primary}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text
          style={[styles.description, isUnmatched && styles.unmatchedDescription]}
          numberOfLines={2}
        >
          {description}
        </Text>

        {visibleTags.length > 0 && (
          <View style={styles.tags}>
            {visibleTags.map((tag) => (
              <View key={tag.id} style={styles.tag}>
                <View
                  style={[
                    styles.tagColor,
                    { backgroundColor: tag.color ?? colors.theme.secondary },
                  ]}
                />
                <Text style={styles.tagText} numberOfLines={1}>
                  {tag.name}
                </Text>
              </View>
            ))}
            {remainingTagCount > 0 && (
              <View style={styles.tagCount}>
                <Text style={styles.tagText}>+{remainingTagCount}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {onPress && <Ionicons name="chevron-forward" size={20} color={colors.theme.primaryAccent} />}
    </Pressable>
  );
};

const createStyles = (colors: import('../../theme/colors').SemanticThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      marginBottom: spacing.sm,
      backgroundColor: colors.content,
      borderWidth: border.thin,
      borderColor: `${colors.primary}35`,
      borderRadius: radii.large,
    },
    pressed: {
      opacity: 0.72,
    },
    unmatchedContainer: {
      backgroundColor: `${colors.alert}08`,
      borderColor: `${colors.alert}45`,
    },
    iconBadge: {
      width: 38,
      height: 38,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderRadius: radii.full,
    },
    unmatchedIconBadge: {
      backgroundColor: `${colors.alert}12`,
    },
    content: {
      flex: 1,
    },
    name: {
      color: colors.text,
      fontSize: typography.fontSizes.medium,
      fontFamily: typography.fonts.heading,
      fontWeight: typography.fontWeights.bold,
    },
    description: {
      marginTop: spacing.xs,
      color: colors.primaryAccent,
      fontSize: typography.fontSizes.small,
      fontFamily: typography.fonts.body,
      lineHeight: typography.fontSizes.small * typography.lineHeights.normal,
    },
    unmatchedDescription: {
      color: colors.alert,
    },
    tags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginTop: spacing.sm,
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      maxWidth: 120,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: radii.full,
    },
    tagCount: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      backgroundColor: colors.surface,
      borderRadius: radii.full,
    },
    tagColor: {
      width: 7,
      height: 7,
      borderRadius: radii.full,
    },
    tagText: {
      flexShrink: 1,
      color: colors.primaryAccent,
      fontSize: typography.fontSizes.xsmall,
      fontFamily: typography.fonts.body,
    },
  });
