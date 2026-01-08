import { Check, ShieldAlert, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

type PendingProduct = {
  id: number;
  title: string;
  price: number;
  category: string;
  seller?: {
    name: string;
    department: string;
  };
};

export default function AdminScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const [tab, setTab] = useState('pending');
  const [items, setItems] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const isAdmin = useMemo(() => user?.role === 'admin', [user?.role]);

  const loadPending = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const { data } = await api.get<PendingProduct[]>('/products/pending');
      setItems(data);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to load pending items');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (tab === 'pending') {
      loadPending();
    }
  }, [loadPending, tab]);

  const handleAction = async (action: 'Approved' | 'Rejected', id: number) => {
    if (!isAdmin) return;
    setActionLoadingId(id);
    try {
      if (action === 'Approved') {
        await api.patch(`/products/${id}/approve`);
      } else {
        await api.patch(`/products/${id}/reject`);
      }
      setItems((prev) => prev.filter((i) => i.id !== id));
      Alert.alert(action, `Item ID ${id} has been ${action.toLowerCase()}.`);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Action failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.onBackground }}>
          Admin Dashboard
        </Text>
      </View>

      {!isAdmin ? (
        <View style={styles.center}>
          <ShieldAlert size={64} color={theme.colors.outline} />
          <Text variant="titleMedium" style={{ marginTop: 16, color: theme.colors.outline }}>
            Admin access required
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
            Please log in with an admin account.
          </Text>
        </View>
      ) : (
        <>

      <View style={{ paddingHorizontal: 16, marginBottom: 10 }}>
        <SegmentedButtons
          value={tab}
          onValueChange={setTab}
          buttons={[
            { value: 'pending', label: 'Pending Items', icon: 'clock-outline' },
            { value: 'users', label: 'Manage Users', icon: 'account-group' },
          ]}
        />
      </View>

      {tab === 'pending' ? (
        loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ marginTop: 12, color: theme.colors.outline }}>Loading pending items...</Text>
          </View>
        ) : (
        <FlatList
          data={items}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 20, color: theme.colors.outline }}>
              No pending items to review.
            </Text>
          }
          renderItem={({ item }) => (
            <Card style={{ backgroundColor: theme.colors.elevation.level1 }}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View>
                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{item.title}</Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
                      {item.seller ? `${item.seller.name} (${item.seller.department})` : 'Unknown seller'}
                    </Text>
                  </View>
                  <Chip compact>{item.category}</Chip>
                </View>
                
                <Text variant="bodyMedium" style={{ marginVertical: 8 }}>Price: ৳{item.price}</Text>

                <View style={styles.actionRow}>
                  <Button 
                    mode="contained" 
                    buttonColor={theme.colors.error} 
                    icon={() => <X size={18} color="white" />}
                    onPress={() => handleAction('Rejected', item.id)}
                    disabled={actionLoadingId === item.id}
                    style={{ flex: 1, marginRight: 8 }}
                  >
                    Reject
                  </Button>
                  <Button 
                    mode="contained" 
                    buttonColor="#4caf50" 
                    icon={() => <Check size={18} color="white" />}
                    onPress={() => handleAction('Approved', item.id)}
                    disabled={actionLoadingId === item.id}
                    style={{ flex: 1 }}
                  >
                    Approve
                  </Button>
                </View>
              </Card.Content>
            </Card>
          )}
        />)
      ) : (
        <View style={styles.center}>
          <ShieldAlert size={64} color={theme.colors.outline} />
          <Text variant="titleMedium" style={{ marginTop: 16, color: theme.colors.outline }}>
            User Management Coming Soon
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
            (This feature is scheduled for Update 2)
          </Text>
        </View>
      )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  actionRow: { flexDirection: 'row', marginTop: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }
});