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
    dibsList,
    scrapList,
    likedPosts,
    handlePressLike,
    navigateToPost,
    onPostcardPress
}) => {

    // 현재 탭에 따른 데이터 선택
    const getCurrentTabData = () => {
        return selectedTab === '찜' ? dibsList : scrapList;
    };

    // 피드 아이템 렌더링
    const renderFeedItems = () => {
        if (loading) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>로딩 중...</Text>
                </View>
            );
        }

        const currentData = getCurrentTabData();
        
        if (currentData.length === 0) {
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
                tags={post.tags}
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
                            colors={['#000']} // Android
                            tintColor={'#000'} // iOS
                        />
                    }
                    contentContainerStyle={styles.scrollViewContent}
                >
                    {renderFeedItems()}
                </ScrollView>
            )}
            
            {selectedTab === '스크랩' && (
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
        padding: 16, // 32 → 16으로 줄임
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#888',
        lineHeight: 24,
        marginTop: 20, // 100 → 20으로 대폭 줄임
    },
});

export default DibsScrapListView;