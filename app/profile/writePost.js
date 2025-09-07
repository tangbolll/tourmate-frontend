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
import TextWritingModal from "../../components/profile/TextWritingModal"; // 새로 추가된 import

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

    // 디렉토리 정보 상태
    const [directoryInfo, setDirectoryInfo] = useState({
        id: params.directoryId || null,
        name: params.directoryName || '',
        startDate: params.startDate || null,
        endDate: params.endDate || null,
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
    const [isTextWritingModalVisible, setIsTextWritingModalVisible] = useState(false); // 새로 추가된 상태
    const [isSaved, setIsSaved] = useState(false);
    const [isEditMode, setIsEditMode] = useState(true);
    const [isTextEditing, setIsTextEditing] = useState(false); // 텍스트 편집 중인지 확인하는 상태 추가
    const textInputRef = useRef(null); // TextInput에 대한 참조 추가

    // 전달받은 디렉토리 정보 설정 및 기존 엽서 불러오기
    useEffect(() => {
        const fetchPostcards = async () => {
            const newDirectoryId = params.directoryId || null;
            const newDirectoryName = params.directoryName || '';
            const newStartDate = params.startDate || null;
            const newEndDate = params.endDate || null;

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
                        postcardTemplate: pc.postcardTypeId ? { code: pc.postcardTypeId, thumbnail: postcardTemplates[pc.postcardTypeId] || null } : null,
                        content: pc.content || '',
                        isSaved: true,
                        publicScope: pc.publicScope, 
                        isFavorite: pc.isFavorite || false,
                    }));

                    let allPostcards = [...formattedPostcards];

                    if (params.newlyCreated === 'true') {
                        const defaultImageUri = null;
                        const defaultPostcardTemplate = { code: 1, thumbnail: postcardTemplates[1] };
                        const newPostcard = { id: null, image: defaultImageUri, postcardTemplate: defaultPostcardTemplate, content: '', isSaved: false, isFavorite: false, tempId: Date.now().toString() };
                        allPostcards.push(newPostcard);
                        setPostcards(allPostcards);

                        const newIndex = allPostcards.length - 1;
                        setCurrentIndex(newIndex);
                        setSelectedImage(defaultImageUri);
                        setSelectedPostcard(defaultPostcardTemplate);
                        setPostcardContent('');
                        setIsSaved(false);
                        setIsEditMode(true);
                    } else {
                        setPostcards(allPostcards);
                        if (params.postcardId) {
                            const selectedIndex = formattedPostcards.findIndex(p => p.id == params.postcardId);
                            if (selectedIndex !== -1) {
                                setCurrentIndex(selectedIndex);
                                setSelectedImage(formattedPostcards[selectedIndex].image);
                                setSelectedPostcard(formattedPostcards[selectedIndex].postcardTemplate);
                                setPostcardContent(formattedPostcards[selectedIndex].content || '');
                                
                                // ✅ 새로 생성된 엽서인지 확인 (이미지나 템플릿이 없으면 새 엽서)
                                const isNewPostcard = !formattedPostcards[selectedIndex].image || 
                                                    !formattedPostcards[selectedIndex].postcardTemplate;
                                
                                setIsSaved(!isNewPostcard); // 새 엽서면 저장되지 않은 상태
                                setIsEditMode(isNewPostcard); // 새 엽서면 편집 모드
                                
                            } else {
                                if (formattedPostcards.length > 0) {
                                    setCurrentIndex(0);
                                    setSelectedImage(formattedPostcards[0].image);
                                    setSelectedPostcard(formattedPostcards[0].postcardTemplate);
                                    setPostcardContent(formattedPostcards[0].content || '');
                                    setIsSaved(true);
                                    setIsEditMode(false);
                                }
                            }
                        } else if (formattedPostcards.length > 0) {
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
                    }
                } catch (error) {
                    console.error('❌ 기존 엽서 불러오기 오류:', error);
                    handleApiError(error, '기존 엽서 불러오기');
                }
            } else {
                const defaultImageUri = null;
                const defaultPostcardTemplate = { code: 1, thumbnail: postcardTemplates[1] };
                const newPostcard = { id: null, image: defaultImageUri, postcardTemplate: defaultPostcardTemplate, content: '', isSaved: false, isFavorite: false, tempId: Date.now().toString(), isEditMode: true, };
                setPostcards([newPostcard]);
                setCurrentIndex(0);
                setSelectedImage(defaultImageUri);
                setSelectedPostcard(defaultPostcardTemplate);
                setPostcardContent('');
                setIsSaved(false);
                setIsEditMode(true);
            }
        };

        fetchPostcards();
    }, [params.directoryId, params.directoryName, params.startDate, params.endDate, params.newlyCreated, params.postcardId]);

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
        setCurrentIndex(postcards.length);
        setSelectedImage(null);
        setSelectedPostcard(null);
        setPostcardContent('');
        setIsSaved(false);
        setIsEditMode(true);
        setIsTextEditing(false);
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

    // 글쓰기 기능 - 수정된 부분
    const handleWritePress = useCallback(() => {
        if (!isEditMode) {
            Alert.alert('알림', '편집 모드가 아닙니다. 편집 버튼을 눌러 편집 모드로 전환해주세요.');
            return;
        }
        if (selectedPostcard) {
            setIsTextWritingModalVisible(true); // 텍스트 쓰기 모달 열기
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
        // 현재 엽서의 content 업데이트
        setPostcards(prev => {
            const updated = [...prev];
            updated[currentIndex] = {
                ...updated[currentIndex],
                content: postcardContent
            };
            return updated;
        });
        setIsSaved(false); // 변경사항이 있으므로 저장되지 않은 상태로 변경
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
        // 1. 엽서의 현재 공유 상태를 확인합니다. (publicScope가 1이면 공유된 상태)
        const isCurrentlyPublic = Number(currentPostcard?.publicScope) === 1;

        // 2. 만약 이미 공유된 상태라면, '공유 취소' 로직
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

                                // 로컬 상태 업데이트
                                setPostcards(prev => {
                                    const updated = [...prev];
                                    const postcardToUpdate = updated.find(p => p.id === currentPostcard.id);
                                    if (postcardToUpdate) {
                                        postcardToUpdate.publicScope = 0; // 공유 취소 상태로 변경
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

        // 3. 공유되지 않은 상태라면 공유 페이지로 이동
        if (!currentPostcard?.id) {
            Alert.alert('알림', '공유할 엽서 정보를 찾을 수 없습니다.');
            return;
        }

        if (!directoryInfo || !directoryInfo.id) {
            Alert.alert('오류', '폴더 정보가 올바르지 않아 공유할 수 없습니다.');
            return;
        }

        // sharePost.js가 기대하는 형식에 맞게 엽서 객체를 생성합니다.
        const postcardToShare = {
            postcardId: currentPostcard.id,
            imageUrl: currentPostcard.image,
            postcardTypeId: currentPostcard.postcardTemplate?.code,
            content: currentPostcard.content
        };

        // sharePost.js는 엽서 배열의 JSON 문자열을 기대합니다.
        const selectedPostcardsJSON = JSON.stringify([postcardToShare]);

        const queryParams = {
            directoryId: directoryInfo.id,
            directoryTitle: directoryInfo.name, // 'directoryName' -> 'directoryTitle'
            startDate: directoryInfo.startDate,
            endDate: directoryInfo.endDate,
            selectedPostcards: selectedPostcardsJSON // 'selectedPostcardId' -> 'selectedPostcards'
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

    // 저장 버튼 활성화 조건
    const isSaveEnabled = selectedImage && selectedPostcard;

    const handleBackPress = () => {
        const defaultImageUri = null;
        const isDefaultImage = selectedImage === defaultImageUri;

        console.log('================================');
        console.log('뒤로가기 버튼 눌림 (상태 체크)');
        console.log(`1. 새로 만든 폴더인가? (params.newlyCreated):`, params.newlyCreated, `(예상값: 'true')`);
        console.log(`2. 엽서 개수가 1개인가? (postcards.length):`, postcards.length, `(예상값: 1)`);
        if (postcards[0]) {
            console.log(`3. 엽서가 저장되지 않은 상태인가? (!postcards[0].isSaved):`, !postcards[0].isSaved, `(예상값: true)`);
        } else {
            console.log(`3. 엽서가 없음 (postcards[0] is undefined)`);
        }
        console.log(`4. 폴더 ID가 있는가? (directoryInfo.id):`, directoryInfo.id, `(예상값: 숫자 또는 문자열 ID)`);
        console.log(`5. 이미지가 기본 이미지인가? (isDefaultImage):`, isDefaultImage, `(예상값: true)`);
        console.log('================================');

        if (
            params.newlyCreated === 'true' &&
            postcards.length === 1 &&
            postcards[0] && !postcards[0].isSaved &&
            directoryInfo.id &&
            isDefaultImage
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
                                await deleteFolderApi(directoryInfo.id);
                                router.back();
                            } catch (error) {
                                console.error("Failed to delete folder", error);
                                handleApiError(error, '폴더 삭제');
                            }
                        },
                    },
                ]
            );
        } else {
            router.back();
        }
    };

    const currentPostcard = postcards[currentIndex];
            
    return (
    <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                {/* 헤더 */}
                <PostDirectoryHeader
                    title={directoryInfo.name}
                    startDate={directoryInfo.startDate}
                    endDate={directoryInfo.endDate}
                    onBackPress={handleBackPress}
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
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    {/* 사진 업로드 영역 */}
                    <PhotoUploadArea
                        style={{ marginBottom: 20 }}
                        selectedImage={selectedImage}
                        onPickImage={pickImage}
                        isEditMode={isEditMode}
                    />

                    {/* 엽서 선택/표시 영역 */}
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
                </ScrollView>

                {/* 저장 버튼 또는 EditPostFloatingButtons */}
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

                {/* 텍스트 쓰기 모달 - 새로 추가된 부분 */}
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
});

export default WritePost;
