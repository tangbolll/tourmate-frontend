import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Dimensions, 
    StyleSheet,
    TouchableOpacity,
    Animated,
    ScrollView,
    PanResponder,
} from 'react-native';
import CreateItineraryButton from './CreateItineraryButton';
import Continent from './Continent';
import Country from './Country';
import SelectedRegions from './SelectedRegions';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const BottomSheet = ({ 
    isOpen, 
    onClose, 
    onHeightChange, 
    selectedRegions, 
    onRegionSelect, 
    onRemoveRegion, 
    isCreateButtonActive, 
    handleCreateTrip 
}) => {
    const [sheetHeight, setSheetHeight] = useState(1); // 0: collapsed, 1: medium, 2: expanded
    const [selectedContinent, setSelectedContinent] = useState('국내');
    const scrollViewRef = useRef(null);
    
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const buttonOpacity = useRef(new Animated.Value(0)).current;

    // 세 단계 높이 설정
    const heights = [
        SCREEN_HEIGHT * 0.78, // collapsed: 22%만 보임
        SCREEN_HEIGHT * 0.5,  // medium: 50%
        SCREEN_HEIGHT * 0.1   // expanded: 90%
    ];

    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: (evt, gestureState) => {
            const { dy, dx } = gestureState;
            // 더 엄격한 조건들:
            // 1. 세로 이동이 50px 이상이어야 함
            // 2. 세로 이동이 가로 이동보다 2배 이상 커야 함 (대각선 방지)
            // 3. 빠른 세로 플리킹 감지 (속도 기반)
            const verticalMovement = Math.abs(dy);
            const horizontalMovement = Math.abs(dx);
            
            return verticalMovement > 50 && 
                   verticalMovement > horizontalMovement * 2;
        },
        onPanResponderGrant: (evt, gestureState) => {
            // 제스처가 시작될 때 현재 위치 기록
            translateY.setOffset(heights[sheetHeight]);
            translateY.setValue(1);
        },
        onPanResponderMove: (evt, gestureState) => {
            const { dy, dx } = gestureState;
            // 이동 중에도 세로 우선 움직임 확인
            if (Math.abs(dy) > Math.abs(dx) * 1.5) {
                const newValue = dy;
                const currentOffset = heights[sheetHeight];
                const finalValue = currentOffset + newValue;
                
                // 경계값 제한
                if (finalValue >= heights[2] && finalValue <= heights[0]) {
                    translateY.setValue(newValue);
                }
            }
        },
        onPanResponderRelease: (evt, gestureState) => {
            const { dy, vy } = gestureState;
            
            // offset 제거
            translateY.flattenOffset();
            
            // 더 엄격한 속도 임계값
            if (Math.abs(vy) > 800) {
                // 매우 빠른 스와이프만 인정
                if (vy > 0) {
                    // 아래로 스와이프
                    const nextHeight = Math.min(sheetHeight + 1, 2);
                    animateToHeight(nextHeight);
                } else {
                    // 위로 스와이프
                    const nextHeight = Math.max(sheetHeight - 1, 0);
                    animateToHeight(nextHeight);
                }
            } else if (Math.abs(dy) > 100) {
                // 충분한 거리 이동 시에만 상태 변경
                const currentHeight = heights[sheetHeight];
                const currentY = currentHeight + dy;
                let targetHeight = 0;
                let minDistance = Math.abs(currentY - heights[0]);
                
                heights.forEach((height, index) => {
                    const distance = Math.abs(currentY - height);
                    if (distance < minDistance) {
                        minDistance = distance;
                        targetHeight = index;
                    }
                });
                
                animateToHeight(targetHeight);
            } else {
                // 작은 움직임은 원래 상태로 되돌리기
                animateToHeight(sheetHeight);
            }
        },
    });

    const animateToHeight = (heightIndex) => {
        setSheetHeight(heightIndex);
        Animated.spring(translateY, {
            toValue: heights[heightIndex],
            useNativeDriver: true,
            tension: 100,
            friction: 8,
        }).start();
        
        // 높이 변경 콜백 호출
        const heightRatio = 1 - (heights[heightIndex] / SCREEN_HEIGHT);
        onHeightChange?.(heightRatio);
    };

    const handleDragBarPress = () => {
        if (sheetHeight === 0) {
            animateToHeight(1);
        } else if (sheetHeight === 1) {
            animateToHeight(2);
        } else {
            animateToHeight(0);
        }
    };

    const handleContinentSelect = (continent) => {
        setSelectedContinent(continent);
    };

    // 초기 설정 및 isOpen 상태 변경 처리
    useEffect(() => {
        if (isOpen) {
            // 바텀시트 열기 - medium 상태로 시작
            animateToHeight(1);
            
            // 버튼 표시 애니메이션
            Animated.timing(buttonOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            // 바텀시트 닫기
            Animated.timing(translateY, {
                toValue: SCREEN_HEIGHT,
                duration: 300,
                useNativeDriver: true,
            }).start();
            
            // 버튼 숨김 애니메이션
            Animated.timing(buttonOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <Animated.View 
            style={[
                styles.container, 
                {
                    transform: [{ translateY }],
                }
            ]}
            {...panResponder.panHandlers}
        >
            <TouchableOpacity 
                style={styles.dragHandle}
                onPress={handleDragBarPress}
                activeOpacity={0.7}
            >
                <View style={styles.dragBar} />
            </TouchableOpacity>
            
            {/* 선택된 지역 표시 */}
            {selectedRegions.length > 0 && (
                <SelectedRegions 
                    selectedRegions={selectedRegions}
                    onRemoveRegion={onRemoveRegion}
                />
            )}
            
            {/* 대륙 선택 */}
            <Continent 
                selectedContinent={selectedContinent}
                onContinentSelect={handleContinentSelect}
            />
            
            {/* 국가/지역 선택 */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={true}
            >
                <Country 
                    selectedContinent={selectedContinent}
                    onRegionSelect={onRegionSelect}
                    selectedRegions={selectedRegions}
                />
                
                {/* 추가 공간 확보 */}
                <View style={{ height: 100 }} />
            </ScrollView>
            
            {/* 플로팅 여행일정 생성 버튼 */}
            <Animated.View 
                style={[
                    styles.floatingButtonContainer,
                    {
                        opacity: buttonOpacity,
                        transform: [{
                            translateY: translateY.interpolate({
                                inputRange: [
                                    heights[2], // expanded
                                    heights[1], // medium  
                                    heights[0]  // collapsed
                                ],
                                outputRange: [
                                    -80,  // expanded: 바텀시트 아래쪽 고정
                                    -400,  // medium: 바텀시트 아래쪽 고정
                                    200   // collapsed: 화면 밖으로 내려감
                                ],
                                extrapolate: 'clamp'
                            })
                        }]
                    }
                ]}
            >
                <CreateItineraryButton 
                    isActive={selectedRegions.length > 0 && isCreateButtonActive}
                    onPress={handleCreateTrip}
                />
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: SCREEN_HEIGHT,
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
    floatingButtonContainer: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        alignItems: 'center',
        zIndex: 1000,
        backgroundColor: 'transparent',
    },
});

export default BottomSheet;