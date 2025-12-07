//Register Screen

import { Link } from 'expo-router';
import { Building2, ChevronDown, Lock, Mail, ShoppingBag, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, HelperText, Menu, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// Make sure this hook exists in your project, or replace with mock logic
import { useAuth } from '@/contexts/AuthContext';

// UIU Departments List
const DEPARTMENTS = [
  "Computer Science and Engineering (CSE)",
  "Electrical and Electronic Engineering (EEE)",
  "Civil Engineering (CE)",
  "Business Administration (BBA)",
  "Economics",
  "English and Humanities",
  "Media Studies and Journalism (MSJ)",
  "Environment and Development Studies (EDS)",
  "Pharmacy",
  "Biotechnology and Genetic Engineering (BGE)",
  "Other"
];

export default function RegisterScreen() {
  const theme = useTheme();
  // Using optional chaining incase AuthContext isn't fully set up yet
  const { register } = useAuth?.() || { register: async () => {} };
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // --- Department Logic ---
  const [department, setDepartment] = useState(''); // Selection from dropdown
  const [customDepartment, setCustomDepartment] = useState(''); // Text for "Other"
  const [showDeptMenu, setShowDeptMenu] = useState(false); // Menu visibility

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    // 1. Resolve final department name
    const finalDepartment = department === 'Other' ? customDepartment.trim() : department;

    // 2. Validation
    if (!name.trim() || !email.trim() || !password.trim() || !finalDepartment) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        department: finalDepartment, // Send the resolved department
      });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={[styles.logoContainer, { backgroundColor: theme.colors.primaryContainer }]}>
              <ShoppingBag size={40} color={theme.colors.primary} />
            </View>
            <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.onBackground }}>
              Create Account
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.outline, marginTop: 4 }}>
              Join the campus marketplace
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.form}>
            <TextInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              autoCapitalize="words"
              left={<TextInput.Icon icon={() => <User size={20} color={theme.colors.outline} />} />}
              style={styles.input}
            />

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              left={<TextInput.Icon icon={() => <Mail size={20} color={theme.colors.outline} />} />}
              style={styles.input}
            />

            {/* --- DEPARTMENT DROPDOWN --- */}
            <Menu
              visible={showDeptMenu}
              onDismiss={() => setShowDeptMenu(false)}
              anchor={
                <Pressable onPress={() => { Keyboard.dismiss(); setShowDeptMenu(true); }}>
                  <View pointerEvents="none">
                    <TextInput
                      label="Department"
                      value={department}
                      mode="outlined"
                      editable={false} // Makes it act like a button
                      left={<TextInput.Icon icon={() => <Building2 size={20} color={theme.colors.outline} />} />}
                      right={<TextInput.Icon icon={() => <ChevronDown size={20} color={theme.colors.outline} />} />}
                      style={styles.input}
                    />
                  </View>
                </Pressable>
              }
              contentStyle={{ backgroundColor: theme.colors.elevation.level2 }}
            >
              {DEPARTMENTS.map((dept, index) => (
                <React.Fragment key={dept}>
                  <Menu.Item 
                    onPress={() => {
                      setDepartment(dept);
                      setShowDeptMenu(false);
                      if (dept !== 'Other') setCustomDepartment('');
                    }} 
                    title={dept}
                  />
                  {index < DEPARTMENTS.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </Menu>

            {/* "Other" Department Input */}
            {department === 'Other' && (
              <TextInput
                label="Type your Department Name"
                value={customDepartment}
                onChangeText={setCustomDepartment}
                mode="outlined"
                autoCapitalize="words"
                placeholder="e.g. Data Science"
                style={[styles.input, { marginTop: -8 }]}
              />
            )}

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              left={<TextInput.Icon icon={() => <Lock size={20} color={theme.colors.outline} />} />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={styles.input}
            />

            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              left={<TextInput.Icon icon={() => <Lock size={20} color={theme.colors.outline} />} />}
              style={styles.input}
            />

            {error ? (
              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>
            ) : null}

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </View>

          {/* Footer Link */}
          <View style={styles.footer}>
            <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
              Already have an account?{' '}
            </Text>
            <Link href="/(auth)/login" asChild>
              <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                Sign In
              </Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
});