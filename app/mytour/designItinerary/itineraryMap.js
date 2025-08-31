// ItineraryMapRN.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Text, Platform } from 'react-native';
//import MapView, { Marker } from 'react-native-maps';
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

export default function ItineraryMap() {
  const router = useRouter();
  const { tourId, selectedRegions, itineraryTitle, periodData } = useLocalSearchParams();

  const [tourData, setTourData] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);

  // 예시 마커 좌표 (Kakao Map에서 받아온 좌표라 가정)
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    if (!tourId) return;

    const fetchTourData = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (!token) {
          console.warn("토큰이 없습니다!");
          return;
        }

        const response = await axios.get(
          `${getBaseURL()}/api/travelSchedule/travel/${tourId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setTourData(response.data);
        setScheduleData(response.data.schedules || []);

        // 예: 각 스케줄에 좌표가 있다고 가정
        const coords = (response.data.schedules || []).map(item => ({
          latitude: item.lat || 37.5665,
          longitude: item.lng || 126.9780,
          title: item.title,
        }));
        setMarkers(coords);

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
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: markers[0]?.latitude || 37.5665,
            longitude: markers[0]?.longitude || 126.9780,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {markers.map((marker, idx) => (
            <Marker
              key={idx}
              coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
              title={marker.title}
            />
          ))}
        </MapView>
      </View>

      <View style={styles.bottomSheetContainer}>
        <BottomSheet
          periodType={periodParsed.type}
          startDate={periodParsed.startDate}
          endDate={periodParsed.endDate}
          nights={periodParsed.nights}
          days={periodParsed.days}
        />
      </View>

      <View style={{ padding: 16 }}>
        <Text>DB에서 가져온 스케줄 수: {scheduleData.length}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { flex: 1 },
  bottomSheetContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000 }
});
