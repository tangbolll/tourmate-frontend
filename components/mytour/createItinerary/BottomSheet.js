import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Dimensions, 
    StyleSheet,
    TouchableOpacity,
    Animated,
    ScrollView
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const BottomSheet = ({ isOpen, onClose, children, onHeightChange }) => {
    const [translateY] = useState(new Animated.Value(0));
    const [isCollapsed, setIsCollapsed] = useState(false);
    const scrollViewRef = useRef(null);
    const lastScrollY = useRef(0);
    const scrollDirection = useRef('up');

    const FULL_HEIGHT = SCREEN_HEIGHT * 0.6;
    const COLLAPSED_HEIGHT = 80; 

    const handleScroll = (event) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const scrollDiff = currentScrollY - lastScrollY.current;
        
        // 스크롤 방향 감지
        if (scrollDiff > 0) {
            scrollDirection.current = 'down';
        } else if (scrollDiff < 0) {
            scrollDirection.current = 'up';
        }
        
        // 스크롤 임계값 (5px 이상)
        if (Math.abs(scrollDiff) > 5) {
            if (scrollDirection.current === 'down' && !isCollapsed) {
                // 아래로 스크롤 → 바텀시트 축소
                collapseSheet();
            } else if (scrollDirection.current === 'up' && isCollapsed) {
                // 위로 스크롤 → 바텀시트 확장
                expandSheet();
            }
        }
        
        lastScrollY.current = currentScrollY;
    };

    const collapseSheet = () => {
        setIsCollapsed(true);
        Animated.spring(translateY, {
            toValue: FULL_HEIGHT - COLLAPSED_HEIGHT,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
        }).start();
        onHeightChange?.(COLLAPSED_HEIGHT / SCREEN_HEIGHT);
    };

    const expandSheet = () => {
        setIsCollapsed(false);
        Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
        }).start();
        onHeightChange?.(FULL_HEIGHT / SCREEN_HEIGHT);
    };

    const handleDragBarPress = () => {
        if (isCollapsed) {
            expandSheet();
        } else {
            collapseSheet();
        }
    };

    // 스크롤을 멈췄을 때 자동으로 다시 올리기 (옵션)
    const scrollTimer = useRef(null);
    const handleScrollEnd = () => {
        clearTimeout(scrollTimer.current);
        scrollTimer.current = setTimeout(() => {
            if (isCollapsed && scrollDirection.current === 'down') {
                expandSheet();
            }
        }, 2000); // 2초 후 자동 확장
    };

    useEffect(() => {
        return () => {
            clearTimeout(scrollTimer.current);
        };
    }, []);

    if (!isOpen) return null;

    return (
        <Animated.View 
            style={[
                styles.container, 
                { 
                    height: FULL_HEIGHT,
                    transform: [{ translateY }] 
                }
            ]}
        >
            <TouchableOpacity 
                style={styles.dragHandle}
                onPress={handleDragBarPress}
            >
                <View style={styles.dragBar} />
            </TouchableOpacity>
            
            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollContent}
                onScroll={handleScroll}
                onMomentumScrollEnd={handleScrollEnd}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    {children}
                </View>
            </ScrollView>
        </Animated.View>
    );
};

// 더 간단한 버전 (스크롤 감지만)
export const BottomSheetSimple = ({ isOpen, onClose, children, onHeightChange }) => {
    const [translateY] = useState(new Animated.Value(0));
    const [isCollapsed, setIsCollapsed] = useState(false);
    const lastScrollY = useRef(0);

    const FULL_HEIGHT = SCREEN_HEIGHT * 0.6;
    const COLLAPSED_HEIGHT = 80;

    const handleScroll = (event) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const scrollDiff = currentScrollY - lastScrollY.current;
        
        if (scrollDiff > 20 && !isCollapsed) {
            // 아래로 스크롤 → 축소
            setIsCollapsed(true);
            Animated.spring(translateY, {
                toValue: FULL_HEIGHT - COLLAPSED_HEIGHT,
                useNativeDriver: true,
                tension: 150,
                friction: 8,
            }).start();
        } else if (scrollDiff < -10 && isCollapsed) {
            // 위로 스크롤 → 확장
            setIsCollapsed(false);
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                tension: 150,
                friction: 8,
            }).start();
        }
        
        lastScrollY.current = currentScrollY;
    };

    if (!isOpen) return null;

    return (
        <Animated.View 
            style={[
                styles.container, 
                { 
                    height: FULL_HEIGHT,
                    transform: [{ translateY }] 
                }
            ]}
        >
            <TouchableOpacity 
                style={styles.dragHandle}
                onPress={() => {
                    if (isCollapsed) {
                        setIsCollapsed(false);
                        Animated.spring(translateY, {
                            toValue: 0,
                            useNativeDriver: true,
                        }).start();
                    }
                }}
            >
                <View style={styles.dragBar} />
            </TouchableOpacity>
            
            <ScrollView
                style={styles.scrollContent}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    {children}
                </View>
            </ScrollView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 20,
        zIndex: 100,
    },
    dragHandle: {
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    dragBar: {
        width: 40,
        height: 4,
        backgroundColor: '#d1d5db',
        borderRadius: 2,
    },
    scrollContent: {
        flex: 1,
    },
    content: {
        paddingBottom: 50,
    },
});