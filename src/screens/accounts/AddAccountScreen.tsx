import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  onBack: () => void;
}

const AddAccountScreen = ({ onBack }: Props) => {
  const [accountName, setAccountName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [selectedColor, setSelectedColor] = useState('#6200EE');

  const colors = ['#6200EE', '#2196F3', '#4CAF50', '#FF9800', '#F44336', '#E91E63', '#00BCD4'];

  const handleSave = () => {
    if (!accountName || !initialBalance) {
      Alert.alert('Espera', 'Por favor llena todos los campos');
      return;
    }
    Alert.alert('¡Cuenta creada!', `Has añadido "${accountName}" con éxito.`, [
      { text: 'Genial', onPress: onBack }
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva Cuenta</Text>
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

        <Text style={styles.label}>Saldo Inicial</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.currency}>$</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            keyboardType="numeric"
            value={initialBalance}
            onChangeText={setInitialBalance}
          />
        </View>

        <Text style={styles.label}>Elige un color</Text>
        <View style={styles.colorGrid}>
          {colors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[styles.colorOption, { backgroundColor: color }, selectedColor === color && styles.selectedColor]}
              onPress={() => setSelectedColor(color)}
            >
              {selectedColor === color && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Crear Cuenta</Text>
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
  input: { height: 50, borderBottomWidth: 1.5, borderBottomColor: '#F0F0F0', fontSize: 18, marginBottom: 30 },
  amountContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  currency: { fontSize: 30, fontWeight: 'bold', marginRight: 10 },
  amountInput: { fontSize: 35, fontWeight: 'bold', flex: 1 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 50 },
  colorOption: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
  selectedColor: { borderWidth: 3, borderColor: '#000' },
  check: { color: '#FFF', fontWeight: 'bold' },
  saveButton: { backgroundColor: '#6200EE', height: 55, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

export default AddAccountScreen;