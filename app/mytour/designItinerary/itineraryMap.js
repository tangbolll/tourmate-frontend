import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BottomSheet from '../../../components/mytour/designItinerary/map/BottomSheet';
import DesignItineraryMapHeader from '../../../components/mytour/designItinerary/map/designItineraryMapHeader';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBaseURL } from '../../../utils/apiConfig';
import { searchLocation } from '../../../utils/locationUtils';
import { WebView } from 'react-native-webview';

// 카카오 JavaScript API 키를 입력하세요.
const kakaoJavaScriptApiKey = 'db029e231db073bfecc94156e14ecf9c';

export default function ItineraryMap() {
  const router = useRouter();
  const { tourId, itineraryTitle, periodData } = useLocalSearchParams();

  const period = useMemo(() => {
    return periodData ? JSON.parse(periodData) : {};
  }, [periodData]);

  // --- 상태 관리 ---
  const [scheduleData, setScheduleData] = useState({});
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1); // 'all' 대신 1로 초기화
  const [isWebViewReady, setIsWebViewReady] = useState(false);

  // --- Ref 관리 ---
  const webViewRef = useRef(null);

  // --- 총 여행 일수 계산 ---
  const totalDays = useMemo(() => {
    // period.days가 있으면 그것을 사용, 없으면 scheduleData에서 최대 일차 계산
    if (period.days) {
      return parseInt(period.days, 10);
    }
    
    // scheduleData에서 가장 큰 일차 번호 찾기
    const dayKeys = Object.keys(scheduleData).map(key => parseInt(key, 10)).filter(num => !isNaN(num));
    return dayKeys.length > 0 ? Math.max(...dayKeys) : 5; // 기본값 5일
  }, [period.days, scheduleData]);

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
        let schedules = response.data;
        if (!schedules || !Array.isArray(schedules) || schedules.length === 0) {
          setScheduleData({});
          return;
        }

        // Process schedules to include coordinates for string locations
        const processedSchedules = await Promise.all(schedules.map(async (item) => {
          if ((!item.latitude || !item.longitude) && typeof item.location === 'string') {
            const locationData = await searchLocation(item.location);
            if (locationData) {
              return {
                ...item,
                latitude: parseFloat(locationData.y),
                longitude: parseFloat(locationData.x),
                name: locationData.place_name, // Update name from search result
              };
            }
          }
          return item;
        }));

        let groupedByDay = {};
        const currentPeriodType = period.type;
        if (currentPeriodType === 'date') {
          const validSchedules = processedSchedules.filter(s => s.date).sort((a, b) => new Date(a.date) - new Date(b.date));
          if (validSchedules.length > 0) {
            const firstDate = new Date(validSchedules[0].date);
            groupedByDay = validSchedules.reduce((acc, item) => {
              const currentDate = new Date(item.date);
              const dayIndex = Math.floor((currentDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;
              if (!acc[dayIndex]) acc[dayIndex] = [];
              acc[dayIndex].push({
                id: item.id, name: item.title, category: item.tag,
                order: acc[dayIndex].length + 1, lat: item.latitude, lng: item.longitude,
                startTime: item.startTime, 
                endTime: item.endTime
              });
              return acc;
            }, {});
          }
        } else if (currentPeriodType === 'duration') {
          groupedByDay = processedSchedules.reduce((acc, item) => {
            if (item.dayDescription) {
              const dayMatch = String(item.dayDescription).match(/\d+/);
              if (dayMatch && dayMatch[0]) {
                const dayIndex = parseInt(dayMatch[0], 10);
                if (!acc[dayIndex]) acc[dayIndex] = [];
                acc[dayIndex].push({
                  id: item.id, name: item.title, category: item.tag,
                  order: acc[dayIndex].length + 1, lat: item.latitude, lng: item.longitude
                });
              }
            }
            return acc;
          }, {});
        }
        setScheduleData(groupedByDay);
      } catch (error) {
        console.error('스케줄 불러오기 실패:', error);
      }
    };
    fetchTourData();
  }, [tourId, period.type]);

  // --- 마커 데이터 ---
  const markersToDisplay = useMemo(() => {
    return scheduleData[selectedDay] || [];
  }, [selectedDay, scheduleData]);
  
  // --- WebView가 준비되고 마커가 변경될 때, 웹뷰로 데이터를 전송 ---
  useEffect(() => {
    if (isWebViewReady && webViewRef.current) {
      const validMarkers = markersToDisplay.filter(m => m.lat && m.lng);
      const message = JSON.stringify({
        type: 'UPDATE_MARKERS',
        payload: validMarkers,
      });
      webViewRef.current.postMessage(message);
    }
  }, [markersToDisplay, isWebViewReady]);

  // --- BottomSheet 연동 함수 ---
  const handleDayChange = (dayKey) => {
    setSelectedDay(dayKey);
    setSelectedLocationId(null);
    
    const markersForDay = scheduleData[dayKey] || [];
      
    const validCoordinates = markersForDay
      .map(marker => ({ latitude: marker.lat, longitude: marker.lng }))
      .filter(coord => coord.latitude && coord.longitude);
    
    if (validCoordinates.length > 0 && isWebViewReady && webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'FIT_TO_COORDINATES',
        payload: validCoordinates
      }));
    }
  };

  const handleLocationSelect = (location) => {
    if (location.lat && location.lng) {
      setSelectedLocationId(location.id);
      if (isWebViewReady && webViewRef.current) {
        webViewRef.current.postMessage(JSON.stringify({
          type: 'ANIMATE_TO_REGION',
          payload: { latitude: location.lat, longitude: location.lng }
        }));
      }
    }
  };
  
  // --- 카카오맵 WebView를 위한 HTML 생성 함수 ---
  const createMapHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>지도</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
          <style> body, html { margin: 0; padding: 0; height: 100%; } #map { width: 100%; height: 100%; } </style>
      </head>
      <body>
          <div id="map"></div>
          <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoJavaScriptApiKey}&autoload=false"></script>
          <script>
            kakao.maps.load(function() {
              const container = document.getElementById('map');
              const options = {
                center: new kakao.maps.LatLng(37.5665, 126.9780),
                level: 7
              };
              const map = new kakao.maps.Map(container, options);
              let markers = [];

              function clearMarkers() {
                markers.forEach(marker => marker.setMap(null));
                markers = [];
              }

              function addMarkers(markerData) {
                clearMarkers();
                if (!markerData || markerData.length === 0) return;

                const bounds = new kakao.maps.LatLngBounds();

                markerData.forEach(data => {
                  const position = new kakao.maps.LatLng(data.lat, data.lng);
                  // 커스텀 마커 HTML 생성
                  const content = '<div style="background-color: #0064FF; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">' + data.order + '</div>';
                  
                  const customOverlay = new kakao.maps.CustomOverlay({
                      position: position,
                      content: content,
                      yAnchor: 1
                  });

                  customOverlay.setMap(map);
                  markers.push(customOverlay);
                  bounds.extend(position);
                });
                
                if (markerData.length > 0) {
                  map.setBounds(bounds);
                }
              }

              function fitToCoordinates(coords) {
                if (!coords || coords.length === 0) return;
                const bounds = new kakao.maps.LatLngBounds();
                coords.forEach(c => {
                  bounds.extend(new kakao.maps.LatLng(c.latitude, c.longitude));
                });
                map.setBounds(bounds);
              }
              
              function animateToRegion(coord) {
                  if (!coord) return;
                  const moveLatLon = new kakao.maps.LatLng(coord.latitude, coord.longitude);
                  map.setLevel(3, { anchor: moveLatLon });
                  map.panTo(moveLatLon);
              }

              // React Native로부터 메시지 수신
              document.addEventListener('message', function(event) {
                const { type, payload } = JSON.parse(event.data);
                switch(type) {
                  case 'UPDATE_MARKERS':
                    addMarkers(payload);
                    break;
                  case 'FIT_TO_COORDINATES':
                    fitToCoordinates(payload);
                    break;
                  case 'ANIMATE_TO_REGION':
                    animateToRegion(payload);
                    break;
                }
              });

              // WebView가 준비되었음을 React Native에 알림
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READY' }));
            });
          </script>
      </body>
      </html>
    `;
  };

  return (
    <SafeAreaView style={styles.container}>
      <DesignItineraryMapHeader
        title={itineraryTitle || ''}
        startDate={period.startDate}
        endDate={period.endDate}
        periodType={period.type}
        nights={period.nights}
        days={period.days}
        onBackPress={() => router.back()}
        onMemberPress={() => console.log('멤버 아이콘 클릭')}
      />

      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          style={{ flex: 1 }}
          source={{ html: createMapHTML() }}
          javaScriptEnabled={true}
          onLoad={() => setIsWebViewReady(true)}
          onMessage={(event) => {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'READY') {
              setIsWebViewReady(true);
            }
          }}
        />
      </View>

      <View style={styles.bottomSheetContainer}>
        <BottomSheet
          itineraryData={scheduleData}
          totalDays={totalDays}
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
});