import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthService } from '../../services/authService';

interface Props {
  onGoToRegister: () => void;
  onBack: () => void;
  onLogin: (userId: number) => void;
}

const LoginScreen = ({ onGoToRegister, onBack, onLogin }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Completa los campos');
    const result = await AuthService.login(email, password);
    if (result.success && result.user) onLogin(result.user.id);
    else Alert.alert('Error', result.error);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backIcon}>‹</Text></TouchableOpacity>
        <Text style={styles.title}>Login</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.content}>
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <TouchableOpacity style={styles.btn} onPress={handleLogin}><Text style={styles.btnText}>Entrar</Text></TouchableOpacity>
        <TouchableOpacity onPress={onGoToRegister}><Text style={styles.link}>No tienes cuenta? Registrate</Text></TouchableOpacity>
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
  btn: { height: 55, backgroundColor: '#6200EE', borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold' },
  link: { textAlign: 'center', color: '#6200EE', marginTop: 10 }
});

export default LoginScreen;