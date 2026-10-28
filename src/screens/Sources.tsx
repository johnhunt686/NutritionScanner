import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useDatabase } from '../../db/useDatabase';
import { theme } from '../theme';

const {
  semanticColors: { theme: colors },
  spacing,
  typography,
  radii,
  border,
} = theme;
type Props = NativeStackScreenProps<RootStackParamList, 'Sources'>;
type Source = {
  id: number;
  summary: string | null;
  link: string | null;
  document: unknown;
  lastChecked: string | null;
  isLink: boolean;
};

function documentUrl(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    for (const key of ['url', 'uri', 'link']) {
      if (typeof obj[key] === 'string') return obj[key] as string;
    }
  }
  return null;
}

function safeUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export default function Sources({ route }: Props) {
  const { ingredientId } = route.params;
  const { getIngredientProfile } = useDatabase();
  const [name, setName] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [expanded, setExpanded] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getIngredientProfile(ingredientId)
      .then((profile) => {
        if (!active) return;
        if (!profile) {
          setError('Ingredient not found.');
          return;
        }
        setName(profile.commonName || profile.formalName);
        setSources(profile.research);
        setExpanded(profile.research.length ? [profile.research[0].id] : []);
      })
      .catch(() => {
        if (active) setError('Unable to load sources.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [ingredientId, getIngredientProfile]);

  const openSource = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      setError('Unable to open that source.');
    }
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.muted}>Loading sources...</Text>
      </View>
    );
  if (error && !sources.length)
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{error}</Text>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{name}</Text>
      <Text style={styles.muted}>Research and supporting evidence</Text>
      <View style={styles.heading}>
        <Text style={styles.headingText}>Sources</Text>
        <Text style={styles.muted}>
          {sources.length} {sources.length === 1 ? 'source' : 'sources'}
        </Text>
      </View>
      {sources.length === 0 ? (
        <Text style={styles.empty}>No sources are linked to this ingredient yet.</Text>
      ) : (
        sources.map((source, index) => {
          const isExpanded = expanded.includes(source.id);
          const summary = source.summary?.trim();
          const link = safeUrl(source.link);
          const doc = safeUrl(documentUrl(source.document));
          return (
            <View key={source.id} style={styles.card}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Source ${index + 1}, ${isExpanded ? 'collapse' : 'expand'}`}
                onPress={() =>
                  setExpanded((current) =>
                    isExpanded ? current.filter((id) => id !== source.id) : [...current, source.id],
                  )
                }
              >
                <View style={styles.cardHeader}>
                  <Ionicons
                    name={source.isLink ? 'link-outline' : 'document-text-outline'}
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={styles.cardTitle}>Source {index + 1}</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.primaryAccent}
                  />
                </View>
                {!isExpanded && (
                  <Text numberOfLines={2} style={styles.preview}>
                    {summary || 'No research summary available.'}
                  </Text>
                )}
              </Pressable>
              {isExpanded && (
                <View style={styles.body}>
                  <Text style={styles.summary}>{summary || 'No research summary available.'}</Text>
                  {source.lastChecked ? (
                    <Text style={styles.muted}>Last checked: {source.lastChecked}</Text>
                  ) : null}
                  {link ? (
                    <Pressable
                      style={styles.action}
                      onPress={() => void openSource(link)}
                      accessibilityRole="link"
                    >
                      <Ionicons name="open-outline" size={18} color={colors.primary} />
                      <Text style={styles.actionText}>Open original source</Text>
                    </Pressable>
                  ) : null}
                  {doc && doc !== link ? (
                    <Pressable
                      style={styles.action}
                      onPress={() => void openSource(doc)}
                      accessibilityRole="link"
                    >
                      <Ionicons name="document-outline" size={18} color={colors.primary} />
                      <Text style={styles.actionText}>Open document</Text>
                    </Pressable>
                  ) : null}
                  {source.document != null && !doc ? (
                    <Text style={styles.muted}>
                      A document is attatched... but you cant have it.
                    </Text>
                  ) : null}
                  {error ? <Text style={styles.error}>{error}</Text> : null}
                </View>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: typography.fontSizes.display,
    fontFamily: typography.fonts.heading,
  },
  muted: {
    color: colors.primaryAccent,
    fontFamily: typography.fonts.body,
    fontSize: typography.fontSizes.small,
  },
  heading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  headingText: {
    color: colors.primary,
    fontFamily: typography.fonts.heading,
    fontSize: typography.fontSizes.large,
  },
  empty: {
    color: colors.primaryAccent,
    fontFamily: typography.fonts.body,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.background,
    borderWidth: border.thin,
    borderColor: colors.primary,
    borderRadius: radii.large,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTitle: {
    flex: 1,
    color: colors.text,
    fontFamily: typography.fonts.heading,
    fontSize: typography.fontSizes.medium,
  },
  preview: {
    marginTop: spacing.sm,
    color: colors.primaryAccent,
    fontFamily: typography.fonts.body,
    lineHeight: 22,
  },
  body: { marginTop: spacing.md, gap: spacing.md },
  summary: {
    color: colors.text,
    fontFamily: typography.fonts.body,
    fontSize: typography.fontSizes.medium,
    lineHeight: 24,
  },
  action: {
    borderTopWidth: border.thin,
    borderTopColor: colors.content,
    paddingTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionText: {
    color: colors.primary,
    fontFamily: typography.fonts.heading,
    fontSize: typography.fontSizes.medium,
  },
  error: { color: colors.alert, fontFamily: typography.fonts.body },
});
