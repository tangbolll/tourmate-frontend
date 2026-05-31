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

    // 전달받은 디렉토리 정보 및 선택된 엽서들 설정
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

    // 선택된 엽서들 초기화
    useEffect(() => {
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
    }, []);

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
                onUpload={handleUpload} 
                isEnabled={isUploadEnabled} 
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