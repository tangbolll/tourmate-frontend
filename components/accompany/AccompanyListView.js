import React, { useEffect } from 'react';
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

    // 🔍 디버깅: 컴포넌트가 렌더링될 때마다 데이터 상태 확인
    useEffect(() => {
        console.log('🔍 AccompanyListView 렌더링됨');
        console.log('🔍 selectedTab:', selectedTab);
        console.log('🔍 filteredPosts 길이:', filteredPosts?.length || 0);
        console.log('🔍 filteredPosts ID들:', filteredPosts?.map(post => `${post.id} (${typeof post.id})`));
        console.log('🔍 likedPosts 상태:', likedPosts);
        console.log('🔍 loading 상태:', loading);
    });

    const handlePressDM = () => {
        // 여기서 navigation.navigate를 직접 호출
        navigation.navigate('accompany/GroupChats'); 
    };


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

        if (!filteredPosts || filteredPosts.length === 0) {
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

        return filteredPosts.map((post, index) => {
            // 🔍 각 포스트별 디버깅 정보
            const isLiked = !!likedPosts[post.id];
            console.log(`🔍 포스트 ${index}: id=${post.id}, liked=${isLiked}, title=${post.title}`);
            
            return (
                <AccompanyFeed
                    key={post.id || `post-${index}`} // id가 없을 경우 대체 키 사용
                    {...post}
                    id={post.id}
                    date={post.date}
                    title={post.title}
                    tags={getDisplayTags(post.tags)}
                    location={post.location}
                    participants={post.participants}
                    maxParticipants={post.maxParticipants}
                    imageUrl={post.imageUrl}
                    liked={isLiked}
                    onPressLike={() => {
                        console.log(`🔥 좋아요 버튼 클릭: postId=${post.id}`);
                        if (post.id) {
                            handlePressLike(post.id);
                        } else {
                            console.error('❌ 좋아요 클릭 실패: post.id가 없음', post);
                        }
                    }}
                    onPress={() => {
                        console.log(`🔗 포스트 클릭: postId=${post.id}`);
                        if (post.id) {
                            navigateToPost(post.id);
                        } else {
                            console.error('❌ 포스트 클릭 실패: post.id가 없음', post);
                        }
                    }}
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
                        {myAppliedAccompanyList && myAppliedAccompanyList.length > 0 ? (
                            myAppliedAccompanyList.map((item, index) => (
                                <AccompanyCard
                                    key={item.id || `card-${index}`}
                                    {...item}
                                    onPress={() => {
                                        console.log(`🔗 카드 클릭: itemId=${item.id}`);
                                        console.log(`🔗 userApplicationstatus:, ${item.userApplicationStatus}`);
                                        if (item.id) {
                                            navigateToPost(item.id);
                                        }
                                    }}
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
                    console.log(`🔄 탭 변경: ${selectedTab} → ${tab}`);
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
                        onRefresh={() => {
                            console.log('🔄 새로고침 시작');
                            onRefresh();
                        }}
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
        position: 'relative',
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