import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    FlatList,
    ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Calendar from '../../../components/accompany/Calendar';
import ImageSelector from '../../../components/accompany/ImageSelector';
import { formatDate, getDayOfWeek } from '../../../utils/dateUtils';

const Step1 = ({ 
    title, setTitle, 
    location, setLocation, 
    dateRange, setDateRange, 
    description, setDescription, 
    meetLocation, setMeetLocation, 
    images, setImages, 
    thumbnailIndex, setThumbnailIndex
}) => {
    const [dateVisible, setDateVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const mockTravelData = [
        { contentid: "2871024", title: "가나돈까스의집", addr1: "서울특별시 강남구 언주로 608" },
        { contentid: "2899721", title: "가나안약국", addr1: "서울특별시 강남구 도산대로 113(신사동)" },
        { contentid: "2869760", title: "가담", addr1: "서울특별시 강남구 언주로167길 35" },
        { contentid: "2871443", title: "가람국시", addr1: "서울특별시 강남구 언주로135길 13" },
        { contentid: "1001", title: "부산해운대", addr1: "부산광역시 해운대구 해운대해변로 264" },
        { contentid: "1002", title: "부산광안리", addr1: "부산광역시 수영구 광안해변로 219" },
        { contentid: "1003", title: "부천중앙공원", addr1: "경기도 부천시 원미구 중동로 160" },
        { contentid: "1004", title: "부여백제문화단지", addr1: "충청남도 부여군 규암면 백제문로 455" },
        { contentid: "1005", title: "부안변산반도", addr1: "전라북도 부안군 변산면 변산해변로 42" },
        { contentid: "1006", title: "부암동", addr1: "서울특별시 종로구 부암동" },
        { contentid: "1007", title: "부평구청", addr1: "인천광역시 부평구 부평대로 168" }
    ];

    // 입력값 변경 시 검색 실행
    useEffect(() => {
        if (inputValue.length > 0) {
            setIsLoading(true);
            // 디바운싱을 위한 타이머
            const timer = setTimeout(() => {
                searchTravelLocations(inputValue);
            }, 300);

            return () => clearTimeout(timer);
        } else {
            setSuggestions([]);
            setIsOpen(false);
        }
    }, [inputValue]);

    const handleDateSelect = (startDate, endDate) => {
        setDateRange({ 
            startDate, 
            endDate,
            startDay: getDayOfWeek(startDate),
            endDay: getDayOfWeek(endDate)
        });
        setDateVisible(false);
    };

    // 실제 API 호출 함수 (모의 검색으로 구현)
    const searchTravelLocations = async (keyword) => {
        try {
            // 실제 API 호출 시 주석을 해제하고 사용
            // const response = await fetch(`http://your-api-url/api/myTour/search?keyword=${encodeURIComponent(keyword)}`);
            // const data = await response.json();
            // setSuggestions(data.response.body.items.item || []);
            
            // 모의 검색 (실제 구현시 위 코드로 교체)
            const filtered = mockTravelData.filter(item => 
                item.title.includes(keyword) || 
                item.addr1.includes(keyword)
            );
            setSuggestions(filtered);
            setIsOpen(true);
            setIsLoading(false);
        } catch (error) {
            console.error('검색 실패:', error);
            setIsLoading(false);
        }
    };

    const handleInputChange = (text) => {
        setInputValue(text);
    };

    const handleSuggestionPress = (suggestion) => {
        setInputValue(suggestion.title);
        setLocation(suggestion); // 선택된 위치 저장
        setIsOpen(false);
        console.log('선택된 여행지:', suggestion);
    };

    const clearInput = () => {
        setInputValue('');
        setSuggestions([]);
        setIsOpen(false);
    };

    const renderSuggestionItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.suggestionItem}
            onPress={() => handleSuggestionPress(item)}
        >
            <Text style={styles.suggestionTitle}>{item.title}</Text>
            <Text style={styles.suggestionAddress}>{item.addr1}</Text>
        </TouchableOpacity>
    );

    return (
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

            {/* 여행장소 자동완성 */}
            <Text style={styles.label}>여행장소</Text>
            <View style={styles.autocompleteContainer}>
                <View style={styles.inputWrapper}>
                    <MaterialIcons name="location-pin" size={16} color="black" style={styles.icon} />
                    <TextInput
                        style={styles.inputWithIcon}
                        placeholder="여행장소를 입력해주세요."
                        placeholderTextColor="#888"
                        value={inputValue}
                        onChangeText={handleInputChange}
                    />
                    {inputValue.length > 0 && (
                        <TouchableOpacity onPress={clearInput} style={styles.clearButton}>
                            <MaterialIcons name="close" size={16} color="#888" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* 드롭다운 리스트 */}
                {isOpen && (
                    <View style={styles.dropdown}>
                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#0066cc" />
                                <Text style={styles.loadingText}>검색 중...</Text>
                            </View>
                        ) : suggestions.length > 0 ? (
                            <FlatList
                                data={suggestions}
                                renderItem={renderSuggestionItem}
                                keyExtractor={(item) => item.contentid}
                                style={styles.suggestionList}
                                showsVerticalScrollIndicator={false}
                            />
                        ) : inputValue ? (
                            <View style={styles.noResultContainer}>
                                <Text style={styles.noResultText}>검색 결과가 없습니다.</Text>
                            </View>
                        ) : null}
                    </View>
                )}
            </View>
            
            <Text style={styles.label}>여행기간</Text>
            <TouchableOpacity onPress={() => setDateVisible(true)} style={styles.inputWrapper}>
                <FontAwesome6 name="calendar-check" size={14} color="black" style={styles.icon} />
                <Text style={[styles.inputWithIcon, { color: dateRange.startDate ? '#000' : '#888' }]}>
                    {dateRange.startDate 
                        ? `${dateRange.startDate} (${dateRange.startDay}) ~ ${dateRange.endDate} (${dateRange.endDay})` 
                        : '여행기간을 선택해주세요.'}
                </Text>
            </TouchableOpacity>
            
            {dateVisible && (
                <Calendar 
                    visible={dateVisible}
                    onSelect={handleDateSelect}
                    startDate={dateRange.startDate ? new Date(dateRange.startDate) : null}
                    endDate={dateRange.endDate ? new Date(dateRange.endDate) : null}
                />
            )}

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
                <MaterialIcons name="location-pin" size={14} color="#555" />
                <TextInput
                    style={styles.inputWithIcon}
                    placeholder="위치 추가"
                    placeholderTextColor="#888"
                    value={meetLocation}
                    onChangeText={setMeetLocation}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    form: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
        marginTop: 5,
        marginBottom: 8
    },
    autocompleteContainer: {
        position: 'relative',
        marginBottom: 12,
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
    },
    inputWithIcon: {
        flex: 1,
        height: 16,
        fontSize: 14,
        marginLeft: 8,
        color: '#000',
    },
    clearButton: {
        padding: 4,
    },
    dropdown: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        maxHeight: 200,
        zIndex: 1000,
        elevation: 5, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    suggestionList: {
        maxHeight: 180,
    },
    suggestionItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    suggestionTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    suggestionAddress: {
        fontSize: 12,
        color: '#666',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    loadingText: {
        marginLeft: 8,
        color: '#666',
        fontSize: 14,
    },
    noResultContainer: {
        padding: 20,
        alignItems: 'center',
    },
    noResultText: {
        color: '#666',
        fontSize: 14,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top'
    },
    counter: {
        alignSelf: 'flex-end',
        color: '#888',
        marginTop: -8
    },
});

export default Step1;