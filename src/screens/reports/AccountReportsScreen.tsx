import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TransactionService, TransactionWithDetails } from '../../services/transactionService';

interface Props {
  userId: number;
  onBack: () => void;
}

interface AccountGroup {
  name: string;
  total: number;
}

const AccountReportsScreen = ({ userId, onBack }: Props) => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [selectedType, setSelectedType] = useState<'Gasto' | 'Ingreso'>('Gasto');
  
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0);
  });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const txs = await TransactionService.getFilteredTransactions(userId, {});
      setTransactions(txs);
      setLoading(false);
    };
    loadData();
  }, [userId]);

  const reportData = useMemo(() => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filtered = transactions.filter(tx => {
      const d = new Date(tx.date);
      return (
        tx.category_type === selectedType &&
        d.getTime() >= start.getTime() &&
        d.getTime() <= end.getTime()
      );
    });

    const accountMap: { [key: string]: AccountGroup } = {};
    let total = 0;

    filtered.forEach(tx => {
      const amountInUSD = tx.amount / tx.exchange_rate;
      const key = tx.account_id.toString();
      
      if (!accountMap[key]) {
        accountMap[key] = { name: tx.account_name, total: 0 };
      }
      accountMap[key].total += amountInUSD;
      total += amountInUSD;
    });

    return { list: Object.values(accountMap).sort((a, b) => b.total - a.total), total };
  }, [transactions, selectedType, startDate, endDate]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.back}>‹</Text></TouchableOpacity>
        <Text style={styles.title}>Reportes por Cuenta</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.datePickerContainer}>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowStartPicker(true)}>
          <Text style={styles.dateLabel}>Desde</Text>
          <Text style={styles.dateText}>{startDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowEndPicker(true)}>
          <Text style={styles.dateLabel}>Hasta</Text>
          <Text style={styles.dateText}>{endDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
      </View>

      {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(e, date) => {
              setShowStartPicker(Platform.OS === 'ios');
              if (date) setStartDate(date);
            }}
          />
      )}

      {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={(e, date) => {
              setShowEndPicker(Platform.OS === 'ios');
              if (date) setEndDate(date);
            }}
          />
      )}

      <View style={styles.typeSelector}>
        <TouchableOpacity style={[styles.typeBtn, selectedType === 'Gasto' && styles.activeGasto]} onPress={() => setSelectedType('Gasto')}>
          <Text style={selectedType === 'Gasto' ? styles.whiteText : styles.grayText}>Gastos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.typeBtn, selectedType === 'Ingreso' && styles.activeIngreso]} onPress={() => setSelectedType('Ingreso')}>
          <Text style={selectedType === 'Ingreso' ? styles.whiteText : styles.grayText}>Ingresos</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6200EE" style={{ flex: 1 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total {selectedType === 'Gasto' ? 'Gastado' : 'Recibido'} (USD)</Text>
            <Text style={[styles.summaryValue, { color: selectedType === 'Gasto' ? '#FF5252' : '#2ECC71' }]}>
              $ {reportData.total.toFixed(2)}
            </Text>
          </View>

          {reportData.list.length > 0 ? reportData.list.map(item => {
            const pct = reportData.total > 0 ? (item.total / reportData.total) * 100 : 0;
            return (
              <View key={item.name} style={styles.reportRow}>
                <View style={styles.rowInfo}>
                  <Text style={styles.accText}>{item.name}</Text>
                  <Text style={styles.amountText}>$ {item.total.toFixed(2)} ({pct.toFixed(1)}%)</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: '#6200EE' }]} />
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
  datePickerContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 10, gap: 15 },
  dateBtn: { flex: 1, backgroundColor: '#F0F0F0', padding: 10, borderRadius: 10, alignItems: 'center' },
  dateLabel: { fontSize: 10, color: '#666' },
  dateText: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  typeSelector: { flexDirection: 'row', margin: 20, backgroundColor: '#E0E0E0', borderRadius: 15, padding: 5 },
  typeBtn: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 10 },
  activeGasto: { backgroundColor: '#FF5252' },
  activeIngreso: { backgroundColor: '#2ECC71' },
  whiteText: { color: '#FFF', fontWeight: 'bold' },
  grayText: { color: '#666' },
  scrollContent: { padding: 20 },
  summaryCard: { backgroundColor: '#FFF', padding: 30, borderRadius: 25, alignItems: 'center', marginBottom: 25, elevation: 2 },
  summaryLabel: { fontSize: 14, color: '#999' },
  summaryValue: { fontSize: 32, fontWeight: 'bold', marginTop: 10 },
  reportRow: { marginBottom: 20 },
  rowInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  accText: { fontSize: 15, fontWeight: '600', color: '#333' },
  amountText: { fontSize: 13, color: '#666' },
  progressBarBg: { height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999', fontStyle: 'italic' },
});

export default AccountReportsScreen;