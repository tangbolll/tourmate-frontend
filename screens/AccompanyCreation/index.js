import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Platform
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../../utils/dateUtils';
import Step1 from './Step1';
import Step2 from './Step2';

const AccompanyCreation = ({ navigation }) => {
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
    
    const nextStep = () => {
        if (currentStep === 1 && isStep1Valid) {
            setCurrentStep(2);
        } else if (currentStep === 2 && isStep2Valid) {
            handleSubmit();
        }
    };
    
    const prevStep = () => {
        if (currentStep === 2) {
            setCurrentStep(1);
        } else {
            // 첫 단계에서 뒤로가기시 이전 화면으로 이동
            navigation.goBack();
        }
    };
    
    const closeForm = () => {
        navigation.goBack();
    };
    
    const handleSubmit = async () => {
        setIsLoading(true);
        
        try {
            // 모든 데이터를 하나의 객체로 구성
            const formData = {
                title,
                location,
                dateRange,
                description,
                meetLocation,
                thumbnailIndex,
                maxPeople: parseInt(maxPeople),
                recruitDateRange,
                genders: selectedGenders,
                ages: selectedAges,
                categories: selectedCategories,
                tags
            };
            
            // API 호출 등의 로직을 여기에 구현
            // 예: await createAccompany(formData, images);
            
            console.log('제출 데이터:', formData);
            
            // 성공 시 리스트로 이동
            navigation.navigate('AccompanyList');
        } catch (error) {
            console.error('동행 등록 오류:', error);
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
        paddingVertical: 10,
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
        color: '#888',
    },
});

export default AccompanyCreation;