// ============================================
// CampusMarket - Filter Modal Component
// ============================================
// Modal/BottomSheet for filtering products by category, department, and price range.

import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
    Button,
    Divider,
    SegmentedButtons,
    Text,
    TextInput,
    useTheme,
} from 'react-native-paper';

import type { ProductCategory } from '@/types';

// ---------- Types ----------

export interface FilterValues {
    category: ProductCategory | '';
    department: string;
    minPrice: string;
    maxPrice: string;
}

export interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: FilterValues) => void;
    initialValues?: FilterValues;
}

// ---------- Constants ----------

const CATEGORIES: { value: ProductCategory | ''; label: string }[] = [
    { value: '', label: 'All' },
    { value: 'books', label: 'Books' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'other', label: 'Other' },
];

const DEFAULT_FILTERS: FilterValues = {
    category: '',
    department: '',
    minPrice: '',
    maxPrice: '',
};

// ---------- Component ----------

export function FilterModal({
    visible,
    onClose,
    onApply,
    initialValues = DEFAULT_FILTERS,
}: FilterModalProps) {
    const theme = useTheme();
    const [filters, setFilters] = useState<FilterValues>(initialValues);

    // Reset filters when modal opens with new initial values
    React.useEffect(() => {
        if (visible) {
            setFilters(initialValues);
        }
    }, [visible, initialValues]);

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    const handleClear = () => {
        setFilters(DEFAULT_FILTERS);
        onApply(DEFAULT_FILTERS);
        onClose();
    };

    const hasActiveFilters =
        filters.category !== '' ||
        filters.department !== '' ||
        filters.minPrice !== '' ||
        filters.maxPrice !== '';

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View
                    style={[
                        styles.modalContainer,
                        { backgroundColor: theme.colors.surface },
                    ]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text
                            variant="titleLarge"
                            style={{ fontWeight: 'bold', color: theme.colors.onSurface }}
                        >
                            Filter Products
                        </Text>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={theme.colors.onSurface} />
                        </Pressable>
                    </View>

                    <Divider />

                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Category Selection */}
                        <View style={styles.section}>
                            <Text
                                variant="titleMedium"
                                style={{
                                    fontWeight: '600',
                                    color: theme.colors.onSurface,
                                    marginBottom: 12,
                                }}
                            >
                                Category
                            </Text>
                            <SegmentedButtons
                                value={filters.category}
                                onValueChange={(value) =>
                                    setFilters({ ...filters, category: value as ProductCategory | '' })
                                }
                                buttons={CATEGORIES.slice(0, 3).map((cat) => ({
                                    value: cat.value,
                                    label: cat.label,
                                }))}
                                style={styles.segmentedButtons}
                            />
                            <SegmentedButtons
                                value={filters.category}
                                onValueChange={(value) =>
                                    setFilters({ ...filters, category: value as ProductCategory | '' })
                                }
                                buttons={CATEGORIES.slice(3).map((cat) => ({
                                    value: cat.value,
                                    label: cat.label,
                                }))}
                                style={[styles.segmentedButtons, { marginTop: 8 }]}
                            />
                        </View>

                        {/* Department */}
                        <View style={styles.section}>
                            <Text
                                variant="titleMedium"
                                style={{
                                    fontWeight: '600',
                                    color: theme.colors.onSurface,
                                    marginBottom: 12,
                                }}
                            >
                                Department
                            </Text>
                            <TextInput
                                mode="outlined"
                                placeholder="e.g., Computer Science"
                                value={filters.department}
                                onChangeText={(text) =>
                                    setFilters({ ...filters, department: text })
                                }
                                style={styles.textInput}
                            />
                        </View>

                        {/* Price Range */}
                        <View style={styles.section}>
                            <Text
                                variant="titleMedium"
                                style={{
                                    fontWeight: '600',
                                    color: theme.colors.onSurface,
                                    marginBottom: 12,
                                }}
                            >
                                Price Range (৳)
                            </Text>
                            <View style={styles.priceRow}>
                                <TextInput
                                    mode="outlined"
                                    placeholder="Min"
                                    keyboardType="numeric"
                                    value={filters.minPrice}
                                    onChangeText={(text) =>
                                        setFilters({ ...filters, minPrice: text.replace(/[^0-9]/g, '') })
                                    }
                                    style={[styles.textInput, styles.priceInput]}
                                />
                                <Text
                                    variant="bodyLarge"
                                    style={{ color: theme.colors.outline, marginHorizontal: 12 }}
                                >
                                    to
                                </Text>
                                <TextInput
                                    mode="outlined"
                                    placeholder="Max"
                                    keyboardType="numeric"
                                    value={filters.maxPrice}
                                    onChangeText={(text) =>
                                        setFilters({ ...filters, maxPrice: text.replace(/[^0-9]/g, '') })
                                    }
                                    style={[styles.textInput, styles.priceInput]}
                                />
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer Buttons */}
                    <View style={styles.footer}>
                        <Button
                            mode="outlined"
                            onPress={handleClear}
                            style={styles.footerButton}
                            disabled={!hasActiveFilters}
                        >
                            Clear Filters
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleApply}
                            style={styles.footerButton}
                        >
                            Apply Filters
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// ---------- Styles ----------

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    segmentedButtons: {
        // Styling handled by Paper
    },
    textInput: {
        backgroundColor: 'transparent',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceInput: {
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.1)',
    },
    footerButton: {
        flex: 1,
    },
});

export default FilterModal;
