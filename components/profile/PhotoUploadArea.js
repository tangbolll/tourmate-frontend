import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

const PhotoUploadArea = ({ 
    selectedImage, 
    onPickImage, 
    isEditMode, 
    isSaved 
}) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={[
                    styles.photoArea,
                    selectedImage && styles.photoAreaSelected
                ]} 
                onPress={onPickImage}
                disabled={!isEditMode || isSaved}
            >
                {selectedImage ? (
                    <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                ) : (
                    <View style={styles.photoPlaceholder}>
                        <Feather 
                            name="camera" 
                            size={32} 
                            color="#999"
                        />
                        <Text style={styles.photoText}>
                            사진 추가
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    photoArea: {
        width: 148 * 2.4,
        height: 100 * 2.4,
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fafafa',
        position: 'relative',
    },
    photoAreaSelected: {
        borderStyle: 'solid',
        borderColor: 'transparent',
        backgroundColor: 'transparent',
    },
    photoPlaceholder: {
        alignItems: 'center',
        gap: 8,
    },
    photoText: {
        fontSize: 16,
        color: '#999',
        fontWeight: '500',
    },
    selectedImage: {
        width: '100%',
        height: '100%',
    },
});

export default PhotoUploadArea;