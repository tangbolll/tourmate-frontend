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
            // 새 엽서가 맨 앞에 오도록 렌더링 순서를 뒤집었으므로,
            // 실제 스크롤할 인덱스를 다시 계산해야 합니다.
            // 예를 들어, postcards 배열의 마지막 요소(최신 엽서)가 visualIndex 0이 됩니다.
            const visualIndex = postcards.length - 1 - currentIndex;

            // 스크롤 위치 계산: [추가버튼] [최신엽서] [이전엽서] ...
            const xOffset = CONTAINER_PADDING_LEFT + ADD_BUTTON_WIDTH + GAP + (ITEM_WIDTH + GAP) * visualIndex;
            
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
                {postcards.slice().reverse().map((postcard, index) => {
                    // 뒤집힌 배열의 인덱스를 원래 배열의 인덱스로 변환
                    const originalIndex = postcards.length - 1 - index;
                    
                    return (
                        <TouchableOpacity
                            key={postcard.id || postcard.tempId}
                            style={[
                                styles.slideItem,
                                currentIndex === originalIndex && styles.slideItemActive
                            ]}
                            onPress={() => onSelectPostcard(originalIndex)}
                        >
                            {postcard.image ? (
                                <View style={styles.slideImageContainer}>
                                    <Image source={{ uri: postcard.image }} style={styles.slideImage} />
                                    {currentIndex === originalIndex && (
                                        <View style={styles.checkmark}>
                                            <Feather name="check" size={16} color="#fff" />
                                        </View>
                                    )}
                                </View>
                            ) : (
                                <View style={styles.slideEmpty}>
                                    {currentIndex === originalIndex && (
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