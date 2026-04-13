import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TransactionService } from '../../services/transactionService';

interface Props {
  userId: number;
  onBack: () => void;
}

const ReportsScreen = ({ userId, onBack }: Props) => {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    TransactionService.getFilteredTransactions(userId, { type: 'Gasto' }).then(txs => {
      setTotal(txs.reduce((s, t) => s + t.amount, 0));
    });
  }, [userId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.back}>‹</Text></TouchableOpacity>
        <Text style={styles.title}>Reportes</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Total Gastado Mes Actual</Text>
        <Text style={{ fontSize: 40, fontWeight: 'bold' }}>${total.toFixed(2)}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 },
  back: { fontSize: 40 },
  title: { fontSize: 18, fontWeight: 'bold' }
});

export default ReportsScreen;