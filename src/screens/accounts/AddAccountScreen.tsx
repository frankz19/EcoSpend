import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Account, AccountService, Currency } from '../../services/accountService';

interface Props {
  userId: number;
  onBack: () => void;
  account?: Account;
}

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: 'USD', label: 'USD - Dolar' },
  { value: 'VES', label: 'VES - Bolivar' },
  { value: 'COP', label: 'COP - Peso' },
  { value: 'EUR', label: 'EUR - Euro' },
];

const AddAccountScreen = ({ userId, onBack, account }: Props) => {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [exchangeRate, setExchangeRate] = useState('');

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
  
    if (account) {
      const res = await AccountService.updateAccount(account.id, name) as any;
      success = res.success;
    } else {
      let finalRate = 1.0;
      
      if (currency !== 'USD' && parseFloat(balance) > 0) {
          finalRate = parseFloat(exchangeRate);
          if (isNaN(finalRate) || finalRate <= 0) {
              Alert.alert('Error', 'Introduce una tasa de cambio valida para el saldo inicial');
              return;
          }
      }

      try {
        const res = await AccountService.createAccount(
            userId, name, 'Efectivo', parseFloat(balance), currency, finalRate
        );
        success = !!res; 
      } catch (e) {
        success = false;
      }
    }
  
    if (success) onBack();
    else Alert.alert('Error', 'No se pudo procesar la cuenta');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.back}>‹</Text></TouchableOpacity>
        <Text style={styles.title}>{account ? 'Editar Cuenta' : 'Nueva Cuenta'}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 15 }}>
        <TextInput style={styles.input} placeholder="Nombre de cuenta" value={name} onChangeText={setName} />
        
        {!account && (
            <>
              <TextInput style={styles.input} placeholder="Saldo inicial" value={balance} onChangeText={setBalance} keyboardType="numeric" />
              
              {currency !== 'USD' && parseFloat(balance || '0') > 0 && (
                  <View style={styles.rateContainer}>
                      <Text style={styles.label}>Tasa de cambio de apertura</Text>
                      <TextInput 
                          style={styles.inputRate} 
                          placeholder={`Ej: Valor de 1 USD en ${currency}`} 
                          value={exchangeRate} 
                          onChangeText={setExchangeRate} 
                          keyboardType="numeric" 
                      />
                  </View>
              )}
            </>
        )}

        <Text style={styles.label}>Selecciona la moneda</Text>
        <View style={styles.grid}>
          {CURRENCIES.map(c => (
            <TouchableOpacity
              key={c.value}
              disabled={!!account}
              style={[styles.currencyBtn, currency === c.value && styles.currencyBtnActive, account && { opacity: 0.5 }]}
              onPress={() => setCurrency(c.value)}
            >
              <Text style={[styles.currencyText, currency === c.value && styles.currencyTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.btn} onPress={save}>
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Guardar Cuenta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 },
  back: { fontSize: 40 },
  title: { fontSize: 18, fontWeight: 'bold' },
  input: { borderBottomWidth: 1, borderColor: '#EEE', padding: 10, fontSize: 16, marginBottom: 10 },
  rateContainer: { backgroundColor: '#F8F9FE', padding: 15, borderRadius: 10, marginBottom: 10 },
  inputRate: { borderBottomWidth: 1, borderColor: '#CCC', paddingVertical: 5, fontSize: 16, marginTop: 5 },
  label: { fontSize: 14, color: '#666', marginTop: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  currencyBtn: { width: '48%', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#EEE', alignItems: 'center' },
  currencyBtnActive: { borderColor: '#6200EE', backgroundColor: '#F8F5FF' },
  currencyText: { color: '#666' },
  currencyTextActive: { color: '#6200EE', fontWeight: 'bold' },
  btn: { backgroundColor: '#6200EE', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 20 }
});

export default AddAccountScreen;