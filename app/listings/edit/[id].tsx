// ============================================
// CampusMarket - Edit Listing Screen
// ============================================

import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ImagePlus, Trash2, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Divider,
  HelperText,
  IconButton,
  SegmentedButtons,
  Switch,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import productService from '@/services/product.service';
import type { CreateProductDTO, Product, ProductCategory, ProductCondition } from '@/types';

const CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = [
  { value: 'books', label: 'Books' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'other', label: 'Other' },
];

const CONDITION_OPTIONS: { value: ProductCondition; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
];

export default function EditListingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const listingId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [category, setCategory] = useState<ProductCategory>('other');
  const [condition, setCondition] = useState<ProductCondition>('good');
  const [images, setImages] = useState<string[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);

  const webFileInputRef = useRef<HTMLInputElement>(null);

  const priceNumber = useMemo(() => {
    const n = Number(price);
    return Number.isFinite(n) ? n : NaN;
  }, [price]);

  const canSave = useMemo(() => {
    return (
      title.trim().length >= 3 &&
      description.trim().length >= 10 &&
      department.trim().length >= 2 &&
      Number.isFinite(priceNumber) &&
      priceNumber > 0 &&
      images.length >= 1 &&
      images.length <= 3
    );
  }, [title, description, department, priceNumber, images.length]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const p = await productService.getProduct(listingId);

      // Basic ownership guard (seller or admin)
      if (user && user.role !== 'admin' && p.sellerId !== user.id) {
        Alert.alert('Not allowed', 'You can only edit your own listings.');
        router.back();
        return;
      }

      setProduct(p);
      setTitle(p.title ?? '');
      setPrice(String(p.price ?? ''));
      setDescription(p.description ?? '');
      setDepartment(p.department ?? user?.department ?? '');
      setCategory((p.category as ProductCategory) ?? 'other');
      setCondition((p.condition as ProductCondition) ?? 'good');
      setImages((p.images ?? []).slice(0, 3));
      setIsAvailable(p.isAvailable ?? true);
    } catch (e: any) {
      console.error('Load listing error:', e);
      Alert.alert('Error', e?.response?.data?.message || 'Failed to load listing');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(listingId)) {
      Alert.alert('Error', 'Invalid listing id');
      router.back();
      return;
    }
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  const requestLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to add photos.');
      return false;
    }
    return true;
  };

  const pickImagesNative = async () => {
    if (images.length >= 3) {
      Alert.alert('Limit reached', 'You can add up to 3 photos.');
      return;
    }

    const ok = await requestLibraryPermission();
    if (!ok) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: false,
      allowsMultipleSelection: true,
      selectionLimit: Math.max(1, 3 - images.length),
    });

    if (result.canceled) return;
    const picked = (result.assets ?? []).map(a => a.uri).filter(Boolean);
    if (!picked.length) return;
    setImages(prev => [...prev, ...picked].slice(0, 3));
  };

  const pickImagesWeb = () => {
    if (images.length >= 3) {
      Alert.alert('Limit reached', 'You can add up to 3 photos.');
      return;
    }
    webFileInputRef.current?.click();
  };

  const onWebFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const toAdd: string[] = [];
    for (let i = 0; i < files.length; i++) {
      if (toAdd.length + images.length >= 3) break;
      const f = files[i];
      if (!f.type.startsWith('image/')) continue;
      toAdd.push(URL.createObjectURL(f));
    }

    if (toAdd.length) setImages(prev => [...prev, ...toAdd].slice(0, 3));
    if (webFileInputRef.current) webFileInputRef.current.value = '';
  };

  const removeImage = (uri: string) => setImages(prev => prev.filter(x => x !== uri));

  const handleSave = async () => {
    if (!canSave) {
      Alert.alert('Missing info', 'Please fill all fields and keep 1–3 photos.');
      return;
    }

    const payload: Partial<CreateProductDTO> & { isAvailable?: boolean } = {
      title: title.trim(),
      description: description.trim(),
      price: Number(priceNumber),
      department: department.trim(),
      category,
      condition,
      images,
      isAvailable,
    };

    try {
      setSaving(true);
      const updated = await productService.updateProduct(listingId, payload);
      setProduct(updated);
      Alert.alert('Saved', 'Listing updated successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      console.error('Update listing error:', e);
      Alert.alert('Error', e?.response?.data?.message || 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
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
              await productService.deleteProduct(listingId);
              Alert.alert('Deleted', 'Your listing was deleted.', [
                { text: 'OK', onPress: () => router.replace('/(tabs)/my-listings') },
              ]);
            } catch (e: any) {
              console.error('Delete listing error:', e);
              Alert.alert('Error', e?.response?.data?.message || 'Failed to delete listing');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.center}><ActivityIndicator size="large" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      {/* Hidden file input for web */}
      {Platform.OS === 'web' && (
        <input
          ref={webFileInputRef as any}
          type="file"
          accept="image/*"
          multiple
          onChange={onWebFilesSelected as any}
          style={{ display: 'none' }}
        />
      )}

      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <IconButton icon={({ size, color }) => <ArrowLeft size={size} color={color} />} onPress={() => router.back()} />
          <Text variant="headlineSmall" style={{ fontWeight: '800', color: theme.colors.onBackground }}>
            Edit Listing
          </Text>
          <IconButton icon={({ size }) => <Trash2 size={size} color={theme.colors.error} />} onPress={handleDelete} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={{ fontWeight: '600', marginBottom: 10 }}>
              Photos
            </Text>

            <View style={styles.photoRow}>
              {images.map((uri) => (
                <View key={uri} style={styles.photoWrap}>
                  <Image source={{ uri }} style={styles.photo} contentFit="cover" />
                  <Pressable
                    onPress={() => removeImage(uri)}
                    style={[styles.removeBtn, { backgroundColor: theme.colors.surface }]}
                  >
                    <X size={16} color={theme.colors.error} />
                  </Pressable>
                </View>
              ))}

              {images.length < 3 && (
                <Pressable
                  onPress={Platform.OS === 'web' ? pickImagesWeb : pickImagesNative}
                  style={[styles.addPhoto, { borderColor: theme.colors.outline }]}
                >
                  <ImagePlus size={22} color={theme.colors.onSurfaceVariant} />
                  <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 6 }}>
                    Add
                  </Text>
                </Pressable>
              )}
            </View>

            <HelperText type={images.length === 0 ? 'error' : 'info'} visible>
              {images.length === 0 ? 'Please keep at least 1 photo.' : `Selected: ${images.length}/3`}
            </HelperText>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={{ fontWeight: '600' }}>Listing Details</Text>
            <Divider style={{ marginVertical: 12 }} />

            <TextInput label="Title" mode="outlined" value={title} onChangeText={setTitle} />
            <HelperText type={title.trim().length < 3 ? 'error' : 'info'} visible>
              {title.trim().length < 3 ? 'Title should be at least 3 characters.' : ' '}
            </HelperText>

            <TextInput label="Price" mode="outlined" value={price} onChangeText={setPrice} keyboardType="numeric" />
            <HelperText type={!Number.isFinite(priceNumber) || priceNumber <= 0 ? 'error' : 'info'} visible>
              {!Number.isFinite(priceNumber) || priceNumber <= 0 ? 'Enter a valid price.' : ' '}
            </HelperText>

            <TextInput label="Department" mode="outlined" value={department} onChangeText={setDepartment} />
            <HelperText type={department.trim().length < 2 ? 'error' : 'info'} visible>
              {department.trim().length < 2 ? 'Department is required.' : ' '}
            </HelperText>

            <TextInput
              label="Description"
              mode="outlined"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
            />
            <HelperText type={description.trim().length < 10 ? 'error' : 'info'} visible>
              {description.trim().length < 10 ? 'Description should be at least 10 characters.' : ' '}
            </HelperText>

            <Text variant="titleSmall" style={{ fontWeight: '600', marginTop: 8, marginBottom: 6 }}>
              Category
            </Text>
            <SegmentedButtons
              value={category}
              onValueChange={(v) => setCategory(v as ProductCategory)}
              buttons={CATEGORY_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
              style={{ flexWrap: 'wrap' }}
            />

            <Text variant="titleSmall" style={{ fontWeight: '600', marginTop: 14, marginBottom: 6 }}>
              Condition
            </Text>
            <SegmentedButtons
              value={condition}
              onValueChange={(v) => setCondition(v as ProductCondition)}
              buttons={CONDITION_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
              style={{ flexWrap: 'wrap' }}
            />

            <Divider style={{ marginVertical: 14 }} />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text variant="titleSmall" style={{ fontWeight: '600' }}>
                  Mark as Sold
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Toggle ON when item is no longer available
                </Text>
              </View>
              <Switch
                value={!isAvailable}
                onValueChange={(val) => setIsAvailable(!val)}
                color={theme.colors.error}
              />
            </View>

            <Button
              mode="contained"
              onPress={handleSave}
              loading={saving}
              disabled={!canSave || saving}
              style={{ marginTop: 18 }}
            >
              Save Changes
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 8,
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
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    overflow: 'hidden',
  },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoWrap: { width: 92, height: 92, borderRadius: 12, overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', right: 6, top: 6, padding: 4, borderRadius: 10 },
  addPhoto: {
    width: 92,
    height: 92,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
