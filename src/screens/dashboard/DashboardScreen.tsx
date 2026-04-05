import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';

// 1. Definimos qué funciones recibe el Dashboard desde App.tsx
interface Props {
  onAddTransaction: () => void;
  onViewHistory: () => void;
}

// 2. Pasamos las Props al componente
const DashboardScreen = ({ onAddTransaction, onViewHistory }: Props) => {
  // ... (tus datos mock siguen igual) ...

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header con Saldo */}
        <View style={styles.balanceCard}>
          {/* ... contenido del saldo ... */}
        </View>

        {/* Sección de Movimientos Recientes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Movimientos recientes</Text>
          {/* 3. CONECTAMOS EL BOTÓN "Ver todos" */}
          <TouchableOpacity onPress={onViewHistory}>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {/* ... mapeo de transacciones ... */}
      </ScrollView>

      {/* 4. CONECTAMOS EL BOTÓN FLOTANTE "+" */}
      <TouchableOpacity style={styles.fab} onPress={onAddTransaction}>
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