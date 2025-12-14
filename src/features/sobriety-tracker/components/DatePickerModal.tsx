import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  Pressable,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  currentDate?: Date;
  title?: string;
  subtitle?: string;
}

export function DatePickerModal({
  visible,
  onClose,
  onDateSelect,
  currentDate,
  title = 'Set Sobriety Date',
  subtitle = 'When did your sobriety journey begin?',
}: DatePickerModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(currentDate || new Date());
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'set' && date) {
        setSelectedDate(date);
      }
    } else if (date) {
      setSelectedDate(date);
    }
  };

  const handleConfirm = () => {
    onDateSelect(selectedDate);
    onClose();
  };

  const handleCancel = () => {
    setSelectedDate(currentDate || new Date());
    onClose();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Maximum date is today (can't set future sobriety date)
  const maxDate = new Date();

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleCancel} />

        <View style={styles.modalContainer}>
          <View style={styles.handle} />

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {/* Selected date display */}
          <TouchableOpacity
            style={styles.dateDisplay}
            onPress={() => Platform.OS === 'android' && setShowPicker(true)}
          >
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            {Platform.OS === 'android' && (
              <Text style={styles.tapToChange}>Tap to change</Text>
            )}
          </TouchableOpacity>

          {/* Date picker */}
          {showPicker && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={maxDate}
                style={styles.picker}
              />
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>Set Date</Text>
            </TouchableOpacity>
          </View>

          {/* Quick select options */}
          <View style={styles.quickSelectContainer}>
            <Text style={styles.quickSelectLabel}>Quick select:</Text>
            <View style={styles.quickSelectButtons}>
              <TouchableOpacity
                style={styles.quickSelectButton}
                onPress={() => setSelectedDate(new Date())}
              >
                <Text style={styles.quickSelectText}>Today</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickSelectButton}
                onPress={() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  setSelectedDate(yesterday);
                }}
              >
                <Text style={styles.quickSelectText}>Yesterday</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickSelectButton}
                onPress={() => {
                  const lastWeek = new Date();
                  lastWeek.setDate(lastWeek.getDate() - 7);
                  setSelectedDate(lastWeek);
                }}
              >
                <Text style={styles.quickSelectText}>1 Week Ago</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  dateDisplay: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  tapToChange: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  pickerContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  picker: {
    height: 200,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  quickSelectContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  quickSelectLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  quickSelectButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickSelectButton: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  quickSelectText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4F46E5',
  },
});
