import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryService, Category } from '../../services/categoryService';

interface Props {
  userId: number;
  onAdd: () => void;
  onBack: () => void;
}

const CategoriesScreen = ({ userId, onAdd, onBack }: Props) => {
  const [cats, setCats] = useState<Category[]>([]);

  useEffect(() => {
    CategoryService.getCategories(userId).then(setCats);
  }, [userId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.back}>‹</Text></TouchableOpacity>
        <Text style={styles.title}>Categorias</Text>
        <TouchableOpacity onPress={onAdd}><Text style={{ fontSize: 24 }}>+</Text></TouchableOpacity>
      </View>
      <FlatList 
        data={cats}
        numColumns={2}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: item.color + '20' }]}>
            <Text>{item.icon}</Text>
            <Text>{item.name}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 10 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15 },
  back: { fontSize: 40 },
  title: { fontSize: 18, fontWeight: 'bold' },
  card: { flex: 1, margin: 5, padding: 20, borderRadius: 15, alignItems: 'center' }
});

export default CategoriesScreen;