import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  type GestureResponderEvent,
} from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy'; // on SDK 53 or earlier: 'expo-file-system'
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme';
import { recognize, type OCRResult } from 'react-native-nitro-ocr';
import { combineOcrResults } from '../utils/CombineOcrResults';
import { toBlackAndWhite } from '../utils/toBlackAndWhite';
import { useAppSettings, vibrateIfEnabled } from '../state/AppSettingsContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const { radii, spacing, typography } = theme;

const TOTAL_PHOTOS = 5;
const CAPTURE_QUALITY = 0.5;
const OCR_IMAGE_WIDTH = 1600;

// Black and white settings. Contrast 2-4 is a good range
const USE_BLACK_AND_WHITE = true;
const BW_CONTRAST = 3;
const BW_THRESHOLD = 0.5;

// These percentages define the visible frame and the approximate image crop.
const FRAME_LEFT = 0.1;
const FRAME_TOP = 0.25;
const FRAME_WIDTH = 0.8;
const FRAME_HEIGHT = 0.4;

// Barcode / QR detection settings.
const BARCODE_TYPES = ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] as const;
const LOOKUP_TIMEOUT_MS = 8000;
const DISMISS_COOLDOWN_MS = 3000; // don't re-show the popup for the same code right after dismissing

const FOCUS_PULSE_MS = 400;
const FOCUS_RING_MS = 800;
const FOCUS_RING_SIZE = 70;

type CapturedPhoto = { uri: string; width: number; height: number };
type DetectedCode = { type: string; data: string };

const deleteQuietly = (uri?: string) => {
  if (!uri) return;
  FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});
};

// Pulls a GTIN out of a SmartLabel / GS1 Digital Link style URL,
// e.g. https://example.com/01/00012345678905 or ...?gtin=012345678905
const extractGtin = (url: string): string | null => {
  const match = url.match(/\/01\/(\d{8,14})/) ?? url.match(/[?&](?:gtin|upc|ean)=(\d{8,14})/i);
  if (!match) return null;
  const gtin = match[1];
  // 14-digit GTINs with a leading 0 are just EAN-13 / UPC-A codes with padding.
  return gtin.length === 14 && gtin.startsWith('0') ? gtin.slice(1) : gtin;
};

