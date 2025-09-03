import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, Text, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BottomSheet from '../../../components/mytour/designItinerary/map/BottomSheet';
import DesignItineraryMapHeader from '../../../components/mytour/designItinerary/map/designItineraryMapHeader';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// --- 플랫폼별 지도 컴포넌트 로딩 로직 ---
let MapView = null;
let Marker = null;

if (Platform.OS !== 'web') {
  const RnMaps = require('react-native-maps');
  MapView = RnMaps.default;
  Marker = RnMaps.Marker;
}
// --- 끝 ---

const getBaseURL = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
    if (Platform.OS === 'web') return 'http://localhost:8080';
    return Constants.expoConfig?.extra?.API_BASE_URL_DEV;
  } else {
    return Constants.expoConfig?.extra?.API_BASE_URL_PROD;
  }
};

export default function ItineraryMap() {
  const router = useRouter();
  const { tourId, itineraryTitle, periodData } = useLocalSearchParams();

  console.log('1. useLocalSearchParams로 받은 데이터:', { tourId, itineraryTitle });
  
  const period = useMemo(() => {
    return periodData ? JSON.parse(periodData) : {};
  }, [periodData]);


  // --- 상태 관리 ---
  const [scheduleData, setScheduleData] = useState({});
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const mapRef = useRef(null);
  const [selectedDay, setSelectedDay] = useState('all');

  // --- API 데이터 로딩 ---
  useEffect(() => {
    if (!tourId) return;
    const fetchTourData = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (!token) return;

        const response = await axios.get(`${getBaseURL()}/api/travelSchedule/travel/${tourId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const schedules = response.data;
        if (!schedules || !Array.isArray(schedules) || schedules.length === 0) {
          setScheduleData({});
          return;
        }

        const validSchedules = schedules.filter(s => s.date);

        if (validSchedules.length === 0) {
          setScheduleData({});
          return;
        }

        validSchedules.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        const groupedByDay = validSchedules.reduce((acc, item) => {
          const firstDate = new Date(validSchedules[0].date);
          const currentDate = new Date(item.date);
          
          if (isNaN(firstDate.getTime()) || isNaN(currentDate.getTime())) return acc;

          const dayIndex = Math.floor((currentDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;

          if (!acc[dayIndex]) acc[dayIndex] = [];
          acc[dayIndex].push({
            id: item.id, name: item.title, category: item.tag,
            order: acc[dayIndex].length + 1, lat: item.latitude, lng: item.longitude
          });
          return acc;
        }, {});
        
        setScheduleData(groupedByDay);
      } catch (error) {
        console.error('스케줄 불러오기 실패:', error);
      }
    };
    fetchTourData();
  }, [tourId]);

  // --- BottomSheet 연동 함수 ---
  const handleDayChange = (dayKey) => {
    setSelectedDay(dayKey);
    setSelectedLocationId(null);

    const markersForDay = dayKey === 'all'
      ? Object.values(scheduleData).flat()
      : scheduleData[dayKey] || [];

    if (mapRef.current && markersForDay.length > 0) {
      // ✅ 1. 유효하지 않은 좌표(0, 0 등)를 먼저 걸러냅니다.
      const validCoordinates = markersForDay
        .map(marker => ({
          latitude: marker.lat,
          longitude: marker.lng,
        }))
        .filter(coord => 
            coord.latitude !== 0 && 
            coord.longitude !== 0 &&
            coord.latitude !== null &&
            coord.longitude !== null
        );

      // ✅ 2. 유효한 좌표가 남아있는 경우에만 지도를 조작합니다.
      if (validCoordinates.length > 0) {
        if (validCoordinates.length === 1) {
          // 핀이 하나일 때
          mapRef.current.animateToRegion({
            latitude: validCoordinates[0].latitude,
            longitude: validCoordinates[0].longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 1000);
        } else {
          // 핀이 여러 개일 때
          mapRef.current.fitToCoordinates(validCoordinates, {
            edgePadding: { top: 100, right: 80, bottom: 80, left: 80 },
            animated: true,
          });
        }
      }
    }
  };

  const handleLocationSelect = (location) => {
    if (mapRef.current && location.lat && location.lng) {
      setSelectedLocationId(location.id);
      mapRef.current.animateToRegion({
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const title = itineraryTitle || '';
  console.log(`2. 헤더(자식)에게 'title'이라는 이름으로 전달할 값: "${title}"`);

  //const dateInfo = { displayText: '기간 정보' };

  // ✅ 선택된 날짜에 따라 지도에 표시할 마커들을 결정합니다.
  const markersToDisplay = useMemo(() => {
    if (selectedDay === 'all') {
      return Object.values(scheduleData).flat();
    }
    return scheduleData[selectedDay] || [];
  }, [selectedDay, scheduleData]);
  
  // ✅ 표시될 마커가 변경될 때만 지도의 초기 위치를 다시 계산합니다.
  const initialRegion = useMemo(() => {
    if (markersToDisplay.length > 0) {
      return {
        latitude: markersToDisplay[0].lat,
        longitude: markersToDisplay[0].lng,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
      };
    }
    return { // 기본값: 서울 시청
      latitude: 37.5665,
      longitude: 126.9780,
      latitudeDelta: 0.15,
      longitudeDelta: 0.15,
    };
  }, [markersToDisplay]);

  return (
    <SafeAreaView style={styles.container}>
      <DesignItineraryMapHeader
        title={itineraryTitle || ''} 
        startDate={period.startDate}
        endDate={period.endDate}
        periodType={period.type}
        onBackPress={() => router.back()}
        onMemberPress={() => console.log('멤버 아이콘 클릭')}
      />


      <View style={styles.mapContainer}>
        {Platform.OS !== 'web' && MapView ? (
          <MapView ref={mapRef} style={{ flex: 1 }} initialRegion={initialRegion}>
            {markersToDisplay.map((marker) => (
              <Marker
                key={marker.id}
                coordinate={{ latitude: marker.lat, longitude: marker.lng }}
                title={marker.name}
              >
                <View style={[
                  styles.marker,
                  selectedLocationId === marker.id && styles.selectedMarker
                ]}>
                  <Text style={styles.markerText}>{marker.order}</Text>
                </View>
              </Marker>
            ))}
          </MapView>
        ) : (
          <View style={styles.webMapPlaceholder}>
            <Text>지도는 웹에서 지원되지 않습니다.</Text>
          </View>
        )}
      </View>

      <View style={styles.bottomSheetContainer}>
        <BottomSheet
          itineraryData={scheduleData}
          onLocationSelect={handleLocationSelect}
          onDayChange={handleDayChange}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  mapContainer: { flex: 1 },
  bottomSheetContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000 },
  webMapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
  marker: {
    backgroundColor: '#0064FF',
    padding: 5,
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  selectedMarker: {
    backgroundColor: '#FF5733',
    transform: [{ scale: 1.2 }],
  },
  markerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

