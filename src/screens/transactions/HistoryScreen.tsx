import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, TextInput, Modal, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TransactionService, TransactionWithDetails } from '../../services/transactionService';
import { AccountService, Account } from '../../services/accountService';
import { CategoryService, Category } from '../../services/categoryService';
import { CurrencyService } from '../../services/currencyService';

interface Props {
  userId: number;
  onBack: () => void;
  onEdit: (tx: TransactionWithDetails) => void;
}

const HistoryScreen = ({ userId, onBack, onEdit }: Props) => {
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<'Todos' | 'Gasto' | 'Ingreso'>('Todos');
  const [filterAcc, setFilterAcc] = useState<number | null>(null);
  const [filterCat, setFilterCat] = useState<number | null>(null);
  
  const [activeDropdown, setActiveDropdown] = useState<'type' | 'acc' | 'cat' | null>(null);
  
  const [page, setPage] = useState(0);
  const itemsPerPage = 20;

  const loadData = async () => {
    setLoading(true);
    try {
      const [txs, accs, cats] = await Promise.all([
        TransactionService.getFilteredTransactions(userId, {}),
        AccountService.getAccounts(userId),
        CategoryService.getCategories(userId)
      ]);
      setTransactions(txs);
      setAccounts(accs);
      setCategories(cats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleLongPress = (transaction : TransactionWithDetails) => {
    Alert.alert(
      'Opciones de movimiento',
      `¿Que deseas hacer con el registro de "${transaction.category_name}"?`,
      [
        {
          text: 'Editar',
          onPress: () => onEdit(transaction)
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => confirmDelete(transaction)
        },
        {text: 'Cancelar', style: 'cancel'}
      ]
    );
  };

  const confirmDelete = (transaction: TransactionWithDetails) => {
    Alert.alert(
      'Eliminar Transaccion',
      '¿Estas seguro? El saldo de la cuenta se ajustara automaticamente.',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Si, eliminar',
          style: 'destructive',
          onPress: async() => {
            const res = await TransactionService.deleteTransaction(transaction.id);
            if(res.success) {
              loadData();
            } else {
              Alert.alert('Error', res.error);
            }
          }
        }
      ]
    );
  };

  const filteredData = useMemo(() => {
    return transactions.filter(tx => {
      const matchSearch = tx.description?.toLowerCase().includes(searchText.toLowerCase()) || 
                          tx.category_name.toLowerCase().includes(searchText.toLowerCase());
      const matchType = filterType === 'Todos' || tx.category_type === filterType;
      const matchAcc = filterAcc === null || tx.account_id === filterAcc;
      const matchCat = filterCat === null || tx.category_id === filterCat;
      
      return matchSearch && matchType && matchAcc && matchCat;
    });
  }, [transactions, searchText, filterType, filterAcc, filterCat]);

  const paginatedData = filteredData.slice(page * itemsPerPage, (page + 1) * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const typeOptions = [
    { label: 'Todos', value: 'Todos' },
    { label: 'Gasto', value: 'Gasto' },
    { label: 'Ingreso', value: 'Ingreso' }
  ];
  
  const accOptions = [
    { label: 'Todas', value: null },
    ...accounts.map(a => ({ label: a.name, value: a.id }))
  ];
  
  const catOptions = [
    { label: 'Todas', value: null },
    ...categories.map(c => ({ label: c.name, value: c.id }))
  ];

  const handleSelect = (val: any) => {
    if (activeDropdown === 'type') setFilterType(val);
    if (activeDropdown === 'acc') setFilterAcc(val);
    if (activeDropdown === 'cat') setFilterCat(val);
    setActiveDropdown(null);
    setPage(0);
  };

  const getLabel = (type: 'type' | 'acc' | 'cat') => {
    if (type === 'type') return filterType;
    if (type === 'acc') return filterAcc === null ? 'Todas' : accounts.find(a => a.id === filterAcc)?.name || 'Todas';
    if (type === 'cat') return filterCat === null ? 'Todas' : categories.find(c => c.id === filterCat)?.name || 'Todas';
    return '';
  };

  const renderDropdownModal = () => {
    if (!activeDropdown) return null;
    
    let options: {label: string, value: any}[] = [];
    let title = '';
    
    if (activeDropdown === 'type') { options = typeOptions; title = 'Seleccionar Tipo'; }
    if (activeDropdown === 'acc') { options = accOptions; title = 'Seleccionar Cuenta'; }
    if (activeDropdown === 'cat') { options = catOptions; title = 'Seleccionar Categoria'; }

    return (
      <Modal visible={true} transparent animationType="fade">
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

  const renderItem = ({ item }: { item: TransactionWithDetails }) => {
    const isIngreso = item.category_type === 'Ingreso';
    const amountInUSD = item.amount / item.exchange_rate;
    const isNonUSD = item.account_currency !== 'USD';
    const currencySymbol = CurrencyService.symbol(item.account_currency);

    return (
      <TouchableOpacity style={styles.card} onLongPress={() => handleLongPress(item)} >
        <View style={[styles.indicator, { backgroundColor: item.category_color }]} />
        <View style={styles.info}>
          <Text style={styles.catName}>{item.category_name}</Text>
          <Text style={styles.date}>{item.date.split('T')[0]}</Text>
          {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
          {isNonUSD && (
              <Text style={styles.txRateInfo}>{currencySymbol} {item.amount.toFixed(2)} (Tasa: {item.exchange_rate})</Text>
          )}
        </View>
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color: isIngreso ? '#2ECC71' : '#FF5252' }]}>
            {isIngreso ? '+' : '-'}${amountInUSD.toFixed(2)}
          </Text>
          <Text style={styles.accName}>{item.account_name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Historial</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchBarContainer}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Buscar descripcion o categoria..."
          value={searchText}
          onChangeText={(txt) => { setSearchText(txt); setPage(0); }}
        />
      </View>

      <View style={styles.filtersWrapper}>
        <TouchableOpacity style={styles.dropdownBtn} onPress={() => setActiveDropdown('type')}>
          <Text style={styles.dropdownLabel}>Tipo</Text>
          <Text style={styles.dropdownValue}>{getLabel('type')} ▼</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dropdownBtn} onPress={() => setActiveDropdown('acc')}>
          <Text style={styles.dropdownLabel}>Cuenta</Text>
          <Text style={styles.dropdownValue}>{getLabel('acc')} ▼</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dropdownBtn} onPress={() => setActiveDropdown('cat')}>
          <Text style={styles.dropdownLabel}>Categoria</Text>
          <Text style={styles.dropdownValue}>{getLabel('cat')} ▼</Text>
        </TouchableOpacity>
      </View>

      {renderDropdownModal()}

      {loading ? (
        <ActivityIndicator size="large" color="#6200EE" style={{ flex: 1 }} />
      ) : (
        <>
          <FlatList
            data={paginatedData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.empty}>No se encontraron movimientos</Text>}
          />
          
          {totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity disabled={page === 0} onPress={() => setPage(page - 1)} style={[styles.pageBtn, page === 0 && styles.disabledBtn]}>
                <Text style={styles.pageText}>Anterior</Text>
              </TouchableOpacity>
              <Text style={styles.pageNumber}>{page + 1} de {totalPages}</Text>
              <TouchableOpacity disabled={page >= totalPages - 1} onPress={() => setPage(page + 1)} style={[styles.pageBtn, page >= totalPages - 1 && styles.disabledBtn]}>
                <Text style={styles.pageText}>Siguiente</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FE' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#FFF' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backIcon: { fontSize: 40, color: '#000' },
  title: { fontSize: 18, fontWeight: 'bold' },
  searchBarContainer: { padding: 10, backgroundColor: '#FFF' },
  searchInput: { backgroundColor: '#F0F0F0', padding: 12, borderRadius: 10, fontSize: 14 },
  filtersWrapper: { flexDirection: 'row', padding: 10, backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#EEE', justifyContent: 'space-between' },
  dropdownBtn: { flex: 1, backgroundColor: '#F0F0F0', padding: 8, borderRadius: 8, marginHorizontal: 3, alignItems: 'center' },
  dropdownLabel: { fontSize: 10, color: '#666', marginBottom: 2 },
  dropdownValue: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '50%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalOption: { paddingVertical: 15, borderBottomWidth: 1, borderColor: '#EEE', alignItems: 'center' },
  modalOptionText: { fontSize: 16, color: '#333' },
  list: { padding: 15 },
  card: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 10, alignItems: 'center', elevation: 1 },
  indicator: { width: 4, height: '80%', borderRadius: 2, marginRight: 12 },
  info: { flex: 1 },
  catName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  date: { fontSize: 12, color: '#999' },
  desc: { fontSize: 12, color: '#666', fontStyle: 'italic' },
  txRateInfo: { fontSize: 10, color: '#999', marginTop: 2 },
  amountContainer: { alignItems: 'flex-end' },
  amount: { fontSize: 16, fontWeight: 'bold' },
  accName: { fontSize: 11, color: '#999' },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE' },
  pageBtn: { paddingVertical: 8, paddingHorizontal: 15, backgroundColor: '#6200EE', borderRadius: 10 },
  disabledBtn: { backgroundColor: '#CCC' },
  pageText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  pageNumber: { fontSize: 14, color: '#666', fontWeight: '600' }
});

export default HistoryScreen;