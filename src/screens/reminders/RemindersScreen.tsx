import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReminderService, Reminder } from '../../services/reminderService';

interface Props {
  userId: number;
  onBack: () => void;
  onAdd: () => void;
}

const RECURRENCE_LABELS: Record<string, string> = {
  none: '',
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
  yearly: 'Anual'
};

const RemindersScreen = ({ userId, onBack, onAdd }: Props) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await ReminderService.getReminders(userId);
    setReminders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handlePay = (item: Reminder) => {
    Alert.alert('Marcar como pagado', `¿Confirmas el pago de ${item.title}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Si, pagado', onPress: async () => {
          await ReminderService.markAsPaid(item);
          loadData();
        } 
      }
    ]);
  };

  const handleDelete = (item: Reminder) => {
    Alert.alert('Eliminar', `¿Deseas borrar el recordatorio de ${item.title}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
          await ReminderService.deleteReminder(item.id, item.notification_id);
          loadData();
        } 
      }
    ]);
  };

  const renderItem = ({ item }: { item: Reminder }) => {
    const isPast = new Date(item.due_date).getTime() < Date.now() && item.is_paid === 0;
    const recurrenceLabel = RECURRENCE_LABELS[item.recurrence || 'none'];

    return (
      <View style={[styles.card, item.is_paid === 1 && styles.cardPaid]}>
        <View style={styles.info}>
          <View style={styles.titleRow}>
              <Text style={[styles.title, item.is_paid === 1 && styles.textPaid]}>{item.title}</Text>
              {recurrenceLabel ? <Text style={styles.badge}>{recurrenceLabel}</Text> : null}
          </View>
          <Text style={styles.date}>{new Date(item.due_date).toLocaleString()}</Text>
          {item.amount !== null && <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>}
          {isPast && <Text style={styles.overdue}>Vencido</Text>}
        </View>
        <View style={styles.actions}>
          {item.is_paid === 0 && (
            <TouchableOpacity style={styles.btnPay} onPress={() => handlePay(item)}>
              <Text style={styles.btnText}>Pagar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.btnDelete} onPress={() => handleDelete(item)}>
            <Text style={styles.btnText}>Borrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recordatorios</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6200EE" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No tienes recordatorios activos</Text>}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={onAdd}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FE' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#FFF' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backIcon: { fontSize: 40, color: '#000' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  list: { padding: 15 },
  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 10, elevation: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPaid: { opacity: 0.6, backgroundColor: '#F0F0F0' },
  info: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  badge: { backgroundColor: '#E0E0E0', fontSize: 10, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, color: '#666', overflow: 'hidden' },
  textPaid: { textDecorationLine: 'line-through', color: '#999' },
  date: { fontSize: 12, color: '#666', marginTop: 4 },
  amount: { fontSize: 14, fontWeight: 'bold', color: '#6200EE', marginTop: 4 },
  overdue: { color: '#FF5252', fontSize: 12, fontWeight: 'bold', marginTop: 4 },
  actions: { gap: 10 },
  btnPay: { backgroundColor: '#2ECC71', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  btnDelete: { backgroundColor: '#FF5252', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#6200EE', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { color: '#FFF', fontSize: 35 }
});

export default RemindersScreen;