import React, { useState, useEffect } from 'react';
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
    
    // const handleSubmit = async () => {
    //     setIsLoading(true);
        
    //     try {
    //         // 모든 데이터를 하나의 객체로 구성
    //         const formData = {
    //             title,
    //             location,
    //             dateRange,
    //             description,
    //             meetLocation,
    //             thumbnailIndex,
    //             maxPeople: parseInt(maxPeople),
    //             recruitDateRange,
    //             genders: selectedGenders,
    //             ages: selectedAges,
    //             categories: selectedCategories,
    //             tags
    //         };
            
    //         // API 호출 등의 로직을 여기에 구현
    //         // 예: await createAccompany(formData, images);
            
    //         console.log('제출 데이터:', formData);
            
    //         // 성공 시 리스트로 이동
    //         router.push('/accompany');
    //     } catch (error) {
    //         console.error('동행 등록 오류:', error);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };
    const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
        // 1. 프론트엔드 데이터를 백엔드 형식에 맞게 변환
        const requestData = {
                userId: 1, // TODO: 실제 로그인된 사용자 ID로 변경
                title: title,
                location: location,
                meetingPoint: meetLocation,
                description: description,
                maxParticipants: parseInt(maxPeople),
                travelStartDate: formatDateForBackend(dateRange.startDay),
                travelEndDate: formatDateForBackend(dateRange.endDay),
                recruitmentStartDate: formatDateForBackend(recruitDateRange.startDate),
                recruitmentEndDate: formatDateForBackend(recruitDateRange.endDate),
                imageUrl: images.length > 0 ? images : [],
                gender: selectedGenders.includes('남녀무관') ? 'ALL' : selectedGenders[0],
                ageRange: selectedAges.includes('누구나') ? ['ALL'] : selectedAges,
                category: selectedCategories,
                tag: tags,
            };

        console.log('전송할 데이터:', requestData);

        // 2. 백엔드로 POST 요청 전송
        const response = await fetch('http://192.168.35.116:8080/api/accompany/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        // 3. 응답 처리
        if (response.ok) {
            const result = await response.json();
            console.log('동행 생성 성공:', result);
            
            // 성공 알림
            Alert.alert(
                "완료", 
                "동행이 성공적으로 등록되었습니다!",
                [
                    {
                        text: "확인",
                        onPress: () => router.push('/accompany')
                    }
                ]
            );
        } else {
            // 에러 응답 처리
            const errorData = await response.text();
            console.error('서버 에러:', errorData);
            Alert.alert("오류", "동행 등록에 실패했습니다. 다시 시도해주세요.");
        }
        
    } 
    catch (error) {
        console.error('네트워크 오류:', error);
        Alert.alert("오류", "네트워크 연결을 확인해주세요.");
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
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
    },
    button: {
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
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