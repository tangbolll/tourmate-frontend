import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PostExpanded from './PostExpanded';
import Report from './Report';
import { toggleLikePostcard, toggleScrapPostcard } from '../../utils/HomePostApi';
import { formatChatTimestamp, formatPostDate } from '../../utils/timeUtils';
import { useAuth } from '../../context/AuthContext';
import Constants from 'expo-constants';
// dayjs 한국 시간대 설정 추가
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

// dayjs 플러그인 설정
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('ko');

const defaultProfile = require('../../assets/defaultprofile.png');

// API 베이스 URL 설정

const getFullImageUrl = (imagePath) => {
    if (!imagePath || imagePath.startsWith('http')) {
        return imagePath;
    }
    return `${API_URL}${imagePath}`;
};

const Post = ({ postData, onDataUpdate }) => {
    const { currentUserId } = useAuth();
    // 서버에서 받은 데이터를 기반으로 초기 상태 설정
    const [isLiked, setIsLiked] = useState(postData?.isLiked || false);
    const [isBookmarked, setIsBookmarked] = useState(postData?.isScraped || false);
    const [showExpanded, setShowExpanded] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [currentLikeCount, setCurrentLikeCount] = useState(postData?.likeCount || 0);
    const [currentScrapCount, setCurrentScrapCount] = useState(postData?.scrapCount || 0);
    const [likeLoading, setLikeLoading] = useState(false);
    const [scrapLoading, setScrapLoading] = useState(false);

    // postData 변경 시 상태 동기화 (서버 데이터 우선)
    useEffect(() => {
        if (postData) {
            setIsLiked(postData.isLiked || false);
            setIsBookmarked(postData.isScraped || false);
            setCurrentLikeCount(postData.likeCount || 0);
            setCurrentScrapCount(postData.scrapCount || 0);
        }
    }, [postData?.postcardId, postData?.isLiked, postData?.isScraped, postData?.likeCount, postData?.scrapCount]);

    // 실제 데이터가 없으면 기본값 사용
    const data = {
        postcardId: postData?.postcardId,
        title: postData?.title || '제목 없음',
        imageUrl: postData?.imageUrl,
        author: postData?.author || '알 수 없음',
        likeCount: currentLikeCount,
        scrapCount: currentScrapCount,
        // UTC 시간을 한국 시간으로 변환
        timeAgo: postData?.createdAt ? formatChatTimestamp(dayjs.utc(postData.createdAt).tz('Asia/Seoul').toDate()) : '알 수 없음',
        location: postData?.location,
        // UTC 시간을 한국 시간으로 변환
        date: formatPostDate(dayjs.utc(postData?.createdAt).tz('Asia/Seoul').toDate()),
        isLiked: isLiked,
        isScraped: isBookmarked,
    };

    const handleLike = async () => {
        if (!data.postcardId || likeLoading) return;

        if (!currentUserId) {
            Alert.alert('알림', '로그인이 필요합니다.');
            return;
        }

        setLikeLoading(true);
        try {
            const result = await toggleLikePostcard(data.postcardId, isLiked, currentUserId);
            
            if (result.success) {
                const newIsLiked = !isLiked;
                setIsLiked(newIsLiked);
                setCurrentLikeCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));
                
                // 부모 컴포넌트에 데이터 업데이트 알림
                if (onDataUpdate) {
                    onDataUpdate(data.postcardId, 'like', isLiked);
                }
            } else {
                Alert.alert('오류', result.error);
            }
        } catch (error) {
            console.error('좋아요 처리 오류:', error);
            Alert.alert('오류', '좋아요 처리 중 오류가 발생했습니다.');
        } finally {
            setLikeLoading(false);
        }
    };

    const handleBookmark = async () => {
        if (!data.postcardId || scrapLoading) return;

        if (!currentUserId) {
            Alert.alert('알림', '로그인이 필요합니다.');
            return;
        }

        setScrapLoading(true);
        try {
            const result = await toggleScrapPostcard(data.postcardId, isBookmarked, currentUserId);
            
            if (result.success) {
                const newIsBookmarked = !isBookmarked;
                setIsBookmarked(newIsBookmarked);
                setCurrentScrapCount(prev => newIsBookmarked ? prev + 1 : Math.max(0, prev - 1));
                
                // 부모 컴포넌트에 데이터 업데이트 알림 (scrap으로 전달)
                if (onDataUpdate) {
                    onDataUpdate(data.postcardId, 'scrap', isBookmarked);
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

    const handleReport = () => {
        setShowDropdown(false);
        setShowReport(true);
    };

    const handleReportSubmit = (reportData) => {
        setShowReport(false);
        Alert.alert('신고 완료', '신고가 접수되었습니다.');
    };

    const handleDataUpdateFromExpanded = (postcardId, actionType, currentValue) => {
        // PostExpanded에서 전달받은 업데이트를 로컬 상태에 반영
        if (actionType === 'like') {
            const newIsLiked = !currentValue;
            setIsLiked(newIsLiked);
            setCurrentLikeCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));
        } else if (actionType === 'scrap') {
            const newIsBookmarked = !currentValue;
            setIsBookmarked(newIsBookmarked);
            setCurrentScrapCount(prev => newIsBookmarked ? prev + 1 : Math.max(0, prev - 1));
        }
        
        // 부모 컴포넌트에도 전달
        if (onDataUpdate) {
            onDataUpdate(postcardId, actionType, currentValue);
        }
    };

    // 로그인하지 않은 사용자를 위한 액션 핸들러
    const handleLoginRequired = () => {
        Alert.alert('알림', '로그인이 필요한 기능입니다.');
    };
    
    // 위치 정보가 없을 때 표시할 문자열
    const authorAndDate = `${data.author} · ${data.date}`;
    // 위치 정보가 있을 때 표시할 문자열
    const fullUserInfo = `${data.author} · ${data.location} · ${data.date}`;
    

    return (
        <View style={styles.container}>
            {/* 헤더 */}
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <Image 
                        source={postData.profileImage ? { uri: getFullImageUrl(postData.profileImage) } : defaultProfile}
                        style={styles.profileImage} 
                    />
                    <View style={styles.userDetails}>
                        <Text style={styles.postcardName}>{data.title}</Text>
                        <Text style={styles.userLocation}>
                            {data.location ? fullUserInfo : authorAndDate}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity 
                    style={styles.moreButton}
                    onPress={() => setShowDropdown(!showDropdown)}
                >
                    <Ionicons name="ellipsis-vertical" size={24} color="#666" />
                </TouchableOpacity>
            </View>

            {/* 드롭다운 메뉴 */}
            {showDropdown && (
                <View style={styles.dropdown}>
                    <TouchableOpacity 
                        style={styles.dropdownItem}
                        onPress={currentUserId ? handleReport : handleLoginRequired}
                    >
                        <Text style={styles.dropdownText}>신고하기</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* 엽서 이미지 */}
            <View style={styles.imageContainer}>
                {data.imageUrl ? (
                    <Image 
                        source={{ uri: data.imageUrl }} 
                        style={styles.postcardImage} 
                        onError={() => console.log('이미지 로드 실패:', data.imageUrl)}
                    />
                ) : (
                    <View style={[styles.postcardImage, styles.noImageContainer]}>
                        <Text style={styles.noImageText}>이미지 없음</Text>
                    </View>
                )}
                <TouchableOpacity 
                    style={styles.expandButton}
                    onPress={() => setShowExpanded(true)}
                >
                    <Ionicons name="expand" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* 하단 정보 */}
            <View style={styles.footer}>
                <Text style={styles.timeAgo}>{data.timeAgo}</Text>
                <View style={styles.actions}>
                    <TouchableOpacity 
                        style={[styles.actionButton, likeLoading && styles.actionButtonDisabled]} 
                        onPress={currentUserId ? handleLike : handleLoginRequired}
                        disabled={likeLoading}
                    >
                        <Ionicons 
                            name={isLiked ? "heart" : "heart-outline"} 
                            size={24} 
                            color={isLiked ? "#ff4757" : "#666"} 
                        />
                        <Text style={styles.actionText}>{currentLikeCount}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.actionButton, scrapLoading && styles.actionButtonDisabled]} 
                        onPress={currentUserId ? handleBookmark : handleLoginRequired}
                        disabled={scrapLoading}
                    >
                        <Ionicons 
                            name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                            size={24} 
                            color={isBookmarked ? "#3742fa" : "#666"} 
                        />
                        <Text style={styles.actionText}>{currentScrapCount}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 확대 모달 */}
            <PostExpanded 
                visible={showExpanded}
                postData={data}
                onClose={() => setShowExpanded(false)}
                onDataUpdate={handleDataUpdateFromExpanded}
                currentUserId={currentUserId}
            />

            {/* 신고 모달 */}
            <Report 
                visible={showReport}
                onClose={() => setShowReport(false)}
                onSubmit={handleReportSubmit}
                postcardId={data.postcardId}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    userDetails: {
        flex: 1,
    },
    postcardName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    userLocation: {
        fontSize: 12,
        color: '#666',
    },
    moreButton: {
        padding: 4,
    },
    dropdown: {
        position: 'absolute',
        top: 70,
        right: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 1000,
    },
    dropdownItem: {
        padding: 12,
        minWidth: 100,
    },
    dropdownText: {
        fontSize: 14,
        color: '#333',
    },
    imageContainer: {
        position: 'relative',
    },
    postcardImage: {
        width: '100%',
        height: 250,
        resizeMode: 'cover',
    },
    noImageContainer: {
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    noImageText: {
        color: '#999',
        fontSize: 14,
    },
    expandButton: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 20,
        padding: 8,
    },
    footer: {
        padding: 16,
        paddingTop: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    timeAgo: {
        fontSize: 12,
        color: '#999',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
    },
    actionButtonDisabled: {
        opacity: 0.7,
    },
    actionText: {
        marginLeft: 4,
        fontSize: 14,
        color: '#666',
    },
});

export default Post;