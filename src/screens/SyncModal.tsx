import React, { useEffect, useRef, useState } from 'react';
import {
  AppState,
  AppStateStatus,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { theme } from '../theme';

const { semanticColors, radii, spacing, border, typography } = theme;

export default function SyncModal() {
  const [visible, setVisible] = useState(true);

  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
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

          <TouchableOpacity style={styles.button} onPress={() => setVisible(false)}>
            <Text style={styles.buttonText}>Agree</Text>
          </TouchableOpacity>
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
});
