import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, Text } from "react-native";
import { useRouter, useLocalSearchParams } from 'expo-router';
import PostDirectoryHeader from "../../components/profile/PostDirectoryHeader";
import PostcardSlider from "../../components/profile/sharePost/PostcardSlider";
import PostcardInfoForm from "../../components/profile/sharePost/PostcardInfoForm";
import PhotoSection from "../../components/profile/sharePost/PhotoSection";
import PostcardTemplate from "../../components/profile/PostcardTemplate";
import UploadSection from "../../components/profile/sharePost/UploadSection";
import DateSelectorModal from "../../components/profile/sharePost/DateSelectorModal";

import {
    getPostcardsByFolderApi,
    togglePostcardPublicScopeApi,
    updatePostcardPublicDetailsApi,
    handleApiError,
} from "../../utils/PostCardApi";

const sharePost = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    // 디렉토리 정보를 관리하는 상태.
    const [directoryInfo, setDirectoryInfo] = useState({
        id: null,
        name: '',
        startDate: null,
        endDate: null
    });
    
    // 선택된 엽서 배열과 현재 활성화된 엽서의 인덱스.
    const [selectedPostcards, setSelectedPostcards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    
    // 각 엽서별로 입력된 제목, 장소, 날짜 정보를 관리하는 상태.
    const [postcardDetails, setPostcardDetails] = useState({});
    
    // 각 엽서별 업로드 진행 상태(업로드 중/완료)를 관리하는 상태.
    const [uploadStatus, setUploadStatus] = useState({});
    
    // 날짜 선택 모달의 표시 여부와 선택 가능한 날짜들을 관리하는 상태.
    const [isDateModalVisible, setIsDateModalVisible] = useState(false);
    const [availableDates, setAvailableDates] = useState([]);

    // URL 파라미터로 전달받은 디렉토리 정보와 엽서 데이터를 상태에 설정합니다.
    useEffect(() => {
        // PostDirectory 페이지에서 전달된 엽서 데이터를 처리
        if (params?.selectedPostcards) {
            try {
                // JSON 문자열을 객체 배열로 파싱
                const parsedPostcards = JSON.parse(params.selectedPostcards);
                console.log('✅ 전달받은 엽서 데이터:', parsedPostcards);

                if (parsedPostcards.length > 0) {
                    const formattedPostcards = parsedPostcards.map(postcard => ({
                        id: postcard.postcardId,
                        image: postcard.imageUrl, // 사용자가 촬영한 사진
                        postcardTemplate: { 
                            image: postcard.typeImageUrl, // 엽서 배경 이미지
                            content: postcard.content, // 엽서에 작성된 내용
                        },
                    }));
                    
                    setSelectedPostcards(formattedPostcards);
                    
                    // 각 엽서에 대한 초기 정보와 업로드 상태를 설정합니다.
                    const initialDetails = {};
                    const initialUploadStatus = {};
                    formattedPostcards.forEach(postcard => {
                        initialDetails[postcard.id] = {
                            title: '',
                            location: '',
                            date: null
                        };
                        initialUploadStatus[postcard.id] = {
                            isUploaded: false,
                            isUploading: false
                        };
                    });
                    setPostcardDetails(initialDetails);
                    setUploadStatus(initialUploadStatus);
                    
                } else {
                    Alert.alert('알림', '공개할 엽서가 없습니다.');
                    router.back();
                }
            } catch (error) {
                console.error('❌ 엽서 데이터 파싱 오류:', error);
                Alert.alert('오류', '전달받은 엽서 데이터에 문제가 있습니다.');
                router.back();
            }
        } else {
            Alert.alert('오류', '폴더 정보가 올바르지 않아 엽서를 불러올 수 없습니다.');
            router.back();
        }
        
        // 디렉토리 제목과 날짜 정보 처리
        if (params?.directoryTitle || params?.startDate || params?.endDate) {
            const startDate = params.startDate ? new Date(params.startDate) : null;
            const endDate = params.endDate ? new Date(params.endDate) : null;
            
            setDirectoryInfo({
                id: params.directoryId || null, // 디렉토리 ID도 전달받을 경우를 대비하여 추가
                name: params.directoryTitle || '새 폴더',
                startDate: startDate,
                endDate: endDate
            });
            
            // 날짜 범위 내의 모든 날짜를 생성하여 상태에 저장합니다.
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
    }, [params?.selectedPostcards, params?.directoryTitle, params?.startDate, params?.endDate, router]);

    // 날짜를 'MM.DD' 형식으로 포맷팅하는 함수.
    const formatDate = useCallback((date) => {
        if (!date) return '';
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${month}.${day}`;
    }, []);

    // 엽서 슬라이더에서 엽서를 선택하는 함수.
    const selectPostcard = useCallback((index) => {
        setCurrentIndex(index);
    }, []);

    // '더 많은 엽서 추가하기' 버튼을 눌렀을 때 실행되는 함수.
    const addMorePostcards = useCallback(() => {
        router.back();
    }, [router]);

    // 현재 엽서의 정보를 업데이트하는 함수.
    const updatePostcardDetail = useCallback((field, value) => {
        const currentPostcard = selectedPostcards[currentIndex];
        if (!currentPostcard) return;
        
        console.log(`✅ 엽서 정보 업데이트 시도: ${currentPostcard.id}, ${field} -> ${value}`);

        setPostcardDetails(prev => ({
            ...prev,
            // 해당 엽서 ID에 대한 정보가 없을 경우 빈 객체를 사용합니다.
            [currentPostcard.id]: {
                ...(prev[currentPostcard.id] || {}),
                [field]: value
            }
        }));
    }, [currentIndex, selectedPostcards]);

    // 날짜 선택 모달을 여는 함수.
    const openDateModal = useCallback(() => {
        setIsDateModalVisible(true);
    }, []);

    // 날짜를 선택하고 모달을 닫는 함수.
    const selectDate = useCallback((date) => {
        updatePostcardDetail('date', date);
        setIsDateModalVisible(false);
    }, [updatePostcardDetail]);

    // 개별 엽서를 업로드하는 기능.
    const handleIndividualUpload = useCallback(async (postcardId) => {
        const details = postcardDetails[postcardId];
        
        // 필수 정보 입력 여부 확인
        if (!details || !details.title || !details.location || !details.date) {
            Alert.alert('정보 부족', '제목, 여행 장소, 여행 날짜를 모두 입력해주세요.');
            return;
        }

        // 이미 업로드된 엽서인지 확인
        if (uploadStatus[postcardId]?.isUploaded) {
            Alert.alert('알림', '이미 업로드된 엽서입니다.');
            return;
        }

        Alert.alert(
            '업로드 확인',
            '이 엽서를 업로드하시겠습니까?\n업로드된 엽서는 다른 유저의 홈화면에 표시됩니다.',
            [
                { text: '취소', style: 'cancel' },
                { 
                    text: '업로드', 
                    onPress: async () => {
                        setUploadStatus(prev => ({
                            ...prev,
                            [postcardId]: {
                                ...prev[postcardId],
                                isUploading: true
                            }
                        }));

                        try {
                            console.log(`📢 엽서 ID ${postcardId} 개별 공개 설정 시도`);
                            
                            // 1. 공개 범위 토글 API 호출
                            const toggleResult = await togglePostcardPublicScopeApi(postcardId);
                            console.log('✅ 공개 범위 토글 결과:', toggleResult);
                            
                            // 2. 공개된 경우 상세 정보 업데이트 API 호출
                            if (toggleResult.isPublic) {
                                const publicDetails = {
                                    title: details.title,
                                    location: details.location,
                                    startDate: details.date.toISOString().split('T')[0],
                                    endDate: details.date.toISOString().split('T')[0],
                                };
                                
                                await updatePostcardPublicDetailsApi(postcardId, publicDetails);
                                console.log(`✅ 엽서 ID ${postcardId} 공개 상세정보 업데이트 완료`);
                            }
                            
                            // 업로드 완료 상태로 변경
                            setUploadStatus(prev => ({
                                ...prev,
                                [postcardId]: {
                                    isUploaded: true,
                                    isUploading: false
                                }
                            }));
                            
                            Alert.alert('업로드 완료', '엽서가 성공적으로 업로드되었습니다.');
                            
                        } catch (error) {
                            console.error('❌ 엽서 업로드 오류:', error);
                            handleApiError(error, '엽서 업로드');
                            
                            // 업로드 실패 시 상태 복원
                            setUploadStatus(prev => ({
                                ...prev,
                                [postcardId]: {
                                    ...prev[postcardId],
                                    isUploading: false
                                }
                            }));
                        }
                    }
                }
            ]
        );
    }, [selectedPostcards, postcardDetails, uploadStatus]);

    // 전체 엽서를 업로드하는 기능.
    const handleUpload = useCallback(async () => {
        // 아직 업로드되지 않은 엽서만 필터링합니다.
        const unuploadedPostcards = selectedPostcards.filter(postcard => 
            !uploadStatus[postcard.id]?.isUploaded
        );

        if (unuploadedPostcards.length === 0) {
            Alert.alert('알림', '업로드할 엽서가 없습니다. 모든 엽서가 이미 업로드되었습니다.');
            return;
        }

        // 업로드되지 않은 엽서들 중 필수 정보가 모두 입력되었는지 확인합니다.
        const isAllCompleted = unuploadedPostcards.every(postcard => {
            const details = postcardDetails[postcard.id];
            return details && details.title && details.location && details.date;
        });

        if (!isAllCompleted) {
            Alert.alert('정보 부족', '모든 엽서의 제목, 여행 장소, 여행 날짜를 입력해주세요.');
            return;
        }

        Alert.alert(
            '전체 업로드 확인',
            `${unuploadedPostcards.length}개의 엽서를 업로드하시겠습니까?\n업로드된 엽서는 다른 유저의 홈화면에 표시됩니다.`,
            [
                { text: '취소', style: 'cancel' },
                { 
                    text: '업로드', 
                    onPress: async () => {
                        try {
                            for (const postcard of unuploadedPostcards) {
                                const details = postcardDetails[postcard.id];
                                
                                setUploadStatus(prev => ({
                                    ...prev,
                                    [postcard.id]: {
                                        ...prev[postcard.id],
                                        isUploading: true
                                    }
                                }));
                                
                                console.log(`📢 엽서 ID ${postcard.id} 공개 설정 시도`);
                                
                                const toggleResult = await togglePostcardPublicScopeApi(postcard.id);
                                console.log('✅ 공개 범위 토글 결과:', toggleResult);
                                
                                if (toggleResult.isPublic) {
                                    const publicDetails = {
                                        title: details.title,
                                        location: details.location,
                                        startDate: details.date.toISOString().split('T')[0],
                                        endDate: details.date.toISOString().split('T')[0],
                                    };
                                    
                                    await updatePostcardPublicDetailsApi(postcard.id, publicDetails);
                                    console.log(`✅ 엽서 ID ${postcard.id} 공개 상세정보 업데이트 완료`);
                                }

                                setUploadStatus(prev => ({
                                    ...prev,
                                    [postcard.id]: {
                                        isUploaded: true,
                                        isUploading: false
                                    }
                                }));
                            }
                            
                            Alert.alert('업로드 완료', '모든 엽서가 성공적으로 업로드되었습니다.');
                            
                        } catch (error) {
                            console.error('❌ 엽서 업로드 오류:', error);
                            handleApiError(error, '엽서 업로드');
                        }
                    }
                }
            ]
        );
    }, [selectedPostcards, postcardDetails, uploadStatus]);

    // 현재 선택된 엽서의 정보 및 업로드 상태를 가져옵니다.
    const currentPostcard = selectedPostcards[currentIndex];
    const currentDetails = currentPostcard ? postcardDetails[currentPostcard.id] : {};
    const currentUploadStatus = currentPostcard ? uploadStatus[currentPostcard.id] : {};

    // 개별 업로드 버튼 활성화 조건.
    const isCurrentPostcardUploadEnabled = currentPostcard && 
        currentDetails.title && 
        currentDetails.location && 
        currentDetails.date &&
        !currentUploadStatus.isUploaded &&
        !currentUploadStatus.isUploading;

    // 전체 업로드 버튼 활성화 조건.
    const unuploadedPostcards = selectedPostcards.filter(postcard => 
        !uploadStatus[postcard.id]?.isUploaded
    );
    const isUploadEnabled = unuploadedPostcards.length > 0 && unuploadedPostcards.some(postcard => {
        const details = postcardDetails[postcard.id];
        return details && details.title && details.location && details.date;
    });
    
    return (
        <View style={styles.container}>
            {/* 상단 헤더 영역 */}
            <PostDirectoryHeader
                title={directoryInfo.name}
                startDate={directoryInfo.startDate ? `2021.${formatDate(directoryInfo.startDate)}` : '2021.03.04'}
                endDate={directoryInfo.endDate ? formatDate(directoryInfo.endDate) : '03.06'}
                onBackPress={() => router.back()}
                showActionButton={false}
            />

            {/* 엽서 슬라이더 영역 */}
            <PostcardSlider
                postcards={selectedPostcards}
                currentIndex={currentIndex}
                onSelectPostcard={selectPostcard}
                onAddMorePostcards={addMorePostcards}
            />

            {/* 메인 컨텐츠 영역 */}
            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
                {/* 엽서 데이터가 없는 경우 메시지 표시 */}
                {!currentPostcard ? (
                    <Text style={styles.noPostcardText}>선택된 엽서가 없습니다.</Text>
                ) : (
                    <>
                        {/* 엽서 정보 입력 폼 */}
                        <PostcardInfoForm
                            postcardDetails={currentDetails}
                            onUpdateDetail={updatePostcardDetail}
                            onOpenDateModal={openDateModal}
                        />

                        {/* 사진 영역 */}
                        <PhotoSection imageUri={currentPostcard?.image} />

                        {/* 엽서 템플릿 영역 */}
                        <View style={styles.postcardSection}>
                            {/* 엽서 이미지와 텍스트를 함께 표시하도록 props를 전달합니다. */}
                            <PostcardTemplate template={currentPostcard?.postcardTemplate} />
                        </View>
                    </>
                )}
            </ScrollView>

            {/* 하단 업로드 버튼 영역 */}
            {currentPostcard && (
                <UploadSection 
                    onUpload={() => handleIndividualUpload(currentPostcard?.id)}
                    onUploadAll={handleUpload}
                    isEnabled={isCurrentPostcardUploadEnabled}
                    isUploadAllEnabled={isUploadEnabled}
                    isUploading={currentUploadStatus.isUploading}
                    isUploaded={currentUploadStatus.isUploaded}
                    unuploadedCount={unuploadedPostcards.length}
                />
            )}

            {/* 날짜 선택 모달 */}
            <DateSelectorModal
                isVisible={isDateModalVisible}
                onClose={() => setIsDateModalVisible(false)}
                availableDates={availableDates}
                onSelectDate={selectDate}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    contentContainer: {
        flex: 1,
        padding: 16,
    },
    postcardSection: {
        height: 250,
        backgroundColor: '#f5f5f5',
        borderRadius: 0,
        marginBottom: 16,
        overflow: 'hidden',
    },
    noPostcardText: {
        textAlign: 'center',
        fontSize: 18,
        color: '#888',
        marginTop: 50,
    },
});

export default sharePost;
