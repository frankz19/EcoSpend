import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AccountService, Account } from '../../services/accountService';
import { Validators } from '../../utils/validators';
import { getDatabase } from '../../data/database/database';

const USER_ID = 1;

interface Props {
  onBack: () => void;
  accountToEdit?: Account; // Prop opcional para modo edición
}

const AddAccountScreen = ({ onBack, accountToEdit }: Props) => {
  // Inicializamos estados. Notarás que agregué selectedColor, 
  // asumiendo que eventualmente podrías guardar el color en la BD, o usando un valor por defecto.
  const [accountName, setAccountName] = useState(accountToEdit?.name || '');
  const [initialBalance, setInitialBalance] = useState(accountToEdit?.current_balance.toString() || '');
  // Si la BD no soporta color aún, iniciamos con el primero de la lista.
  const [selectedColor, setSelectedColor] = useState('#6200EE'); 
  
  const [loading, setLoading] = useState(false);
  const [isBalanceEditable, setIsBalanceEditable] = useState(true);

  const colors = ['#6200EE', '#2196F3', '#4CAF50', '#FF9800', '#F44336', '#E91E63', '#00BCD4'];

  // Verificación inicial si estamos editando
  useEffect(() => {
    if (accountToEdit) {
      checkIfBalanceIsEditable();
    }
  }, [accountToEdit]);

  const checkIfBalanceIsEditable = async () => {
    const db = getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM Transactions WHERE account_id = ?',
      [accountToEdit!.id]
    );
    if (result && result.count > 0) {
      setIsBalanceEditable(false);
    }
  };

  const handleSave = async () => {
    // 1. Usamos tus validadores como lo tenías
    const cleanName = Validators.sanitizeText(accountName);
    
    if (!Validators.isValidLength(cleanName, 64)) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    if (!Validators.isNumeric(initialBalance)) {
      Alert.alert('Error', 'Monto no válido');
      return;
    }

    setLoading(true);
    try {
      if (accountToEdit) {
        // MODO EDICIÓN: Usamos la función inteligente
        const result = await AccountService.updateAccountSmart(
          accountToEdit.id,
          cleanName,
          'Efectivo', // Ojo aquí: Si luego guardas el tipo/color, actualiza esto
          parseFloat(initialBalance)
        );
        if (result.success) {
          Alert.alert('Actualizado', result.message, [{ text: 'OK', onPress: onBack }]);
        }
      } else {
        // MODO CREACIÓN
        const result = await AccountService.createAccount(
          USER_ID,
          cleanName,
          'Efectivo', // Ojo aquí: Si luego guardas el tipo/color, actualiza esto
          parseFloat(initialBalance)
        );
        if (result.success) {
          Alert.alert('¡Éxito!', 'Cuenta creada correctamente', [{ text: 'OK', onPress: onBack }]);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {accountToEdit ? 'Editar Cuenta' : 'Nueva Cuenta'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Nombre de la cuenta</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Ahorros, Banco..."
          value={accountName}
          onChangeText={setAccountName}
          placeholderTextColor="#C0C0C0"
        />

        <Text style={styles.label}>
          Saldo {accountToEdit ? (isBalanceEditable ? 'Inicial' : 'Actual (Bloqueado)') : 'Inicial'}
        </Text>
        <View style={[styles.amountContainer, !isBalanceEditable && styles.disabledContainer]}>
          <Text style={[styles.currency, !isBalanceEditable && styles.disabledText]}>$</Text>
          <TextInput
            style={[styles.amountInput, !isBalanceEditable && styles.disabledText]}
            placeholder="0.00"
            keyboardType="numeric"
            value={initialBalance}
            onChangeText={setInitialBalance}
            editable={isBalanceEditable} // Aquí aplicamos la lógica de bloqueo
          />
        </View>

        {!isBalanceEditable && (
          <Text style={styles.helperText}>
            * El saldo no se puede editar porque ya existen transacciones registradas.
          </Text>
        )}

        {/* Sección de Selección de Color reincorporada */}
        <Text style={styles.label}>Elige un color</Text>
        <View style={styles.colorGrid}>
          {colors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption, 
                { backgroundColor: color }, 
                selectedColor === color && styles.selectedColor
              ]}
              onPress={() => setSelectedColor(color)}
            >
              {selectedColor === color && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.disabledButton]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>
              {accountToEdit ? 'Guardar Cambios' : 'Crear Cuenta'}
            </Text>
          )}
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
  label: { fontSize: 15, fontWeight: '600', color: '#808080', marginBottom: 10, marginTop: 10 },
  input: { height: 50, borderBottomWidth: 1.5, borderBottomColor: '#F0F0F0', fontSize: 18, marginBottom: 30, color: '#333' },
  amountContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  disabledContainer: { borderBottomWidth: 0 },
  currency: { fontSize: 30, fontWeight: 'bold', marginRight: 10, color: '#000' },
  amountInput: { fontSize: 35, fontWeight: 'bold', flex: 1, color: '#000' },
  disabledText: { color: '#C0C0C0' },
  helperText: { fontSize: 12, color: '#FF5252', marginBottom: 20, fontStyle: 'italic' },
  // Estilos añadidos para la cuadrícula de colores
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 40 },
  colorOption: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
  selectedColor: { borderWidth: 3, borderColor: '#000' },
  check: { color: '#FFF', fontWeight: 'bold' },
  // Fin de estilos de color
  saveButton: { backgroundColor: '#6200EE', height: 55, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  disabledButton: { backgroundColor: '#BDBDBD' },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

export default AddAccountScreen;