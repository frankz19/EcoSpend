import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ReminderService, ReminderType, Recurrence, Reminder } from '../../services/reminderService';

interface Props {
  userId: number;
  onBack: () => void;
  reminder?: Reminder;
}

const RECURRENCE_OPTIONS: { label: string; value: Recurrence | null }[] = [
  { label: 'Sin repetir', value: null },
  { label: 'Semanal',     value: 'semanal' },
  { label: 'Quincenal',   value: 'quincenal' },
  { label: 'Mensual',     value: 'mensual' },
  { label: 'Anual',       value: 'anual' },
];

const AddReminderScreen = ({ userId, onBack, reminder }: Props) => {
  const isEditing = !!reminder;
  const [title, setTitle] = useState(reminder?.title ?? '');
  const [amount, setAmount] = useState(reminder?.amount != null && reminder.amount > 0 ? String(reminder.amount) : '');
  const [date, setDate] = useState(reminder ? new Date(reminder.due_date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reminderType, setReminderType] = useState<ReminderType>(reminder?.reminder_type ?? 'alarma');
  const [recurrence, setRecurrence] = useState<Recurrence | null>(reminder?.recurrence ?? null);

  const handleSave = async () => {
    if (!title) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }
    if (!isEditing && date.getTime() <= Date.now()) {
      Alert.alert('Error', 'La fecha debe ser en el futuro');
      return;
    }

    const parsedAmount = amount ? parseFloat(amount) : 0;
    if (isEditing) {
      await ReminderService.updateReminder(reminder.id, reminder.notification_id, title, parsedAmount, date, reminderType, recurrence);
    } else {
      await ReminderService.addReminder(userId, title, parsedAmount, date, reminderType, recurrence);
    }
    onBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Tipo */}
        <Text style={styles.label}>Tipo</Text>
        <View style={styles.segmentRow}>
          {(['alarma', 'agenda'] as ReminderType[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.segment, reminderType === t && styles.segmentActive]}
              onPress={() => setReminderType(t)}
            >
              <Text style={[styles.segmentText, reminderType === t && styles.segmentTextActive]}>
                {t === 'alarma' ? '🔔 Alarma' : '📅 Agenda'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Servicio o Evento</Text>
        <TextInput
          style={styles.input}
          placeholder={reminderType === 'agenda' ? 'Ej: Reunión, Médico...' : 'Ej: Luz, Agua, Internet...'}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Monto estimado (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.label}>Fecha y Hora del aviso</Text>
        <View style={styles.dateTimeContainer}>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowTimePicker(true)}>
            <Text style={styles.dateText}>
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            display="default"
            onChange={(event, selectedDate) => {
              setShowTimePicker(Platform.OS === 'ios');
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        {/* Recurrencia */}
        <Text style={styles.label}>Repetir</Text>
        <View style={styles.recurrenceRow}>
          {RECURRENCE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={String(opt.value)}
              style={[styles.chip, recurrence === opt.value && styles.chipActive]}
              onPress={() => setRecurrence(opt.value)}
            >
              <Text style={[styles.chipText, recurrence === opt.value && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{isEditing ? 'Guardar cambios' : 'Programar'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#FFF' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backIcon: { fontSize: 40, color: '#000' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  label: { fontSize: 14, color: '#666', marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: '#F0F0F0', padding: 15, borderRadius: 10, fontSize: 16 },
  dateTimeContainer: { flexDirection: 'row', gap: 10 },
  dateBtn: { flex: 1, backgroundColor: '#F0F0F0', padding: 15, borderRadius: 10, alignItems: 'center' },
  dateText: { fontSize: 16, color: '#333', fontWeight: 'bold' },
  segmentRow: { flexDirection: 'row', gap: 10 },
  segment: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#F0F0F0', alignItems: 'center' },
  segmentActive: { backgroundColor: '#6200EE' },
  segmentText: { fontSize: 14, fontWeight: 'bold', color: '#666' },
  segmentTextActive: { color: '#FFF' },
  recurrenceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F0F0', borderWidth: 1, borderColor: '#DDD' },
  chipActive: { backgroundColor: '#EDE7F6', borderColor: '#6200EE' },
  chipText: { fontSize: 13, color: '#666' },
  chipTextActive: { color: '#6200EE', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#6200EE', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 40, marginBottom: 30 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default AddReminderScreen;
