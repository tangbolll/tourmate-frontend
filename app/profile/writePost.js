import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Alert, Modal, TextInput, TouchableOpacity, Text } from "react-native";
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
    handleApiError,
    createPostcardInExistingFolderApi,
    getPostcardsByFolderApi,
    deletePostcardApi,
    updatePostcardApi,
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

    // 엽서 목록 상태
    const [postcards, setPostcards] = useState([{ id: null, image: null, postcardTemplate: null, isSaved: false, isFavorite: false, content: '', tempId: Date.now().toString() }]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedPostcard, setSelectedPostcard] = useState(null);
    const [postcardContent, setPostcardContent] = useState(''); // 엽서 텍스트 내용

    // UI 상태
    const [isPostcardModalVisible, setIsPostcardModalVisible] = useState(false);
    const [isPostcardOverlayVisible, setIsPostcardOverlayVisible] = useState(false);
    const [isWritingModalVisible, setIsWritingModalVisible] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isEditMode, setIsEditMode] = useState(true);

    // 전달받은 디렉토리 정보 설정 및 기존 엽서 불러오기
    useEffect(() => {
        const fetchPostcards = async () => {
            const newDirectoryId = params.directoryId || null;
            const newDirectoryName = params.directoryName || '';
            const newStartDate = params.startDate ? new Date(params.startDate) : null;
            const newEndDate = params.endDate ? new Date(params.endDate) : null;

            setDirectoryInfo({
                id: newDirectoryId,
                name: newDirectoryName,
                startDate: newStartDate,
                endDate: newEndDate
            });

            if (newDirectoryId) {
                try {
                    const existingPostcards = await getPostcardsByFolderApi(newDirectoryId);
                    console.log('✅ 기존 엽서 불러오기 성공:', existingPostcards);

                    const formattedPostcards = existingPostcards.map(pc => ({
                        id: pc.postcardId,
                        image: pc.imageUrl,
                        postcardTemplate: { code: pc.postcardType, thumbnail: null },
                        content: pc.content || '',
                        isSaved: true,
                        isFavorite: pc.isFavorite || false,
                    }));

                    if (formattedPostcards.length > 0) {
                        setPostcards([...formattedPostcards, { id: null, image: null, postcardTemplate: null, content: '', isSaved: false, isFavorite: false, tempId: Date.now().toString() }]);
                        setCurrentIndex(0);
                        setSelectedImage(formattedPostcards[0].image);
                        setSelectedPostcard(formattedPostcards[0].postcardTemplate);
                        setPostcardContent(formattedPostcards[0].content || '');
                        setIsSaved(true);
                        setIsEditMode(false);
                    } else {
                        const newPostcard = { id: null, image: null, postcardTemplate: null, content: '', isSaved: false, isFavorite: false, tempId: Date.now().toString() };
                        setPostcards([newPostcard]);
                        setCurrentIndex(0);
                        setSelectedImage(null);
                        setSelectedPostcard(null);
                        setPostcardContent('');
                        setIsSaved(false);
                        setIsEditMode(true);
                    }
                } catch (error) {
                    console.error('❌ 기존 엽서 불러오기 오류:', error);
                    handleApiError(error, '기존 엽서 불러오기');
                }
            } else {
                const newPostcard = { id: null, image: null, postcardTemplate: null, content: '', isSaved: false, isFavorite: false, tempId: Date.now().toString() };
                setPostcards([newPostcard]);
                setCurrentIndex(0);
                setSelectedImage(null);
                setSelectedPostcard(null);
                setPostcardContent('');
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
        if (!isEditMode) {
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
    }, [currentIndex, isEditMode]);

    // 새 엽서 추가
    const addNewPostcard = useCallback(() => {
        if (!isSaved) {
            Alert.alert('알림', '현재 엽서를 먼저 저장해 주세요.');
            return;
        }
        
        setPostcards(prev => {
            const newPostcard = {
                id: null,
                image: null,
                postcardTemplate: null,
                content: '',
                isSaved: false,
                isFavorite: false,
                tempId: Date.now().toString(),
            };
            return [...prev, newPostcard];
        });
        setCurrentIndex(prev => prev + 1);
        setSelectedImage(null);
        setSelectedPostcard(null);
        setPostcardContent('');
        setIsSaved(false);
        setIsEditMode(true);
    }, [isSaved]);

    // 엽서 선택 변경
    const selectPostcard = useCallback((index) => {
        setCurrentIndex(index);
        const selected = postcards[index];
        setSelectedImage(selected.image);
        setSelectedPostcard(selected.postcardTemplate);
        setPostcardContent(selected.content || '');
        setIsSaved(selected.isSaved || false);
        setIsEditMode(!selected.isSaved);
    }, [postcards]);

    // 엽서 영역 터치 핸들러
    const handlePostcardAreaPress = useCallback(() => {
        if (!isEditMode) {
            Alert.alert('알림', '편집 모드가 아닙니다. 편집 버튼을 눌러 편집 모드로 전환해주세요.');
            return;
        }

        if (selectedPostcard) {
            setIsPostcardOverlayVisible(true);
        } else {
            setIsPostcardModalVisible(true);
        }
    }, [selectedPostcard, isEditMode]);

    // 엽서 선택 모달 열기
    const handlePostcardSelect = useCallback(() => {
        setIsPostcardOverlayVisible(false);
        setIsPostcardModalVisible(true);
    }, []);

    // 모달에서 엽서 디자인 선택 완료
    const handlePostcardDesignSelect = useCallback((selectedDesignCode) => {
        const postcardDesignObject = {
            code: selectedDesignCode,
            thumbnail: null
        };

        setSelectedPostcard(postcardDesignObject);
        
        setPostcards(prev => {
            const updated = [...prev];
            updated[currentIndex] = {
                ...updated[currentIndex],
                postcardTemplate: postcardDesignObject
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
        if (!isEditMode) {
            Alert.alert('알림', '편집 모드가 아닙니다. 편집 버튼을 눌러 편집 모드로 전환해주세요.');
            return;
        }
        setIsWritingModalVisible(true);
    }, [isEditMode]);

    // 글쓰기 완료
    const handleWritingComplete = useCallback(() => {
        setPostcards(prev => {
            const updated = [...prev];
            updated[currentIndex] = {
                ...updated[currentIndex],
                content: postcardContent
            };
            return updated;
        });
        setIsWritingModalVisible(false);
        Alert.alert('완료', '텍스트가 엽서에 추가되었습니다.');
    }, [postcardContent, currentIndex]);

    // 글쓰기 모달 닫기
    const handleWritingModalClose = useCallback(() => {
        setIsWritingModalVisible(false);
    }, []);

    // 그리기 기능
    const handleDrawPress = useCallback(() => {
        Alert.alert('준비중', '그리기 기능은 준비 중입니다.');
    }, []);

    // 저장 기능
    const handleSave = useCallback(async () => {
        if (!directoryInfo.id) {
            Alert.alert('알림', '폴더가 지정되지 않았습니다. 기존 폴더를 선택하거나 새 폴더를 먼저 생성해주세요.');
            return;
        }

        if (!selectedImage || !selectedPostcard) {
            Alert.alert('알림', '사진과 엽서 디자인을 모두 선택해주세요.');
            return;
        }

        try {
            const postcardData = {
                content: postcardContent || '',
                postcardType: selectedPostcard.code,
            };
            
            const imageFileObject = {
                uri: selectedImage,
                name: selectedImage.split('/').pop(),
                type: 'image/jpeg',
            };

            if (postcards[currentIndex].id) {
                console.log(`기존 엽서 (ID: ${postcards[currentIndex].id}) 업데이트 시도`);
                await updatePostcardApi(postcards[currentIndex].id, postcardData, imageFileObject);
                Alert.alert('수정 완료', '엽서가 성공적으로 수정되었습니다.');
            } else {
                console.log(`기존 폴더 (ID: ${directoryInfo.id})에 엽서 저장 시도`);
                const response = await createPostcardInExistingFolderApi(directoryInfo.id, postcardData, imageFileObject);
                
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
            
            setIsSaved(true);
            setIsEditMode(false);

        } catch (error) {
            console.error('❌ 엽서 저장/수정 오류:', error);
            handleApiError(error, '엽서 저장/수정');
        }
    }, [selectedImage, selectedPostcard, postcardContent, currentIndex, directoryInfo, postcards]);

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
                            await deletePostcardApi(postcardToDelete.id);
                            
                            Alert.alert('삭제 완료', '엽서가 성공적으로 삭제되었습니다.');
                            
                            setPostcards(prev => {
                                const updated = prev.filter((_, index) => index !== currentIndex);
                                if (updated.length === 0) {
                                    return [{ id: null, image: null, postcardTemplate: null, content: '', isSaved: false, isFavorite: false, tempId: Date.now().toString() }];
                                }
                                return updated;
                            });

                            const newIndex = currentIndex > 0 ? currentIndex - 1 : 0;
                            setCurrentIndex(newIndex);
                            const newSelectedPostcard = postcards[newIndex];
                            setSelectedImage(newSelectedPostcard?.image || null);
                            setSelectedPostcard(newSelectedPostcard?.postcardTemplate || null);
                            setPostcardContent(newSelectedPostcard?.content || '');
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
        Alert.alert('다운로드', '모든 엽서가 갤러리에 저장되었습니다.');
    }, []);

    const handleShare = useCallback(() => {
        const currentPostcard = postcards[currentIndex];
        if (!currentPostcard.id) {
            Alert.alert('알림', '아직 저장되지 않은 엽서입니다. 먼저 엽서를 저장해 주세요.');
            return;
        }

        const queryParams = {
            directoryId: directoryInfo.id,
            directoryTitle: directoryInfo.name,
            startDate: directoryInfo.startDate?.toISOString(),
            endDate: directoryInfo.endDate?.toISOString(),
            selectedPostcardId: currentPostcard.id
        };

        router.push({
            pathname: 'profile/sharePost',
            params: queryParams
        });
    }, [currentIndex, postcards, directoryInfo, router]);

    const handleEdit = useCallback(() => {
        setIsEditMode(true);
        setIsSaved(false);
        Alert.alert('편집 모드', '편집 모드가 활성화되었습니다. 이제 사진과 디자인을 수정하고 글을 작성할 수 있습니다.');
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
                />

                {/* 엽서 선택 영역 */}
                <PostcardSelectionArea
                    selectedPostcard={selectedPostcard}
                    onAreaPress={handlePostcardAreaPress}
                    onPostcardSelect={handlePostcardSelect}
                    isEditMode={isEditMode}
                    isOverlayVisible={isPostcardOverlayVisible}
                    onOverlayClose={handleOverlayClose}
                    onWritePress={handleWritePress}
                    onDrawPress={handleDrawPress}
                />
            </View>

            {/* 저장 버튼 또는 EditPostFloatingButtons */}
            <View style={styles.saveButtonContainer}>
                {isEditMode ? (
                    <SaveButton
                        title="엽서 저장"
                        onPress={handleSave}
                        disabled={!isSaveEnabled}
                    />
                ) : (
                    <EditPostFloatingButtons
                        onDelete={handleDelete}
                        onDownload={handleDownload}
                        onShare={handleShare}
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

            {/* 글쓰기 모달 */}
            <Modal
                visible={isWritingModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={handleWritingModalClose}
            >
                <View style={styles.writingModal}>
                    <View style={styles.writingHeader}>
                        <TouchableOpacity onPress={handleWritingModalClose}>
                            <Text style={styles.cancelButton}>취소</Text>
                        </TouchableOpacity>
                        <Text style={styles.writingTitle}>엽서에 글쓰기</Text>
                        <TouchableOpacity onPress={handleWritingComplete}>
                            <Text style={styles.completeButton}>완료</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.writingContent}>
                        <TextInput
                            style={styles.writingTextInput}
                            value={postcardContent}
                            onChangeText={setPostcardContent}
                            placeholder="엽서에 쓸 내용을 입력하세요..."
                            multiline={true}
                            textAlignVertical="top"
                            maxLength={500}
                        />
                        <Text style={styles.characterCount}>
                            {postcardContent.length}/500
                        </Text>
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
    // 글쓰기 모달 스타일
    writingModal: {
        flex: 1,
        backgroundColor: '#fff',
    },
    writingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#fff',
    },
    cancelButton: {
        fontSize: 16,
        color: '#666',
    },
    writingTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    completeButton: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: 'bold',
    },
    writingContent: {
        flex: 1,
        padding: 20,
    },
    writingTextInput: {
        flex: 1,
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
        padding: 15,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#F8F8F8',
    },
    characterCount: {
        textAlign: 'right',
        marginTop: 10,
        fontSize: 14,
        color: '#666',
    },
});

export default WritePost;