import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

export default function Preferences() {
  const [poopAllergy, setPoopAllergy] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [explode, setExplode] = useState(true);
  const [vibrations, setVibrations] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView>
        <PreferenceRow
          label="Poop Allergy"
          value={poopAllergy}
          onValueChange={setPoopAllergy}
        />

        <PreferenceRow
          label="Dark Mode"
          value={darkMode}
          onValueChange={setDarkMode}
        />

        <PreferenceRow
          label="Explode On Start"
          value={explode}
          onValueChange={setExplode}
        />

        <PreferenceRow
          label="Vibrations"
          value={vibrations}
          onValueChange={setVibrations}
        />
      </ScrollView>
    </View>
  );
}

type PreferenceRowProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function PreferenceRow({
  label,
  value,
  onValueChange,
}: PreferenceRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>

      <Switch
        value={value}
        onValueChange={onValueChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  label: {
    fontSize: 16,
  },
});