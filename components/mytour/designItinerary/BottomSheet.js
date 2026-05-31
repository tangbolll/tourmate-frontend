import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    Animated, PanResponder, Dimensions, FlatList, ActivityIndicator, Platform
} from 'react-native';
// Note: These imports are for the React Native environment and will not resolve in a web browser.
// The code is intended for an Expo/React Native project.
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import FloatingActionButtons from './FloatingActionButtons';
import AttractionCard from './AttractionCard';

const { height: screenHeight } = Dimensions.get('window');

    const getBaseURL = () => {
    // 개발 모드일 때
    if (__DEV__) {
        if (Platform.OS === 'android') {
        return 'http://10.0.2.2:8080';
        }
        if (Platform.OS === 'web') {
        return 'http://localhost:8080';
        }
        return Constants.expoConfig?.extra?.API_BASE_URL_DEV;
    } 
    // 배포(프로덕션) 모드일 때
    else {
        return Constants.expoConfig?.extra?.API_BASE_URL_PROD;
    }
    };

const contentTypeMap = {
    '12': '관광지',
    '14': '문화시설',
    '15': '축제/공연/행사',
    '25': '여행코스',
    '28': '레포츠',
    '32': '숙박',
    '38': '쇼핑',
    '39': '음식점'
};

const BottomSheet = ({
    regions, onAttractionToggle, selectedAttractions = [],
    onAiItineraryPress, showActionButtons = false,
    onConfirmItinerary, onRecommendAgain, onGoBack
}) => {
    const [searchText, setSearchText] = useState('');
    const [expandedSections, setExpandedSections] = useState({});
    const [sheetHeight, setSheetHeight] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [detailMap, setDetailMap] = useState({});

    const translateY = useRef(new Animated.Value(screenHeight * 0.85)).current;
    const buttonOpacity = useRef(new Animated.Value(0)).current;
    const panResponderHandleRef = useRef(null);

    const heights = [screenHeight * 0.9, screenHeight * 0.5, screenHeight * 0.2];

    // 1. regions 데이터를 '경기도 수원시' 형태의 단일 배열로 가공
    const flatRegionList = useMemo(() => {
        if (!regions) return [];
        return regions.flatMap(region =>
            region.sigungu.map(sgg => ({
                displayName: `${region.name} ${sgg.name}`, // 예: '경기도 수원시'
                regionKey: region.key,                     // API 요청에 필요한 지역 코드
                sigunguKey: sgg.key,                       // API 요청에 필요한 시군구 코드
                uniqueKey: `${region.key}-${sgg.key}`      // FlatList key로 사용할 고유 값
            }))
        );
    }, [regions]);

    const [selectedLocation, setSelectedLocation] = useState(flatRegionList[0] || null);
    const [attractions, setAttractions] = useState([]);

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (evt, gestureState) => {
            const { pageY } = evt.nativeEvent;
            const handleY = panResponderHandleRef.current?._nativeTag || 0;
            const isHandleArea = pageY >= handleY && pageY <= handleY + 40;
            return isHandleArea && Math.abs(gestureState.dy) > 10;
        },
        onMoveShouldSetPanResponder: (evt, gestureState) => {
            return Math.abs(gestureState.dy) > 10;
        },
        onPanResponderMove: (evt, gestureState) => {
            const newValue = translateY._value + gestureState.dy;
            if (newValue >= heights[2] && newValue <= heights[0]) translateY.setValue(newValue);
        },
        onPanResponderRelease: (evt, gestureState) => {
            const { dy, vy } = gestureState;
            const currentY = translateY._value;
            let targetHeightIndex;

            if (Math.abs(vy) > 0.5) {
                targetHeightIndex = vy > 0 ? Math.min(sheetHeight + 1, 2) : Math.max(sheetHeight - 1, 0);
            } else {
                let minDistance = Infinity;
                heights.forEach((h, idx) => {
                    const distance = Math.abs(currentY - h);
                    if (distance < minDistance) {
                        minDistance = distance;
                        targetHeightIndex = idx;
                    }
                });
            }
            animateToHeight(targetHeightIndex);
        },
    });

    const animateToHeight = (heightIndex) => {
        setSheetHeight(heightIndex);
        Animated.spring(translateY, { toValue: heights[heightIndex], useNativeDriver: true, tension: 80, friction: 12 }).start();
    };

    useEffect(() => { animateToHeight(0); }, []);

    useEffect(() => {
        Animated.timing(buttonOpacity, { toValue: showActionButtons ? 1 : 0, duration: showActionButtons ? 300 : 200, useNativeDriver: true }).start();
        if (showActionButtons) animateToHeight(0);
    }, [showActionButtons]);

    useEffect(() => {
        if (!selectedLocation) return;

        const fetchAttractions = async () => {
            setIsLoading(true);
            setError(null);
            setAttractions([]); // attractions state를 초기화
            try {
                const { regionKey, sigunguKey } = selectedLocation;
                const url = `${getBaseURL()}/api/myTour/tourInfo/${regionKey}?sigunguCode=${sigunguKey}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                let items = data?.response?.body?.items?.item || [];
                if (!Array.isArray(items)) items = [items];
                
                setAttractions(items.filter(item => item.contenttypeid === '12'));
            } catch (e) {
                setError(e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAttractions();
    }, [selectedLocation]);

    const filteredAttractions = !searchText
    ? attractions
    : attractions.filter(a => a.title?.toLowerCase().includes(searchText.toLowerCase()));

    const isAttractionSelected = (id) => selectedAttractions.some(a => a.contentid === id);

    const renderAttraction = ({ item }) => (
        <AttractionCard
            key={item.contentid}
            attraction={{
                id: item.contentid,
                typeId: item.contenttypeid,
                typeName: contentTypeMap[item.contenttypeid] || '기타',
                name: item.title,
                image: item.firstimage,
                detailInfo: detailMap[item.contentid] || null
            }}
            isSelected={isAttractionSelected(item.contentid)}
            isExpanded={expandedSections[item.contentid]}
            onToggle={() => onAttractionToggle({
                id: item.contentid,
                name: item.title,
                image: item.firstimage
            })}
            onExpand={() => handleExpand(item)}
        />
    );

    const handleExpand = async (item) => {
        setExpandedSections(prev => ({ ...prev, [item.contentid]: !prev[item.contentid] }));

        if (detailMap[item.contentid]) {
            return;
        }

        try {
            const [commonRes, introRes] = await Promise.all([
                fetch(`${getBaseURL()}/api/myTour/commonInfo/${item.contentid}`),
                fetch(`${getBaseURL()}/api/myTour/introInfo/${item.contentid}/${item.contenttypeid}`)
            ]);

            const commonData = await commonRes.json();
            const introData = await introRes.json();

            const commonItem = commonData?.response?.body?.items?.item[0] || {};
            const introItem = introData?.response?.body?.items?.item[0] || {};

            setDetailMap(prev => ({
                ...prev,
                [item.contentid]: {
                    addr: `${commonItem.addr1 || ''} ${commonItem.addr2 || ''}`.trim(),
                    overview: commonItem.overview || '',
                    firstimage: commonItem.firstimage || null,
                    tel: commonItem.tel || '',
                    opendate: introItem.opendate || '',
                    parking: introItem.parking || '',
                    restdate: introItem.restdate || '',
                    usetime: introItem.usetime || ''
                }
            }));
        } catch (e) {
        }
    };

    return (
        <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
            <View {...panResponder.panHandlers} ref={panResponderHandleRef}>
                <View style={styles.handle} />
            </View>

            <FloatingActionButtons
                showActionButtons={showActionButtons}
                buttonOpacity={buttonOpacity}
                onGoBack={onGoBack}
                onConfirmItinerary={onConfirmItinerary}
                onRecommendAgain={onRecommendAgain}
            />

            <View style={styles.contentContainer}>
                <View style={styles.header}>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="#666" style={{ marginRight: 8 }} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="관심있는 관광지를 검색해보세요!"
                            placeholderTextColor="#999"
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.aiButton, selectedAttractions.length > 0 && styles.aiButtonActive]}
                        disabled={selectedAttractions.length === 0}
                        onPress={onAiItineraryPress}
                    >
                        <Text style={[styles.aiButtonText, selectedAttractions.length > 0 && styles.aiButtonTextActive]}>AI 일정</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={flatRegionList}
                    horizontal
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.regionButton,
                                selectedLocation?.uniqueKey === item.uniqueKey && styles.selectedRegionButton
                            ]}
                            onPress={() => {
                                setSelectedLocation(item);
                                setSearchText('');
                            }}
                        >
                            <Text style={[
                                styles.regionButtonText,
                                selectedLocation?.uniqueKey === item.uniqueKey && styles.selectedRegionButtonText
                            ]}>
                                {item.displayName}
                            </Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.uniqueKey}
                    showsHorizontalScrollIndicator={false}
                    style={styles.regionList}
                    contentContainerStyle={styles.regionListContent}
                />

                {isLoading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 200 }} />}
                {error && <Text style={{ padding: 16 }}>데이터를 불러오는 데 실패했습니다.</Text>}
                {!isLoading && !error && filteredAttractions.length === 0 && <Text style={{ padding: 16 }}>검색 결과가 없습니다.</Text>}

                <FlatList
                    data={filteredAttractions}
                    renderItem={renderAttraction}
                    keyExtractor={(item) => String(item.contentid)}
                    nestedScrollEnabled
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 320 }}
                />
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0, right: 0, bottom: 0, height: screenHeight,
        backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5,
        justifyContent: 'flex-start',
    },
    handle: { width: 40, height: 4, backgroundColor: '#ddd', borderRadius: 2, alignSelf: 'center', marginTop: 8, marginBottom: 16 },
    contentContainer: {
        paddingTop: 0,
    },
    header: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 16, alignItems: 'center', gap: 12 },
    searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 44 },
    searchInput: { flex: 1, fontSize: 16, color: '#333' },
    aiButton: { backgroundColor: '#f0f0f0', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8 },
    aiButtonActive: { backgroundColor: '#000' },
    aiButtonText: { color: '#999', fontSize: 14, fontWeight: '500' },
    aiButtonTextActive: { color: '#fff' },
    regionList: {
        paddingVertical: 8,
    },
    regionListContent: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    regionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        height: 36,
    },
    selectedRegionButton: {
        backgroundColor: '#000',
        borderColor: '#000',
    },
    regionButtonText: { color: '#666', fontSize: 14, fontWeight: '500' },
    selectedRegionButtonText: { color: '#fff' },
});

export default BottomSheet;