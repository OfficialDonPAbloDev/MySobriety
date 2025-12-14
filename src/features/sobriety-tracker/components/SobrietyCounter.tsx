import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SobrietyTime } from '../utils/timeCalculations';

interface SobrietyCounterProps {
  sobrietyTime: SobrietyTime | null;
  startDate?: Date;
  onSetDate?: () => void;
  isLoading?: boolean;
}

interface CounterItemProps {
  value: number;
  label: string;
  size?: 'large' | 'small';
}

function CounterItem({ value, label, size = 'large' }: CounterItemProps) {
  const isLarge = size === 'large';

  return (
    <View style={styles.counterItem}>
      <Text style={isLarge ? styles.counterNumber : styles.counterNumberSmall}>
        {value.toString().padStart(2, '0')}
      </Text>
      <Text style={isLarge ? styles.counterUnit : styles.counterUnitSmall}>{label}</Text>
    </View>
  );
}

export function SobrietyCounter({
  sobrietyTime,
  startDate,
  onSetDate,
  isLoading,
}: SobrietyCounterProps) {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!sobrietyTime || !startDate) {
    return (
      <TouchableOpacity style={styles.container} onPress={onSetDate} activeOpacity={0.8}>
        <Text style={styles.emptyTitle}>Start Your Journey</Text>
        <Text style={styles.emptySubtitle}>Tap to set your sobriety date</Text>
      </TouchableOpacity>
    );
  }

  const formattedStartDate = startDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <TouchableOpacity style={styles.container} onPress={onSetDate} activeOpacity={0.9}>
      <Text style={styles.label}>You've been sober for</Text>

      {/* Main counter - Years, Months, Days */}
      <View style={styles.counterRow}>
        <CounterItem value={sobrietyTime.years} label="Years" size="large" />
        <CounterItem value={sobrietyTime.months} label="Months" size="large" />
        <CounterItem value={sobrietyTime.days} label="Days" size="large" />
      </View>

      {/* Secondary counter - Hours, Minutes, Seconds */}
      <View style={styles.counterRow}>
        <CounterItem value={sobrietyTime.hours} label="Hours" size="small" />
        <CounterItem value={sobrietyTime.minutes} label="Min" size="small" />
        <CounterItem value={sobrietyTime.seconds} label="Sec" size="small" />
      </View>

      {/* Start date */}
      <Text style={styles.startDate}>Since {formattedStartDate}</Text>

      {/* Total days highlight */}
      <View style={styles.totalDaysContainer}>
        <Text style={styles.totalDaysNumber}>{sobrietyTime.totalDays.toLocaleString()}</Text>
        <Text style={styles.totalDaysLabel}>total days</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingText: {
    fontSize: 18,
    color: '#E0E7FF',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#C7D2FE',
  },
  label: {
    fontSize: 16,
    color: '#E0E7FF',
    marginBottom: 16,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  counterItem: {
    alignItems: 'center',
    marginHorizontal: 12,
    minWidth: 60,
  },
  counterNumber: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#ffffff',
    fontVariant: ['tabular-nums'],
  },
  counterUnit: {
    fontSize: 12,
    color: '#C7D2FE',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  counterNumberSmall: {
    fontSize: 28,
    fontWeight: '600',
    color: '#ffffff',
    fontVariant: ['tabular-nums'],
  },
  counterUnitSmall: {
    fontSize: 10,
    color: '#C7D2FE',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  startDate: {
    fontSize: 14,
    color: '#C7D2FE',
    marginTop: 8,
  },
  totalDaysContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  totalDaysNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  totalDaysLabel: {
    fontSize: 14,
    color: '#C7D2FE',
  },
});
