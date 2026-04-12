import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { AccountService, Account } from '../../services/accountService';

// ID de usuario temporal para el MVP
const USER_ID = 1;

interface Props {
  onAdd: () => void;
  onBack: () => void;
  onEdit: (account: Account) => void;
}

// Función auxiliar para mantener el diseño visual, ya que la DB no guarda colores/iconos en Cuentas
const getAccountVisuals = (type: string) => {
  switch (type) {
    case 'Efectivo': return { icon: '💵', color: '#4CAF50' };
    case 'Banco': return { icon: '🏦', color: '#2196F3' };
    case 'Tarjeta': return { icon: '💳', color: '#FF9800' };
    default: return { icon: '💼', color: '#9C27B0' };
  }
};

const AccountsScreen = ({ onAdd, onBack, onEdit }: Props) => {
  // 1. Estados para almacenar las cuentas y el estado de carga
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. useFocusEffect garantiza que los datos se recarguen CADA VEZ que se abre la pantalla
  useFocusEffect(
    useCallback(() => {
      const loadAccounts = async () => {
        setLoading(true);
        const data = await AccountService.getAccounts(USER_ID);
        setAccounts(data);
        setLoading(false);
      };

      loadAccounts();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Cuentas</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Gestiona tus fuentes de dinero</Text>

        {/* 3. Indicador de carga para mejor UX */}
        {loading ? (
          <ActivityIndicator size="large" color="#6200EE" style={{ marginTop: 20 }} />
        ) : accounts.length === 0 ? (
          <Text style={styles.emptyText}>No tienes cuentas registradas aún.</Text>
        ) : (
          /* 4. Mapeo dinámico de los datos reales de la base de datos */
          accounts.map((account) => {
            const visuals = getAccountVisuals(account.type);
            
            return (
              <View key={account.id.toString()} style={styles.accountCard}>
                <View style={[styles.iconBox, { backgroundColor: visuals.color }]}>
                  <Text style={styles.iconText}>{visuals.icon}</Text>
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>{account.name}</Text>
                  {/* current_balance viene de la base de datos y se formatea */}
                  <Text style={styles.accountBalance}>
                    ${account.current_balance.toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
                {/* Aquí podrías llamar a onEdit(account) en el futuro */}
                <TouchableOpacity style={styles.editButton} onPress={() => onEdit(account)}>
                  <Text style={styles.editText}>Editar</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <Text style={styles.addButtonText}>+ Añadir nueva cuenta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 60, paddingHorizontal: 10 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 35, color: '#000', fontWeight: '300' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 25 },
  subtitle: { fontSize: 16, color: '#808080', marginBottom: 30 },
  accountCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FE', padding: 15, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: '#F0F0F0' },
  iconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  iconText: { fontSize: 24 },
  accountInfo: { flex: 1, marginLeft: 15 },
  accountName: { fontSize: 16, fontWeight: '600', color: '#333' },
  accountBalance: { fontSize: 18, fontWeight: 'bold', color: '#000', marginTop: 2 },
  editButton: { paddingHorizontal: 12 },
  editText: { color: '#6200EE', fontWeight: '600' },
  addButton: { marginTop: 20, height: 55, borderRadius: 25, borderWidth: 2, borderColor: '#6200EE', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: '#6200EE', fontSize: 16, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#808080', fontSize: 16, marginVertical: 20 },
});

export default AccountsScreen;