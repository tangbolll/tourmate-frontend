import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const LikeOrScrap = ({
    likeCount = 0,
    scrapCount = 0,
    isLiked = false,
    isScrapped = false,
    onLikePress,
    onScrapPress,
    showButtons = true,
    iconSize = 24,
    textSize = 14,
    containerStyle,
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            {/* 좋아요 */}
            <TouchableOpacity 
                style={styles.item}
                onPress={showButtons ? onLikePress : undefined}
                disabled={!showButtons}
                activeOpacity={showButtons ? 0.7 : 1}
            >
                <View style={styles.iconContainer}>
                    <MaterialIcons 
                        name={isLiked ? "favorite" : "favorite-border"} 
                        size={iconSize} 
                        color={"black"} // 항상 검은색
                    />
                </View>
                <Text style={[styles.count, { fontSize: textSize }]}>
                    {likeCount}
                </Text>
            </TouchableOpacity>

            {/* 스크랩 */}
            <TouchableOpacity 
                style={styles.item}
                onPress={showButtons ? onScrapPress : undefined}
                disabled={!showButtons}
                activeOpacity={showButtons ? 0.7 : 1}
            >
                <View style={styles.iconContainer}>
                    <MaterialIcons 
                        name={isScrapped ? "bookmark" : "bookmark-border"} 
                        size={iconSize} 
                        color={"black"} // 항상 검은색
                    />
                </View>
                <Text style={[styles.count, { fontSize: textSize }]}>
                    {scrapCount}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    item: {
        alignItems: 'center',
        gap: 4,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff', // 항상 하얀 배경
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    count: {
        fontWeight: '600',
        color: '#fff', // 텍스트를 하얀색으로 변경 (검은 배경에서 보이도록)
    },
});

export default LikeOrScrap;