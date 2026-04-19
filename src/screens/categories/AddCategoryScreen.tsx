import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryService } from '../../services/categoryService';

interface Props {
  userId: number;
  onBack: () => void;
}

const AddCategoryScreen = ({ userId, onBack }: Props) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'Gasto' | 'Ingreso'>('Gasto');
  const [limit, setLimit] = useState('');

  const save = async () => {
    if (!name) {
        Alert.alert('Error', 'El nombre es obligatorio');
        return;
    }

    const limitAmount = limit ? parseFloat(limit) : 0;

    const res = await CategoryService.createCategory(
        userId, 
        name, 
        type, 
        '?', 
        '#6200EE',
        limitAmount 
    );

    if (res.success) {
        onBack();
    } else {
        Alert.alert('Error', res.error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.back}>‹</Text></TouchableOpacity>
        <Text style={styles.title}>Nueva Categoría</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <View style={{ padding: 20, gap: 15 }}>
        <Text style={styles.label}>Nombre de la categoría</Text>
        <TextInput 
            style={styles.input} 
            placeholder="Ej. Comida, Transporte..." 
            value={name} 
            onChangeText={setName} 
        />

        <Text style={styles.label}>Tipo de movimiento</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity 
            onPress={() => setType('Gasto')} 
            style={[styles.opt, type === 'Gasto' && styles.activeGasto]}
          >
            <Text style={type === 'Gasto' && styles.whiteText}>Gasto</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setType('Ingreso')} 
            style={[styles.opt, type === 'Ingreso' && styles.activeIngreso]}
          >
            <Text style={type === 'Ingreso' && styles.whiteText}>Ingreso</Text>
          </TouchableOpacity>
        </View>

        {type === 'Gasto' && (
          <>
            <Text style={styles.label}>Límite Mensual (Opcional)</Text>
            <TextInput 
                style={styles.input} 
                placeholder="0.00 (Sin límite)" 
                value={limit} 
                onChangeText={setLimit} 
                keyboardType="numeric"
            />
            <Text style={styles.hint}>EcoSpend te avisará si excedes este monto en el mes.</Text>
          </>
        )}

        <TouchableOpacity style={styles.btn} onPress={save}>
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Guardar Categoría</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 },
  back: { fontSize: 40 },
  title: { fontSize: 18, fontWeight: 'bold' },
  label: { fontSize: 14, color: '#666', marginBottom: -5 },
  input: { borderBottomWidth: 1, borderColor: '#EEE', padding: 10, fontSize: 16 },
  btn: { backgroundColor: '#6200EE', padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 20 },
  opt: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#EEE', borderRadius: 10, alignItems: 'center' },
  activeGasto: { backgroundColor: '#FF5252', borderColor: '#FF5252' },
  activeIngreso: { backgroundColor: '#2ECC71', borderColor: '#2ECC71' },
  whiteText: { color: '#FFF', fontWeight: 'bold' },
  hint: { fontSize: 12, color: '#999', fontStyle: 'italic' }
});

export default AddCategoryScreen;