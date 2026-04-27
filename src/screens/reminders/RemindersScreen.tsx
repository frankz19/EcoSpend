import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReminderService, Reminder, Recurrence } from '../../services/reminderService';

interface Props {
  userId: number;
  onBack: () => void;
  onAdd: () => void;
  onEdit: (reminder: Reminder) => void;
}

const RECURRENCE_LABEL: Record<Recurrence, string> = {
  semanal: 'Semanal',
  quincenal: 'Quincenal',
  mensual: 'Mensual',
  anual: 'Anual',
};

const RemindersScreen = ({ userId, onBack, onAdd, onEdit }: Props) => {
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
      { text: 'Sí, pagado', onPress: async () => {
          await ReminderService.markAsPaid(item.id, item.notification_id);
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

  const handleReschedule = (item: Reminder) => {
    if (item.recurrence) {
      const label = RECURRENCE_LABEL[item.recurrence];
      Alert.alert(
        'Reprogramar',
        `¿Reprogramar "${item.title}" con ciclo ${label}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Reprogramar', onPress: async () => {
              const nextDate = await ReminderService.rescheduleReminder(item);
              Alert.alert('Reprogramado', `Próximo aviso: ${nextDate.toLocaleDateString()}`);
              loadData();
            }
          },
        ]
      );
    } else {
      // Sin recurrencia: pedir al usuario que elija un ciclo
      Alert.alert(
        'Reprogramar',
        `¿Con qué frecuencia quieres repetir "${item.title}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Semanal',   onPress: () => doReschedule(item, 'semanal') },
          { text: 'Quincenal', onPress: () => doReschedule(item, 'quincenal') },
          { text: 'Mensual',   onPress: () => doReschedule(item, 'mensual') },
          { text: 'Anual',     onPress: () => doReschedule(item, 'anual') },
        ]
      );
    }
  };

  const doReschedule = async (item: Reminder, recurrence: Recurrence) => {
    const withRecurrence = { ...item, recurrence };
    const nextDate = await ReminderService.rescheduleReminder(withRecurrence);
    Alert.alert('Reprogramado', `Próximo aviso: ${nextDate.toLocaleDateString()}`);
    loadData();
  };

  const renderItem = ({ item }: { item: Reminder }) => {
    const isPast = new Date(item.due_date).getTime() < Date.now() && item.is_paid === 0;
    const isAgenda = item.reminder_type === 'agenda';

    return (
      <View style={[styles.card, item.is_paid === 1 && styles.cardPaid, isPast && styles.cardOverdue]}>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, item.is_paid === 1 && styles.textPaid]}>{item.title}</Text>
            <View style={[styles.typeBadge, isAgenda ? styles.badgeAgenda : styles.badgeAlarma]}>
              <Text style={styles.badgeText}>{isAgenda ? '📅 Agenda' : '🔔 Alarma'}</Text>
            </View>
          </View>
          <Text style={styles.date}>{new Date(item.due_date).toLocaleString()}</Text>
          {item.amount != null && item.amount > 0 && (
            <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
          )}
          {item.recurrence && (
            <Text style={styles.recurrenceTag}>↺ {RECURRENCE_LABEL[item.recurrence]}</Text>
          )}
          {isPast && <Text style={styles.overdue}>¡Vencido!</Text>}
        </View>

        <View style={styles.actions}>
          {item.is_paid === 0 && !isAgenda && (
            <TouchableOpacity style={styles.btnPay} onPress={() => handlePay(item)}>
              <Text style={styles.btnText}>Pagar</Text>
            </TouchableOpacity>
          )}
          {item.is_paid === 0 && (
            <TouchableOpacity style={styles.btnEdit} onPress={() => onEdit(item)}>
              <Text style={styles.btnText}>Editar</Text>
            </TouchableOpacity>
          )}
          {isPast && (
            <TouchableOpacity style={styles.btnReschedule} onPress={() => handleReschedule(item)}>
              <Text style={styles.btnText}>Reprogramar</Text>
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
  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 15, marginBottom: 10, elevation: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardPaid: { opacity: 0.6, backgroundColor: '#F0F0F0' },
  cardOverdue: { borderLeftWidth: 3, borderLeftColor: '#FF5252' },
  info: { flex: 1, marginRight: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  textPaid: { textDecorationLine: 'line-through', color: '#999' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeAlarma: { backgroundColor: '#FFF3E0' },
  badgeAgenda: { backgroundColor: '#E8F5E9' },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  date: { fontSize: 12, color: '#666', marginTop: 4 },
  amount: { fontSize: 14, fontWeight: 'bold', color: '#6200EE', marginTop: 4 },
  recurrenceTag: { fontSize: 11, color: '#6200EE', marginTop: 3 },
  overdue: { color: '#FF5252', fontSize: 12, fontWeight: 'bold', marginTop: 4 },
  actions: { gap: 8, alignItems: 'stretch' },
  btnPay: { backgroundColor: '#2ECC71', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  btnEdit: { backgroundColor: '#2196F3', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  btnReschedule: { backgroundColor: '#FF9800', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  btnDelete: { backgroundColor: '#FF5252', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#6200EE', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { color: '#FFF', fontSize: 35 },
});

export default RemindersScreen;
