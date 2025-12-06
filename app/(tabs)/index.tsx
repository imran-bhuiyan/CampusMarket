// ============================================
// CampusMarket - Home Feed Screen
// ============================================

import { Image } from 'expo-image';
import { MapPin, Tag } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    View,
} from 'react-native';
import {
    ActivityIndicator,
    Card,
    Chip,
    Searchbar,
    Text,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import productService from '@/services/product.service';
import type { Product } from '@/types';

export default function HomeScreen() {
  const { user } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts({ limit: 20 });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      // For demo: show placeholder data if backend is not running
      setProducts(PLACEHOLDER_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  }, []);

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProductCard = ({ item }: { item: Product }) => (
    <Pressable style={styles.cardContainer}>
      <Card style={styles.card} mode="elevated">
        <Image
          source={{ uri: item.images[0] || 'https://via.placeholder.com/300x200' }}
          style={styles.cardImage}
          contentFit="cover"
        />
        <Card.Content style={styles.cardContent}>
          <Text variant="titleMedium" numberOfLines={1} style={styles.productTitle}>
            {item.title}
          </Text>
          <Text variant="titleLarge" style={styles.price}>
            ${Number(item.price).toFixed(2)}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MapPin size={14} color={Colors.light.icon} />
              <Text variant="bodySmall" style={styles.metaText}>
                {item.department}
              </Text>
            </View>
          </View>
          <Chip 
            compact 
            style={styles.conditionChip}
            textStyle={styles.conditionText}
          >
            {item.condition.replace('_', ' ')}
          </Chip>
        </Card.Content>
      </Card>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text variant="bodyMedium" style={styles.greeting}>
            Welcome back,
          </Text>
          <Text variant="headlineSmall" style={styles.userName}>
            {user?.name || 'Student'}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search products or departments..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />
      </View>

      {/* Products Feed */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Loading products...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.light.tint]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Tag size={48} color={Colors.light.icon} />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                No products found
              </Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Try adjusting your search or check back later
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// Placeholder data for demo when backend is not running
const PLACEHOLDER_PRODUCTS: Product[] = [
  {
    id: 1,
    title: 'Calculus Textbook',
    description: 'Stewart Calculus 8th Edition, great condition',
    price: 45.00,
    category: 'books',
    condition: 'good',
    department: 'Mathematics',
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'],
    sellerId: 1,
    seller: { id: 1, name: 'John Doe', department: 'Mathematics' },
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'MacBook Pro 2021',
    description: 'M1 Pro, 16GB RAM, excellent condition',
    price: 1200.00,
    category: 'electronics',
    condition: 'like_new',
    department: 'Computer Science',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'],
    sellerId: 2,
    seller: { id: 2, name: 'Jane Smith', department: 'Computer Science' },
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Physics Lab Manual',
    description: 'University Physics Lab Manual, barely used',
    price: 25.00,
    category: 'books',
    condition: 'like_new',
    department: 'Physics',
    images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400'],
    sellerId: 3,
    seller: { id: 3, name: 'Mike Johnson', department: 'Physics' },
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    title: 'Scientific Calculator',
    description: 'TI-84 Plus, works perfectly',
    price: 60.00,
    category: 'electronics',
    condition: 'good',
    department: 'Engineering',
    images: ['https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400'],
    sellerId: 4,
    seller: { id: 4, name: 'Sarah Wilson', department: 'Engineering' },
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  greeting: {
    color: Colors.light.icon,
  },
  userName: {
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    elevation: 0,
  },
  searchInput: {
    fontSize: 14,
  },
  listContent: {
    padding: 12,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: '48%',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  cardContent: {
    padding: 12,
  },
  productTitle: {
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  price: {
    fontWeight: 'bold',
    color: Colors.light.tint,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: Colors.light.icon,
  },
  conditionChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f5e9',
  },
  conditionText: {
    fontSize: 10,
    textTransform: 'capitalize',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: Colors.light.icon,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyTitle: {
    fontWeight: '600',
    color: Colors.light.text,
  },
  emptyText: {
    color: Colors.light.icon,
    textAlign: 'center',
  },
});
