// ============================================
// CampusMarket - Home Feed Screen
// ============================================

import { Image } from 'expo-image';
import { BookOpen, Clock, Laptop, MapPin, Package, Tag, User } from 'lucide-react-native';
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
    useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import productService from '@/services/product.service';
import type { Product } from '@/types';

export default function HomeScreen() {
  const theme = useTheme();
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'books':
        return <BookOpen size={12} color={theme.colors.primary} />;
      case 'electronics':
        return <Laptop size={12} color={theme.colors.primary} />;
      default:
        return <Package size={12} color={theme.colors.primary} />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return `${Math.floor(diffDays / 7)}w ago`;
  };

  const renderProductCard = ({ item }: { item: Product }) => (
    
      <Pressable style={styles.cardContainer}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
          {/* Image with Category Badge */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.images[0] || 'https://via.placeholder.com/300x200' }}
              style={styles.cardImage}
              contentFit="cover"
            />
            {/* Category Badge */}
            <View style={[styles.categoryBadge, { backgroundColor: theme.colors.surface }]}>
              {getCategoryIcon(item.category)}
              <Text variant="labelSmall" style={{ color: theme.colors.primary, textTransform: 'capitalize' }}>
                {item.category}
              </Text>
            </View>
          </View>

          <Card.Content style={styles.cardContent}>
            {/* Title */}
            <Text variant="titleMedium" numberOfLines={2} style={{ fontWeight: '600', color: theme.colors.onBackground, marginBottom: 6, lineHeight: 20 }}>
              {item.title}
            </Text>

            {/* Price */}
            <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.primary, marginBottom: 8 }}>
              ৳{Number(item.price).toFixed(0)}
            </Text>

            {/* Department */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <MapPin size={12} color={theme.colors.outline} />
                <Text variant="labelSmall" numberOfLines={1} style={{ color: theme.colors.outline, flex: 1 }}>
                  {item.department}
                </Text>
              </View>
            </View>

            {/* Seller Info */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <User size={12} color={theme.colors.outline} />
                <Text variant="labelSmall" numberOfLines={1} style={{ color: theme.colors.outline }}>
                  {item.seller?.name || 'Unknown'}
                </Text>
              </View>
            </View>

            {/* Bottom Row: Condition & Time */}
            <View style={styles.bottomRow}>
              <Chip 
                compact 
                style={[styles.conditionChip, { backgroundColor: theme.colors.primaryContainer }]}
                textStyle={{ fontSize: 10, textTransform: 'capitalize', color: theme.colors.primary }}
              >
                {item.condition.replace('_', ' ')}
              </Chip>
              <View style={styles.timeContainer}>
                <Clock size={10} color={theme.colors.outline} />
                <Text variant="labelSmall" style={{ color: theme.colors.outline, fontSize: 10 }}>
                  {formatTimeAgo(item.createdAt)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </Pressable>
    );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View>
          <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
            Welcome back,
          </Text>
          <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.onBackground }}>
            {user?.name || 'Student'}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.surfaceVariant }]}>
        <Searchbar
          placeholder="Search products or departments..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surfaceVariant }]}
          inputStyle={styles.searchInput}
        />
      </View>

      {/* Products Feed */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
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
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Tag size={48} color={theme.colors.outline} />
              <Text variant="titleMedium" style={{ fontWeight: '600', color: theme.colors.onBackground }}>
                No products found
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.outline, textAlign: 'center' }}>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchBar: {
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
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 130,
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardContent: {
    padding: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  conditionChip: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
});
