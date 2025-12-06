// ============================================
// CampusMarket - Profile Screen
// ============================================

import { Building2, ChevronRight, LogOut, Mail, Shield } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Divider, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.headerTitle}>
            Profile
          </Text>
        </View>

        {/* User Info Card */}
        <Card style={styles.userCard} mode="elevated">
          <Card.Content style={styles.userCardContent}>
            <Avatar.Text
              size={72}
              label={user?.name ? getInitials(user.name) : 'U'}
              style={styles.avatar}
            />
            <Text variant="headlineSmall" style={styles.userName}>
              {user?.name || 'Student'}
            </Text>
            <View style={styles.roleChip}>
              <Shield size={14} color={Colors.light.tint} />
              <Text variant="bodySmall" style={styles.roleText}>
                {user?.role === 'admin' ? 'Admin' : 'Student'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Info Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Account Information
          </Text>
          
          <Card style={styles.infoCard} mode="outlined">
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Mail size={20} color={Colors.light.icon} />
              </View>
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={styles.infoLabel}>
                  Email
                </Text>
                <Text variant="bodyLarge" style={styles.infoValue}>
                  {user?.email || 'Not available'}
                </Text>
              </View>
            </View>
            
            <Divider />
            
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Building2 size={20} color={Colors.light.icon} />
              </View>
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={styles.infoLabel}>
                  Department
                </Text>
                <Text variant="bodyLarge" style={styles.infoValue}>
                  {user?.department || 'Not specified'}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Quick Actions
          </Text>
          
          <Card style={styles.actionCard} mode="outlined">
            <Card.Content style={styles.actionContent}>
              <Text variant="bodyMedium" style={styles.actionText}>
                My Listings
              </Text>
              <ChevronRight size={20} color={Colors.light.icon} />
            </Card.Content>
          </Card>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <Button
            mode="outlined"
            onPress={handleLogout}
            icon={() => <LogOut size={18} color="#d32f2f" />}
            textColor="#d32f2f"
            style={styles.logoutButton}
            contentStyle={styles.logoutButtonContent}
          >
            Sign Out
          </Button>
        </View>

        {/* App Version */}
        <Text variant="bodySmall" style={styles.version}>
          CampusMarket v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  userCard: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  userCardContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    backgroundColor: Colors.light.tint,
    marginBottom: 12,
  },
  userName: {
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    color: Colors.light.tint,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: Colors.light.icon,
    marginBottom: 2,
  },
  infoValue: {
    color: Colors.light.text,
    fontWeight: '500',
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  actionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionText: {
    color: Colors.light.text,
  },
  logoutSection: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  logoutButton: {
    borderColor: '#d32f2f',
    borderRadius: 12,
  },
  logoutButtonContent: {
    paddingVertical: 8,
  },
  version: {
    textAlign: 'center',
    color: Colors.light.icon,
    marginBottom: 24,
  },
});
