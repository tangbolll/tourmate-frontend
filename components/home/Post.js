import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PostExpanded from './PostExpanded';
import Report from './Report';

const Post = ({ postData }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [showExpanded, setShowExpanded] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showReport, setShowReport] = useState(false);

    // 임시 데이터 (서버 연동 전)
    const tempData = {
        profileImage: 'https://via.placeholder.com/50',
        postcardName: '부산의 바다',
        userName: '추리를봐야',
        location: '부산',
        date: '2021.03.06',
        postcardImage: 'https://via.placeholder.com/400x300',
        timeAgo: '5시간 전',
        likeCount: 23,
        bookmarkCount: 46,
        ...postData
    };

    const handleLike = () => {
        setIsLiked(!isLiked);
        // 좋아요 API 호출 로직 추가 예정
    };

    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
        // 북마크 API 호출 로직 추가 예정
    };

    const handleReport = () => {
        setShowDropdown(false);
        setShowReport(true);
    };

    const handleReportSubmit = (reportData) => {
        setShowReport(false);
        Alert.alert('신고 완료', '신고가 접수되었습니다.');
        // 신고 API 호출 로직 추가 예정
    };

    return (
        <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
            <View style={styles.userInfo}>
            <Image source={{ uri: tempData.profileImage }} style={styles.profileImage} />
            <View style={styles.userDetails}>
                <Text style={styles.postcardName}>{tempData.postcardName}</Text>
                <Text style={styles.userLocation}>
                {tempData.userName} · {tempData.location} · {tempData.date}
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
            <Image source={{ uri: tempData.postcardImage }} style={styles.postcardImage} />
            <TouchableOpacity 
            style={styles.expandButton}
            onPress={() => setShowExpanded(true)}
            >
            <Ionicons name="expand" size={20} color="#fff" />
            </TouchableOpacity>
        </View>

        {/* 하단 정보 */}
        <View style={styles.footer}>
            <Text style={styles.timeAgo}>{tempData.timeAgo}</Text>
            <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={24} 
                color={isLiked ? "#ff4757" : "#666"} 
                />
                <Text style={styles.actionText}>{tempData.likeCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleBookmark}>
                <Ionicons 
                name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color={isBookmarked ? "#3742fa" : "#666"} 
                />
                <Text style={styles.actionText}>{tempData.bookmarkCount}</Text>
            </TouchableOpacity>
            </View>
        </View>

        {/* 확대 모달 */}
        <PostExpanded 
            visible={showExpanded}
            postData={tempData}
            onClose={() => setShowExpanded(false)}
        />

        {/* 신고 모달 */}
        <Report 
            visible={showReport}
            onClose={() => setShowReport(false)}
            onSubmit={handleReportSubmit}
        />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        // marginBottom: 20,
        // borderRadius: 12,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 4,
        // elevation: 3,
        // margin: 16,
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