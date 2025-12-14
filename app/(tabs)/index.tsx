import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { testSupabaseConnection } from '../../src/utils/testSupabaseConnection';
import { SobrietyCounter } from '../../src/features/sobriety-tracker/components/SobrietyCounter';
import { MilestoneCard } from '../../src/features/sobriety-tracker/components/MilestoneCard';
import { DatePickerModal } from '../../src/features/sobriety-tracker/components/DatePickerModal';
import { useSobrietyTracker } from '../../src/features/sobriety-tracker/hooks/useSobrietyTracker';
import { useCheckIn } from '../../src/features/check-in/hooks/useCheckIn';

const MOTIVATIONAL_QUOTES = [
  {
    text: "The secret of change is to focus all your energy not on fighting the old, but on building the new.",
    author: "Socrates"
  },
  {
    text: "Recovery is not a race. You don't have to feel guilty if it takes you longer than you thought it would.",
    author: "Unknown"
  },
  {
    text: "One day at a time. This is enough. Do not look back and grieve over the past, for it is gone.",
    author: "Ida Scott Taylor"
  },
  {
    text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Nelson Mandela"
  },
  {
    text: "You are stronger than you know. More capable than you ever dreamed.",
    author: "Unknown"
  },
];

export default function HomeScreen() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dailyQuote] = useState(() =>
    MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
  );

  const {
    sobrietyRecord,
    sobrietyTime,
    milestones,
    nextMilestone,
    daysUntilNextMilestone,
    isLoading: sobrietyLoading,
    setSobrietyDate,
  } = useSobrietyTracker();

  const {
    hasCheckedInToday,
    streak: checkInStreak,
  } = useCheckIn();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('testing');
    try {
      const result = await testSupabaseConnection();
      setConnectionStatus(result.success ? 'success' : 'error');
    } catch {
      setConnectionStatus('error');
    }
  };

  const handleSetSobrietyDate = async (date: Date) => {
    try {
      await setSobrietyDate(date);
    } catch (err) {
      console.error('Failed to set sobriety date:', err);
    }
  };

  const startDate = sobrietyRecord ? new Date(sobrietyRecord.start_date) : undefined;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.title}>My Sobriety</Text>
        </View>

        {/* Sobriety Counter */}
        <SobrietyCounter
          sobrietyTime={sobrietyTime}
          startDate={startDate}
          onSetDate={() => setShowDatePicker(true)}
          isLoading={sobrietyLoading}
        />

        {/* Milestones - only show if tracking has started */}
        {sobrietyTime && sobrietyTime.totalDays >= 0 && (
          <MilestoneCard
            milestones={milestones}
            nextMilestone={nextMilestone}
            daysUntilNext={daysUntilNextMilestone}
          />
        )}

        {/* Daily Quote Card */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>"{dailyQuote.text}"</Text>
          <Text style={styles.quoteAuthor}>- {dailyQuote.author}</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={[styles.actionButton, hasCheckedInToday && styles.actionButtonCompleted]}
            onPress={() => router.push('/(tabs)/check-in')}
          >
            <View style={styles.actionContent}>
              <Text style={styles.actionEmoji}>{hasCheckedInToday ? '✓' : '📝'}</Text>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionText}>Daily Check-In</Text>
                {hasCheckedInToday ? (
                  <Text style={styles.actionSubtext}>Completed today</Text>
                ) : (
                  <Text style={styles.actionSubtext}>How are you feeling?</Text>
                )}
              </View>
            </View>
            {checkInStreak > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakText}>{checkInStreak} day streak</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/goals')}
          >
            <View style={styles.actionContent}>
              <Text style={styles.actionEmoji}>🎯</Text>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionText}>My Goals</Text>
                <Text style={styles.actionSubtext}>Track your recovery goals</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/triggers')}
          >
            <View style={styles.actionContent}>
              <Text style={styles.actionEmoji}>⚡</Text>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionText}>Log a Trigger</Text>
                <Text style={styles.actionSubtext}>Track and manage triggers</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/resources')}
          >
            <View style={styles.actionContent}>
              <Text style={styles.actionEmoji}>🆘</Text>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionText}>Emergency Resources</Text>
                <Text style={styles.actionSubtext}>Get help when you need it</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Connection Status (Dev Only) */}
        {__DEV__ && (
          <TouchableOpacity style={styles.statusCard} onPress={checkConnection}>
            <Text style={styles.statusTitle}>Backend Status</Text>
            {connectionStatus === 'testing' ? (
              <View style={styles.statusRow}>
                <ActivityIndicator size="small" color="#4F46E5" />
                <Text style={styles.statusText}>Testing connection...</Text>
              </View>
            ) : connectionStatus === 'success' ? (
              <View style={styles.statusRow}>
                <Text style={styles.statusSuccess}>Connected</Text>
              </View>
            ) : (
              <View style={styles.statusRow}>
                <Text style={styles.statusError}>Connection failed - Tap to retry</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onDateSelect={handleSetSobrietyDate}
        currentDate={startDate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  quoteCard: {
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
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 12,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  actionsCard: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonCompleted: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  actionSubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  streakBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
    marginLeft: 36,
  },
  streakText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  statusSuccess: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  statusError: {
    fontSize: 14,
    color: '#EF4444',
  },
});
