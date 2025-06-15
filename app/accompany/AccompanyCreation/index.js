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

    const getBaseURL = () => {
    if (__DEV__) {
        if (Platform.OS === 'android') {
        return 'http://10.0.2.2:8080';
        } else {
        return 'http://192.168.219.46:8080'; // 본인 IP로 변경
        }
    } else {
        return 'https://your-production-api.com';
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
    

    // 완전한 handleSubmit 함수 - 기존 함수를 이걸로 완전히 교체하세요!

const handleSubmit = async () => {
    console.log('🚀 동행 생성 시작');
    setIsLoading(true);

    try {
        // 1. 요청 데이터 준비
        const requestData = {
            userId: 2, // 현재는 고정값, 나중에 실제 로그인한 사용자 ID로 변경
            title: title.trim(),
            location: location.trim(),
            meetPlace: meetLocation.trim(), // meetingPoint -> meetPlace로 변경
            intro: description.trim(), // description -> intro로 변경
            maxRecruit: parseInt(maxPeople) || 3, // maxParticipants -> maxRecruit로 변경
            tripStartDate: formatDateForBackend(dateRange.startDay),
            tripEndDate: formatDateForBackend(dateRange.endDay), 
            recStartDate: formatDateForBackend(recruitDateRange.startDate), // recruitmentStartDate -> recStartDate
            recEndDate: formatDateForBackend(recruitDateRange.endDate), // recruitmentEndDate -> recEndDate
            imageUrl: images || [],
            gender: selectedGenders.includes('남녀무관') ? 'ALL' : (selectedGenders[0] || 'ALL'),
            ageGroup: selectedAges.includes('누구나') ? ['ALL'] : selectedAges, // ageRange -> ageGroup
            category: selectedCategories,
            tag: tags || [],
        };

        console.log('📤 요청 데이터:', JSON.stringify(requestData, null, 2));

        // 2. API URL 설정
        const url = `${getBaseURL()}/api/accompany/create`;
        console.log('🌐 API URL:', url);

        // 3. API 요청
        console.log('📡 요청 전송 중...');
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        console.log('📡 응답 받음:');
        console.log('  - 상태 코드:', response.status);
        console.log('  - 상태 텍스트:', response.statusText);
        console.log('  - Content-Type:', response.headers.get('content-type'));

        // 4. 응답 처리
        if (response.ok) {
            const result = await response.json();
            console.log('✅ 성공! 응답 데이터:', result);
            
            // 🎉 성공 알림
            Alert.alert(
                "동행 생성 완료!", 
                `"${title}" 동행이 성공적으로 등록되었습니다.\n\n다른 여행자들의 참여를 기다려보세요!`
            );

        } else {
            // 5. 에러 응답 처리
            console.log('❌ 에러 응답 분석 시작...');
            
            const contentType = response.headers.get('content-type');
            console.log('❌ Content-Type:', contentType);

            let errorData;
            let errorText;
            
            try {
                if (contentType && contentType.includes('application/json')) {
                    errorData = await response.json();
                    errorText = JSON.stringify(errorData, null, 2);
                    console.log('❌ JSON 에러 응답:', errorData);
                } else {
                    errorText = await response.text();
                    console.log('❌ 텍스트 에러 응답:', errorText);
                }
            } catch (parseError) {
                console.error('❌ 에러 응답 파싱 실패:', parseError);
                errorText = '응답 파싱 실패';
            }

            console.log('❌ 에러 상세 정보:');
            console.log('  - HTTP 상태:', response.status);
            console.log('  - 상태 텍스트:', response.statusText);
            console.log('  - 에러 내용:', errorText);

            // 에러별 메시지 설정
            let errorMessage = '';
            if (response.status === 400) {
                errorMessage = '입력 정보에 오류가 있습니다.\n모든 필드를 올바르게 입력했는지 확인해주세요.';
            } else if (response.status === 409) {
                errorMessage = '중복된 데이터가 있습니다.\n제목이나 날짜를 조금 변경해서 다시 시도해주세요.';
            } else if (response.status === 500) {
                errorMessage = `서버에서 내부 오류가 발생했습니다.\n\n백엔드 콘솔 로그를 확인해주세요.\n\n에러 내용:\n${errorText.substring(0, 200)}${errorText.length > 200 ? '...' : ''}`;
            } else {
                errorMessage = `서버 오류가 발생했습니다.\n상태 코드: ${response.status}\n\n${errorText.substring(0, 200)}${errorText.length > 200 ? '...' : ''}`;
            }

            Alert.alert(
                "동행 생성 실패", 
                errorMessage,
                [
                    { text: "확인" },
                    { 
                        text: "로그 보기", 
                        onPress: () => console.log('📋 전체 에러 정보:', errorText)
                    }
                ]
            );
        }

    } catch (error) {
        // 6. 네트워크 에러 처리
        console.error('❌ 네트워크 에러 상세:', error);
        console.error('❌ 에러 타입:', error.name);
        console.error('❌ 에러 메시지:', error.message);
        console.error('❌ 전체 에러:', error);

        let errorMessage = '';
        
        if (error.message.includes('Network request failed')) {
            errorMessage = '네트워크 연결을 확인해주세요.\n\n확인사항:\n• WiFi나 모바일 데이터 연결\n• 서버가 실행 중인지 확인\n• IP 주소 및 포트 번호 확인';
        } else if (error.message.includes('timeout')) {
            errorMessage = '서버 응답 시간이 초과되었습니다.\n네트워크 상태를 확인하고 다시 시도해주세요.';
        } else {
            errorMessage = `예상치 못한 오류가 발생했습니다.\n\n${error.message}`;
        }

        Alert.alert(
            "네트워크 오류",
            errorMessage,
            [
                { text: "다시 시도", style: 'default' },
                { 
                    text: "나중에 시도", 
                    onPress: () => router.push('/accompany'),
                    style: 'cancel'
                }
            ]
        );

    } finally {
        // 7. 로딩 종료
        setIsLoading(false);
        console.log('🔄 로딩 상태 해제');
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