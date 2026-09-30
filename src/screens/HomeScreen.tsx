import React, { useRef, useState } from 'react';

import { CameraView, useCameraPermissions } from 'expo-camera';

import { ActivityIndicator, StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/AppNavigator';

import { NavButton } from '@/components/ui/NavButton';

import { recognize, type OCRResult } from 'react-native-nitro-ocr';

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
        navigation.navigate('ScanConfirmation');
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

      {/* Main scan button */}
      <TouchableOpacity
        style={[styles.scanButton, (!cameraReady || isScanning) && styles.scanButtonDisabled]}
        disabled={!cameraReady || isScanning}
        onPress={startScan}
      >
        <View style={styles.scanButtonInner}>
          <Text style={styles.scanButtonText}>{isScanning ? `${photoCount}/5` : 'SCAN'}</Text>
        </View>
      </TouchableOpacity>

      {/* Existing navigation buttons */}
      <NavButton
        label="Pref"
        style={styles.prefButton}
        onPress={() => navigation.navigate('Preferences')}
      />

      <NavButton
        label="Look"
        style={styles.lookupButton}
        onPress={() => navigation.navigate('Lookup')}
      />

      <NavButton
        label="Confirm"
        style={styles.resultButton}
        onPress={() => navigation.navigate('ScanConfirmation')}
      />
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
    paddingBottom: 10,
  },

  permissionButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },

  permissionText: {
    color: 'white',
    fontWeight: 'bold',
  },

  /*
   * Scan progress
   */
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
    bottom: 35,
    alignSelf: 'center',

    width: 90,
    height: 90,

    borderRadius: 45,

    backgroundColor: 'white',

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },

  scanButtonInner: {
    width: 70,
    height: 70,

    borderRadius: 35,

    backgroundColor: '#007AFF',

    justifyContent: 'center',
    alignItems: 'center',
  },

  scanButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '800',
  },

  scanButtonDisabled: {
    opacity: 0.5,
  },

  /*
   * Existing navigation buttons
   */
  prefButton: {
    bottom: 60,
    right: 30,
  },

  lookupButton: {
    bottom: 130,
    right: 28,
  },

  resultButton: {
    bottom: 200,
    right: 28,
  },
});
