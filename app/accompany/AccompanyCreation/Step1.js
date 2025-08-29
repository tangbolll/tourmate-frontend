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
import DayPicker from '../../../components/accompany/DayPicker';
import ImageSelector from '../../../components/accompany/ImageSelector';

const kakaoRestApiKey = '258d62eaabf3e1213e2b974f01185d44';

// 카카오맵 API URL 수정
const KAKAO_API_URL = 'https://dapi.kakao.com/v2/local/search/keyword.json';

// API 베이스 URL 설정
const getBaseURL = () => {
    if (__DEV__) {
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:8080';
        }
        return Constants.expoConfig?.extra?.API_BASE_URL_DEV;
    } else {
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
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectingDateType, setSelectingDateType] = useState('start');
    const [currentMonth, setCurrentMonth] = useState(new Date());

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
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getDayOfWeek = (date) => {
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        return weekdays[date.getDay()];
    };

    const formatDateForDisplay = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        const weekday = weekdays[date.getDay()];
        return `${year}년 ${month}월 ${day}일 (${weekday})`;
    };

    const handleDateSelect = (day) => {
        const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

        if (selectingDateType === 'start') {
            setStartDate(selectedDate);
            if (endDate && selectedDate > endDate) {
                setEndDate(selectedDate);
            }
            setSelectingDateType('end');
        } else {
            if (startDate && selectedDate < startDate) {
                return;
            }
            setEndDate(selectedDate);
            setShowCalendar(false);
        }
    };

    const openCalendar = () => {
        setSelectingDateType('start');
        setShowCalendar(true);
    };

    const handleLocationChange = (text) => {
        setLocationInput(text);
        setLocation(text);
    };

    const getDateRangeText = () => {
        if (startDate && endDate) {
            return `${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`;
        } else if (startDate) {
            return `${formatDateForDisplay(startDate)} - 종료일 선택`;
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
                    <MaterialIcons name="location-pin" size={16} color="black" style={styles.icon} />
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
                    <FontAwesome6 name="calendar-check" size={16} color="black" style={styles.icon} />
                    <Text style={[styles.inputWithIcon, {
                        color: startDate && endDate ? '#000' : '#888',
                        lineHeight: 20,
                    }]}>
                        {getDateRangeText()}
                    </Text>
                </TouchableOpacity>

                <DayPicker
                    visible={showCalendar}
                    onClose={() => setShowCalendar(false)}
                    onDateSelect={handleDateSelect}
                    selectedStartDate={startDate}
                    selectedEndDate={endDate}
                    selectingDateType={selectingDateType}
                    currentMonth={currentMonth}
                    setCurrentMonth={setCurrentMonth}
                    title={selectingDateType === 'start' ? '여행 시작일 선택' : '여행 종료일 선택'}
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
                    <MaterialIcons name="location-pin" size={16} color="black" style={styles.icon} />
                    <TextInput
                        style={styles.inputWithIcon}
                        placeholder="위치 추가"
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
    },
    icon: {
        marginRight: 4,
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
        lineHeight: 20,
    },
    inputWithIcon: {
        height: 44,
        flex: 1,
        fontSize: 14,
        marginLeft: 8,
        color: '#000',
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