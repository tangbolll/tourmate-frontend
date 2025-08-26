import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';

const SaveButton = ({
    title = '엽서 저장',
    onPress,
    disabled = false,
    loading = false,
    style,
    textStyle,
    }) => {
    return (
        <TouchableOpacity
        style={[
            styles.button,
            disabled && styles.buttonDisabled,
            style,
        ]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        >
        {loading ? (
            <ActivityIndicator color="#fff" size="small" />
        ) : (
            <Text style={[styles.buttonText, textStyle]}>
            {title}
            </Text>
        )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#000',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default SaveButton;