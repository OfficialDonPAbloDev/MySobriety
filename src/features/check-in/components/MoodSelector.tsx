import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MOOD_OPTIONS, MoodRating } from '../services/checkInService';

interface MoodSelectorProps {
  value: MoodRating | null;
  onChange: (value: MoodRating) => void;
}

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>How are you feeling today?</Text>
      <View style={styles.optionsContainer}>
        {MOOD_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              value === option.value && styles.optionSelected,
              value === option.value && { borderColor: option.color },
            ]}
            onPress={() => onChange(option.value)}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{option.emoji}</Text>
            <Text
              style={[
                styles.optionLabel,
                value === option.value && styles.optionLabelSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 60,
  },
  optionSelected: {
    backgroundColor: '#EEF2FF',
  },
  emoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  optionLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: '#4F46E5',
    fontWeight: '500',
  },
});
