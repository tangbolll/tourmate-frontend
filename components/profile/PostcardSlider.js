import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

const PostcardSlider = ({ 
    postcards, 
    currentIndex, 
    onSelectPostcard, 
    onAddNewPostcard, 
    isEditMode, 
    isSaved 
}) => {
    return (
        <View style={styles.slideContainer}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.slideContent}
            >
                {/* 새 엽서 추가 버튼 - 맨 왼쪽에 위치 */}
                <TouchableOpacity 
                    style={[
                        styles.addButton,
                        (!isEditMode || isSaved) && styles.addButtonDisabled
                    ]} 
                    onPress={onAddNewPostcard}
                    disabled={!isEditMode || isSaved}
                >
                    <Feather 
                        name="plus" 
                        size={24} 
                        color="#999"
                    />
                </TouchableOpacity>

                {postcards.map((postcard, index) => (
                    <TouchableOpacity
                        key={postcard.id}
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
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    slideContainer: {
        paddingVertical: 16,
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
        overflow: 'hidden',
    },
    slideItemActive: {
        borderColor: '#444',
        borderWidth: 2,
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
        backgroundColor: '#444',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        width: 148 * 0.7,
        height: 100 * 0.7,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonDisabled: {
        backgroundColor: '#f9f9f9',
    },
});

export default PostcardSlider;