import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CategoryService, Category } from '../../services/categoryService';

interface Props {
  userId: number;
  category?: Category;
  onBack: () => void;
}

const ICONS = ['cart', 'silverware-fork-knife', 'car', 'home', 'lightbulb', 'gamepad-variant', 'hospital-building', 'airplane', 'tshirt-crew', 'cellphone', 'cash', 'chart-line', 'gift', 'school', 'tools', 'paw', 'bank'];
const COLORS = ['#6200EE', '#FF5252', '#2ECC71', '#3498DB', '#F1C40F', '#E67E22', '#9B59B6', '#34495E', '#1ABC9C', '#E84393', '#9E9E9E'];

const AddCategoryScreen = ({ userId, category, onBack }: Props) => {
  const [name, setName] = useState(category?.name || '');
  const [type, setType] = useState<'Gasto' | 'Ingreso'>(category?.type || 'Gasto');
  const [limit, setLimit] = useState(category?.limit_amount ? category.limit_amount.toString() : '');
  const [selectedIcon, setSelectedIcon] = useState(category?.icon || ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(category?.color || COLORS[0]);

  const save = async () => {
    if (!name) {
        Alert.alert('Error', 'El nombre es obligatorio');
        return;
    }

    const limitAmount = limit ? parseFloat(limit) : 0;

    let res;
    // CONTROL ESTRICTO: Si la categoría existe y tiene un ID, es una edición sí o sí.
    if (category && category.id) {
      res = await CategoryService.updateCategory(category.id, userId, name, selectedIcon, selectedColor, limitAmount);
    } else {
      res = await CategoryService.createCategory(userId, name, type, selectedIcon, selectedColor, limitAmount);
    }

    if (res.success) {
        onBack();
    } else {
        // Mostramos el error devuelto por el servicio
        Alert.alert('Aviso', res.error || 'Ocurrió un error inesperado');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.back}>‹</Text></TouchableOpacity>
        <Text style={styles.title}>{category ? 'Editar Categoría' : 'Nueva Categoría'}</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView contentContainerStyle={{ padding: 20, gap: 15 }}>
        <Text style={styles.label}>Nombre de la categoría</Text>
        <TextInput 
            style={styles.input} 
            placeholder="Ej. Comida, Transporte..." 
            value={name} 
            onChangeText={setName} 
        />

        {!category && (
          <>
            <Text style={styles.label}>Tipo de movimiento</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => setType('Gasto')} style={[styles.opt, type === 'Gasto' && styles.activeGasto]}>
                <Text style={type === 'Gasto' ? styles.whiteText : styles.darkText}>Gasto</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setType('Ingreso')} style={[styles.opt, type === 'Ingreso' && styles.activeIngreso]}>
                <Text style={type === 'Ingreso' ? styles.whiteText : styles.darkText}>Ingreso</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        <Text style={styles.label}>Ícono representativo</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
          {ICONS.map((icon) => (
            <TouchableOpacity 
              key={icon} 
              onPress={() => setSelectedIcon(icon)}
              style={[styles.iconBox, selectedIcon === icon && { borderColor: selectedColor, backgroundColor: selectedColor + '20' }]}
            >
              <MaterialCommunityIcons name={icon as any} size={28} color={selectedIcon === icon ? selectedColor : '#666'} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Color de la categoría</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
          {COLORS.map((color) => (
            <TouchableOpacity 
              key={color} 
              onPress={() => setSelectedColor(color)}
              style={[styles.colorBox, { backgroundColor: color }, selectedColor === color && styles.colorBoxActive]}
            >
              {selectedColor === color && <Text style={styles.checkMark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </ScrollView>

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
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{category ? 'Actualizar Categoría' : 'Guardar Categoría'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 },
  back: { fontSize: 40 },
  title: { fontSize: 18, fontWeight: 'bold' },
  label: { fontSize: 14, color: '#666', marginTop: 5 },
  input: { borderBottomWidth: 1, borderColor: '#EEE', padding: 10, fontSize: 16 },
  btn: { backgroundColor: '#6200EE', padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 20 },
  opt: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#EEE', borderRadius: 10, alignItems: 'center' },
  activeGasto: { backgroundColor: '#FF5252', borderColor: '#FF5252' },
  activeIngreso: { backgroundColor: '#2ECC71', borderColor: '#2ECC71' },
  whiteText: { color: '#FFF', fontWeight: 'bold' },
  darkText: { color: '#333' },
  hint: { fontSize: 12, color: '#999', fontStyle: 'italic', marginTop: -10 },
  horizontalList: { flexDirection: 'row', paddingVertical: 5 },
  iconBox: { width: 55, height: 55, justifyContent: 'center', alignItems: 'center', borderRadius: 15, borderWidth: 2, borderColor: 'transparent', marginRight: 10, backgroundColor: '#F5F5F5' },
  colorBox: { width: 40, height: 40, borderRadius: 20, marginRight: 15, justifyContent: 'center', alignItems: 'center' },
  colorBoxActive: { borderWidth: 3, borderColor: '#333' },
  checkMark: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});

export default AddCategoryScreen;