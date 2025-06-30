import React from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FloatingActionButtons = ({
    showActionButtons,
    buttonOpacity,
    onGoBack,
    onConfirmItinerary,
    onRecommendAgain
}) => {
    return (
        <Animated.View 
            style={[
                styles.floatingButtonsContainer,
                {
                    opacity: buttonOpacity,
                    transform: [{
                        translateY: buttonOpacity.interpolate({
                            inputRange: [0, 1],
                            outputRange: [30, 0],
                        })
                    }]
                }
            ]} 
            pointerEvents={showActionButtons ? 'auto' : 'none'}
        >
            <View style={styles.allButtonsRow}>
                <TouchableOpacity
                    style={styles.floatingBackButton}
                    onPress={onGoBack}
                >
                    <Ionicons name="arrow-back" size={18} color="#333" />
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[styles.floatingActionButton, styles.floatingConfirmButton]}
                    onPress={onConfirmItinerary}
                >
                    <Text style={styles.floatingConfirmButtonText}>일정 확정하기</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[styles.floatingActionButton, styles.floatingRecommendButton]}
                    onPress={onRecommendAgain}
                >
                    <Text style={styles.floatingRecommendButtonText}>다시 추천받기</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    floatingButtonsContainer: {
        position: 'absolute',
        left: 16,
        right: 16,
        zIndex: 1000,
        top: -55,
    },
    allButtonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    floatingBackButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    floatingActionButton: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 20, 
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    floatingConfirmButton: {
        backgroundColor: '#000',
    },
    floatingConfirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    floatingRecommendButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    floatingRecommendButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default FloatingActionButtons;