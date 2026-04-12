import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CategoryService } from '../../services/categoryService';

// Placeholder hasta que se implemente autenticación
const USER_ID = 1;

const EMOJIS = [
  '🍔', '🚗', '🏥', '🎮', '📚', '🏠',
  '👗', '✈️', '💪', '🐾', '🎵', '💊',
  '🛒', '⚡', '💼', '🎁', '☕', '🎭',
  '🌿', '🐕', '🎬', '🧴', '🍺', '📱',
];

interface ColorPair {
  bg: string;
  text: string;
}

const COLOR_PALETTE: ColorPair[] = [
  { bg: '#FFEBEE', text: '#D32F2F' },
  { bg: '#E3F2FD', text: '#1976D2' },
  { bg: '#E8F5E9', text: '#388E3C' },
  { bg: '#F3E5F5', text: '#7B1FA2' },
  { bg: '#FFF3E0', text: '#F57C00' },
  { bg: '#EFEBE9', text: '#5D4037' },
  { bg: '#FCE4EC', text: '#C2185B' },
  { bg: '#E0F7FA', text: '#00838F' },
  { bg: '#F9FBE7', text: '#827717' },
  { bg: '#EDE7F6', text: '#4527A0' },
];

interface Props {
  onBack: () => void;
  categoryId?: number;
}

const AddCategoryScreen = ({ onBack, categoryId }: Props) => {
  const isEditing = categoryId !== undefined;

  const [name, setName] = useState('');
  const [type, setType] = useState<'Ingreso' | 'Gasto'>('Gasto');
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[0]);
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0].bg);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) return;

    const loadCategory = async () => {
      const cat = await CategoryService.getCategoryById(categoryId!);
      if (cat) {
        setName(cat.name);
        setType(cat.type);
        setSelectedEmoji(cat.icon);
        setSelectedColor(cat.color);
      }
      setLoading(false);
    };

    loadCategory();
  }, [categoryId]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Espera', 'Dale un nombre a tu categoría.');
      return;
    }

    setSaving(true);

    const result = isEditing
      ? await CategoryService.updateCategory(categoryId!, name, type, selectedEmoji, selectedColor)
      : await CategoryService.createCategory(USER_ID, name, type, selectedEmoji, selectedColor);

    setSaving(false);

    if (!result.success) {
      Alert.alert('Error', result.error ?? 'No se pudo guardar la categoría.');
      return;
    }

    Alert.alert(
      '¡Listo!',
      isEditing ? 'Categoría actualizada.' : `Categoría "${name.trim()}" creada.`,
      [{ text: 'OK', onPress: onBack }]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar categoría',
      `¿Seguro que quieres eliminar "${name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const result = await CategoryService.deleteCategory(categoryId!);
            if (!result.success) {
              Alert.alert('No se puede eliminar', result.error ?? 'Error desconocido.');
              return;
            }
            onBack();
          },
        },
      ]
    );
  };

  const previewColor = COLOR_PALETTE.find(c => c.bg === selectedColor) ?? COLOR_PALETTE[0];

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6200EE" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
        </Text>
        {isEditing ? (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>🗑️</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Vista previa */}
        <View style={styles.previewContainer}>
          <View style={[styles.previewCard, { backgroundColor: selectedColor }]}>
            <Text style={styles.previewEmoji}>{selectedEmoji}</Text>
            <Text style={[styles.previewName, { color: previewColor.text }]}>
              {name.trim() || 'Nombre'}
            </Text>
            <Text style={[styles.previewType, { color: previewColor.text }]}>{type}</Text>
          </View>
        </View>

        {/* Nombre */}
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Gimnasio, Mascotas..."
          value={name}
          onChangeText={setName}
          placeholderTextColor="#C0C0C0"
          maxLength={64}
        />

        {/* Tipo */}
        <Text style={styles.label}>Tipo</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'Gasto' && styles.typeBtnActive]}
            onPress={() => setType('Gasto')}
          >
            <Text style={[styles.typeBtnText, type === 'Gasto' && styles.typeBtnTextActive]}>
              📤 Gasto
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'Ingreso' && styles.typeBtnActiveGreen]}
            onPress={() => setType('Ingreso')}
          >
            <Text style={[styles.typeBtnText, type === 'Ingreso' && styles.typeBtnTextActive]}>
              📥 Ingreso
            </Text>
          </TouchableOpacity>
        </View>

        {/* Icono */}
        <Text style={styles.label}>Icono</Text>
        <View style={styles.emojiGrid}>
          {EMOJIS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={[styles.emojiItem, selectedEmoji === emoji && styles.selectedEmoji]}
              onPress={() => setSelectedEmoji(emoji)}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Color */}
        <Text style={styles.label}>Color</Text>
        <View style={styles.colorGrid}>
          {COLOR_PALETTE.map((pair) => (
            <TouchableOpacity
              key={pair.bg}
              style={[
                styles.colorSwatch,
                { backgroundColor: pair.bg, borderColor: pair.text },
                selectedColor === pair.bg && styles.colorSwatchSelected,
              ]}
              onPress={() => setSelectedColor(pair.bg)}
            >
              {selectedColor === pair.bg && (
                <Text style={[styles.colorCheck, { color: pair.text }]}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Botón guardar */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Guardar cambios' : 'Crear categoría'}
            </Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 10,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 35, color: '#000', fontWeight: '300' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  deleteBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  deleteBtnText: { fontSize: 22 },
  content: { padding: 25, paddingBottom: 40 },

  // Vista previa
  previewContainer: { alignItems: 'center', marginBottom: 30 },
  previewCard: {
    width: 120,
    height: 120,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  previewEmoji: { fontSize: 36 },
  previewName: { fontSize: 13, fontWeight: 'bold' },
  previewType: { fontSize: 11, opacity: 0.8 },

  label: { fontSize: 14, fontWeight: '600', color: '#808080', marginBottom: 12, marginTop: 8 },
  input: {
    height: 50,
    borderBottomWidth: 1.5,
    borderBottomColor: '#F0F0F0',
    fontSize: 18,
    marginBottom: 28,
    color: '#333',
  },

  // Tipo
  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  typeBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FE',
  },
  typeBtnActive: { backgroundColor: '#FFEBEE', borderColor: '#D32F2F' },
  typeBtnActiveGreen: { backgroundColor: '#E8F5E9', borderColor: '#388E3C' },
  typeBtnText: { fontSize: 15, color: '#808080', fontWeight: '600' },
  typeBtnTextActive: { color: '#333' },

  // Emojis
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  emojiItem: {
    width: 58,
    height: 58,
    backgroundColor: '#F8F9FE',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedEmoji: { borderWidth: 2, borderColor: '#6200EE', backgroundColor: '#F3E5F5' },
  emojiText: { fontSize: 26 },

  // Colores
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 36 },
  colorSwatch: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSwatchSelected: { borderWidth: 2.5 },
  colorCheck: { fontSize: 18, fontWeight: 'bold' },

  // Botón guardar
  saveButton: {
    backgroundColor: '#6200EE',
    height: 58,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

export default AddCategoryScreen;
