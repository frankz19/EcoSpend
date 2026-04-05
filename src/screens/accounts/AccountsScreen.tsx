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
  onAdd: () => void;
  onBack: () => void;
}

const AccountsScreen = ({ onAdd, onBack }: Props) => {
  // DATOS FALSOS: Representan las carteras del usuario
  const accounts = [
    { id: '1', name: 'Efectivo', balance: 150.00, icon: '💵', color: '#4CAF50' },
    { id: '2', name: 'Banco Principal', balance: 2300.50, icon: '🏦', color: '#2196F3' },
    { id: '3', name: 'Ahorros Viaje', balance: 500.00, icon: '✈️', color: '#FF9800' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Cuentas</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>Gestiona tus fuentes de dinero</Text>

        {accounts.map((account) => (
          <View key={account.id} style={styles.accountCard}>
            <View style={[styles.iconBox, { backgroundColor: account.color }]}>
              <Text style={styles.iconText}>{account.icon}</Text>
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{account.name}</Text>
              <Text style={styles.accountBalance}>${account.balance.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editText}>Editar</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Botón para añadir nueva cuenta */}
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <Text style={styles.addButtonText}>+ Añadir nueva cuenta</Text>
        </TouchableOpacity>
      </ScrollView>
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
  content: {
    padding: 25,
  },
  subtitle: {
    fontSize: 16,
    color: '#808080',
    marginBottom: 30,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FE',
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  accountInfo: {
    flex: 1,
    marginLeft: 15,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  accountBalance: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 2,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editText: {
    color: '#6200EE',
    fontWeight: '600',
  },
  addButton: {
    marginTop: 20,
    height: 55,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#6200EE',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#6200EE',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AccountsScreen;