import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  onBack: () => void;
}

const AddCategoryScreen = ({ onBack }: Props) => {
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📁');

  const emojis = ['1?', '2?', '3?', '4?', '5?', '6?', '7?', '8?', '9?', '10?', '11?', '12?'];

  const handleSave = () => {
    if (!name) {
      Alert.alert('Espera', 'Dale un nombre a tu categoría');
      return;
    }
    Alert.alert('¡Éxito!', `Categoría "${name}" creada.`, [{ text: 'OK', onPress: onBack }]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva Categoría</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Nombre de la categoría</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: Gimnasio, Mascotas..."
          value={name}
          onChangeText={setName}
          placeholderTextColor="#C0C0C0"
        />

        <Text style={styles.label}>Selecciona un icono</Text>
        <View style={styles.emojiGrid}>
          {emojis.map((emoji) => (
            <TouchableOpacity 
              key={emoji} 
              style={[styles.emojiItem, selectedEmoji === emoji && styles.selectedEmoji]}
              onPress={() => setSelectedEmoji(emoji)}
            >
              <Text style={{ fontSize: 26 }}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Guardar Categoría</Text>
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
    paddingHorizontal: 10 
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 35, color: '#000', fontWeight: '300' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 25 },
  label: { fontSize: 14, color: '#808080', marginBottom: 12, fontWeight: '600' },
  input: { 
    height: 50, 
    borderBottomWidth: 1.5, 
    borderBottomColor: '#F0F0F0', 
    fontSize: 18, 
    marginBottom: 40 
  },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 50 },
  emojiItem: { 
    width: 65, 
    height: 65, 
    backgroundColor: '#F8F9FE', 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  selectedEmoji: { 
    borderWidth: 2, 
    borderColor: '#6200EE', 
    backgroundColor: '#F3E5F5' 
  },
  saveButton: { 
    backgroundColor: '#6200EE', 
    height: 58, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});

export default AddCategoryScreen;