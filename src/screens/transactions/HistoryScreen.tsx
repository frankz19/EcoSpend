import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity 
} from 'react-native';

interface Props {
  onBack: () => void;
}

const HistoryScreen = ({ onBack }: Props) => {
  // DATOS FALSOS (Mocks) para probar la visual
  const transactions = [
    { id: '1', date: 'Hoy', title: 'Mercado Mensual', amount: -150.00, category: 'Comida', icon: '🛒' },
    { id: '2', date: 'Hoy', title: 'Pago Freelance', amount: 450.00, category: 'Trabajo', icon: '💰' },
    { id: '3', date: 'Ayer', title: 'Gasolina', amount: -30.00, category: 'Transporte', icon: '🚗' },
    { id: '4', date: 'Ayer', title: 'Suscripción Netflix', amount: -12.99, category: 'Entretenimiento', icon: '🎬' },
    { id: '5', date: '02 Abr', title: 'Cena Cumpleaños', amount: -85.50, category: 'Salidas', icon: '🍕' },
    { id: '6', date: '01 Abr', title: 'Venta de Ropa', amount: 60.00, category: 'Otros', icon: '👕' },
    { id: '7', date: '01 Abr', title: 'Alquiler Apdo', amount: -600.00, category: 'Vivienda', icon: '🏠' },
  ];

  const renderItem = ({ item }: { item: typeof transactions[0] }) => (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>{item.icon}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.category}>{item.category} • {item.date}</Text>
      </View>
      <Text style={[
        styles.amount, 
        { color: item.amount > 0 ? '#4CAF50' : '#F44336' }
      ]}>
        {item.amount > 0 ? `+${item.amount.toFixed(2)}` : item.amount.toFixed(2)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Lista de Transacciones */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>No hay movimientos registrados</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE', // Gris azulado muy claro de fondo
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 10,
    backgroundColor: '#FFF',
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    // Sombra suave
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  category: {
    fontSize: 13,
    color: '#808080',
    marginTop: 2,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  empty: {
    marginTop: 100,
    alignItems: 'center',
  }
});

export default HistoryScreen;