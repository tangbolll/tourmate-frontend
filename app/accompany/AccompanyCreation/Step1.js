import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator,
    Platform,
    ScrollView
} from 'react-native';
import Constants from 'expo-constants';
import { MaterialIcons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import CalendarPopup from '../../../components/accompany/CalendarPopup';
import ImageSelector from '../../../components/accompany/ImageSelector';
import dayjs from 'dayjs';

const kakaoRestApiKey = '258d62eaabf3e1213e2b974f01185d44';

// 카카오맵 API URL 수정
const KAKAO_API_URL = 'https://dapi.kakao.com/v2/local/search/keyword.json';

// API 베이스 URL 설정
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
const API_URL = getBaseURL();

const Step1 = ({
    title, setTitle,
    location, setLocation,
    dateRange, setDateRange,
    description, setDescription,
    meetLocation, setMeetLocation,
    images, setImages,
    thumbnailIndex, setThumbnailIndex
}) => {
    const [locationInput, setLocationInput] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [calendarVisible, setCalendarVisible] = useState(false);

    const [meetLocationInput, setMeetLocationInput] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    useEffect(() => {
        if (startDate && endDate) {
            const formattedStartDate = formatDateToString(startDate);
            const formattedEndDate = formatDateToString(endDate);
            setDateRange({
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                startDay: getDayOfWeek(startDate),
                endDay: getDayOfWeek(endDate)
            });
        }
    }, [startDate, endDate]);

    useEffect(() => {
        setMeetLocationInput(meetLocation);
    }, [meetLocation]);

    const formatDateToString = (date) => {
        return dayjs(date).format('YYYY-MM-DD');
    };

    const getDayOfWeek = (date) => {
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        return weekdays[dayjs(date).day()];
    };

    const formatDateForDisplay = (date) => {
        return dayjs(date).format('YYYY년 M월 D일 (dd)');
    };

    const handleDateSelect = (range) => {
        setStartDate(range.startDate);
        setEndDate(range.endDate);
        setCalendarVisible(false);
    };

    const openCalendar = () => {
        setCalendarVisible(true);
    };

    const handleLocationChange = (text) => {
        setLocationInput(text);
        setLocation(text);
    };

    const getDateRangeText = () => {
        if (startDate && endDate) {
            return `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`;
        } else {
            return '여행기간을 선택해주세요.';
        }
    };

    const handleMeetLocationSearch = async (query) => {
        setMeetLocationInput(query);
        setMeetLocation(query); // Update the parent state
        if (query.length < 2) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        setIsSearching(true);
        setShowSearchResults(true);
        try {
            // 카카오맵 API 올바른 URL과 헤더 사용
            const response = await fetch(`${KAKAO_API_URL}?query=${encodeURIComponent(query)}&size=10`, {
                method: 'GET',
                headers: {
                    'Authorization': `KakaoAK ${kakaoRestApiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setSearchResults(data.documents || []);
        } catch (error) {
            console.error('카카오맵 API 호출 에러:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectLocation = (item) => {
        setMeetLocation(item.place_name);
        setMeetLocationInput(item.place_name);
        setSearchResults([]);
        setShowSearchResults(false);
        Keyboard.dismiss();
    };

    const renderSearchItem = ({ item }) => (
        <TouchableOpacity style={styles.searchResultItem} onPress={() => handleSelectLocation(item)}>
            <Text style={styles.searchResultText}>{item.place_name}</Text>
            <Text style={styles.searchResultAddress}>{item.address_name}</Text>
        </TouchableOpacity>
    );

    // 검색 결과를 별도 컴포넌트로 분리
    const SearchResultsList = () => {
        if (!showSearchResults) return null;
        
        if (isSearching) {
            return <ActivityIndicator style={styles.spinner} size="small" color="#0000ff" />;
        }

        if (searchResults.length === 0) {
            return null;
        }

        return (
            <View style={styles.searchResultsContainer}>
                <FlatList
                    data={searchResults}
                    renderItem={renderSearchItem}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false} // 중요: 내부 스크롤 비활성화
                    nestedScrollEnabled={false}
                />
            </View>
        );
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ScrollView style={styles.form}>
                <Text style={styles.label}>동행 제목</Text>
                <TextInput
                    style={styles.input}
                    placeholder="동행명을 작성해주세요. (최소 10자, 최대 30자)"
                    placeholderTextColor="#888"
                    value={title}
                    onChangeText={setTitle}
                    maxLength={30}
                />

                <Text style={styles.label}>여행장소</Text>
                <View style={styles.inputWrapper}>
                    <MaterialIcons name="location-pin" size={16} color="#888" style={styles.icon} />
                    <TextInput
                        style={styles.inputWithIcon}
                        placeholder="여행장소를 입력해주세요."
                        placeholderTextColor="#888"
                        value={locationInput}
                        onChangeText={handleLocationChange}
                    />
                </View>

                <Text style={styles.label}>여행기간</Text>
                <TouchableOpacity onPress={openCalendar} style={styles.inputWrapper}>
                    <FontAwesome6 name="calendar-check" size={16} color="#888" style={styles.icon} />
                    <Text style={[styles.inputWithIconText, {
                        color: startDate && endDate ? '#000' : '#888',
                    }]}>
                        {getDateRangeText()}
                    </Text>
                </TouchableOpacity>

                <CalendarPopup
                    visible={calendarVisible}
                    onClose={() => setCalendarVisible(false)}
                    onSelectDates={handleDateSelect}
                />

                <Text style={styles.label}>동행소개</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    multiline
                    placeholder="동행에 대한 상세 정보를 입력해주세요."
                    placeholderTextColor="#888"
                    value={description}
                    onChangeText={setDescription}
                />
                <Text style={styles.counter}>{description.length} / 최소 20자</Text>

                <ImageSelector
                    images={images}
                    setImages={setImages}
                    thumbnailIndex={thumbnailIndex}
                    setThumbnailIndex={setThumbnailIndex}
                    maxImgCount={10}
                />

                <Text style={styles.label}>모이는 장소</Text>
                <View style={styles.inputWrapper}>
                    <MaterialIcons name="location-pin" size={16} color="#888" style={styles.icon} />
                    <TextInput
                        style={styles.inputWithIcon}
                        placeholder="모이는 장소를 입력해주세요."
                        placeholderTextColor="#888"
                        value={meetLocationInput}
                        onChangeText={handleMeetLocationSearch}
                    />
                </View>
                
                {/* 검색 결과를 별도 컴포넌트로 렌더링 */}
                <SearchResultsList />
            </ScrollView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    form: {
        flex: 1,
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
        marginTop: 5,
        marginBottom: 8
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 12,
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    icon: {
        marginRight: 8,
    },
    input: {
        height: 44,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 12,
        fontSize: 14,
        marginBottom: 12,
        color: '#000',
        backgroundColor: '#fff',
        // 여행 제목의 텍스트와 플레이스홀더 수직 중앙 정렬
        textAlignVertical: 'center',
    },
    // 아이콘이 있는 인풋 컴포넌트 스타일
    inputWithIcon: {
        flex: 1,
        fontSize: 14,
        color: '#000',
        padding: 0, 
        textAlignVertical: 'center',
    },
    // 아이콘이 있는 텍스트 컴포넌트 스타일
    inputWithIconText: {
        flex: 1,
        fontSize: 14,
        textAlignVertical: 'center',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top'
    },
    counter: {
        fontSize: 12,
        alignSelf: 'flex-end',
        color: '#888',
        marginTop: -8
    },
    searchResultsContainer: {
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        maxHeight: 200,
    },
    searchResultItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchResultText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    searchResultAddress: {
        fontSize: 12,
        color: '#888',
    },
    spinner: {
        marginBottom: 12,
    }
});

export default Step1;