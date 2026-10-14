import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme';
import { recognize, type OCRResult } from 'react-native-nitro-ocr';
import { combineOcrResults } from '../utils/CombineOcrResults';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const { semanticColors, radii, spacing, typography } = theme;

const TOTAL_PHOTOS = 5;
const CAPTURE_DELAY_MS = 250;
const PHOTO_QUALITY = 0.9;

// These percentages define the visible frame and the approximate image crop.
// The crop may need calibration on devices whose camera preview is scaled/cropped.
const FRAME_LEFT = 0.1;
const FRAME_TOP = 0.25;
const FRAME_WIDTH = 0.8;
const FRAME_HEIGHT = 0.4;

export default function HomeScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const scanningRef = useRef(false);

  const [cameraReady, setCameraReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);
  const [, setOcrResults] = useState<OCRResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const delay = (ms: number) =>
    new Promise<void>((resolve) => {
      setTimeout(resolve, ms);
    });

  const startScan = async () => {
    if (scanningRef.current || !cameraReady || !cameraRef.current) {
      return;
    }

    scanningRef.current = true;
    setIsScanning(true);
    setPhotoCount(0);
    setOcrResults([]);
    setError(null);

    const results: OCRResult[] = [];

    try {
      for (let i = 0; i < TOTAL_PHOTOS; i += 1) {
        if (!cameraRef.current) break;

        if (i > 0) {
          await delay(CAPTURE_DELAY_MS);
        }

        const photo = await cameraRef.current.takePictureAsync({
          quality: PHOTO_QUALITY,
          skipProcessing: false,
        });

        if (!photo) continue;

        // Crop the captured image to the approximate area shown by the guide.
        const originX = Math.round(photo.width * FRAME_LEFT);
        const originY = Math.round(photo.height * FRAME_TOP);
        const cropWidth = Math.min(
          photo.width - originX,
          Math.round(photo.width * FRAME_WIDTH),
        );
        const cropHeight = Math.min(
          photo.height - originY,
          Math.round(photo.height * FRAME_HEIGHT),
        );

        const croppedPhoto = await ImageManipulator.manipulateAsync(
          photo.uri,
          [
            {
              crop: {
                originX,
                originY,
                width: cropWidth,
                height: cropHeight,
              },
            },
          ],
          {
            compress: 0.95,
            format: ImageManipulator.SaveFormat.JPEG,
          },
        );

        // OCR only sees the cropped ingredient-label region.
        const result = await recognize(croppedPhoto.uri, {
          recognitionLevel: 'fast',
          languages: ['en-US'],
        });

        results.push(result);
        setOcrResults([...results]);
        setPhotoCount(i + 1);
      }

      if (results.length === TOTAL_PHOTOS) {
        const combinedText = combineOcrResults(results);
        navigation.navigate('ScanConfirmation', { scannedText: combinedText });
      } else {
        setError('Could not capture all five images. Please try again.');
      }
    } catch (scanError) {
      setError(
        scanError instanceof Error
          ? scanError.message
          : 'Something went wrong while scanning.',
      );
    } finally {
      scanningRef.current = false;
      setIsScanning(false);
    }
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.message}>
          We need your permission to show the camera.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
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

      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => navigation.navigate('Settings')}
        accessibilityRole="button"
        accessibilityLabel="Settings"
      >
        <Ionicons name="settings-outline" size={32} color="white" />
      </TouchableOpacity>

      {isScanning && (
        <View style={styles.scanStatus}>
          <ActivityIndicator color="white" size="small" />
          <Text style={styles.scanStatusText}>
            Scanning {photoCount}/{TOTAL_PHOTOS}
          </Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View pointerEvents="none" style={styles.bottomBar} />

      <TouchableOpacity
        style={[
          styles.scanButton,
          (!cameraReady || isScanning) && styles.scanButtonDisabled,
        ]}
        disabled={!cameraReady || isScanning}
        onPress={startScan}
        accessibilityRole="button"
        accessibilityLabel="Scan ingredients"
      >
        <View style={styles.scanButtonInner} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.prefButton}
        onPress={() => navigation.navigate('Preferences')}
        accessibilityRole="button"
        accessibilityLabel="Preferences"
      >
        <Ionicons name="settings-outline" size={32} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.lookupButton}
        onPress={() => navigation.navigate('Lookup')}
        accessibilityRole="button"
        accessibilityLabel="Search foods"
      >
        <Ionicons name="search-outline" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: semanticColors.theme.background,
  },
  camera: {
    flex: 1,
  },
  message: {
    textAlign: 'center',
    paddingBottom: spacing.md,
    color: semanticColors.theme.text,
    fontFamily: typography.fonts.body,
  },
  permissionButton: {
    backgroundColor: semanticColors.theme.primary,
    padding: spacing.sm,
    borderRadius: radii.medium,
    alignSelf: 'center',
  },
  permissionText: {
    color: semanticColors.theme.background,
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
  scanButton: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    borderWidth: 2,
    width: 90,
    aspectRatio: 1,
    borderRadius: 45,
    opacity: 0.8,
    backgroundColor: semanticColors.theme.background,
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
    backgroundColor: semanticColors.theme.content,
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
    backgroundColor: semanticColors.theme.background,
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
    backgroundColor: semanticColors.theme.background,
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
    backgroundColor: semanticColors.theme.background,
    opacity: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
