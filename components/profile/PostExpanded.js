import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ScrollView,
    Dimensions,
    Alert,
    ActivityIndicator,
    ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { toggleLikePostcard, toggleScrapPostcard, fetchPostcardDetailApi} from '../../utils/HomePostApi';
import { useRouter } from 'expo-router';
import EditPostFloatingButtons from '../../components/profile/EditPostFloatingButtons';
import { postcardTemplates, getPostcardOverlayStyle } from '../../utils/PostcardTemplates';
import { deletePostcardApi } from '../../utils/PostCardApi';
import { togglePostcardPublicScopeApi } from '../../utils/PostCardApi';

const { width, height } = Dimensions.get('window');

// 템플릿 이미지 가져오기 함수 (기존과 동일)
const getPostcardTemplate = (typeImageUrl) => {
    if (!typeImageUrl) return postcardTemplates[1];
    
    try {
        const match = typeImageUrl.match(/(\d+)\.png$/);
        if (match) {
            const templateNumber = parseInt(match[1], 10);
            return postcardTemplates[templateNumber] || postcardTemplates[1];
        }
        return postcardTemplates[1];
    } catch (error) {
        console.error('템플릿 이미지 가져오기 오류:', error);
        return postcardTemplates[1];
    }
};

// 날짜 포맷팅 함수 (기존과 동일)
const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    } catch (error) {
        console.error('날짜 포맷팅 오류:', error);
        return '';
    }
};

