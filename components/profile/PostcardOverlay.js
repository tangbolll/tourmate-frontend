import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

const PostcardOverlay = ({ 
    isVisible, 
    onClose, 
    onPostcardSelect,
    onWritePress,
    onDrawPress 
}) => {
    if (!isVisible) return null;

    return (
        <TouchableOpacity 
            style={styles.overlay}
            activeOpacity={1}
            onPress={onClose}
        >
            <View style={styles.overlayContent}>
                <TouchableOpacity 
                    style={styles.overlayOption}
                    onPress={onPostcardSelect}
                >
                    <Feather name="edit" size={24} color="#fff" />
                    <Text style={styles.overlayOptionText}>엽서 변경</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.overlayOption}
                    onPress={() => {
                        onWritePress();
                        onClose();
                    }}
                >
                    <Feather name="edit-3" size={24} color="#fff" />
                    <Text style={styles.overlayOptionText}>글쓰기</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.overlayOption}
                    onPress={() => {
                        onDrawPress();
                        onClose();
                    }}
                >
                    <Feather name="pen-tool" size={24} color="#fff" />
                    <Text style={styles.overlayOptionText}>그리기</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    overlayContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 40,
    },
    overlayOption: {
        alignItems: 'center',
        gap: 8,
    },
    overlayOptionText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default PostcardOverlay;