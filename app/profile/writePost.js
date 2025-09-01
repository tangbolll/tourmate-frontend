import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, Alert, Modal, TextInput, TouchableOpacity, Text, Keyboard, TouchableWithoutFeedback } from "react-native";
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
    const [isSaved, setIsSaved] = useState(false);
    const [isEditMode, setIsEditMode] = useState(true);
    const [isTextEditing, setIsTextEditing] = useState(false); // 텍스트 편집 중인지 확인하는 상태 추가
    const textInputRef = useRef(null); // TextInput에 대한 참조 추가

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
        setIsTextEditing(false); // 새로운 엽서로 전환 시 텍스트 편집 모드 비활성화
    }, [isSaved]);

    // 엽서 선택 변경
    const selectPostcard = useCallback((index) => {
        // 현재 편집 중이라면 저장 경고
        if (isTextEditing && !isSaved) {
            Alert.alert(
                '변경사항 저장',
                '현재 편집 중인 내용이 있습니다. 저장하지 않고 다른 엽서로 이동하시겠습니까?',
                [
                    {
                        text: '취소',
                        style: 'cancel',
                        onPress: () => {
                            // 아무것도 하지 않음
                        }
                    },
                    {
                        text: '계속',
                        style: 'destructive',
                        onPress: () => {
                            // 엽서 변경
                            setCurrentIndex(index);
                            const selected = postcards[index];
                            setSelectedImage(selected.image);
                            setSelectedPostcard(selected.postcardTemplate);
                            setPostcardContent(selected.content || '');
                            setIsSaved(selected.isSaved || false);
                            setIsEditMode(!selected.isSaved);
                            setIsTextEditing(false);
                            Keyboard.dismiss(); // 키보드 닫기
                        }
                    },
                ],
                { cancelable: false }
            );
            return;
        }

        setCurrentIndex(index);
        const selected = postcards[index];
        setSelectedImage(selected.image);
        setSelectedPostcard(selected.postcardTemplate);
        setPostcardContent(selected.content || '');
        setIsSaved(selected.isSaved || false);
        setIsEditMode(!selected.isSaved);
        setIsTextEditing(false);
        Keyboard.dismiss();
    }, [postcards, isTextEditing, isSaved]);

    // 엽서 영역 터치 핸들러
    const handlePostcardAreaPress = useCallback(() => {
        if (!isEditMode) {
            Alert.alert('알림', '편집 모드가 아닙니다. 편집 버튼을 눌러 편집 모드로 전환해주세요.');
            return;
        }
        
        // 엽서 디자인이 선택되지 않았다면 디자인 선택 모달 열기
        if (!selectedPostcard) {
            setIsPostcardModalVisible(true);
        } else {
            // 엽서 디자인이 선택되었다면 오버레이 표시
            setIsPostcardOverlayVisible(true);
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

    // 글쓰기 기능 (텍스트 입력 필드 포커스)
    const handleWritePress = useCallback(() => {
        if (!isEditMode) {
            Alert.alert('알림', '편집 모드가 아닙니다. 편집 버튼을 눌러 편집 모드로 전환해주세요.');
            return;
        }
        if (selectedPostcard) {
            setIsTextEditing(true); // 텍스트 편집 모드 활성화
            setTimeout(() => {
                textInputRef.current?.focus();
            }, 100);
        } else {
            Alert.alert('알림', '엽서 디자인을 먼저 선택해주세요.');
        }
    }, [isEditMode, selectedPostcard]);

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

        // 텍스트 편집 모드 중이면 저장하기 전에 포커스 해제
        if (isTextEditing) {
            Keyboard.dismiss();
            setIsTextEditing(false);
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
    }, [selectedImage, selectedPostcard, postcardContent, currentIndex, directoryInfo, postcards, isTextEditing]);

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
                            setIsTextEditing(false); // 삭제 후 텍스트 편집 모드 비활성화

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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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

                    {/* 엽서 선택/표시 영역 - 직접 텍스트 입력 가능하도록 변경 */}
                    <PostcardSelectionArea
                        selectedPostcard={selectedPostcard}
                        onAreaPress={handlePostcardAreaPress}
                        onPostcardSelect={handlePostcardSelect}
                        isEditMode={isEditMode}
                        isOverlayVisible={isPostcardOverlayVisible}
                        onOverlayClose={handleOverlayClose}
                        onWritePress={handleWritePress} // 이 함수가 이제 텍스트 필드 포커스를 담당합니다.
                        onDrawPress={handleDrawPress}
                        postcardContent={postcardContent} // 텍스트 내용 전달
                        onContentChange={setPostcardContent} // 텍스트 변경 핸들러 전달
                        isTextEditing={isTextEditing} // 텍스트 편집 상태 전달
                        onTextEditStart={() => setIsTextEditing(true)} // 편집 시작 핸들러
                        onTextEditEnd={() => setIsTextEditing(false)} // 편집 종료 핸들러
                        textInputRef={textInputRef} // TextInput에 대한 참조 전달
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
            </View>
        </TouchableWithoutFeedback>
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
        paddingBottom: 5,
        backgroundColor: '#fff',
    },
    floatingButtons: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default WritePost;
