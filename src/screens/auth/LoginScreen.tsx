import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  SafeAreaView 
} from 'react-native';
// Ruta corregida para tu estructura de carpetas
import { getDatabase } from '../../data/database/database';

// 1. Definimos la forma de los datos que vienen de la BD para TypeScript
interface UserRow {
  id: number;
  username: string;
  email: string;
}

interface Props {
  onNavigateToRegister: () => void;
  onBack: () => void;
  // Agregamos esta por si quieres que el login funcione de verdad al Dashboard
  onLoginSuccess?: () => void; 
}

const LoginScreen = ({ onNavigateToRegister, onBack, onLoginSuccess }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const db = getDatabase();
    
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, completa todos los campos');
      return;
    }

    try {
      // 2. Usamos el Generic <UserRow> para que TS reconozca las propiedades
      const user = db.getFirstSync<UserRow>(
        'SELECT id, username, email FROM Users WHERE email = ? AND password = ?',
        [email, password]
      );

      if (user) {
        // 3. Ahora user.username funciona perfectamente sin errores
        Alert.alert('¡Bienvenido!', `Hola de nuevo, ${user.username}`, [
          { 
            text: 'Continuar', 
            onPress: () => {
              if (onLoginSuccess) onLoginSuccess();
            } 
          }
        ]);
      } else {
        Alert.alert('Error', 'Correo o contraseña incorrectos');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Problema al conectar con la base de datos');
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      {/* Header Estilo Figma */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inicio de sesión</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.welcomeTitle}>Bienvenido de nuevo</Text>
        <Text style={styles.welcomeSubtitle}>
          Ingresa a tu cuenta para gestionar tus movimientos
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Correo</Text>
            <TextInput 
              style={styles.input} 
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="ejemplo@correo.com"
              placeholderTextColor="#C0C0C0"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <TextInput 
              style={styles.input} 
              value={password}
              onChangeText={setPassword}
              secureTextEntry 
              placeholder="••••••••"
              placeholderTextColor="#C0C0C0"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>¿Olvidaste la contraseña?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Acceder</Text>
        </TouchableOpacity>
        
        <View style={styles.registerContainer}>
          <Text style={styles.noAccountText}>¿No tienes una cuenta? </Text>
          <TouchableOpacity onPress={onNavigateToRegister}>
            <Text style={styles.registerLink}>Registrarse</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 10,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 35, fontWeight: '300', color: '#000' },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  contentContainer: { flex: 1, paddingHorizontal: 25, paddingTop: 40 },
  welcomeTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  welcomeSubtitle: { fontSize: 16, color: '#808080', marginBottom: 40 },
  form: { marginBottom: 15 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 16, fontWeight: '500', marginBottom: 8 },
  input: {
    height: 55,
    borderColor: '#C0C0C0',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  forgotPassword: { alignSelf: 'flex-start', marginBottom: 40 },
  forgotPasswordText: { color: '#6200EE', fontSize: 14, fontWeight: '500' },
  button: {
    height: 55,
    backgroundColor: '#6200EE',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  registerContainer: { flexDirection: 'row', justifyContent: 'center' },
  noAccountText: { fontSize: 15 },
  registerLink: { fontSize: 15, color: '#6200EE', fontWeight: 'bold' }
});

export default LoginScreen;