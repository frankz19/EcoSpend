import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AccountService } from '../../services/accountService';

interface Props {
  userId: number;
  onBack: () => void;
}

const AddAccountScreen = ({ userId, onBack }: Props) => {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');

  const save = async () => {
    if (!name || !balance) return;
    await AccountService.createAccount(userId, name, 'Efectivo', parseFloat(balance));
    onBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.back}>‹</Text></TouchableOpacity>
        <Text style={styles.title}>Nueva Cuenta</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={{ padding: 20, gap: 15 }}>
        <TextInput style={styles.input} placeholder="Nombre" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Saldo" value={balance} onChangeText={setBalance} keyboardType="numeric" />
        <TouchableOpacity style={styles.btn} onPress={save}><Text style={{ color: '#FFF' }}>Guardar</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 },
  back: { fontSize: 40 },
  title: { fontSize: 18, fontWeight: 'bold' },
  input: { borderBottomWidth: 1, padding: 10 },
  btn: { backgroundColor: '#6200EE', padding: 15, borderRadius: 10, alignItems: 'center' }
});

export default AddAccountScreen;