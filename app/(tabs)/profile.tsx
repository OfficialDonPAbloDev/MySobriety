import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.name}>Guest User</Text>
          <Text style={styles.email}>Sign in to sync your data</Text>
          <Link href="/(auth)/login" asChild>
            <Pressable style={styles.signInButton}>
              <Text style={styles.signInText}>Sign In / Create Account</Text>
            </Pressable>
          </Link>
        </View>

        {/* Stats Section */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Days Sober</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Check-Ins</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Milestones</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <Pressable style={styles.settingItem}>
            <Text style={styles.settingIcon}>📅</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Sobriety Date</Text>
              <Text style={styles.settingValue}>Not set</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </Pressable>

          <Pressable style={styles.settingItem}>
            <Text style={styles.settingIcon}>🔔</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingValue}>Configure reminders</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </Pressable>

          <Pressable style={styles.settingItem}>
            <Text style={styles.settingIcon}>🎨</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Appearance</Text>
              <Text style={styles.settingValue}>System default</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </Pressable>

          <Pressable style={styles.settingItem}>
            <Text style={styles.settingIcon}>🔒</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Privacy & Security</Text>
              <Text style={styles.settingValue}>Manage your data</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </Pressable>
        </View>

        {/* Support Section */}
        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Support</Text>

          <Pressable style={styles.settingItem}>
            <Text style={styles.settingIcon}>❓</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Help & FAQ</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </Pressable>

          <Pressable style={styles.settingItem}>
            <Text style={styles.settingIcon}>💬</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Send Feedback</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </Pressable>

          <Pressable style={styles.settingItem}>
            <Text style={styles.settingIcon}>📄</Text>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Terms & Privacy Policy</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </Pressable>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>My Sobriety</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>
      </ScrollView>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 40,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  signInButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  signInText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  settingsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#1F2937',
  },
  settingValue: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  settingArrow: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  appVersion: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
});
