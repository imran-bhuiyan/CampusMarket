// ============================================
// CampusMarket - My Listings (Seller)
// ============================================

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pencil, Trash2 } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  IconButton,
  Text,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import productService from '@/services/product.service';
import type { Product } from '@/types';

export default function MyListingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const myProducts = useMemo(() => {
    if (!user) return [];
    return allProducts.filter(p => p.sellerId === user.id);
  }, [allProducts, user]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      // No seller filter in API, so we fetch a bigger page and filter client-side.
      const res = await productService.getProducts({ limit: 200 });
      setAllProducts(res.data ?? []);
    } catch (e) {
      console.error('My listings fetch error:', e);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  }, []);

  const handleEdit = (id: number) => {
    router.push({ pathname: '/listings/edit/[id]', params: { id } });
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Delete listing?',
      'This will permanently remove your listing.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await productService.deleteProduct(id);
              setAllProducts(prev => prev.filter(p => p.id !== id));
              Alert.alert('Deleted', 'Your listing was deleted.');
            } catch (error: any) {
              console.error('Delete listing error:', error);
              Alert.alert('Error', error?.response?.data?.message || 'Failed to delete listing');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Product }) => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
      <Pressable onPress={() => router.push({ pathname: '/home/[id]', params: { id: item.id } })}>
        <View style={styles.row}>
          <Image
            source={{ uri: item.images?.[0] || 'https://via.placeholder.com/300x200' }}
            style={styles.thumb}
            contentFit="cover"
          />

          <View style={styles.info}>
            <Text variant="titleMedium" numberOfLines={2} style={{ fontWeight: '700' }}>
              {item.title}
            </Text>
            <Text variant="bodyMedium" style={{ marginTop: 4 }}>
              ৳ {item.price}
            </Text>

            <View style={styles.metaRow}>
              {!item.isAvailable && (
                <Chip compact style={[styles.chip, { backgroundColor: theme.colors.error }]} textStyle={{ color: '#fff' }}>
                  SOLD
                </Chip>
              )}
              <Chip compact style={styles.chip}>
                {String(item.category).replace('_', ' ')}
              </Chip>
              <Chip compact style={styles.chip}>
                {String(item.condition).replace('_', ' ')}
              </Chip>
            </View>
          </View>

          <View style={styles.actions}>
            <IconButton
              icon={({ size, color }) => <Pencil size={size} color={color} />}
              onPress={() => handleEdit(item.id)}
              accessibilityLabel="Edit listing"
            />
            <IconButton
              icon={({ size, color }) => <Trash2 size={size} color={theme.colors.error} />}
              onPress={() => handleDelete(item.id)}
              accessibilityLabel="Delete listing"
            />
          </View>
        </View>
      </Pressable>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.onBackground }}>
          My Listings
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
          Manage your items (edit / delete).
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : myProducts.length === 0 ? (
        <View style={styles.center}>
          <Text variant="titleMedium" style={{ fontWeight: '700' }}>
            No listings yet
          </Text>
          <Text style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>
            Create your first listing from the Sell tab.
          </Text>
          <Button mode="contained" style={{ marginTop: 16 }} onPress={() => router.push('/(tabs)/sell')}>
            Go to Sell
          </Button>
        </View>
      ) : (
        <FlatList
          data={myProducts}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    marginBottom: 12,
    borderRadius: 14,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    alignItems: 'center',
  },
  thumb: { width: 72, height: 72, borderRadius: 12 },
  info: { flex: 1 },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  chip: { alignSelf: 'flex-start' },
  actions: { alignItems: 'center', justifyContent: 'center' },
});
