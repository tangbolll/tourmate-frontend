import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Clipboard from 'expo-clipboard';

const kakaoRestApiKey = '258d62eaabf3e1213e2b974f01185d44'; // 실제 카카오 API 키로 교체
const KAKAO_API_URL = 'https://dapi.kakao.com/v2/local/search/keyword.json';

const GatheringPlace = ({ location }) => {
    const [mapData, setMapData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (location) {
            searchLocation(location);
        }
    }, [location]);

    const searchLocation = async (query) => {
        setIsLoading(true);
        setError(null);
        
        try {
            if (!kakaoRestApiKey || kakaoRestApiKey === 'YOUR_ACTUAL_KAKAO_REST_API_KEY') {
                // API 키가 없을 때 기본 좌표 (서울시청)
                setMapData({
                    latitude: 37.5665,
                    longitude: 126.9780,
                    placeName: location,
                    address: '서울특별시 중구'
                });
                setIsLoading(false);
                return;
            }

            const response = await fetch(`${KAKAO_API_URL}?query=${encodeURIComponent(query)}&size=1`, {
                method: 'GET',
                headers: {
                    'Authorization': `KakaoAK ${kakaoRestApiKey}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.documents && data.documents.length > 0) {
                const place = data.documents[0];
                setMapData({
                    latitude: parseFloat(place.y),
                    longitude: parseFloat(place.x),
                    placeName: place.place_name,
                    address: place.address_name
                });
            } else {
                // 검색 결과가 없을 때 기본 좌표
                setMapData({
                    latitude: 37.5665,
                    longitude: 126.9780,
                    placeName: location,
                    address: '위치를 찾을 수 없습니다'
                });
            }
        } catch (error) {
            console.error('위치 검색 에러:', error);
            setError(error.message);
            // 에러 시 기본 좌표
            setMapData({
                latitude: 37.5665,
                longitude: 126.9780,
                placeName: location,
                address: '위치를 찾을 수 없습니다'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!location) {
            Alert.alert('알림', '복사할 장소 정보가 없습니다.');
            return;
        }

        await Clipboard.setStringAsync(location);
        Alert.alert('복사 완료', '장소 주소가 클립보드에 복사되었습니다.');
    };

    const openInKakaoMap = () => {
        if (mapData) {
            const kakaoMapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(mapData.placeName)},${mapData.latitude},${mapData.longitude}`;
            Alert.alert(
                '카카오맵 열기', 
                '카카오맵 앱에서 위치를 확인하시겠습니까?',
                [
                    { text: '취소', style: 'cancel' },
                    { text: '열기', onPress: () => {
                        Linking.openURL(kakaoMapUrl);
                        console.log('카카오맵 URL:', kakaoMapUrl);
                    }}
                ]
            );
        }
    };

    // WebView용 HTML 생성
    const createMapHTML = () => {
        if (!mapData) return '';
        
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>지도</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
            <script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_JAVASCRIPT_API_KEY"></script>
        </head>
        <body style="margin:0; padding:0;">
            <div id="map" style="width:100%; height:150px;"></div>
            <script>
                var container = document.getElementById('map');
                var options = {
                    center: new kakao.maps.LatLng(${mapData.latitude}, ${mapData.longitude}),
                    level: 3
                };
                var map = new kakao.maps.Map(container, options);
                
                var markerPosition = new kakao.maps.LatLng(${mapData.latitude}, ${mapData.longitude});
                var marker = new kakao.maps.Marker({
                    position: markerPosition
                });
                marker.setMap(map);
                
                var infowindow = new kakao.maps.InfoWindow({
                    content: '<div style="padding:5px; font-size:12px; width:150px; text-align:center;">${mapData.placeName}</div>'
                });
                infowindow.open(map, marker);
            </script>
        </body>
        </html>
        `;
    };

    // 정적 지도 이미지 URL 생성 (대안)
    const getStaticMapUrl = () => {
        if (!mapData) return null;
        
        return `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${mapData.longitude}&y=${mapData.latitude}`;
    };

    // 간단한 지도 이미지 대안
    const SimpleMapView = () => (
        <View style={styles.simpleMapContainer}>
            <MaterialCommunityIcons name="map" size={40} color="#4285f4" />
            <Text style={styles.coordinatesText}>
                위도: {mapData?.latitude.toFixed(6)}
            </Text>
            <Text style={styles.coordinatesText}>
                경도: {mapData?.longitude.toFixed(6)}
            </Text>
            <TouchableOpacity style={styles.mapButton} onPress={openInKakaoMap}>
                <Text style={styles.mapButtonText}>카카오맵에서 보기</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View>
            {/* 제목 */}
            <Text style={styles.title}>모이는 장소</Text>

            {/* 주소 */}
            <View style={styles.locationContainer}>
                <MaterialCommunityIcons 
                    name="map-marker-radius" 
                    size={18} 
                    color="black" 
                    style={styles.icon}
                />
                <Text style={styles.location}>{location}</Text>
                <TouchableOpacity onPress={handleCopy}>
                    <Text style={styles.copy}>복사</Text>
                </TouchableOpacity>
            </View>

            {/* 지도 영역 */}
            <View style={styles.mapBox}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#4285f4" />
                        <Text style={styles.loadingText}>지도를 불러오는 중...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <MaterialCommunityIcons name="map-marker-off" size={40} color="#ccc" />
                        <Text style={styles.errorText}>지도를 불러올 수 없습니다</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={() => searchLocation(location)}>
                            <Text style={styles.retryButtonText}>다시 시도</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    // 방법 1: WebView 사용 (카카오 JavaScript API 키 필요)
                    // <WebView
                    //     source={{ html: createMapHTML() }}
                    //     style={styles.webView}
                    //     javaScriptEnabled={true}
                    //     domStorageEnabled={true}
                    // />
                    
                    // 방법 2: 간단한 지도 정보 표시 (API 키 없이도 작동)
                    <SimpleMapView />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        marginTop: 22,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    icon: {
        marginRight: 4,
    },
    location: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    copy: {
        fontSize: 14,
        color: '#999',
        marginLeft: 8,
        textDecorationLine: 'underline',
    },
    mapBox: {
        height: 150,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        overflow: 'hidden',
    },
    webView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 8,
        color: '#666',
        fontSize: 14,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        marginTop: 8,
        color: '#666',
        fontSize: 14,
    },
    retryButton: {
        marginTop: 8,
        paddingHorizontal: 16,
        paddingVertical: 6,
        backgroundColor: '#4285f4',
        borderRadius: 4,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 12,
    },
    simpleMapContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    coordinatesText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    mapButton: {
        marginTop: 12,
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: '#ffeb00',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    mapButtonText: {
        color: '#333',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default GatheringPlace;