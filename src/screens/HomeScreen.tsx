import React from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();

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
      <CameraView style={styles.camera} facing={'back'} />

      {/* Fitted Vertical Cluster in Bottom-Right */}
      <View style={styles.buttonCluster}>
        <TouchableOpacity style={styles.circleButton} onPress={() => console.log('Flash toggle')}>
          <Ionicons name="flash-outline" size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.circleButton} onPress={() => console.log('Camera flip')}>
          <Ionicons name="camera-reverse-outline" size={34} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.circleButton} onPress={() => console.log('Settings')}>
          <Ionicons name="options-outline" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
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

  // Shrink-wraps horizontally around the circular buttons
  buttonCluster: {
    position: 'absolute',
    bottom: 40,
    right: 16,
    height: '25%',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 40,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },

  circleButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
});
