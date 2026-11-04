import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Vibration } from 'react-native';
import * as Notifications from 'expo-notifications';
import { getUserSettings, updateUserSetting } from '../../db/queries';
import { darkSemanticColors, semanticColors, type SemanticThemeColors } from '../theme/colors';

export type AppSettingKey = 'darkMode' | 'vibrations' | 'notifications' | 'devSettings';
export type AppSettings = Record<AppSettingKey, boolean>;

const defaultSettings: AppSettings = {
  darkMode: false,
  vibrations: false,
  notifications: false,
  devSettings: false,
};

type AppSettingsContextValue = {
  settings: AppSettings;
  isReady: boolean;
  colors: { theme: SemanticThemeColors };
  updateSetting: (key: AppSettingKey, value: boolean) => Promise<void>;
  requestNotificationsPermission: () => Promise<boolean>;
};

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const savedSettings = await getUserSettings();
        if (!active) return;

        const nextSettings = { ...defaultSettings };
        for (const setting of savedSettings) {
          if (
            Object.prototype.hasOwnProperty.call(nextSettings, setting.key) &&
            typeof setting.value === 'boolean'
          ) {
            nextSettings[setting.key as AppSettingKey] = setting.value;
          }
        }
        setSettings(nextSettings);
      } catch (error) {
        console.error('Failed to load app settings:', error);
        Alert.alert('Settings unavailable', 'Your saved settings could not be loaded.');
      } finally {
        if (active) setIsReady(true);
      }
    }

    void loadSettings();
    return () => {
      active = false;
    };
  }, []);

  const updateSetting = async (key: AppSettingKey, value: boolean) => {
    await updateUserSetting(key, value);
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const requestNotificationsPermission = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'General',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const currentPermissions = await Notifications.getPermissionsAsync();
    if (
      currentPermissions.granted ||
      currentPermissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    ) {
      return true;
    }

    const requestedPermissions = await Notifications.requestPermissionsAsync();
    return (
      requestedPermissions.granted ||
      requestedPermissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    );
  };

  const value = useMemo(
    () => ({
      settings,
      isReady,
      colors: settings.darkMode ? darkSemanticColors : semanticColors,
      updateSetting,
      requestNotificationsPermission,
    }),
    [settings, isReady],
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within AppSettingsProvider');
  }
  return context;
}

export function useThemeColors() {
  return useAppSettings().colors;
}

export function vibrateIfEnabled(enabled: boolean) {
  if (enabled) Vibration.vibrate(10);
}
