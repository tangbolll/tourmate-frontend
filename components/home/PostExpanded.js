import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ScrollView,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const PostExpanded = ({ visible, postData, onClose }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    // 목 데이터
    const mockData = {
        profileImage: 'https://via.placeholder.com/50',
        postcardName: '부산의 바다 !',
        userName: '추리를봐야',
        location: '부산',
        date: '2021.03.04',
        postcardImage: 'https://via.placeholder.com/400x300',
        timeAgo: '5시간 전',
        likeCount: 23,
        bookmarkCount: 46,
        postcardContent: '부산에다녀왔다\n넘즐거웠다\n엽서디자인 아직 안 넣었습니다 임시입니다\n놀래지마세용',
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
                    <Text style={styles.postcardTitle}>{mockData.postcardName}</Text>
                    
                    {/* 사용자 정보 */}
                    <View style={styles.userInfo}>
                        <Image source={{ uri: mockData.profileImage }} style={styles.profileImage} />
                        <Text style={styles.userText}>
                            {mockData.userName} · {mockData.location} · {mockData.date}
                        </Text>
                        <TouchableOpacity style={styles.menuButton}>
                            <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* 엽서 이미지 */}
                    <View style={styles.imageSection}>
                        <Image source={{ uri: mockData.postcardImage }} style={styles.postcardImage} />
                    </View>

                    {/* 엽서 내용 */}
                    <View style={styles.postcardSection}>
                        <View style={styles.postcardContainer}>
                            <View style={styles.postcardHeader}>
                                <Text style={styles.locationTitle}>{mockData.location}</Text>
                            </View>
                            <View style={styles.postcardContent}>
                                <Text style={styles.contentText}>{mockData.postcardContent}</Text>
                                <Text style={styles.dateText}>{mockData.date}</Text>
                            </View>
                        </View>
                    </View>

                    {/* 하단 액션 버튼 */}
                    <View style={styles.actionSection}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
                            <View style={styles.actionIcon}>
                                <Ionicons 
                                    name={isLiked ? "heart" : "heart-outline"} 
                                    size={28} 
                                    color={isLiked ? "#ff4757" : "#fff"} 
                                />
                            </View>
                            <Text style={styles.actionCount}>{mockData.likeCount}</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity style={styles.actionButton} onPress={handleBookmark}>
                            <View style={styles.actionIcon}>
                                <Ionicons 
                                    name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                                    size={28} 
                                    color={isBookmarked ? "#3742fa" : "#fff"} 
                                />
                            </View>
                            <Text style={styles.actionCount}>{mockData.bookmarkCount}</Text>
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
        top: 80,
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
        right: 20,
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
        fontSize: 20,
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
    menuButton: {
        padding: 5,
    },
    imageSection: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginBottom: 20,
    },
    postcardImage: {
        width: width * 0.8,
        height: 200,
        resizeMode: 'cover',
    },
    postcardSection: {
        paddingHorizontal: 15,
        paddingBottom: 15,
        marginBottom: 20,
    },
    postcardContainer: {
        width: width * 0.8,
        height: 200,
        backgroundColor: '#f8f9fa',
        overflow: 'hidden',
    },
    postcardHeader: {
        backgroundColor: '#aaa',
        paddingVertical: 8,
        paddingHorizontal: 15,
    },
    locationTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    postcardContent: {
        padding: 15,
        minHeight: 120,
    },
    contentText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 15,
    },
    dateText: {
        fontSize: 12,
        color: '#666',
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