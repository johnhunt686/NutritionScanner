import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Assuming your constants are imported from a central theme file
import { theme } from '@/theme';
import { typography } from '@/theme/text';
const { semanticColors, radii, spacing, border } = theme;

export interface BareModalProps {
  visible: boolean;
  onRequestClose?: () => void;
  headerText?: string;
  confirmText?: string;
  onConfirm?: () => void;
  denyText?: string;
  onDeny?: () => void;
  children?: React.ReactNode;
}

export const CoolModal: React.FC<BareModalProps> = ({
  visible,
  onRequestClose,
  headerText,
  confirmText = 'Confirm',
  onConfirm,
  denyText = 'Cancel',
  onDeny,
  children,
}) => {
  const hasConfirm = Boolean(onConfirm) || true;
  const hasDeny = Boolean(onDeny) || true;
  const showFooter = hasConfirm || hasDeny;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onRequestClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {headerText ? (
            <View style={styles.header}>
              <Text style={styles.headerText}>{headerText}</Text>
            </View>
          ) : null}

          <View style={styles.body}>{children}</View>

          {showFooter && (
            <View style={styles.footer}>
              {hasDeny && (
                <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={onDeny}>
                  <Text style={styles.text}>{denyText}</Text>
                </TouchableOpacity>
              )}

              {hasConfirm && (
                <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={onConfirm}>
                  <Text style={styles.text}>{confirmText}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    backgroundColor: semanticColors.theme.content,
    borderRadius: radii.large,
    borderWidth: border.medium,
    borderColor: semanticColors.theme.border,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerText: {
    textAlign: 'left',
    color: semanticColors.theme.text,
    fontSize: typography.fontSizes.large,
    fontFamily: typography.fonts.heading,
    fontWeight: typography.fontWeights.bold,
  },
  body: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.medium,
    borderWidth: border.medium,
    flexGrow: 1,
    borderColor: semanticColors.theme.border,
  },
  buttonSecondary: {
    backgroundColor: semanticColors.theme.notice,
  },
  buttonPrimary: {
    backgroundColor: semanticColors.theme.primary,
  },
  text: {
    color: semanticColors.theme.text,
    fontSize: typography.fontSizes.medium,
    fontFamily: typography.fonts.heading,
  },
});
