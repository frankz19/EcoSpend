import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity 
} from 'react-native';
// Importación moderna
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  onAdd: () => void;
  onBack: () => void;
}

const CategoriesScreen = ({ onAdd, onBack }: Props) => {
  const categories = [
    { id: '1', name: 'Comida', icon: '?', color: '#FFEBEE', textColor: '#D32F2F' },
    { id: '2', name: 'Transporte', icon: '?', color: '#E3F2FD', textColor: '#1976D2' },
    { id: '3', name: 'Salud', icon: '?', color: '#E8F5E9', textColor: '#388E3C' },
    { id: '4', name: 'Ocio', icon: '?', color: '#F3E5F5', textColor: '#7B1FA2' },
    { id: '5', name: 'Educación', icon: '?', color: '#FFF3E0', textColor: '#F57C00' },
    { id: '6', name: 'Hogar', icon: '?', color: '#EFEBE9', textColor: '#5D4037' },
  ];

  const renderItem = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity style={[styles.categoryCard, { backgroundColor: item.color }]}>
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={[styles.categoryName, { color: item.textColor }]}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categorías</Text>
        <TouchableOpacity style={styles.headerAdd} onPress={onAdd}>
          <Text style={styles.headerAddText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={styles.subtitle}>Gestiona tus etiquetas de gastos e ingresos</Text>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.mainAddButton} onPress={onAdd}>
          <Text style={styles.mainAddButtonText}>Crear nueva categoría</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 15 
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  backIcon: { fontSize: 35, color: '#000', fontWeight: '300' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  headerAdd: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  headerAddText: { fontSize: 28, color: '#6200EE' },
  subtitle: { fontSize: 14, color: '#808080', marginBottom: 20 },
  listContent: { padding: 20 },
  row: { justifyContent: 'space-between' },
  categoryCard: {
    width: '47%',
    height: 110,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryIcon: { fontSize: 32, marginBottom: 8 },
  categoryName: { fontSize: 14, fontWeight: 'bold' },
  footer: { padding: 20 },
  mainAddButton: {
    backgroundColor: '#6200EE',
    height: 55,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainAddButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default CategoriesScreen;