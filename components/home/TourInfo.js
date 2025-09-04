import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const TourInfo = ({ tourData }) => {
    const { title, date, members } = tourData;
    
    const renderMemberImages = () => {
        if (!members || members.length === 0) {
        return (
            <Image 
            source={require('../../assets/defaultProfile.png')} 
            style={styles.defaultAvatar}
            />
        );
        }
        
        if (members.length === 1) {
        return (
            <Image 
            source={{ uri: members[0].profileImage }} 
            style={styles.singleAvatar}
            />
        );
        }
        
        // 2명 이상일 때 겹쳐서 표시
        return (
        <View style={styles.multipleAvatarsContainer}>
            <Image 
            source={{ uri: members[0].profileImage }} 
            style={[styles.avatar, styles.backAvatar]}
            />
            <Image 
            source={{ uri: members[1].profileImage }} 
            style={[styles.avatar, styles.frontAvatar]}
            />
        </View>
        );
    };

    const handleMoreOptionsPress = () => {
        router.push(`/mytour/designItinerary?tourId=${tourData.id}`);
        console.log('더 많은 옵션');
    };

    return (
        <View style={styles.container}>
        <View style={styles.content}>
            <View style={styles.avatarContainer}>
            {renderMemberImages()}
            </View>
            
            <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.date}>{date}</Text>
            </View>
            
            <TouchableOpacity 
            style={styles.moreButton}
            onPress={handleMoreOptionsPress}
            >
            <Text style={styles.moreButtonText}>여행시간표 바로가기</Text>
            </TouchableOpacity>
        </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    avatarContainer: {
        marginRight: 12,
    },
    singleAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    multipleAvatarsContainer: {
        width: 50,
        height: 40,
        position: 'relative',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        position: 'absolute',
        borderWidth: 2,
        borderColor: '#fff',
    },
    backAvatar: {
        left: 10,
    },
    frontAvatar: {
        left: 0,
    },
    defaultAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    defaultAvatarText: {
        color: '#999',
        fontSize: 16,
        fontWeight: 'bold',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    date: {
        fontSize: 12,
        color: '#666',
    },
    moreButton: {
        height: 30,
        backgroundColor: '#000',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        justifyContent: 'center',
    },
    moreButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
});

export default TourInfo;