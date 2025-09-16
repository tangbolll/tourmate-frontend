import React, { useRef, useImperativeHandle, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

const PostcardSlider = React.forwardRef(({ 
    postcards, 
    currentIndex, 
    onSelectPostcard, 
    onAddNewPostcard, 
    isEditMode, 
    isSaved 
}, ref) => {
    const scrollViewRef = useRef(null);
    
    // 슬라이더 항목의 크기 상수
    const ITEM_WIDTH = 148 * 0.7;
    const GAP = 12;
    const ADD_BUTTON_WIDTH = ITEM_WIDTH;
    const CONTAINER_PADDING_LEFT = 16;
    
    useImperativeHandle(ref, () => ({
        scrollToEnd: (options) => {
            scrollViewRef.current?.scrollToEnd(options);
        },
        scrollTo: (options) => {
            scrollViewRef.current?.scrollTo(options);
        },
    }));

    useEffect(() => {
        if (scrollViewRef.current && currentIndex !== null) {
            const xOffset = CONTAINER_PADDING_LEFT + ADD_BUTTON_WIDTH + GAP + (ITEM_WIDTH + GAP) * currentIndex;
            
            scrollViewRef.current.scrollTo({ x: xOffset, animated: true });
        }
    }, [currentIndex, postcards.length]);

    return (
        <View style={styles.slideContainer}>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.slideContent}
            >
                {/* 새 엽서 추가 버튼 - 맨 왼쪽에 위치 */}
                <TouchableOpacity 
                    style={styles.addButton} 
                    onPress={onAddNewPostcard}
                >
                    <Feather 
                        name="plus" 
                        size={24} 
                        color="#999"
                    />
                </TouchableOpacity>

                {/* 엽서들을 뒤집어 렌더링하여 최신 엽서가 바로 옆에 오도록 합니다. */}
                {postcards.map((postcard, index) => {
                    return (
                        <TouchableOpacity
                            key={postcard.id || postcard.tempId}
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
            </ScrollView>
        </View>
    );
});

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
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
    },
});

export default PostcardSlider;