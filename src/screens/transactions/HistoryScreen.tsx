import React, {useState, useEffect, useCallback} from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  SectionList,
  TextInput,
  Alert,
  ActivityIndicator,
  TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TransactionService, TransactionWithDetails } from '../../services/transactionService';

interface Props {
  onBack: () => void;
  onEdit: (transaction: TransactionWithDetails) => void;
}

interface TransactionSection {
  title: string;
  total: number;
  data: TransactionWithDetails[];
}

// PROVICIONAL
const USER_ID = 1;

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];


const HistoryScreen = ({ onBack, onEdit }: Props) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'Ingreso' | 'Gasto'>('Gasto');
  const [sections, setSections] = useState<TransactionSection[]>([]);
  const [loading, setLoading] = useState(true);


  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await TransactionService.getFilteredTransactions(USER_ID, {
        search: search,
        type: typeFilter
      });

      const grouped = groupTransactionsByDate(data);
      setSections(grouped);
    } catch (error) {
      console.error("Error cargando historial:", error);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const groupTransactionsByDate = (txs: TransactionWithDetails[]): TransactionSection[] => {
    const groups: { [key: string]: { total: number, data: TransactionWithDetails[] } } = {};
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    txs.forEach(tx => {
      const d = new Date(tx.date);
      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
      
      let label = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
      if (d.toDateString() === today) label = 'Hoy';
      if (d.toDateString() === yesterdayStr) label = 'Ayer';

      if (!groups[label]) groups[label] = { total: 0, data: [] };
      groups[label].data.push(tx);
      groups[label].total += tx.amount;
    });
    return Object.keys(groups).map(key => ({
      title: key,
      total: groups[key].total,
      data: groups[key].data
    }));
  };

  const handleDelete = (id: number) => {
    Alert.alert("Eliminar", "¿Estás seguro de borrar este movimiento? El saldo de la cuenta se ajustará automáticamente.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
          const res = await TransactionService.deleteTransaction(id);
          if (res.success) loadTransactions();
          else Alert.alert("Error", res.error);
      }}
    ]);
  };

  const renderItem = ({ item }: { item: TransactionWithDetails }) => (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: item.category_color }]}>
        <Text style={styles.iconText}>{item.category_icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.description || item.category_name}</Text>
        <Text style={styles.itemSub}>{item.category_name} • {item.account_name}</Text>
      </View>
      <View style={styles.amountContainer}>
        <Text style={[styles.itemAmount, { color: typeFilter === 'Ingreso' ? '#2ECC71' : '#1A1A1A' }]}>
          {typeFilter === 'Ingreso' ? '+' : '-'}${item.amount.toLocaleString('es', { minimumFractionDigits: 2 })}
        </Text>
        <TouchableOpacity 
          style={styles.moreBtn}
          onPress={() => {
            Alert.alert("Opciones", "¿Qué deseas hacer con este movimiento?", [
              { text: "Editar", onPress: () => onEdit(item) },
              { text: "Eliminar", style: 'destructive', onPress: () => handleDelete(item.id) },
              { text: "Cancelar", style: 'cancel' }
            ]);
        }}>
          <Text style={styles.moreIcon}>⋮</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backCircle}>
          <Text style={styles.backBtn}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transacciones</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Text style={styles.searchEmoji}>🔍</Text>
          <TextInput 
            style={styles.searchInput}
            placeholder="Buscar por descripción..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* FILTROS TIPO  */}
      <View style={styles.typeToggle}>
        <TouchableOpacity 
          style={[styles.toggleBtn, typeFilter === 'Ingreso' && styles.toggleActiveIngreso]}
          onPress={() => setTypeFilter('Ingreso')}
        >
          <Text style={[styles.toggleText, typeFilter === 'Ingreso' && styles.textWhite]}>Ingresos</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleBtn, typeFilter === 'Gasto' && styles.toggleActiveGasto]}
          onPress={() => setTypeFilter('Gasto')}
        >
          <Text style={[styles.toggleText, typeFilter === 'Gasto' && styles.textWhite]}>Gastos</Text>
        </TouchableOpacity>
      </View>

      {/* CHIPS DE FILTRO */}
      <View style={styles.chipsRow}>
        <TouchableOpacity style={[styles.chip, {backgroundColor: '#E8EAF6'}]}><Text style={styles.chipText}>💳 Cuenta</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.chip, {backgroundColor: '#FFF9C4'}]}><Text style={styles.chipText}>🏷️ Categoría</Text></TouchableOpacity>
      </View>

      {/* LISTA */}
      {loading ? (
        <ActivityIndicator size="large" color="#6200EE" style={{ marginTop: 50 }} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section: { title, total } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
              <Text style={styles.sectionTotal}>Total: ${total.toLocaleString('es', { minimumFractionDigits: 2 })}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No se encontraron movimientos.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FE' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, height: 60 },
  backCircle: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backBtn: { fontSize: 35, color: '#1A1A1A', fontWeight: '300' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  
  searchContainer: { paddingHorizontal: 20, marginBottom: 15 },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 15, height: 45, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  searchEmoji: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14 },

  typeToggle: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#FFF', borderRadius: 12, marginBottom: 15, padding: 4, elevation: 1 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  toggleActiveGasto: { backgroundColor: '#6200EE' },
  toggleActiveIngreso: { backgroundColor: '#6200EE' },
  textWhite: { color: '#FFF', fontWeight: 'bold' },
  toggleText: { color: '#666', fontWeight: '500' },

  chipsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  chipText: { fontSize: 12, fontWeight: '600', color: '#333' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 25, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  sectionTotal: { fontSize: 14, color: '#666', fontWeight: '600' },

  card: { flexDirection: 'row', backgroundColor: '#FFF', padding: 12, borderRadius: 16, alignItems: 'center', marginBottom: 10, elevation: 1 },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  iconText: { fontSize: 22 },
  info: { flex: 1, marginLeft: 15 },
  itemTitle: { fontWeight: 'bold', fontSize: 15, color: '#1A1A1A' },
  itemSub: { color: '#808080', fontSize: 12, marginTop: 2 },
  amountContainer: { flexDirection: 'row', alignItems: 'center' },
  itemAmount: { fontWeight: 'bold', fontSize: 15 },
  moreBtn: { padding: 10, marginLeft: 5 },
  moreIcon: { fontSize: 20, color: '#999' },

  emptyContainer: { marginTop: 80, alignItems: 'center' },
  emptyText: { color: '#808080', fontSize: 15 }
});

export default HistoryScreen;