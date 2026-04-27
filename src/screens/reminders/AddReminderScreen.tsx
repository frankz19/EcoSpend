import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ReminderService } from '../../services/reminderService';

interface Props {
  userId: number;
  onBack: () => void;
}

const AddReminderScreen = ({ userId, onBack }: Props) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = async () => {
    if (!title) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }
    if (date.getTime() <= Date.now()) {
      Alert.alert('Error', 'La fecha debe ser en el futuro');
      return;
    }

    const parsedAmount = amount ? parseFloat(amount) : 0;
    
    await ReminderService.addReminder(userId, title, parsedAmount, date);
    onBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nuevo Recordatorio</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Servicio o Pago</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Luz, Agua, Internet..."
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

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Programar Alarma</Text>
        </TouchableOpacity>
      </View>
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
  saveBtn: { backgroundColor: '#6200EE', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 40 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});

export default AddReminderScreen;