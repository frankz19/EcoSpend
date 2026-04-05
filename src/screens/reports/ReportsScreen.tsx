import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';

interface Props {
  onBack: () => void;
}

const ReportsScreen = ({ onBack }: Props) => {
  // DATOS MOCK: Estadísticas del mes
  const reportData = [
    { id: '1', category: 'Comida', amount: 450, percentage: 45, color: '#FF5733' },
    { id: '2', category: 'Vivienda', amount: 300, percentage: 30, color: '#3498DB' },
    { id: '3', category: 'Transporte', amount: 150, percentage: 15, color: '#F1C40F' },
    { id: '4', category: 'Otros', amount: 100, percentage: 10, color: '#9B59B6' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Análisis de Gastos</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.monthTitle}>Abril 2026</Text>
        <Text style={styles.totalSpent}>Total Gastado: $1,000.00</Text>

        {/* Gráfico de Barras Simulado (Horizontal) */}
        <View style={styles.chartContainer}>
          <Text style={styles.sectionLabel}>Distribución</Text>
          <View style={styles.barChart}>
            {reportData.map((item) => (
              <View 
                key={item.id} 
                style={[styles.barSegment, { flex: item.percentage, backgroundColor: item.color }]} 
              />
            ))}
          </View>
        </View>

        {/* Leyenda Detallada */}
        <View style={styles.legendContainer}>
          {reportData.map((item) => (
            <View key={item.id} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <Text style={styles.legendCategory}>{item.category}</Text>
              <Text style={styles.legendAmount}>${item.amount.toFixed(2)}</Text>
              <Text style={styles.legendPercent}>{item.percentage}%</Text>
            </View>
          ))}
        </View>

        {/* Card de Consejo "Eco" (Un toque para el nombre EcoSpend) */}
        <View style={styles.ecoCard}>
          <Text style={styles.ecoEmoji}>🌱</Text>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.ecoTitle}>Eco-Consejo</Text>
            <Text style={styles.ecoText}>Has reducido tus gastos en transporte un 5% este mes. ¡Sigue usando la bici!</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 60, paddingHorizontal: 10 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 35, color: '#000' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 25 },
  monthTitle: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  totalSpent: { fontSize: 16, color: '#F44336', fontWeight: '600', marginBottom: 30 },
  sectionLabel: { fontSize: 14, color: '#808080', marginBottom: 10 },
  chartContainer: { marginBottom: 40 },
  barChart: {
    height: 40,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  barSegment: { height: '100%' },
  legendContainer: { marginBottom: 30 },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  legendCategory: { flex: 1, fontSize: 16, color: '#333' },
  legendAmount: { fontSize: 16, fontWeight: '600', marginRight: 15 },
  legendPercent: { fontSize: 14, color: '#808080', width: 40, textAlign: 'right' },
  ecoCard: {
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  ecoEmoji: { fontSize: 30 },
  ecoTitle: { fontWeight: 'bold', color: '#2E7D32', fontSize: 16 },
  ecoText: { color: '#444', fontSize: 14, marginTop: 2 },
});

export default ReportsScreen;