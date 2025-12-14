import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface CravingSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const getCravingLabel = (value: number): string => {
  if (value === 0) return 'No cravings';
  if (value <= 2) return 'Mild';
  if (value <= 4) return 'Moderate';
  if (value <= 6) return 'Strong';
  if (value <= 8) return 'Very Strong';
  return 'Overwhelming';
};

const getCravingColor = (value: number): string => {
  if (value <= 2) return '#10B981';
  if (value <= 4) return '#22C55E';
  if (value <= 6) return '#EAB308';
  if (value <= 8) return '#F97316';
  return '#EF4444';
};

export function CravingSlider({ value, onChange }: CravingSliderProps) {
  const label = getCravingLabel(value);
  const color = getCravingColor(value);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Craving Level</Text>
        <View style={styles.valueContainer}>
          <Text style={[styles.value, { color }]}>{value}</Text>
          <Text style={styles.valueLabel}>/10</Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <TouchableOpacity
            key={num}
            style={[
              styles.levelButton,
              value === num && styles.levelButtonSelected,
              value === num && { backgroundColor: getCravingColor(num) },
            ]}
            onPress={() => onChange(num)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.levelButtonText,
                value === num && styles.levelButtonTextSelected,
              ]}
            >
              {num}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.currentLabelCenter, { color }]}>{label}</Text>
    </View>
  );
}

// Alias for backwards compatibility
export const CravingSliderFallback = CravingSlider;

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  valueLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 2,
  },
  currentLabelCenter: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  levelButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelButtonSelected: {
    borderWidth: 0,
  },
  levelButtonText: {
    fontSize: 12,
    color: '#6B7280',
  },
  levelButtonTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
