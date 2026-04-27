import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TransactionService, TransactionWithDetails } from '../../services/transactionService';
import { AccountService, Account } from '../../services/accountService';
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
  const [usedCurrencies, setUsedCurrencies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [rateModalVisible, setRateModalVisible] = useState(false);
  const [selectedCurrencyToEdit, setSelectedCurrencyToEdit] = useState('');
  const [rateInput, setRateInput] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [accs, txs] = await Promise.all([
        AccountService.getAccounts(userId),
        TransactionService.getFilteredTransactions(userId, {}),
      ]);
      
      const totalUSD = CurrencyService.normalizeAmounts(
        accs.map(a => ({ amount: a.current_balance, currency: a.currency })), 'USD'
      );
      
      const currencies = [...new Set(accs.map(a => a.currency))].filter(c => c !== 'USD');
      
      setTotalBalanceUSD(totalUSD);
      setUsedCurrencies(currencies);
      setRecentTransactions(txs.slice(0, 5));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [userId]);

  const openRateModal = (currency: string) => {
    setSelectedCurrencyToEdit(currency);
    setRateInput(String(CurrencyService.getRate(currency)));
    setRateModalVisible(true);
  };

  const saveRate = () => {
    const parsed = parseFloat(rateInput.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) return;
    CurrencyService.setRate(selectedCurrencyToEdit, parsed);
    setRateModalVisible(false);
    loadData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.header}>
          <Text style={styles.welcome}>EcoSpend</Text>
          <TouchableOpacity onPress={onLogout}><Text style={styles.logout}>Salir</Text></TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={{ color: '#EEE', fontSize: 14 }}>Patrimonio Total (USD)</Text>
          <Text style={styles.balance}>${totalBalanceUSD.toLocaleString('es', { minimumFractionDigits: 2 })}</Text>
          
          <View style={styles.ratesRow}>
            {usedCurrencies.map(curr => (
                <TouchableOpacity key={curr} onPress={() => openRateModal(curr)} style={styles.rateTag}>
                    <Text style={styles.rateText}>{curr}: {CurrencyService.getRate(curr)} ✎</Text>
                </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={onViewAccounts}>
            <MaterialCommunityIcons name="wallet-outline" size={20} color="#6200EE" />
            <Text style={styles.actionLabel}>Cuentas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onViewCategories}>
            <MaterialCommunityIcons name="tag-outline" size={20} color="#6200EE" />
            <Text style={styles.actionLabel}>Categorias</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onViewReports}>
            <MaterialCommunityIcons name="chart-bar" size={20} color="#6200EE" />
            <Text style={styles.actionLabel}>Reportes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onViewReminders}>
            <MaterialCommunityIcons name="bell-outline" size={20} color="#FF9800" />
            <Text style={styles.actionLabel}>Alarmas</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Movimientos Recientes</Text>
          <TouchableOpacity onPress={onViewHistory}><Text style={styles.seeAll}>Ver todo</Text></TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#6200EE" />
        ) : (
          recentTransactions.map(tx => (
            <View key={tx.id} style={styles.tx}>
                <View style={[styles.txIcon, { backgroundColor: tx.category_color + '20' }]}>
                    <MaterialCommunityIcons name={tx.category_icon as any} size={20} color={tx.category_color} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.txCat}>{tx.category_name}</Text>
                    {tx.account_currency !== 'USD' && (
                        <Text style={styles.txSub}>
                            {CurrencyService.symbol(tx.account_currency)} {tx.amount.toFixed(2)} (Tasa: {tx.exchange_rate})
                        </Text>
                    )}
                </View>
                <Text style={[styles.txAmount, { color: tx.category_type === 'Ingreso' ? '#2ECC71' : '#FF5252' }]}>
                    {tx.category_type === 'Ingreso' ? '+' : '-'}${ (tx.amount / tx.exchange_rate).toFixed(2) }
                </Text>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={onAddTransaction}><Text style={styles.fabText}>+</Text></TouchableOpacity>

      <Modal visible={rateModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Actualizar Tasa {selectedCurrencyToEdit}</Text>
            <TextInput style={styles.modalInput} keyboardType="numeric" value={rateInput} onChangeText={setRateInput} autoFocus />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setRateModalVisible(false)} style={styles.cancelBtn}><Text>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity onPress={saveRate} style={styles.saveBtn}><Text style={{ color: '#FFF' }}>Guardar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FE' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  welcome: { fontSize: 22, fontWeight: 'bold' },
  logout: { color: '#FF5252', fontWeight: 'bold' },
  card: { backgroundColor: '#6200EE', padding: 25, borderRadius: 25, marginBottom: 20 },
  balance: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginVertical: 10 },
  ratesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 5 },
  rateTag: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  rateText: { color: '#FFF', fontSize: 11 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  actionBtn: { width: '23%', backgroundColor: '#FFF', padding: 12, borderRadius: 15, alignItems: 'center', elevation: 1 },
  actionLabel: { fontSize: 10, marginTop: 5, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' },
  seeAll: { color: '#6200EE', fontSize: 12, fontWeight: 'bold' },
  tx: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 15, marginBottom: 8 },
  txIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  txCat: { fontWeight: 'bold', fontSize: 14 },
  txSub: { fontSize: 10, color: '#999' },
  txAmount: { fontWeight: 'bold', fontSize: 15 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#6200EE', justifyContent: 'center', alignItems: 'center', elevation: 4 },
  fabText: { color: '#FFF', fontSize: 30 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, width: '80%' },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  modalInput: { borderBottomWidth: 1, borderColor: '#EEE', padding: 10, fontSize: 20, marginBottom: 20, textAlign: 'center' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15 },
  cancelBtn: { padding: 10 },
  saveBtn: { backgroundColor: '#6200EE', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 }
});

export default DashboardScreen;