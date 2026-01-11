// ============================================
// CampusMarket - Product Details Screen
// ============================================
// Displays detailed information about a single product.

import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
    ArrowLeft,
    BookOpen,
    Clock,
    Laptop,
    MapPin,
    MessageCircle,
    Package,
    Phone,
    User,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Linking,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import {
    ActivityIndicator,
    Button,
    Chip,
    IconButton,
    Text,
    useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_BASE_URL } from '@/services/api';
import productService from '@/services/product.service';
import type { Product } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetailsScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchProduct(parseInt(id, 10));
        }
    }, [id]);

    const fetchProduct = async (productId: number) => {
        try {
            setLoading(true);
            setError(null);
            const data = await productService.getProduct(productId);
            setProduct(data);
        } catch (err: any) {
            console.error('Error fetching product:', err);
            setError(err.response?.data?.message || 'Failed to load product');
        } finally {
            setLoading(false);
        }
    };

    // ---------- Contact Seller Logic ----------

    const handleContactSeller = async () => {
        const rawPhone = product?.seller?.phone;

        if (!rawPhone) {
            Alert.alert(
                'Unavailable',
                "This seller hasn't provided a phone number."
            );
            return;
        }

        // Remove + and any spaces/dashes from phone number for WhatsApp
        const phoneNumber = rawPhone.replace(/[+\s-]/g, '');

        // Format the message for WhatsApp
        const message = `Hi, I'm interested in your item "${product?.title}" listed on CampusMarket. Is it still available?`;

        // Use Universal Link format (works on Mobile + Desktop + Web)
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

        try {
            // Try to open WhatsApp
            const supported = await Linking.canOpenURL(whatsappUrl);

            if (supported) {
                await Linking.openURL(whatsappUrl);
            } else {
                // Fallback: Ask to call instead
                Alert.alert(
                    'WhatsApp Not Found',
                    'Could not open WhatsApp. Do you want to call the seller instead?',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Call',
                            onPress: () => Linking.openURL(`tel:${rawPhone}`),
                        },
                    ]
                );
            }
        } catch (err) {
            console.error('Contact error:', err);
            Alert.alert('Error', 'Could not contact seller.');
        }
    };

    // ---------- Helper Functions ----------

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'books':
                return <BookOpen size={16} color={theme.colors.primary} />;
            case 'electronics':
                return <Laptop size={16} color={theme.colors.primary} />;
            default:
                return <Package size={16} color={theme.colors.primary} />;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getImageUrl = (imagePath: string) => {
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        return `${API_BASE_URL}${imagePath}`;
    };

    // ---------- Render States ----------

    // Loading state
    if (loading) {
        return (
            <SafeAreaView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
            >
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
                        Loading product...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error state
    if (error || !product) {
        return (
            <SafeAreaView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
            >
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.header}>
                    <IconButton
                        icon={() => <ArrowLeft size={24} color={theme.colors.onBackground} />}
                        onPress={() => router.back()}
                    />
                </View>
                <View style={styles.errorContainer}>
                    <Package size={64} color={theme.colors.outline} />
                    <Text
                        variant="titleMedium"
                        style={{ color: theme.colors.onBackground, marginTop: 16 }}
                    >
                        {error || 'Product not found'}
                    </Text>
                    <Button mode="contained" onPress={() => router.back()} style={{ marginTop: 16 }}>
                        Go Back
                    </Button>
                </View>
            </SafeAreaView>
        );
    }

    // ---------- Main Render ----------

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            edges={['top']}
        >
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
                <IconButton
                    icon={() => <ArrowLeft size={24} color={theme.colors.onBackground} />}
                    onPress={() => router.back()}
                />
                <Text
                    variant="titleMedium"
                    style={{ fontWeight: '600', color: theme.colors.onBackground }}
                >
                    Product Details
                </Text>
                <View style={{ width: 48 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Product Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{
                            uri: product.images?.[0]
                                ? getImageUrl(product.images[0])
                                : 'https://via.placeholder.com/400x300',
                        }}
                        style={styles.productImage}
                        contentFit="cover"
                    />
                    {/* Category Badge */}
                    <View
                        style={[
                            styles.categoryBadge,
                            { backgroundColor: theme.colors.surface },
                        ]}
                    >
                        {getCategoryIcon(product.category)}
                        <Text
                            variant="labelMedium"
                            style={{ color: theme.colors.primary, textTransform: 'capitalize' }}
                        >
                            {product.category}
                        </Text>
                    </View>
                </View>

                {/* Product Info */}
                <View style={styles.contentContainer}>
                    {/* Title & Price */}
                    <Text
                        variant="headlineSmall"
                        style={{ fontWeight: 'bold', color: theme.colors.onBackground }}
                    >
                        {product.title}
                    </Text>
                    <Text
                        variant="headlineMedium"
                        style={{
                            fontWeight: 'bold',
                            color: theme.colors.primary,
                            marginTop: 8,
                        }}
                    >
                        ৳{Number(product.price).toFixed(0)}
                    </Text>

                    {/* Condition & Date */}
                    <View style={styles.chipRow}>
                        <Chip
                            compact
                            style={{ backgroundColor: theme.colors.primaryContainer }}
                            textStyle={{ color: theme.colors.primary, textTransform: 'capitalize' }}
                        >
                            {product.condition.replace('_', ' ')}
                        </Chip>
                        <View style={styles.dateContainer}>
                            <Clock size={14} color={theme.colors.outline} />
                            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                                Listed {formatDate(product.createdAt)}
                            </Text>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
                        <Text
                            variant="titleMedium"
                            style={{ fontWeight: '600', color: theme.colors.onBackground }}
                        >
                            Description
                        </Text>
                        <Text
                            variant="bodyMedium"
                            style={{ color: theme.colors.onSurfaceVariant, marginTop: 8, lineHeight: 22 }}
                        >
                            {product.description}
                        </Text>
                    </View>

                    {/* Details */}
                    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
                        <Text
                            variant="titleMedium"
                            style={{ fontWeight: '600', color: theme.colors.onBackground }}
                        >
                            Details
                        </Text>
                        <View style={styles.detailRow}>
                            <MapPin size={18} color={theme.colors.outline} />
                            <View style={styles.detailContent}>
                                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                                    Department
                                </Text>
                                <Text variant="bodyMedium" style={{ color: theme.colors.onBackground }}>
                                    {product.department}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Seller Info */}
                    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
                        <Text
                            variant="titleMedium"
                            style={{ fontWeight: '600', color: theme.colors.onBackground }}
                        >
                            Seller
                        </Text>
                        <View style={styles.sellerRow}>
                            <View
                                style={[
                                    styles.sellerAvatar,
                                    { backgroundColor: theme.colors.primaryContainer },
                                ]}
                            >
                                <User size={24} color={theme.colors.primary} />
                            </View>
                            <View style={styles.sellerInfo}>
                                <Text
                                    variant="bodyLarge"
                                    style={{ fontWeight: '600', color: theme.colors.onBackground }}
                                >
                                    {product.seller?.name || 'Unknown Seller'}
                                </Text>
                                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                                    {product.seller?.department || 'Department not specified'}
                                </Text>
                                {product.seller?.phone && (
                                    <View style={styles.phoneRow}>
                                        <Phone size={12} color={theme.colors.outline} />
                                        <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                                            {product.seller.phone}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Contact Button - WhatsApp Green */}
            <View
                style={[
                    styles.footer,
                    {
                        backgroundColor: theme.colors.surface,
                        borderTopColor: theme.colors.surfaceVariant,
                    },
                ]}
            >
                <Button
                    mode="contained"
                    icon={() => <MessageCircle size={20} color="#fff" />}
                    style={styles.contactButton}
                    contentStyle={styles.contactButtonContent}
                    buttonColor="#25D366"
                    onPress={handleContactSeller}
                >
                    Contact Seller via WhatsApp
                </Button>
            </View>
        </SafeAreaView>
    );
}

// ---------- Styles ----------

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
        paddingVertical: 4,
    },
    imageContainer: {
        position: 'relative',
    },
    productImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH * 0.75,
    },
    categoryBadge: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
    },
    contentContainer: {
        padding: 16,
    },
    chipRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 12,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    section: {
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 12,
    },
    detailContent: {
        flex: 1,
    },
    sellerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 12,
    },
    sellerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sellerInfo: {
        flex: 1,
    },
    phoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
    },
    contactButton: {
        borderRadius: 12,
    },
    contactButtonContent: {
        paddingVertical: 8,
    },
});
