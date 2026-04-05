import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
// Cambio a la librería moderna para evitar el aviso de "deprecated"
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDatabase } from '../../data/database/database';

interface Props {
  onBack: () => void;
}

const TransactionFormScreen = ({ onBack }: Props) => {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');

  const handleSave = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Espera', 'Por favor ingresa un monto válido');
      return;
    }

    const db = getDatabase();
    const finalAmount = type === 'expense' ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount));

    try {
      db.runSync(
        'INSERT INTO Transactions (amount, description, date, category_id, account_id) VALUES (?, ?, ?, ?, ?)',
        [finalAmount, description, new Date().toISOString(), 1, 1]
      );

      Alert.alert('¡Éxito!', 'Operación guardada correctamente', [
        { text: 'OK', onPress: onBack }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo guardar en la base de datos');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva Operación</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          
          {/* Selector de Tipo (Toggle) */}
          <View style={styles.typeSelector}>
            <TouchableOpacity 
              style={[styles.typeButton, type === 'expense' && styles.btnExpenseActive]}
              onPress={() => setType('expense')}
            >
              <Text style={[styles.typeText, type === 'expense' && styles.textActive]}>Gasto</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.typeButton, type === 'income' && styles.btnIncomeActive]}
              onPress={() => setType('income')}
            >
              <Text style={[styles.typeText, type === 'income' && styles.textActive]}>Ingreso</Text>
            </TouchableOpacity>
          </View>

          {/* Input de Monto */}
          <View style={styles.amountBox}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#C0C0C0"
              autoFocus
            />
          </View>

          {/* Formulario */}
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descripción</Text>
              <TextInput 
                style={styles.input} 
                value={description}
                onChangeText={setDescription}
                placeholder="¿En qué se usó el dinero?"
                placeholderTextColor="#A0A0A0"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Categoría</Text>
              <TouchableOpacity style={styles.selectorField}>
                <Text style={styles.selectorText}>{category}</Text>
                <Text style={styles.chevron}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: type === 'expense' ? '#FF5252' : '#2ECC71' }]} 
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Guardar Registro</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    height: 60, 
    paddingHorizontal: 10 
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 35, color: '#000', fontWeight: '300' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 25 },
  typeSelector: { 
    flexDirection: 'row', 
    backgroundColor: '#F5F5F5', 
    borderRadius: 16, 
    padding: 4, 
    marginBottom: 40 
  },
  typeButton: { 
    flex: 1, 
    height: 48, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  btnExpenseActive: { backgroundColor: '#FF5252' },
  btnIncomeActive: { backgroundColor: '#2ECC71' },
  typeText: { fontSize: 15, fontWeight: 'bold', color: '#808080' },
  textActive: { color: '#FFF' },
  amountBox: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 50 
  },
  currencySymbol: { fontSize: 30, fontWeight: 'bold', marginRight: 5, color: '#1A1A1A' },
  amountInput: { fontSize: 56, fontWeight: 'bold', color: '#1A1A1A', minWidth: 120 },
  formCard: { marginBottom: 40 },
  inputGroup: { marginBottom: 25 },
  label: { fontSize: 14, color: '#808080', marginBottom: 8, fontWeight: '600' },
  input: { 
    height: 50, 
    borderBottomWidth: 1.5, 
    borderBottomColor: '#F0F0F0', 
    fontSize: 17, 
    color: '#1A1A1A' 
  },
  selectorField: { 
    height: 50, 
    borderBottomWidth: 1.5, 
    borderBottomColor: '#F0F0F0', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  selectorText: { fontSize: 17, color: '#1A1A1A' },
  chevron: { color: '#808080', fontSize: 12 },
  saveButton: { 
    height: 58, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4
  },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});

export default TransactionFormScreen;