import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Account, AccountService, Currency } from '../../services/accountService';

interface Props {
  userId: number;
  onBack: () => void;
  account?: Account;
}

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: 'USD', label: 'USD — Dólares' },
  { value: 'VES', label: 'VES — Bolívares' },
];

const AddAccountScreen = ({ userId, onBack, account }: Props) => {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');

  useEffect(() => {
    if (account) {
      setName(account.name);
      setBalance(account.current_balance.toString());
      setCurrency(account.currency);
    }
  }, [account]);

  const save = async () => {
    if (!name || (!account && !balance)) return;
  
    let success = false;
    let errorMsg = 'Ocurrió un error';
  
    if (account) {
      const res = await AccountService.updateAccount(account.id, name) as any;
      success = res.success;
      errorMsg = res.error;
    } else {
      try {
        const res = await AccountService.createAccount(
          userId, 
          name, 
          'Efectivo', 
          parseFloat(balance), 
          currency
        );
        success = !!res; 
      } catch (e) {
        success = false;
        errorMsg = 'No se pudo crear la cuenta';
      }
    }
  
    if (success) {
      onBack();
    } else {
      Alert.alert('Error', errorMsg);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.back}>‹</Text></TouchableOpacity>
        <Text style={styles.title}>
          {account ? 'Editar Cuenta' : 'Nueva Cuenta'}
        </Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={{ padding: 20, gap: 15 }}>
        <TextInput style={styles.input} placeholder="Nombre" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Saldo inicial" value={balance} onChangeText={setBalance} keyboardType="numeric" editable={!account}/>

        <Text style={styles.label}>Moneda</Text>
        <View style={styles.currencyRow}>
          {CURRENCIES.map(c => (
            <TouchableOpacity
              key={c.value}
              disabled = {!!account}
              style={[styles.currencyBtn, currency === c.value && styles.currencyBtnActive, account && { opacity: 0.6 }]}
              onPress={() => setCurrency(c.value)}
            >
              <Text style={[styles.currencyText, currency === c.value && styles.currencyTextActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.btn} onPress={save}>
          <Text style={{ color: '#FFF' }}>Guardar</Text>
        </TouchableOpacity>
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
  label: { fontSize: 14, color: '#666' },
  currencyRow: { flexDirection: 'row', gap: 10 },
  currencyBtn: {
    flex: 1, padding: 12, borderRadius: 8, borderWidth: 1,
    borderColor: '#CCC', alignItems: 'center',
  },
  currencyBtnActive: { borderColor: '#6200EE', backgroundColor: '#EDE7F6' },
  currencyText: { color: '#333' },
  currencyTextActive: { color: '#6200EE', fontWeight: 'bold' },
  btn: { backgroundColor: '#6200EE', padding: 15, borderRadius: 10, alignItems: 'center' },
});

export default AddAccountScreen;
