import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import PostDirectoryHeader from '../../components/profile/PostDirectoryHeader';
import PostDirectoryFooter from '../../components/profile/PostDirectoryFooter';
import { Feather } from '@expo/vector-icons';

// 목 데이터 - 선택된 디렉토리의 엽서들
const mockPostcards = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        title: '부산 해운대',
        date: '2021.03.04',
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1534274867514-d5b47ef22043?w=400&h=300&fit=crop',
        title: '부산 광안리',
        date: '2021.03.05',
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop',
        title: '부산 자갈치',
        date: '2021.03.05',
    },
    {
        id: 4,
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
        title: '부산 송도',
        date: '2021.03.06',
    },
    {
        id: 5,
        image: 'https://images.unsplash.com/photo-1617085222613-49c7a5a8e5cb?w=400&h=300&fit=crop',
        title: '부산 태종대',
        date: '2021.03.06',
    },
    {
        id: 6,
        image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=300&fit=crop',
        title: '부산 감천문화마을',
        date: '2021.03.06',
    },
    {
        id: 7,
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        title: '부산 해운대 야경',
        date: '2021.03.04',
    },
    {
        id: 8,
        image: 'https://images.unsplash.com/photo-1534274867514-d5b47ef22043?w=400&h=300&fit=crop',
        title: '부산 광안대교',
        date: '2021.03.05',
    },
    {
        id: 9,
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop',
        title: '부산 남포동',
        date: '2021.03.05',
    },
    {
        id: 10,
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
        title: '부산 용두산공원',
        date: '2021.03.06',
    },
    {
        id: 11,
        image: 'https://images.unsplash.com/photo-1617085222613-49c7a5a8e5cb?w=400&h=300&fit=crop',
        title: '부산 국제시장',
        date: '2021.03.06',
    },
    {
        id: 12,
        image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=300&fit=crop',
        title: '부산 벡스코',
        date: '2021.03.06',
    },
];

export default function PostDirectory() {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    // URL 파라미터에서 디렉토리 정보 가져오기
    const directoryTitle = params.title || 'Busan';
    const startDate = params.startDate || '2021.03.04';
    const endDate = params.endDate || '2021.03.06';
    
    // 선택 모드와 선택된 엽서들 상태 관리
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedPostcards, setSelectedPostcards] = useState(new Set());

    // 뒤로가기 처리
    const handleBackPress = useCallback(() => {
        router.back();
    }, [router]);

    // 선택 모드 활성화
    const handleSelectPress = useCallback(() => {
        setIsSelectMode(true);
        setSelectedPostcards(new Set());
    }, []);

    // 선택 모드 취소
    const handleCancelPress = useCallback(() => {
        setIsSelectMode(false);
        setSelectedPostcards(new Set());
    }, []);

    // 엽서 선택/해제 처리
    const handlePostcardPress = useCallback((postcardId) => {
        if (!isSelectMode) {
            // 선택 모드가 아니면 엽서 상세 페이지로 이동
            return;
        }

        // 선택 모드일 때만 선택/해제 처리
        setSelectedPostcards(prev => {
            const newSet = new Set(prev);
            if (newSet.has(postcardId)) {
                newSet.delete(postcardId);
            } else {
                newSet.add(postcardId);
            }
            return newSet;
        });
    }, [isSelectMode]);

    // 엽서 추가 버튼 클릭 처리
    const handleAddPostcardPress = useCallback(() => {
        if (isSelectMode) {
            // 선택 모드에서는 동작하지 않음
            return;
        }

        // WritePost 페이지로 이동하며 현재 디렉토리 정보 전달
        router.push({
            pathname: 'profile/writePost',
            params: {
                directoryId: params.directoryId || 'temp-id',
                directoryName: directoryTitle,
                startDate: startDate,
                endDate: endDate,
            }
        });
    }, [isSelectMode, router, params.directoryId, directoryTitle, startDate, endDate]);

    // 푸터 액션 처리
    const handleDelete = useCallback(() => {
        // 삭제 로직 구현
        setSelectedPostcards(new Set());
        setIsSelectMode(false);
    }, [selectedPostcards]);

    const handleDownload = useCallback(() => {
        // 다운로드 로직 구현
    }, [selectedPostcards]);

    const handleShare = useCallback(() => {
        
        // 선택된 엽서들의 정보를 공유 페이지로 전달
        const selectedPostcardsData = mockPostcards.filter(postcard => 
            selectedPostcards.has(postcard.id)
        );
        
        router.push({
            pathname: 'profile/sharePost',
            params: {
                selectedPostcards: JSON.stringify(selectedPostcardsData),
                directoryTitle: directoryTitle,
                startDate: startDate,
                endDate: endDate,
            }
        });
    }, [selectedPostcards, router, directoryTitle, startDate, endDate]);

    return (
        <View style={styles.container}>
            {/* 헤더 */}
            <PostDirectoryHeader
                title={directoryTitle}
                startDate={startDate}
                endDate={endDate}
                onBackPress={handleBackPress}
                onSelectPress={handleSelectPress}
                onCancelPress={handleCancelPress}
                showActionButton={true}
            />

            {/* 엽서 그리드 */}
            <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.grid}>
                    {mockPostcards.map((postcard) => (
                        <TouchableOpacity
                            key={postcard.id}
                            style={styles.postcardContainer}
                            onPress={() => handlePostcardPress(postcard.id)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.imageContainer}>
                                <Image
                                    source={{ uri: postcard.image }}
                                    style={styles.postcardImage}
                                    resizeMode="cover"
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
        justifyContent: 'space-between',
    },
    postcardContainer: {
        width: '31%',
        marginBottom: 12,
        aspectRatio: 1,
    },
    imageContainer: {
        width: 148 * 0.75,
        height: 100 * 0.75,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    postcardImage: {
        width: '100%',
        height: '100%',
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
    // 엽서 추가 버튼 스타일
    // addPostcardContainer: {
    //     borderWidth: 2,
    //     borderColor: '#ddd',
    //     borderStyle: 'dashed',
    // },
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
        gap: 8,
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
});