import { AlertTriangle, Check, Package, ShieldAlert, Users, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Switch, View } from 'react-native';
import { Avatar, Button, Card, Chip, SegmentedButtons, Surface, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

// Types
type AdminStats = {
  totalUsers: number;
  activeListings: number;
  pendingReports: number;
  pendingListings: number;
  newUsersThisWeek: number;
  newListingsThisWeek: number;
};

type MockUser = {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  isBanned: boolean;
  createdAt: string;
};

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

// Initial empty state (data will be loaded from API)
const emptyStats: AdminStats = {
  totalUsers: 0,
  activeListings: 0,
  pendingReports: 0,
  pendingListings: 0,
  newUsersThisWeek: 0,
  newListingsThisWeek: 0,
};

// Stat Card Component with solid color background
function StatCard({
  title,
  value,
  icon,
  backgroundColor,
  subtitle
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  backgroundColor: string;
  subtitle?: string;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor }]}>
      <View style={styles.statIconContainer}>
        {icon}
      </View>
      <Text variant="displaySmall" style={styles.statValue}>
        {value.toLocaleString()}
      </Text>
      <Text variant="titleSmall" style={styles.statTitle}>
        {title}
      </Text>
      {subtitle && (
        <Text variant="bodySmall" style={styles.statSubtitle}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

// User Card Component
function UserCard({
  user,
  onToggleBan,
  isLoading
}: {
  user: MockUser;
  onToggleBan: (id: number, currentStatus: boolean) => void;
  isLoading: boolean;
}) {
  const theme = useTheme();

  return (
    <Card style={[styles.userCard, { backgroundColor: theme.colors.elevation.level1 }]}>
      <Card.Content>
        <View style={styles.userRow}>
          <Avatar.Text
            size={48}
            label={user.name.split(' ').map(n => n[0]).join('')}
            style={{
              backgroundColor: user.isBanned ? theme.colors.errorContainer : theme.colors.primaryContainer
            }}
          />
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text
                variant="titleMedium"
                style={[
                  styles.userName,
                  user.isBanned && { color: theme.colors.error, textDecorationLine: 'line-through' }
                ]}
              >
                {user.name}
              </Text>
              {user.isBanned && (
                <Chip
                  compact
                  mode="flat"
                  style={{ backgroundColor: theme.colors.errorContainer }}
                  textStyle={{ color: theme.colors.error, fontSize: 10 }}
                >
                  BANNED
                </Chip>
              )}
            </View>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {user.email}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              {user.department} • Joined {user.createdAt}
            </Text>
          </View>
          <View style={styles.banToggle}>
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Switch
                value={user.isBanned}
                onValueChange={() => onToggleBan(user.id, user.isBanned)}
                trackColor={{ false: '#767577', true: theme.colors.errorContainer }}
                thumbColor={user.isBanned ? theme.colors.error : '#f4f3f4'}
              />
            )}
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

export default function AdminScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState<AdminStats>(emptyStats);
  const [users, setUsers] = useState<MockUser[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const isAdmin = useMemo(() => user?.role === 'admin', [user?.role]);

  // Load stats from database
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { data } = await api.get<AdminStats>('/admin/stats');
      setStats(data);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to load statistics');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Load users from database
  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const { data } = await api.get<MockUser[]>('/admin/users');
      setUsers(data);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Load pending items
  const loadPending = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const { data } = await api.get<PendingProduct[]>('/products/pending');
      setPendingItems(data);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to load pending items');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Initial load
  useEffect(() => {
    if (isAdmin) {
      loadStats();
      loadUsers();
    }
  }, [isAdmin, loadStats, loadUsers]);

  // Tab change handler
  useEffect(() => {
    if (tab === 'pending' && isAdmin) {
      loadPending();
    }
  }, [tab, isAdmin, loadPending]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadStats(), loadUsers()]);
    if (tab === 'pending') await loadPending();
    setRefreshing(false);
  }, [loadStats, loadUsers, loadPending, tab]);

  // Toggle ban/unban
  const handleToggleBan = async (userId: number, currentBanStatus: boolean) => {
    const action = currentBanStatus ? 'unban' : 'ban';
    console.log(`[AdminFE] Toggling ban for user ${userId}. Action: ${action}`);

    // Call API directly for debugging (skip Alert for now)
    setActionLoadingId(userId);
    try {
      console.log(`[AdminFE] Sending Patch request to /admin/users/${userId}/${action}`);
      const response = await api.patch(`/admin/users/${userId}/${action}`);
      console.log('[AdminFE] Response:', response.data);

      // Update local state on success
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, isBanned: !currentBanStatus } : u
      ));

      // Optional: show simple toast/alert on success
      // Alert.alert('Success', `User ${action}ned`);
    } catch (e: any) {
      console.error('[AdminFE] Error toggling ban:', e);
      Alert.alert('Error', e?.response?.data?.message || `Failed to ${action} user`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle moderation action
  const handleModeration = async (action: 'Approved' | 'Rejected', id: number) => {
    if (!isAdmin) return;
    setActionLoadingId(id);
    try {
      if (action === 'Approved') {
        await api.patch(`/products/${id}/approve`);
      } else {
        await api.patch(`/products/${id}/reject`);
      }
      setPendingItems((prev) => prev.filter((i) => i.id !== id));
      Alert.alert(action, `Item ID ${id} has been ${action.toLowerCase()}.`);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Action failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Render Overview Tab
  const renderOverview = () => {
    if (statsLoading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 12, color: theme.colors.outline }}>Loading statistics...</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={[]}
        ListHeaderComponent={
          <View style={styles.overviewContainer}>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon={<Users size={28} color="white" />}
                backgroundColor="#6366f1"
                subtitle={`+${stats.newUsersThisWeek} this week`}
              />
              <StatCard
                title="Active Listings"
                value={stats.activeListings}
                icon={<Package size={28} color="white" />}
                backgroundColor="#10b981"
                subtitle={`+${stats.newListingsThisWeek} this week`}
              />
              {/* <StatCard
                title="Pending Reports"
                value={stats.pendingReports}
                icon={<Flag size={28} color="white" />}
                backgroundColor="#f59e0b"
                subtitle="Needs review"
              /> */}
              <StatCard
                title="Pending Listings"
                value={stats.pendingListings}
                icon={<AlertTriangle size={28} color="white" />}
                backgroundColor="#ef4444"
                subtitle="Awaiting moderation"
              />
            </View>

            {/* Quick Actions */}
            <Surface style={[styles.quickActionsCard, { backgroundColor: theme.colors.elevation.level1 }]} elevation={1}>
              <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: 16 }}>
                Quick Actions
              </Text>
              <View style={styles.quickActionsRow}>
                <Button
                  mode="contained-tonal"
                  icon={() => <Users size={18} color={theme.colors.primary} />}
                  onPress={() => setTab('users')}
                  style={styles.quickActionBtn}
                >
                  Manage Users
                </Button>
                <Button
                  mode="contained-tonal"
                  icon={() => <Package size={18} color={theme.colors.primary} />}
                  onPress={() => setTab('pending')}
                  style={styles.quickActionBtn}
                >
                  Review Listings
                </Button>
              </View>
            </Surface>
          </View>
        }
        renderItem={() => null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    );
  };

  // Render Users Tab
  const renderUsers = () => {
    if (usersLoading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={{ marginTop: 12, color: theme.colors.outline }}>Loading users...</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={users}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListHeaderComponent={
          <View style={styles.usersHeader}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
              All Users ({users.length})
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              Toggle switch to ban/unban users
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <UserCard
            user={item}
            onToggleBan={handleToggleBan}
            isLoading={actionLoadingId === item.id}
          />
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20, color: theme.colors.outline }}>
            No users found.
          </Text>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    );
  };

  // Render Pending Items Tab
  const renderPending = () => (
    loading ? (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 12, color: theme.colors.outline }}>Loading pending items...</Text>
      </View>
    ) : (
      <FlatList
        data={pendingItems}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Check size={64} color={theme.colors.primary} />
            <Text variant="titleMedium" style={{ marginTop: 16, color: theme.colors.onBackground }}>
              All caught up!
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline, textAlign: 'center' }}>
              No pending items to review.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={{ backgroundColor: theme.colors.elevation.level1 }}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
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
                  onPress={() => handleModeration('Rejected', item.id)}
                  disabled={actionLoadingId === item.id}
                  style={{ flex: 1, marginRight: 8 }}
                >
                  Reject
                </Button>
                <Button
                  mode="contained"
                  buttonColor="#4caf50"
                  icon={() => <Check size={18} color="white" />}
                  onPress={() => handleModeration('Approved', item.id)}
                  disabled={actionLoadingId === item.id}
                  style={{ flex: 1 }}
                >
                  Approve
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    )
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.onBackground }}>
          Admin Dashboard
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
          Manage your campus marketplace
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
                { value: 'overview', label: 'Overview', icon: 'view-dashboard' },
                { value: 'users', label: 'Users', icon: 'account-group' },
                { value: 'pending', label: 'Pending', icon: 'clock-outline' },
              ]}
            />
          </View>

          {tab === 'overview' && renderOverview()}
          {tab === 'users' && renderUsers()}
          {tab === 'pending' && renderPending()}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  overviewContainer: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '47%',
    borderRadius: 16,
    padding: 16,
    minHeight: 140,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    color: 'white',
    fontWeight: 'bold',
  },
  statTitle: {
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  statSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  quickActionsCard: {
    borderRadius: 16,
    padding: 16,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionBtn: {
    flex: 1,
  },
  usersHeader: {
    marginBottom: 12,
  },
  userCard: {
    borderRadius: 12,
    marginBottom: 4,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  userName: {
    fontWeight: '600',
  },
  banToggle: {
    marginLeft: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 8
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
});