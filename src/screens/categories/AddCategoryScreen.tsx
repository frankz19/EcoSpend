import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryService } from '../../services/categoryService';

interface Props {
  userId: number;
  onBack: () => void;
}

const AddCategoryScreen = ({ userId, onBack }: Props) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'Gasto' | 'Ingreso'>('Gasto');

  const save = async () => {
    if (!name) return;
    await CategoryService.createCategory(userId, name, type, '?', '#6200EE');
    onBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.back}>‹</Text></TouchableOpacity>
        <Text style={styles.title}>Nueva Categoria</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={{ padding: 20, gap: 15 }}>
        <TextInput style={styles.input} placeholder="Nombre" value={name} onChangeText={setName} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={() => setType('Gasto')} style={[styles.opt, type === 'Gasto' && styles.active]}><Text>Gasto</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setType('Ingreso')} style={[styles.opt, type === 'Ingreso' && styles.active]}><Text>Ingreso</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.btn} onPress={save}><Text style={{ color: '#FFF' }}>Guardar</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 },
  back: { fontSize: 40 },
  title: { fontSize: 18, fontWeight: 'bold' },
  input: { borderBottomWidth: 1, padding: 10 },
  btn: { backgroundColor: '#6200EE', padding: 15, borderRadius: 10, alignItems: 'center' },
  opt: { flex: 1, padding: 10, borderWidth: 1, borderRadius: 5, alignItems: 'center' },
  active: { backgroundColor: '#DDD' }
});

export default AddCategoryScreen;