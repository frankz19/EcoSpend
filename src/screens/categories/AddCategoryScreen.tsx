import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity,
  Alert 
} from 'react-native';

interface Props {
  onBack: () => void;
}

const AddCategoryScreen = ({ onBack }: Props) => {
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📁');

  const emojis = ['?', '?', '?', '?', '?', '?', '?', '?', '?', '?'];

  const handleSave = () => {
    if (!name) {
      Alert.alert('Espera', 'Dale un nombre a tu categoría');
      return;
    }
    Alert.alert('¡Lista!', `Categoría "${name}" creada.`, [{ text: 'OK', onPress: onBack }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backIcon}>‹</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva Categoría</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Nombre de la categoría</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Ej: Gimnasio, Mascotas..."
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Selecciona un icono</Text>
        <View style={styles.emojiGrid}>
          {emojis.map((emoji) => (
            <TouchableOpacity 
              key={emoji} 
              style={[styles.emojiItem, selectedEmoji === emoji && styles.selectedEmoji]}
              onPress={() => setSelectedEmoji(emoji)}
            >
              <Text style={{ fontSize: 24 }}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Guardar Categoría</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15 },
  backIcon: { fontSize: 35 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 25 },
  label: { fontSize: 14, color: '#808080', marginBottom: 10, marginTop: 20 },
  input: { height: 50, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', fontSize: 18, marginBottom: 30 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 40 },
  emojiItem: { width: 55, height: 55, backgroundColor: '#F5F5F5', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  selectedEmoji: { borderWidth: 2, borderColor: '#6200EE', backgroundColor: '#F3E5F5' },
  saveButton: { backgroundColor: '#6200EE', height: 55, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});

export default AddCategoryScreen;