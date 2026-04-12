import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TransactionService } from '../../services/transactionService';
import { AccountService, Account } from '../../services/accountService';
import { CategoryService, Category } from '../../services/categoryService';

// Placeholder hasta que se implemente autenticación
const USER_ID = 1;

interface Props {
  onBack: () => void;
}

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const formatDate = (d: Date): string => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Hoy';
  if (d.toDateString() === yesterday.toDateString()) return 'Ayer';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

const TransactionFormScreen = ({ onBack }: Props) => {
  const [transactionType, setTransactionType] = useState<'Gasto' | 'Ingreso'>('Gasto');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [accs, cats] = await Promise.all([
        AccountService.getAccounts(USER_ID),
        CategoryService.getCategories(USER_ID),
      ]);
      setAccounts(accs);
      setAllCategories(cats);
      if (accs.length > 0) setSelectedAccount(accs[0]);
      setLoading(false);
    };
    load();
  }, []);

  // Resetear categoría al cambiar el tipo
  const handleTypeChange = (newType: 'Gasto' | 'Ingreso') => {
    setTransactionType(newType);
    setSelectedCategory(null);
  };

  const filteredCategories = allCategories.filter(c => c.type === transactionType);

  const prevDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    setDate(d);
  };

  const nextDay = () => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    if (d <= new Date()) setDate(d);
  };

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);

    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Espera', 'Ingresa un monto válido mayor a cero.');
      return;
    }
    if (!selectedAccount) {
      Alert.alert('Espera', 'Selecciona una cuenta.');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Espera', 'Selecciona una categoría.');
      return;
    }

    setSaving(true);

    const result = await TransactionService.createTransaction(
      selectedAccount.id,
      selectedCategory.id,
      parsedAmount,
      description.trim(),
      date.toISOString()
    );

    setSaving(false);

    if (!result.success) {
      Alert.alert('Error', result.error ?? 'No se pudo guardar la transacción.');
      return;
    }

    Alert.alert('¡Guardado!', 'Transacción registrada correctamente.', [
      { text: 'OK', onPress: onBack }
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6200EE" />
        </View>
      </SafeAreaView>
    );
  }

  if (accounts.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nueva Operación</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🏦</Text>
          <Text style={styles.emptyTitle}>Sin cuentas</Text>
          <Text style={styles.emptySubtitle}>
            Crea al menos una cuenta antes de registrar transacciones.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva Operación</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

          {/* Toggle Gasto / Ingreso */}
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, transactionType === 'Gasto' && styles.btnGastoActive]}
              onPress={() => handleTypeChange('Gasto')}
            >
              <Text style={[styles.typeText, transactionType === 'Gasto' && styles.textActive]}>
                📤 Gasto
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, transactionType === 'Ingreso' && styles.btnIngresoActive]}
              onPress={() => handleTypeChange('Ingreso')}
            >
              <Text style={[styles.typeText, transactionType === 'Ingreso' && styles.textActive]}>
                📥 Ingreso
              </Text>
            </TouchableOpacity>
          </View>

          {/* Monto */}
          <View style={styles.amountBox}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#C0C0C0"
              autoFocus
            />
          </View>

          {/* Formulario */}
          <View style={styles.formCard}>

            {/* Cuenta */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cuenta</Text>
              <TouchableOpacity
                style={styles.selectorField}
                onPress={() => setShowAccountModal(true)}
              >
                <Text style={styles.selectorText}>
                  {selectedAccount ? selectedAccount.name : 'Seleccionar cuenta'}
                </Text>
                <Text style={styles.chevron}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Categoría */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Categoría</Text>
              <TouchableOpacity
                style={styles.selectorField}
                onPress={() => {
                  if (filteredCategories.length === 0) {
                    Alert.alert(
                      'Sin categorías',
                      `No tienes categorías de tipo "${transactionType}". Crea una en la sección Categorías.`
                    );
                    return;
                  }
                  setShowCategoryModal(true);
                }}
              >
                <View style={styles.categoryPreview}>
                  {selectedCategory && (
                    <Text style={styles.categoryPreviewIcon}>{selectedCategory.icon}</Text>
                  )}
                  <Text style={[
                    styles.selectorText,
                    !selectedCategory && { color: '#C0C0C0' }
                  ]}>
                    {selectedCategory ? selectedCategory.name : 'Seleccionar categoría'}
                  </Text>
                </View>
                <Text style={styles.chevron}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Descripción */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descripción (opcional)</Text>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="¿En qué se usó el dinero?"
                placeholderTextColor="#C0C0C0"
                maxLength={180}
              />
            </View>

            {/* Fecha */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fecha</Text>
              <View style={styles.dateRow}>
                <TouchableOpacity style={styles.dateArrow} onPress={prevDay}>
                  <Text style={styles.dateArrowText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.dateValue}>{formatDate(date)}</Text>
                <TouchableOpacity
                  style={styles.dateArrow}
                  onPress={nextDay}
                  disabled={date.toDateString() === new Date().toDateString()}
                >
                  <Text style={[
                    styles.dateArrowText,
                    date.toDateString() === new Date().toDateString() && styles.dateArrowDisabled
                  ]}>›</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>

          {/* Botón guardar */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: transactionType === 'Gasto' ? '#FF5252' : '#2ECC71' },
              saving && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar Registro</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal: Selector de Cuenta */}
      <Modal visible={showAccountModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAccountModal(false)}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Seleccionar cuenta</Text>
            <FlatList
              data={accounts}
              keyExtractor={item => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedAccount?.id === item.id && styles.modalItemSelected,
                  ]}
                  onPress={() => { setSelectedAccount(item); setShowAccountModal(false); }}
                >
                  <View>
                    <Text style={styles.modalItemTitle}>{item.name}</Text>
                    <Text style={styles.modalItemSub}>{item.type} · {item.currency}</Text>
                  </View>
                  <Text style={styles.modalItemBalance}>
                    ${item.current_balance.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal: Selector de Categoría */}
      <Modal visible={showCategoryModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Categorías de {transactionType}</Text>
            <FlatList
              data={filteredCategories}
              keyExtractor={item => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedCategory?.id === item.id && styles.modalItemSelected,
                  ]}
                  onPress={() => { setSelectedCategory(item); setShowCategoryModal(false); }}
                >
                  <View style={[styles.catIconBox, { backgroundColor: item.color }]}>
                    <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                  </View>
                  <Text style={styles.modalItemTitle}>{item.name}</Text>
                  {selectedCategory?.id === item.id && (
                    <Text style={styles.checkMark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  emptySubtitle: { fontSize: 14, color: '#808080', textAlign: 'center' },
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
  content: { padding: 25 },

  // Toggle
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 4,
    marginBottom: 40,
  },
  typeButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnGastoActive: { backgroundColor: '#FF5252' },
  btnIngresoActive: { backgroundColor: '#2ECC71' },
  typeText: { fontSize: 15, fontWeight: 'bold', color: '#808080' },
  textActive: { color: '#FFF' },

  // Monto
  amountBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 45,
  },
  currencySymbol: { fontSize: 30, fontWeight: 'bold', marginRight: 5, color: '#1A1A1A' },
  amountInput: { fontSize: 56, fontWeight: 'bold', color: '#1A1A1A', minWidth: 120 },

  // Form
  formCard: { marginBottom: 35 },
  inputGroup: { marginBottom: 28 },
  label: { fontSize: 14, color: '#808080', marginBottom: 8, fontWeight: '600' },
  input: {
    height: 50,
    borderBottomWidth: 1.5,
    borderBottomColor: '#F0F0F0',
    fontSize: 17,
    color: '#1A1A1A',
  },
  selectorField: {
    height: 50,
    borderBottomWidth: 1.5,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorText: { fontSize: 17, color: '#1A1A1A' },
  chevron: { color: '#808080', fontSize: 12 },
  categoryPreview: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryPreviewIcon: { fontSize: 20 },

  // Fecha
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  dateArrow: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  dateArrowText: { fontSize: 28, color: '#6200EE', fontWeight: '300' },
  dateArrowDisabled: { color: '#C0C0C0' },
  dateValue: { flex: 1, fontSize: 17, color: '#1A1A1A', textAlign: 'center', fontWeight: '600' },

  // Botón guardar
  saveButton: {
    height: 58,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 25,
    maxHeight: '65%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    gap: 14,
  },
  modalItemSelected: { backgroundColor: '#F3E5F5', borderRadius: 12 },
  modalItemTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', flex: 1 },
  modalItemSub: { fontSize: 12, color: '#808080', marginTop: 2 },
  modalItemBalance: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  catIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: { fontSize: 18, color: '#6200EE', fontWeight: 'bold' },
});

export default TransactionFormScreen;
