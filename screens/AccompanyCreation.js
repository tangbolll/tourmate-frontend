import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    ScrollView, 
    Image, 
    FlatList, 
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { MaterialIcons } from 'react-native-vector-icons';
import { Feather, Ionicons } from '@expo/vector-icons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import DateTimePicker from '@react-native-community/datetimepicker';

// 간단한 날짜 형식 변환 함수
const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// 실제 달력 컴포넌트
const Calendar = ({ onSelect, visible, startDate, endDate }) => {
    const [mode, setMode] = useState('start'); // 'start' or 'end'
    const [tempStartDate, setTempStartDate] = useState(startDate || new Date());
    const [tempEndDate, setTempEndDate] = useState(endDate || new Date());
    
    if (!visible) return null;
    
    const handleDateChange = (event, selectedDate) => {
        if (event.type === 'dismissed') return;
        
        const currentDate = selectedDate || (mode === 'start' ? tempStartDate : tempEndDate);
        
        if (mode === 'start') {
            setTempStartDate(currentDate);
            setMode('end');
        } else {
            // 종료일이 시작일보다 이전인 경우 조정
            if (currentDate < tempStartDate) {
                Alert.alert("날짜 오류", "종료일은 시작일 이후여야 합니다.");
                return;
            }
            setTempEndDate(currentDate);
            // 양쪽 날짜가 모두 선택되면 결과 반환
            onSelect(formatDate(tempStartDate), formatDate(currentDate));
        }
    };
    
    return (
        <View style={styles.calendarContainer}>
            <Text style={styles.calendarTitle}>
                {mode === 'start' ? '시작일 선택' : '종료일 선택'}
            </Text>
            <DateTimePicker
                value={mode === 'start' ? tempStartDate : tempEndDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={mode === 'end' ? tempStartDate : undefined}
            />
            <Text style={styles.calendarInfo}>
                {mode === 'start' ? '다음으로 종료일을 선택합니다.' : '날짜를 확인하세요.'}
            </Text>
        </View>
    );
};

const AccompanyCreation = ({ navigation }) => {
    const [step, setStep] = useState(1);
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [dateVisible, setDateVisible] = useState(false);
    const [dateRange, setDateRange] = useState({});
    const [description, setDescription] = useState('');
    const [meetLocation, setMeetLocation] = useState('');
    const [images, setImages] = useState([]);
    const [thumbnailIndex, setThumbnailIndex] = useState(0);
    
    // 두 번째 스텝을 위한 상태들
    const [maxPeople, setMaxPeople] = useState('');
    const [recruitDateVisible, setRecruitDateVisible] = useState(false);
    const [recruitDateRange, setRecruitDateRange] = useState({
        startDate: formatDate(new Date()),
        endDate: formatDate(new Date())
    });
    const [selectedGenders, setSelectedGenders] = useState([]);
    const [selectedAges, setSelectedAges] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState([]);
    
    const maxImgCount = 10;
    const maxTagCount = 5;

    useEffect(() => {
        // 두 번째 스텝 초기화시 모집기간 기본값 설정
        if (step === 2) {
            const today = formatDate(new Date());
            if (!recruitDateRange.startDate) {
                setRecruitDateRange({
                    startDate: today,
                    endDate: today
                });
            }
        }
    }, [step]);

    const isFirstStepValid =
        title.length >= 10 &&
        title.length <= 30 &&
        location.trim() !== '' &&
        dateRange.startDate && dateRange.endDate &&
        description.length >= 20 &&
        meetLocation.trim() !== '';

    const isSecondStepValid =
        maxPeople.trim() !== '' &&
        recruitDateRange.startDate && recruitDateRange.endDate &&
        selectedGenders.length > 0 &&
        selectedAges.length > 0 &&
        selectedCategories.length > 0 && selectedCategories.length <= 3;

    const handleNext = () => {
        if (isFirstStepValid) setStep(2);
    };

    const handleBack = () => {
        if (step === 2) {
            setStep(1);
        } else {
            navigation.goBack();
        }
    };

    const handleClose = () => {
        Alert.alert(
            "작성 취소",
            "작성 중인 내용이 저장되지 않습니다. 정말 나가시겠습니까?",
            [
                { text: "취소", style: "cancel" },
                { text: "나가기", onPress: () => navigation.goBack() }
            ]
        );
    };

    const handleDateSelect = (startDate, endDate) => {
        setDateRange({ startDate, endDate });
        setDateVisible(false);
    };

    const handleRecruitDateSelect = (startDate, endDate) => {
        setRecruitDateRange({ startDate, endDate });
        setRecruitDateVisible(false);
    };

    const handleAddImage = () => {
        if (images.length >= maxImgCount) {
            Alert.alert("알림", `최대 ${maxImgCount}개의 이미지만 추가할 수 있습니다.`);
            return;
        }

        const options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 800,
            maxWidth: 800,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('사용자가 이미지 선택을 취소했습니다');
                return;
            }
            
            if (response.errorCode) {
                console.log('ImagePicker 오류: ', response.errorMessage);
                // 오류 시 기본 이미지로 대체 (개발용)
                const defaultImage = require('../assets/defaultProfile.png');
                setImages([...images, defaultImage]);
                return;
            }
            
            if (response.assets && response.assets.length > 0) {
                const newImages = [...images, { uri: response.assets[0].uri }];
                setImages(newImages);
                
                // 첫 번째 이미지가 추가되면 자동으로 대표 이미지로 설정
                if (images.length === 0) {
                    setThumbnailIndex(0);
                }
            }
        });
    };

    const handleDeleteImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
        
        // 대표 이미지가 삭제된 경우 첫 번째 이미지를 대표로 설정
        if (thumbnailIndex === index) {
            setThumbnailIndex(newImages.length > 0 ? 0 : 0);
        } else if (thumbnailIndex > index) {
            // 삭제된 이미지 앞에 있던 대표 이미지의 인덱스 조정
            setThumbnailIndex(thumbnailIndex - 1);
        }
    };

    const setAsThumbnail = (index) => {
        setThumbnailIndex(index);
    };

    const toggleGender = (gender) => {
        setSelectedGenders(prev => 
            prev.includes(gender) 
                ? prev.filter(g => g !== gender) 
                : [...prev, gender]
        );
    };
    
    const toggleAge = (age) => {
        setSelectedAges(prev => 
            prev.includes(age) 
                ? prev.filter(a => a !== age) 
                : [...prev, age]
        );
    };
    
    const toggleCategory = (category) => {
        setSelectedCategories(prev => {
            if (prev.includes(category)) {
                return prev.filter(c => c !== category);
            } else {
                if (prev.length >= 3) {
                    Alert.alert("알림", "카테고리는 최대 3개까지 선택할 수 있습니다.");
                    return prev;
                }
                return [...prev, category];
            }
        });
    };
    
    const handleTagInputChange = (text) => {
        // 마지막 문자가 쉼표면 태그 추가
        if (text.endsWith(',')) {
            const newTag = text.slice(0, -1).trim();
            if (newTag && tags.length < maxTagCount) {
                setTags([...tags, newTag]);
                setTagInput('');
            } else if (tags.length >= maxTagCount) {
                Alert.alert("알림", `태그는 최대 ${maxTagCount}개까지 추가할 수 있습니다.`);
                setTagInput('');
            }
        } else {
            setTagInput(text);
        }
    };
    
    const removeTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    const renderImageItem = ({ item, index }) => (
        <View style={styles.imageWrapper}>
            <TouchableOpacity onPress={() => setAsThumbnail(index)}>
                <Image source={item.uri ? { uri: item.uri } : item} style={[styles.image, thumbnailIndex === index && styles.thumbnail]} />
                {thumbnailIndex === index && (
                    <View style={styles.thumbnailLabel}>
                        <Text style={styles.thumbnailText}>대표</Text>
                    </View>
                )}
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.imageDelete}
                onPress={() => handleDeleteImage(index)}
            >
                <Text style={styles.deleteText}>×</Text>
            </TouchableOpacity>
        </View>
    );

    const renderTag = ({ item, index }) => (
        <View style={styles.tagChip}>
            <Text style={styles.tagText}>{item}</Text>
            <TouchableOpacity onPress={() => removeTag(index)}>
                <Text style={styles.tagRemove}>×</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerText}>동행 생성</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <MaterialIcons name="close" size={24} color="black" />
                </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, step === 1 && styles.progressActive]} />
                <View style={[styles.progressBar, step === 2 && styles.progressActive]} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* ===========================Step 1=========================== */}
                {step === 1 && (
                    <View style={styles.form}>
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
                            <MaterialIcons name="location-pin" size={20} color="#555" />
                            <TextInput
                                style={styles.inputWithIcon}
                                placeholder="여행장소를 입력해주세요."
                                placeholderTextColor="#555"
                                value={location}
                                onChangeText={setLocation}
                            />
                        </View>
                        
                        <Text style={styles.label}>여행기간</Text>
                        <TouchableOpacity onPress={() => setDateVisible(true)} style={styles.inputWrapper}>
                            <FontAwesome6 name="calendar-check" size={16} color="black" style={styles.icon} />
                            <Text style={[styles.inputWithIcon, { color: dateRange.startDate ? '#000' : '#888' }]}>
                                {dateRange.startDate ? `${dateRange.startDate} ~ ${dateRange.endDate}` : '여행기간을 선택해주세요.'}
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

                        <View style={styles.imagesContainer}>
                            <TouchableOpacity 
                                style={styles.addImageButton}
                                onPress={handleAddImage}
                            >
                                <MaterialIcons name="add-a-photo" size={24} color="#888" />
                                <Text style={styles.addImageText}>{images.length}/{maxImgCount}</Text>
                            </TouchableOpacity>
                            {images.length > 0 && (
                                <FlatList
                                    data={images}
                                    horizontal
                                    renderItem={renderImageItem}
                                    keyExtractor={(item, index) => index.toString()}
                                    style={styles.imageList}
                                />
                            )}
                        </View>

                        <Text style={styles.label}>모이는 장소</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialIcons name="location-pin" size={20} color="#555" />
                            <TextInput
                                style={styles.inputWithIcon}
                                placeholder="위치 추가"
                                placeholderTextColor="#888"
                                value={meetLocation}
                                onChangeText={setMeetLocation}
                            />
                        </View>
                    </View>
                )}
                
                {/* ===========================Step 2=========================== */}
                {step === 2 && (
                    <View style={styles.form}>
                        
                        <Text style={styles.label}>모집 정원</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="person" size={15} color="black" />
                            <TextInput
                                style={styles.inputWithIcon}
                                placeholder="최대 인원 수를 입력해주세요."
                                placeholderTextColor="#888"
                                keyboardType="numeric"
                                value={maxPeople}
                                onChangeText={setMaxPeople}
                            />
                            <Text style={{ marginLeft: 5, fontSize: 16 }}>명</Text>
                        </View>
                        
                        <Text style={styles.label}>모집 기간</Text>
                        <TouchableOpacity onPress={() => setRecruitDateVisible(true)} style={styles.inputWrapper}>
                            <FontAwesome6 name="calendar-check" size={16} color="black" style={styles.icon} />
                            <Text style={[styles.inputWithIcon, { color: '#000' }]}>
                                {`${recruitDateRange.startDate} ~ ${recruitDateRange.endDate}`}
                            </Text>
                        </TouchableOpacity>
                        
                        {recruitDateVisible && (
                            <Calendar 
                                visible={recruitDateVisible}
                                onSelect={handleRecruitDateSelect}
                                startDate={new Date(recruitDateRange.startDate)}
                                endDate={new Date(recruitDateRange.endDate)}
                            />
                        )}
                        
                        <Text style={styles.label}>동행 조건</Text>
                        
                        <View style={styles.chipRow}>
                        <Text style={styles.subLabel}>성별 </Text>
                            <TouchableOpacity 
                                style={[styles.chip, selectedGenders.includes('여자만') && styles.chipSelected]}
                                onPress={() => toggleGender('여자만')}
                            >
                                <Text style={[styles.chipText, selectedGenders.includes('여자만') && styles.chipTextSelected]}>
                                    여자만
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.chip, selectedGenders.includes('남자만') && styles.chipSelected]}
                                onPress={() => toggleGender('남자만')}
                            >
                                <Text style={[styles.chipText, selectedGenders.includes('남자만') && styles.chipTextSelected]}>
                                    남자만
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.chip, selectedGenders.includes('남녀무관') && styles.chipSelected]}
                                onPress={() => toggleGender('남녀무관')}
                            >
                                <Text style={[styles.chipText, selectedGenders.includes('남녀무관') && styles.chipTextSelected]}>
                                    남녀무관
                                </Text>
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.chipRow}>
                            <Text style={styles.subLabel}>연령대 </Text>
                            {['20대', '30대', '40대', '50대 이상', '누구나'].map((age) => (
                                <TouchableOpacity 
                                    key={age}
                                    style={[styles.chip, selectedAges.includes(age) && styles.chipSelected]}
                                    onPress={() => toggleAge(age)}
                                >
                                    <Text style={[styles.chipText, selectedAges.includes(age) && styles.chipTextSelected]}>
                                        {age}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        
                        <View style={styles.chipRow}>
                            <Text style={styles.label}>카테고리</Text>
                            <Text style={styles.labeldescription}>최대 3개까지 선택 가능</Text>
                        </View>
                        <View style={styles.chipGrid}>
                            {['투어', '식사', '야경', '사진', '쇼핑', '숙소', '교통', '테마파크', '액티비티', '힐링', '역사유적', '박물관/미술관'].map((category) => (
                                <TouchableOpacity 
                                    key={category}
                                    style={[styles.chip, selectedCategories.includes(category) && styles.chipSelected]}
                                    onPress={() => toggleCategory(category)}
                                >
                                    <Text style={[styles.chipText, selectedCategories.includes(category) && styles.chipTextSelected]}>
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        
                        <Text style={styles.label}>태그 (최대 5개)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="태그를 입력하고 쉼표(,)로 구분"
                            placeholderTextColor="#888"
                            value={tagInput}
                            onChangeText={handleTagInputChange}
                        />
                        
                        {tags.length > 0 && (
                            <FlatList
                                data={tags}
                                horizontal
                                renderItem={renderTag}
                                keyExtractor={(item, index) => index.toString()}
                                style={styles.tagList}
                            />
                        )}
                    </View>
                )}
                <View style={styles.bottomSpace} />
            </ScrollView>

            <View style={styles.buttonWrapper}>
                <TouchableOpacity
                    style={[
                        styles.nextButton, 
                        (step === 1 && !isFirstStepValid) || (step === 2 && !isSecondStepValid) ? styles.disabledButton : null
                    ]}
                    onPress={step === 1 ? handleNext : () => console.log('Submit form')}
                    disabled={(step === 1 && !isFirstStepValid) || (step === 2 && !isSecondStepValid)}
                >
                    <Text style={styles.nextText}>{step === 1 ? '다음' : '완료'}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    header: {
        flexDirection: 'row',
        paddingTop: 10,
        paddingBottom: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    backButton: {
        padding: 5
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    closeButton: {
        padding: 5
    },
    progressBarContainer: {
        flexDirection: 'row',
        height: 4,
    },
    progressBar: {
        flex: 1,
        backgroundColor: '#eee',
    },
    progressActive: {
        backgroundColor: '#000'
    },
    scrollContent: {
        flexGrow: 1
    },
    form: {
        padding: 20,
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
        marginTop: 10,
        marginBottom: 8
    },
    subLabel: {
        fontSize: 14,
        marginLeft: 5,
        marginBottom: 8,
        color: '#555'
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
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 12,
        color: '#000',
    },
    inputWithIcon: {
        flex: 1,
        fontSize: 16,
        marginLeft: 8,
        color: '#000',
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
    imagesContainer: {
        flexDirection: 'row',
        marginBottom: 15
    },
    addImageButton: {
        width: 80,
        height: 80,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    addImageText: {
        color: '#888',
        marginTop: 5
    },
    imageList: {
        flexGrow: 0
    },
    imageWrapper: {
        marginRight: 10,
        position: 'relative'
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8
    },
    thumbnail: {
        borderWidth: 2,
        borderColor: 'blue'
    },
    thumbnailLabel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        backgroundColor: 'blue',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderBottomLeftRadius: 8
    },
    thumbnailText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold'
    },
    imageDelete: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: 'white',
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ccc'
    },
    deleteText: {
        fontWeight: 'bold',
        fontSize: 16
    },
    calendarContainer: {
        marginVertical: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8
    },
    calendarTitle: {
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center'
    },
    calendarInfo: {
        marginTop: 10,
        textAlign: 'center',
        color: '#555'
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15
    },
    chipGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8
    },
    chipSelected: {
        backgroundColor: '#000'
    },
    chipText: {
        fontSize: 14,
        color: '#555'
    },
    chipTextSelected: {
        color: '#fff'
    },
    tagList: {
        marginBottom: 15
    },
    tagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        marginRight: 8
    },
    tagText: {
        fontSize: 14,
        marginRight: 5
    },
    tagRemove: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#555'
    },
    buttonWrapper: {
        backgroundColor: '#fff',
        width: '100%',
        paddingHorizontal: 20,
        paddingTop: 5,  // Reduced from 10 to 5
        paddingBottom: 5,  // Added to reduce space
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5, 
    },
    nextButton: {
        backgroundColor: 'black',
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        width: '100%'
    },
    disabledButton: {
        backgroundColor: '#ccc'
    },
    nextText: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold'
    },
    bottomSpace: {
        height: 20
    }
});

export default AccompanyCreation;