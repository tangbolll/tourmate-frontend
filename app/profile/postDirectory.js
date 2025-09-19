import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Image, 
    Text, 
    Alert, 
    ActivityIndicator,
    RefreshControl 
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import PostDirectoryHeader from '../../components/profile/PostDirectoryHeader';
import PostDirectoryFooter from '../../components/profile/PostDirectoryFooter';
import PostExpanded from '../../components/profile/PostExpanded';

import {
    getPostcardsByFolderApi,
    deletePostcardApi,
    handleApiError,
} from '../../utils/PostCardApi';

export default function PostDirectory() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // URL 파라미터에서 디렉토리 정보 가져오기
    const directoryId = params.directoryId || null;
    const directoryTitle = params.title || 'Busan';
    // 날짜 포맷 변경 (YYYY-MM-DD -> YYYY.MM.DD)
    const startDate = params.startDate ? params.startDate.replace(/-/g, '.') : '날짜 미상';
    const endDate = params.endDate ? params.endDate.replace(/-/g, '.') : '날짜 미상';

    // 엽서 데이터 상태
    const [postcards, setPostcards] = useState([]);
    // 선택 모드와 선택된 엽서들 상태 관리
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedPostcards, setSelectedPostcards] = useState(new Set());
    // 로딩 상태 관리
    const [isLoading, setIsLoading] = useState(true);
    // 새로고침 상태 관리 (추가)
    const [refreshing, setRefreshing] = useState(false);
    // 확장된 엽서 상태 관리
    const [expandedPostcard, setExpandedPostcard] = useState(null);

    // 엽서 데이터를 불러오는 함수 - useEffect에서 분리
    const fetchPostcards = useCallback(async (showLoading = true) => {
        if (!directoryId) {
            console.log('디렉토리 ID가 없어 엽서 데이터를 불러오지 않습니다.');
            if (showLoading) setIsLoading(false);
            return;
        }

        try {
            if (showLoading) setIsLoading(true);
            console.log(`✅ 디렉토리 ID ${directoryId}의 엽서 데이터 불러오기 시도`);
            const data = await getPostcardsByFolderApi(directoryId);
            console.log('✅ 엽서 데이터 불러오기 성공:', data);

            const formattedPostcards = data.map(pc => ({
                id: pc.postcardId,
                image: pc.imageUrl,
                title: pc.content || '제목 없음',
                date: pc.dateCreated ? pc.dateCreated.split('T')[0] : '날짜 없음',
                // PostExpanded에 필요한 필드를 여기에서 미리 정의
                content: pc.content || '내용 없음',
                dateCreated: pc.dateCreated || '날짜 없음',
                folderName: directoryTitle,
                currentUserId: 'mockUserId', // 테스트용 mock user ID
                likeCount: pc.likeCount || 0,
                scrapCount: pc.scrapCount || 0,
                isPublic: pc.publicScope === 1,
                // 추가: PostExpanded가 참조할 필드 추가
                postcardId: pc.postcardId,
                imageUrl: pc.imageUrl,
                typeImageUrl: pc.typeImageUrl,
                postcardTypeId: pc.postcardTypeId,
            }));
            
            // 엽서를 ID 오름차순으로 정렬 (오래된 것이 먼저)
            formattedPostcards.sort((a, b) => a.id - b.id);

            console.log('📌 formattedPostcards:', formattedPostcards);
            setPostcards(formattedPostcards);
        } catch (error) {
            console.error('❌ 엽서 데이터 불러오기 실패:', error);
            handleApiError(error, '엽서 데이터 불러오기');
            Alert.alert('오류', '엽서 데이터를 불러오는 데 실패했습니다.');
        } finally {
            if (showLoading) setIsLoading(false);
        }
    }, [directoryId, directoryTitle]);

    // 새로고침 핸들러
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchPostcards(false); // showLoading = false로 설정
        setRefreshing(false);
    }, [fetchPostcards]);

    // 화면이 포커스될 때마다 엽서 데이터를 다시 불러옵니다.
    useFocusEffect(
        useCallback(() => {
            fetchPostcards(true);
        }, [fetchPostcards])
    );

    // 뒤로가기 처리
    const handleBackPress = useCallback(() => {
        router.back();
    }, [router]);

    // 선택 모드 토글
    const handleSelectToggle = useCallback(() => {
        setIsSelectMode(prev => !prev);
        setSelectedPostcards(new Set());
    }, []);

    // 엽서 선택/해제 또는 상세 보기 처리
    const handlePostcardPress = useCallback((postcard) => {
        if (!isSelectMode) {
            // 선택 모드가 아니면 엽서 상세 페이지로 이동
            console.log('엽서 상세 페이지로 이동:', postcard.id);
            router.push({
                pathname: 'profile/writePost',
                params: {
                    directoryId: directoryId,
                    directoryName: directoryTitle,
                    startDate: params.startDate,
                    endDate: params.endDate,
                    postcardId: postcard.id,
                }
            });
            return;
        }

        // 선택 모드일 때만 선택/해제 처리
        setSelectedPostcards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(postcard.id)) {
                newSet.delete(postcard.id);
            } else {
                newSet.add(postcard.id);
            }
            return newSet;
        });
    }, [isSelectMode, router, directoryId, directoryTitle, params.startDate, params.endDate]);

    // 엽서 추가 버튼 클릭 처리
    const handleAddPostcardPress = useCallback(() => {
        if (isSelectMode) {
            return;
        }

        // WritePost 페이지로 이동하며 현재 디렉토리 정보 전달
        router.push({
            pathname: 'profile/writePost',
            params: {
                directoryId: directoryId,
                directoryName: directoryTitle,
                startDate: params.startDate,
                endDate: params.endDate,
                createNew: 'true',
                newlyCreated: 'true',
            }
        });
    }, [isSelectMode, router, directoryId, directoryTitle, params.startDate, params.endDate]);

    // 푸터 액션 처리
    const handleDelete = useCallback(async () => {
        if (selectedPostcards.size === 0) {
            Alert.alert('알림', '삭제할 엽서를 선택해주세요.');
            return;
        }

        Alert.alert(
            '삭제 확인',
            `선택한 엽서 ${selectedPostcards.size}개를 정말로 삭제하시겠습니까?`,
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '삭제',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const idsToDelete = Array.from(selectedPostcards);
                            console.log('선택된 엽서 삭제:', idsToDelete);

                            await Promise.all(idsToDelete.map(id => deletePostcardApi(id)));

                            setPostcards(prev => prev.filter(pc => !selectedPostcards.has(pc.id)));
                            setSelectedPostcards(new Set());
                            setIsSelectMode(false);
                            Alert.alert('삭제 완료', '선택한 엽서가 성공적으로 삭제되었습니다.');
                        } catch (error) {
                            console.error('❌ 엽서 삭제 오류:', error);
                            handleApiError(error, '엽서 삭제');
                        }
                    }
                }
            ]
        );
    }, [selectedPostcards]);

    const handleDownload = useCallback(() => {
        console.log('선택된 엽서 다운로드:', Array.from(selectedPostcards));
        Alert.alert('다운로드', '다운로드 기능이 준비중입니다.');
    }, [selectedPostcards]);

    const handleShare = useCallback(() => {
        // 1. 선택된 엽서 데이터 필터링
        const selectedPostcardsData = postcards.filter(postcard =>
            selectedPostcards.has(postcard.id)
        );

        if (selectedPostcardsData.length === 0) {
            Alert.alert('알림', '공유할 엽서를 선택해주세요.');
            return;
        }

        const total = selectedPostcardsData.length;
        const alreadyShared = selectedPostcardsData.filter(pc => pc.isPublic).length;
        const notSharedPostcards = selectedPostcardsData.filter(pc => !pc.isPublic);

        if (notSharedPostcards.length === 0) {
            Alert.alert('알림', '이미 공유된 엽서만 선택되어 있습니다. \n다른 엽서를 선택하세요.');
            return;
        }

        if (alreadyShared > 0) {
            if (alreadyShared === total) {
                // 모두 이미 공유된 경우
                Alert.alert('알림', '선택한 모든 엽서는 이미 공개된 엽서입니다.');
            } else {
                // 일부만 공개된 경우
                Alert.alert(
                    '안내',
                    `${total}개 중 ${alreadyShared}개는 이미 공개된 엽서입니다.\n나머지 ${notSharedPostcards.length}개만 공개로 설정됩니다.`,
                    [
                        { text: '취소', style: 'cancel' },
                        { text: '확인', onPress: () => proceedShare(notSharedPostcards) },
                    ]
                );
            }
        } else {
            // 전부 공개 안 된 경우 → 바로 공유 처리
            proceedShare(notSharedPostcards);
        }
    }, [selectedPostcards, postcards]);

    // 공유 처리 로직 따로 함수로 분리
    const proceedShare = useCallback((postcardsToShare) => {
        const simplifiedPostcards = postcardsToShare.map(pc => ({
            postcardId: pc.postcardId,
            imageUrl: pc.imageUrl,
            content: pc.content,
            dateCreated: pc.dateCreated,
            typeImageUrl: pc.typeImageUrl,
            postcardTypeId: pc.postcardTypeId,
        }));

        console.log('선택된 엽서 공유:', simplifiedPostcards);

        router.push({
            pathname: 'profile/sharePost',
            params: {
                selectedPostcards: JSON.stringify(simplifiedPostcards),
                directoryTitle: directoryTitle,
                startDate: params.startDate || '날짜 미상',
                endDate: params.endDate || '날짜 미상',
            },
        });
    }, [router, directoryTitle, params.startDate, params.endDate]);

    // 확장된 엽서 닫기 함수
    const handleCloseExpanded = useCallback(() => {
        setExpandedPostcard(null);
    }, []);
    
    // 이미지 로딩 상태를 관리하고 오류 시 대체 이미지를 표시하는 컴포넌트
    const ImageWithLoading = ({ uri, style }) => {
        const [imageLoading, setImageLoading] = useState(true);
        const [hasError, setHasError] = useState(false);

        const handleError = () => {
            setImageLoading(false);
            setHasError(true);
            console.error('❌ 이미지 로딩 실패:', uri);
        };

        const handleLoad = () => {
            setImageLoading(false);
            setHasError(false);
            console.log('✅ 이미지 로딩 성공:', uri);
        };

        // 이미지 로딩 오류 시 기본 대체 이미지 URL
        const fallbackImageUri = 'https://placehold.co/600x400/FFF/000?text=Image+Not+Found';

        return (
            <View style={[style, styles.imageWrapper]}>
                {imageLoading && <ActivityIndicator size="small" color="#0000ff" style={styles.activityIndicator} />}
                {hasError ? (
                    <View style={style}>
                        <Image
                            source={{ uri: fallbackImageUri }}
                            style={styles.fullImage}
                            resizeMode="cover"
                        />
                       <Text style={styles.errorText}>이미지를 불러오지 못했습니다.</Text>
                    </View>
                ) : (
                    <Image
                        source={{ uri }}
                        style={[styles.fullImage, { opacity: imageLoading ? 0 : 1 }]}
                        resizeMode="cover"
                        onLoad={handleLoad}
                        onError={handleError}
                    />
                )}
            </View>
        );
    };

    // 엽서를 불러오는 동안 로딩 상태를 보여줍니다.
    if (isLoading) {
        return (
            <View style={styles.container}>
                <PostDirectoryHeader
                    title={directoryTitle}
                    startDate={startDate}
                    endDate={endDate}
                    onBackPress={handleBackPress}
                    showActionButton={false}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.loadingText}>엽서를 불러오는 중...</Text>
                </View>
            </View>
        );
    }

    // PostExpanded가 표시될 때 전체 화면을 덮도록 렌더링
    if (expandedPostcard) {
        return (
            <PostExpanded
                visible={true}
                postData={expandedPostcard}
                onClose={handleCloseExpanded}
                currentUserId={'mockUserId'}
            />
        );
    }

    return (
        <View style={styles.container}>
            {/* 헤더 */}
            <PostDirectoryHeader
                title={directoryTitle}
                startDate={startDate}
                endDate={endDate}
                onBackPress={handleBackPress}
                onSelectPress={handleSelectToggle}
                isSelectMode={isSelectMode}
            />

            {/* 엽서 그리드 */}
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#000']} 
                        tintColor={'#000'}
                        progressViewOffset={60}
                        refreshThreshold={80}
                        distanceToRefresh={80}
                    />
                }
                scrollEventThrottle={16}
            >
                <View style={styles.grid}>
                    {postcards.map((postcard, index) => (
                        <TouchableOpacity
                            key={postcard.id}
                            style={[
                                styles.postcardContainer,
                                // 3번째 아이템마다 marginRight 제거
                                (index + 1) % 3 !== 0 && styles.postcardMarginRight
                            ]}
                            onPress={() => handlePostcardPress(postcard)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.imageContainer}>
                                <ImageWithLoading
                                    uri={postcard.image}
                                    style={styles.postcardImage}
                                />

                                {/* 선택 모드일 때 체크 표시 */}
                                {isSelectMode && (
                                    <View style={styles.checkContainer}>
                                        <View style={[
                                            styles.checkBox,
                                            selectedPostcards.has(postcard.id) && styles.checkBoxSelected
                                        ]}>
                                            {selectedPostcards.has(postcard.id) && (
                                                <Feather
                                                    name="check"
                                                    size={16}
                                                    color="#fff"
                                                />
                                            )}
                                        </View>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}

                    {/* 엽서 추가 버튼 */}
                    <TouchableOpacity
                        style={[
                            styles.postcardContainer,
                            styles.addPostcardContainer,
                            isSelectMode && styles.addPostcardContainerDisabled
                        ]}
                        onPress={handleAddPostcardPress}
                        activeOpacity={isSelectMode ? 1 : 0.8}
                        disabled={isSelectMode}
                    >
                        <View style={[
                            styles.imageContainer,
                            styles.addPostcardImageContainer
                        ]}>
                            <View style={styles.addPostcardContent}>
                                <Feather
                                    name="plus"
                                    size={32}
                                    color={isSelectMode ? "#ccc" : "#999"}
                                />
                                <Text style={[
                                    styles.addPostcardText,
                                    isSelectMode && styles.addPostcardTextDisabled
                                ]}>
                                    엽서 추가
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* 푸터 - 선택 모드일 때만 표시 */}
            <PostDirectoryFooter
                isVisible={isSelectMode}
                selectedCount={selectedPostcards.size}
                onDelete={handleDelete}
                onDownload={handleDownload}
                onShare={handleShare}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 16,
        // 왼쪽부터 차곡차곡 정렬
        justifyContent: 'flex-start',
        alignContent: 'flex-start',
    },
    postcardContainer: {
        width: '31%',
        marginBottom: 12,
        // 비율 148:100 = 1.48
        aspectRatio: 1.48,
    },
    // 왼쪽과 가운데 아이템에만 적용될 마진
    postcardMarginRight: {
        marginRight: '3.5%',
    },
    imageContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    postcardImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    imageWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: '100%',
        height: '100%',
    },
    activityIndicator: {
        position: 'absolute',
    },
    errorText: {
        textAlign: 'center',
        fontSize: 10,
        color: '#888',
        padding: 4,
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 8,
    },
    checkContainer: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 1,
    },
    checkBox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#fff',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkBoxSelected: {
        backgroundColor: '#555',
        borderColor: '#555',
    },
    addPostcardContainer: {
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        borderRadius: 8,
    },
    addPostcardContainerDisabled: {
        opacity: 0.5,
    },
    addPostcardImageContainer: {
        backgroundColor: '#f8f8f8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addPostcardContent: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    addPostcardText: {
        fontSize: 12,
        color: '#999',
        fontWeight: '500',
        textAlign: 'center',
    },
    addPostcardTextDisabled: {
        color: '#ccc',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
});