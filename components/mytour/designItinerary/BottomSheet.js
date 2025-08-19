import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Animated, PanResponder, Dimensions, FlatList, ActivityIndicator, Platform
} from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import FloatingActionButtons from './FloatingActionButtons';
import AttractionCard from './AttractionCard';

const { height: screenHeight } = Dimensions.get('window');

const getBaseURL = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
    return Constants.expoConfig?.extra?.API_BASE_URL_DEV;
  } else {
    return Constants.expoConfig?.extra?.API_BASE_URL_PROD;
  }
};

// contentTypeId-텍스트 매핑 객체 
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
  const [selectedRegion, setSelectedRegion] = useState(regions[0] || null);
  const [expandedSections, setExpandedSections] = useState({});
  const [sheetHeight, setSheetHeight] = useState(0);
  const [attractions, setAttractions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detailMap, setDetailMap] = useState({});


  const translateY = useRef(new Animated.Value(screenHeight * 0.85)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  const heights = [screenHeight * 0.9, screenHeight * 0.5, screenHeight * 0.2];

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => Math.abs(gestureState.dy) > 20,
    onPanResponderMove: (evt, gestureState) => {
      const newValue = heights[sheetHeight] + gestureState.dy;
      if (newValue >= heights[2] && newValue <= heights[0]) translateY.setValue(newValue);
    },
    onPanResponderRelease: (evt, gestureState) => {
      const { dy, vy } = gestureState;
      const currentHeight = heights[sheetHeight];
      if (Math.abs(vy) > 0.5) {
        const nextHeight = vy > 0 ? Math.min(sheetHeight + 1, 2) : Math.max(sheetHeight - 1, 0);
        animateToHeight(nextHeight);
      } else {
        const currentY = currentHeight + dy;
        let targetHeight = 0, minDistance = Math.abs(currentY - heights[0]);
        heights.forEach((h, idx) => {
          const distance = Math.abs(currentY - h);
          if (distance < minDistance) { minDistance = distance; targetHeight = idx; }
        });
        animateToHeight(targetHeight);
      }
    },
  });

  const animateToHeight = (heightIndex) => {
    setSheetHeight(heightIndex);
    Animated.spring(translateY, { toValue: heights[heightIndex], useNativeDriver: true, tension: 100, friction: 8 }).start();
  };

  useEffect(() => { animateToHeight(0); }, []);

  useEffect(() => {
    Animated.timing(buttonOpacity, { toValue: showActionButtons ? 1 : 0, duration: showActionButtons ? 300 : 200, useNativeDriver: true }).start();
    if (showActionButtons) animateToHeight(0);
  }, [showActionButtons]);

  useEffect(() => {
    if (!selectedRegion) return;
    // BottomSheet.js의 useEffect 내부

    const fetchAttractions = async () => {
        setIsLoading(true); setError(null); setAttractions([]);
        try {
            const url = `${getBaseURL()}/api/myTour/tourInfo/${selectedRegion.parentCode}?sigunguCode=${selectedRegion.code}`;
            const response = await fetch(url);

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            let items = data?.response?.body?.items?.item || [];
            if (!Array.isArray(items)) items = [items];

            // ❗️ 1. 이 필터링 로직을 추가합니다.
            // contenttypeid가 '12'(관광지)인 항목만 남깁니다.
            const filteredItems = items.filter(item => item.contenttypeid === '12');

            // ❗️ 2. 필터링된 결과를 state에 저장합니다.
            setAttractions(filteredItems);

        } catch (e) {
            setError(e); console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    fetchAttractions();
  }, [selectedRegion]);

  const filteredAttractions = !searchText ? attractions : attractions.filter(a => a.title?.toLowerCase().includes(searchText.toLowerCase()));
  const isAttractionSelected = (id) => selectedAttractions.some(a => a.contentid === id);

  const renderRegionButton = ({ item }) => (
    <TouchableOpacity
      style={[styles.regionButton, selectedRegion?.key === item.key && styles.selectedRegionButton]}
      onPress={() => { setSelectedRegion(item); setSearchText(''); }}
    >
      <Text style={[styles.regionButtonText, selectedRegion?.key === item.key && styles.selectedRegionButtonText]}>
        {item.key.replace('-', ' ')}
      </Text>
    </TouchableOpacity>
  );

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

  // 이미 상세 정보가 로드된 경우, 캐시된 데이터를 사용합니다.
  if (detailMap[item.contentid]) {
    console.log("캐시된 상세 정보 사용:", detailMap[item.contentid]);
    return;
  }

  try {
    // 공통 정보와 소개 정보를 동시에 요청합니다.
    const [commonRes, introRes] = await Promise.all([
      fetch(`${getBaseURL()}/api/myTour/commonInfo/${item.contentid}`),
      fetch(`${getBaseURL()}/api/myTour/introInfo/${item.contentid}/${item.contenttypeid}`)
    ]);

    const commonData = await commonRes.json();
    const introData  = await introRes.json();

    // API 응답에서 'item'은 배열이므로 첫 번째 요소([0])에 접근합니다.
    const commonItem = commonData?.response?.body?.items?.item[0] || {};
    const introItem  = introData?.response?.body?.items?.item[0] || {};

    // 상태에 상세 정보를 저장합니다.
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




  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]} {...panResponder.panHandlers}>
      <FloatingActionButtons
        showActionButtons={showActionButtons}
        buttonOpacity={buttonOpacity}
        onGoBack={onGoBack}
        onConfirmItinerary={onConfirmItinerary}
        onRecommendAgain={onRecommendAgain}
      />

      <View style={styles.handle} />
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
        data={regions}
        horizontal
        renderItem={renderRegionButton}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        style={{ paddingHorizontal: 16, paddingBottom: 8 }}
      />

      {isLoading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />}
      {error && <Text style={{ padding: 16 }}>데이터를 불러오는 데 실패했습니다.</Text>}
      {!isLoading && !error && filteredAttractions.length === 0 && <Text style={{ padding: 16 }}>검색 결과가 없습니다.</Text>}

      <FlatList
        data={filteredAttractions}
        renderItem={renderAttraction}
        keyExtractor={(item) => item.contentid}
        nestedScrollEnabled
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0, height: screenHeight,
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5,
  },
  handle: { width: 40, height: 4, backgroundColor: '#ddd', borderRadius: 2, alignSelf: 'center', marginTop: 8, marginBottom: 16 },
  header: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 16, alignItems: 'center', gap: 12 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  aiButton: { backgroundColor: '#f0f0f0', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8 },
  aiButtonActive: { backgroundColor: '#000' },
  aiButtonText: { color: '#999', fontSize: 14, fontWeight: '500' },
  aiButtonTextActive: { color: '#fff' },
  regionButton: {
      // 모양 및 크기 설정
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#ddd',
      marginRight: 8,

      justifyContent: 'center',
      alignItems: 'center',

      // 기본 배경색
      backgroundColor: '#fff',
  },
  selectedRegionButton: {
      backgroundColor: '#000',    // 배경색만 검은색으로 변경
      borderColor: '#000',        // 테두리 색도 검은색으로 맞춰서 안 보이게 처리
  },
  regionButtonText: { color: '#666', fontSize: 14, fontWeight: '500' },
  selectedRegionButtonText: { color: '#fff' },
});

export default BottomSheet;
