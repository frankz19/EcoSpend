import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { initDatabase } from './src/data/database/database';

export default function App() {
  
  // El Hook useEffect asegura que esto se ejecute UNA SOLA VEZ al arrancar.
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>MVP de EcoSpend </Text>
      <Text>se subio el esquema de la base de datos /frank</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F98909', // Usando el naranja de su paleta
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  }
});