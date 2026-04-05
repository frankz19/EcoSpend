import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  Alert,
  ScrollView 
} from 'react-native';
import { getDatabase } from '../../data/database/database';

interface Props {
  onBack: () => void;
}

const TransactionFormScreen = ({ onBack }: Props) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General'); // Luego será un selector real

  const handleSave = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    const db = getDatabase();
    const finalAmount = type === 'expense' ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount));

    try {
      // Guardamos en la base de datos
      db.runSync(
        'INSERT INTO Transactions (amount, description, date, category_id, account_id) VALUES (?, ?, ?, ?, ?)',
        [finalAmount, description, new Date().toISOString(), 1, 1] // Usamos IDs temporales 1
      );

      Alert.alert('¡Guardado!', 'La operación se registró con éxito', [
        { text: 'OK', onPress: onBack }
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo guardar la transacción');
    }
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva Operación</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Selector de Tipo (Gasto/Ingreso) */}
        <View style={styles.typeSelector}>
          <TouchableOpacity 
            style={[styles.typeButton, type === 'expense' && styles.typeButtonActiveExpense]}
            onPress={() => setType('expense')}
          >
            <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>Gasto</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.typeButton, type === 'income' && styles.typeButtonActiveIncome]}
            onPress={() => setType('income')}
          >
            <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>Ingreso</Text>
          </TouchableOpacity>
        </View>

        {/* Campo de Monto Grande */}
        <View style={styles.amountContainer}>
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

        {/* Otros Campos */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Descripción</Text>
            <TextInput 
              style={styles.input} 
              value={description}
              onChangeText={setDescription}
              placeholder="¿En qué lo gastaste?"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Categoría</Text>
            <TouchableOpacity style={styles.inputSelector}>
              <Text style={{ color: '#000' }}>{category}</Text>
              <Text style={{ color: '#808080' }}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: type === 'expense' ? '#F44336' : '#4CAF50' }]} 
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Guardar Registro</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 60, paddingHorizontal: 10 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 35, color: '#000' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 25 },
  typeSelector: { flexDirection: 'row', backgroundColor: '#F0F0F0', borderRadius: 25, padding: 5, marginBottom: 30 },
  typeButton: { flex: 1, height: 45, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  typeButtonActiveExpense: { backgroundColor: '#F44336' },
  typeButtonActiveIncome: { backgroundColor: '#4CAF50' },
  typeText: { fontSize: 16, fontWeight: '600', color: '#808080' },
  typeTextActive: { color: '#FFF' },
  amountContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  currencySymbol: { fontSize: 40, fontWeight: 'bold', color: '#000', marginRight: 5 },
  amountInput: { fontSize: 50, fontWeight: 'bold', color: '#000', minWidth: 100 },
  form: { marginBottom: 30 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, color: '#808080', marginBottom: 8 },
  input: { height: 50, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', fontSize: 16 },
  inputSelector: { height: 50, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  saveButton: { height: 55, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' }
});

export default TransactionFormScreen;