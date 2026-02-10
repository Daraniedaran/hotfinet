import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const RequestInternetScreen = ({ navigation }) => {
  const [data, setData] = useState('');
  const [time, setTime] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📡 Request Internet</Text>

      <TextInput
        placeholder="Required Data (MB)"
        value={data}
        onChangeText={setData}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        placeholder="Time (Minutes)"
        value={time}
        onChangeText={setTime}
        keyboardType="numeric"
        style={styles.input}
      />

      <Button
        title="Find Providers"
        onPress={() => navigation.navigate('Providers')}
      />
    </View>
  );
};

export default RequestInternetScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
  },
});
