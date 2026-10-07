import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppButton } from '../components/ui/AppButton';
import { Panel } from '../components/ui/SettingsPanel';
import { SettingsToggleRow } from '../components/ui/SettingsToggleRow';
import { getUserSettings, updateUserSetting } from '../../db/queries';
import { theme } from '../theme';

const { spacing } = theme;

type ToggleSetting = {
  key: string;
  label: string;
  defaultValue: boolean;
};

const defaultSettings: ToggleSetting[] = [
  { key: 'darkMode', label: 'Dark mode', defaultValue: false },
  { key: 'vibrations', label: 'Vibrations', defaultValue: false },
  { key: 'allergyAlerts', label: 'Allergy alerts', defaultValue: true },
  { key: 'exploreOnStart', label: 'Explore on start', defaultValue: true },
];

const defaultValues = Object.fromEntries(
  defaultSettings.map((setting) => [setting.key, setting.defaultValue]),
);

export default function Settings() {
  const [settings, setSettings] = useState<Record<string, boolean>>(defaultValues);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        const savedSettings = await getUserSettings();

        if (!isMounted) return;

        const nextValues = { ...defaultValues };

        for (const item of savedSettings) {
          if (typeof item.value === 'boolean') {
            nextValues[item.key] = item.value;
          }
        }

        setSettings(nextValues);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleToggle(key: string, value: boolean) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    await updateUserSetting(key, value);
  }

  function resetToDefaults() {
    const nextValues = { ...defaultValues };
    setSettings(nextValues);

    for (const [key, value] of Object.entries(nextValues)) {
      void updateUserSetting(key, value);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Panel>
          {defaultSettings.map((setting, index) => (
            <SettingsToggleRow
              key={setting.key}
              label={setting.label}
              value={Boolean(settings[setting.key])}
              onValueChange={(value) => void handleToggle(setting.key, value)}
              disabled={loading}
              showDivider={index < defaultSettings.length - 1}
            />
          ))}
        </Panel>

        <AppButton label={loading ? 'Loading...' : 'Reset defaults'} onPress={resetToDefaults} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.offWhite,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  content: {
    paddingBottom: spacing.xl,
  },
});