// Looks up ingredient text for a product code on Open Food Facts.
const fetchIngredientsByBarcode = async (code: string): Promise<string | null> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=ingredients_text`,
      { signal: controller.signal },
    );
    const json = await res.json();
    const text: unknown = json.status === 1 ? json.product?.ingredients_text : null;
    return typeof text === 'string' && text.trim().length > 0 ? text.trim() : null;
  } finally {
    clearTimeout(timer);
  }
};

// Turns a detected code into text for the results screen, or a message explaining why not.
const resolveCode = async ({
  type,
  data,
}: DetectedCode): Promise<{ text?: string; message?: string }> => {
  const text = data.trim();

  if (type === 'qr') {
    if (/^https?:\/\//i.test(text)) {
      // SmartLabel (or other) link: pull the product code out of it, then use Open Food Facts.
      const gtin = extractGtin(text);
      if (!gtin) {
        return {
          message:
            "That link doesn't include a product code. Try scanning the ingredients list instead.",
        };
      }
      const ingredients = await fetchIngredientsByBarcode(gtin);
      return ingredients
        ? { text: ingredients }
        : { message: 'No ingredients found for that product.' };
    }

    // QR code that is just a number: treat it like a product barcode.
    if (/^\d{8,14}$/.test(text)) {
      const ingredients = await fetchIngredientsByBarcode(text);
      return ingredients
        ? { text: ingredients }
        : { message: 'No ingredients found for that product.' };
    }

    // QR code that contains plain text: process it like OCR text.
    return { text };
  }

  // Regular product barcode (EAN / UPC / Code 128).
  const ingredients = await fetchIngredientsByBarcode(text);
  return ingredients
    ? { text: ingredients }
    : { message: 'Product not found. Try scanning the ingredients list instead.' };
};

const describeCode = (code: DetectedCode): string => {
  if (code.type === 'qr')
    return /^https?:\/\//i.test(code.data) ? 'QR code link detected' : 'QR code detected';
  return 'Barcode detected';
};

export default function HomeScreen({ navigation }: Props) {
  const { colors, settings } = useAppSettings();
  const styles = createStyles(colors.theme);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const scanningRef = useRef(false);

  const [cameraReady, setCameraReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Barcode / QR popup state.
  const [detected, setDetected] = useState<DetectedCode | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const popupOpenRef = useRef(false); // synchronous guard: the camera fires many events per second
  const ignoredRef = useRef<{ data: string; until: number } | null>(null);

  // Tap to refocus state.
  const [focusMode, setFocusMode] = useState<'on' | 'off'>('off');
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);
  const focusPulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusRingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Single place that decides where scanned text goes, shared by OCR, QR and barcode flows.
  const openWithText = (text: string) => {
    if (settings.devSettings) {
      navigation.navigate('ScanConfirmation', { scannedText: text });
    } else {
      navigation.navigate('ScanResult', { scannedText: text });
    }
  };

  // Crop -> resize -> black and white -> OCR for one photo.
  // Runs in the background while the next photo is being captured.
  const processPhoto = async (photo: CapturedPhoto): Promise<OCRResult> => {
    let croppedUri: string | undefined;
    let bwUri: string | undefined;

    try {
      const originX = Math.round(photo.width * FRAME_LEFT);
      const originY = Math.round(photo.height * FRAME_TOP);
      const cropWidth = Math.min(photo.width - originX, Math.round(photo.width * FRAME_WIDTH));
      const cropHeight = Math.min(photo.height - originY, Math.round(photo.height * FRAME_HEIGHT));

      const cropped = await ImageManipulator.manipulateAsync(
        photo.uri,
        [
          { crop: { originX, originY, width: cropWidth, height: cropHeight } },
          // Resize BEFORE black and white so Skia processes a small image.
          { resize: { width: OCR_IMAGE_WIDTH } },
        ],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        },
      );
      croppedUri = cropped.uri;

      let ocrUri = cropped.uri;

      if (USE_BLACK_AND_WHITE) {
        try {
          bwUri = await toBlackAndWhite(cropped.uri, {
            contrast: BW_CONTRAST,
            threshold: BW_THRESHOLD,
          });
          ocrUri = bwUri;
        } catch (bwError) {
          // If preprocessing fails, still OCR the color crop so the scan works.
          console.warn('Black and white preprocessing failed:', bwError);
        }
      }

      return await recognize(ocrUri, {
        recognitionLevel: 'fast',
        languages: ['en-US'],
      });
    } finally {
      // Clean up temp files for this photo.
      deleteQuietly(photo.uri);
      deleteQuietly(croppedUri);
      deleteQuietly(bwUri);
    }
  };

  const startScan = async () => {
    if (scanningRef.current || !cameraReady || !cameraRef.current) {
      return;
    }

    scanningRef.current = true;
    dismissPopup(false);
    if (focusPulseTimer.current) clearTimeout(focusPulseTimer.current);
    setFocusMode('off');
    setFocusPoint(null);
    setIsScanning(true);
    setIsProcessing(false);
    setPhotoCount(0);
    setError(null);

    const jobs: Promise<OCRResult>[] = [];

    try {
      for (let i = 0; i < TOTAL_PHOTOS; i += 1) {
        if (!cameraRef.current) break;

        const photo = await cameraRef.current.takePictureAsync({
          quality: CAPTURE_QUALITY,
          skipProcessing: false,
          shutterSound: false,
          exif: false,
        });

        if (!photo) continue;

        setPhotoCount(i + 1);

        const job = processPhoto(photo);
        job.catch(() => {});
        jobs.push(job);
      }

      // All photos are captured; wait for any processing still running.
      setIsProcessing(true);
      const results = await Promise.all(jobs);

      if (results.length === TOTAL_PHOTOS) {
        openWithText(combineOcrResults(results));
      } else {
        setError('Could not capture all five images. Please try again.');
      }
    } catch (scanError) {
      setError(
        scanError instanceof Error ? scanError.message : 'Something went wrong while scanning.',
      );
    } finally {
      scanningRef.current = false;
      setIsScanning(false);
      setIsProcessing(false);
    }
  };

  // Called by the main camera whenever it sees a barcode/qrcode.
  const handleBarcodeDetected = ({ type, data }: BarcodeScanningResult) => {
    if (popupOpenRef.current || scanningRef.current) return;

    const text = data.trim();
    if (!text) return;

    const ignored = ignoredRef.current;
    if (ignored && ignored.data === text && Date.now() < ignored.until) return;

    popupOpenRef.current = true;
    vibrateIfEnabled(settings.vibrations);
    setError(null);
    setPopupMessage(null);
    setDetected({ type, data: text });
  };

  const dismissPopup = (applyCooldown = true) => {
    if (applyCooldown && detected) {
      ignoredRef.current = { data: detected.data, until: Date.now() + DISMISS_COOLDOWN_MS };
    }
    popupOpenRef.current = false;
    setDetected(null);
    setPopupMessage(null);
    setIsLookingUp(false);
  };

  // User tapped "Scan" on the popup.
  const confirmDetected = async () => {
    if (!detected || isLookingUp) return;

    vibrateIfEnabled(settings.vibrations);
    setIsLookingUp(true);
    setPopupMessage(null);

    try {
      const result = await resolveCode(detected);
      if (result.text) {
        dismissPopup(true);
        openWithText(result.text);
      } else {
        setPopupMessage(result.message ?? 'Could not read that code.');
        setIsLookingUp(false);
      }
    } catch (lookupError) {
      const aborted = lookupError instanceof Error && lookupError.name === 'AbortError';
      setPopupMessage(
        aborted
          ? 'The lookup timed out. Check your connection and try again.'
          : 'Could not look up that code. Check your connection and try again.',
      );
      setIsLookingUp(false);
    }
  };

  const handleTapToFocus = (e: GestureResponderEvent) => {
    if (scanningRef.current || !cameraReady) return;

    const { locationX, locationY } = e.nativeEvent;
    setFocusPoint({ x: locationX, y: locationY });
    setFocusMode('on');

    if (focusPulseTimer.current) clearTimeout(focusPulseTimer.current);
    if (focusRingTimer.current) clearTimeout(focusRingTimer.current);
    focusPulseTimer.current = setTimeout(() => setFocusMode('off'), FOCUS_PULSE_MS);
    focusRingTimer.current = setTimeout(() => setFocusPoint(null), FOCUS_RING_MS);
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.message}>We need your permission to show the camera.</Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => {
            vibrateIfEnabled(settings.vibrations);
            void requestPermission();
          }}
        >
          <Text style={styles.permissionText}>Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        animateShutter={false}
        autofocus={focusMode}
        barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
        onBarcodeScanned={handleBarcodeDetected}
        onCameraReady={() => setCameraReady(true)}
        onMountError={(mountError) => setError(mountError.message)}
      />

      {/* Darken everything outside the ingredient capture frame. */}
      <View pointerEvents="none" style={styles.frameTop} />
      <View pointerEvents="none" style={styles.frameBottom} />
      <View pointerEvents="none" style={styles.frameLeft} />
      <View pointerEvents="none" style={styles.frameRight} />
      <View pointerEvents="none" style={styles.ingredientFrame}>
        <Text style={styles.frameLabel}>Align ingredients list inside box</Text>
      </View>

      {/*Tap anywhere on the preview to refocus.*/}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={handleTapToFocus}
        accessibilityLabel="Tap to refocus camera"
      />

      {focusPoint && (
        <View
          pointerEvents="none"
          style={[
            styles.focusRing,
            { left: focusPoint.x - FOCUS_RING_SIZE / 2, top: focusPoint.y - FOCUS_RING_SIZE / 2 },
          ]}
        />
      )}

      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => {
          vibrateIfEnabled(settings.vibrations);
          navigation.navigate('Settings');
        }}
        accessibilityRole="button"
        accessibilityLabel="Settings"
      >
        <Ionicons name="settings-outline" size={32} color="white" />
      </TouchableOpacity>

      {isScanning && (
        <View style={styles.scanStatus}>
          <ActivityIndicator color="white" size="small" />
          <Text style={styles.scanStatusText}>
            {isProcessing ? 'Reading text...' : `Capturing ${photoCount}/${TOTAL_PHOTOS}`}
          </Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/*Barcode or QR popup*/}
      {detected && (
        <View style={styles.codePopup}>
          <View style={styles.codePopupHeader}>
            <Ionicons
              name={detected.type === 'qr' ? 'qr-code-outline' : 'barcode-outline'}
              size={22}
              color={colors.theme.text}
            />
            <Text style={styles.codePopupTitle}>{describeCode(detected)}</Text>
          </View>

          <Text style={styles.codePopupData} numberOfLines={1} ellipsizeMode="middle">
            {detected.data}
          </Text>

          {popupMessage && <Text style={styles.codePopupError}>{popupMessage}</Text>}

          <View style={styles.codePopupButtons}>
            <TouchableOpacity
              style={[styles.codePopupButton, styles.codePopupSecondary]}
              onPress={() => {
                vibrateIfEnabled(settings.vibrations);
                dismissPopup(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Dismiss"
            >
              <Text style={styles.codePopupSecondaryText}>Dismiss</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.codePopupButton,
                styles.codePopupPrimary,
                isLookingUp && styles.scanButtonDisabled,
              ]}
              disabled={isLookingUp}
              onPress={() => void confirmDetected()}
              accessibilityRole="button"
              accessibilityLabel="Scan this code"
            >
              {isLookingUp ? (
                <ActivityIndicator size="small" color={colors.theme.background} />
              ) : (
                <Text style={styles.codePopupPrimaryText}>{popupMessage ? 'Retry' : 'Scan'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View pointerEvents="none" style={styles.bottomBar} />

      <TouchableOpacity
        style={[styles.scanButton, (!cameraReady || isScanning) && styles.scanButtonDisabled]}
        disabled={!cameraReady || isScanning}
        onPress={() => {
          vibrateIfEnabled(settings.vibrations);
          void startScan();
        }}
        accessibilityRole="button"
        accessibilityLabel="Scan ingredients"
      >
        <View style={styles.scanButtonInner} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.prefButton}
        onPress={() => {
          vibrateIfEnabled(settings.vibrations);
          navigation.navigate('Preferences');
        }}
        accessibilityRole="button"
        accessibilityLabel="Preferences"
      >
        <Ionicons name="settings-outline" size={32} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.lookupButton}
        onPress={() => {
          vibrateIfEnabled(settings.vibrations);
          navigation.navigate('Lookup');
        }}
        accessibilityRole="button"
        accessibilityLabel="Search foods"
      >
        <Ionicons name="search-outline" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: import('../theme/colors').SemanticThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: 'black',
    },
    permissionContainer: {
      flex: 1,
      justifyContent: 'center',
      padding: spacing.lg,
      backgroundColor: colors.background,
    },
    camera: {
      flex: 1,
    },
    message: {
      textAlign: 'center',
      paddingBottom: spacing.md,
      color: colors.text,
      fontFamily: typography.fonts.body,
    },
    permissionButton: {
      backgroundColor: colors.primary,
      padding: spacing.sm,
      borderRadius: radii.medium,
      alignSelf: 'center',
    },
    permissionText: {
      color: colors.background,
      fontFamily: typography.fonts.heading,
      fontWeight: typography.fontWeights.bold,
    },

    // The four dark overlays leave a clear window for the ingredients label.
    frameTop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: `${FRAME_TOP * 100}%`,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },
    frameBottom: {
      position: 'absolute',
      top: `${(FRAME_TOP + FRAME_HEIGHT) * 100}%`,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },
    frameLeft: {
      position: 'absolute',
      top: `${FRAME_TOP * 100}%`,
      left: 0,
      width: `${FRAME_LEFT * 100}%`,
      height: `${FRAME_HEIGHT * 100}%`,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },
    frameRight: {
      position: 'absolute',
      top: `${FRAME_TOP * 100}%`,
      right: 0,
      width: `${(1 - FRAME_LEFT - FRAME_WIDTH) * 100}%`,
      height: `${FRAME_HEIGHT * 100}%`,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },
    ingredientFrame: {
      position: 'absolute',
      top: `${FRAME_TOP * 100}%`,
      left: `${FRAME_LEFT * 100}%`,
      width: `${FRAME_WIDTH * 100}%`,
      height: `${FRAME_HEIGHT * 100}%`,
      borderWidth: 2,
      borderColor: '#35E879',
      borderRadius: 8,
      backgroundColor: 'transparent',
      alignItems: 'center',
    },
    frameLabel: {
      position: 'absolute',
      top: -34,
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 6,
      overflow: 'hidden',
    },
    bottomBar: {
      position: 'absolute',
      bottom: 55,
      left: 40,
      right: 40,
      height: 100,
      backgroundColor: 'white',
      opacity: 0.4,
      borderRadius: 50,
    },
    scanStatus: {
      position: 'absolute',
      top: 70,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 20,
    },
    scanStatusText: {
      color: 'white',
      fontSize: 15,
      fontWeight: '600',
    },
    errorBox: {
      position: 'absolute',
      top: 120,
      left: 20,
      right: 20,
      backgroundColor: 'rgba(180, 40, 40, 0.9)',
      padding: 12,
      borderRadius: 8,
    },
    errorText: {
      color: 'white',
      textAlign: 'center',
    },
    focusRing: {
      position: 'absolute',
      width: FOCUS_RING_SIZE,
      height: FOCUS_RING_SIZE,
      borderRadius: FOCUS_RING_SIZE / 2,
      borderWidth: 2,
      borderColor: 'white',
    },
    scanButton: {
      position: 'absolute',
      bottom: 60,
      alignSelf: 'center',
      borderWidth: 2,
      width: 90,
      aspectRatio: 1,
      borderRadius: 45,
      opacity: 0.8,
      backgroundColor: colors.background,
      borderColor: 'rgba(255, 255, 255, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    scanButtonInner: {
      width: 70,
      aspectRatio: 1,
      borderRadius: 35,
      overflow: 'hidden',
      opacity: 0.8,
      backgroundColor: colors.content,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scanButtonDisabled: {
      opacity: 0.5,
    },
    prefButton: {
      position: 'absolute',
      bottom: 68,
      right: 60,
      width: 75,
      height: 75,
      borderRadius: 9999,
      backgroundColor: colors.background,
      opacity: 0.6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    settingsButton: {
      position: 'absolute',
      top: 68,
      right: 30,
      width: 75,
      height: 75,
      borderRadius: 9999,
      backgroundColor: colors.background,
      opacity: 0.6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    lookupButton: {
      position: 'absolute',
      bottom: 68,
      left: 60,
      width: 75,
      height: 75,
      borderRadius: 9999,
      backgroundColor: colors.background,
      opacity: 0.6,
      justifyContent: 'center',
      alignItems: 'center',
    },
    codePopup: {
      position: 'absolute',
      bottom: 175,
      left: 24,
      right: 24,
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 14,
      gap: 8,
    },
    codePopupHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    codePopupTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
    codePopupData: {
      color: colors.text,
      fontSize: 13,
      opacity: 0.7,
    },
    codePopupError: {
      color: '#D64545',
      fontSize: 13,
      fontWeight: '600',
    },
    codePopupButtons: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 4,
    },
    codePopupButton: {
      flex: 1,
      minHeight: 44,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    codePopupPrimary: {
      backgroundColor: colors.primary,
    },
    codePopupPrimaryText: {
      color: colors.background,
      fontWeight: '700',
      fontSize: 15,
    },
    codePopupSecondary: {
      borderWidth: 1,
      borderColor: colors.text,
      opacity: 0.8,
    },
    codePopupSecondaryText: {
      color: colors.text,
      fontWeight: '600',
      fontSize: 15,
    },
  });
