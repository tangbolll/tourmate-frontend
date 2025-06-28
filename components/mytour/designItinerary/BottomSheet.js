import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Animated,
    PanResponder,
    Dimensions,
    FlatList,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { touristAttractions, regionCategories } from './MockData';

const { height: screenHeight } = Dimensions.get('window');

const BottomSheet = ({ 
    regions, 
    onAttractionToggle, 
    selectedAttractions = [], 
    onAiItineraryPress,
    showActionButtons = false,
    onConfirmItinerary,
    onRecommendAgain,
    onGoBack
}) => {
    const [searchText, setSearchText] = useState('');
    const [selectedRegion, setSelectedRegion] = useState(regions[0]?.region || '');
    const [expandedSections, setExpandedSections] = useState({});
    const [sheetHeight, setSheetHeight] = useState(0); // 0: 최소, 1: 중간, 2: 전체
    
    const translateY = useRef(new Animated.Value(screenHeight * 0.85)).current;
    const lastGesture = useRef(0);

    // 바텀시트 높이 설정
    const heights = [
        screenHeight * 0.9, // 1단계: 검색창만
        screenHeight * 0.5,  // 2단계: 중간
        screenHeight * 0.2   // 3단계: 거의 전체
    ];

    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 20;
        },
        onPanResponderMove: (evt, gestureState) => {
        const newValue = heights[sheetHeight] + gestureState.dy;
        if (newValue >= heights[2] && newValue <= heights[0]) {
            translateY.setValue(newValue);
        }
        },
        onPanResponderRelease: (evt, gestureState) => {
        const { dy, vy } = gestureState;
        const currentHeight = heights[sheetHeight];
        
        if (Math.abs(vy) > 0.5) {
            // 빠른 스와이프
            if (vy > 0) {
            // 아래로 스와이프
            const nextHeight = Math.min(sheetHeight + 1, 2);
            animateToHeight(nextHeight);
            } else {
            // 위로 스와이프
            const nextHeight = Math.max(sheetHeight - 1, 0);
            animateToHeight(nextHeight);
            }
        } else {
            // 느린 드래그 - 가장 가까운 높이로
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
    };

    // 초기 애니메이션
    useEffect(() => {
        animateToHeight(0);
    }, []);

    // 검색 필터링
    const getFilteredAttractions = () => {
        if (!selectedRegion) return [];
        
        const attractions = touristAttractions[selectedRegion] || [];
        if (!searchText) return attractions;
        
        return attractions.filter(attraction =>
        attraction.name.toLowerCase().includes(searchText.toLowerCase()) ||
        attraction.description.toLowerCase().includes(searchText.toLowerCase())
        );
    };

    const handleRegionSelect = (region) => {
        setSelectedRegion(region);
        setSearchText('');
    };

    const toggleSection = (attractionId) => {
        setExpandedSections(prev => ({
        ...prev,
        [attractionId]: !prev[attractionId]
        }));
    };

    const handleAttractionToggle = (attraction) => {
        onAttractionToggle(attraction);
    };

    const isAttractionSelected = (attractionId) => {
        return selectedAttractions.some(item => item.id === attractionId);
    };

    const hasSelectedAttractions = selectedAttractions.length > 0;

    const renderRegionButton = ({ item }) => (
        <TouchableOpacity
        style={[
            styles.regionButton,
            selectedRegion === item.region && styles.selectedRegionButton
        ]}
        onPress={() => handleRegionSelect(item.region)}
        >
        <Text style={[
            styles.regionButtonText,
            selectedRegion === item.region && styles.selectedRegionButtonText
        ]}>
            {item.region}
        </Text>
        </TouchableOpacity>
    );

    const renderAttraction = (attraction) => {
        const isSelected = isAttractionSelected(attraction.id);
        const isExpanded = expandedSections[attraction.id];

        return (
        <View key={attraction.id} style={styles.attractionContainer}>
            {/* + 버튼을 상자 외부 왼쪽에 배치 */}
            <TouchableOpacity
                style={[
                styles.addButton,
                isSelected && styles.selectedAddButton
                ]}
                onPress={() => handleAttractionToggle(attraction)}
            >
                {isSelected ? (
                <Ionicons name="checkmark" size={16} color="#666" />
                ) : (
                <Ionicons name="add" size={16} color="#fff" />
                )}
            </TouchableOpacity>

            <View style={styles.attractionCard}>
                <View style={styles.attractionHeader}>
                    <View style={styles.attractionInfo}>
                        <Text style={styles.attractionName}>{attraction.name}</Text>
                    </View>
                    
                    <TouchableOpacity
                        style={styles.expandButton}
                        onPress={() => toggleSection(attraction.id)}
                    >
                        <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color="#666"
                        />
                    </TouchableOpacity>
                </View>
                
                {isExpanded && (
                <View style={styles.attractionDetails}>
                    <View style={styles.detailsContent}>
                        <View style={styles.textContent}>
                            <Text style={styles.attractionDescription}>{attraction.description}</Text>
                            
                            <View style={styles.infoRow}>
                                <View style={styles.infoItem}>
                                    <Ionicons name="location-outline" size={16} color="#666" />
                                    <Text style={styles.infoText}>{attraction.location}</Text>
                                </View>
                            </View>
                            
                            <View style={styles.infoRow}>
                                <View style={styles.infoItem}>
                                    <Ionicons name="time-outline" size={16} color="#666" />
                                    <Text style={styles.infoText}>{attraction.hours}</Text>
                                </View>
                            </View>
                        </View>
                        
                        <View style={styles.imageContainer}>
                            <Image 
                                source={{ uri: attraction.image || "https://via.placeholder.com/120x80/E0E0E0/666666?text=이미지" }}
                                style={styles.attractionImage}
                                resizeMode="cover"
                            />
                        </View>
                    </View>
                </View>
                )}
            </View>
        </View>
        );
    };

    return (
        <Animated.View
        style={[
            styles.container,
            {
            transform: [{ translateY }],
            },
        ]}
        {...panResponder.panHandlers}
        >
        <View style={styles.handle} />
        
        {/* AI 일정 생성 완료 후 액션 버튼들 */}
        {showActionButtons && (
            <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.confirmButton]}
                    onPress={onConfirmItinerary}
                >
                    <Text style={styles.confirmButtonText}>일정 확정하기</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={[styles.actionButton, styles.recommendButton]}
                    onPress={onRecommendAgain}
                >
                    <Text style={styles.recommendButtonText}>다시 추천받기</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={onGoBack}
                >
                    <Ionicons name="arrow-back" size={20} color="#333" />
                </TouchableOpacity>
            </View>
        )}
        
        <View style={styles.header}>
            <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
                style={styles.searchInput}
                placeholder="관심있는 관광지를 검색해보세요!"
                placeholderTextColor="#999"
                value={searchText}
                onChangeText={setSearchText}
            />
            </View>
            
            <TouchableOpacity
            style={[
                styles.aiButton,
                hasSelectedAttractions && styles.aiButtonActive
            ]}
            disabled={!hasSelectedAttractions}
            onPress={onAiItineraryPress}
            >
            <Text style={[
                styles.aiButtonText,
                hasSelectedAttractions && styles.aiButtonTextActive
            ]}>
                AI 일정
            </Text>
            </TouchableOpacity>
        </View>

        <View style={styles.regionContainer}>
            <FlatList
            data={regions}
            renderItem={renderRegionButton}
            keyExtractor={(item) => item.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.regionList}
            />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* 선택된 지역의 관광지 목록 렌더링 */}
            {getFilteredAttractions().map(renderAttraction)}
            
            {/* 추가 공간 확보 */}
            <View style={{ height: 100 }} />
        </ScrollView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: screenHeight,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#ddd',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
    // 액션 버튼들 스타일
    actionButtonsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 8,
        alignItems: 'center',
    },
    actionButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButton: {
        backgroundColor: '#000',
        flex: 1,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    recommendButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        flex: 1,
    },
    recommendButtonText: {
        color: '#333',
        fontSize: 14,
        fontWeight: '500',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f8f8f8',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    header: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 16,
        alignItems: 'center',
        gap: 12,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 44,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    aiButton: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
    },
    aiButtonActive: {
        backgroundColor: '#000',
    },
    aiButtonText: {
        color: '#999',
        fontSize: 14,
        fontWeight: '500',
    },
    aiButtonTextActive: {
        color: '#fff',
    },
    regionContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    regionList: {
        flexDirection: 'row',
    },
    regionButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    selectedRegionButton: {
        backgroundColor: '#000',
        borderWidth: 0,
    },
    regionButtonText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '500',
    },
    selectedRegionButtonText: {
        color: '#fff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    attractionContainer: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginTop: 16,
    },
    selectedAddButton: {
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    attractionCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    attractionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    attractionInfo: {
        flex: 1,
    },
    attractionName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    expandButton: {
        padding: 4,
    },
    attractionDetails: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    detailsContent: {
        flexDirection: 'row',
        gap: 12,
    },
    textContent: {
        flex: 1,
    },
    attractionDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12,
    },
    infoRow: {
        marginBottom: 8,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    imageContainer: {
        width: 120,
        height: 80,
    },
    attractionImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
});

export default BottomSheet;