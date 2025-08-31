// ItineraryMapRN.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Text, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BottomSheet from '../../../components/mytour/designItinerary/map/BottomSheet';
import DesignItineraryMapHeader from '../../../components/mytour/designItinerary/map/designItineraryMapHeader';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const getBaseURL = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
    if (Platform.OS === 'web') return 'http://localhost:8080';
    return Constants.expoConfig?.extra?.API_BASE_URL_DEV;
  } else {
    return Constants.expoConfig?.extra?.API_BASE_URL_PROD;
  }
};

let MapViewComp = MapView;
let MarkerComp = Marker;

if (Platform.OS !== 'web') {
  const RnMaps = require('react-native-maps');
  MapViewComp = RnMaps.default;
  MarkerComp = RnMaps.Marker;
}

export default function ItineraryMap() {
  const router = useRouter();
  const { tourId, selectedRegions, itineraryTitle, periodData } = useLocalSearchParams();

  const [tourData, setTourData] = useState(null);
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

        console.log("API Response:", response.data);

        const schedules = response.data;

        // 날짜 기준으로 그룹화
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
        console.log("Grouped Schedules:", groupedByDay);

      } catch (error) {
        console.error('스케줄 불러오기 실패:', error);
      }
    };

    fetchTourData();
  }, [tourId]);

  const regionsParsed = selectedRegions ? JSON.parse(selectedRegions) : tourData?.regions || [];
  const title = itineraryTitle || tourData?.title || '';
  const periodParsed = periodData ? JSON.parse(periodData) : {
    type: tourData?.periodType || '',
    startDate: tourData?.startDate,
    endDate: tourData?.endDate,
    nights: tourData?.nightCount,
    days: tourData?.dayCount
  };

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
        {Platform.OS !== 'web' ? (
          <MapViewComp
            style={{ flex: 1 }}
            initialRegion={{
              latitude: markers[0]?.latitude || 37.5665,
              longitude: markers[0]?.longitude || 126.9780,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {markers.map((marker, idx) => (
              <MarkerComp
                key={idx}
                coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                title={marker.title}
              />
            ))}
          </MapViewComp>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>웹에서는 지도 미지원</Text>
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
          itineraryData={scheduleData} // day별 그룹화 데이터 전달
        />
      </View>

      <View style={{ padding: 16 }}>
        <Text>DB에서 가져온 스케줄 일수: {Object.keys(scheduleData).length}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { flex: 1 },
  bottomSheetContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000 }
});
