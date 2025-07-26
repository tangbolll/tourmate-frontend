import React from 'react';
import { 
    View, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Image, 
    Text,
    RefreshControl 
} from 'react-native';

const PostcardGridView = ({
    refreshing,
    onRefresh,
    loading,
    postcardList,
    onPostcardPress,
}) => {

    // 엽서 아이템 렌더링
    const renderPostcardItems = () => {
        if (loading) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>로딩 중...</Text>
                </View>
            );
        }

        if (postcardList.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                        아직 스크랩한 엽서가 없습니다.{'\n'}
                        여행 중에 엽서를 만들어보세요!
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.grid}>
                {postcardList.map((postcard) => (
                    <TouchableOpacity
                        key={postcard.id}
                        style={styles.postcardContainer}
                        onPress={() => onPostcardPress(postcard.id)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: postcard.image }}
                                style={styles.postcardImage}
                                resizeMode="cover"
                            />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
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
            showsVerticalScrollIndicator={false}
        >
            {renderPostcardItems()}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollViewContent: {
        paddingBottom: 50,
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
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 16,
        justifyContent: 'space-between',
    },
    postcardContainer: {
        width: '31%',
        marginBottom: 12,
        // aspectRatio: 1,
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
});

export default PostcardGridView;