import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';

const DashboardScreen = () => {
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header con Saldo */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Total</Text>
          <Text style={styles.balanceAmount}>{userStats.totalBalance}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.incomeText}>↑ {userStats.income}</Text>
            <Text style={styles.expenseText}>↓ {userStats.expenses}</Text>
          </View>
        </View>

        {/* Sección de Movimientos Recientes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Movimientos recientes</Text>
          <TouchableOpacity><Text style={styles.seeAll}>Ver todos</Text></TouchableOpacity>
        </View>

        {recentTransactions.map((item) => (
          <View key={item.id} style={styles.transactionItem}>
            <View style={[styles.categoryIcon, { backgroundColor: item.color }]} />
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.transTitle}>{item.title}</Text>
              <Text style={styles.transCategory}>{item.category}</Text>
            </View>
            <Text style={[styles.transAmount, { color: item.amount.startsWith('+') ? '#2ECC71' : '#000' }]}>
              {item.amount}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Botón Flotante "+" (Añadir Operación) */}
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FE' },
  scrollContent: { padding: 20 },
  balanceCard: {
    backgroundColor: '#6200EE',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 30,
  },
  balanceLabel: { color: '#E0E0E0', fontSize: 16 },
  balanceAmount: { color: '#FFF', fontSize: 36, fontWeight: 'bold', marginVertical: 10 },
  statsRow: { flexDirection: 'row', gap: 20 },
  incomeText: { color: '#FFF', fontWeight: '500' },
  expenseText: { color: '#FFF', fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  seeAll: { color: '#6200EE' },
  transactionItem: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  categoryIcon: { width: 40, height: 40, borderRadius: 10 },
  transTitle: { fontSize: 16, fontWeight: '600' },
  transCategory: { fontSize: 12, color: '#808080' },
  transAmount: { fontSize: 16, fontWeight: '700' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#6200EE',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  fabText: { color: '#FFF', fontSize: 30, fontWeight: 'bold' }
});

export default DashboardScreen;