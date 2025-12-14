import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CheckInForm } from '../../src/features/check-in/components/CheckInForm';
import { useCheckIn } from '../../src/features/check-in/hooks/useCheckIn';
import { MOOD_OPTIONS } from '../../src/features/check-in/services/checkInService';

export default function CheckInScreen() {
  const {
    todayCheckIn,
    hasCheckedInToday,
    streak,
    averageMood,
    isLoading,
    isSubmitting,
    submitCheckIn,
  } = useCheckIn();

  const handleSubmitSuccess = async (input: Parameters<typeof submitCheckIn>[0]) => {
    await submitCheckIn(input);
    Alert.alert(
      'Check-In Complete!',
      'Great job taking care of yourself today. Keep it up!',
      [
        {
          text: 'OK',
          onPress: () => router.push('/(tabs)'),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // If already checked in, show summary
  if (hasCheckedInToday && todayCheckIn) {
    const moodOption = MOOD_OPTIONS.find((m) => m.value === todayCheckIn.mood_rating);

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.completedContainer}>
          <View style={styles.completedHeader}>
            <Text style={styles.completedEmoji}>✓</Text>
            <Text style={styles.completedTitle}>Today's Check-In Complete!</Text>
            <Text style={styles.completedSubtitle}>
              You're doing great. Come back tomorrow to continue your streak.
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Today's Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Mood</Text>
              <View style={styles.summaryValue}>
                <Text style={styles.summaryEmoji}>{moodOption?.emoji}</Text>
                <Text style={styles.summaryText}>{moodOption?.label}</Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Craving Level</Text>
              <Text style={styles.summaryText}>{todayCheckIn.craving_level}/10</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Staying Sober</Text>
              <Text style={[styles.summaryText, todayCheckIn.is_sober ? styles.soberYes : styles.soberNo]}>
                {todayCheckIn.is_sober ? 'Yes' : 'No'}
              </Text>
            </View>

            {todayCheckIn.notes && (
              <View style={styles.notesSection}>
                <Text style={styles.summaryLabel}>Notes</Text>
                <Text style={styles.notesText}>{todayCheckIn.notes}</Text>
              </View>
            )}
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{averageMood.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Avg Mood (7d)</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Check-In</Text>
        <Text style={styles.subtitle}>How are you feeling today?</Text>
        {streak > 0 && (
          <View style={styles.streakBanner}>
            <Text style={styles.streakText}>{streak} day check-in streak!</Text>
          </View>
        )}
      </View>

      <CheckInForm
        onSubmit={handleSubmitSuccess}
        isSubmitting={isSubmitting}
        initialValues={todayCheckIn ? {
          mood_rating: todayCheckIn.mood_rating,
          craving_level: todayCheckIn.craving_level,
          notes: todayCheckIn.notes,
          triggers: todayCheckIn.triggers || [],
          coping_strategies_used: todayCheckIn.coping_strategies_used || [],
          is_sober: todayCheckIn.is_sober,
        } : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    padding: 20,
    paddingBottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  streakBanner: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  streakText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  completedContainer: {
    flex: 1,
    padding: 20,
  },
  completedHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  completedEmoji: {
    fontSize: 48,
    color: '#10B981',
    marginBottom: 16,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  completedSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryEmoji: {
    fontSize: 20,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  soberYes: {
    color: '#10B981',
  },
  soberNo: {
    color: '#EF4444',
  },
  notesSection: {
    paddingTop: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    marginTop: 8,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
});
