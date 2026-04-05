import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert
} from 'react-native';

interface Props {
  onBack: () => void;
}

const AddAccountScreen = ({ onBack }: Props) => {
  const [accountName, setAccountName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [selectedColor, setSelectedColor] = useState('#6200EE');

  // Colores sugeridos para las cuentas
  const colors = ['#6200EE', '#2196F3', '#4CAF50', '#FF9800', '#F44336', '#E91E63', '#00BCD4'];

  const handleSave = () => {
    if (!accountName || !initialBalance) {
      Alert.alert('Error', 'Por favor llena todos los campos');
      return;
    }

    // Aquí irá el INSERT a la tabla Accounts después
    Alert.alert('¡Cuenta creada!', `Has añadido "${accountName}" con éxito.`, [
      { text: 'Genial', onPress: onBack }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva Cuenta</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Nombre de la cuenta</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Ahorros, Banco Mercantil..."
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
            placeholderTextColor="#C0C0C0"
          />
        </View>

        <Text style={styles.label}>Elige un color distintivo</Text>
        <View style={styles.colorGrid}>
          {colors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                selectedColor === color && styles.selectedColorOption
              ]}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 10,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 35, color: '#000' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 25 },
  label: { fontSize: 16, fontWeight: '600', color: '#808080', marginBottom: 10, marginTop: 10 },
  input: {
    height: 55,
    borderBottomWidth: 2,
    borderBottomColor: '#F0F0F0',
    fontSize: 18,
    color: '#000',
    marginBottom: 30,
  },
  amountContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 40 },
  currency: { fontSize: 30, fontWeight: 'bold', color: '#000', marginRight: 10 },
  amountInput: { fontSize: 35, fontWeight: 'bold', color: '#000', flex: 1 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 50 },
  colorOption: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: '#000',
  },
  check: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  saveButton: {
    backgroundColor: '#6200EE',
    height: 55,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});

export default AddAccountScreen;