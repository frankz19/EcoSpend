import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, ScrollView, FlatList} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TransactionService, TransactionWithDetails } from '../../services/transactionService';
import { AccountService, Account } from '../../services/accountService';

/*
PANTALLA DE REPORTES
Pendiente: Falta integrar la lógica de conversión de tasas cuando el filtro de cuenta sea ¨null¨ (todas)
*/

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
  
  const[loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  

  const[selectedType, setSelectedType] = useState<'Gasto' | 'Ingreso'>('Gasto');
  const[selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const[filterAcc, setFilterAcc] = useState<number | null>(null); // null = Todas

  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const [activeDropdown, setActiveDropdown] =  useState<'acc' | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const[txs, accs] = await Promise.all([
        TransactionService.getFilteredTransactions(userId, {}),
        AccountService.getAccounts(userId)
      ]);
      setTransactions(txs);
      setAccounts(accs);
      setLoading(false);
    };
    loadData();
  }, [userId]);

  const reportData = useMemo(() => { 
    const currentYear = new Date().getFullYear();
    // filtramos por tipo, mes y cuenta seleccionada 
    const filtered = transactions.filter(tx =>{
      const d = new Date(tx.date);
      const matchType = tx.category_type == selectedType;
      const matchMonth = d.getMonth() == selectedMonth && d.getFullYear() == currentYear;
      const matchAcc = filterAcc == null || tx.account_id == filterAcc;
      return matchType && matchAcc && matchMonth;
    });

    const categoryMap: { [key: string]: CategoryGroup } = {};
    let total = 0;

    // sumamos los montos por id de categoria 
    filtered.forEach(tx => {
      const key = tx.category_id;
      if(!categoryMap[key]){
        categoryMap[key] = {
          name: tx.category_name,
          icon: tx.category_icon,
          color: tx.category_color,
          total: 0
        };
      }
      categoryMap[key].total += tx.amount;
      total += tx.amount;
    });

    return {
      list: Object.values(categoryMap).sort((a, b) => b.total - a.total ),
      total
    };
    
  }, [transactions, filterAcc, selectedType, selectedMonth]);

  const handleSelect = (val: any) => {
    if(activeDropdown === 'acc') setFilterAcc(val);
    setActiveDropdown(null);
  }

  const renderDropdownModal = () => {
    if (!activeDropdown) return null;
    let options: {label: string, value: any}[] = [];
    let title = 'Seleccionar Cuenta';
    if(activeDropdown == 'acc') {
      options = [
        { label: 'Todas las cuentas', value: null }, // opción nula para "Todas"
        ...accounts.map(a => ({ label: a.name, value: a.id }))
      ];
    }

    return (
      <Modal visible={true} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setActiveDropdown(null)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{title}</Text>
            <FlatList
              data={options}
              keyExtractor={(item, index) => index.toString()}
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


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.back}>‹</Text></TouchableOpacity>
        <Text style={styles.title}>Reportes</Text>
        <View style={{ width: 40 }} />
      </View>

      {/*Selector del mes */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {months.map((m, i) => (
            <TouchableOpacity 
              key={m} 
              onPress={() => setSelectedMonth(i)}
              style={[styles.monthChip, selectedMonth === i && styles.activeMonth]}
            >
              <Text style={selectedMonth === i ? styles.whiteText : styles.grayText}>{m}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* Selector de Tipo (Gasto/Ingreso) */}
      <View style={styles.typeSelector}>
        <TouchableOpacity 
          style={[styles.typeBtn, selectedType === 'Gasto' && styles.activeGasto]} 
          onPress={() => setSelectedType('Gasto')}
        >
          <Text style={selectedType === 'Gasto' ? styles.whiteText : styles.grayText}>Gastos</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.typeBtn, selectedType === 'Ingreso' && styles.activeIngreso]} 
          onPress={() => setSelectedType('Ingreso')}
        >
          <Text style={selectedType === 'Ingreso' ? styles.whiteText : styles.grayText}>Ingresos</Text>
        </TouchableOpacity>
      </View>

        {/* Selector de cuentas */}   
      <View style={styles.filtersWrapper}>
        <TouchableOpacity style={styles.dropdownBtn} onPress={() => setActiveDropdown('acc')}>
            <Text style={styles.dropdownLabel}>Cuenta</Text>
            <Text style={styles.dropdownValue}>{filterAcc === null ? 'Cuentas' : accounts.find(a => a.id === filterAcc)?.name} ▼</Text>
          </TouchableOpacity>
      </View>
      {renderDropdownModal()}

      
      {loading ? (
        <ActivityIndicator size="large" color="#6200EE" style={{ flex: 1 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total {selectedType === 'Gasto' ? 'Gastado' : 'Recibido'}</Text>
            <Text style={[styles.summaryValue, { color: selectedType === 'Gasto' ? '#FF5252' : '#2ECC71' }]}>
               {reportData.total.toFixed(2)}
            </Text>
          </View>

          {reportData.list.length > 0 ? reportData.list.map((item) => {
            const percentage = (item.total / reportData.total) * 100;
            return (
              <View key={item.name} style={styles.reportRow}>
                <View style={styles.rowInfo}>
                  <Text style={styles.catText}>{item.icon} {item.name}</Text>
                  <Text style={styles.amountText}>{item.total.toFixed(2)} ({percentage.toFixed(1)}%)</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: item.color }]} />
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
  filtersWrapper: { flexDirection: 'row', padding: 10, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#EEE', justifyContent: 'space-between' },
  dropdownBtn: { flex: 1, backgroundColor: '#F0F0F0', padding: 8, borderRadius: 8, marginHorizontal: 3, alignItems: 'center' },
  dropdownLabel: { fontSize: 10, color: '#666', marginBottom: 2 },
  dropdownValue: { fontSize: 11, fontWeight: 'bold', color: '#333' },
  scrollContent: { padding: 20 },
  summaryCard: { backgroundColor: '#FFF', padding: 30, borderRadius: 25, alignItems: 'center', marginBottom: 25, elevation: 2 },
  summaryLabel: { fontSize: 14, color: '#999' },
  summaryValue: { fontSize: 32, fontWeight: 'bold', marginTop: 10 },
  reportRow: { marginBottom: 20 },
  rowInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  catText: { fontSize: 15, fontWeight: '600' },
  amountText: { fontSize: 13, color: '#666' },
  progressBarBg: { height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, maxHeight: '60%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalOption: { paddingVertical: 18, borderBottomWidth: 1, borderColor: '#F0F0F0', alignItems: 'center' },
  modalOptionText: { fontSize: 16, color: '#333' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999', fontStyle: 'italic' }
});


export default ReportsScreen;