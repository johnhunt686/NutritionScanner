import React, { useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen({ navigation }: any) {
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Text style={styles.text}>Flip Camera</Text>
        </TouchableOpacity>
      </View>

      {/*Temp button to go to preferences*/}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('Preferences')}
      >
        <Text style={styles.buttonText}>Pref</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  message: { textAlign: 'center', paddingBottom: 10 },
  camera: { flex: 1 },
  buttonContainer: {
    position: 'absolute',
    bottom: 64,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    width: '100%',
    paddingHorizontal: 64,
  },
  button: { flex: 1, alignItems: 'center' },
  text: { fontSize: 24, fontWeight: 'bold', color: 'white' },

  //Temp preferences button styling
  floatingButton: {
    position: 'absolute',
    bottom: 60,
    right: 30,
    backgroundColor: 'teal',
    padding: 20,
    borderRadius: 50,
    zIndex: 1,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },

});