const PostExpanded = ({ visible, postData, onClose, onDataUpdate, currentUserId }) => {
    const router = useRouter(); 
    console.log('PostExpanded로 전달된 postData:', JSON.stringify(postData, null, 2));

    const [isLiked, setIsLiked] = useState(postData?.isLiked || false);
    const [isScraped, setIsScraped] = useState(postData?.isScraped || false);
    const [likeCount, setLikeCount] = useState(postData?.likeCount || 0);
    const [scrapCount, setScrapCount] = useState(postData?.scrapCount || 0);
    const [likeLoading, setLikeLoading] = useState(false);
    const [scrapLoading, setScrapLoading] = useState(false);

    const mockData = {
        profileImage: 'https://via.placeholder.com/50',
        postcardName: '부산의 바다 !',
        userName: '추리를봐야',
        location: '부산',
        date: '2021.03.04',
        postcardImage: 'https://via.placeholder.com/400x300',
        timeAgo: '5시간 전',
        likeCount: 23,
        scrapCount: 46,
        postcardContent: '',
        isLiked: false,
        isScraped: false,
        typeImageUrl: '../postcardType/1.png',
        ...postData
    };

    useEffect(() => {
        if (postData) {
            setIsLiked(postData.isLiked || false);
            setIsScraped(postData.isScraped || false);
            setLikeCount(postData.likeCount || 0);
            setScrapCount(postData.scrapCount || 0);
        }
    }, [postData]);

    const displayData = {
        postcardName: postData?.title || postData?.postcardName || mockData.postcardName,
        userName: postData?.author || postData?.userName || mockData.userName,
        location: postData?.location || mockData.location,
        date: postData?.visitDate 
            ? formatDate(postData.visitDate) 
            : (postData?.visitDate || mockData.date),
        postcardImage: postData?.image || postData?.imageUrl || postData?.postcardImage || mockData.postcardImage,
        postcardContent: postData?.content || postData?.postcardContent || mockData.postcardContent,
        templateImage: getPostcardTemplate(postData?.typeImageUrl || mockData.typeImageUrl),
        profileImage: postData?.profileImage || mockData.profileImage,
        // 템플릿 번호도 가져와서 상태에 저장
        templateNumber: postData?.typeImageUrl ? parseInt(postData.typeImageUrl.match(/(\d+)\.png$/)?.[1], 10) : 1
    };

    const handleLike = async () => {
        if (likeLoading) return;

        const postcardId = postData?.id; // PostDirectory에서 전달하는 필드명으로 변경
        if (!postcardId) {
            Alert.alert('오류', '게시물 정보를 찾을 수 없습니다.');
            return;
        }

        if (!currentUserId) {
            Alert.alert('알림', '로그인이 필요합니다.');
            return;
        }

        setLikeLoading(true);
        try {
            const result = await toggleLikePostcard(postcardId, isLiked, currentUserId);
            
            if (result.success) {
                const newIsLiked = !isLiked;
                const newLikeCount = newIsLiked 
                    ? likeCount + 1 
                    : Math.max(0, likeCount - 1);

                // 로컬 상태 업데이트
                setIsLiked(newIsLiked);
                setLikeCount(newLikeCount);

                // 부모 컴포넌트에 상태 업데이트 전달
                if (onDataUpdate) {
                    onDataUpdate(postcardId, 'like', isLiked);
                }
            } else {
                Alert.alert('오류', result.error || '좋아요 처리 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('좋아요 처리 오류:', error);
            Alert.alert('오류', '좋아요 처리 중 오류가 발생했습니다.');
        } finally {
            setLikeLoading(false);
        }
    };

    const handleScrap = async () => {
        if (scrapLoading) return;

        const postcardId = postData?.id; // PostDirectory에서 전달하는 필드명으로 변경
        if (!postcardId) {
            Alert.alert('오류', '게시물 정보를 찾을 수 없습니다.');
            return;
        }

        if (!currentUserId) {
            Alert.alert('알림', '로그인이 필요합니다.');
            return;
        }

        setScrapLoading(true);
        try {
            const result = await toggleScrapPostcard(postcardId, isScraped, currentUserId);
            
            if (result.success) {
                const newIsScraped = !isScraped;
                const newScrapCount = newIsScraped 
                    ? scrapCount + 1 
                    : Math.max(0, scrapCount - 1);

                // 로컬 상태 업데이트
                setIsScraped(newIsScraped);
                setScrapCount(newScrapCount);

                // 부모 컴포넌트에 상태 업데이트 전달
                if (onDataUpdate) {
                    onDataUpdate(postcardId, 'scrap', isScraped);
                }
            } else {
                Alert.alert('오류', result.error || '스크랩 처리 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('스크랩 처리 오류:', error);
            Alert.alert('오류', '스크랩 처리 중 오류가 발생했습니다.');
        } finally {
            setScrapLoading(false);
        }
    };

    // 로그인하지 않은 사용자를 위한 액션 핸들러
    const handleLoginRequired = () => {
        Alert.alert('알림', '로그인이 필요한 기능입니다.');
    };

    // ⭐ 4. 내 엽서 관리 버튼 핸들러 함수들 추가
    const handleEdit = () => {
        // 👇 postData.id -> postData.postcardId 로 수정
        // 👇 directoryId가 없는 경우에 대한 방어 코드 추가
        if (!postData?.postcardId || !postData?.directoryId) { 
            Alert.alert("오류", "엽서 또는 폴더 정보를 찾을 수 없어 수정할 수 없습니다.");
            return;
        }
        router.push({
            pathname: '/profile/writePost',
            params: { 
                postcardId: postData.postcardId, 
                directoryId: postData.directoryId,
                directoryName: postData.directoryName,
                startDate: postData.startDate,
                endDate: postData.endDate,
                directoryName: postData.directoryName
            }
        });
        onClose();
    };

    const handleDelete = () => {
        if (!postData?.postcardId) {
            Alert.alert("오류", "삭제할 엽서 정보를 찾을 수 없습니다.");
            return;
        }

        Alert.alert(
            "엽서 삭제",
            "정말로 이 엽서를 삭제하시겠습니까?",
            [
                { text: "취소", style: "cancel" },
                { 
                    text: "삭제", 
                    style: "destructive", 
                    onPress: async () => {
                        try {
                            await deletePostcardApi(postData.postcardId); // 👈 수정
                            
                            Alert.alert("삭제 완료", "엽서가 삭제되었습니다.");
                            
                            if (onDataUpdate) {
                                onDataUpdate(postData.postcardId, 'delete', null); // 👈 수정
                            }
                            onClose();
                        } catch (error) {
                            console.error("삭제 처리 오류:", error);
                            Alert.alert("오류", "엽서를 삭제하는 중 오류가 발생했습니다.");
                        }
                    } 
                }
            ]
        );
    };

    const handleDownload = () => {
        Alert.alert("준비 중", "다운로드 기능은 준비 중입니다.");
    };

    const handleShare = () => {
        // 1. 엽서의 현재 공유 상태를 확인합니다. (publicScope가 1이면 공유된 상태라고 가정)
        const isCurrentlyPublic = postData?.publicScope === 1;

        // 2. 만약 이미 공유된 상태라면, '공유 취소' 로직을 실행합니다.
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
                                // 엽서의 공개 상태를 토글하는 API를 호출합니다.
                                await togglePostcardPublicScopeApi(postData.postcardId);
                                
                                Alert.alert("성공", "엽서 공유가 취소되었습니다.");

                                // 부모 컴포넌트에 변경 사항을 알려 화면을 업데이트합니다.
                                if (onDataUpdate) {
                                    onDataUpdate(postData.postcardId, 'unshare', null);
                                }
                                onClose(); // 모달 닫기
                            } catch (error) {
                                console.error("공유 취소 오류:", error);
                                Alert.alert("오류", "공유를 취소하는 중 문제가 발생했습니다.");
                            }
                        }
                    }
                ]
            );
        } 
        // 3. 만약 공유되지 않은 상태라면, 기존처럼 '공유하기' 페이지로 이동합니다.
        else {
            if (!postData?.postcardId) {
                Alert.alert('알림', '공유할 엽서 정보를 찾을 수 없습니다.');
                return;
            }

            const queryParams = {
                directoryId: postData.directoryId,
                directoryName: postData.directoryName,
                startDate: postData.startDate,
                endDate: postData.endDate,
                selectedPostcardId: postData.postcardId
            };

            router.push({
                pathname: 'profile/sharePost',
                params: queryParams
            });
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <TouchableOpacity 
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />
                
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.postcardTitle}>{displayData.postcardName}</Text>
                
                <View style={styles.userInfo}>
                    <Image source={{ uri: displayData.profileImage }} style={styles.profileImage} />
                    <Text style={styles.userText}>
                        {displayData.userName} · {displayData.location} · {displayData.date}
                    </Text>
                </View>

                <View style={styles.imageSection}>
                    <Image source={{ uri: displayData.postcardImage }} style={styles.postcardImage} />
                </View>

                {/* 엽서 템플릿 배경에 내용 오버레이 */}
                <View style={styles.postcardSection}>
                    <ImageBackground
                        source={displayData.templateImage}
                        style={styles.postcardContainer}
                        resizeMode="contain"
                    >
                        {/* 2. getPostcardOverlayStyle 함수로 동적 스타일 적용 */}
                        <View style={getPostcardOverlayStyle(displayData.templateNumber)}>
                            <ScrollView style={styles.contentScrollArea} showsVerticalScrollIndicator={false}>
                                <Text style={styles.contentText}>{String(displayData.postcardContent || '')}</Text>
                            </ScrollView>
                            {/* 3. 날짜 텍스트를 오버레이 내부에 배치 */}
                            <Text style={styles.dateText}>{displayData.date}</Text>
                        </View>
                    </ImageBackground>
                </View>
                
                <View style={styles.actionSection}>
                    <EditPostFloatingButtons
                        onDelete={handleDelete}
                        onDownload={handleDownload}
                        onShare={handleShare}
                        onEdit={handleEdit}
                        isFavorite={postData?.isFavorite || false}
                        isPublic={postData?.publicScope === 1}
                    />
                </View>
                
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    header: {
        position: 'absolute',
        top: 100,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        zIndex: 10,
    },
    closeButton: {
        position: 'absolute',
        right: 30,
        padding: 5,
    },
    contentContainer: {
        width: width * 0.9,
        maxHeight: height * 0.8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 60,
    },
    postcardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingVertical: 20,
        color: '#fff',
        marginBottom: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        justifyContent: 'flex-start',
        width: '100%',
        paddingLeft: 30,
    },
    profileImage: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginRight: 10,
    },
    userText: {
        flex: 1,
        fontSize: 14,
        color: '#fff',
    },
    imageSection: {
        paddingHorizontal: 15,
        paddingTop: 12,
        marginBottom: 12,
    },
    postcardImage: {
        width: width * 0.85,
        height: width / 1.48 * 0.85,
        resizeMode: 'cover',
    },
    postcardSection: {
        paddingHorizontal: 15,
        paddingBottom: 15,
        marginBottom: 8,
    },
    postcardContainer: {
        width: width * 0.85,
        height: width / 1.48 * 0.85,
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    contentScrollArea: {
        flex: 1,
        marginVertical: 8,
    },
    contentText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 18,
        textAlign: 'left',
    },
    dateText: {
        fontSize: 11,
        color: '#666',
        textAlign: 'right',
        marginTop: 8,
    },
    actionSection: {
        width: '100%',
        alignItems: 'center',
    },
    actionButton: {
        alignItems: 'center',
    },
    actionButtonDisabled: {
        opacity: 0.7,
    },
    actionIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    actionCount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    actionText: {
        fontSize: 14,
        color: '#fff',
        marginTop: 4,
    },
});

export default PostExpanded;