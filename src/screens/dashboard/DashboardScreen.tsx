import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TransactionService, TransactionWithDetails, DashboardSummary } from '../../services/transactionService';

const USER_ID = 1;
const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Hoy';
  if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
};

const formatCurrency = (value: number): string => {
  return `$${value.toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

interface Props {
  onAddTransaction: () => void;
  onViewHistory: () => void;
  onViewAccounts: () => void; 
  onViewCategories: () => void;
}

const DashboardScreen = ({ onAddTransaction, onViewHistory, onViewAccounts, onViewCategories }: Props) => {
  const [summary, setSummary] = useState<DashboardSummary>({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<TransactionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [sum, txs] = await Promise.all([
        TransactionService.getDashboardSummary(USER_ID),
        TransactionService.getTransactions(USER_ID, 5),
      ]);
      setSummary(sum);
      setRecentTransactions(txs);
      setLoading(false);
    };
    load();
  }, []);

  const today = new Date();
  const dayNames = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const dateLabel = `${dayNames[today.getDay()]}, ${today.getDate()} de ${MONTHS[today.getMonth()]}`;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hola 👋</Text>
          <Text style={styles.date}>{dateLabel}</Text>
        </View>

        {/* Tarjeta de saldo */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Total</Text>
          {loading ? (
            <ActivityIndicator color="#FFF" style={{ marginVertical: 16 }} />
          ) : (
            <Text style={styles.balanceAmount}>{formatCurrency(summary.totalBalance)}</Text>
          )}

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Ingresos</Text>
              <Text style={styles.incomeValue}>↑ {formatCurrency(summary.monthlyIncome)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Gastos</Text>
              <Text style={styles.expenseValue}>↓ {formatCurrency(summary.monthlyExpenses)}</Text>
            </View>
          </View>
        </View>

        {/* NUEVA SECCIÓN: Accesos Rápidos (Cuentas y Categorías) */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.quickActionButton} onPress={onViewAccounts}>
            <View style={[styles.quickIconCircle, { backgroundColor: '#E8EAF6' }]}>
              <Text style={styles.quickIconText}>💳</Text>
            </View>
            <Text style={styles.quickActionLabel}>Cuentas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton} onPress={onViewCategories}>
            <View style={[styles.quickIconCircle, { backgroundColor: '#F3E5F5' }]}>
              <Text style={styles.quickIconText}>🏷️</Text>
            </View>
            <Text style={styles.quickActionLabel}>Categorías</Text>
          </TouchableOpacity>
        </View>

        {/* Movimientos recientes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Movimientos recientes</Text>
          <TouchableOpacity onPress={onViewHistory}>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#6200EE" style={{ marginTop: 20 }} />
        ) : recentTransactions.length === 0 ? (
          <View style={styles.emptyTransactions}>
            <Text style={styles.emptyText}>Aún no hay movimientos registrados.</Text>
          </View>
        ) : (
          recentTransactions.map(item => {
            const isIncome = item.category_type === 'Ingreso';
            return (
              <View key={item.id} style={styles.transactionItem}>
                <View style={[styles.categoryIcon, { backgroundColor: item.category_color }]}>
                  <Text style={styles.categoryIconText}>{item.category_icon}</Text>
                </View>
                <View style={styles.transDetails}>
                  <Text style={styles.transTitle} numberOfLines={1}>
                    {item.description || item.category_name}
                  </Text>
                  <Text style={styles.transCategory}>
                    {item.category_name} · {formatDate(item.date)}
                  </Text>
                </View>
                <Text style={[styles.transAmount, { color: isIncome ? '#2ECC71' : '#1A1A1A' }]}>
                  {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
                </Text>
              </View>
            );
          })
        )}

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={onAddTransaction} activeOpacity={0.8}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FE' },
  scrollContent: { padding: 20 },
  header: { marginBottom: 25, marginTop: 10 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
  date: { fontSize: 14, color: '#808080', marginTop: 4 },

  // Balance card
  balanceCard: {
    backgroundColor: '#6200EE',
    borderRadius: 24,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20, // Reducido para acercar los nuevos botones
    elevation: 8,
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 16 },
  balanceAmount: { color: '#FFF', fontSize: 38, fontWeight: 'bold', marginVertical: 12 },
  statsRow: {
    flexDirection: 'row',
    marginTop: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 15,
    width: '100%',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 10 },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 4 },
  incomeValue: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  expenseValue: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },

  // NUEVOS ESTILOS: Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    width: '48%',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
  },
  quickIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  quickIconText: { fontSize: 18 },
  quickActionLabel: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },

  // Sección transacciones
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  seeAll: { color: '#6200EE', fontWeight: '600' },
  emptyTransactions: { alignItems: 'center', paddingVertical: 30 },
  emptyText: { color: '#808080', fontSize: 15 },

  transactionItem: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconText: { fontSize: 22 },
  transDetails: { flex: 1, marginLeft: 15 },
  transTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  transCategory: { fontSize: 12, color: '#808080', marginTop: 2 },
  transAmount: { fontSize: 16, fontWeight: 'bold' },

  fab: {
    position: 'absolute',
    right: 25,
    bottom: 30,
    backgroundColor: '#6200EE',
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  fabText: { color: '#FFF', fontSize: 35, fontWeight: '300' },
});

export default DashboardScreen;