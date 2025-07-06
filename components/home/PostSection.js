import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    FlatList,
} from 'react-native';
import Post from './Post';

const PostSection = () => {
    // 목 데이터
    const mockPosts = [
        {
        id: '1',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        postcardName: '부산의 바다',
        userName: '추리를봐야',
        location: '부산',
        date: '2021.03.06',
        postcardImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        timeAgo: '5시간 전',
        likeCount: 23,
        bookmarkCount: 46,
        },
        {
        id: '3',
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        postcardName: '경주 불국사',
        userName: '문화탐방',
        location: '경주',
        date: '2021.03.04',
        postcardImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        timeAgo: '12시간 전',
        likeCount: 92,
        bookmarkCount: 34,
        },
        {
        id: '4',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        postcardName: '강릉 바다',
        userName: '바다사랑',
        location: '강릉',
        date: '2021.03.03',
        postcardImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
        timeAgo: '1일 전',
        likeCount: 68,
        bookmarkCount: 25,
        },
        {
        id: '5',
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        postcardName: '서울 남산타워',
        userName: '서울투어',
        location: '서울',
        date: '2021.03.02',
        postcardImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
        timeAgo: '2일 전',
        likeCount: 234,
        bookmarkCount: 112,
        },
        {
        id: '6',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
        postcardName: '전주 한옥마을',
        userName: '한옥사랑',
        location: '전주',
        date: '2021.03.01',
        postcardImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        timeAgo: '3일 전',
        likeCount: 145,
        bookmarkCount: 67,
        },
        {
        id: '7',
        profileImage: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
        postcardName: '속초 해변',
        userName: '동해바다',
        location: '속초',
        date: '2021.02.28',
        postcardImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        timeAgo: '4일 전',
        likeCount: 76,
        bookmarkCount: 29,
        },
        {
        id: '8',
        profileImage: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
        postcardName: '대구 팔공산',
        userName: '산행러',
        location: '대구',
        date: '2021.02.27',
        postcardImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
        timeAgo: '5일 전',
        likeCount: 54,
        bookmarkCount: 18,
        },
    ];

    const renderPost = ({ item }) => (
        <Post postData={item} />
    );

    return (
        <View style={styles.container}>
        {/* 타이틀 */}
        <View style={styles.titleContainer}>
            <Text style={styles.title}>다른 유저의 여행엽서 엿보기</Text>
        </View>

        {/* 포스트 리스트 */}
        <FlatList
            data={mockPosts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.postList}
            scrollEventThrottle={16}
        />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: 8,
    },
    titleContainer: {
        backgroundColor: '#fff',
        paddingTop: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        paddingHorizontal: 20,
    },
    postList: {
        paddingTop: 8,
        paddingBottom: 32,
    },
});

export default PostSection;