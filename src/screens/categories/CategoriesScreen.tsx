import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryService, Category } from '../../services/categoryService';

// Placeholder hasta que se implemente autenticación
const USER_ID = 1;

// Mapa de color de fondo → color de texto
const TEXT_COLOR_MAP: Record<string, string> = {
  '#FFEBEE': '#D32F2F',
  '#E3F2FD': '#1976D2',
  '#E8F5E9': '#388E3C',
  '#F3E5F5': '#7B1FA2',
  '#FFF3E0': '#F57C00',
  '#EFEBE9': '#5D4037',
  '#FCE4EC': '#C2185B',
  '#E0F7FA': '#00838F',
  '#F9FBE7': '#827717',
  '#EDE7F6': '#4527A0',
};

const getTextColor = (bg: string) => TEXT_COLOR_MAP[bg] ?? '#333333';

interface Props {
  onAdd: () => void;
  onBack: () => void;
  onEdit: (id: number) => void;
}

const CategoriesScreen = ({ onAdd, onBack, onEdit }: Props) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await CategoryService.getCategories(USER_ID);
      setCategories(data);
      setLoading(false);
    };
    load();
  }, []);

  const renderItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[styles.categoryCard, { backgroundColor: item.color }]}
      onPress={() => onEdit(item.id)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={[styles.categoryName, { color: getTextColor(item.color) }]}>
        {item.name}
      </Text>
      <Text style={[styles.categoryType, { color: getTextColor(item.color) }]}>
        {item.type}
      </Text>
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

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6200EE" />
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <Text style={styles.subtitle}>
              Toca una categoría para editarla
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🗂️</Text>
              <Text style={styles.emptyTitle}>Sin categorías</Text>
              <Text style={styles.emptySubtitle}>
                Crea tu primera categoría para organizar tus transacciones
              </Text>
            </View>
          }
        />
      )}

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
    paddingHorizontal: 15,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  backIcon: { fontSize: 35, color: '#000', fontWeight: '300' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  headerAdd: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  headerAddText: { fontSize: 28, color: '#6200EE' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  subtitle: { fontSize: 14, color: '#808080', marginBottom: 20 },
  listContent: { padding: 20, flexGrow: 1 },
  row: { justifyContent: 'space-between' },
  categoryCard: {
    width: '47%',
    height: 110,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    gap: 4,
  },
  categoryIcon: { fontSize: 32 },
  categoryName: { fontSize: 13, fontWeight: 'bold' },
  categoryType: { fontSize: 11, opacity: 0.8 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 10,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  emptySubtitle: { fontSize: 14, color: '#808080', textAlign: 'center', paddingHorizontal: 20 },
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
