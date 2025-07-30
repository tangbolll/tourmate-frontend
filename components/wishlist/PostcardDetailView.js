import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Image,
    Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import LikedOrScrap from './LikedOrScrap';

const PostcardDetailView = ({ 
    postcardData, 
    onClose, 
    onLikePress, 
    onScrapPress 
}) => {
    // 더미 데이터 (props로 받지 못한 경우 대비)
    const defaultData = {
        id: 'postcard1',
        title: '부산 감천문화마을',
        location: '부산',
        date: '2021.03.06',
        author: '주리를 들어라',
        authorDate: '부산 · 2021.03.06',
        image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&h=300&fit=crop',
        design: {
            type: 'Image', // Line, Plain, Image
            color: '#E1F5FE',
        },
        content: {
            leftText: '알록달록한 감천문화마을...',
        },
        likeCount: 28,
        scrapCount: 43,
        isLiked: true,
        isScrapped: true,
    };

    const data = postcardData || defaultData;

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    const handleLike = () => {
        if (onLikePress) {
            onLikePress(data.id);
        }
    };

    const handleScrap = () => {
        if (onScrapPress) {
            onScrapPress(data.id);
        }
    };

    // 엽서 디자인 렌더링 (원형 그대로 유지)
    const renderPostcardDesign = () => {
        return (
            <View style={[styles.postcardDesign, { backgroundColor: data.design.color }]}>
                <Text style={styles.postcardTitle}>Postcard</Text>
                <View style={styles.postcardContent}>
                    
                        {data.design.type === 'Line' && (
                            <>
                                <View style={styles.line} />
                                <View style={styles.line} />
                                <View style={styles.line} />
                                <View style={styles.line} />
                            </>
                        )}
                        {data.design.type === 'Plain' && (
                            <View style={styles.plainArea} />
                        )}
                        {data.design.type === 'Image' && (
                            <View style={styles.imageArea}>
                                <Text style={styles.imageText}>Image</Text>
                            </View>
                        )}
                </View>
                <Text style={styles.postcardBottom}>
                    {data.date}
                </Text>
            </View>
        );
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={true}
            onRequestClose={handleClose}
        >
            <View style={styles.container}>
                <TouchableOpacity 
                                style={styles.closeButton}
                                onPress={handleClose}
                            >
                                <Feather name="x" size={24} color="#fff" />
                </TouchableOpacity>
                    
                        {/* 제목과 작성자 정보 */}
                    <Text style={styles.title}>{data.title}</Text>
                        <View style={styles.infoSection}>
                            
                            <View style={styles.authorInfo}>
                                <View style={styles.authorAvatar}>
                                    <Feather name="user" size={16} color="#666" />
                                </View>
                                <Text style={styles.authorText}>{data.author} ·</Text>
                                <Text style={styles.authorText}>{data.authorDate}</Text>
                            </View>
                        </View>
                
                        {/* 상단 이미지 */}
                        <View style={styles.imageContainer}>
                            <Image 
                                source={{ uri: data.image }} 
                                style={styles.mainImage}
                                resizeMode="cover"
                            />
                        </View>

                        {/* 엽서 */}
                        <View style={styles.postcardContainer}>
                            {renderPostcardDesign()}
                        </View>
                    {/* </ScrollView> */}

                    {/* 하단 액션 버튼들 */}
                    <View style={styles.actionContainer}>
                        <LikedOrScrap
                            likeCount={data.likeCount}
                            scrapCount={data.scrapCount}
                            isLiked={data.isLiked}
                            isScrapped={data.isScrapped}
                            onLikePress={handleLike}
                            onScrapPress={handleScrap}
                            showButtons={true}
                            iconSize={24}
                            textSize={16}
                        />
                    </View>
                </View>

        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
       backgroundColor: 'rgba(0, 0, 0, 0.7)' ,
    },
    closeButton: {
        position: 'absolute',
        right: 16,
        padding: 8,
    },
    contentContainer: {
        flex: 1,
    },
     closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    mainImage: {
        width: '80%',
        height: 250,
    },
    infoSection: {
        paddingLeft: '10%',
        marginTop: 10,
        marginBottom: 10,
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 70,
        marginBottom: 12,
        textAlign: 'center',
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    authorAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    authorText: {
        fontSize: 14,
        color: '#fff',
    },
    postcardContainer: {
        alignItems: 'center',
    },
    postcardDesign: {
        width: '80%',
        height: 250,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    postcardTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    postcardContent: {
        flex: 1,
        flexDirection: 'row',
        gap: 8,
    },
    postcardLeft: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 4,
    },
    postcardRight: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
    },
    line: {
        height: 1,
        backgroundColor: '#999',
        marginVertical: 2,
    },
    plainArea: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 4,
    },
    imageArea: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageText: {
        fontSize: 10,
        color: '#666',
    },
    postcardBottom: {
        fontSize: 8,
        color: '#666',
        textAlign: 'center',
        marginTop: 4,
    },
    actionContainer: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        alignItems: 'center',
    },
});

export default PostcardDetailView;