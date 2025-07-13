import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import PostcardTemplate from './PostcardTemplate';
import PostcardOverlay from './PostcardOverlay';

const PostcardSelectionArea = ({ 
    selectedPostcard, 
    onAreaPress, 
    onPostcardSelect,
    isEditMode, 
    isSaved,
    isOverlayVisible,
    onOverlayClose,
    onWritePress,
    onDrawPress
}) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={[
                    styles.postcardArea,
                    selectedPostcard && styles.postcardAreaSelected
                ]} 
                onPress={onAreaPress}
                disabled={!isEditMode || isSaved}
            >
                {selectedPostcard ? (
                    <View style={styles.postcardContainer}>
                        <PostcardTemplate template={selectedPostcard} />
                        <PostcardOverlay
                            isVisible={isOverlayVisible}
                            onClose={onOverlayClose}
                            onPostcardSelect={onPostcardSelect}
                            onWritePress={onWritePress}
                            onDrawPress={onDrawPress}
                        />
                    </View>
                ) : (
                    <View style={styles.postcardPlaceholder}>
                        <Feather 
                            name="file-text" 
                            size={32} 
                            color="#999"
                        />
                        <Text style={styles.postcardText}>
                            엽서 선택
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
    postcardArea: {
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
    postcardAreaSelected: {
        borderStyle: 'solid',
        borderColor: 'transparent',
        backgroundColor: 'transparent',
    },
    postcardContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    postcardPlaceholder: {
        alignItems: 'center',
        gap: 8,
    },
    postcardText: {
        fontSize: 16,
        color: '#999',
        fontWeight: '500',
    },
});

export default PostcardSelectionArea;