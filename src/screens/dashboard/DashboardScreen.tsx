import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TransactionService, TransactionWithDetails } from '../../services/transactionService';
import { AccountService } from '../../services/accountService';
import { CurrencyService } from '../../services/currencyService';

interface Props {
  userId: number;
  onAddTransaction: () => void;
  onViewHistory: () => void;
  onViewAccounts: () => void;
  onViewCategories: () => void;
  onViewReports: () => void;
  onViewReminders: () => void;
  onLogout: () => void;
}

const DashboardScreen = ({ userId, onAddTransaction, onViewHistory, onViewAccounts, onViewCategories, onViewReports, onViewReminders, onLogout }: Props) => {
  const [totalBalanceUSD, setTotalBalanceUSD] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<TransactionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const [exchangeRate, setExchangeRate] = useState(CurrencyService.getCurrentRate().rate);
  const [rateModalVisible, setRateModalVisible] = useState(false);
  const [rateInput, setRateInput] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [accs, txs] = await Promise.all([
        AccountService.getAccounts(userId),
        TransactionService.getFilteredTransactions(userId, {}),
      ]);
      const totalUSD = CurrencyService.normalizeAmounts(
        accs.map(a => ({ amount: a.current_balance, currency: a.currency ?? 'USD' })), 'USD'
      );
      setTotalBalanceUSD(totalUSD);
      setRecentTransactions(txs.slice(0, 5));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [userId]);

  useEffect(() => {
    AccountService.getAccounts(userId).then(accs => {
      const totalUSD = CurrencyService.normalizeAmounts(
        accs.map(a => ({ amount: a.current_balance, currency: a.currency ?? 'USD' })), 'USD'
      );
      setTotalBalanceUSD(totalUSD);
    });
  }, [exchangeRate]);

  const saveRate = () => {
    const parsed = parseFloat(rateInput.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) return;
    CurrencyService.setManualRate(parsed);
    setExchangeRate(parsed);
    setRateModalVisible(false);
    setRateInput('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.header}>
          <Text style={styles.welcome}>Bienvenido</Text>
          <TouchableOpacity onPress={onLogout}><Text style={styles.logout}>Salir</Text></TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={{ color: '#EEE' }}>Saldo Total (USD)</Text>
          <Text style={styles.balance}>${totalBalanceUSD.toLocaleString('es', { minimumFractionDigits: 2 })}</Text>
          <TouchableOpacity onPress={() => { setRateInput(String(exchangeRate)); setRateModalVisible(true); }}>
            <Text style={styles.rateHint}>Tasa: {exchangeRate} Bs/$ ✎</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={onViewAccounts}>
            <View style={styles.dot} /><Text style={styles.actionLabel}>Cuentas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onViewCategories}>
            <View style={styles.dot} /><Text style={styles.actionLabel}>Categorías</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onViewReports}>
            <View style={styles.dot} /><Text style={styles.actionLabel}>Reportes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onViewReminders}>
            <View style={styles.dotAlarma} /><Text style={styles.actionLabel}>Alarmas</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Últimos Movimientos</Text>
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
            const symbol = tx.account_currency === 'VES' ? 'Bs.' : '$';
            return (
              <View key={tx.id} style={styles.tx}>
                <View style={[styles.txIconContainer, { backgroundColor: tx.category_color + '20' }]}>
                  <MaterialCommunityIcons name={tx.category_icon as any} size={24} color={tx.category_color} />
                </View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={styles.txCat}>{tx.category_name}</Text>
                  <Text style={styles.txDesc}>{tx.description || 'Sin nota'}</Text>
                </View>
                <Text style={[styles.txAmount, { color: isIngreso ? '#2ECC71' : '#FF5252' }]}>
                  {isIngreso ? '+' : '-'}{symbol}{tx.amount.toFixed(2)}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={onAddTransaction}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={rateModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Tasa de cambio</Text>
            <Text style={styles.modalSubtitle}>Bolívares por 1 dólar (Bs/$)</Text>
            <TextInput style={styles.modalInput} keyboardType="numeric" value={rateInput} onChangeText={setRateInput} placeholder="Ej: 36.50" autoFocus />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setRateModalVisible(false)} style={styles.cancelBtn}><Text style={{ color: '#666' }}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity onPress={saveRate} style={styles.saveBtn}><Text style={{ color: '#FFF', fontWeight: 'bold' }}>Guardar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  rateHint: { color: '#D1B3FF', fontSize: 12, marginTop: 8 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 25, gap: 5 },
  actionBtn: { width: '23%', backgroundColor: '#FFF', paddingVertical: 15, paddingHorizontal: 5, borderRadius: 15, alignItems: 'center', elevation: 2 },
  dot: { width: 8, height: 8, backgroundColor: '#6200EE', borderRadius: 4, marginBottom: 5 },
  dotAlarma: { width: 8, height: 8, backgroundColor: '#FF9800', borderRadius: 4, marginBottom: 5 },
  actionLabel: { fontSize: 10, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  seeAll: { color: '#6200EE', fontWeight: 'bold' },
  tx: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 10 },
  txIconContainer: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
  txCat: { fontWeight: 'bold', fontSize: 15 },
  txDesc: { fontSize: 12, color: '#999' },
  txAmount: { fontWeight: 'bold', fontSize: 16 },
  empty: { textAlign: 'center', color: '#999', marginTop: 20 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#6200EE', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { color: '#FFF', fontSize: 35 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#FFF', borderRadius: 20, padding: 25, width: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#666', marginBottom: 16 },
  modalInput: { borderWidth: 1, borderColor: '#CCC', borderRadius: 10, padding: 12, fontSize: 18, marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancelBtn: { padding: 10 },
  saveBtn: { backgroundColor: '#6200EE', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
});

export default DashboardScreen;