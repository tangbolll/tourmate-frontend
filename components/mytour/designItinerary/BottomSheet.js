import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    Animated, PanResponder, Dimensions, FlatList, ActivityIndicator, Platform, Alert 
} from 'react-native';
// Note: These imports are for the React Native environment and will not resolve in a web browser.
// The code is intended for an Expo/React Native project.
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import FloatingActionButtons from './FloatingActionButtons';
import AttractionCard from './AttractionCard';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import AiItineraryDesignPopup from './AiItineraryDesignPopup'; 


const { height: screenHeight } = Dimensions.get('window');

import { API_URL } from '../../../utils/apiConfig';

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
    regions, onAttractionToggle,
    onAiItineraryPress, showActionButtons = false,
    onConfirmItinerary, onRecommendAgain, onGoBack, onAddToSchedule,
    onCreateSchedule, periodType, startDate, endDate, nights, days, travelId // 새로 추가된 prop
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

        console.log('BottomSheet가 받은 regions 데이터:', JSON.stringify(regions, null, 2));

        return regions.flatMap(region =>
            region.sigungu.map(sgg => ({
                displayName: `${region.areaName} ${sgg.name}`, // 예: '경기도 수원시'
                regionKey: region.areaCode,                     // API 요청에 필요한 지역 코드
                sigunguKey: sgg.code,                       // API 요청에 필요한 시군구 코드
                uniqueKey: `${region.areaCode}-${sgg.code}`      // FlatList key로 사용할 고유 값
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
            setAttractions([]);
            try {
                // ✅ 2. 이제 AsyncStorage가 정상적으로 동작합니다.
                const token = await AsyncStorage.getItem('jwtToken');
                if (!token) throw new Error('인증 토큰이 없습니다.');

                const { regionKey, sigunguKey } = selectedLocation;
                
                const url = `${API_URL}/api/myTour/tourInfo/${regionKey}?sigunguCode=${sigunguKey}`;
                
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                let items = data?.response?.body?.items?.item || [];
                if (!Array.isArray(items)) items = [items];
                
                const validAttractions = items.filter(item => 
                    item.contenttypeid === '12' && // 1. 관광지 타입이어야 하고
                    item.contentid &&              // 2. ✅ ID가 반드시 존재해야 하며
                    item.title                     // 3. ✅ 이름도 반드시 존재해야 함
                );

                setAttractions(validAttractions);
            } catch (e) {
                setError(e);
                console.error("관광지 목록 로딩 실패:", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAttractions();
    }, [selectedLocation]);

    const filteredAttractions = !searchText
    ? attractions
    : attractions.filter(a => a.title?.toLowerCase().includes(searchText.toLowerCase()));

    const isAttractionSelected = (id) => selectedAttractions.some(a => a.id === id); // selectedAttractions 구조에 맞게 a.id로 수정

    const renderAttraction = ({ item }) => (
        <AttractionCard
            attraction={{
                id: item.contentid,
                typeId: item.contenttypeid,
                typeName: contentTypeMap[item.contenttypeid] || '기타',
                name: item.title,
                image: item.firstimage,
                detailInfo: detailMap[item.contentid] || null
            }}
            isSelected={isAIGenerating ? isAiAttractionSelected(item.contentid) : selectedAttractions.some(a => a.id === item.contentid)}
            isExpanded={expandedSections[item.contentid]}
            onToggle={onAttractionToggle}

            // 👇 역할 1: 일반 모드용 prop은 부모로부터 받은 onAddToSchedule을 그대로 전달
            onAddToSchedule={onAddToSchedule} 
            onExpand={() => handleExpand(item)}

            // 👇 역할 2: AI 모드용 prop은 handleToggleAiAttraction 함수와 연결
            onToggleSelection={(attraction) => {
                handleToggleAiAttraction(attraction.id);
            }}

            isAIGenerating={isAIGenerating}
        />
    );

    const handleExpand = async (item) => {
        setExpandedSections(prev => ({ ...prev, [item.contentid]: !prev[item.contentid] }));
        if (detailMap[item.contentid]) return;

        try {
            // ✅ 3. 여기도 AsyncStorage가 정상적으로 동작합니다.
            const token = await AsyncStorage.getItem('jwtToken');
            if (!token) throw new Error('인증 토큰이 없습니다.');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [commonRes, introRes] = await Promise.all([
                fetch(`${API_URL}/api/myTour/commonInfo/${item.contentid}`, { headers }),
                fetch(`${API_URL}/api/myTour/introInfo/${item.contentid}/${item.contenttypeid}`, { headers })
            ]);
            
            // ... (이하 데이터 처리 로직은 동일)
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
            console.error("상세정보 불러오기 실패:", e);
        }
    };

    const [isAIGenerating, setIsAIGenerating] = useState(false);
    const [aiSelectedAttractions, setAiSelectedAttractions] = useState([]);
    const [selectedAttractions, setSelectedAttractions] = useState([]);
    const [showAiPopup, setShowAiPopup] = useState(false);
    const [tempSelectedAttractions, setTempSelectedAttractions] = useState([]);


    // AI 일정 생성 시작
    const handleAIGenerateStart = () => {
        // '기간' 기반(duration) 여행일 경우 기능 제한
        if (periodType === 'duration') {
            Alert.alert(
                "업데이트 준비 중", // 팝업 제목
                "일자별 AI 일정 생성은 아직 준비중입니다! 다음 업데이트에 만나요", // 팝업 메시지
                [{ text: "확인" }] // 버튼
            );
            return; // AI 생성 모드로 진입하지 않고 함수를 종료합니다.
        }

        // '날짜' 기반(date) 여행일 경우에만 기존 로직 실행
        setIsAIGenerating(true);
    };

    // 관광지 중복 선택 토글
    const handleToggleAiAttraction = (attractionId) => {
    setAiSelectedAttractions(prev =>
        prev.includes(attractionId)
        ? prev.filter(id => id !== attractionId)
        : [...prev, attractionId]
    );
    };

    const isAiAttractionSelected = (id) => aiSelectedAttractions.includes(id);

    // 일정생성 끝내기
    const handleAIGenerateEnd = () => {
    setIsAIGenerating(false);
    setSelectedAttractions([]);
    };

    // 일정 생성 버튼 클릭 핸들러 (AI 모드용)
    const handleCreateSchedule = () => {
        const selectedAttractionsData = attractions
            .filter(attraction => aiSelectedAttractions.includes(attraction.contentid))
            .map(attraction => ({
                id: attraction.contentid,
                name: attraction.title,
                image: attraction.firstimage,
                typeId: attraction.contenttypeid,
                typeName: contentTypeMap[attraction.contenttypeid] || '기타',
                detailInfo: detailMap[attraction.contentid] || null
            }));

        console.log('🎯 AI 모드 - 일정 생성 버튼 클릭!');
        console.log('📋 선택된 관광지 목록:', selectedAttractionsData);
        console.log('📊 선택된 관광지 개수:', selectedAttractionsData.length);
        
        setTempSelectedAttractions(selectedAttractionsData); // Store the data
        setShowAiPopup(true); // Show the popup
    };

    
    const convertDateStringsToISO = (dateStrings) => {
        return dateStrings.map(ds => {
            // '9.1 (월)' → '2025-09-01' 변환 구현
            const match = ds.match(/(\d{1,2})\.(\d{1,2})/);
            if (!match) return ds; // 포맷이 안 맞으면 그대로 반환
            const month = match[1].padStart(2, '0');
            const day = match[2].padStart(2, '0');
            return `2025-${month}-${day}`;
        });
    };

    // startDate, endDate 사이 모든 날짜를 ISO 배열로 생성
    const generateFullDateList = (startDate, endDate) => {
        const dates = [];
        let current = new Date(startDate);
        const end = new Date(endDate);

        while (current <= end) {
            const isoDate = current.toISOString().split('T')[0]; // YYYY-MM-DD
            dates.push(isoDate);
            current.setDate(current.getDate() + 1);
        }

        return dates;
    };

    // 사용자의 여행 스타일 선호를 enum으로 매핑하는 함수
    const mapPreferenceToStyleEnum = (preference) => {
        if (!preference) return null;
        const lowerPref = preference.toLowerCase();
        if (lowerPref.includes('부지런')) return 'TIGHT';
        if (lowerPref.includes('느긋') || lowerPref.includes('편안')) return 'RELAXED';
        // 기본값
        return 'RELAXED';
    };

    // handleAiPopupConfirm 함수 수정
    const handleAiPopupConfirm = async (result) => {
        try {
            console.log("AI 일정 생성 준비 데이터: ", result);
            
            const dates = result.selectedDates.includes('전체')
                ? generateFullDateList(startDate, endDate)
                : convertDateStringsToISO(result.selectedDates);

            const style = mapPreferenceToStyleEnum(result.selectedPreference);

            const requestBody = {
                travelId,
                dates,
                style,
                attractionList: tempSelectedAttractions.map(a => ({
                    id: a.id,
                    name: a.name,
                    image: a.image,
                    typeId: a.typeId,
                    typeName: a.typeName
                }))
            };

            console.log('서버 전송 데이터:', JSON.stringify(requestBody, null, 2));

            const token = await AsyncStorage.getItem('jwtToken');
            if (!token) throw new Error('인증 토큰이 없습니다.');

            const url = `${API_URL}/api/ai/generate-suggestions`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const aiResponseData = await response.json();
            console.log('서버 AI 응답:', aiResponseData);

            // ✅ 핵심: AI 응답을 부모 컴포넌트로 전달
            if (onCreateSchedule) {
                onCreateSchedule(tempSelectedAttractions, result, aiResponseData);
            }

        } catch (error) {
            console.error('AI 일정 생성 중 오류:', error);
            Alert.alert('오류', 'AI 일정 생성에 실패했습니다.');
        } finally {
            setShowAiPopup(false);
            setTempSelectedAttractions([]);
            setIsAIGenerating(false); // AI 모드 종료
            setAiSelectedAttractions([]); // 선택된 관광지 초기화
        }
    };

    // 3. AI 스케줄 컨트롤 컴포넌트 (새로 생성)

    const AiScheduleControls = ({ onConfirm, onRetry, onRevert }) => {
        return (
            <View style={styles.aiControlsContainer}>
                <Text style={styles.aiControlsTitle}>AI 추천 일정을 확인해보세요!</Text>
                <View style={styles.aiControlsButtons}>
                    <TouchableOpacity 
                        style={[styles.aiControlButton, styles.revertButton]} 
                        onPress={onRevert}
                    >
                        <Text style={styles.aiControlButtonText}>되돌리기</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.aiControlButton, styles.retryButton]} 
                        onPress={onRetry}
                    >
                        <Text style={styles.aiControlButtonText}>다시 추천</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.aiControlButton, styles.confirmButton]} 
                        onPress={onConfirm}
                    >
                        <Text style={[styles.aiControlButtonText, styles.confirmButtonText]}>확정하기</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };


    return (

        <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
            <View {...panResponder.panHandlers} ref={panResponderHandleRef}>
                <View style={styles.handle} />
            </View>

            {isAIGenerating && (
                <View style={styles.aiGeneratingHeader}>
                <Text style={styles.aiGeneratingText}>AI 일정 생성 중입니다.</Text>
                <TouchableOpacity onPress={handleAIGenerateEnd}>
                    <Text style={styles.aiGeneratingEndText}>일정생성 끝내기</Text>
                </TouchableOpacity>
                </View>
            )}

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
                            placeholder="먼저 관심있는 관광지를 검색해보세요!"
                            placeholderTextColor="#999"
                            value={searchText}
                            onChangeText={setSearchText}
                            editable={!isAIGenerating}
                            />
                        </View>

                        {!isAIGenerating && (
                            <TouchableOpacity
                                style={[styles.aiButton, styles.aiButtonActive]}
                                onPress={handleAIGenerateStart}
                            >
                                <Text style={[styles.aiButtonText, styles.aiButtonTextActive]}>AI 일정</Text>
                            </TouchableOpacity>
                        )}

                        {isAIGenerating && (
                            <TouchableOpacity
                                style={[styles.aiButton, styles.aiButtonActive, aiSelectedAttractions.length === 0 && styles.aiButtonDisabled]}
                                onPress={handleCreateSchedule}
                                disabled={aiSelectedAttractions.length === 0}
                            >
                                <Text style={[styles.aiButtonText, styles.aiButtonTextActive, aiSelectedAttractions.length === 0 && styles.aiButtonTextDisabled]}>
                                    일정 생성
                                </Text>
                            </TouchableOpacity>
                        )}
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
                    keyExtractor={(item, index) => String(item.contentid || `attraction-${index}`)}
                    showsHorizontalScrollIndicator={false}
                    style={styles.regionList}
                    contentContainerStyle={styles.regionListContent}
                />

                <View style={styles.listContainer}>
                    {isLoading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 200 }} />}
                    {error && <Text style={{ padding: 16 }}>데이터를 불러오는 데 실패했습니다.</Text>}
                    {!isLoading && !error && filteredAttractions.length === 0 && <Text style={{ padding: 16 }}>검색 결과가 없습니다.</Text>}

                    <FlatList
                        data={filteredAttractions}
                        renderItem={renderAttraction}
                        keyExtractor={(item, index) => String(item.contentid || `attraction-${index}`)}
                        nestedScrollEnabled
                        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 150 }}
                    />
                </View>

                {/* AI 일정 생성 중일 때 생성하기 버튼 */}
                {isAIGenerating && (
                <TouchableOpacity
                    style={styles.generateButton}
                    onPress={() => onAiItineraryPress(aiSelectedAttractions)}
                    disabled={aiSelectedAttractions.length === 0}
                >
                    <Text style={styles.generateButtonText}>생성하기</Text>
                </TouchableOpacity>
                )}

                {showAiPopup && (
                <AiItineraryDesignPopup
                visible={showAiPopup}
                onClose={() => setShowAiPopup(false)}
                onConfirm={handleAiPopupConfirm}
                periodType={periodType}   // 부모에서 실제 값 넘기기
                startDate={startDate}
                endDate={endDate}
                nights={nights}
                days={days}
                selectedAttractions={tempSelectedAttractions}
                />
                )}

            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0, height: screenHeight,
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.25,
    shadowRadius: 3.84, elevation: 5,
    justifyContent: 'flex-start',
  },
  handle: { width: 40, height: 4, backgroundColor: '#ddd', borderRadius: 2, alignSelf: 'center', marginTop: 8, marginBottom: 16 },
  contentContainer: { paddingTop: 0, flex: 1 },
  header: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 16, alignItems: 'center', gap: 12 },
  searchContainer: {
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 44
  },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  buttonContainer: { 
    flexDirection: 'row', 
    gap: 8 
  },
  aiButton: { 
    backgroundColor: '#f0f0f0', 
    paddingHorizontal: 10, 
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  aiButtonActive: { backgroundColor: '#000' },
  aiButtonDisabled: { backgroundColor: '#ccc' },
  aiButtonText: { 
    color: '#999', 
    fontSize: 13, 
    fontWeight: '500' 
  },
  aiButtonTextActive: { color: '#fff' },
  aiButtonTextDisabled: { color: '#999' },
  aiGeneratingHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: '#ddd',
    backgroundColor: '#fafafa',
    marginBottom: 10,
  },
  aiGeneratingText: { fontSize: 14, fontWeight: '600' },
  aiGeneratingEndText: { fontSize: 14, color: '#007AFF' },
  generateButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    alignItems: 'center',
  },
  generateButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  regionList: { flexGrow: 0, paddingTop: 4, paddingBottom: 12 },
  regionListContent: { alignItems: 'center', paddingHorizontal: 16 },
  regionButton: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
    borderColor: '#ddd', marginRight: 8, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#fff', height: 36,
  },
  selectedRegionButton: { backgroundColor: '#000', borderColor: '#000' },
  regionButtonText: { color: '#666', fontSize: 14, fontWeight: '500' },
  selectedRegionButtonText: { color: '#fff' },
  listContainer: { flex: 1 }
});

const aiControlStyles = StyleSheet.create({
    aiControlsContainer: {
        position: 'absolute',
        top: 60,
        left: 16,
        right: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 100,
    },
    aiControlsTitle: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 16,
        color: '#333',
    },
    aiControlsButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    aiControlButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    revertButton: {
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    retryButton: {
        backgroundColor: '#007AFF',
    },
    confirmButton: {
        backgroundColor: '#34C759',
    },
    aiControlButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    confirmButtonText: {
        color: '#fff',
    },
});


export default BottomSheet;