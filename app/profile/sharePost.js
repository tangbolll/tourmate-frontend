import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Image, Alert, Modal, TextInput } from "react-native";
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import PostDirectoryHeader from "../../components/profile/PostDirectoryHeader";
import SaveButton from "../../components/profile/SaveButton";

const sharePost = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    // 디렉토리 정보 상태
    const [directoryInfo, setDirectoryInfo] = useState({
        id: null,
        name: '',
        startDate: null,
        endDate: null
    });
    
    // 선택된 엽서들
    const [selectedPostcards, setSelectedPostcards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    
    // 각 엽서별 정보
    const [postcardDetails, setPostcardDetails] = useState({});
    
    // 모달 상태
    const [isDateModalVisible, setIsDateModalVisible] = useState(false);
    const [availableDates, setAvailableDates] = useState([]);

    // 전달받은 디렉토리 정보 및 선택된 엽서들 설정 - 의존성 배열 수정
    useEffect(() => {
        // params가 존재하고 필요한 값들이 있을 때만 업데이트
        if (params?.directoryId || params?.directoryTitle || params?.startDate || params?.endDate) {
            const startDate = params.startDate ? new Date(params.startDate) : null;
            const endDate = params.endDate ? new Date(params.endDate) : null;
            
            setDirectoryInfo(prev => {
                // 이미 같은 데이터가 설정되어 있으면 업데이트하지 않음
                if (prev.id === params.directoryId && 
                    prev.name === (params.directoryTitle || '새 폴더') &&
                    prev.startDate?.getTime() === startDate?.getTime() &&
                    prev.endDate?.getTime() === endDate?.getTime()) {
                    return prev;
                }
                
                return {
                    id: params.directoryId,
                    name: params.directoryTitle || '새 폴더',
                    startDate: startDate,
                    endDate: endDate
                };
            });
            
            // 날짜 범위 내의 모든 날짜 생성
            if (startDate && endDate) {
                const dates = [];
                const current = new Date(startDate);
                while (current <= endDate) {
                    dates.push(new Date(current));
                    current.setDate(current.getDate() + 1);
                }
                setAvailableDates(dates);
            }
        }
    }, [params?.directoryId, params?.directoryTitle, params?.startDate, params?.endDate]);

    // 선택된 엽서들 초기화 - 별도 useEffect로 분리
    useEffect(() => {
        // 실제로는 props나 navigation params로 받아올 선택된 엽서들
        // 임시로 더미 데이터 설정
        const dummyPostcards = [
            { id: 1, image: 'https://picsum.photos/400/300?random=1', postcardTemplate: { color: '#E3F2FD', tab: 'Line' }},
            { id: 2, image: 'https://picsum.photos/400/300?random=2', postcardTemplate: { color: '#F3E5F5', tab: 'Plain' }},
            { id: 3, image: 'https://picsum.photos/400/300?random=3', postcardTemplate: { color: '#E8F5E8', tab: 'Image' }},
        ];
        
        setSelectedPostcards(dummyPostcards);
        
        // 각 엽서별 초기 정보 설정
        const initialDetails = {};
        dummyPostcards.forEach(postcard => {
            initialDetails[postcard.id] = {
                title: '',
                location: '',
                date: null
            };
        });
        setPostcardDetails(initialDetails);
    }, []); // 빈 의존성 배열로 한 번만 실행

    // 날짜 포맷팅 함수
    const formatDate = useCallback((date) => {
        if (!date) return '';
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${month}.${day}`;
    }, []);

    // 엽서 선택 변경
    const selectPostcard = useCallback((index) => {
        setCurrentIndex(index);
    }, []);

    // 더 많은 엽서 추가하기 (뒤로가기)
    const addMorePostcards = useCallback(() => {
        router.back();
    }, [router]);

    // 엽서 템플릿 렌더링 함수
    const renderPostcardTemplate = useCallback((template) => {
        if (!template) return null;

        return (
            <View style={[styles.postcardTemplate, { backgroundColor: template.color }]}>
                <Text style={styles.postcardTitle}>Postcard</Text>
                <View style={styles.postcardContent}>
                    <View style={styles.postcardLeft} />
                    <View style={styles.postcardRight}>
                        {template.tab === 'Line' && (
                            <>
                                <View style={styles.templateLine} />
                                <View style={styles.templateLine} />
                                <View style={styles.templateLine} />
                                <View style={styles.templateLine} />
                            </>
                        )}
                        {template.tab === 'Plain' && (
                            <View style={styles.templatePlainArea} />
                        )}
                        {template.tab === 'Image' && (
                            <View style={styles.templateImageArea}>
                                <Text style={styles.templateImageText}>Image</Text>
                            </View>
                        )}
                    </View>
                </View>
                <Text style={styles.postcardBottom}>This side for message</Text>
            </View>
        );
    }, []);

    // 엽서 정보 업데이트
    const updatePostcardDetail = useCallback((field, value) => {
        const currentPostcard = selectedPostcards[currentIndex];
        if (!currentPostcard) return;
        
        setPostcardDetails(prev => ({
            ...prev,
            [currentPostcard.id]: {
                ...prev[currentPostcard.id],
                [field]: value
            }
        }));
    }, [currentIndex, selectedPostcards]);

    // 날짜 선택 모달 열기
    const openDateModal = useCallback(() => {
        setIsDateModalVisible(true);
    }, []);

    // 날짜 선택
    const selectDate = useCallback((date) => {
        updatePostcardDetail('date', date);
        setIsDateModalVisible(false);
    }, [updatePostcardDetail]);

    // 업로드 기능
    const handleUpload = useCallback(() => {
        // 모든 엽서의 필수 정보가 입력되었는지 확인
        const isAllCompleted = selectedPostcards.every(postcard => {
            const details = postcardDetails[postcard.id];
            return details && details.title && details.location && details.date;
        });

        if (!isAllCompleted) {
            Alert.alert('정보 부족', '모든 엽서의 제목, 여행 장소, 여행 날짜를 입력해주세요.');
            return;
        }

        Alert.alert(
            '업로드 확인',
            '엽서를 업로드하시겠습니까?\n업로드된 엽서는 다른 유저의 홈화면에 표시됩니다.',
            [
                { text: '취소', style: 'cancel' },
                { 
                    text: '업로드', 
                    onPress: () => {
                        console.log('엽서 업로드:', selectedPostcards, postcardDetails);
                        Alert.alert('업로드 완료', '엽서가 성공적으로 업로드되었습니다.');
                        router.back();
                    }
                }
            ]
        );
    }, [selectedPostcards, postcardDetails, router]);

    // 현재 선택된 엽서 정보
    const currentPostcard = selectedPostcards[currentIndex];
    const currentDetails = currentPostcard ? postcardDetails[currentPostcard.id] : {};

    // 업로드 버튼 활성화 조건
    const isUploadEnabled = selectedPostcards.length > 0 && selectedPostcards.every(postcard => {
        const details = postcardDetails[postcard.id];
        return details && details.title && details.location && details.date;
    });

    return (
        <View style={styles.container}>
            {/* 헤더 */}
            <PostDirectoryHeader
                title={directoryInfo.name}
                startDate={directoryInfo.startDate ? `2021.${formatDate(directoryInfo.startDate)}` : '2021.03.04'}
                endDate={directoryInfo.endDate ? formatDate(directoryInfo.endDate) : '03.06'}
                onBackPress={() => router.back()}
                showActionButton={false}
            />

            {/* 엽서 슬라이드 영역 - 엽서가 2개 이상일 때만 표시 */}
            {selectedPostcards.length > 1 && (
                <View style={styles.slideContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.slideContent}
                    >
                        {selectedPostcards.map((postcard, index) => (
                            <TouchableOpacity
                                key={postcard.id}
                                style={[
                                    styles.slideItem,
                                    currentIndex === index && styles.slideItemActive
                                ]}
                                onPress={() => selectPostcard(index)}
                            >
                                {postcard.image ? (
                                    <View style={styles.slideImageContainer}>
                                        <Image source={{ uri: postcard.image }} style={styles.slideImage} />
                                        {currentIndex === index && (
                                            <View style={styles.checkmark}>
                                                <Feather name="check" size={16} color="#fff" />
                                            </View>
                                        )}
                                    </View>
                                ) : (
                                    <View style={styles.slideEmpty}>
                                        {currentIndex === index && (
                                            <View style={styles.checkmark}>
                                                <Feather name="check" size={16} color="#fff" />
                                            </View>
                                        )}
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                        
                        {/* 더 추가하기 버튼 */}
                        <TouchableOpacity 
                            style={styles.addButton} 
                            onPress={addMorePostcards}
                        >
                            <Feather name="plus" size={24} color="#999" />
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            )}

            {/* 메인 컨텐츠 영역 */}
            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
                {/* 엽서 정보 입력 섹션 */}
                <View style={styles.inputSection}>
                    {/* 엽서 제목 */}
                    <View style={styles.inputGroup}>
                        <TextInput
                            style={styles.titleInput}
                            placeholder="엽서 제목 (최대 10자)"
                            placeholderTextColor="#999"
                            value={currentDetails.title || ''}
                            onChangeText={(text) => updatePostcardDetail('title', text)}
                            maxLength={10}
                        />
                    </View>

                    {/* 여행 장소와 날짜 */}
                    <View style={styles.inputRow}>
                        <View style={styles.inputHalf}>
                            <View style={styles.inputWithIcon}>
                                <Feather name="map-pin" size={16} color="#000" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInputWithIcon}
                                    placeholder="여행장소"
                                    placeholderTextColor="#999"
                                    value={currentDetails.location || ''}
                                    onChangeText={(text) => updatePostcardDetail('location', text)}
                                />
                            </View>
                        </View>
                        
                        <View style={styles.inputHalf}>
                            <TouchableOpacity
                                style={styles.dateSelector}
                                onPress={openDateModal}
                            >
                                <View style={styles.dateSelectorContent}>
                                    <Feather name="calendar" size={16} color="#000" style={styles.inputIcon} />
                                    <Text style={[
                                        styles.dateText,
                                        !currentDetails.date && styles.placeholder
                                    ]}>
                                        {currentDetails.date ? formatDate(currentDetails.date) : '여행날짜'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* 사진 영역 */}
                <View style={styles.photoSection}>
                    {currentPostcard && currentPostcard.image ? (
                        <Image 
                            source={{ uri: currentPostcard.image }} 
                            style={styles.photoImage} 
                        />
                    ) : (
                        <View style={styles.photoPlaceholder}>
                            <Feather name="image" size={48} color="#ccc" />
                        </View>
                    )}
                </View>

                {/* 엽서 템플릿 영역 */}
                <View style={styles.postcardSection}>
                    {currentPostcard && currentPostcard.postcardTemplate ? (
                        renderPostcardTemplate(currentPostcard.postcardTemplate)
                    ) : (
                        <View style={styles.postcardPlaceholder}>
                            <Feather name="file-text" size={48} color="#ccc" />
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* 하단 업로드 버튼 영역 */}
            <View style={styles.uploadSection}>
                <Text style={styles.uploadNotice}>
                    업로드 클릭 시 내 엽서가 다른 유저의 홈화면에 표시됩니다.
                </Text>
                <SaveButton
                    title="업로드"
                    onPress={handleUpload}
                    disabled={!isUploadEnabled}
                />
            </View>

            {/* 날짜 선택 모달 */}
            <Modal
                visible={isDateModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsDateModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.dateModal}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>여행 날짜 선택</Text>
                            <TouchableOpacity onPress={() => setIsDateModalVisible(false)}>
                                <Feather name="x" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.dateList}>
                            {availableDates.map((date, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.dateItem}
                                    onPress={() => selectDate(date)}
                                >
                                    <Text style={styles.dateItemText}>
                                        {formatDate(date)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    slideContainer: {
        paddingTop: 16,
        backgroundColor: '#fff',
    },
    slideContent: {
        paddingHorizontal: 16,
        gap: 12,
    },
    slideItem: {
        width: 100,
        height: 80,
        backgroundColor: '#f5f5f5',
        borderWidth: 2,
        borderColor: 'transparent',
        borderRadius: 0,
        overflow: 'hidden',
    },
    slideItemActive: {
        borderColor: '#007AFF',
    },
    slideImageContainer: {
        flex: 1,
        position: 'relative',
    },
    slideImage: {
        width: '100%',
        height: '100%',
    },
    slideEmpty: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        position: 'relative',
    },
    checkmark: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        width: 100,
        height: 80,
        backgroundColor: '#f5f5f5',
        borderRadius: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
        padding: 16,
    },
    inputSection: {
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 12,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 12,
    },
    inputHalf: {
        flex: 1,
    },
    titleInput:{
        marginHorizontal: 20,
        borderBottomWidth: 1,
        borderColor: '#000',
        padding: 12,
        fontSize: 18,
        backgroundColor: '#fff',
        textAlign: 'center'
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
        paddingHorizontal: 12,
    },
    textInputWithIcon: {
        flex: 1,
        fontSize: 16,
        padding: 12,
        paddingLeft: 8,
    },
    inputIcon: {
        marginRight: 0,
    },
    dateSelector: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
        padding: 12,
    },
    dateSelectorContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 8,
    },
    placeholder: {
        color: '#999',
    },
    photoSection: {
        height: 250,
        backgroundColor: '#f5f5f5',
        borderRadius: 0,
        marginBottom: 16,
        overflow: 'hidden',
    },
    photoImage: {
        width: '100%',
        height: '100%',
    },
    photoPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    postcardSection: {
        height: 250,
        backgroundColor: '#f5f5f5',
        borderRadius: 0,
        marginBottom: 16,
        overflow: 'hidden',
    },
    postcardPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadSection: {
        padding: 16,
        paddingBottom: 32,
    },
    uploadNotice: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 12,
    },
    // 엽서 템플릿 스타일
    postcardTemplate: {
        width: '100%',
        height: '100%',
        padding: 12,
        justifyContent: 'space-between',
    },
    postcardTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    postcardContent: {
        flex: 1,
        flexDirection: 'row',
        marginVertical: 8,
        gap: 8,
    },
    postcardLeft: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 4,
    },
    postcardRight: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
    },
    templateLine: {
        height: 1,
        backgroundColor: '#666',
        marginVertical: 2,
    },
    templatePlainArea: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 4,
    },
    templateImageArea: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    templateImageText: {
        fontSize: 10,
        color: '#666',
        fontWeight: '500',
    },
    postcardBottom: {
        fontSize: 8,
        color: '#666',
        textAlign: 'center',
    },
    // 모달 스타일
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateModal: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        width: '80%',
        maxHeight: '60%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    dateList: {
        maxHeight: 200,
    },
    dateItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    dateItemText: {
        fontSize: 16,
        color: '#333',
    },
});

export default sharePost;