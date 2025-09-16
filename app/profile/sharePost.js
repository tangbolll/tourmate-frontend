import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, Text, Image } from "react-native"; // Image 컴포넌트 추가
import { useRouter, useLocalSearchParams } from 'expo-router';
import PostDirectoryHeader from "../../components/profile/PostDirectoryHeader";
import PostcardSlider from "../../components/profile/sharePost/PostcardSlider";
import PostcardInfoForm from "../../components/profile/sharePost/PostcardInfoForm";
import PhotoSection from "../../components/profile/sharePost/PhotoSection";
// PostcardTemplates에서 이미지 소스와 오버레이 스타일 함수를 임포트
import { postcardTemplates, getPostcardOverlayStyle } from "../../utils/PostcardTemplates"; 
import UploadSection from "../../components/profile/sharePost/UploadSection";
import DateSelectorModal from "../../components/profile/sharePost/DateSelectorModal";

import {
    togglePostcardPublicScopeApi,
    updatePostcardPublicDetailsApi,
    handleApiError,
} from "../../utils/PostCardApi";

const sharePost = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    const [directoryInfo, setDirectoryInfo] = useState({
        id: null,
        name: '',
        startDate: null,
        endDate: null
    });
    
    const [selectedPostcards, setSelectedPostcards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    
    const [postcardDetails, setPostcardDetails] = useState({});
    
    const [uploadStatus, setUploadStatus] = useState({});
    
    const [isDateModalVisible, setIsDateModalVisible] = useState(false);
    const [availableDates, setAvailableDates] = useState([]);

    useEffect(() => {
        if (params?.selectedPostcards) {
            try {
                const parsedPostcards = JSON.parse(params.selectedPostcards);

                if (parsedPostcards.length > 0) {
                    const formattedPostcards = parsedPostcards.map(postcard => ({
                        id: postcard.postcardId,
                        image: postcard.imageUrl,
                        postcardTemplate: { 
                            typeId: postcard.postcardTypeId, 
                            content: postcard.content,
                        },
                    }));
                    
                    setSelectedPostcards(formattedPostcards);
                    
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
                Alert.alert('오류', '전달받은 엽서 데이터에 문제가 있습니다.');
                router.back();
            }
        } else {
            Alert.alert('오류', '폴더 정보가 올바르지 않아 엽서를 불러올 수 없습니다.');
            router.back();
        }
        
        if (params?.directoryTitle || params?.startDate || params?.endDate) {
            const startDate = params.startDate ? new Date(params.startDate) : null;
            const endDate = params.endDate ? new Date(params.endDate) : null;
            
            setDirectoryInfo({
                id: params.directoryId || null,
                name: params.directoryTitle || '새 폴더',
                startDate: startDate,
                endDate: endDate
            });
            
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

    const formatDate = useCallback((date) => {
        if (!date) return '';
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${month}.${day}`;
    }, []);

    const selectPostcard = useCallback((index) => {
        setCurrentIndex(index);
    }, []);

    const addMorePostcards = useCallback(() => {
        router.back();
    }, [router]);

    const updatePostcardDetail = useCallback((field, value) => {
        const currentPostcard = selectedPostcards[currentIndex];
        if (!currentPostcard) return;
        
        setPostcardDetails(prev => ({
            ...prev,
            [currentPostcard.id]: {
                ...(prev[currentPostcard.id] || {}),
                [field]: value
            }
        }));
    }, [currentIndex, selectedPostcards]);

    const openDateModal = useCallback(() => {
        setIsDateModalVisible(true);
    }, []);

    const selectDate = useCallback((date) => {
        updatePostcardDetail('date', date);
        setIsDateModalVisible(false);
    }, [updatePostcardDetail]);

    const handleIndividualUpload = useCallback(async (postcardId) => {
        const details = postcardDetails[postcardId];
        
        if (!details || !details.title || !details.location || !details.date) {
            Alert.alert('정보 부족', '제목, 여행 장소, 여행 날짜를 모두 입력해주세요.');
            return;
        }

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
                            const toggleResult = await togglePostcardPublicScopeApi(postcardId);
                            
                            if (toggleResult.isPublic) {
                                const publicDetails = {
                                    title: details.title,
                                    location: details.location,
                                    startDate: details.date.toISOString().split('T')[0],
                                    endDate: details.date.toISOString().split('T')[0],
                                    visitDate: details.date.toISOString().split('T')[0],
                                };
                                
                                await updatePostcardPublicDetailsApi(postcardId, publicDetails);
                            }
                            
                            setUploadStatus(prev => ({
                                ...prev,
                                [postcardId]: {
                                    isUploaded: true,
                                    isUploading: false
                                }
                            }));
                            
                            Alert.alert('업로드 완료', '엽서가 성공적으로 업로드되었습니다.');
                            
                        } catch (error) {
                            handleApiError(error, '엽서 업로드');
                            
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

    const handleUpload = useCallback(async () => {
        const unuploadedPostcards = selectedPostcards.filter(postcard => 
            !uploadStatus[postcard.id]?.isUploaded
        );

        if (unuploadedPostcards.length === 0) {
            Alert.alert('알림', '업로드할 엽서가 없습니다. 모든 엽서가 이미 업로드되었습니다.');
            return;
        }

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
                                
                                const toggleResult = await togglePostcardPublicScopeApi(postcard.id);
                                
                                if (toggleResult.isPublic) {
                                    const publicDetails = {
                                        title: details.title,
                                        location: details.location,
                                        startDate: details.date.toISOString().split('T')[0],
                                        endDate: details.date.toISOString().split('T')[0],
                                        visitDate: details.date.toISOString().split('T')[0],
                                    };
                                    
                                    await updatePostcardPublicDetailsApi(postcard.id, publicDetails);
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
                            handleApiError(error, '엽서 업로드');
                            
                            const failedPostcards = unuploadedPostcards.map(p => p.id);
                            setUploadStatus(prev => {
                                const newStatus = { ...prev };
                                failedPostcards.forEach(id => {
                                    newStatus[id] = { ...newStatus[id], isUploading: false };
                                });
                                return newStatus;
                            });
                        }
                    }
                }
            ]
        );
    }, [selectedPostcards, postcardDetails, uploadStatus]);

    const currentPostcard = selectedPostcards[currentIndex];
    const currentDetails = currentPostcard ? postcardDetails[currentPostcard.id] : {};
    const currentUploadStatus = currentPostcard ? uploadStatus[currentPostcard.id] : {};

    const isCurrentPostcardUploadEnabled = currentPostcard && 
        currentDetails.title && 
        currentDetails.location && 
        currentDetails.date &&
        !currentUploadStatus.isUploaded &&
        !currentUploadStatus.isUploading;

    const unuploadedPostcards = selectedPostcards.filter(postcard => 
        !uploadStatus[postcard.id]?.isUploaded
    );
    const isUploadAllEnabled = unuploadedPostcards.length > 0 && unuploadedPostcards.every(postcard => {
        const details = postcardDetails[postcard.id];
        return details && details.title && details.location && details.date;
    });
    
    // 엽서 이미지와 오버레이 스타일을 가져오는 로직
    const postcardImageSource = currentPostcard ? postcardTemplates[currentPostcard.postcardTemplate.typeId] : null;
    const postcardOverlayStyle = currentPostcard ? getPostcardOverlayStyle(currentPostcard.postcardTemplate.typeId) : {};

    return (
        <View style={styles.container}>
            <PostDirectoryHeader
                title={directoryInfo.name}
                startDate={directoryInfo.startDate ? `2021.${formatDate(directoryInfo.startDate)}` : '2021.03.04'}
                endDate={directoryInfo.endDate ? formatDate(directoryInfo.endDate) : '03.06'}
                onBackPress={() => router.back()}
                showActionButton={false}
            />

            <PostcardSlider
                postcards={selectedPostcards}
                currentIndex={currentIndex}
                onSelectPostcard={selectPostcard}
                onAddMorePostcards={addMorePostcards}
            />

            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
                {!currentPostcard ? (
                    <Text style={styles.noPostcardText}>선택된 엽서가 없습니다.</Text>
                ) : (
                    <>
                        <PostcardInfoForm
                            postcardDetails={currentDetails}
                            onUpdateDetail={updatePostcardDetail}
                            onOpenDateModal={openDateModal}
                        />

                        <PhotoSection imageUri={currentPostcard?.image} />

                        {/* 엽서 이미지와 텍스트 오버레이를 함께 렌더링 */}
                        <View style={styles.postcardSection}>
                            <View style={styles.postcardContentContainer}>
                                <Image
                                    source={postcardImageSource}
                                    style={styles.postcardImage}
                                    resizeMode="contain"
                                />
                                <Text style={[styles.postcardContent, postcardOverlayStyle]}>
                                    {currentPostcard?.postcardTemplate?.content}
                                </Text>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>

            {currentPostcard && (
                <UploadSection 
                    onUpload={() => handleIndividualUpload(currentPostcard?.id)}
                    onUploadAll={handleUpload}
                    isEnabled={isCurrentPostcardUploadEnabled}
                    isUploadAllEnabled={isUploadAllEnabled}
                    isUploading={currentUploadStatus.isUploading}
                    isUploaded={currentUploadStatus.isUploaded}
                    unuploadedCount={unuploadedPostcards.length}
                />
            )}

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
        justifyContent: 'center', // 엽서 컨텐츠 컨테이너를 중앙 정렬
        alignItems: 'center',
    },
    postcardContentContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    postcardImage: {
        width: '100%',
        height: '100%',
    },
    postcardContent: {
        position: 'absolute',
        color: '#000',
        fontSize: 16,
        lineHeight: 24,
    },
    noPostcardText: {
        textAlign: 'center',
        fontSize: 18,
        color: '#888',
        marginTop: 50,
    },
});

export default sharePost;