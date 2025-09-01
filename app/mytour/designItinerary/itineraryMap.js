import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Text, Platform } from 'react-native';
// 1. 최상단 import 문을 제거합니다. 이것이 웹 번들링 오류의 핵심 원인입니다.
// import MapView, { Marker } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BottomSheet from '../../../components/mytour/designItinerary/map/BottomSheet';
import DesignItineraryMapHeader from '../../../components/mytour/designItinerary/map/designItineraryMapHeader';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// 2. 웹에서는 null, 모바일에서는 실제 컴포넌트를 담을 변수를 선언합니다.
let MapView = null;
let Marker = null;

// 3. 웹이 아닐 경우에만 'react-native-maps'를 불러와 변수에 할당합니다.
if (Platform.OS !== 'web') {
  const RnMaps = require('react-native-maps');
  MapView = RnMaps.MapView; // default가 아닌 MapView를 직접 사용합니다.
  Marker = RnMaps.Marker;
}

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
  const { tourId, selectedRegions, itineraryTitle, periodData } = useLocalSearchParams();

  const [scheduleData, setScheduleData] = useState({}); // day별 그룹
  const [markers, setMarkers] = useState([]);

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
        const groupedByDay = schedules.reduce((acc, item) => {
          const firstDate = new Date(schedules[0].date);
          const currentDate = new Date(item.date);
          const dayIndex = Math.floor((currentDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;

          if (!acc[dayIndex]) acc[dayIndex] = [];
          acc[dayIndex].push({
            id: item.id,
            name: item.title,
            category: item.tag,
            order: acc[dayIndex].length + 1,
            lat: item.latitude,
            lng: item.longitude
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

  // [개선 사항] scheduleData가 변경될 때 마커 데이터를 생성합니다.
  useEffect(() => {
    const allMarkers = Object.values(scheduleData).flat().map(item => ({
      latitude: item.lat,
      longitude: item.lng,
      title: item.name,
    }));
    setMarkers(allMarkers);
  }, [scheduleData]);


  const regionsParsed = selectedRegions ? JSON.parse(selectedRegions) : [];
  const title = itineraryTitle || '';
  const periodParsed = periodData ? JSON.parse(periodData) : {};

  const formatDateRange = () => {
    if (periodParsed.type === 'date' && periodParsed.startDate && periodParsed.endDate) {
      return {
        startDate: periodParsed.startDate,
        endDate: periodParsed.endDate,
        displayText: `${periodParsed.startDate} - ${periodParsed.endDate}`
      };
    } else if (periodParsed.type === 'duration' && periodParsed.nights && periodParsed.days) {
      return { displayText: `${periodParsed.nights}박 ${periodParsed.days}일` };
    }
    return { displayText: '' };
  };

  const dateInfo = formatDateRange();
  const handleBackPress = () => router.back();
  const handleMemberPress = () => console.log('멤버 아이콘 클릭');

  // [개선 사항] 마커 데이터가 없을 때를 대비한 기본 지도 위치
  const initialRegion = {
    latitude: markers.length > 0 ? markers[0].latitude : 37.5665, // 서울 시청
    longitude: markers.length > 0 ? markers[0].longitude : 126.9780,
    latitudeDelta: 0.15, // Delta 값을 조금 넓혀서 시작
    longitudeDelta: 0.15,
  };

  return (
    <SafeAreaView style={styles.container}>
      <DesignItineraryMapHeader
        title={title}
        dateRange={dateInfo.displayText}
        startDate={dateInfo.startDate}
        endDate={dateInfo.endDate}
        periodType={periodParsed.type}
        onBackPress={handleBackPress}
        onMemberPress={handleMemberPress}
      />

      <View style={styles.mapContainer}>
        {/* 4. JSX 렌더링 부분은 거의 동일하지만, 변수 이름을 MapView, Marker로 사용합니다. */}
        {Platform.OS !== 'web' && MapView ? (
          <MapView
            style={{ flex: 1 }}
            initialRegion={initialRegion}
          >
            {markers.map((marker, idx) => (
              <Marker
                key={idx}
                coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                title={marker.title}
              />
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
          periodType={periodParsed.type}
          startDate={periodParsed.startDate}
          endDate={periodParsed.endDate}
          nights={periodParsed.nights}
          days={periodParsed.days}
          itineraryData={scheduleData}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  mapContainer: { flex: 1 },
  bottomSheetContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000 },
  webMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0'
  }
});
