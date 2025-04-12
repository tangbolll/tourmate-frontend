import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';

const MemberPopup = ({ members, onClose }) => {
    const currentMembers = members.length;
    const totalMembers = 5; // 최대 인원 수

    return (
        <View style={styles.overlay}>
        <View style={styles.container}>
            <View style={styles.header}>
            <Text style={styles.title}>동행 목록</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={24} color="black" />
            </TouchableOpacity>
            </View>

            <View style={styles.participantsCount}>
            <Feather name="users" size={12} color="black" />
            <Text style={styles.countText}>{currentMembers}명 / {totalMembers}명</Text>
            </View>

            <ScrollView style={styles.membersList}>
            {members.map((member, index) => (
                <View key={index} style={styles.memberItem}>
                <Image 
                    source={require('../assets/defaultProfile.png')} 
                    style={styles.profileImage}
                    defaultSource={require('../assets/defaultProfile.png')}
                />
                <View style={styles.memberInfoContainer}>
                    <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberDetail}> · {member.gender} · {member.age}세</Text>
                    {member.isHost && <Text style={styles.hostLabel}>호스트</Text>}
                    </View>
                    <View style={styles.tagContainer}>
                    {member.tags.map((tag, tagIndex) => (
                        <Text key={tagIndex} style={styles.tag}>#{tag}</Text>
                    ))}
                    </View>
                </View>
                </View>
            ))}
            </ScrollView>
        </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    container: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        overflow: 'hidden',
        padding: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        position: 'relative',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    closeButton: {
        position: 'absolute',
        right: 16,
        top: 16,
    },
    participantsCount: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    countText: {
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 8,
    },
    membersList: {
        paddingHorizontal: 16,
    },
    memberItem: {
        flexDirection: 'row',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 30,
        backgroundColor: '#E5E7EB',
    },
    memberInfoContainer: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    memberName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    hostLabel: {
        fontSize: 12,
        backgroundColor: '#E5E7EB',
        color: '#000',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 6,
    },
    memberDetail: {
        fontSize: 14,
        color: '#666',
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        fontSize: 14,
        color: '#666',
        marginRight: 8,
    },
});

export default MemberPopup;