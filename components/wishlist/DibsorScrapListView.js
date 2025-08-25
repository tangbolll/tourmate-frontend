import React from 'react';
import { 
    SafeAreaView, 
    ScrollView, 
    View, 
    StyleSheet, 
    Text, 
    RefreshControl 
} from 'react-native';
import AccompanyFeed from '../../components/accompany/AccompanyFeed';
import PostcardGridView from './PostcardGridView';

const DibsScrapListView = ({
    refreshing,
    onRefresh,
    selectedTab,
    setSelectedTab,
    loading,
    // ✅ props로 명시적으로 dibsList와 scrapList를 받도록 수정
    dibsList, 
    scrapList,
    likedPosts,
    handlePressLike,
    navigateToPost,
    onPostcardPress
}) => {

    // ✅ getCurrentTabData() 함수에서 props로 받은 변수를 사용하도록 수정
    const getCurrentTabData = () => {
        return selectedTab === '찜' ? dibsList : scrapList;
    };

    const filterTags = (tags) => {
        if (!tags || !Array.isArray(tags)) return [];
        
        const genderTags = ['남자만', '여자만', '성별무관'];
        const categoryTags = [
            '투어', '식사', '야경', '사진', '쇼핑', '숙소', '교통', '테마파크', '액티비티', '힐링', '역사유적', '박물관/미술관'
        ];
        const ageTags = ['10대', '20대', '30대', '40대', '50대', '60대+', '전연령'];
        
        return tags.filter(tag => {
            return genderTags.includes(tag) || (categoryTags.includes(tag) && !ageTags.includes(tag));
        });
    };

    const renderFeedItems = () => {
        if (loading) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>로딩 중...</Text>
                </View>
            );
        }

        const currentData = getCurrentTabData();
        
        // ✅ currentData가 유효한 배열인지 먼저 확인
        if (!currentData || !Array.isArray(currentData) || currentData.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                        {selectedTab === '찜'
                            ? '아직 찜한 동행이 없습니다.\n마음에 드는 동행을 찜해보세요!'
                            : '아직 스크랩한 동행이 없습니다.\n유용한 동행을 스크랩해보세요!'}
                    </Text>
                </View>
            );
        }

        return currentData.map((post) => (
            <AccompanyFeed
                key={post.id}
                {...post}
                id={post.id}
                date={post.date}
                title={post.title}
                tags={filterTags(post.tags)}
                location={post.location}
                participants={post.participants}
                maxParticipants={post.maxParticipants}
                imageUrl={post.imageUrl}
                liked={!!likedPosts[post.id]}
                onPressLike={() => handlePressLike(post.id)}
                onPress={() => navigateToPost(post.id)}
            />
        ));
    };

    return (
        <>
            {selectedTab === '찜' && (
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#000']}
                            tintColor={'#000'}
                        />
                    }
                    contentContainerStyle={styles.scrollViewContent}
                >
                    {renderFeedItems()}
                </ScrollView>
            )}
            
            {selectedTab === '스크랩' && (
                // PostcardGridView로 scrapList를 전달
                <PostcardGridView
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    loading={loading}
                    postcardList={scrapList}
                    onPostcardPress={onPostcardPress}
                />
            )}
        </>
    );
};

const styles = StyleSheet.create({
    scrollViewContent: {
        paddingTop: 12,
        paddingBottom: 50,
    },
    emptyState: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#888',
        lineHeight: 24,
        marginTop: 20,
    },
});

export default DibsScrapListView;