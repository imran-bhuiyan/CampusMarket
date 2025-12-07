//Profile

import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Building2, Camera, ChevronRight, LogOut, Mail, Shield } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, Button, Card, Divider, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/services/api';
import authService from '@/services/auth.service';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, logout, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    await logout();
  };

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to upload a profile picture.');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your camera to take a profile picture.');
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);
      const updatedUser = await authService.uploadProfilePicture(uri);
      updateUser(updatedUser);
      Alert.alert('Success', 'Profile picture updated!');
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  // Web file input handler
  const handleWebFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      Alert.alert('Error', 'Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      Alert.alert('Error', 'Image must be less than 5MB');
      return;
    }

    // Create a blob URL for the file
    const uri = URL.createObjectURL(file);
    await uploadImage(uri);
    
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const showImageOptions = () => {
    if (Platform.OS === 'web') {
      // On web, trigger the hidden file input
      fileInputRef.current?.click();
    } else {
      // On native, show the action sheet
      Alert.alert(
        'Change Profile Picture',
        'Choose an option',
        [
          { text: 'Take Photo', onPress: takePhoto },
          { text: 'Choose from Library', onPress: pickImage },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const getProfileImageUrl = () => {
    if (user?.profilePicture) {
      return `${API_BASE_URL}${user.profilePicture}`;
    }
    return null;
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Hidden file input for web */}
      {Platform.OS === 'web' && (
        <input
          ref={fileInputRef as any}
          type="file"
          accept="image/*"
          onChange={handleWebFileSelect as any}
          style={{ display: 'none' }}
        />
      )}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.onBackground }}>
            Profile
          </Text>
        </View>

        {/* User Info Card */}
        <Card style={[styles.userCard, { backgroundColor: theme.colors.surface }]} mode="elevated">
          <Card.Content style={styles.userCardContent}>
            {/* Profile Picture with Edit Button */}
            <Pressable onPress={showImageOptions} style={styles.avatarContainer}>
              {getProfileImageUrl() ? (
                <Image
                  source={{ uri: getProfileImageUrl()! }}
                  style={styles.profileImage}
                  contentFit="cover"
                />
              ) : (
                <Avatar.Text
                  size={88}
                  label={user?.name ? getInitials(user.name) : 'U'}
                  style={{ backgroundColor: theme.colors.primary }}
                />
              )}
              {/* Camera Icon Overlay */}
              <View style={[styles.cameraButton, { backgroundColor: theme.colors.primary }]}>
                {uploading ? (
                  <ActivityIndicator size={16} color="#fff" />
                ) : (
                  <Camera size={16} color="#fff" />
                )}
              </View>
            </Pressable>
            <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.onBackground, marginTop: 12 }}>
              {user?.name || 'Student'}
            </Text>
            <View style={[styles.roleChip, { backgroundColor: theme.colors.primaryContainer }]}>
              <Shield size={14} color={theme.colors.primary} />
              <Text variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: '500' }}>
                {user?.role === 'admin' ? 'Admin' : 'Student'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Info Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={{ fontWeight: '600', color: theme.colors.onBackground, marginBottom: 12 }}>
            Account Information
          </Text>
          
          <Card style={[styles.infoCard, { backgroundColor: theme.colors.surface }]} mode="outlined">
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Mail size={20} color={theme.colors.outline} />
              </View>
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 2 }}>
                  Email
                </Text>
                <Text variant="bodyLarge" style={{ color: theme.colors.onBackground, fontWeight: '500' }}>
                  {user?.email || 'Not available'}
                </Text>
              </View>
            </View>
            
            <Divider />
            
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Building2 size={20} color={theme.colors.outline} />
              </View>
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 2 }}>
                  Department
                </Text>
                <Text variant="bodyLarge" style={{ color: theme.colors.onBackground, fontWeight: '500' }}>
                  {user?.department || 'Not specified'}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={{ fontWeight: '600', color: theme.colors.onBackground, marginBottom: 12 }}>
            Quick Actions
          </Text>
          
          <Card style={[styles.actionCard, { backgroundColor: theme.colors.surface }]} mode="outlined">
            <Card.Content style={styles.actionContent}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onBackground }}>
                My Listings
              </Text>
              <ChevronRight size={20} color={theme.colors.outline} />
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
        <Text variant="bodySmall" style={{ textAlign: 'center', color: theme.colors.outline, marginBottom: 24 }}>
          CampusMarket v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  userCard: {
    margin: 16,
    borderRadius: 16,
  },
  userCardContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  infoCard: {
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  actionCard: {
    borderRadius: 12,
  },
  actionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
});
