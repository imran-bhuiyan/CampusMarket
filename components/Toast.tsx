// ============================================
// CampusMarket - Toast Notification Component
// ============================================
// A reusable toast notification using react-native-paper Snackbar
// Provides success, error, and info variants with icons

import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Snackbar, Text, useTheme } from 'react-native-paper';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastConfig {
    visible: boolean;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastProps {
    config: ToastConfig;
    onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ config, onDismiss }) => {
    const theme = useTheme();
    const { visible, message, type, duration = 3000 } = config;

    const getIcon = () => {
        const size = 20;
        switch (type) {
            case 'success':
                return <CheckCircle2 size={size} color="#22c55e" />;
            case 'error':
                return <AlertCircle size={size} color="#ef4444" />;
            case 'info':
                return <Info size={size} color={theme.colors.primary} />;
        }
    };

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return '#dcfce7'; // light green
            case 'error':
                return '#fee2e2'; // light red
            case 'info':
                return theme.colors.primaryContainer;
        }
    };

    const getTextColor = () => {
        switch (type) {
            case 'success':
                return '#166534'; // dark green
            case 'error':
                return '#991b1b'; // dark red
            case 'info':
                return theme.colors.onPrimaryContainer;
        }
    };

    return (
        <Snackbar
            visible={visible}
            onDismiss={onDismiss}
            duration={duration}
            style={[styles.snackbar, { backgroundColor: getBackgroundColor() }]}
            action={{
                label: '',
                icon: () => <X size={18} color={getTextColor()} />,
                onPress: onDismiss,
            }}
        >
            <View style={styles.content}>
                {getIcon()}
                <Text style={[styles.message, { color: getTextColor() }]}>
                    {message}
                </Text>
            </View>
        </Snackbar>
    );
};

const styles = StyleSheet.create({
    snackbar: {
        borderRadius: 12,
        marginBottom: 80, // Above tab bar
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    message: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
});

export default Toast;

// ============================================
// Hook for managing toast state
// ============================================

export function useToast() {
    const [toast, setToast] = React.useState<ToastConfig>({
        visible: false,
        message: '',
        type: 'info',
    });

    const showToast = (message: string, type: ToastType = 'info', duration = 3000) => {
        setToast({ visible: true, message, type, duration });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, visible: false }));
    };

    return { toast, showToast, hideToast };
}
