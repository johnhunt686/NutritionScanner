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

const { semanticColors, radii, spacing, border, typography } = theme;

export default function SyncModal() {
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
          {syncing && <ActivityIndicator color={semanticColors.theme.primary} />}
          {syncResult && <Text style={styles.status}>{syncResult}</Text>}
          {syncError && <Text style={styles.error}>{syncError}</Text>}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.button}
              disabled={syncing}
              onPress={syncResult ? () => setVisible(false) : handleSync}
            >
              <Text style={styles.buttonText}>
                {syncing ? 'Syncing...' : syncResult ? 'Done' : 'Check in'}
              </Text>
            </TouchableOpacity>
            {!syncResult && (
              <TouchableOpacity disabled={syncing} onPress={() => setVisible(false)}>
                <Text style={styles.dismissText}>Not now</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: semanticColors.theme.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },

  message: {
    color: semanticColors.theme.text,
    fontSize: typography.fontSizes.medium,
    fontFamily: typography.fonts.body,
    textAlign: 'center',
    marginBottom: spacing.md,
  },

  status: {
    color: semanticColors.theme.text,
    fontSize: typography.fontSizes.small,
    fontFamily: typography.fonts.body,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },

  error: {
    color: semanticColors.theme.notice,
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
    backgroundColor: semanticColors.theme.content,
    borderRadius: radii.large,
    borderWidth: border.medium,
    borderColor: semanticColors.theme.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    color: semanticColors.theme.text,
    fontSize: typography.fontSizes.display,
    fontFamily: typography.fonts.heading,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.md,
  },

  button: {
    backgroundColor: semanticColors.theme.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.medium,
  },

  buttonText: {
    color: semanticColors.theme.background,
    fontSize: typography.fontSizes.medium,
    fontFamily: typography.fonts.heading,
  },

  dismissText: {
    color: semanticColors.theme.text,
    fontSize: typography.fontSizes.small,
    fontFamily: typography.fonts.body,
    padding: spacing.xs,
  },
});
