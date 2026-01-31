// ============================================
// CampusMarket - Sell Item Screen (Create Listing)
// ============================================

import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera, ImagePlus, X } from 'lucide-react-native';
import React, { useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  Divider,
  HelperText,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import Toast, { useToast } from '@/components/Toast';
import { useAuth } from '@/contexts/AuthContext';
import productService from '@/services/product.service';
import type { CreateProductDTO, ProductCategory, ProductCondition } from '@/types';

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

export default function SellScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState(user?.department ?? '');
  const [category, setCategory] = useState<ProductCategory>('other');
  const [condition, setCondition] = useState<ProductCondition>('good');

  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  // web-only multiple file input
  const webFileInputRef = useRef<HTMLInputElement>(null);

  const priceNumber = useMemo(() => {
    const n = Number(price);
    return Number.isFinite(n) ? n : NaN;
  }, [price]);

  const canSubmit = useMemo(() => {
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
      const uri = URL.createObjectURL(f);
      toAdd.push(uri);
    }

    if (toAdd.length) {
      setImages(prev => [...prev, ...toAdd].slice(0, 3));
    }

    // reset input
    if (webFileInputRef.current) webFileInputRef.current.value = '';
  };

  const removeImage = (uri: string) => {
    setImages(prev => prev.filter(x => x !== uri));
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      Alert.alert('Missing info', 'Please fill all fields and add 1–3 photos.');
      return;
    }

    try {
      setSubmitting(true);

      // Upload images first to get server URLs
      const uploadedImageUrls = await productService.uploadImages(images);

      const payload: CreateProductDTO = {
        title: title.trim(),
        description: description.trim(),
        price: Number(priceNumber),
        category,
        condition,
        department: department.trim(),
        images: uploadedImageUrls,
      };

      const created = await productService.createProduct(payload);

      // Show success toast
      showToast('🎉 Your listing was submitted successfully!', 'success', 4000);

      // Reset form
      setTitle('');
      setPrice('');
      setDescription('');
      setCategory('other');
      setCondition('good');
      setImages([]);

      // Navigate after a brief delay to let user see the toast
      setTimeout(() => {
        router.push({ pathname: '/home/[id]', params: { id: created.id } });
      }, 1500);
    } catch (error: any) {
      console.error('Create product error:', error);
      showToast(error?.response?.data?.message || 'Failed to create listing', 'error', 4000);
    } finally {
      setSubmitting(false);
    }
  };

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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}
        >
          <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.onBackground }}>
            Sell Item
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
            Add 1–3 photos and fill in the details.
          </Text>
        </View>

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
                    accessibilityLabel="Remove photo"
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

            <HelperText type="error" visible={images.length === 0}>
              Please add at least 1 photo.
            </HelperText>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium" style={{ fontWeight: '600' }}>Listing Details</Text>
            <Divider style={{ marginVertical: 12 }} />

            <TextInput
              label="Title"
              mode="outlined"
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Calculus book (like new)"
            />
            <HelperText type="error" visible={title.trim().length > 0 && title.trim().length < 3}>
              Title should be at least 3 characters.
            </HelperText>

            <TextInput
              label="Price"
              mode="outlined"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="e.g., 500"
            />
            <HelperText type="error" visible={price.length > 0 && (!Number.isFinite(priceNumber) || priceNumber <= 0)}>
              Enter a valid price.
            </HelperText>

            <TextInput
              label="Department"
              mode="outlined"
              value={department}
              onChangeText={setDepartment}
              placeholder="e.g., CSE"
            />
            <HelperText type="error" visible={department.length > 0 && department.trim().length < 2}>
              Department is required.
            </HelperText>

            <TextInput
              label="Description"
              mode="outlined"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              placeholder="Write what it is, condition, pickup details, etc."
              style={{ marginTop: 4 }}
            />
            <HelperText type="error" visible={description.length > 0 && description.trim().length < 10}>
              Description should be at least 10 characters.
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

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={submitting}
              disabled={!canSubmit || submitting}
              style={{ marginTop: 18 }}
              icon={({ size, color }) => <Camera size={size} color={color} />}
            >
              Submit Listing
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Toast Notification */}
      <Toast config={toast} onDismiss={hideToast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  card: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    overflow: 'hidden',
  },
  photoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoWrap: {
    width: 92,
    height: 92,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    right: 6,
    top: 6,
    padding: 4,
    borderRadius: 10,
  },
  addPhoto: {
    width: 92,
    height: 92,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
