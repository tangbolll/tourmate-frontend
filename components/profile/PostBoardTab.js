import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

const PostBoardTab = () => {
    // 임시 데이터
    const boardPosts = [
        { id: 1, title: '첫 번째 엽서', date: '2024.12.25', content: '크리스마스 엽서입니다.' },
        { id: 2, title: '두 번째 엽서', date: '2024.12.24', content: '크리스마스 이브 엽서입니다.' },
        { id: 3, title: '세 번째 엽서', date: '2024.12.23', content: '겨울 풍경 엽서입니다.' },
        { id: 4, title: '네 번째 엽서', date: '2024.12.22', content: '연말 인사 엽서입니다.' },
    ];

    const PostCard = ({ post }) => (
        <TouchableOpacity style={styles.postCard}>
        <View style={styles.postImagePlaceholder}>
            <Text style={styles.placeholderText}>엽서 이미지</Text>
        </View>
        <View style={styles.postInfo}>
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postDate}>{post.date}</Text>
            <Text style={styles.postContent}>{post.content}</Text>
        </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.postsGrid}>
            {boardPosts.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}
            </View>
        </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    postsGrid: {
        padding: 16,
    },
    postCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    postImagePlaceholder: {
        height: 200,
        backgroundColor: '#e9ecef',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#6c757d',
        fontSize: 14,
    },
    postInfo: {
        padding: 16,
    },
    postTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    postDate: {
        fontSize: 12,
        color: '#6c757d',
        marginBottom: 8,
    },
    postContent: {
        fontSize: 14,
        color: '#495057',
        lineHeight: 20,
    },
});

export default PostBoardTab;