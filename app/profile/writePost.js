import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Image, Alert, Modal } from "react-native";
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import PostDirectoryHeader from "../../components/profile/PostDirectoryHeader";
import SaveButton from "../../components/profile/SaveButton";
import EditPostFloatingButtons from "../../components/profile/EditPostFloatingButtons";
import SelectPostDesign from "../../components/profile/selectPostDesign"; // 모달로 사용할 컴포넌트

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
    
    // 모달 상태 추가
    const [isPostcardModalVisible, setIsPostcardModalVisible] = useState(false);
    // 엽서 오버레이 상태 추가
    const [isPostcardOverlayVisible, setIsPostcardOverlayVisible] = useState(false);
    // 저장 완료 상태 추가 (전체 엽서 저장 상태)
    const [isSaved, setIsSaved] = useState(false);
    // 편집 모드 상태 추가
    const [isEditMode, setIsEditMode] = useState(true);

    // 전달받은 디렉토리 정보 설정 - 한 번만 실행
    useEffect(() => {
        console.log('useEffect running - params changed:', params);
        
        if (params && (params.directoryId || params.directoryName || params.startDate || params.endDate)) {
            const startDate = params.startDate ? new Date(params.startDate) : null;
            const endDate = params.endDate ? new Date(params.endDate) : null;
            
            setDirectoryInfo(prev => {
                // 이미 같은 데이터가 설정되어 있으면 업데이트하지 않음
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

    // 날짜 포맷팅 함수 - useCallback으로 메모이제이션
    const formatDate = useCallback((date) => {
        if (!date) return '';
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${month}.${day}`;
    }, []);

    // 갤러리에서 이미지 선택
    const pickImage = useCallback(async () => {
        // 편집 모드가 아니거나 저장이 완료된 상태에서는 이미지 선택 불가
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
                
                // 현재 엽서에 이미지 저장
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
        // 편집 모드가 아니거나 저장이 완료된 상태에서는 새 엽서 추가 불가
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
        // 편집 모드가 아니거나 저장이 완료된 상태에서는 엽서 선택 불가
        if (!isEditMode || isSaved) {
            Alert.alert('알림', '편집 모드가 아닙니다. 편집 버튼을 눌러 편집 모드로 전환해주세요.');
            return;
        }

        if (selectedPostcard) {
            // 이미 엽서가 선택되어 있으면 오버레이 표시
            setIsPostcardOverlayVisible(true);
        } else {
            // 엽서가 선택되지 않았으면 바로 선택 모달 열기
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
        
        // 현재 엽서에 선택된 템플릿 저장
        setPostcards(prev => {
            const updated = [...prev];
            updated[currentIndex] = {
                ...updated[currentIndex],
                postcardTemplate: selectedDesignData
            };
            return updated;
        });
        
        // 모달 닫기
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

    // 엽서 템플릿 렌더링 함수
    const renderPostcardTemplate = useCallback((template) => {
        if (!template) return null;

        return (
            <View style={[styles.postcardTemplate, { backgroundColor: template.color }]}>
                <Text style={styles.postcardTitle}>Postcard</Text>
                <View style={styles.postcardContent}>
                    <View style={styles.postcardLeft} />
                    <View style={styles.postcardRight}>
                        {template.tab === 'Line' && (
                            <>
                                <View style={styles.templateLine} />
                                <View style={styles.templateLine} />
                                <View style={styles.templateLine} />
                                <View style={styles.templateLine} />
                            </>
                        )}
                        {template.tab === 'Plain' && (
                            <View style={styles.templatePlainArea} />
                        )}
                        {template.tab === 'Image' && (
                            <View style={styles.templateImageArea}>
                                <Text style={styles.templateImageText}>Image</Text>
                            </View>
                        )}
                    </View>
                </View>
                <Text style={styles.postcardBottom}>This side for message</Text>
            </View>
        );
    }, []);

    // 엽서 오버레이 렌더링
    const renderPostcardOverlay = useCallback(() => {
        if (!isPostcardOverlayVisible) return null;

        return (
            <TouchableOpacity 
                style={styles.overlay}
                activeOpacity={1}
                onPress={handleOverlayClose}
            >
                <View style={styles.overlayContent}>
                    <TouchableOpacity 
                        style={styles.overlayOption}
                        onPress={handlePostcardSelect}
                    >
                        <Feather name="edit" size={24} color="#fff" />
                        <Text style={styles.overlayOptionText}>엽서 변경</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.overlayOption}
                        onPress={() => {
                            // 글쓰기 기능 (필요시 구현)
                            setIsPostcardOverlayVisible(false);
                        }}
                    >
                        <Feather name="edit-3" size={24} color="#fff" />
                        <Text style={styles.overlayOptionText}>글쓰기</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.overlayOption}
                        onPress={() => {
                            // 그리기 기능 (필요시 구현)
                            setIsPostcardOverlayVisible(false);
                        }}
                    >
                        <Feather name="pen-tool" size={24} color="#fff" />
                        <Text style={styles.overlayOptionText}>그리기</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    }, [isPostcardOverlayVisible, handleOverlayClose, handlePostcardSelect]);

    // 저장 기능 - 현재 엽서만 저장
    const handleSave = useCallback(() => {
        if (selectedImage && selectedPostcard) {
            console.log('현재 엽서 저장:', {
                index: currentIndex,
                image: selectedImage,
                postcard: selectedPostcard
            });
            
            // 현재 엽서를 저장된 상태로 표시
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
            setIsEditMode(false); // 저장 후 편집 모드 비활성화
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
                        // 현재 엽서만 삭제
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

    // 저장 버튼 활성화 조건 - 현재 엽서가 완성되었는지 확인
    const isSaveEnabled = selectedImage && selectedPostcard;

    return (
        <View style={styles.container}>
            {/* 헤더 - 디렉토리 정보 사용, 오른쪽 버튼 숨김 */}
            <PostDirectoryHeader
                title={directoryInfo.name}
                startDate={directoryInfo.startDate ? `2021.${formatDate(directoryInfo.startDate)}` : '2021.03.04'}
                endDate={directoryInfo.endDate ? formatDate(directoryInfo.endDate) : '03.06'}
                onBackPress={() => router.back()}
                showActionButton={false}
            />

            {/* 엽서 슬라이드 영역 */}
            <View style={styles.slideContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.slideContent}
                >
                    {postcards.map((postcard, index) => (
                        <TouchableOpacity
                            key={postcard.id}
                            style={[
                                styles.slideItem,
                                currentIndex === index && styles.slideItemActive
                            ]}
                            onPress={() => selectPostcard(index)}
                        >
                            {postcard.image ? (
                                <View style={styles.slideImageContainer}>
                                    <Image source={{ uri: postcard.image }} style={styles.slideImage} />
                                    {currentIndex === index && (
                                        <View style={styles.checkmark}>
                                            <Feather name="check" size={16} color="#fff" />
                                        </View>
                                    )}
                                </View>
                            ) : (
                                <View style={styles.slideEmpty}>
                                    {currentIndex === index && (
                                        <View style={styles.checkmark}>
                                            <Feather name="check" size={16} color="#fff" />
                                        </View>
                                    )}
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                    
                    {/* 새 엽서 추가 버튼 - 편집 모드일 때만 활성화 */}
                    <TouchableOpacity 
                        style={[
                            styles.addButton,
                            (!isEditMode || isSaved) && styles.addButtonDisabled
                        ]} 
                        onPress={addNewPostcard}
                        disabled={!isEditMode || isSaved}
                    >
                        <Feather 
                            name="plus" 
                            size={24} 
                            color="#999"
                        />
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* 메인 컨텐츠 영역 */}
            <View style={styles.contentContainer}>
                {/* 사진 추가 영역 */}
                <TouchableOpacity 
                    style={[
                        styles.photoArea,
                        selectedImage && styles.photoAreaSelected
                    ]} 
                    onPress={pickImage}
                    disabled={!isEditMode || isSaved}
                >
                    {selectedImage ? (
                        <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                    ) : (
                        <View style={styles.photoPlaceholder}>
                            <Feather 
                                name="camera" 
                                size={32} 
                                color="#999"
                            />
                            <Text style={styles.photoText}>
                                사진 추가
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* 엽서 선택 영역 */}
                <TouchableOpacity 
                    style={[
                        styles.postcardArea,
                        selectedPostcard && styles.postcardAreaSelected
                    ]} 
                    onPress={handlePostcardAreaPress}
                    disabled={!isEditMode || isSaved}
                >
                    {selectedPostcard ? (
                        <View style={styles.postcardContainer}>
                            {renderPostcardTemplate(selectedPostcard)}
                            {renderPostcardOverlay()}
                        </View>
                    ) : (
                        <View style={styles.postcardPlaceholder}>
                            <Feather 
                                name="file-text" 
                                size={32} 
                                color="#999"
                            />
                            <Text style={styles.postcardText}>
                                엽서 선택
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
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
    slideContainer: {
        paddingVertical: 16,
        backgroundColor: '#fff',
    },
    slideContent: {
        paddingHorizontal: 16,
        gap: 12,
    },
    slideItem: {
        width: 100,
        height: 80,
        backgroundColor: '#f5f5f5',
        borderWidth: 2,
        borderColor: 'transparent',
        overflow: 'hidden',
    },
    slideItemActive: {
        borderColor: '#007AFF',
    },
    slideItemDisabled: {
        // 삭제된 스타일 - 더 이상 사용하지 않음
    },
    slideImageContainer: {
        flex: 1,
        position: 'relative',
    },
    slideImage: {
        width: '100%',
        height: '100%',
    },
    slideEmpty: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        position: 'relative',
    },
    checkmark: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        width: 100,
        height: 80,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonDisabled: {
        backgroundColor: '#f9f9f9',
    },
    contentContainer: {
        flex: 1,
        padding: 16,
        gap: 16,
    },
    photoArea: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fafafa',
        minHeight: 200,
        position: 'relative',
    },
    photoAreaSelected: {
        borderStyle: 'solid',
        borderColor: 'transparent',
        backgroundColor: 'transparent',
    },
    photoAreaDisabled: {
        // 삭제된 스타일 - 더 이상 사용하지 않음
    },
    photoPlaceholder: {
        alignItems: 'center',
        gap: 8,
    },
    photoText: {
        fontSize: 16,
        color: '#999',
        fontWeight: '500',
    },
    selectedImage: {
        width: '100%',
        height: '100%',
    },
    postcardArea: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fafafa',
        minHeight: 200,
        position: 'relative',
    },
    postcardAreaSelected: {
        borderStyle: 'solid',
        borderColor: 'transparent',
        backgroundColor: 'transparent',
    },
    postcardAreaDisabled: {
        // 삭제된 스타일 - 더 이상 사용하지 않음
    },
    postcardContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    postcardPlaceholder: {
        alignItems: 'center',
        gap: 8,
    },
    postcardText: {
        fontSize: 16,
        color: '#999',
        fontWeight: '500',
    },
    disabledText: {
        // 삭제된 스타일 - 더 이상 사용하지 않음
    },
    disabledOverlay: {
        // 삭제된 스타일 - 더 이상 사용하지 않음
    },
    saveButtonContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    floatingButtons: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    // 엽서 템플릿 스타일
    postcardTemplate: {
        width: '100%',
        height: '100%',
        padding: 16,
        justifyContent: 'space-between',
    },
    postcardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    postcardContent: {
        flex: 1,
        flexDirection: 'row',
        marginVertical: 12,
        gap: 12,
    },
    postcardLeft: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 6,
    },
    postcardRight: {
        flex: 1,
        justifyContent: 'center',
        gap: 6,
    },
    templateLine: {
        height: 2,
        backgroundColor: '#666',
        marginVertical: 3,
    },
    templatePlainArea: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 6,
    },
    templateImageArea: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    templateImageText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    postcardBottom: {
        fontSize: 10,
        color: '#666',
        textAlign: 'center',
    },
    // 오버레이 스타일
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    overlayContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 40,
    },
    overlayOption: {
        alignItems: 'center',
        gap: 8,
    },
    overlayOptionText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default WritePost;