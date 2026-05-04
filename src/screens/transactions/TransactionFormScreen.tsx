import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TransactionService, TransactionWithDetails } from '../../services/transactionService';
import { AccountService, Account } from '../../services/accountService';
import { CategoryService, Category } from '../../services/categoryService';
import { CurrencyService } from '../../services/currencyService';

interface Props {
  userId: number;
  onBack: () => void;
  transaction?: TransactionWithDetails;
}

const TransactionFormScreen = ({ userId, onBack, transaction}: Props) => {
  const [type, setType] = useState<'Gasto' | 'Ingreso'>('Gasto');
  const [amount, setAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');
  const [description, setDescription] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedAcc, setSelectedAcc] = useState<number | null>(null);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toFixed(2));
      setExchangeRate(transaction.exchange_rate ? transaction.exchange_rate.toString() : '1');
      setDescription(transaction.description || '');
      setType(transaction.category_type);
      setSelectedAcc(transaction.account_id);
      setSelectedCat(transaction.category_id);
    }
  }, [transaction]);

  useEffect(() => {
    const loadData = async () => {
      const [accList, catList] = await Promise.all([
        AccountService.getAccounts(userId),
        CategoryService.getCategories(userId)
      ]);
      setAccounts(accList);
      setCategories(catList);
      if (accList.length > 0 && !transaction) setSelectedAcc(accList[0].id);
      setLoading(false);
    };
    
    loadData();
  }, [userId, transaction]);

  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (!cleaned) {
        setAmount('');
        return;
    }
    const parsed = (parseInt(cleaned, 10) / 100).toFixed(2);
    setAmount(parsed);
  };

  const handleSave = async () => {
    if (!amount || !selectedAcc || !selectedCat) {
      Alert.alert('Error', 'Completa los campos obligatorios');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Introduce un monto valido');
      return;
    }

    const acc = accounts.find(a => a.id === selectedAcc);
    let finalRate = 1.0;
    
    if (acc && acc.currency !== 'USD') {
        finalRate = parseFloat(exchangeRate);
        if (isNaN(finalRate) || finalRate <= 0) {
            Alert.alert('Error', `Introduce una tasa de cambio valida para ${acc.currency}`);
            return;
        }
    }

    const data = {
      amount: parsedAmount,
      exchange_rate: finalRate,
      account_id: selectedAcc,
      category_id: selectedCat,
      description,
      date: transaction?.date || new Date().toISOString(),
    };

    let res;

    if (transaction) {
      res = await TransactionService.updateTransaction(transaction.id, data);
    } else {
      res = await TransactionService.createTransaction(
        data.account_id, data.category_id, data.amount, data.exchange_rate, data.description, data.date
      );
    }

    if (res.success) {
      if (res.warning) {
        Alert.alert('Presupuesto Excedido', res.warning, [{ text: 'Entendido', onPress: () => onBack() }]);
      } else {
        onBack();
      }
    } else {
      Alert.alert('Error', res.error || 'No se pudo guardar la operacion');
    }
  };

  const filteredCats = categories.filter(c => c.type === type && c.name !== 'Saldo Inicial');
  const selectedAccountObj = accounts.find(a => a.id === selectedAcc);
  
  const requiresExchangeRate = selectedAccountObj && selectedAccountObj.currency !== 'USD';
  
  const currentBalance = selectedAccountObj?.current_balance || 0;
  const numericAmount = parseFloat(amount) || 0;
  const projectedBalance = type === 'Ingreso' ? currentBalance + numericAmount : currentBalance - numericAmount;
  const symbol = selectedAccountObj ? CurrencyService.symbol(selectedAccountObj.currency) : '';

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backIcon}>‹</Text></TouchableOpacity>
        <Text style={styles.title}>
          {transaction ? 'Editar Operacion' : 'Nueva Operacion'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.typeContainer}>
          <TouchableOpacity style={[styles.typeBtn, type === 'Gasto' && styles.activeGasto]} onPress={() => { setType('Gasto'); setSelectedCat(null); }}>
            <Text style={type === 'Gasto' && styles.whiteText}>Gasto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.typeBtn, type === 'Ingreso' && styles.activeIngreso]} onPress={() => { setType('Ingreso'); setSelectedCat(null); }}>
            <Text style={type === 'Ingreso' && styles.whiteText}>Ingreso</Text>
          </TouchableOpacity>
        </View>

        <TextInput style={styles.amountInput} placeholder="0.00" keyboardType="numeric" value={amount} onChangeText={handleAmountChange} />

        {selectedAccountObj && (
            <View style={styles.balanceInfo}>
                <Text style={styles.balanceText}>Saldo actual: {symbol} {currentBalance.toFixed(2)}</Text>
                <Text style={[styles.balanceText, projectedBalance < 0 && styles.negativeBalance]}>
                    Saldo resultante: {symbol} {projectedBalance.toFixed(2)}
                </Text>
            </View>
        )}

        {requiresExchangeRate && (
            <View style={styles.rateContainer}>
                <Text style={styles.label}>Tasa de cambio ({selectedAccountObj.currency}/$)</Text>
                <TextInput style={styles.inputRate} placeholder={`Ej: Valor de 1 USD en ${selectedAccountObj.currency}`} keyboardType="numeric" value={exchangeRate} onChangeText={setExchangeRate} />
            </View>
        )}

        <Text style={styles.label}>Cuenta</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {accounts.map(acc => (
            <TouchableOpacity key={acc.id} style={[styles.chip, selectedAcc === acc.id && styles.activeChip]} onPress={() => setSelectedAcc(acc.id)}>
              <Text>{acc.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Categoria</Text>
        <View style={styles.catGrid}>
          {filteredCats.map(cat => (
            <TouchableOpacity key={cat.id} 
              style={[styles.catItem, selectedCat === cat.id && { borderColor: cat.color, backgroundColor: cat.color + '15' }]}
              onPress={() => setSelectedCat(cat.id)}>
              <MaterialCommunityIcons name={cat.icon as any} size={28} color={selectedCat === cat.id ? cat.color : '#999'} style={{ marginBottom: 5 }} />
              <Text style={[styles.catName, selectedCat === cat.id && { color: cat.color, fontWeight: 'bold' }]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Nota (opcional)</Text>
        <TextInput style={styles.input} placeholder="Descripcion..." value={description} onChangeText={setDescription} />

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
  amountInput: { fontSize: 45, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
  balanceInfo: { alignItems: 'center', marginBottom: 20 },
  balanceText: { fontSize: 12, color: '#666', marginTop: 2 },
  negativeBalance: { color: '#FF5252', fontWeight: 'bold' },
  rateContainer: { marginBottom: 15 },
  inputRate: { borderBottomWidth: 1, borderColor: '#EEE', padding: 10, fontSize: 16 },
  label: { fontSize: 14, color: '#666', marginBottom: 10, marginTop: 10 },
  chipRow: { flexDirection: 'row', marginBottom: 15 },
  chip: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#F0F0F0', borderRadius: 20, marginRight: 10 },
  activeChip: { backgroundColor: '#DDD', borderWidth: 1 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  catItem: { width: '31%', padding: 12, backgroundColor: '#F9F9F9', borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: '#EEE' },
  catName: { fontSize: 12, textAlign: 'center', color: '#666' },
  input: { borderBottomWidth: 1, borderColor: '#EEE', padding: 10, marginBottom: 30 },
  saveBtn: { backgroundColor: '#6200EE', padding: 18, borderRadius: 20, alignItems: 'center' }
});

export default TransactionFormScreen;