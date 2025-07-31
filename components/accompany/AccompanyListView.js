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
    fetchMyCreatedAccompanyData, // 🚨 추가됨: props로 받음
    fetchAccompanyFeedData,     // 🚨 추가됨: props로 받음
    fetchMyAppliedAccompanyData, // 🚨 추가됨: props로 받음
    loading,
    filteredPosts,
    likedPosts,
    handlePressLike,
    navigateToPost,
    router,
}) => {

    // 피드 아이템 렌더링
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
                emptyMessage = '아직 신청한 동행이 없습니다.'; // 🚨 문구 수정
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
        <SafeAreaView style={styles.container}>
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
                <AccompanyListHeader
                    onPressAlarm={() => console.log('알림')}
                    onPressDM={() => console.log('DM')}
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
                            {myAppliedAccompanyList.length > 0 ? (
                                myAppliedAccompanyList.map((item) => (
                                    <AccompanyCard
                                        key={item.id}
                                        {...item}
                                        onPress={() => navigateToPost(item.id)}
                                        buttonLabel="자세히 보기"
                                        status={item.status} // 🚨 status prop 추가
                                    />
                                ))
                            ) : (
                                <View style={styles.emptyCardState}>
                                    <Text style={styles.emptyCardStateText}>신청한 동행이 없어요</Text>
                                    {/* 🚨 "새로운 동행을 찾아볼까요?" 문구 삭제 */}
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
                            fetchMyCreatedAccompanyData(); // 🚨 props로 받은 함수 호출
                        } else if (tab === 'applied') {
                            fetchMyAppliedAccompanyData(); // 🚨 props로 받은 함수 호출
                        } else { // 'feed' 탭
                            fetchAccompanyFeedData(); // 🚨 props로 받은 함수 호출
                        }
                    }}
                />

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
    scrollViewContent: {
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
        flex: 1, // 스크롤 뷰 내에서 공간을 채우도록 flex 추가
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        marginRight: 8, // 카드 사이의 간격 유지
        width: 360,
        backgroundColor: 'transparent',
        borderRadius: 8,
    },
    emptyCardStateText: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center', // 🚨 텍스트 가운데 정렬
        marginBottom: 0, // 🚨 문구 삭제로 인한 간격 조정
    },
});

export default AccompanyListView;