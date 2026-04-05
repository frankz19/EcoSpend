import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
// Cambio a la librería moderna para evitar el "deprecated"
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  onAddTransaction: () => void;
  onViewHistory: () => void;
}

const DashboardScreen = ({ onAddTransaction, onViewHistory }: Props) => {
  // SIMULACIÓN DE DATOS (Mocks)
  const userStats = {
    totalBalance: "$2,450.00",
    income: "$3,000.00",
    expenses: "$550.00"
  };

  const recentTransactions = [
    { id: '1', title: 'Mercado', amount: '-$50.00', category: 'Comida', color: '#FF5733' },
    { id: '2', title: 'Sueldo', amount: '+$1,500.00', category: 'Trabajo', color: '#2ECC71' },
    { id: '3', title: 'Netflix', amount: '-$12.00', category: 'Entretenimiento', color: '#3498DB' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* 1. Header de Bienvenida */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hola, Frank 👋</Text>
          <Text style={styles.date}>Domingo, 5 de Abril</Text>
        </View>

        {/* 2. Tarjeta de Saldo Principal */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Total</Text>
          <Text style={styles.balanceAmount}>{userStats.totalBalance}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Ingresos</Text>
              <Text style={styles.incomeValue}>↑ {userStats.income}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Gastos</Text>
              <Text style={styles.expenseValue}>↓ {userStats.expenses}</Text>
            </View>
          </View>
        </View>

        {/* 3. Sección de Movimientos Recientes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Movimientos recientes</Text>
          <TouchableOpacity onPress={onViewHistory}>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.map((item) => (
          <View key={item.id} style={styles.transactionItem}>
            <View style={[styles.categoryIcon, { backgroundColor: item.color }]} />
            <View style={styles.transDetails}>
              <Text style={styles.transTitle}>{item.title}</Text>
              <Text style={styles.transCategory}>{item.category}</Text>
            </View>
            <Text style={[
              styles.transAmount, 
              { color: item.amount.startsWith('+') ? '#2ECC71' : '#1A1A1A' }
            ]}>
              {item.amount}
            </Text>
          </View>
        ))}

        {/* Espacio extra para que el FAB no tape el último item */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* 4. Botón Flotante "+" (Añadir Operación) */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={onAddTransaction}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FE' 
  },
  scrollContent: { 
    padding: 20 
  },
  header: {
    marginBottom: 25,
    marginTop: 10
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A'
  },
  date: {
    fontSize: 14,
    color: '#808080',
    marginTop: 4
  },
  balanceCard: {
    backgroundColor: '#6200EE',
    borderRadius: 24,
    padding: 25,
    alignItems: 'center',
    marginBottom: 35,
    elevation: 8,
    shadowColor: '#6200EE',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  balanceLabel: { 
    color: 'rgba(255,255,255,0.7)', 
    fontSize: 16 
  },
  balanceAmount: { 
    color: '#FFF', 
    fontSize: 38, 
    fontWeight: 'bold', 
    marginVertical: 12 
  },
  statsRow: { 
    flexDirection: 'row', 
    marginTop: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 15
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 10
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginBottom: 4
  },
  incomeValue: { 
    color: '#FFF', 
    fontWeight: 'bold',
    fontSize: 16
  },
  expenseValue: { 
    color: '#FFF', 
    fontWeight: 'bold',
    fontSize: 16
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 15 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold',
    color: '#1A1A1A'
  },
  seeAll: { 
    color: '#6200EE',
    fontWeight: '600'
  },
  transactionItem: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  categoryIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 14 
  },
  transDetails: { 
    flex: 1, 
    marginLeft: 15 
  },
  transTitle: { 
    fontSize: 16, 
    fontWeight: '600',
    color: '#1A1A1A'
  },
  transCategory: { 
    fontSize: 12, 
    color: '#808080',
    marginTop: 2
  },
  transAmount: { 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  fabText: { 
    color: '#FFF', 
    fontSize: 35, 
    fontWeight: '300' 
  }
});

export default DashboardScreen;