import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity 
} from 'react-native';
// Importación moderna para evitar el aviso de "deprecated"
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  onBack: () => void;
}

const HistoryScreen = ({ onBack }: Props) => {
  // DATOS MOCK: Historial de transacciones
  const transactions = [
    { id: '1', date: 'Hoy', title: 'Mercado Mensual', amount: -150.00, category: 'Comida', icon: '?', color: '#FFEBEE' },
    { id: '2', date: 'Hoy', title: 'Pago Freelance', amount: 450.00, category: 'Trabajo', icon: '?', color: '#E8F5E9' },
    { id: '3', date: 'Ayer', title: 'Gasolina', amount: -30.00, category: 'Transporte', icon: '?', color: '#E3F2FD' },
    { id: '4', date: 'Ayer', title: 'Suscripción Netflix', amount: -12.99, category: 'Entretenimiento', icon: '?', color: '#F3E5F5' },
    { id: '5', date: '02 Abr', title: 'Cena Cumpleaños', amount: -85.50, category: 'Salidas', icon: '?', color: '#FFF3E0' },
    { id: '6', date: '01 Abr', title: 'Venta de Ropa', amount: 60.00, category: 'Otros', icon: '?', color: '#F5F5F5' },
    { id: '7', date: '01 Abr', title: 'Alquiler Apdo', amount: -600.00, category: 'Vivienda', icon: '?', color: '#EFEBE9' },
  ];

  const renderItem = ({ item }: { item: typeof transactions[0] }) => (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Text style={styles.iconText}>{item.icon}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.titleText}>{item.title}</Text>
        <Text style={styles.subtitleText}>{item.category} • {item.date}</Text>
      </View>
      <Text style={[
        styles.amountText, 
        { color: item.amount > 0 ? '#2ECC71' : '#1A1A1A' }
      ]}>
        {item.amount > 0 ? `+$${item.amount.toFixed(2)}` : `-$${Math.abs(item.amount).toFixed(2)}`}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header Personalizado */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Lista Principal */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.sectionLabel}>Tus últimos movimientos</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No hay registros todavía.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 35,
    color: '#000',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#808080',
    marginBottom: 20,
    fontWeight: '500',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 12,
    marginBottom: 10,
    // Estilo más minimalista sin bordes pesados
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 22,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  subtitleText: {
    fontSize: 13,
    color: '#808080',
    marginTop: 2,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    color: '#808080',
    fontSize: 16,
  }
});

export default HistoryScreen;