import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TransactionService, TransactionWithDetails } from '../../services/transactionService';

interface Props {
  userId: number;
  onBack: () => void;
  onEdit: (tx: TransactionWithDetails) => void;
}

const HistoryScreen = ({ userId, onBack, onEdit }: Props) => {
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const res = await TransactionService.getFilteredTransactions(userId, {});
        setTransactions(res);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [userId]);

  const paginatedData = transactions.slice(page * itemsPerPage, (page + 1) * itemsPerPage);
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const renderItem = ({ item }: { item: TransactionWithDetails }) => {
    const isIngreso = item.category_type === 'Ingreso';
    
    return (
      <TouchableOpacity style={styles.card} onPress={() => onEdit(item)}>
        <View style={[styles.indicator, { backgroundColor: item.category_color }]} />
        <View style={styles.info}>
          <Text style={styles.catName}>{item.category_name}</Text>
          <Text style={styles.date}>{item.date.split('T')[0]}</Text>
          {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
        </View>
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color: isIngreso ? '#2ECC71' : '#FF5252' }]}>
            {isIngreso ? '+' : '-'}${item.amount.toFixed(2)}
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
        <Text style={styles.title}>Historial Completo</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6200EE" style={{ flex: 1 }} />
      ) : (
        <>
          <FlatList
            data={paginatedData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.empty}>No hay transacciones registradas</Text>}
          />
          
          {totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity 
                disabled={page === 0} 
                onPress={() => setPage(page - 1)}
                style={[styles.pageBtn, page === 0 && styles.disabledBtn]}
              >
                <Text style={styles.pageText}>Anterior</Text>
              </TouchableOpacity>
              
              <Text style={styles.pageNumber}>{page + 1} de {totalPages}</Text>
              
              <TouchableOpacity 
                disabled={page >= totalPages - 1} 
                onPress={() => setPage(page + 1)}
                style={[styles.pageBtn, page >= totalPages - 1 && styles.disabledBtn]}
              >
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
  list: { padding: 15 },
  card: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 10, alignItems: 'center', elevation: 1 },
  indicator: { width: 4, height: '80%', borderRadius: 2, marginRight: 12 },
  info: { flex: 1 },
  catName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  date: { fontSize: 12, color: '#999', marginTop: 2 },
  desc: { fontSize: 12, color: '#666', fontStyle: 'italic', marginTop: 2 },
  amountContainer: { alignItems: 'flex-end' },
  amount: { fontSize: 16, fontWeight: 'bold' },
  accName: { fontSize: 11, color: '#999', marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#EEE' },
  pageBtn: { paddingVertical: 8, paddingHorizontal: 15, backgroundColor: '#6200EE', borderRadius: 10 },
  disabledBtn: { backgroundColor: '#CCC' },
  pageText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  pageNumber: { fontSize: 14, color: '#666', fontWeight: '600' }
});

export default HistoryScreen;