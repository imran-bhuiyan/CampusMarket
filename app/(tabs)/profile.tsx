//Profile

import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Building2, Camera, ChevronRight, Edit3, Key, LogOut, Mail, Phone, Shield, User, X } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar, Button, Card, Divider, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/services/api';
import authService from '@/services/auth.service';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, logout, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Profile Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
  });
  const [saving, setSaving] = useState(false);

  // Change Password Modal State
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to upload a profile picture.');
      return;
    }

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
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your camera to take a profile picture.');
      return;
    }

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

  const handleWebFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Alert.alert('Error', 'Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Alert.alert('Error', 'Image must be less than 5MB');
      return;
    }

    const uri = URL.createObjectURL(file);
    await uploadImage(uri);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const showImageOptions = () => {
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
    } else {
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

  // ---------- Edit Profile Handlers ----------

  const openEditModal = () => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || '',
    });
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    if (!editForm.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    try {
      setSaving(true);
      const updatedUser = await authService.updateProfile({
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim() || undefined,
        department: editForm.department.trim(),
      });
      updateUser(updatedUser);
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      console.error('Update profile error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // ---------- Change Password Handlers ----------

  const openPasswordModal = () => {
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordModalVisible(true);
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword) {
      Alert.alert('Error', 'Current password is required');
      return;
    }
    if (!passwordForm.newPassword) {
      Alert.alert('Error', 'New password is required');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setChangingPassword(true);
      await authService.updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordModalVisible(false);
      Alert.alert('Success', 'Password changed successfully!');
    } catch (error: any) {
      console.error('Change password error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
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
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={{ fontWeight: '600', color: theme.colors.onBackground }}>
              Account Information
            </Text>
            <Button mode="text" compact onPress={openEditModal} icon={() => <Edit3 size={16} color={theme.colors.primary} />}>
              Edit
            </Button>
          </View>

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
                <Phone size={20} color={theme.colors.outline} />
              </View>
              <View style={styles.infoContent}>
                <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 2 }}>
                  Phone
                </Text>
                <Text variant="bodyLarge" style={{ color: theme.colors.onBackground, fontWeight: '500' }}>
                  {user?.phone || 'Not provided'}
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
            <Pressable onPress={openPasswordModal}>
              <Card.Content style={styles.actionContent}>
                <View style={styles.actionLeft}>
                  <Key size={20} color={theme.colors.outline} />
                  <Text variant="bodyMedium" style={{ color: theme.colors.onBackground, marginLeft: 12 }}>
                    Change Password
                  </Text>
                </View>
                <ChevronRight size={20} color={theme.colors.outline} />
              </Card.Content>
            </Pressable>
          </Card>

          <Card style={[styles.actionCard, { backgroundColor: theme.colors.surface, marginTop: 8 }]} mode="outlined">
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

      {/* ========== Edit Profile Modal ========== */}
      <Modal visible={editModalVisible} animationType="slide" transparent onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
                Edit Profile
              </Text>
              <Pressable onPress={() => setEditModalVisible(false)}>
                <X size={24} color={theme.colors.onSurface} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalContent}>
              <TextInput
                label="Name"
                value={editForm.name}
                onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon={() => <User size={20} color={theme.colors.outline} />} />}
              />
              <TextInput
                label="Email"
                value={editForm.email}
                onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                left={<TextInput.Icon icon={() => <Mail size={20} color={theme.colors.outline} />} />}
              />
              <TextInput
                label="Phone"
                value={editForm.phone}
                onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
                mode="outlined"
                keyboardType="phone-pad"
                placeholder="+8801XXXXXXXXX"
                style={styles.input}
                left={<TextInput.Icon icon={() => <Phone size={20} color={theme.colors.outline} />} />}
              />
              <TextInput
                label="Department"
                value={editForm.department}
                onChangeText={(text) => setEditForm({ ...editForm, department: text })}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon={() => <Building2 size={20} color={theme.colors.outline} />} />}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button mode="outlined" onPress={() => setEditModalVisible(false)} style={styles.modalButton}>
                Cancel
              </Button>
              <Button mode="contained" onPress={handleSaveProfile} loading={saving} disabled={saving} style={styles.modalButton}>
                Save Changes
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========== Change Password Modal ========== */}
      <Modal visible={passwordModalVisible} animationType="slide" transparent onRequestClose={() => setPasswordModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
                Change Password
              </Text>
              <Pressable onPress={() => setPasswordModalVisible(false)}>
                <X size={24} color={theme.colors.onSurface} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalContent}>
              <TextInput
                label="Current Password"
                value={passwordForm.currentPassword}
                onChangeText={(text) => setPasswordForm({ ...passwordForm, currentPassword: text })}
                mode="outlined"
                secureTextEntry
                style={styles.input}
                left={<TextInput.Icon icon={() => <Key size={20} color={theme.colors.outline} />} />}
              />
              <TextInput
                label="New Password"
                value={passwordForm.newPassword}
                onChangeText={(text) => setPasswordForm({ ...passwordForm, newPassword: text })}
                mode="outlined"
                secureTextEntry
                style={styles.input}
                left={<TextInput.Icon icon={() => <Key size={20} color={theme.colors.outline} />} />}
              />
              <TextInput
                label="Confirm New Password"
                value={passwordForm.confirmPassword}
                onChangeText={(text) => setPasswordForm({ ...passwordForm, confirmPassword: text })}
                mode="outlined"
                secureTextEntry
                style={styles.input}
                left={<TextInput.Icon icon={() => <Key size={20} color={theme.colors.outline} />} />}
              />
              <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 8 }}>
                Password must be at least 6 characters long.
              </Text>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button mode="outlined" onPress={() => setPasswordModalVisible(false)} style={styles.modalButton}>
                Cancel
              </Button>
              <Button mode="contained" onPress={handleChangePassword} loading={changingPassword} disabled={changingPassword} style={styles.modalButton}>
                Update Password
              </Button>
            </View>
          </View>
        </View>
      </Modal>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  actionLeft: {
    flexDirection: 'row',
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalContent: {
    padding: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalButton: {
    flex: 1,
  },
  input: {
    marginBottom: 16,
  },
});
