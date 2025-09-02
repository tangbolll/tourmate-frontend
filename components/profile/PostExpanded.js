import React, { useState, useEffect } from 'react';
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

const { width, height } = Dimensions.get('window');

// 로컬 템플릿 이미지 매핑
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

// 템플릿 이미지 가져오기 함수
const getPostcardTemplate = (typeImageUrl) => {
    if (!typeImageUrl) return postcardTemplates[1]; // 기본 템플릿
    
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

// 날짜 포맷팅 함수
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

const PostExpanded = ({ 
    visible, 
    postData, 
    onClose, 
    onDataUpdate, 
    currentUserId 
}) => {
    // 서버에서 받은 데이터를 기반으로 초기 상태 설정
    const [isLiked, setIsLiked] = useState(postData?.isLiked || false);
    const [isScraped, setIsScraped] = useState(postData?.isScraped || false);
    const [likeCount, setLikeCount] = useState(postData?.likeCount || 0);
    const [scrapCount, setScrapCount] = useState(postData?.scrapCount || 0);
    const [likeLoading, setLikeLoading] = useState(false);
    const [scrapLoading, setScrapLoading] = useState(false);

        // detail 데이터 상태
    const [detailData, setDetailData] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // 목 데이터 (fallback용)
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
        postcardContent: '부산에다녀왔다\n넘즐거웠다\n엽서디자인 아직 안 넣었습니다 임시입니다\n놀래지마세용',
        isLiked: false,
        isScraped: false,
        typeImageUrl: '../postcardType/1.png', // 기본 템플릿
        ...postData
    };

    useEffect(() => {
    if (visible && postData?.postcardId && !detailData) {
        loadDetailData();
    }
    }, [visible, postData?.postcardId]);

        // detail 데이터 로드
    const loadDetailData = async () => {
        setDetailLoading(true);
        try {
            const result = await fetchPostcardDetailApi(postData.postcardId);
            if (result.success) {
                setDetailData(result.data);
            } else {
                console.warn('Detail 로드 실패:', result.error);
                // 실패해도 기본 데이터로 표시
            }
        } catch (error) {
            console.error('Detail 로드 오류:', error);
            // 에러가 나도 기본 데이터로 표시
        } finally {
            setDetailLoading(false);
        }
    };

    // 실제 표시할 데이터 (서버 데이터가 있으면 서버 데이터 우선)
    const displayData = {
        postcardName: detailData?.title || postData?.title || postData?.postcardName || mockData.postcardName,
        userName: detailData?.author || postData?.author || postData?.userName || mockData.userName,
        location: detailData?.location || postData?.location || mockData.location,
        date: detailData?.createdAt 
            ? formatDate(detailData.createdAt) 
            : (postData?.createdAt ? formatDate(postData.createdAt) : (postData?.date || mockData.date)),
        postcardImage: detailData?.imageUrl || postData?.imageUrl || postData?.postcardImage || mockData.postcardImage,
        postcardContent: detailData?.content || postData?.content || postData?.postcardContent || mockData.postcardContent,
        templateImage: getPostcardTemplate(detailData?.typeImageUrl || postData?.typeImageUrl || mockData.typeImageUrl),
        profileImage: postData?.profileImage || mockData.profileImage,
    };



    // postData가 변경될 때마다 상태 동기화 (서버 데이터 우선)
    useEffect(() => {
        if (postData) {
            setIsLiked(postData.isLiked || false);
            setIsScraped(postData.isScraped || false);
            setLikeCount(postData.likeCount || mockData.likeCount);
            setScrapCount(postData.scrapCount || mockData.scrapCount);
        }
    }, [postData?.postcardId, postData?.isLiked, postData?.isScraped, postData?.likeCount, postData?.scrapCount]);

    const handleLike = async () => {
        if (likeLoading) return;

        const postcardId = postData?.postcardId || mockData.postcardId;
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

        const postcardId = postData?.postcardId || mockData.postcardId;
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

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                {/* 마스크 배경 */}
                <TouchableOpacity 
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />
                
                {/* 상단 헤더 */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* 메인 콘텐츠 */}
                <View style={styles.contentContainer}>
                    {/* 엽서 제목 */}
                    <Text style={styles.postcardTitle}>{displayData.postcardName}</Text>
                    
                    {/* 사용자 정보 */}
                    <View style={styles.userInfo}>
                        <Image source={{ uri: displayData.profileImage }} style={styles.profileImage} />
                        <Text style={styles.userText}>
                            {displayData.userName} · {displayData.location} · {displayData.date}
                        </Text>
                    </View>

                    {/* 엽서 이미지 */}
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
                            <View style={styles.postcardOverlay}>
                                <ScrollView style={styles.contentScrollArea} showsVerticalScrollIndicator={false}>
                                    <Text style={styles.contentText}>{displayData.postcardContent}</Text>
                                </ScrollView>
                            </View>
                        </ImageBackground>
                    </View>

                    {/* 하단 액션 버튼 */}
                    <View style={styles.actionSection}>
                        {/* 좋아요 버튼 */}
                        <TouchableOpacity 
                            style={[styles.actionButton, likeLoading && styles.actionButtonDisabled]} 
                            onPress={currentUserId ? handleLike : handleLoginRequired}
                            disabled={likeLoading}
                        >
                            <View style={styles.actionIcon}>
                                {likeLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Ionicons 
                                        name={isLiked ? "heart" : "heart-outline"} 
                                        size={28} 
                                        color={isLiked ? "white" : "#fff"} 
                                    />
                                )}
                            </View>
                            <Text style={styles.actionCount}>{likeCount}</Text>
                        </TouchableOpacity>
                        
                        {/* 스크랩 버튼 */}
                        <TouchableOpacity 
                            style={[styles.actionButton, scrapLoading && styles.actionButtonDisabled]} 
                            onPress={currentUserId ? handleScrap : handleLoginRequired}
                            disabled={scrapLoading}
                        >
                            <View style={styles.actionIcon}>
                                {scrapLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Ionicons 
                                        name={isScraped ? "bookmark" : "bookmark-outline"} 
                                        size={28} 
                                        color={isScraped ? "white" : "#fff"} 
                                    />
                                )}
                            </View>
                            <Text style={styles.actionCount}>{scrapCount}</Text>
                        </TouchableOpacity>
                    </View>
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
        paddingVertical: 15,
        color: '#fff',
        marginBottom: 10,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
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
    postcardOverlay: {
        width: '80%',
        height: '70%',
        padding: 20,
        justifyContent: 'space-between',
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
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 40,
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
});

export default PostExpanded;