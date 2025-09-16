import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, Alert, Modal, TextInput, TouchableOpacity, Text, Keyboard, TouchableWithoutFeedback, Image, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import PostDirectoryHeader from "../../components/profile/PostDirectoryHeader";
import SaveButton from "../../components/profile/SaveButton";
import EditPostFloatingButtons from "../../components/profile/EditPostFloatingButtons";
import SelectPostDesign from "../../components/profile/selectPostDesign";
import PostcardSlider from "../../components/profile/PostcardSlider";
import PhotoUploadArea from "../../components/profile/PhotoUploadArea";
import PostcardSelectionArea from "../../components/profile/PostcardSelectionArea";
import TextWritingModal from "../../components/profile/TextWritingModal";

import {
    handleApiError,
    createPostcardInExistingFolderApi,
    getPostcardsByFolderApi,
    deletePostcardApi,
    updatePostcardApi,
    deleteFolderApi,
    togglePostcardPublicScopeApi,
} from "../../utils/PostCardApi";

const postcardTemplates = {
    1: require('../../assets/postcardType/1.png'),
    2: require('../../assets/postcardType/2.png'),
    3: require('../../assets/postcardType/3.png'),
    4: require('../../assets/postcardType/4.png'),
    5: require('../../assets/postcardType/5.png'),
    6: require('../../assets/postcardType/6.png'),
    7: require('../../assets/postcardType/7.png'),
    8: require('../../assets/postcardType/8.png'),
    9: require('../../assets/postcardType/9.png'),
    10: require('../../assets/postcardType/10.png'),
    11: require('../../assets/postcardType/11.png'),
    12: require('../../assets/postcardType/12.png'),
    13: require('../../assets/postcardType/13.png'),
    14: require('../../assets/postcardType/14.png'),
    15: require('../../assets/postcardType/15.png'),
};

