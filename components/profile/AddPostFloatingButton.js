import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';

const AddPostFloatingButton = ({ onOptionSelect }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0));

    const toggleExpand = () => {
        if (isExpanded) {
            // 축소 애니메이션
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                })
            ]).start(() => {
                setIsExpanded(false);
            });
        } else {
            // 확장 애니메이션
            setIsExpanded(true);
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();
        }
    };

    const handleOptionSelect = (option) => {
        setIsExpanded(false);
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            })
        ]).start();
        
        if (onOptionSelect) {
            onOptionSelect(option);
        }
    };

    return (
        <View style={styles.container}>
            {/* 옵션 메뉴 */}
            {isExpanded && (
                <Animated.View 
                    style={[
                        styles.optionsContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }]
                        }
                    ]}
                >
                    <TouchableOpacity 
                        style={styles.optionButton}
                        onPress={() => handleOptionSelect('existing')}
                    >
                        <Text style={styles.optionText}>기존 폴더에 엽서 추가</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.optionButton}
                        onPress={() => handleOptionSelect('new')}
                    >
                        <Text style={styles.optionText}>새 폴더에 엽서 추가</Text>
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* 메인 플로팅 버튼 */}
            <TouchableOpacity 
                style={[styles.floatingButton, isExpanded && styles.expandedButton]}
                onPress={toggleExpand}
            >
                <Text style={styles.buttonText}>
                    {isExpanded ? '×' : '+'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        alignItems: 'flex-end',
    },
    optionsContainer: {
        marginBottom: 12,
        backgroundColor: 'white',
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        minWidth: 180,
    },
    optionButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    optionText: {
        fontSize: 14,
        color: '#333',
        textAlign: 'left',
    },
    floatingButton: {
        width: 48,
        height: 48,
        borderRadius: 28,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    expandedButton: {
        backgroundColor: '#999',
    },
    buttonText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        lineHeight: 24,
    },
});

export default AddPostFloatingButton;