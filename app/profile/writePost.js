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

const WritePost = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    // 디렉토리 정보 상태
    const [directoryInfo, setDirectoryInfo] = useState({
        id: null,
        name: '',
        startDate: '',
        endDate: ''
    });
    
    const [postcards, setPostcards] = useState([{ id: 1, image: null, postcardTemplate: null, isSaved: false }]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedPostcard, setSelectedPostcard] = useState(null);
    
    // 모달 상태
    const [isPostcardModalVisible, setIsPostcardModalVisible] = useState(false);
    const [isPostcardOverlayVisible, setIsPostcardOverlayVisible] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isEditMode, setIsEditMode] = useState(true);

    // 전달받은 디렉토리 정보 설정
    useEffect(() => {
        console.log('useEffect running - params changed:', params);
        
        if (params && (params.directoryId || params.directoryName || params.startDate || params.endDate)) {
            const startDate = params.startDate ? new Date(params.startDate) : null;
            const endDate = params.endDate ? new Date(params.endDate) : null;
            
            setDirectoryInfo(prev => {
                if (prev.id === params.directoryId && 
                    prev.name === (params.directoryName || '새 폴더')) {
                    return prev;
                }
                
                return {
                    id: params.directoryId,
                    name: params.directoryName || '새 폴더',
                    startDate: startDate,
                    endDate: endDate
                };
            });
        }
    }, [params.directoryId, params.directoryName, params.startDate, params.endDate]);

    // 날짜 포맷팅 함수
    const formatDate = useCallback((date) => {
        if (!date) return '';
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
        if (!isEditMode || isSaved) {
            Alert.alert('알림', '편집 모드가 아닙니다. 편집 버튼을 눌러 편집 모드로 전환해주세요.');
            return;
        }

        setPostcards(prev => {
            const newPostcard = {
                id: prev.length + 1,
                image: null,
                postcardTemplate: null,
                isSaved: false
            };
            return [...prev, newPostcard];
        });
        setCurrentIndex(prev => prev + 1);
        setSelectedImage(null);
        setSelectedPostcard(null);
    }, [isEditMode, isSaved]);

    // 엽서 선택 변경
    const selectPostcard = useCallback((index) => {
        setCurrentIndex(index);
        setSelectedImage(postcards[index].image);
        setSelectedPostcard(postcards[index].postcardTemplate);
        setIsSaved(postcards[index].isSaved || false);
        setIsEditMode(!postcards[index].isSaved);
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
    const handleSave = useCallback(() => {
        if (selectedImage && selectedPostcard) {
            console.log('현재 엽서 저장:', {
                index: currentIndex,
                image: selectedImage,
                postcard: selectedPostcard
            });
            
            setPostcards(prev => {
                const updated = [...prev];
                updated[currentIndex] = {
                    ...updated[currentIndex],
                    isSaved: true
                };
                return updated;
            });
            
            Alert.alert('저장 완료', '엽서가 저장되었습니다.');
            setIsSaved(true);
            setIsEditMode(false);
        }
    }, [selectedImage, selectedPostcard, currentIndex]);

    // EditPostFloatingButtons 핸들러들
    const handleDelete = useCallback(() => {
        Alert.alert(
            '삭제 확인',
            '정말로 삭제하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                { 
                    text: '삭제', 
                    style: 'destructive',
                    onPress: () => {
                        console.log('현재 엽서 삭제:', currentIndex);
                        setIsSaved(false);
                        setIsEditMode(true);
                        setSelectedImage(null);
                        setSelectedPostcard(null);
                        setPostcards(prev => {
                            const updated = [...prev];
                            updated[currentIndex] = {
                                ...updated[currentIndex],
                                image: null,
                                postcardTemplate: null,
                                isSaved: false
                            };
                            return updated;
                        });
                    }
                }
            ]
        );
    }, [currentIndex]);

    const handleDownload = useCallback(() => {
        console.log('다운로드');
        Alert.alert('다운로드', '모든 엽서가 갤러리에 저장되었습니다.');
    }, []);

    const handleLock = useCallback(() => {
        console.log('잠금 토글');
        Alert.alert('잠금', '이게 잠금기능이 맞나 ? 뭐지');
    }, []);

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
                        onLock={handleLock}
                        onEdit={handleEdit}
                        isLocked={false}
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