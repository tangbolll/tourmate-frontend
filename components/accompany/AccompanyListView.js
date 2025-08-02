import React from 'react';
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
    myCreatedAccompanyList,
    feedList,
    selectedTab,
    setSelectedTab,
    fetchMyCreatedAccompanyData,
    fetchAccompanyFeedData,
    fetchMyAppliedAccompanyData,
    loading,
    filteredPosts,
    likedPosts,
    handlePressLike,
    navigateToPost,
    router,
}) => {

    const getDisplayTags = (tags) => {
        if (!tags || !Array.isArray(tags)) return [];
        
        const genderAgeTags = [
            '남성', '여성', '성별무관',
        ];
        
        const displayedGenderAge = tags.filter(tag => genderAgeTags.includes(tag));
        const categoryTags = tags.filter(tag => !genderAgeTags.includes(tag));
        const displayedCategories = categoryTags.slice(0, 3);
        
        return [...displayedGenderAge, ...displayedCategories];
    };


    const renderFeedItems = () => {
        if (loading) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>로딩 중...</Text>
                </View>
            );
        }

        if (filteredPosts.length === 0) {
            let emptyMessage = '';
            if (selectedTab === 'mine') {
                emptyMessage = '아직 생성한 동행이 없습니다.\n새로운 동행을 만들어보세요!';
            } else if (selectedTab === 'applied') {
                emptyMessage = '아직 신청한 동행이 없습니다.';
            } else { // 'feed' 탭
                emptyMessage = '표시할 동행이 없습니다.\n필터를 조정해보세요.';
            }
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>{emptyMessage}</Text>
                </View>
            );
        }

        return filteredPosts.map((post) => (
            <AccompanyFeed
                key={post.id}
                {...post}
                id={post.id}
                date={post.date}
                title={post.title}
                tags={getDisplayTags(post.tags)}
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
        <SafeAreaView style={styles.container}>
            {/* 고정된 상단 헤더, 필터 영역 */}
            <AccompanyListHeader
                onPressAlarm={() => console.log('알림')}
                onPressDM={() => console.log('DM')}
                onPressFilter={handleFilterPopup}
                searchText={searchText}
                setSearchText={setSearchText}
            />

            {/* 필터 팝업 및 캘린더 팝업 (기존 위치 유지) */}
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
                        {myAppliedAccompanyList.length > 0 ? (
                            myAppliedAccompanyList.map((item) => (
                                <AccompanyCard
                                    key={item.id}
                                    {...item}
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
                onSelectTab={(tab) => {
                    setSelectedTab(tab);
                    if (tab === 'mine') {
                        fetchMyCreatedAccompanyData();
                    } else if (tab === 'applied') {
                        fetchMyAppliedAccompanyData();
                    } else {
                        fetchAccompanyFeedData();
                    }
                }}
            />

            {/* 🔥 동행 피드 영역에만 스크롤뷰 적용 */}
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
        position: 'relative',
    },
    // 기존 scrollViewContent 스타일은 더 이상 필요하지 않아 삭제합니다.
    feedScrollViewContent: { // ✨ 피드 스크롤뷰를 위한 새로운 스타일 추가
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