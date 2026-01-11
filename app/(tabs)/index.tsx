// ============================================
// CampusMarket - Buyer Home Screen
// ============================================
// Main product feed with server-side search, filters, and navigation.

import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  BookOpen,
  Clock,
  Filter,
  Laptop,
  MapPin,
  Package,
  ShoppingBag,
  User
} from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Badge,
  Card,
  Chip,
  IconButton,
  Searchbar,
  Text,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterModal, type FilterValues } from '@/components/FilterModal';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import productService, { type GetProductsParams } from '@/services/product.service';
import type { Product } from '@/types';

// ---------- Constants ----------

const DEFAULT_FILTERS: FilterValues = {
  category: '',
  department: '',
  minPrice: '',
  maxPrice: '',
};

// ---------- Component ----------

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Debounce search query by 500ms
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Count active filters for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.department) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    return count;
  }, [filters]);

  // Fetch products when debounced search or filters change
  useEffect(() => {
    fetchProducts();
  }, [debouncedSearch, filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Build query params
      const params: GetProductsParams = {
        limit: 50,
      };

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      if (filters.category) {
        params.category = filters.category;
      }

      if (filters.department.trim()) {
        params.department = filters.department.trim();
      }

      if (filters.minPrice) {
        params.minPrice = parseInt(filters.minPrice, 10);
      }

      if (filters.maxPrice) {
        params.maxPrice = parseInt(filters.maxPrice, 10);
      }

      const response = await productService.getProducts(params);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  }, [debouncedSearch, filters]);

  const handleApplyFilters = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  const handleProductPress = (productId: number) => {
    router.push({
      pathname: '/home/[id]',
      params: { id: productId },
    });
  };

  // ---------- Helper Functions ----------

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

  // ---------- Render Functions ----------

  const renderProductCard = ({ item }: { item: Product }) => (
    <Pressable
      style={styles.cardContainer}
      onPress={() => handleProductPress(item.id)}
    >
      <Card
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        mode="elevated"
      >
        {/* Image with Category Badge */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: item.images?.[0] || 'https://via.placeholder.com/300x200',
            }}
            style={styles.cardImage}
            contentFit="cover"
          />
          {/* Category Badge */}
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            {getCategoryIcon(item.category)}
            <Text
              variant="labelSmall"
              style={{
                color: theme.colors.primary,
                textTransform: 'capitalize',
              }}
            >
              {item.category}
            </Text>
          </View>
        </View>

        <Card.Content style={styles.cardContent}>
          {/* Title */}
          <Text
            variant="titleMedium"
            numberOfLines={2}
            style={{
              fontWeight: '600',
              color: theme.colors.onBackground,
              marginBottom: 6,
              lineHeight: 20,
            }}
          >
            {item.title}
          </Text>

          {/* Price */}
          <Text
            variant="titleLarge"
            style={{
              fontWeight: 'bold',
              color: theme.colors.primary,
              marginBottom: 8,
            }}
          >
            ৳{Number(item.price).toFixed(0)}
          </Text>

          {/* Department */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MapPin size={12} color={theme.colors.outline} />
              <Text
                variant="labelSmall"
                numberOfLines={1}
                style={{ color: theme.colors.outline, flex: 1 }}
              >
                {item.department}
              </Text>
            </View>
          </View>

          {/* Seller Info */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <User size={12} color={theme.colors.outline} />
              <Text
                variant="labelSmall"
                numberOfLines={1}
                style={{ color: theme.colors.outline }}
              >
                {item.seller?.name || 'Unknown'}
              </Text>
            </View>
          </View>

          {/* Bottom Row: Condition & Time */}
          <View style={styles.bottomRow}>
            <Chip
              compact
              style={[
                styles.conditionChip,
                { backgroundColor: theme.colors.primaryContainer },
              ]}
              textStyle={{
                fontSize: 10,
                textTransform: 'capitalize',
                color: theme.colors.primary,
              }}
            >
              {item.condition.replace('_', ' ')}
            </Chip>
            <View style={styles.timeContainer}>
              <Clock size={10} color={theme.colors.outline} />
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.outline, fontSize: 10 }}
              >
                {formatTimeAgo(item.createdAt)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </Pressable>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <ShoppingBag size={64} color={theme.colors.outline} />
      <Text
        variant="titleMedium"
        style={{
          fontWeight: '600',
          color: theme.colors.onBackground,
          marginTop: 16,
        }}
      >
        No products found
      </Text>
      <Text
        variant="bodyMedium"
        style={{
          color: theme.colors.outline,
          textAlign: 'center',
          marginTop: 8,
        }}
      >
        {searchQuery || activeFilterCount > 0
          ? 'Try adjusting your search or filters'
          : 'Check back later for new listings'}
      </Text>
      {activeFilterCount > 0 && (
        <Pressable
          onPress={() => {
            setFilters(DEFAULT_FILTERS);
            setSearchQuery('');
          }}
          style={{ marginTop: 16 }}
        >
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.primary, fontWeight: '600' }}
          >
            Clear all filters
          </Text>
        </Pressable>
      )}
    </View>
  );

  // ---------- Main Render ----------

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View>
          <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
            Welcome back,
          </Text>
          <Text
            variant="headlineSmall"
            style={{ fontWeight: 'bold', color: theme.colors.onBackground }}
          >
            {user?.name || 'Student'}
          </Text>
        </View>
      </View>

      {/* Search Bar with Filter Button */}
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.surfaceVariant,
          },
        ]}
      >
        <Searchbar
          placeholder="Search products..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[
            styles.searchBar,
            { backgroundColor: theme.colors.surfaceVariant, flex: 1 },
          ]}
          inputStyle={styles.searchInput}
        />
        <View style={styles.filterButtonContainer}>
          <IconButton
            icon={() => <Filter size={22} color={theme.colors.primary} />}
            mode="contained-tonal"
            onPress={() => setFilterModalVisible(true)}
            style={styles.filterButton}
          />
          {activeFilterCount > 0 && (
            <Badge style={styles.filterBadge} size={18}>
              {activeFilterCount}
            </Badge>
          )}
        </View>
      </View>

      {/* Products Feed */}
      {loading && products.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
            Loading products...
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={[
            styles.listContent,
            products.length === 0 && styles.emptyListContent,
          ]}
          columnWrapperStyle={products.length > 0 ? styles.columnWrapper : undefined}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        initialValues={filters}
      />
    </SafeAreaView>
  );
}

// ---------- Styles ----------

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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  searchBar: {
    borderRadius: 12,
    elevation: 0,
  },
  searchInput: {
    fontSize: 14,
  },
  filterButtonContainer: {
    position: 'relative',
  },
  filterButton: {
    margin: 0,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  listContent: {
    padding: 12,
  },
  emptyListContent: {
    flexGrow: 1,
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
  },
});
