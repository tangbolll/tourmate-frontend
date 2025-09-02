import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Clipboard from 'expo-clipboard';

const kakaoRestApiKey = '258d62eaabf3e1213e2b974f01185d44';
const kakaoJavaScriptApiKey = 'db029e231db073bfecc94156e14ecf9c';
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
                const defaultMapData = {
                    latitude: 37.5665,
                    longitude: 126.9780,
                    placeName: query,
                    address: '서울특별시 중구'
                };
                setMapData(defaultMapData);
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
                const newMapData = {
                    latitude: parseFloat(place.y),
                    longitude: parseFloat(place.x),
                    placeName: place.place_name,
                    address: place.address_name
                };
                setMapData(newMapData);
            } else {
                const fallbackMapData = {
                    latitude: 37.5665,
                    longitude: 126.9780,
                    placeName: query,
                    address: '위치를 찾을 수 없습니다'
                };
                setMapData(fallbackMapData);
            }
        } catch (error) {
            setError(error.message);
            const errorMapData = {
                latitude: 37.5665,
                longitude: 126.9780,
                placeName: query,
                address: '위치를 찾을 수 없습니다'
            };
            setMapData(errorMapData);
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

    const openInKakaoMap = async () => {
        if (mapData) {
            const webUrl = `https://map.kakao.com/link/map/${encodeURIComponent(mapData.placeName)},${mapData.latitude},${mapData.longitude}`;
            const appUrl = `kakaomap://look?p=${mapData.latitude},${mapData.longitude}`;
            
            try {
                const canOpenApp = await Linking.canOpenURL(appUrl);
                
                if (canOpenApp) {
                    await Linking.openURL(appUrl);
                } else {
                    await Linking.openURL(webUrl);
                }
            } catch (error) {
                Alert.alert('오류', '카카오맵을 열 수 없습니다.');
            }
        }
    };

    const createMapHTML = () => {
        if (!mapData) {
            return '';
        }
        
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>지도</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
            <style>
                body { 
                    margin: 0; 
                    padding: 0; 
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                }
                #map { 
                    width: 100%; 
                    height: 180px; 
                }
            </style>
        </head>
        <body>
            <div id="map"></div>
            
            <script>
                (function() {
                    function initMap() {
                        if (typeof kakao === 'undefined' || !kakao.maps) {
                            return;
                        }
                        const container = document.getElementById('map');
                        if (!container) return;
                        
                        const lat = ${mapData.latitude};
                        const lng = ${mapData.longitude};
                        
                        const options = {
                            center: new kakao.maps.LatLng(lat, lng),
                            level: 3
                        };
                        
                        const map = new kakao.maps.Map(container, options);
                        const markerPosition = new kakao.maps.LatLng(lat, lng);
                        const marker = new kakao.maps.Marker({
                            position: markerPosition
                        });
                        marker.setMap(map);
                        
                        const infowindow = new kakao.maps.InfoWindow({
                            content: '<div style="padding:8px; font-size:12px; width:auto; text-align:center; white-space:nowrap; max-width:200px;">${mapData.placeName.replace(/'/g, "\\'").replace(/"/g, '\\"')}</div>',
                            removable: false
                        });
                        infowindow.open(map, marker);
                        
                        kakao.maps.event.addListener(marker, 'click', function() {
                            if (window.ReactNativeWebView) {
                                window.ReactNativeWebView.postMessage(JSON.stringify({
                                    type: 'markerClick',
                                    place: '${mapData.placeName.replace(/'/g, "\\'").replace(/"/g, '\\"')}',
                                    address: '${mapData.address.replace(/'/g, "\\'").replace(/"/g, '\\"')}'
                                }));
                            }
                        });
                    }

                    const script = document.createElement('script');
                    script.type = 'text/javascript';
                    script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoJavaScriptApiKey}&autoload=false';
                    script.onload = () => {
                        kakao.maps.load(() => {
                            initMap();
                        });
                    };
                    document.head.appendChild(script);
                })();
            </script>
        </body>
        </html>
        `;
        
        return htmlContent;
    };

    const handleWebViewMessage = (event) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);
            if (message.type === 'markerClick') {
                Alert.alert(
                    '장소 정보',
                    `${message.place}\n${message.address}`,
                    [
                        { text: '확인', style: 'default' },
                        { text: '카카오맵에서 보기', onPress: openInKakaoMap }
                    ]
                );
            }
        } catch (error) {
            // Do nothing on parsing error
        }
    };

    const SimpleMapView = () => {
        return (
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
    };

    return (
        <View>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>모이는 장소</Text>
            </View>

            <View style={styles.locationContainer}>
                <MaterialCommunityIcons 
                    name="map-marker-radius" 
                    size={18} 
                    color="black" 
                    style={styles.icon}
                />
                <Text style={styles.location}>{location}</Text>
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity onPress={handleCopy} style={styles.copyButton}>
                        <MaterialCommunityIcons name="content-copy" size={14} color="#666" />
                        <Text style={styles.copyButtonText}>복사</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={openInKakaoMap} style={styles.kakaoMapButton}>
                        <MaterialCommunityIcons name="map" size={14} color="#333" />
                        <Text style={styles.kakaoMapButtonText}>카카오맵</Text>
                    </TouchableOpacity>
                </View>
            </View>

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
                    kakaoJavaScriptApiKey && kakaoJavaScriptApiKey !== 'YOUR_KAKAO_JAVASCRIPT_API_KEY' ? (
                        <WebView
                            source={{ html: createMapHTML() }}
                            style={styles.webView}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            onMessage={handleWebViewMessage}
                            originWhitelist={['*']}
                            cacheEnabled={false}
                            allowsInlineMediaPlaybook={false}
                            allowsFullscreenVideo={false}
                            allowsBackForwardNavigationGestures={false}
                            bounces={false}
                            scrollEnabled={false}
                            startInLoadingState={false}
                            scalesPageToFit={false}
                            onError={() => setError(true)}
                        />
                    ) : (
                        <SimpleMapView />
                    )
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        marginTop: 22,
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    icon: {
        marginRight: 8,
    },
    location: {
        fontSize: 14,
        color: '#333',
        flex: 1,
        lineHeight: 20,
    },
    buttonsContainer: {
        flexDirection: 'row',
        gap: 8,
        marginLeft: 8,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 3,
        backgroundColor: '#f5f5f5',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    copyButtonText: {
        marginLeft: 4,
        fontSize: 11,
        color: '#666',
        fontWeight: '500',
    },
    kakaoMapButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 3,
        backgroundColor: '#ffeb00',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    kakaoMapButtonText: {
        marginLeft: 4,
        fontSize: 11,
        color: '#333',
        fontWeight: 'bold',
    },
    mapBox: {
        height: 180,
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