const WritePost = () => {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [isLoading, setIsLoading] = useState(true);

    const [postcards, setPostcards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedPostcard, setSelectedPostcard] = useState(null);
    const [postcardContent, setPostcardContent] = useState('');

    const [directoryInfo, setDirectoryInfo] = useState({
        id: params.directoryId || null,
        name: params.directoryName || '',
        startDate: params.startDate || null,
        endDate: params.endDate || null,
    });
    const [isPostcardModalVisible, setIsPostcardModalVisible] = useState(false);
    const [isPostcardOverlayVisible, setIsPostcardOverlayVisible] = useState(false);
    const [isTextWritingModalVisible, setIsTextWritingModalVisible] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isEditMode, setIsEditMode] = useState(true);
    const [isTextEditing, setIsTextEditing] = useState(false);
    const textInputRef = useRef(null);

    // 전달받은 디렉토리 정보 설정 및 기존 엽서 불러오기
    useEffect(() => {
        const fetchPostcards = async () => {
            setIsLoading(true);

            const newDirectoryId = params.directoryId || null;
            const newDirectoryName = params.directoryName || '';
            const newStartDate = params.startDate || null;
            const newEndDate = params.endDate || null;
            const specificPostcardId = params.postcardId; // 새로 생성된 엽서 ID
            const shouldSelectLast = params.shouldSelectLast === 'true'; // ProfileHome에서 전달된 플래그

            setDirectoryInfo({
                id: newDirectoryId,
                name: newDirectoryName,
                startDate: newStartDate,
                endDate: newEndDate
            });

            let initialPostcards = [];
            let initialIndex = 0;
            let initialImage = null;
            let initialTemplate = null;
            let initialContent = '';
            let initialIsSaved = false;
            let initialIsEditMode = true;

            if (newDirectoryId) {
                try {
                    const existingPostcards = await getPostcardsByFolderApi(newDirectoryId);
                    console.log('기존 엽서 불러오기 성공:', existingPostcards);

                    if (existingPostcards.length > 0) {
                        const formattedPostcards = existingPostcards.map(pc => ({
                            id: pc.postcardId,
                            image: pc.imageUrl,
                            postcardTemplate: pc.postcardTypeId ? { 
                                code: pc.postcardTypeId, 
                                thumbnail: postcardTemplates[pc.postcardTypeId] || null 
                            } : null,
                            content: pc.content || '',
                            isSaved: true,
                            publicScope: pc.publicScope,
                            isFavorite: pc.isFavorite || false,
                        }));

                        // 생성 시간 또는 ID로 정렬하여 새 엽서가 마지막에 오도록
                        initialPostcards = formattedPostcards.sort((a, b) => {
                            // ID가 숫자라면 숫자 정렬, 아니면 문자열 정렬
                            if (typeof a.id === 'number' && typeof b.id === 'number') {
                                return a.id - b.id;
                            }
                            return String(a.id).localeCompare(String(b.id));
                        });

                        // 특정 엽서 ID가 있다면 해당 엽서의 인덱스 찾기
                        if (specificPostcardId) {
                            const targetIndex = initialPostcards.findIndex(
                                pc => pc.id.toString() === specificPostcardId.toString()
                            );
                            if (targetIndex !== -1) {
                                initialIndex = targetIndex;
                                console.log(`새로 생성된 엽서(ID: ${specificPostcardId})를 인덱스 ${targetIndex}에서 선택`);
                            } else {
                                console.warn(`엽서 ID ${specificPostcardId}를 찾을 수 없음. 마지막 엽서 선택`);
                                initialIndex = initialPostcards.length - 1;
                            }
                        } else if (shouldSelectLast) {
                            // shouldSelectLast 플래그가 있으면 마지막 엽서 선택
                            initialIndex = initialPostcards.length - 1;
                            console.log(`마지막 엽서를 인덱스 ${initialIndex}에서 선택`);
                        } else {
                            // 기본적으로 첫 번째 엽서 선택
                            initialIndex = 0;
                        }

                        initialIsSaved = true;
                        initialIsEditMode = false;

                        // 선택된 엽서의 정보로 초기화
                        const selectedPostcard = initialPostcards[initialIndex];
                        if (selectedPostcard) {
                            initialImage = selectedPostcard.image;
                            initialTemplate = selectedPostcard.postcardTemplate;
                            initialContent = selectedPostcard.content;
                        }
                    }
                } catch (error) {
                    console.error('기존 엽서 불러오기 오류:', error);
                    handleApiError(error, '기존 엽서 불러오기');
                }
            }

            // createNew 파라미터가 true일 경우, 새 엽서를 추가합니다.
            if (params.createNew === 'true') {
                const newPostcard = {
                    id: null,
                    image: null,
                    postcardTemplate: null,
                    content: '',
                    isSaved: false,
                    isFavorite: false,
                    tempId: Date.now().toString(),
                };
                initialPostcards.push(newPostcard);
                initialIndex = initialPostcards.length - 1;
                
                // 새 엽서이므로 이미지, 템플릿, 내용을 초기화합니다.
                initialImage = null;
                initialTemplate = null;
                initialContent = '';

                // 편집 모드로 설정합니다.
                initialIsSaved = false;
                initialIsEditMode = true;
            }

            // startInEditMode 파라미터가 true일 경우, 편집 모드에서 시작하도록 강제합니다.
            if (params.startInEditMode === 'true') {
                initialIsSaved = false;
                initialIsEditMode = true;
            }

            setPostcards(initialPostcards);
            setCurrentIndex(initialIndex);
            setSelectedImage(initialImage);
            setSelectedPostcard(initialTemplate);
            setPostcardContent(initialContent);
            setIsSaved(initialIsSaved);
            setIsEditMode(initialIsEditMode);
            setIsLoading(false);

            console.log(`최종 설정: 총 ${initialPostcards.length}개 엽서, 선택된 인덱스: ${initialIndex}`);
        };

        fetchPostcards();
    }, [params.directoryId, params.directoryName, params.startDate, params.endDate, params.postcardId, params.shouldSelectLast, params.createNew, params.startInEditMode]);

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

                // 빈 엽서 목록일 경우에만 새 엽서 객체 생성
                if (postcards.length === 0) {
                    const newPostcard = {
                        id: null,
                        image: imageUri,
                        postcardTemplate: null,
                        content: '',
                        isSaved: false,
                        isFavorite: false,
                        tempId: Date.now().toString(),
                    };
                    setPostcards([newPostcard]);
                    setCurrentIndex(0);
                    setSelectedPostcard(null);
                    setPostcardContent('');
                    setIsSaved(false);
                    setIsEditMode(true);
                } else {
                    setPostcards(prev => {
                        const updated = [...prev];
                        updated[currentIndex] = {
                            ...updated[currentIndex],
                            image: imageUri
                        };
                        return updated;
                    });
                }
            }
        } catch (error) {
            console.error('이미지 선택 오류:', error);
            Alert.alert('오류', '이미지 선택 중 오류가 발생했습니다.');
        }
    }, [currentIndex, isEditMode, postcards.length]);

    // 새 엽서 추가
    const addNewPostcard = useCallback(() => {
        if (!isSaved) {
            Alert.alert('알림', '현재 엽서를 먼저 저장해 주세요.');
            return;
        }

        const newPostcard = {
            id: null,
            image: null,
            postcardTemplate: null,
            content: '',
            isSaved: false,
            isFavorite: false,
            tempId: Date.now().toString(),
        };

        setPostcards(prev => [...prev, newPostcard]);
        const newIndex = postcards.length; // 새 엽서는 항상 마지막 인덱스
        setCurrentIndex(newIndex);
        setSelectedImage(null);
        setSelectedPostcard(null);
        setPostcardContent('');
        setIsSaved(false);
        setIsEditMode(true);
        setIsTextEditing(false);
        
        console.log(`새 엽서 추가: 인덱스 ${newIndex}에서 선택됨`);
    }, [isSaved, postcards.length]);
    
    // 엽서 선택 변경
    const selectPostcard = useCallback((index) => {
        if (isTextEditing && !isSaved) {
            Alert.alert(
                '변경사항 저장',
                '현재 편집 중인 내용이 있습니다. 저장하지 않고 다른 엽서로 이동하시겠습니까?',
                [
                    {
                        text: '취소',
                        style: 'cancel',
                        onPress: () => {}
                    },
                    {
                        text: '계속',
                        style: 'destructive',
                        onPress: () => {
                            setCurrentIndex(index);
                            const selected = postcards[index];
                            setSelectedImage(selected.image);
                            setSelectedPostcard(selected.postcardTemplate);
                            setPostcardContent(selected.content || '');
                            setIsSaved(selected.isSaved || false);
                            setIsEditMode(!selected.isSaved);
                            setIsTextEditing(false);
                            Keyboard.dismiss();
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

        if (!selectedPostcard) {
            setIsPostcardModalVisible(true);
        } else {
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
            thumbnail: postcardTemplates[selectedDesignCode] || null,
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
        if (selectedPostcard) {
            setIsTextWritingModalVisible(true);
        } else {
            Alert.alert('알림', '엽서 디자인을 먼저 선택해주세요.');
        }
    }, [isEditMode, selectedPostcard]);

    // 텍스트 쓰기 모달 닫기
    const handleTextWritingModalClose = useCallback(() => {
        setIsTextWritingModalVisible(false);
    }, []);

    // 텍스트 쓰기 모달에서 저장
    const handleTextWritingModalSave = useCallback(() => {
        setPostcards(prev => {
            const updated = [...prev];
            updated[currentIndex] = {
                ...updated[currentIndex],
                content: postcardContent
            };
            return updated;
        });
        setIsSaved(false);
    }, [postcardContent, currentIndex]);

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
                                    return [];
                                }
                                return updated;
                            });

                            const newIndex = currentIndex > 0 ? currentIndex - 1 : 0;
                            setCurrentIndex(newIndex);

                            const newSelectedPostcard = postcards[newIndex];
                            if (newSelectedPostcard) {
                                setSelectedImage(newSelectedPostcard.image || null);
                                setSelectedPostcard(newSelectedPostcard.postcardTemplate || null);
                                setPostcardContent(newSelectedPostcard.content || '');
                                setIsSaved(newSelectedPostcard.isSaved || false);
                                setIsEditMode(!newSelectedPostcard.isSaved);
                            } else {
                                setSelectedImage(null);
                                setSelectedPostcard(null);
                                setPostcardContent('');
                                setIsSaved(false);
                                setIsEditMode(true);
                            }
                            setIsTextEditing(false);

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
        Alert.alert('준비중', '다운로드 기능은 아직 준비 중입니다. 곧 만나보실 수 있도록 최선을 다하겠습니다!');
    }, []);

    const handleShare = useCallback(() => {
        const currentPostcard = postcards[currentIndex];
        const isCurrentlyPublic = Number(currentPostcard?.publicScope) === 1;

        if (isCurrentlyPublic) {
            Alert.alert(
                "공유 취소",
                "이 엽서의 공유를 취소하시겠습니까?\n더 이상 다른 사람들에게 보이지 않습니다.",
                [
                    { text: "유지", style: "cancel" },
                    {
                        text: "공유 취소",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                if (!currentPostcard?.id) {
                                    Alert.alert('오류', '엽서 ID를 찾을 수 없습니다.');
                                    return;
                                }
                                console.log('📌 공유 취소 API 호출, id:', currentPostcard.id);
                                await togglePostcardPublicScopeApi(currentPostcard.id);

                                Alert.alert("성공", "엽서 공유가 취소되었습니다.");

                                setPostcards(prev => {
                                    const updated = [...prev];
                                    const postcardToUpdate = updated.find(p => p.id === currentPostcard.id);
                                    if (postcardToUpdate) {
                                        postcardToUpdate.publicScope = 0;
                                    }
                                    return updated;
                                });
                            } catch (error) {
                                console.error("공유 취소 오류:", error);
                                Alert.alert("오류", "공유를 취소하는 중 문제가 발생했습니다.");
                            }
                        }
                    }
                ]
            );
            return;
        }

        if (!currentPostcard?.id) {
            Alert.alert('알림', '공유할 엽서 정보를 찾을 수 없습니다.');
            return;
        }

        if (!directoryInfo || !directoryInfo.id) {
            Alert.alert('오류', '폴더 정보가 올바르지 않아 공유할 수 없습니다.');
            return;
        }

        const postcardToShare = {
            postcardId: currentPostcard.id,
            imageUrl: currentPostcard.image,
            postcardTypeId: currentPostcard.postcardTemplate?.code,
            content: currentPostcard.content
        };

        const selectedPostcardsJSON = JSON.stringify([postcardToShare]);

        const queryParams = {
            directoryId: directoryInfo.id,
            directoryTitle: directoryInfo.name,
            startDate: directoryInfo.startDate,
            endDate: directoryInfo.endDate,
            selectedPostcards: selectedPostcardsJSON
        };

        router.push({
            pathname: 'profile/sharePost',
            params: queryParams
        });
    }, [directoryInfo, postcards, currentIndex, router]);

    const handleEdit = useCallback(() => {
        setIsEditMode(true);
        setIsSaved(false);
        Alert.alert('편집 모드', '편집 모드가 활성화되었습니다. 이제 사진과 디자인을 수정하고 글을 작성할 수 있습니다.');
    }, []);

    const isSaveEnabled = selectedImage && selectedPostcard;

    const handleBackPress = () => {
        const currentPostcard = postcards[currentIndex];

        if (
            params.newlyCreated === 'true' &&
            postcards.length === 0 &&
            !isLoading
        ) {
            Alert.alert(
                "경고",
                "엽서를 저장하지 않고 나가면 폴더가 삭제됩니다. 정말로 나가시겠습니까?",
                [
                    { text: "취소", style: "cancel" },
                    {
                        text: "나가기",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                if (directoryInfo.id) {
                                    await deleteFolderApi(directoryInfo.id);
                                }
                                router.back();
                            } catch (error) {
                                console.error("Failed to delete folder", error);
                                handleApiError(error, '폴더 삭제');
                            }
                        },
                    },
                ]
            );
        } else if (isEditMode && !isSaved) {
            // 시나리오 1: 폴더에서 '+' 버튼으로 추가된 새 엽서 (id가 없음)
            if (currentPostcard && currentPostcard.id === null) {
                Alert.alert(
                    "저장 취소",
                    "엽서가 저장되지 않았습니다. 정말로 나가시겠습니까?",
                    [
                        { text: "취소", style: "cancel" },
                        {
                            text: "나가기",
                            style: "destructive",
                            onPress: () => router.back(), // 그냥 뒤로가기
                        },
                    ]
                );
            } 
            // 시나리오 2: 기존 폴더에 엽서 추가로 들어왔는데, 이미지 저장을 안 한 경우
            else if (params.startInEditMode === 'true' && selectedImage === null) {
                Alert.alert(
                    "엽서 삭제",
                    "이미지를 추가하지 않으면 엽서가 삭제됩니다. 정말로 나가시겠습니까?",
                    [
                        { text: "취소", style: "cancel" },
                        {
                            text: "나가기",
                            style: "destructive",
                            onPress: async () => {
                                try {
                                    if (currentPostcard && currentPostcard.id) {
                                        await deletePostcardApi(currentPostcard.id);
                                    }
                                    router.back();
                                } catch (error) {
                                    console.error("Failed to delete postcard", error);
                                    handleApiError(error, '엽서 삭제');
                                    // 에러가 나도 일단 뒤로가기
                                    router.back();
                                }
                            },
                        },
                    ]
                );
            }
            // 시나리오 3: 그 외 모든 편집 중인 경우
            else {
                Alert.alert(
                    "변경사항 저장",
                    "현재 편집 중인 내용이 있습니다. 저장하지 않고 나가시겠습니까?",
                    [
                        { text: "취소", style: "cancel" },
                        { text: "나가기", style: "destructive", onPress: () => router.back() },
                    ]
                );
            }
        } else {
            router.back();
        }
    };

    const currentPostcard = postcards[currentIndex];

    if (isLoading) {
        return <View style={styles.loadingContainer}><Text>엽서 목록을 불러오는 중...</Text></View>;
    }

    const showEmptyState = postcards.length === 0;

    return (
    <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <PostDirectoryHeader
                    title={directoryInfo.name}
                    startDate={directoryInfo.startDate}
                    endDate={directoryInfo.endDate}
                    onBackPress={handleBackPress}
                    showActionButton={false}
                />

                {!showEmptyState && (
                    <PostcardSlider
                        postcards={postcards}
                        currentIndex={currentIndex}
                        onSelectPostcard={selectPostcard}
                        onAddNewPostcard={addNewPostcard}
                        isEditMode={isEditMode}
                        isSaved={isSaved}
                    />
                )}

                <ScrollView contentContainerStyle={styles.contentContainer}>
                    {showEmptyState ? (
                        <View style={styles.emptyPostcardContainer}>
                            <Text style={styles.emptyPostcardText}>
                                이 폴더에 첫 번째 엽서를 만들어 보세요! 📝{"\n"}
                                아래 버튼으로 사진을 올리고 디자인을 선택할 수 있습니다.
                            </Text>
                            <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
                                <Text style={styles.actionButtonText}>사진 추가</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} onPress={() => setIsPostcardModalVisible(true)}>
                                <Text style={styles.actionButtonText}>엽서 디자인 선택</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <PhotoUploadArea
                                style={{ marginBottom: 20 }}
                                selectedImage={selectedImage}
                                onPickImage={pickImage}
                                isEditMode={isEditMode}
                            />

                            <PostcardSelectionArea
                                selectedPostcard={selectedPostcard}
                                onAreaPress={handlePostcardAreaPress}
                                onPostcardSelect={handlePostcardSelect}
                                isEditMode={isEditMode}
                                isOverlayVisible={isPostcardOverlayVisible}
                                onOverlayClose={handleOverlayClose}
                                onWritePress={handleWritePress}
                                onDrawPress={handleDrawPress}
                                postcardContent={postcardContent}
                                onContentChange={setPostcardContent}
                                isTextEditing={isTextEditing}
                                onTextEditStart={() => setIsTextEditing(true)}
                                onTextEditEnd={() => setIsTextEditing(false)}
                                textInputRef={textInputRef}
                            />
                        </>
                    )}
                </ScrollView>

                {!showEmptyState && (
                    <View style={styles.saveButtonContainer}>
                        {isEditMode ? (
                            <SaveButton
                                title="엽서 저장"
                                onPress={handleSave}
                                disabled={!isSaveEnabled}
                            />
                        ) : (
                            <>
                                <Text style={styles.noticeText}>
                                    자물쇠 버튼을 클릭하면 다른 사람들과 엽서를 공유할 수 있습니다.
                                </Text>
                                <EditPostFloatingButtons
                                    onDelete={handleDelete}
                                    onDownload={handleDownload}
                                    onShare={handleShare}
                                    onEdit={handleEdit}
                                    isFavorite={postcards[currentIndex]?.isFavorite || false}
                                    style={styles.floatingButtons}
                                    isPublic={currentPostcard?.publicScope === 1}
                                />
                            </>
                        )}
                    </View>
                )}

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

                <TextWritingModal
                    visible={isTextWritingModalVisible}
                    onClose={handleTextWritingModalClose}
                    content={postcardContent}
                    onContentChange={setPostcardContent}
                    onSave={handleTextWritingModalSave}
                />
            </View>
        </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {
        padding: 16,
        gap: 20,
    },
    saveButtonContainer: {
        padding: 16,
        paddingBottom: 5,
        backgroundColor: '#fff',
    },
    floatingButtons: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 20,
    },
    noticeText: {
        textAlign: 'center',
        color: '#888',
        fontSize: 12,
        marginBottom: 10,
    },
    emptyPostcardContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        minHeight: 400,
    },
    emptyPostcardText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#555',
        marginBottom: 20,
        lineHeight: 24,
    },
    actionButton: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
        marginBottom: 10,
    },
    actionButtonText: {
        color: '#333',
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});

export default WritePost;