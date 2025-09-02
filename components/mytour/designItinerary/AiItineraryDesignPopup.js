import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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

const AiItineraryDesignPopup = ({ 
    visible, 
    onClose, 
    onConfirm,
    periodType,
    startDate,
    endDate,
    nights,
    days 
}) => {
    const [selectedDates, setSelectedDates] = useState(['전체']);
    const [selectedPreference, setSelectedPreference] = useState('부지런한 일정을 선호해요');

    // 날짜 옵션 생성
    const generateDateOptions = () => {
        const options = ['전체'];
        
        if (periodType === 'date' && startDate && endDate) {
            // 날짜 기반인 경우 실제 날짜로 표시
            const start = new Date(startDate);
            const end = new Date(endDate);
            let current = new Date(start);
            
            while (current <= end) {
                const month = current.getMonth() + 1;
                const day = current.getDate();
                const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][current.getDay()];
                options.push(`${month}.${day} (${dayOfWeek})`);
                current.setDate(current.getDate() + 1);
            }
        } else if (periodType === 'duration' && days) {
            // 기간 기반인 경우 일차로 표시
            for (let i = 1; i <= days; i++) {
                const dayOfWeek = ['월', '화', '수', '목', '금', '토', '일'][(i - 1) % 7];
                options.push(`${i}일차`);
            }
        }
        
        return options;
    };

    const dateOptions = generateDateOptions();

    const handleDateToggle = (date) => {
        if (date === '전체') {
            // 전체 선택 시 다른 모든 선택 해제
            setSelectedDates(['전체']);
        } else {
            // 다른 날짜 선택 시
            setSelectedDates(prev => {
                let newSelected = prev.filter(item => item !== '전체'); // 전체 제거
                
                if (newSelected.includes(date)) {
                    // 이미 선택된 경우 제거
                    newSelected = newSelected.filter(item => item !== date);
                } else {
                    // 선택되지 않은 경우 추가
                    newSelected.push(date);
                }
                
                // 아무것도 선택되지 않은 경우 전체로 설정
                return newSelected.length === 0 ? ['전체'] : newSelected;
            });
        }
    };

    const handlePreferenceSelect = (preference) => {
        setSelectedPreference(preference);
    };

    const handleConfirm = () => {
        const result = {
            selectedDates,
            selectedPreference
        };
        onConfirm(result);
    };

    // 날짜 옵션을 2열로 나누기
    const getDateColumns = () => {
        const leftColumn = [];
        const rightColumn = [];
        
        dateOptions.forEach((option, index) => {
            if (index % 2 === 0) {
                leftColumn.push(option);
            } else {
                rightColumn.push(option);
            }
        });
        
        return { leftColumn, rightColumn };
    };

    const { leftColumn, rightColumn } = getDateColumns();

    // 백엔드에 데이터 전달
    const handleAiPopupConfirm = async (result) => {
    try {
        // 예시 API 요청, 실제 URL 및 요청 내용에 맞게 수정 필요
        const response = await fetch(`${getBaseURL()}/api/ai/generate-suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
        });
        const data = await response.json();
        console.log('백엔드 응답:', data);
        // 성공 처리 (예: 팝업 닫기, 알림 등)
    } catch (error) {
        console.error('백엔드 전송 실패:', error);
        // 실패 처리 (예: 에러 표시)
    }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.popup}>
                    <View style={styles.header}>
                        <Text style={styles.title}>AI 일정 생성</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView 
                        style={styles.content} 
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.contentContainer}
                    >
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>추천 범위</Text>
                            <Text style={styles.sectionDescription}>
                                원하시는 날짜 내에서 추천 일정을 구성합니다.{'\n'}
                                일정 범위를 선택해주세요.
                            </Text>
                            
                            <View style={styles.dateOptionsContainer}>
                                <View style={styles.dateColumn}>
                                    {leftColumn.map((option) => (
                                        <TouchableOpacity
                                            key={option}
                                            style={[
                                                styles.dateOption,
                                                selectedDates.includes(option) && styles.selectedDateOption
                                            ]}
                                            onPress={() => handleDateToggle(option)}
                                        >
                                            <View style={[
                                                styles.checkbox,
                                                selectedDates.includes(option) && styles.checkedBox
                                            ]}>
                                                {selectedDates.includes(option) && (
                                                    <Ionicons name="checkmark" size={14} color="#fff" />
                                                )}
                                            </View>
                                            <Text style={[
                                                styles.dateOptionText,
                                                selectedDates.includes(option) && styles.selectedDateOptionText
                                            ]}>
                                                {option}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                
                                <View style={styles.dateColumn}>
                                    {rightColumn.map((option) => (
                                        <TouchableOpacity
                                            key={option}
                                            style={[
                                                styles.dateOption,
                                                selectedDates.includes(option) && styles.selectedDateOption
                                            ]}
                                            onPress={() => handleDateToggle(option)}
                                        >
                                            <View style={[
                                                styles.checkbox,
                                                selectedDates.includes(option) && styles.checkedBox
                                            ]}>
                                                {selectedDates.includes(option) && (
                                                    <Ionicons name="checkmark" size={14} color="#fff" />
                                                )}
                                            </View>
                                            <Text style={[
                                                styles.dateOptionText,
                                                selectedDates.includes(option) && styles.selectedDateOptionText
                                            ]}>
                                                {option}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>여행 성향</Text>
                            <Text style={styles.sectionDescription}>
                                AI가 일정을 생성할 때 참고해요.
                            </Text>
                            
                            <View style={styles.preferenceContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.preferenceOption,
                                        selectedPreference === '부지런한 일정을 선호해요' && styles.selectedPreferenceOption
                                    ]}
                                    onPress={() => handlePreferenceSelect('부지런한 일정을 선호해요')}
                                >
                                    <View style={[
                                        styles.radioButton,
                                        selectedPreference === '부지런한 일정을 선호해요' && styles.selectedRadioButton
                                    ]}>
                                        {selectedPreference === '부지런한 일정을 선호해요' && (
                                            <View style={styles.radioButtonInner} />
                                        )}
                                    </View>
                                    <Text style={[
                                        styles.preferenceText,
                                        selectedPreference === '부지런한 일정을 선호해요' && styles.selectedPreferenceText
                                    ]}>
                                        부지런한 일정을 선호해요
                                    </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    style={[
                                        styles.preferenceOption,
                                        selectedPreference === '느긋한 일정을 선호해요' && styles.selectedPreferenceOption
                                    ]}
                                    onPress={() => handlePreferenceSelect('느긋한 일정을 선호해요')}
                                >
                                    <View style={[
                                        styles.radioButton,
                                        selectedPreference === '느긋한 일정을 선호해요' && styles.selectedRadioButton
                                    ]}>
                                        {selectedPreference === '느긋한 일정을 선호해요' && (
                                            <View style={styles.radioButtonInner} />
                                        )}
                                    </View>
                                    <Text style={[
                                        styles.preferenceText,
                                        selectedPreference === '느긋한 일정을 선호해요' && styles.selectedPreferenceText
                                    ]}>
                                        느긋한 일정을 선호해요
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                            <Text style={styles.confirmButtonText}>완료</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popup: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: screenWidth - 32,
        height: screenHeight * 0.6, // 명시적으로 높이 설정
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        // borderBottomWidth: 1,
        // borderBottomColor: '#f0f0f0',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        flex: 1, 
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20, 
    },
    section: {
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    sectionDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12,
    },
    dateOptionsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    dateColumn: {
        flex: 1,
    },
    dateOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    selectedDateOption: {
        // 선택된 상태 스타일은 체크박스와 텍스트에서 처리
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#ddd',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    checkedBox: {
        backgroundColor: '#333',
        borderColor: '#333',
    },
    dateOptionText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    selectedDateOptionText: {
        fontWeight: '500',
    },
    preferenceContainer: {
        gap: 8,
    },
    preferenceOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 4,
    },
    selectedPreferenceOption: {
        // 선택된 상태 스타일은 라디오 버튼과 텍스트에서 처리
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ddd',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    selectedRadioButton: {
        borderColor: '#333',
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#333',
    },
    preferenceText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    selectedPreferenceText: {
        fontWeight: '500',
    },
    footer: {
        padding: 20,
        // borderTopWidth: 1,
        // borderTopColor: '#f0f0f0',
    },
    confirmButton: {
        backgroundColor: '#333',
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: 8,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default AiItineraryDesignPopup;