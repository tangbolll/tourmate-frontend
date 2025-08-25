import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PostExpanded from './PostExpanded';
import Report from './Report';
import { likePostcardApi, bookmarkPostcardApi } from '../../utils/HomePostApi';

const defaultProfile = require('../../assets/defaultProfile2.png');

const Post = ({ postData, onDataUpdate }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [showExpanded, setShowExpanded] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [currentLikeCount, setCurrentLikeCount] = useState(postData?.likeCount || 0);
    const [currentScrapCount, setCurrentScrapCount] = useState(postData?.scrapCount || 0);

    // 실제 데이터가 없으면 기본값 사용
    const data = {
        postcardId: postData?.postcardId,
        title: postData?.title || '제목 없음',
        imageUrl: postData?.imageUrl,
        author: postData?.author || '알 수 없음',
        likeCount: currentLikeCount,
        scrapCount: currentScrapCount,
        timeAgo: '방금 전', // 서버에서 시간 데이터가 없어서 임시
        location: '위치 정보 없음', // 서버에서 위치 데이터가 없어서 임시
        date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'), // 임시 날짜
    };

    const handleLike = async () => {
        if (!data.postcardId) return;

        try {
            const result = await likePostcardApi(data.postcardId);
            
            if (result.success) {
                setIsLiked(!isLiked);
                setCurrentLikeCount(prev => isLiked ? prev - 1 : prev + 1);
                
                // 부모 컴포넌트에 데이터 업데이트 알림
                if (onDataUpdate) {
                    onDataUpdate(data.postcardId, 'like', !isLiked);
                }
            } else {
                Alert.alert('오류', result.error);
            }
        } catch (error) {
            console.error('좋아요 처리 오류:', error);
            Alert.alert('오류', '좋아요 처리 중 오류가 발생했습니다.');
        }
    };

    const handleBookmark = async () => {
        if (!data.postcardId) return;

        try {
            const result = await bookmarkPostcardApi(data.postcardId);
            
            if (result.success) {
                setIsBookmarked(!isBookmarked);
                setCurrentScrapCount(prev => isBookmarked ? prev - 1 : prev + 1);
                
                // 부모 컴포넌트에 데이터 업데이트 알림
                if (onDataUpdate) {
                    onDataUpdate(data.postcardId, 'bookmark', !isBookmarked);
                }
            } else {
                Alert.alert('오류', result.error);
            }
        } catch (error) {
            console.error('북마크 처리 오류:', error);
            Alert.alert('오류', '북마크 처리 중 오류가 발생했습니다.');
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

    return (
        <View style={styles.container}>
            {/* 헤더 */}
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <Image 
                        source={defaultProfile} // 임시로 기본 프로필 이미지 사용
                        style={styles.profileImage} 
                    />
                    <View style={styles.userDetails}>
                        <Text style={styles.postcardName}>{data.title}</Text>
                        <Text style={styles.userLocation}>
                            {data.author} · {data.location} · {data.date}
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
                        onPress={handleReport}
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
                    <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                        <Ionicons 
                            name={isLiked ? "heart" : "heart-outline"} 
                            size={24} 
                            color={isLiked ? "#ff4757" : "#666"} 
                        />
                        <Text style={styles.actionText}>{currentLikeCount}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={handleBookmark}>
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
    actionText: {
        marginLeft: 4,
        fontSize: 14,
        color: '#666',
    },
});

export default Post;