import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TransactionService, TransactionWithDetails } from '../../services/transactionService';
import { AccountService } from '../../services/accountService';

interface Props {
  userId: number;
  onAddTransaction: () => void;
  onViewHistory: () => void;
  onViewAccounts: () => void;
  onViewCategories: () => void;
  onViewReports: () => void;
  onLogout: () => void;
}

const DashboardScreen = ({ userId, onAddTransaction, onViewHistory, onViewAccounts, onViewCategories, onViewReports, onLogout }: Props) => {
  const [totalBalance, setTotalBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<TransactionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const accs = await AccountService.getAccounts(userId);
        const bal = accs.reduce((s, a) => s + a.current_balance, 0);
        const txs = await TransactionService.getFilteredTransactions(userId, {});
        setTotalBalance(bal);
        setRecentTransactions(txs.slice(0, 5));
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.header}>
          <Text style={styles.welcome}>Bienvenido</Text>
          <TouchableOpacity onPress={onLogout}><Text style={styles.logout}>Salir</Text></TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={{ color: '#EEE' }}>Saldo Total</Text>
          <Text style={styles.balance}>${totalBalance.toLocaleString('es', { minimumFractionDigits: 2 })}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={onViewAccounts}>
            <View style={styles.dot} /><Text style={styles.actionLabel}>Cuentas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onViewCategories}>
            <View style={styles.dot} /><Text style={styles.actionLabel}>Categorias</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onViewReports}>
            <View style={styles.dot} /><Text style={styles.actionLabel}>Reportes</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ultimos Movimientos</Text>
          <TouchableOpacity onPress={onViewHistory}>
            <Text style={styles.seeAll}>Ver todo</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#6200EE" />
        ) : recentTransactions.length === 0 ? (
          <Text style={styles.empty}>Sin movimientos</Text>
        ) : (
          recentTransactions.map(tx => {
            const isIngreso = tx.category_type === 'Ingreso';
            return (
              <View key={tx.id} style={styles.tx}>
                <View style={[styles.txCircle, { backgroundColor: tx.category_color + '20' }]} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.txCat}>{tx.category_name}</Text>
                  <Text style={styles.txDesc}>{tx.description || 'Sin nota'}</Text>
                </View>
                <Text style={[styles.txAmount, { color: isIngreso ? '#2ECC71' : '#FF5252' }]}>
                  {isIngreso ? '+' : '-'}${tx.amount.toFixed(2)}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
      <TouchableOpacity style={styles.fab} onPress={onAddTransaction}><Text style={styles.fabText}>+</Text></TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FE' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  welcome: { fontSize: 24, fontWeight: 'bold' },
  logout: { color: '#FF5252', fontWeight: 'bold' },
  card: { backgroundColor: '#6200EE', padding: 25, borderRadius: 25, marginBottom: 20 },
  balance: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  actionBtn: { width: '31%', backgroundColor: '#FFF', padding: 15, borderRadius: 20, alignItems: 'center', elevation: 2 },
  dot: { width: 8, height: 8, backgroundColor: '#6200EE', borderRadius: 4, marginBottom: 5 },
  actionLabel: { fontSize: 11, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  seeAll: { color: '#6200EE', fontWeight: 'bold' },
  tx: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 10 },
  txCircle: { width: 12, height: 12, borderRadius: 6 },
  txCat: { fontWeight: 'bold', fontSize: 15 },
  txDesc: { fontSize: 12, color: '#999' },
  txAmount: { fontWeight: 'bold', fontSize: 16 },
  empty: { textAlign: 'center', color: '#999', marginTop: 20 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#6200EE', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { color: '#FFF', fontSize: 35 },
});

export default DashboardScreen;