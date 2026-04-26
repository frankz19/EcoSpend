import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthService } from '../../services/authService';

interface Props {
  onBack: () => void;
  onRegisterSuccess: () => void;
}

const RegisterScreen = ({ onBack, onRegisterSuccess }: Props) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    const result = await AuthService.register(username, email, password);

    if (result.success) {
      Alert.alert('Éxito', 'Cuenta creada.', [{ text: 'OK', onPress: onRegisterSuccess }]);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registro</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.welcomeTitle}>Crear Cuenta</Text>
        <View style={styles.form}>

          <TextInput 
            style={styles.input} 
            value={username} 
            onChangeText={setUsername} 
            placeholder="Usuario" 
            autoCapitalize="none" 
          />
          <TextInput 
            style={styles.input} 
            value={email} 
            onChangeText={setEmail} 
            placeholder="Correo" 
            keyboardType="email-address" 
            autoCapitalize="none" 
          />
          <TextInput 
            style={styles.input} 
            value={password} 
            onChangeText={setPassword} 
            placeholder="Contraseña" 
            secureTextEntry 
          />
          <TextInput 
            style={styles.input} 
            value={confirmPassword} 
            onChangeText={setConfirmPassword} 
            placeholder="Confirmar" 
            secureTextEntry 
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Registrarse</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 60, paddingHorizontal: 10 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 35, color: '#000' },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  contentContainer: { paddingHorizontal: 25, paddingTop: 20 },
  welcomeTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 30 },
  form: { gap: 15 },
  input: { height: 55, borderColor: '#C0C0C0', borderWidth: 1, borderRadius: 25, paddingHorizontal: 20 },
  button: { height: 55, backgroundColor: '#6200EE', borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginTop: 30 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});

export default RegisterScreen;