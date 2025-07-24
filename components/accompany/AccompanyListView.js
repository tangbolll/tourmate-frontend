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
    myJoinedAccompanyList,
    selectedTab,
    setSelectedTab,
    fetchMyCreatedAccompanyData, // 탭 전환 시 데이터 페칭을 위한 함수
    fetchAccompanyData, // 탭 전환 시 데이터 페칭을 위한 함수
    loading,
    filteredPosts,
    likedPosts,
    handlePressLike,
    navigateToPost,
    router, // 라우터도 props로 전달
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
        return (
            <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
                {selectedTab === 'mine'
                ? '아직 생성한 동행이 없습니다.\n새로운 동행을 만들어보세요!'
                : '표시할 동행이 없습니다.\n필터를 조정해보세요.'}
            </Text>
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
                colors={['#000']} // Android
                tintColor={'#000'} // iOS
            />
            }
            contentContainerStyle={styles.scrollViewContent} // <-- Add this style
        >
            <AccompanyListHeader
            onPressAlarm={() => console.log('알림')} // TODO: 실제 알림 기능 연결
            onPressDM={() => console.log('DM')} // TODO: 실제 DM 기능 연결
            onPressFilter={handleFilterPopup}
            searchText={searchText}
            setSearchText={setSearchText}
            />

            <FilterPopup
            visible={showFilterPopup}
            onClose={handleCloseFilterPopup}
            onApply={(appliedFilters) => {
                handleApplyFilters(appliedFilters);
                handleCloseFilterPopup(); // 필터 적용 후 팝업 닫기
            }}
            filters={filters}
            setFilters={setFilters} // FilterPopup 내부에서 setFilters가 필요하다면 전달
            onOpenCalendar={() => {
                handleCloseFilterPopup();
                setTimeout(() => setCalendarVisible(true), 300);
            }}
            />

            <CalendarPopup
            visible={calendarVisible}
            onClose={() => setCalendarVisible(false)} // 캘린더 닫기
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
                {myJoinedAccompanyList.map((item) => (
                    <AccompanyCard
                    key={item.id}
                    {...item}
                    onPress={() => navigateToPost(item.id)}
                    />
                ))}
                </ScrollView>
            </View>
            )}

            <AccompanyTabToggle
            selectedTab={selectedTab}
            onSelectTab={(tab) => {
                setSelectedTab(tab);
                // 탭 변경 시 해당 탭의 데이터 다시 로드
                if (tab === 'mine') {
                fetchMyCreatedAccompanyData();
                } else {
                fetchAccompanyData();
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
    scrollViewContent: { // <-- New style for ScrollView content
        paddingBottom: 50, // Adjust this value based on your tab bar height
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
        paddingHorizontal: 16
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
});

export default AccompanyListView;