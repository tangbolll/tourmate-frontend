import React, { useState, useEffect } from 'react';
import Constants from 'expo-constants';
import { 
    View, 
    Text, 
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Platform,
    Alert
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../../utils/dateUtils';
import Step1 from './Step1';
import Step2 from './Step2';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const AccompanyCreation = () => {

    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    
    // Step 1 상태 값들
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [dateRange, setDateRange] = useState({
        startDay: '',
        endDay: ''
    });
    const [description, setDescription] = useState('');
    const [meetLocation, setMeetLocation] = useState('');
    const [images, setImages] = useState([]);
    const [thumbnailIndex, setThumbnailIndex] = useState(0);
    
    // Step 2 상태 값들
    const [maxPeople, setMaxPeople] = useState('');
    const [recruitDateRange, setRecruitDateRange] = useState({
        startDate: formatDate(new Date()),
        endDate: formatDate(new Date()),
        startDay: '',
        endDay: ''
    });
    const [selectedGenders, setSelectedGenders] = useState(['남녀무관']);
    const [selectedAges, setSelectedAges] = useState(['누구나']);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState([]);

    // 날짜 형식 변환 함수
    const formatDateForBackend = (date) => {
        if (!date) return null;
        
        // Date 객체인 경우
        if (date instanceof Date) {
            return date.toISOString().split('T')[0]; // "2025-07-01"
        }
        
        // 문자열인 경우
        if (typeof date === 'string') {
            // 이미 YYYY-MM-DD 형식인지 확인
            if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                return date;
            }
            
            // 요일이나 다른 형식인 경우 기본값 반환
            if (date.length <= 3) { // "목", "토" 등
                const today = new Date();
                return today.toISOString().split('T')[0];
            }
            
            // 다른 형식 시도
            const parsedDate = new Date(date);
            if (!isNaN(parsedDate.getTime())) {
                return parsedDate.toISOString().split('T')[0];
            }
        }
        
        // 변환 불가능한 경우 오늘 날짜 반환
        const today = new Date();
        return today.toISOString().split('T')[0];
    };


    // Step 1 유효성 검사
    const isStep1Valid =
        title &&
        title.length >= 10 &&
        location && 
        description && 
        description.length >= 20 && 
        meetLocation;
    
    // Step 2 유효성 검사
    const isStep2Valid = 
        maxPeople && 
        parseInt(maxPeople) > 0 && 
        selectedCategories.length > 0;
    
    // 작성 중인 내용이 있는지 확인
    const hasContent = () => {
        return title || location || description || meetLocation || images.length > 0 || 
            maxPeople || selectedCategories.length > 0 || tags.length > 0;
    };
    
    // 작성 중 나가기 확인 알림
    const showExitConfirmation = (onConfirm) => {
        if (hasContent()) {
            Alert.alert(
                "작성 취소",
                "작성 중인 내용이 저장되지 않습니다. 나가시겠습니까?",
                [
                    {
                        text: "취소",
                        style: "cancel"
                    },
                    {
                        text: "나가기",
                        onPress: onConfirm,
                        style: "destructive"
                    }
                ],
                { cancelable: false }
            );
        } else {
            // 작성 중인 내용이 없으면 바로 나가기
            onConfirm();
        }
    };
    
    const nextStep = () => {
        if (currentStep === 1 && isStep1Valid) {
            setCurrentStep(2);
        } else if (currentStep === 2 && isStep2Valid) {
            handleSubmit();
        }
    };
    
    const prevStep = () => {
        if (currentStep === 2) {
            // Step 2에서는 Step 1으로 돌아가기
            setCurrentStep(1);
        } else {
            // Step 1에서는 AccompanyList로 나가기 (확인 알림 표시)
            showExitConfirmation(() => router.push('/accompany'));
        }
    };
    
    const closeForm = () => {
        // X 버튼 클릭 시 나가기 확인 후 AccompanyList로 이동
        showExitConfirmation(() => router.push('/accompany'));
    };



const handleSubmit = async () => {
        console.log('🚀 동행 생성 시작');
        setIsLoading(true);

        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                Alert.alert("오류", "로그인 정보가 없습니다. 다시 로그인해주세요.");
                setIsLoading(false);
                router.replace('/auth/login');
                return;
            }

            // 백엔드 DTO에 맞는 데이터 객체 생성
            const accompanyData = {
                userId: parseInt(userId, 10),
                title: title.trim(),
                location: location.trim(),
                meetPlace: meetLocation.trim(),
                intro: description.trim(),
                maxRecruit: parseInt(maxPeople),
                travelStartDate: formatDateForBackend(dateRange.startDate || dateRange.startDay),
                travelEndDate: formatDateForBackend(dateRange.endDate || dateRange.endDay),
                recStartDate: formatDateForBackend(recruitDateRange.startDate),
                recEndDate: formatDateForBackend(recruitDateRange.endDate),
                gender: selectedGenders.includes('남녀무관') ? 'ALL' : (selectedGenders[0] || 'ALL'),
                ageGroup: [...new Set(selectedAges.includes('누구나') ? ['ALL'] : selectedAges)],
                category: [...new Set(selectedCategories)],
                tag: [...new Set(tags)]
            };

            // FormData 생성
            const formData = new FormData();
            
            // JSON 데이터를 문자열로 변환하여 추가 (React Native에서는 이렇게 해야 함)
            formData.append('request', {
                string: JSON.stringify(accompanyData),
                type: 'application/json'
            });
            
            // 이미지 파일들 추가
            if (images && images.length > 0) {
                images.forEach((image, index) => {
                    formData.append('images', {
                        uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
                        type: 'image/jpeg',
                        name: `image_${index}.jpg`,
                    });
                });
            }
            
            console.log('📤 FormData 생성 완료');
            console.log('📝 전송할 데이터:', accompanyData);

            const url = `${getBaseURL()}/api/accompany/create`;
            console.log('🌐 API URL:', url);

            const response = await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json',
                },
            });

            console.log('📡 응답 받음:', response.status);

            if (response.status === 200) {
                const result = response.data;
                console.log('✅ 성공 응답:', result);
                Alert.alert(
                    "동행 생성 완료",
                    "동행이 성공적으로 생성되었습니다!",
                    [
                        {
                            text: "확인",
                            onPress: () => {
                                // 동행 목록 페이지로 이동
                                router.push('/accompany');
                            }
                        }
                    ],
                    { cancelable: false }
                );
            }
        } catch (error) {
            console.error('❌ 네트워크 에러:', error);
            if (error.response) {
                console.log('❌ 서버 에러 응답:', error.response.data);
                Alert.alert(
                    "동행 생성 실패",
                    `서버 오류 발생 (${error.response.status})\n\n${JSON.stringify(error.response.data, null, 2)}`
                );
            } else {
                Alert.alert("네트워크 오류", "서버에 연결할 수 없습니다. 와이파이 연결과 서버 실행 상태를 확인해주세요.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    
    const renderStep = () => {
        if (currentStep === 1) {
            return (
                <Step1
                    title={title}
                    setTitle={setTitle}
                    location={location}
                    setLocation={setLocation}
                    dateRange={dateRange}
                    setDateRange={setDateRange}
                    description={description}
                    setDescription={setDescription}
                    meetLocation={meetLocation}
                    setMeetLocation={setMeetLocation}
                    images={images}
                    setImages={setImages}
                    thumbnailIndex={thumbnailIndex}
                    setThumbnailIndex={setThumbnailIndex}
                />
            );
        } else {
            return (
                <Step2
                    maxPeople={maxPeople}
                    setMaxPeople={setMaxPeople}
                    recruitDateRange={recruitDateRange}
                    setRecruitDateRange={setRecruitDateRange}
                    selectedGenders={selectedGenders}
                    setSelectedGenders={setSelectedGenders}
                    selectedAges={selectedAges}
                    setSelectedAges={setSelectedAges}
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                    tagInput={tagInput}
                    setTagInput={setTagInput}
                    tags={tags}
                    setTags={setTags}
                />
            );
        }
    };
    
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={prevStep}>
                        <Ionicons name="chevron-back" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>동행 생성</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={closeForm}>
                        <Ionicons name="close" size={24} color="black" />
                    </TouchableOpacity>
                </View>
                
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View 
                            style={[ 
                                styles.progress, 
                                { width: currentStep === 1 ? '50%' : '100%' }
                            ]} 
                        />
                    </View>
                </View>
            </View>
            
            <KeyboardAwareScrollView
                style={styles.contentContainer}
                contentContainerStyle={styles.scrollContent}
                enableOnAndroid={true}
                enableAutomaticScroll={true}
                extraScrollHeight={100}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={true}
                extraHeight={Platform.OS === 'ios' ? 120 : 80}
            >
                {renderStep()}
                <View style={styles.spacer} />
            </KeyboardAwareScrollView>
            
            <View style={styles.fixedButtonContainer}>
                <TouchableOpacity 
                    style={[ 
                        styles.button, 
                        (currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid) 
                            ? styles.buttonDisabled 
                            : styles.buttonEnabled
                    ]} 
                    onPress={nextStep}
                    disabled={(currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid) || isLoading}
                >
                    <Text style={[ 
                        styles.buttonText,
                        (currentStep === 1 && !isStep1Valid) || (currentStep === 2 && !isStep2Valid) 
                            ? styles.buttonTextDisabled 
                            : styles.buttonTextEnabled
                    ]}>
                        {currentStep === 1 ? '다음' : '작성 완료'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerContainer: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 5,
    },
    closeButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    progressContainer: {
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    progressBar: {
        height: 4,
        backgroundColor: '#e0e0e0',
        borderRadius: 2,
    },
    progress: {
        height: '100%',
        backgroundColor: '#333',
        borderRadius: 2,
    },
    contentContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100, // 하단 버튼을 위한 여백
    },
    spacer: {
        height: 80, // 스크롤 콘텐츠와 하단 고정 버튼 사이의 여백
    },
    fixedButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5, 
        
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginRight: 8,
    },
    buttonEnabled: {
        backgroundColor: '#000',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    buttonTextEnabled: {
        color: '#FFF',
    },
    buttonTextDisabled: {
        color: '#FFF',
    },
});

export default AccompanyCreation;
