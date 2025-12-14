import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Emergency hotlines data
const emergencyHotlines = [
  {
    id: '1',
    name: 'SAMHSA National Helpline',
    phone: '1-800-662-4357',
    description: 'Free, confidential, 24/7 treatment referral and information',
    available: '24/7',
  },
  {
    id: '2',
    name: 'National Suicide Prevention Lifeline',
    phone: '988',
    description: 'Free and confidential support for people in distress',
    available: '24/7',
  },
  {
    id: '3',
    name: 'Crisis Text Line',
    phone: 'Text HOME to 741741',
    description: 'Free crisis support via text message',
    available: '24/7',
  },
  {
    id: '4',
    name: 'Alcoholics Anonymous',
    phone: '1-800-839-1686',
    description: 'AA meeting information and support',
    available: '24/7',
  },
];

export default function ResourcesScreen() {
  const handleCall = (phone: string) => {
    // Extract digits only for calling
    const phoneNumber = phone.replace(/[^0-9]/g, '');
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Emergency Help</Text>
          <Text style={styles.subtitle}>You're not alone. Help is available 24/7.</Text>
        </View>

        {/* Emergency Banner */}
        <View style={styles.emergencyBanner}>
          <Text style={styles.emergencyIcon}>🆘</Text>
          <View style={styles.emergencyContent}>
            <Text style={styles.emergencyTitle}>In Crisis?</Text>
            <Text style={styles.emergencyText}>
              If you're experiencing a medical emergency, call 911 immediately.
            </Text>
          </View>
        </View>

        {/* Hotlines Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crisis Hotlines</Text>
          {emergencyHotlines.map((hotline) => (
            <View key={hotline.id} style={styles.hotlineCard}>
              <View style={styles.hotlineInfo}>
                <Text style={styles.hotlineName}>{hotline.name}</Text>
                <Text style={styles.hotlineDescription}>{hotline.description}</Text>
                <Text style={styles.hotlineAvailable}>Available: {hotline.available}</Text>
              </View>
              <Pressable style={styles.callButton} onPress={() => handleCall(hotline.phone)}>
                <Text style={styles.callIcon}>📞</Text>
                <Text style={styles.callText}>{hotline.phone}</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Personal Contacts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Emergency Contacts</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyText}>No personal contacts added yet</Text>
            <Pressable style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Add Contact</Text>
            </Pressable>
          </View>
        </View>

        {/* Coping Strategies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Coping Strategies</Text>
          <View style={styles.strategyCard}>
            <Text style={styles.strategyIcon}>🧘</Text>
            <View style={styles.strategyContent}>
              <Text style={styles.strategyTitle}>Deep Breathing</Text>
              <Text style={styles.strategyText}>
                Take 5 slow, deep breaths. Inhale for 4 seconds, hold for 4, exhale for 4.
              </Text>
            </View>
          </View>
          <View style={styles.strategyCard}>
            <Text style={styles.strategyIcon}>🚶</Text>
            <View style={styles.strategyContent}>
              <Text style={styles.strategyTitle}>Go for a Walk</Text>
              <Text style={styles.strategyText}>
                A brief walk can help clear your mind and reduce cravings.
              </Text>
            </View>
          </View>
          <View style={styles.strategyCard}>
            <Text style={styles.strategyIcon}>💬</Text>
            <View style={styles.strategyContent}>
              <Text style={styles.strategyTitle}>Call Someone</Text>
              <Text style={styles.strategyText}>
                Reach out to a friend, sponsor, or family member you trust.
              </Text>
            </View>
          </View>
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
    marginBottom: 24,
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
  emergencyBanner: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  emergencyIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 4,
  },
  emergencyText: {
    fontSize: 14,
    color: '#7F1D1D',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  hotlineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  hotlineInfo: {
    marginBottom: 12,
  },
  hotlineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  hotlineDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  hotlineAvailable: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  callButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  callText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addButtonText: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  strategyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  strategyIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  strategyContent: {
    flex: 1,
  },
  strategyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  strategyText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
