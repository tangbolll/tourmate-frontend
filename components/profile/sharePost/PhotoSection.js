import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

const PhotoSection = ({ imageUri }) => {
    return (
        <View style={styles.container}>
            <View style={styles.photoSection}>
                {imageUri ? (
                    <Image 
                        source={{ uri: imageUri }} 
                        style={styles.photoImage} 
                    />
                ) : (
                    <View style={styles.photoPlaceholder}>
                        <Feather name="image" size={48} color="#ccc" />
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    photoSection: {
        width: 148 * 2.4,
        height: 100 * 2.4,
        backgroundColor: '#f5f5f5',
        borderRadius: 0,
        marginBottom: 16,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    photoImage: {
        width: '100%',
        height: '100%',
    },
    photoPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default PhotoSection;