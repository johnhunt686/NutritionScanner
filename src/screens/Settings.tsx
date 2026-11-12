import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { AppButton } from '../components/ui/AppButton';
import { Panel } from '../components/ui/SettingsPanel';
import { SettingsToggleRow } from '../components/ui/SettingsToggleRow';
import { useAppSettings, type AppSettingKey } from '../state/AppSettingsContext';
import { theme } from '../theme';

const { spacing } = theme;

const settingsOptions: Array<{ key: AppSettingKey; label: string }> = [
  { key: 'darkMode', label: 'Dark mode' },
  { key: 'vibrations', label: 'Vibrations' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'devSettings', label: 'Dev Settings' },
];

const defaultValues = {
  darkMode: false,
  vibrations: false,
  notifications: false,
  devSettings: false,
} satisfies Record<AppSettingKey, boolean>;

export default function Settings() {
  const { colors, settings, isReady, updateSetting, requestNotificationsPermission } =
    useAppSettings();
  const [resetting, setResetting] = useState(false);
  const [saving, setSaving] = useState(false);
  const styles = createStyles(colors.theme);

  async function handleToggle(key: AppSettingKey, value: boolean) {
    setSaving(true);
    try {
      if (key === 'notifications' && value) {
        const permissionGranted = await requestNotificationsPermission();
        if (!permissionGranted) {
          Alert.alert(
            'Notifications not allowed',
            'Allow notifications in your device settings to enable them in the app.',
          );
          return;
        }
      }

      await updateSetting(key, value);
    } catch (error) {
      console.error(`Failed to update ${key} setting:`, error);
      Alert.alert('Setting not saved', 'Please try changing this setting again.');
    } finally {
      setSaving(false);
    }
  }

  async function resetToDefaults() {
    setResetting(true);
    try {
      for (const [key, value] of Object.entries(defaultValues) as [AppSettingKey, boolean][]) {
        await updateSetting(key, value);
      }
    } catch (error) {
      console.error('Failed to reset settings:', error);
      Alert.alert('Settings not reset', 'Please try resetting your settings again.');
    } finally {
      setResetting(false);
    }
  }

  async function sendTestNotification() {
    if (!settings.notifications) {
      Alert.alert('Notifications are off', 'Turn on Notifications before sending a test.');
      return;
    }

    try {
      const Notifications = await import('expo-notifications');
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test notification',
          body: 'Notifications are working on your device.',
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Failed to send test notification:', error);
      Alert.alert('Notification failed', 'The test notification could not be sent.');
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.theme.surface }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Panel>
          {settingsOptions.map((setting, index) => (
            <SettingsToggleRow
              key={setting.key}
              label={setting.label}
              value={settings[setting.key]}
              onValueChange={(value) => void handleToggle(setting.key, value)}
              disabled={!isReady || resetting || saving}
              showDivider={index < settingsOptions.length - 1}
            />
          ))}
        </Panel>

        {settings.devSettings && (
          <AppButton
            label="Send test notification"
            onPress={() => void sendTestNotification()}
            disabled={!isReady || resetting || saving}
          />
        )}

        <View style={styles.resetButton}>
          <AppButton
            label={resetting ? 'Resetting...' : 'Reset defaults'}
            onPress={() => void resetToDefaults()}
            disabled={!isReady || resetting || saving}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: import('../theme/colors').SemanticThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xl,
      paddingBottom: spacing.lg,
    },
    content: {
      paddingBottom: spacing.xl,
    },
    resetButton: {
      marginTop: spacing.md,
    },
  });
