import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CategoryService, Category } from '../../services/categoryService';

interface Props {
  userId: number;
  onAdd: () => void;
  onEdit: (cat: Category) => void;
  onBack: () => void;
}

const CategoriesScreen = ({ userId, onAdd, onEdit, onBack }: Props) => {
  const [cats, setCats] = useState<Category[]>([]);

  const loadCategories = async () => {
    const data = await CategoryService.getCategories(userId);
    setCats(data);
  };

  useEffect(() => {
    loadCategories();
  }, [userId]);

  const handleCategoryPress = (category: Category) => {
    Alert.alert(
      'Opciones de Categoría',
      `¿Qué deseas hacer con "${category.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Editar', onPress: () => onEdit(category) },
        { text: 'Eliminar', style: 'destructive', onPress: () => confirmDelete(category) }
      ]
    );
  };

  const confirmDelete = (category: Category) => {
    Alert.alert(
      'Eliminar Categoría',
      `¿Estás seguro de que deseas eliminar "${category.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sí, eliminar', 
          style: 'destructive',
          onPress: async () => {
            const res = await CategoryService.deleteCategory(category.id);
            if (res.success) {
              loadCategories();
            } else {
              Alert.alert('No se pudo eliminar', res.error); 
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Categorías</Text>
        <TouchableOpacity onPress={onAdd} style={styles.addBtn}>
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList 
        data={cats}
        numColumns={2}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: item.color + '15', borderColor: item.color + '40', borderWidth: 1 }]}
            onPress={() => handleCategoryPress(item)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name={item.icon as any} size={35} color={item.color} style={{ marginBottom: 10 }} />
            <Text style={{ fontWeight: 'bold', color: '#333' }}>{item.name}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 10 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  back: { fontSize: 40, color: '#000', marginTop: -10 },
  title: { fontSize: 18, fontWeight: 'bold' },
  addBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  addText: { fontSize: 28, color: '#6200EE' },
  card: { flex: 1, margin: 8, padding: 25, borderRadius: 15, alignItems: 'center' }
});

export default CategoriesScreen;