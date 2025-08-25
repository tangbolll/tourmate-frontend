import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { getFavoritePostcardsApi } from '../../utils/PostCardApi';

const PostCard = ({ post }) => (
    <TouchableOpacity style={styles.postCard}>
        {/* 엽서 이미지를 표시합니다. 이미지가 없으면 플레이스홀더를 사용합니다. */}
        <View style={styles.imageContainer}>
            <Image
                source={{ uri: post.imageUrl || 'https://via.placeholder.com/400x300.png?text=No+Image' }}
                style={styles.postImage}
                resizeMode="cover"
            />
        </View>
        <View style={styles.postInfo}>
            {/* 엽서 제목과 내용을 표시합니다. */}
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postContent}>{post.content}</Text>
        </View>
    </TouchableOpacity>
);

const PostBoardTab = ({ userEmail }) => {
    const [favoritePostcards, setFavoritePostcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchFavoritePostcards = async (email) => {
        if (!email) {
            setError('사용자 이메일 정보를 찾을 수 없습니다.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const fetchedPostcards = await getFavoritePostcardsApi(email);
            setFavoritePostcards(fetchedPostcards);
            console.log("✅ 즐겨찾기 엽서 목록을 성공적으로 불러왔습니다:", fetchedPostcards);
        } catch (err) {
            setError('즐겨찾기 엽서를 불러오는 중 오류가 발생했습니다.');
            console.error('즐겨찾기 엽서를 불러오는 중 오류가 발생했습니다:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavoritePostcards(userEmail);
    }, [userEmail]);

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>즐겨찾기 엽서 불러오는 중...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.postsGrid}>
                    {favoritePostcards.length > 0 ? (
                        favoritePostcards.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>아직 즐겨찾기한 엽서가 없습니다.</Text>
                        </View>
                    )}
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
    imageContainer: {
        width: '100%',
        aspectRatio: 1.5,
    },
    postImage: {
        width: '100%',
        height: '100%',
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
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    errorText: {
        marginTop: 10,
        color: 'red',
        textAlign: 'center',
    },
    emptyContainer: {
        paddingTop: 50,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
});

export default PostBoardTab;
