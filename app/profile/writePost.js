import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Alert, Modal } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import PostDirectoryHeader from "../../components/profile/PostDirectoryHeader";
import SaveButton from "../../components/profile/SaveButton";
import EditPostFloatingButtons from "../../components/profile/EditPostFloatingButtons";
import SelectPostDesign from "../../components/profile/selectPostDesign";
import PostcardSlider from "../../components/profile/PostcardSlider";
import PhotoUploadArea from "../../components/profile/PhotoUploadArea";
import PostcardSelectionArea from "../../components/profile/PostcardSelectionArea";

import { 
    createPostcardWithNewFolderApi, // 이 API는 더 이상 사용되지 않습니다.
    updateFolderApi, 
    deleteFolderApi,
    getFoldersByUserApi,
    handleApiError,
    createPostcardInExistingFolderApi,
    getPostcardsByFolderApi,
    deletePostcardApi,
    updatePostcardApi,
    toggleFavoriteApi, // <-- 함수명을 toggleFavoriteApi로 수정했습니다.
} from "../../utils/PostCardApi"

const WritePost = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    // 디렉토리 정보 상태
    const [directoryInfo, setDirectoryInfo] = useState({
        id: params.directoryId || null,
        name: params.directoryName || '',
        startDate: params.startDate ? new Date(params.startDate) : null,
        endDate: params.endDate ? new Date(params.endDate) : null,
    });
    
    const [postcards, setPostcards] = useState([{ id: null, image: null, postcardTemplate: null, isSaved: false, isFavorite: false }]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedPostcard, setSelectedPostcard] = useState(null);
    
    // 모달 상태
    const [isPostcardModalVisible, setIsPostcardModalVisible] = useState(false);
    const [isPostcardOverlayVisible, setIsPostcardOverlayVisible] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isEditMode, setIsEditMode] = useState(true);

    // 전달받은 디렉토리 정보 설정 및 기존 엽서 불러오기
    useEffect(() => {
        console.log('useEffect running - params changed:', params);
        
        const fetchPostcards = async () => {
            const newStartDate = params.startDate ? new Date(params.startDate) : null;
            const newEndDate = params.endDate ? new Date(params.endDate) : null;
            const newDirectoryId = params.directoryId || null;
            const newDirectoryName = params.directoryName || '';

            setDirectoryInfo({
                id: newDirectoryId,
                name: newDirectoryName,
                startDate: newStartDate,
                endDate: newEndDate
            });
            
            // 폴더 ID가 있으면 해당 폴더의 엽서들을 불러옴
            if (newDirectoryId) {
                try {
                    const existingPostcards = await getPostcardsByFolderApi(newDirectoryId);
                    console.log('✅ 기존 엽서 불러오기 성공:', existingPostcards);
                    if (existingPostcards.length > 0) {
                        const formattedPostcards = existingPostcards.map(pc => ({
                            id: pc.postcardId,
                            image: pc.imageUrl,
                            postcardTemplate: { code: pc.postcardType, thumbnail: null }, // thumbnail 정보가 없으므로 임시로 null 설정
                            isSaved: true,
                            isFavorite: pc.isFavorite || false, // isFavorite 상태 추가
                        }));
                        // 기존 엽서 목록 + 새로운 빈 엽서 추가
                        setPostcards([...formattedPostcards, { id: null, image: null, postcardTemplate: null, isSaved: false, isFavorite: false }]);
                        setCurrentIndex(0);
                        setSelectedImage(formattedPostcards[0].image);
                        setSelectedPostcard(formattedPostcards[0].postcardTemplate);
                        setIsSaved(true);
                        setIsEditMode(false);
                    } else {
                        // 엽서가 없으면 새로운 빈 엽서 하나만 설정
                        setPostcards([{ id: null, image: null, postcardTemplate: null, isSaved: false, isFavorite: false }]);
                        setCurrentIndex(0);
                        setSelectedImage(null);
                        setSelectedPostcard(null);
                        setIsSaved(false);
                        setIsEditMode(true);
                    }
                } catch (error) {
                    console.error('❌ 기존 엽서 불러오기 오류:', error);
                    handleApiError(error, '기존 엽서 불러오기');
                }
            } else {
                // 폴더 ID가 없으면 새로운 빈 엽서 하나만 설정
                setPostcards([{ id: null, image: null, postcardTemplate: null, isSaved: false, isFavorite: false }]);
                setCurrentIndex(0);
                setSelectedImage(null);
                setSelectedPostcard(null);
                setIsSaved(false);
                setIsEditMode(true);
            }
        };

        fetchPostcards();
    }, [params.directoryId, params.directoryName, params.startDate, params.endDate]);

    // 날짜 포맷팅 함수
    const formatDate = useCallback((date) => {
        if (!date || isNaN(date.getTime())) return '';
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${month}.${day}`;
    }, []);

    // 갤러리에서 이미지 선택
    const pickImage = useCallback(async () => {
        if (!isEditMode || isSaved) {
            Alert.alert('알림', '편집 모드가 아닙니다. 편집 버튼을 눌러 편집 모드로 전환해주세요.');
            return;
        }

        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [5, 4],
                quality: 1,
                cropOptions: {
                    aspectRatio: { width: 5, height: 4 }
                }
            });

            if (!result.canceled && result.assets[0]) {
                const imageUri = result.assets[0].uri;
                setSelectedImage(imageUri);
                
                setPostcards(prev => {
                    const updated = [...prev];
                    updated[currentIndex] = {
                        ...updated[currentIndex],
                        image: imageUri
                    };
                    return updated;
                });
            }
        } catch (error) {
            console.error('이미지 선택 오류:', error);
            Alert.alert('오류', '이미지 선택 중 오류가 발생했습니다.');
        }
    }, [currentIndex, isEditMode, isSaved]);

    // 새 엽서 추가
    const addNewPostcard = useCallback(() => {
        // 기존 엽서가 저장되지 않았으면 새 엽서 추가를 막음
        if (postcards[currentIndex].image === null && postcards[currentIndex].postcardTemplate === null) {
            Alert.alert('알림', '현재 엽서를 먼저 작성하거나 저장해 주세요.');
            return;
        }

        if (!isEditMode) {
             Alert.alert('알림', '편집 모드가 아닙니다. 편집 버튼을 눌러 편집 모드로 전환해주세요.');
             return;
        }
        
        setPostcards(prev => {
            const newPostcard = {
                id: null,
                image: null,
                postcardTemplate: null,
                isSaved: false,
                isFavorite: false,
            };
            return [...prev, newPostcard];
        });
        setCurrentIndex(prev => prev + 1);
        setSelectedImage(null);
        setSelectedPostcard(null);
    }, [isEditMode, postcards, currentIndex]);

    // 엽서 선택 변경
    const selectPostcard = useCallback((index) => {
        setCurrentIndex(index);
        const selected = postcards[index];
        setSelectedImage(selected.image);
        setSelectedPostcard(selected.postcardTemplate);
        setIsSaved(selected.isSaved || false);
        setIsEditMode(!selected.isSaved);
    }, [postcards]);

    // 엽서 영역 터치 핸들러
    const handlePostcardAreaPress = useCallback(() => {
        if (!isEditMode || isSaved) {
            Alert.alert('알림', '편집 모드가 아닙니다. 편집 버튼을 눌러 편집 모드로 전환해주세요.');
            return;
        }

        if (selectedPostcard) {
            setIsPostcardOverlayVisible(true);
        } else {
            setIsPostcardModalVisible(true);
        }
    }, [selectedPostcard, isEditMode, isSaved]);

    // 엽서 선택 모달 열기
    const handlePostcardSelect = useCallback(() => {
        setIsPostcardOverlayVisible(false);
        setIsPostcardModalVisible(true);
    }, []);

    // 모달에서 엽서 선택 완료
    const handlePostcardDesignSelect = useCallback((selectedDesignData) => {
        console.log('선택된 엽서:', selectedDesignData);
        
        setSelectedPostcard(selectedDesignData);
        
        setPostcards(prev => {
            const updated = [...prev];
            updated[currentIndex] = {
                ...updated[currentIndex],
                postcardTemplate: selectedDesignData
            };
            return updated;
        });
        
        setIsPostcardModalVisible(false);
    }, [currentIndex]);

    // 모달 닫기
    const handlePostcardModalClose = useCallback(() => {
        setIsPostcardModalVisible(false);
    }, []);

    // 오버레이 닫기
    const handleOverlayClose = useCallback(() => {
        setIsPostcardOverlayVisible(false);
    }, []);

    // 글쓰기 기능
    const handleWritePress = useCallback(() => {
        console.log('글쓰기 기능');
        // 글쓰기 기능 구현
    }, []);

    // 그리기 기능
    const handleDrawPress = useCallback(() => {
        console.log('그리기 기능');
        // 그리기 기능 구현
    }, []);

    // 저장 기능
    const handleSave = useCallback(async () => {
        // [1] 요청 데이터 유효성 검사 및 로그 추가
        console.log('--- 엽서 저장 시도 ---');
        console.log('directoryInfo.id:', directoryInfo.id);
        console.log('selectedImage:', selectedImage ? '존재함' : '비어있음');
        console.log('selectedPostcard:', selectedPostcard ? '존재함' : '비어있음');
        console.log('엽서 내용 (하드코딩된 예시):', "엽서 내용 예시");
        console.log('--- 로그 종료 ---');

        if (!directoryInfo.id) {
            Alert.alert('알림', '폴더가 지정되지 않았습니다. 기존 폴더를 선택하거나 새 폴더를 먼저 생성해주세요.');
            return;
        }

        if (!selectedImage || !selectedPostcard) {
            Alert.alert('알림', '사진과 엽서 디자인을 모두 선택해주세요.');
            return;
        }

        const postcardData = {
            content: "엽서 내용 예시", // 실제 엽서 내용을 추가해야 합니다.
            imageUrl: selectedImage,
            postcardType: selectedPostcard.code,
        };

        try {
            // 엽서 ID가 있으면 업데이트, 없으면 신규 생성
            if (postcards[currentIndex].id) {
                console.log(`기존 엽서 (ID: ${postcards[currentIndex].id}) 업데이트 시도`);
                await updatePostcardApi(postcards[currentIndex].id, postcardData);
                Alert.alert('수정 완료', '엽서가 성공적으로 수정되었습니다.');
            } else {
                console.log(`기존 폴더 (ID: ${directoryInfo.id})에 엽서 저장 시도`);
                const response = await createPostcardInExistingFolderApi(directoryInfo.id, postcardData);
                
                console.log('⭐ 기존 폴더에 엽서 생성 API 응답:', response);

                if (response && response.postcardId) {
                    Alert.alert('저장 완료', '엽서가 성공적으로 저장되었습니다.');
                    setPostcards(prev => {
                        const updated = [...prev];
                        updated[currentIndex] = {
                            ...updated[currentIndex],
                            id: response.postcardId,
                            isSaved: true
                        };
                        return updated;
                    });
                } else {
                    throw new Error('엽서 저장 API 응답에 postcardId가 없습니다.');
                }
            }
            
            // 공통 상태 업데이트
            setIsSaved(true);
            setIsEditMode(false);

        } catch (error) {
            console.error('❌ 엽서 저장/수정 오류:', error);
            handleApiError(error, '엽서 저장/수정');
        }
    }, [selectedImage, selectedPostcard, currentIndex, directoryInfo, postcards]);

    // EditPostFloatingButtons 핸들러들
    const handleDelete = useCallback(() => {
        const postcardToDelete = postcards[currentIndex];

        if (!postcardToDelete.id) {
            Alert.alert('알림', '아직 저장되지 않은 엽서입니다.');
            return;
        }

        Alert.alert(
            '삭제 확인',
            '정말로 이 엽서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
            [
                { text: '취소', style: 'cancel' },
                { 
                    text: '삭제', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.log(`엽서 삭제 시도: ID ${postcardToDelete.id}`);
                            await deletePostcardApi(postcardToDelete.id);
                            
                            Alert.alert('삭제 완료', '엽서가 성공적으로 삭제되었습니다.');
                            
                            setPostcards(prev => {
                                const updated = prev.filter((_, index) => index !== currentIndex);
                                // 엽서가 모두 삭제되었을 경우를 대비하여 빈 엽서 추가
                                if (updated.length === 0) {
                                    return [{ id: null, image: null, postcardTemplate: null, isSaved: false, isFavorite: false }];
                                }
                                return updated;
                            });

                            // 삭제 후 인덱스 재설정
                            const newIndex = currentIndex > 0 ? currentIndex - 1 : 0;
                            setCurrentIndex(newIndex);
                            const newSelectedPostcard = postcards[newIndex];
                            setSelectedImage(newSelectedPostcard?.image || null);
                            setSelectedPostcard(newSelectedPostcard?.postcardTemplate || null);
                            setIsSaved(newSelectedPostcard?.isSaved || false);
                            setIsEditMode(!newSelectedPostcard?.isSaved);

                        } catch (error) {
                            console.error('❌ 엽서 삭제 오류:', error);
                            handleApiError(error, '엽서 삭제');
                        }
                    }
                }
            ]
        );
    }, [currentIndex, postcards]);

    const handleDownload = useCallback(() => {
        console.log('다운로드');
        Alert.alert('다운로드', '모든 엽서가 갤러리에 저장되었습니다.');
    }, []);

    const handleFavorite = useCallback(async () => {
        const currentPostcard = postcards[currentIndex];
        if (!currentPostcard.id) {
            Alert.alert('알림', '아직 저장되지 않은 엽서입니다.');
            return;
        }

        try {
            const isCurrentlyFavorite = currentPostcard.isFavorite;
            await toggleFavoriteApi(currentPostcard.id); // <-- 함수명을 toggleFavoriteApi로 수정했습니다.
            
            setPostcards(prev => {
                const updated = [...prev];
                updated[currentIndex] = {
                    ...updated[currentIndex],
                    isFavorite: !isCurrentlyFavorite,
                };
                return updated;
            });
            Alert.alert('상태 변경', `이 엽서가 공개 상태${isCurrentlyFavorite ? '에서 해제되었습니다.' : '에 추가되었습니다.'}`);
        } catch (error) {
            console.error('❌ 공개 상태 변경 오류:', error);
            handleApiError(error, '공개 상태 변경');
        }

    }, [currentIndex, postcards]);

    const handleEdit = useCallback(() => {
        console.log('편집 모드 활성화');
        setIsEditMode(true);
        setIsSaved(false);
        Alert.alert('편집 모드', '편집 모드가 활성화되었습니다.');
    }, []);

    // 저장 버튼 활성화 조건
    const isSaveEnabled = selectedImage && selectedPostcard;

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
                postcards={postcards}
                currentIndex={currentIndex}
                onSelectPostcard={selectPostcard}
                onAddNewPostcard={addNewPostcard}
                isEditMode={isEditMode}
                isSaved={isSaved}
            />

            {/* 메인 컨텐츠 영역 */}
            <View style={styles.contentContainer}>
                {/* 사진 업로드 영역 */}
                <PhotoUploadArea
                    selectedImage={selectedImage}
                    onPickImage={pickImage}
                    isEditMode={isEditMode}
                    isSaved={isSaved}
                />

                {/* 엽서 선택 영역 */}
                <PostcardSelectionArea
                    selectedPostcard={selectedPostcard}
                    onAreaPress={handlePostcardAreaPress}
                    onPostcardSelect={handlePostcardSelect}
                    isEditMode={isEditMode}
                    isSaved={isSaved}
                    isOverlayVisible={isPostcardOverlayVisible}
                    onOverlayClose={handleOverlayClose}
                    onWritePress={handleWritePress}
                    onDrawPress={handleDrawPress}
                />
            </View>

            {/* 저장 버튼 또는 EditPostFloatingButtons */}
            <View style={styles.saveButtonContainer}>
                {isEditMode && !isSaved ? (
                    <SaveButton
                        title="엽서 저장"
                        onPress={handleSave}
                        disabled={!isSaveEnabled}
                    />
                ) : (
                    <EditPostFloatingButtons
                        onDelete={handleDelete}
                        onDownload={handleDownload}
                        onFavorite={handleFavorite}
                        onEdit={handleEdit}
                        isFavorite={postcards[currentIndex]?.isFavorite || false}
                        style={styles.floatingButtons}
                    />
                )}
            </View>

            {/* 엽서 선택 모달 */}
            <Modal
                visible={isPostcardModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={handlePostcardModalClose}
            >
                <SelectPostDesign
                    onPostcardSelect={handlePostcardDesignSelect}
                    onClose={handlePostcardModalClose}
                />
            </Modal>
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
        gap: 16,
    },
    saveButtonContainer: {
        padding: 16,
        paddingBottom: 32,
        backgroundColor: '#fff',
    },
    floatingButtons: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default WritePost;
