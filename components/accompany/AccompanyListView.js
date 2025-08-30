import React, { memo, useCallback } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, TouchableOpacity, Text, RefreshControl } from 'react-native';
import AccompanyListHeader from './AccompanyListHeader';
import CalendarPopup from './CalendarPopup';
import FilterPopup from './FilterPopup';
import FilterTag from './FilterTag';
import AccompanyToggle from './AccompanyToggle';
import AccompanyCard from './AccompanyCard';
import AccompanyTabToggle from './AccompanyTabToggle';
import AccompanyFeed from './AccompanyFeed';
import CreateAccompanyButton from './CreateAccompanyButton';

// React.memo를 사용하여 props가 변경되지 않으면 리렌더링되지 않도록 최적화
const MemoizedAccompanyFeed = memo(AccompanyFeed);

const AccompanyListView = ({
    refreshing,
    onRefresh,
    searchText,
    setSearchText,
    showFilterPopup,
    handleFilterPopup,
    handleCloseFilterPopup,
    handleApplyFilters,
    filters,
    setFilters,
    calendarVisible,
    setCalendarVisible,
    handleCalendarSelect,
    getAllTags,
    handleRemoveTag,
    showCards,
    setShowCards,
    myAppliedAccompanyList,
    selectedTab,
    setSelectedTab,
    loading,
    filteredPosts,
    likedPosts,
    likeCounts,
    handlePressLike,
    navigateToPost,
    router,
}) => {
    // 🔥 최적화: 개발 단계에서 사용하던 불필요한 디버그용 useEffect 제거

    const handlePressDM = useCallback(() => {
        console.log('DM 버튼 클릭');
        router.push('/accompany/GroupChats');
    }, [router]);

    // 🔥 최적화: useCallback을 사용하여 함수를 메모이제이션
    const handleSelectTab = useCallback((tab) => {
        console.log(`🔄 탭 변경: ${selectedTab} → ${tab}`);
        setSelectedTab(tab);
    }, [setSelectedTab, selectedTab]);

    // getDisplayTags 함수도 useCallback으로 감싸서 불필요한 재생성 방지
    const getDisplayTags = useCallback((tags) => {
        if (!tags || !Array.isArray(tags)) return [];
        
        const genderTags = ['남자만', '여자만', '성별무관'];
        const ageTags = ['10대', '20대', '30대', '40대', '50대', '60대', '나이무관'];
        const allowedCategoryTags = [
            '투어', '식사', '야경', '사진', '쇼핑', '숙소', '교통', '테마파크', '액티비티', '힐링', '역사유적', '박물관/미술관'
        ];
        
        const genderTag = tags.find(tag => genderTags.includes(tag));
        const displayedGenderTags = genderTag ? [genderTag] : [];
        
        const categoryTags = tags.filter(tag => 
            !genderTags.includes(tag) && 
            !ageTags.includes(tag) &&
            allowedCategoryTags.includes(tag)
        );
        
        return [...displayedGenderTags, ...categoryTags];
    }, []);

    const renderFeedItems = () => {
        if (loading) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>로딩 중...</Text>
                </View>
            );
        }

        if (!filteredPosts || filteredPosts.length === 0) {
            let emptyMessage = '';
            if (selectedTab === 'mine') {
                emptyMessage = '아직 생성한 동행이 없습니다.\n새로운 동행을 만들어보세요!';
            } else if (selectedTab === 'applied') {
                emptyMessage = '아직 신청한 동행이 없습니다.';
            } else {
                emptyMessage = '표시할 동행이 없습니다.\n필터를 조정해보세요.';
            }
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>{emptyMessage}</Text>
                </View>
            );
        }

        return filteredPosts.map((post, index) => {
            const isLiked = !!likedPosts[post.id.toString()];
            const likeCount = likeCounts[post.id.toString()] !== undefined ? likeCounts[post.id.toString()] : post.likeCount;

            return (
                <MemoizedAccompanyFeed
                    key={post.id || `post-${index}`}
                    title={post.title}
                    tags={getDisplayTags(post.tags)}
                    location={post.location}
                    currentParticipants={post.currentParticipants}
                    maxRecruit={post.maxRecruit}
                    mainImageUrl={post.mainImageUrl}
                    tripStartDate={post.tripStartDate}
                    tripEndDate={post.tripEndDate}
                    likeCount={likeCount}
                    liked={isLiked}
                    onPressLike={() => handlePressLike(post.id)}
                    onPress={() => navigateToPost(post.id)}
                />
            );
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 고정된 상단 헤더, 필터 영역 */}
            <AccompanyListHeader
                onPressAlarm={() => console.log('알림')}
                onPressDM={handlePressDM}
                onPressFilter={handleFilterPopup}
                searchText={searchText}
                setSearchText={setSearchText}
            />

            <FilterPopup
                visible={showFilterPopup}
                onClose={handleCloseFilterPopup}
                onApply={(appliedFilters) => {
                    handleApplyFilters(appliedFilters);
                    handleCloseFilterPopup();
                }}
                filters={filters}
                setFilters={setFilters}
                onOpenCalendar={() => {
                    handleCloseFilterPopup();
                    setTimeout(() => setCalendarVisible(true), 300);
                }}
            />

            <CalendarPopup
                visible={calendarVisible}
                onClose={() => setCalendarVisible(false)}
                onSelectDates={handleCalendarSelect}
            />

            <View style={styles.filterTagsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTagsScroll}>
                    {getAllTags().map((tag) => (
                        <FilterTag key={tag} tag={tag} onPress={() => handleRemoveTag(tag)} />
                    ))}
                </ScrollView>
            </View>

            <AccompanyToggle
                isExpanded={showCards}
                onToggle={() => setShowCards(!showCards)}
            />

            {showCards && (
                <View style={styles.cardsContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsScroll}>
                        {myAppliedAccompanyList && myAppliedAccompanyList.length > 0 ? (
                            myAppliedAccompanyList.map((item, index) => (
                                <AccompanyCard
                                    key={item.id || `card-${index}`}
                                    {...item}
                                    imageUrl={item.mainImageUrl}
                                    onPress={() => navigateToPost(item.id)}
                                    userApplicationStatus={item.userApplicationStatus}
                                />
                            ))
                        ) : (
                            <View style={styles.emptyCardState}>
                                <Text style={styles.emptyCardStateText}>신청한 동행이 없어요.</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            )}

            <AccompanyTabToggle
                selectedTab={selectedTab}
                onSelectTab={handleSelectTab} // 🔥 최적화: 간결해진 핸들러 함수 전달
            />

            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#000']}
                        tintColor={'#000'}
                    />
                }
                contentContainerStyle={styles.feedScrollViewContent}
            >
                {renderFeedItems()}
            </ScrollView>

            <TouchableOpacity style={styles.floatingButton}>
                <CreateAccompanyButton
                    onPress={() => {
                        console.log('➕ 동행 생성 버튼 클릭');
                        router.push('/accompany/AccompanyCreation');
                    }}
                />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    feedScrollViewContent: {
        paddingBottom: 50,
    },
    floatingButton: {
        position: 'absolute',
        bottom: 25,
        right: 20,
        zIndex: 10
    },
    filterTagsContainer: {
        marginVertical: 8
    },
    filterTagsScroll: {
        paddingHorizontal: 16
    },
    cardsContainer: {
        marginTop: 16,
    },
    cardsScroll: {
        paddingHorizontal: 16,
        paddingRight: 32,
    },
    emptyState: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#888',
        lineHeight: 24,
        marginTop: 100,
    },
    emptyCardState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        marginRight: 8,
        width: 360,
        backgroundColor: 'transparent',
        borderRadius: 8,
    },
    emptyCardStateText: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginBottom: 0,
    },
});

export default AccompanyListView;