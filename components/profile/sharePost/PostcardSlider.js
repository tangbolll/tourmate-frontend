import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

const PostcardSlider = ({ 
    postcards, 
    currentIndex, 
    onSelectPostcard, 
    onAddNewPostcard
}) => {
    return (
        <View style={styles.slideContainer}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.slideContent}
            >
                {postcards.map((postcard, index) => {
                    // 수정된 부분: postcard.id, postcard.tempId, index 순으로 고유하고 안정적인 키를 찾습니다.
                    const key = postcard.id || postcard.tempId || `new-postcard-${index}`;
                    
                    return (
                        <TouchableOpacity
                            key={key}
                            style={[
                                styles.slideItem,
                                currentIndex === index && styles.slideItemActive
                            ]}
                            onPress={() => onSelectPostcard(index)}
                        >
                            {postcard.image ? (
                                <View style={styles.slideImageContainer}>
                                    <Image source={{ uri: postcard.image }} style={styles.slideImage} />
                                    {currentIndex === index && (
                                        <View style={styles.checkmark}>
                                            <Feather name="check" size={16} color="#fff" />
                                        </View>
                                    )}
                                </View>
                            ) : (
                                <View style={styles.slideEmpty}>
                                    {currentIndex === index && (
                                        <View style={styles.checkmark}>
                                            <Feather name="check" size={16} color="#fff" />
                                        </View>
                                    )}
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
                
                {/* 더 추가하기 버튼 */}
                <TouchableOpacity 
                    style={styles.addButton} 
                    onPress={onAddNewPostcard}
                >
                    <Feather name="plus" size={24} color="#999" />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    slideContainer: {
        paddingTop: 16,
        backgroundColor: '#fff',
    },
    slideContent: {
        paddingHorizontal: 16,
        gap: 12,
    },
    slideItem: {
        width: 148 * 0.7,
        height: 100 * 0.7,
        backgroundColor: '#f5f5f5',
        borderWidth: 2,
        borderColor: 'transparent',
        borderRadius: 0,
        overflow: 'hidden',
    },
    slideItemActive: {
        borderColor: '#555',
    },
    slideImageContainer: {
        flex: 1,
        position: 'relative',
    },
    slideImage: {
        width: '100%',
        height: '100%',
    },
    slideEmpty: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        position: 'relative',
    },
    checkmark: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#555',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        width: 148 * 0.7,
        height: 100 * 0.7,
        backgroundColor: '#f5f5f5',
        borderRadius: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default PostcardSlider;
