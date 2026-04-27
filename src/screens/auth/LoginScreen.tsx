import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { AuthService } from '../../services/authService';
import { Validators } from '../../utils/validators';

interface Props {
  onGoToRegister: () => void;
  onBack: () => void;
  onLogin: (userId: number) => void;
}

const LoginScreen = ({ onGoToRegister, onBack, onLogin }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  // Verificar compatibilidad biométrica al cargar la pantalla
  useEffect(() => {
    (async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricAvailable(hasHardware && isEnrolled);
    })();
  }, []);

  const handleLogin = async () => {
    const cleanEmail = Validators.sanitizeText(email);

    if (!cleanEmail || !password) {
      return Alert.alert('Error', 'Completa los campos');
    }

    const result = await AuthService.login(cleanEmail, password);
    
    if (result.success && result.user) {
      const userData = JSON.stringify({ id: result.user.id });
      
      // Guardamos la sesión activa (para el auto-login)
      await SecureStore.setItemAsync('user_session', userData);
      // Guardamos un "recuerdo permanente" para el botón biométrico
      await SecureStore.setItemAsync('last_biometric_user', userData);
      
      onLogin(result.user.id);
    } else {
      Alert.alert('Error', result.error || 'Credenciales incorrectas');
    }
  };

  const handleBiometricLogin = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Accede a EcoSpend',
      cancelLabel: 'Cancelar',
      disableDeviceFallback: false,
    });

    if (result.success) {
      // BUSCAMOS EL RECUERDO PERMANENTE, no la sesión que se borró al hacer logout
      const savedBiometricUser = await SecureStore.getItemAsync('last_biometric_user');
      
      if (savedBiometricUser) {
        // Restauramos la sesión activa para que el resto de la app funcione
        await SecureStore.setItemAsync('user_session', savedBiometricUser);
        const { id } = JSON.parse(savedBiometricUser);
        onLogin(id);
      } else {
        Alert.alert(
          'Acceso Requerido', 
          'Inicia sesión con tu contraseña una vez para activar la biometría.'
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Login</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <TextInput 
          style={styles.input} 
          placeholder="Email" 
          value={email} 
          onChangeText={setEmail} 
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Password" 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry 
        />

        <TouchableOpacity style={styles.btn} onPress={handleLogin}>
          <Text style={styles.btnText}>Entrar</Text>
        </TouchableOpacity>

        {/* Botón Biométrico condicional */}
        {isBiometricAvailable && (
          <TouchableOpacity style={styles.biometricBtn} onPress={handleBiometricLogin}>
            <Text style={styles.biometricText}>🧬 Usar Huella o FaceID</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={onGoToRegister}>
          <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15 },
  backIcon: { fontSize: 40, color: '#000' },
  title: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 25, gap: 15 },
  input: { height: 55, borderWidth: 1, borderColor: '#DDD', borderRadius: 25, paddingHorizontal: 20 },
  btn: { height: 55, backgroundColor: '#6200EE', borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  btnText: { color: '#FFF', fontWeight: 'bold' },
  biometricBtn: { height: 55, borderWidth: 1, borderColor: '#6200EE', borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  biometricText: { color: '#6200EE', fontWeight: '600' },
  link: { textAlign: 'center', color: '#6200EE', marginTop: 15 }
});

export default LoginScreen;