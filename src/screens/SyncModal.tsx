import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { syncReferenceData } from '../utils/remoteSync';
import { theme } from '../theme';
import { useAppSettings, vibrateIfEnabled } from '../state/AppSettingsContext';

const { radii, spacing, border, typography } = theme;

export default function SyncModal() {
  const { colors, settings } = useAppSettings();
  const styles = createStyles(colors.theme);
  const [visible, setVisible] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const appState = useRef<AppStateStatus>(AppState.currentState);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    setSyncError(null);

    try {
      const result = await syncReferenceData();
      setSyncResult(`Updated ${result.ingredients} ingredients and ${result.tags} tags.`);
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Unable to sync database.');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        setSyncResult(null);
        setSyncError(null);
        setVisible(true);
      }

      appState.current = nextState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Sync Database</Text>
          <Text style={styles.message}>Download the latest ingredient and research data.</Text>
          {syncing && <ActivityIndicator color={colors.theme.primary} />}
          {syncResult && <Text style={styles.status}>{syncResult}</Text>}
          {syncError && <Text style={styles.error}>{syncError}</Text>}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.button}
              disabled={syncing}
              onPress={() => {
                vibrateIfEnabled(settings.vibrations);
                if (syncResult) setVisible(false);
                else void handleSync();
              }}
            >
              <Text style={styles.buttonText}>
                {syncing ? 'Syncing...' : syncResult ? 'Done' : 'Check in'}
              </Text>
            </TouchableOpacity>
            {!syncResult && (
              <TouchableOpacity
                disabled={syncing}
                onPress={() => {
                  vibrateIfEnabled(settings.vibrations);
                  setVisible(false);
                }}
              >
                <Text style={styles.dismissText}>Not now</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: import('../theme/colors').SemanticThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
    },

    message: {
      color: colors.text,
      fontSize: typography.fontSizes.medium,
      fontFamily: typography.fonts.body,
      textAlign: 'center',
      marginBottom: spacing.md,
    },

    status: {
      color: colors.text,
      fontSize: typography.fontSizes.small,
      fontFamily: typography.fonts.body,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },

    error: {
      color: colors.notice,
      fontSize: typography.fontSizes.small,
      fontFamily: typography.fonts.body,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },

    actions: {
      alignItems: 'center',
      gap: spacing.sm,
    },

    modal: {
      width: '80%',
      minHeight: 200,
      padding: spacing.lg,
      backgroundColor: colors.content,
      borderRadius: radii.large,
      borderWidth: border.medium,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },

    title: {
      color: colors.text,
      fontSize: typography.fontSizes.display,
      fontFamily: typography.fonts.heading,
      fontWeight: typography.fontWeights.bold,
      marginBottom: spacing.md,
    },

    button: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: radii.medium,
    },

    buttonText: {
      color: colors.background,
      fontSize: typography.fontSizes.medium,
      fontFamily: typography.fonts.heading,
    },

    dismissText: {
      color: colors.text,
      fontSize: typography.fontSizes.small,
      fontFamily: typography.fonts.body,
      padding: spacing.xs,
    },
  });
