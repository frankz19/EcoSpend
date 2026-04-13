import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TransactionService } from '../../services/transactionService';
import { AccountService, Account } from '../../services/accountService';
import { CategoryService, Category } from '../../services/categoryService';

interface Props {
  userId: number;
  onBack: () => void;
}

const TransactionFormScreen = ({ userId, onBack }: Props) => {
  const [type, setType] = useState<'Gasto' | 'Ingreso'>('Gasto');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedAcc, setSelectedAcc] = useState<number | null>(null);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [accList, catList] = await Promise.all([
        AccountService.getAccounts(userId),
        CategoryService.getCategories(userId)
      ]);
      setAccounts(accList);
      setCategories(catList);
      if (accList.length > 0) setSelectedAcc(accList[0].id);
      setLoading(false);
    };
    loadData();
  }, [userId]);

  const handleSave = async () => {
    if (!amount || !selectedAcc || !selectedCat) {
      Alert.alert('Error', 'Completa los campos obligatorios');
      return;
    }
    const res = await TransactionService.createTransaction(
      selectedAcc,
      selectedCat,
      parseFloat(amount),
      description,
      new Date().toISOString()
    );
    if (res.success) onBack();
    else Alert.alert('Error', 'No se pudo guardar');
  };

  const filteredCats = categories.filter(c => c.type === type);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backIcon}>‹</Text></TouchableOpacity>
        <Text style={styles.title}>Nueva Operacion</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.typeContainer}>
          <TouchableOpacity 
            style={[styles.typeBtn, type === 'Gasto' && styles.activeGasto]} 
            onPress={() => { setType('Gasto'); setSelectedCat(null); }}>
            <Text style={type === 'Gasto' && styles.whiteText}>Gasto</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.typeBtn, type === 'Ingreso' && styles.activeIngreso]} 
            onPress={() => { setType('Ingreso'); setSelectedCat(null); }}>
            <Text style={type === 'Ingreso' && styles.whiteText}>Ingreso</Text>
          </TouchableOpacity>
        </View>

        <TextInput 
          style={styles.amountInput} 
          placeholder="0.00" 
          keyboardType="numeric" 
          value={amount} 
          onChangeText={setAmount} 
        />

        <Text style={styles.label}>Cuenta</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {accounts.map(acc => (
            <TouchableOpacity 
              key={acc.id} 
              style={[styles.chip, selectedAcc === acc.id && styles.activeChip]}
              onPress={() => setSelectedAcc(acc.id)}>
              <Text>{acc.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Categoria</Text>
        <View style={styles.catGrid}>
          {filteredCats.map(cat => (
            <TouchableOpacity 
              key={cat.id} 
              style={[styles.catItem, selectedCat === cat.id && { borderColor: cat.color}]}
              onPress={() => setSelectedCat(cat.id)}>
              <View style={[styles.catColor, { backgroundColor: cat.color }]} />
              <Text style={styles.catName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Nota (opcional)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Descripcion..." 
          value={description} 
          onChangeText={setDescription} 
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.whiteText}>Guardar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 },
  backIcon: { fontSize: 40 },
  title: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  typeContainer: { flexDirection: 'row', backgroundColor: '#F0F0F0', borderRadius: 15, padding: 5, marginBottom: 20 },
  typeBtn: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 10 },
  activeGasto: { backgroundColor: '#FF5252' },
  activeIngreso: { backgroundColor: '#2ECC71' },
  whiteText: { color: '#FFF', fontWeight: 'bold' },
  amountInput: { fontSize: 45, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
  label: { fontSize: 14, color: '#666', marginBottom: 10, marginTop: 10 },
  chipRow: { flexDirection: 'row', marginBottom: 15 },
  chip: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#F0F0F0', borderRadius: 20, marginRight: 10 },
  activeChip: { backgroundColor: '#DDD', borderWidth: 1 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  catItem: { width: '30%', padding: 10, backgroundColor: '#F9F9F9', borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
  catColor: { width: 20, height: 20, borderRadius: 10, marginBottom: 5 },
  catName: { fontSize: 12, textAlign: 'center' },
  input: { borderBottomWidth: 1, borderColor: '#EEE', padding: 10, marginBottom: 30 },
  saveBtn: { backgroundColor: '#6200EE', padding: 18, borderRadius: 20, alignItems: 'center' }
});

export default TransactionFormScreen;