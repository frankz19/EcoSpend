import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AccountService, Account } from '../../services/accountService';

interface Props {
  userId: number;
  onAdd: () => void;
  onBack: () => void;
}

const AccountsScreen = ({ userId, onAdd, onBack }: Props) => {
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    AccountService.getAccounts(userId).then(setAccounts);
  }, [userId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.back}>‹</Text></TouchableOpacity>
        <Text style={styles.title}>Cuentas</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={{ padding: 20 }}>
        {accounts.map(acc => (
          <View key={acc.id} style={styles.card}>
            <View>
              <Text>{acc.name}</Text>
              <Text style={styles.currencyTag}>{acc.currency ?? 'USD'}</Text>
            </View>
            <Text style={{ fontWeight: 'bold' }}>
              {acc.currency === 'VES' ? 'Bs. ' : '$ '}
              {acc.current_balance.toFixed(2)}
            </Text>
          </View>
        ))}
        <TouchableOpacity style={styles.add} onPress={onAdd}><Text>+ Nueva Cuenta</Text></TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 },
  back: { fontSize: 40 },
  title: { fontSize: 18, fontWeight: 'bold' },
  card: { padding: 20, backgroundColor: '#F5F5F5', borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  currencyTag: { fontSize: 11, color: '#6200EE', marginTop: 2 },
  add: { padding: 20,  borderWidth: 1, borderRadius: 10, alignItems: 'center', borderStyle: 'dashed' }
});

export default AccountsScreen;