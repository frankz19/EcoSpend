import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TransactionService, TransactionWithDetails } from '../../services/transactionService';
import { AccountService, Account } from '../../services/accountService';
import { CurrencyService } from '../../services/currencyService';
import { Currency } from '../../services/accountService';

interface Props {
  userId: number;
  onBack: () => void;
}

interface CategoryGroup {
  name: string;
  icon: string;
  color: string;
  total: number;
}

const ReportsScreen = ({ userId, onBack }: Props) => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedType, setSelectedType] = useState<'Gasto' | 'Ingreso'>('Gasto');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [filterAcc, setFilterAcc] = useState<number | null>(null);
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const [activeDropdown, setActiveDropdown] = useState<'acc' | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [txs, accs] = await Promise.all([
        TransactionService.getFilteredTransactions(userId, {}),
        AccountService.getAccounts(userId),
      ]);
      setTransactions(txs);
      setAccounts(accs);
      setLoading(false);
    };
    loadData();
  }, [userId]);

  const selectedAccountCurrency: Currency | null = useMemo(() => {
    if (filterAcc === null) return null;
    return accounts.find(a => a.id === filterAcc)?.currency ?? 'USD';
  }, [filterAcc, accounts]);

  const displayCurrency: Currency = selectedAccountCurrency ?? 'USD';

  const reportData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const filtered = transactions.filter(tx => {
      const d = new Date(tx.date);
      return (
        tx.category_type === selectedType &&
        d.getMonth() === selectedMonth &&
        d.getFullYear() === currentYear &&
        (filterAcc === null || tx.account_id === filterAcc)
      );
    });

    const categoryMap: { [key: string]: CategoryGroup } = {};
    let total = 0;

    filtered.forEach(tx => {
      const amountInDisplay = filterAcc === null
          ? CurrencyService.convert(tx.amount, tx.account_currency as Currency, 'USD', tx.exchange_rate)
          : tx.amount;

      const key = tx.category_id;
      if (!categoryMap[key]) {
        categoryMap[key] = { name: tx.category_name, icon: tx.category_icon, color: tx.category_color, total: 0 };
      }
      categoryMap[key].total += amountInDisplay;
      total += amountInDisplay;
    });

    return { list: Object.values(categoryMap).sort((a, b) => b.total - a.total), total };
  }, [transactions, filterAcc, selectedType, selectedMonth]);

  const handleSelect = (val: any) => {
    if (activeDropdown === 'acc') setFilterAcc(val);
    setActiveDropdown(null);
  };

  const renderDropdownModal = () => {
    if (!activeDropdown) return null;
    const options = [
      { label: 'Todas las cuentas', value: null },
      ...accounts.map(a => ({ label: `${a.name} (${a.currency ?? 'USD'})`, value: a.id })),
    ];

    return (
      <Modal visible transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setActiveDropdown(null)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Cuenta</Text>
            <FlatList data={options} keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalOption} onPress={() => handleSelect(item.value)}>
                  <Text style={styles.modalOptionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const symbol = CurrencyService.symbol(displayCurrency);
  const selectedAccLabel = filterAcc === null ? 'Todas' : accounts.find(a => a.id === filterAcc)?.name ?? '';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.back}>‹</Text></TouchableOpacity>
        <Text style={styles.title}>Reportes</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {months.map((m, i) => (
            <TouchableOpacity key={m} onPress={() => setSelectedMonth(i)} style={[styles.monthChip, selectedMonth === i && styles.activeMonth]}>
              <Text style={selectedMonth === i ? styles.whiteText : styles.grayText}>{m}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.typeSelector}>
        <TouchableOpacity style={[styles.typeBtn, selectedType === 'Gasto' && styles.activeGasto]} onPress={() => setSelectedType('Gasto')}>
          <Text style={selectedType === 'Gasto' ? styles.whiteText : styles.grayText}>Gastos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.typeBtn, selectedType === 'Ingreso' && styles.activeIngreso]} onPress={() => setSelectedType('Ingreso')}>
          <Text style={selectedType === 'Ingreso' ? styles.whiteText : styles.grayText}>Ingresos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtersWrapper}>
        <TouchableOpacity style={styles.dropdownBtn} onPress={() => setActiveDropdown('acc')}>
          <Text style={styles.dropdownLabel}>Cuenta</Text>
          <Text style={styles.dropdownValue}>{selectedAccLabel} ▼</Text>
        </TouchableOpacity>
      </View>
      {renderDropdownModal()}

      {loading ? (
        <ActivityIndicator size="large" color="#6200EE" style={{ flex: 1 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total {selectedType === 'Gasto' ? 'Gastado' : 'Recibido'} {filterAcc === null ? '  (USD)' : ''}</Text>
            <Text style={[styles.summaryValue, { color: selectedType === 'Gasto' ? '#FF5252' : '#2ECC71' }]}>
              {symbol} {reportData.total.toFixed(2)}
            </Text>
            {filterAcc === null && (
              <Text style={styles.rateNote}>Valores historicos calculados en USD</Text>
            )}
          </View>

          {reportData.list.length > 0 ? reportData.list.map(item => {
            const pct = reportData.total > 0 ? (item.total / reportData.total) * 100 : 0;
            return (
              <View key={item.name} style={styles.reportRow}>
                <View style={styles.rowInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} style={{ marginRight: 8 }} />
                    <Text style={styles.catText}>{item.name}</Text>
                  </View>
                  <Text style={styles.amountText}>{symbol} {item.total.toFixed(2)} ({pct.toFixed(1)}%)</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: item.color }]} />
                </View>
              </View>
            );
          }) : (
            <Text style={styles.emptyText}>No hay movimientos en este periodo.</Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 },
  back: { fontSize: 40 },
  title: { fontSize: 18, fontWeight: 'bold' },
  filterContainer: { paddingVertical: 10, backgroundColor: '#FFF' },
  monthChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginHorizontal: 5 },
  activeMonth: { backgroundColor: '#6200EE' },
  whiteText: { color: '#FFF', fontWeight: 'bold' },
  grayText: { color: '#666' },
  typeSelector: { flexDirection: 'row', margin: 20, backgroundColor: '#E0E0E0', borderRadius: 15, padding: 5 },
  typeBtn: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 10 },
  activeGasto: { backgroundColor: '#FF5252' },
  activeIngreso: { backgroundColor: '#2ECC71' },
  filtersWrapper: { flexDirection: 'row', padding: 10, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#EEE' },
  dropdownBtn: { flex: 1, backgroundColor: '#F0F0F0', padding: 8, borderRadius: 8, marginHorizontal: 3, alignItems: 'center' },
  dropdownLabel: { fontSize: 10, color: '#666', marginBottom: 2 },
  dropdownValue: { fontSize: 11, fontWeight: 'bold', color: '#333' },
  scrollContent: { padding: 20 },
  summaryCard: { backgroundColor: '#FFF', padding: 30, borderRadius: 25, alignItems: 'center', marginBottom: 25, elevation: 2 },
  summaryLabel: { fontSize: 14, color: '#999' },
  summaryValue: { fontSize: 32, fontWeight: 'bold', marginTop: 10 },
  rateNote: { fontSize: 11, color: '#AAA', marginTop: 6 },
  reportRow: { marginBottom: 20 },
  rowInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  catText: { fontSize: 15, fontWeight: '600', color: '#333' },
  amountText: { fontSize: 13, color: '#666' },
  progressBarBg: { height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, maxHeight: '60%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalOption: { paddingVertical: 18, borderBottomWidth: 1, borderColor: '#F0F0F0', alignItems: 'center' },
  modalOptionText: { fontSize: 16, color: '#333' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999', fontStyle: 'italic' },
});

export default ReportsScreen;