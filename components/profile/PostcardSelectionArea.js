import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
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
                    // 엽서가 선택되면 해당 이미지 경로를 사용하여 이미지 렌더링
                    <View style={styles.postcardContainer}>
                        <Image
                            source={require('../../assets/postCard/1.png')}
                            style={styles.postcardImage}
                        />
                        <PostcardOverlay
                            isVisible={isOverlayVisible}
                            onClose={onOverlayClose}
                            onPostcardSelect={onPostcardSelect}
                            onWritePress={onWritePress}
                            onDrawPress={onDrawPress}
                        />
                    </View>
                ) : (
                    // 엽서가 선택되지 않았을 때 플레이스홀더 표시
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
    postcardImage: {
        width: '100%',
        height: '100%',
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
