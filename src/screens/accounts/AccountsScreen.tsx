import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AccountService, Account } from '../../services/accountService';

interface Props {
  userId: number;
  onAdd: () => void;
  onBack: () => void;
  onEdit: (account:Account ) => void;
}

const AccountsScreen = ({ userId, onAdd, onBack, onEdit}: Props) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await AccountService.getAccounts(userId);
      setAccounts(data);
    } catch (error) {
      console.error("Error al cargar cuentas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [userId]);

  const handleLongPress = (account: Account) => {
    Alert.alert(
      'Opciones de Cuenta',
      `¿Qué deseas hacer con "${account.name}"?`,
      [
        {
          text:'Editar nombre',
          onPress: () => onEdit(account)
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => confirmDelete(account)
        },
        { text: 'Cancelar', style:'cancel'}
      ]
    );
  };

  const confirmDelete = (account: Account) => {
    Alert.alert(
      '¡Atención!',
      `Si eliminas "${account.name}", se borrarán permanentemente todas las transacciones asociadas. Esta acción no se puede deshacer.`,
      [
        {text:'Cancelar', style:'cancel'},
        {
          text:'Eliminar todo',
          style: 'destructive',
          onPress: async () => {
            const res = await AccountService.deleteAccount(account.id);
            if(res.success){
              loadAccounts();
            } else {
              Alert.alert('Error', res.error)
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.back}>‹</Text></TouchableOpacity>
        <Text style={styles.title}>Cuentas</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={{ padding: 20 }}>
        {accounts.map(acc => (
          <TouchableOpacity 
            key={acc.id} 
            style={styles.card}
            onLongPress={() => handleLongPress(acc)} 
            activeOpacity={0.7}
            >
            <View>
              <Text>{acc.name}</Text>
              <Text style={styles.currencyTag}>{acc.currency ?? 'USD'}</Text>
            </View>
            <Text style={{ fontWeight: 'bold' }}>
              {acc.currency === 'VES' ? 'Bs. ' : '$ '}
              {acc.current_balance.toFixed(2)}
            </Text>
          </TouchableOpacity>
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