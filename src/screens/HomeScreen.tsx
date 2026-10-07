import React, { useRef, useState } from 'react';

import { CameraView, useCameraPermissions } from 'expo-camera';

import { ActivityIndicator, StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList } from '../navigation/AppNavigator';

import { theme } from '../theme';

const { semanticColors, radii, spacing, typography } = theme;

import { recognize, type OCRResult } from 'react-native-nitro-ocr';
import { combineOcrResults } from '../utility/CombineOcrResults';
type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const TOTAL_PHOTOS = 5;
const CAPTURE_DELAY_MS = 1000;

export default function HomeScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();

  const cameraRef = useRef<CameraView>(null);
  const scanningRef = useRef(false);

  const [cameraReady, setCameraReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);

  const [, setOcrResults] = useState<OCRResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  /*
   * Wait before taking the next picture.
   */
  const delay = (ms: number) =>
    new Promise<void>((resolve) => {
      setTimeout(resolve, ms);
    });

  /*
   * Start the 5-photo scan.
   */
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
      for (let i = 0; i < TOTAL_PHOTOS; i++) {
        if (!cameraRef.current) {
          break;
        }

        /*
         * Give the camera a moment between captures.
         */
        if (i > 0) {
          await delay(CAPTURE_DELAY_MS);
        }

        /*
         * Take the picture.
         */
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.55,
          skipProcessing: false,
        });

        if (!photo) {
          continue;
        }

        /*
         * Run OCR on the picture.
         */
        const result = await recognize(photo.uri, {
          recognitionLevel: 'fast',
          languages: ['en-US'],
        });

        results.push(result);

        setOcrResults([...results]);
        setPhotoCount(i + 1);
      }

      /*
       * Make sure we actually finished all 5 pictures.
       */
      if (results.length === TOTAL_PHOTOS) {
        const combinedText = combineOcrResults(results);
        navigation.navigate('ScanConfirmation', { scannedText: combinedText });
      }
    } catch (scanError) {
      setError(
        scanError instanceof Error ? scanError.message : 'Something went wrong while scanning.',
      );
    } finally {
      scanningRef.current = false;
      setIsScanning(false);
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>

        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
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

      {/* Scan status */}
      {isScanning && (
        <View style={styles.scanStatus}>
          <ActivityIndicator color="white" size="small" />

          <Text style={styles.scanStatusText}>
            Scanning {photoCount}/{TOTAL_PHOTOS}
          </Text>
        </View>
      )}

      {/* Error */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.bottomBar} />

      {/* Main scan button */}
      <TouchableOpacity
        style={[styles.scanButton, (!cameraReady || isScanning) && styles.scanButtonDisabled]}
        disabled={!cameraReady || isScanning}
        onPress={startScan}
      >
        <View style={styles.scanButtonInner}></View>
      </TouchableOpacity>

      {/* Existing navigation buttons */}
      <TouchableOpacity
        style={styles.prefButton}
        onPress={() => navigation.navigate('Preferences')}
      >
        <Ionicons name="settings-outline" size={32} color="white" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.lookupButton} onPress={() => navigation.navigate('Lookup')}>
        <Ionicons name="search-outline" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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

  bottomBar: {
    position: 'absolute',
    bottom: 55,
    left: 40,
    right: 40,
    height: 100,

    backgroundColor: 'white',
    opacity: 0.4,

    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
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

  /*
   * Error message
   */
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

  /*
   * Main scan button
   */
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

  /*
   * Existing navigation buttons
   */
  prefButton: {
    position: 'absolute',
    bottom: 68,
    right: 60,

    width: 75,
    height: 75,
    borderRadius: 9999,

    color: 'black',
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

    color: 'black',
    backgroundColor: semanticColors.theme.background,
    opacity: 0.6,

    justifyContent: 'center',
    alignItems: 'center',
  },
});
