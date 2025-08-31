import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
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
    
    // 각 엽서별 업로드 상태
    const [uploadStatus, setUploadStatus] = useState({});
    
    // 모달 상태
    const [isDateModalVisible, setIsDateModalVisible] = useState(false);
    const [availableDates, setAvailableDates] = useState([]);

    // 전달받은 디렉토리 정보 설정
    useEffect(() => {
        if (params?.directoryId || params?.directoryTitle || params?.startDate || params?.endDate) {
            const startDate = params.startDate ? new Date(params.startDate) : null;
            const endDate = params.endDate ? new Date(params.endDate) : null;
            
            setDirectoryInfo(prev => {
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

    // 폴더의 실제 엽서들 불러오기
    useEffect(() => {
        const fetchPostcards = async () => {
            if (directoryInfo.id) {
                try {
                    console.log('🔍 폴더 엽서 불러오기 시도:', directoryInfo.id);
                    const postcards = await getPostcardsByFolderApi(directoryInfo.id);
                    
                    if (postcards && postcards.length > 0) {
                        const formattedPostcards = postcards.map(postcard => ({
                            id: postcard.postcardId,
                            image: postcard.imageUrl,
                            postcardTemplate: { 
                                code: postcard.postcardType, 
                                color: '#E3F2FD', // 임시 색상값
                                tab: 'Plain' // 임시 탭값
                            },
                        }));
                        
                        setSelectedPostcards(formattedPostcards);
                        
                        // 각 엽서별 초기 정보 설정
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
                        
                        // 특정 엽서가 선택되어 있다면 해당 인덱스로 설정
                        if (params.selectedPostcardId) {
                            const targetIndex = formattedPostcards.findIndex(
                                pc => pc.id.toString() === params.selectedPostcardId.toString()
                            );
                            if (targetIndex !== -1) {
                                setCurrentIndex(targetIndex);
                            }
                        }
                    } else {
                        Alert.alert('알림', '공개할 엽서가 없습니다.');
                        router.back();
                    }
                } catch (error) {
                    console.error('❌ 엽서 불러오기 오류:', error);
                    handleApiError(error, '엽서 불러오기');
                }
            }
        };

        fetchPostcards();
    }, [directoryInfo.id, params.selectedPostcardId, router]);

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

    // 더 많은 엽서 추가하기
    const addMorePostcards = useCallback(() => {
        router.back();
    }, [router]);

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
    }, [updatePostcardDetail]);

    // 개별 엽서 업로드 기능
    const handleIndividualUpload = useCallback(async (postcardId) => {
        const postcard = selectedPostcards.find(pc => pc.id === postcardId);
        const details = postcardDetails[postcardId];
        
        // 현재 엽서의 필수 정보가 입력되었는지 확인
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
                        // 업로딩 상태로 변경
                        setUploadStatus(prev => ({
                            ...prev,
                            [postcardId]: {
                                ...prev[postcardId],
                                isUploading: true
                            }
                        }));

                        try {
                            console.log(`📢 엽서 ID ${postcardId} 개별 공개 설정 시도`);
                            
                            // 1. 공개 범위 토글
                            const toggleResult = await togglePostcardPublicScopeApi(postcardId);
                            console.log('✅ 공개 범위 토글 결과:', toggleResult);
                            
                            // 2. 공개된 경우 상세 정보 업데이트
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
                            
                            // 업로딩 실패 시 상태 복원
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

    // 업로드 기능 (전체 업로드) - 필요시 남겨둠
    const handleUpload = useCallback(async () => {
        // 미업로드된 엽서들만 필터링
        const unuploadedPostcards = selectedPostcards.filter(postcard => 
            !uploadStatus[postcard.id]?.isUploaded
        );

        if (unuploadedPostcards.length === 0) {
            Alert.alert('알림', '업로드할 엽서가 없습니다. 모든 엽서가 이미 업로드되었습니다.');
            return;
        }

        // 미업로드된 엽서들의 필수 정보가 입력되었는지 확인
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
                            // 각 엽서에 대해 공개 설정 API 호출
                            for (const postcard of unuploadedPostcards) {
                                const details = postcardDetails[postcard.id];
                                
                                // 업로딩 상태로 변경
                                setUploadStatus(prev => ({
                                    ...prev,
                                    [postcard.id]: {
                                        ...prev[postcard.id],
                                        isUploading: true
                                    }
                                }));
                                
                                console.log(`📢 엽서 ID ${postcard.id} 공개 설정 시도`);
                                
                                // 1. 공개 범위 토글
                                const toggleResult = await togglePostcardPublicScopeApi(postcard.id);
                                console.log('✅ 공개 범위 토글 결과:', toggleResult);
                                
                                // 2. 공개된 경우 상세 정보 업데이트
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

                                // 업로드 완료 상태로 변경
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

    // 현재 선택된 엽서 정보
    const currentPostcard = selectedPostcards[currentIndex];
    const currentDetails = currentPostcard ? postcardDetails[currentPostcard.id] : {};
    const currentUploadStatus = currentPostcard ? uploadStatus[currentPostcard.id] : {};

    // 현재 엽서의 업로드 버튼 활성화 조건
    const isCurrentPostcardUploadEnabled = currentPostcard && 
        currentDetails.title && 
        currentDetails.location && 
        currentDetails.date &&
        !currentUploadStatus.isUploaded &&
        !currentUploadStatus.isUploading;

    // 전체 업로드 버튼 활성화 조건 (미업로드된 엽서 중 정보가 완전한 것들)
    const unuploadedPostcards = selectedPostcards.filter(postcard => 
        !uploadStatus[postcard.id]?.isUploaded
    );
    const isUploadEnabled = unuploadedPostcards.length > 0 && unuploadedPostcards.some(postcard => {
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

            {/* 엽서 슬라이더 */}
            <PostcardSlider
                postcards={selectedPostcards}
                currentIndex={currentIndex}
                onSelectPostcard={selectPostcard}
                onAddMorePostcards={addMorePostcards}
            />

            {/* 메인 컨텐츠 영역 */}
            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
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
                    <PostcardTemplate template={currentPostcard?.postcardTemplate} />
                </View>
            </ScrollView>

            {/* 하단 업로드 버튼 영역 */}
            <UploadSection 
                onUpload={() => handleIndividualUpload(currentPostcard?.id)}
                onUploadAll={handleUpload}
                isEnabled={isCurrentPostcardUploadEnabled}
                isUploadAllEnabled={isUploadEnabled}
                isUploading={currentUploadStatus.isUploading}
                isUploaded={currentUploadStatus.isUploaded}
                unuploadedCount={unuploadedPostcards.length}
            />

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
});

export default sharePost;