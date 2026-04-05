import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  SafeAreaView,
  ScrollView 
} from 'react-native';
import { getDatabase } from '../../data/database/database';

interface Props {
  onBack: () => void;
}

const RegisterScreen = ({ onBack }: Props) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    // 1. Validaciones básicas
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    // 2. Conexión a SQLite
    const db = getDatabase();

    try {
      // Intentamos insertar el nuevo usuario
      db.runSync(
        'INSERT INTO Users (username, email, password) VALUES (?, ?, ?)',
        [username, email, password]
      );
      
      Alert.alert(
        '¡Éxito!', 
        'Cuenta creada correctamente. Ahora puedes iniciar sesión.',
        [{ text: 'OK', onPress: onBack }] // Al dar OK, regresa al Login
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'El correo electrónico ya está registrado o hubo un error en la base de datos.');
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      {/* Header con flecha de volver */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear cuenta</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.welcomeTitle}>Únete a EcoSpend</Text>
        <Text style={styles.welcomeSubtitle}>
          Comienza a gestionar tus finanzas de forma inteligente y ecológica.
        </Text>

        <View style={styles.form}>
          {/* Campo Usuario */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre de usuario</Text>
            <TextInput 
              style={styles.input} 
              value={username}
              onChangeText={setUsername}
              placeholder="Ej. Frank_240"
              placeholderTextColor="#C0C0C0"
            />
          </View>

          {/* Campo Correo */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Correo electrónico</Text>
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

          {/* Campo Contraseña */}
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

          {/* Confirmar Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirmar contraseña</Text>
            <TextInput 
              style={styles.input} 
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry 
              placeholder="••••••••"
              placeholderTextColor="#C0C0C0"
            />
          </View>
        </View>

        {/* Botón de Registro */}
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Registrarse</Text>
        </TouchableOpacity>

        {/* Link para volver al login */}
        <View style={styles.loginLinkContainer}>
          <Text style={styles.alreadyAccountText}>¿Ya tienes una cuenta? </Text>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.loginLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 35,
    color: '#000000',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#808080',
    marginBottom: 30,
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 55,
    borderColor: '#C0C0C0',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6200EE',
    height: 55,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  alreadyAccountText: {
    fontSize: 15,
  },
  loginLink: {
    fontSize: 15,
    color: '#6200EE',
    fontWeight: 'bold',
  }
});

export default RegisterScreen;