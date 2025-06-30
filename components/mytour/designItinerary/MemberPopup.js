import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Alert, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';

const defaultProfile = require('../../../assets/defaultProfile1.png');

const MemberPopup = ({ members, onClose, onMemberDelete, onMemberAdd }) => {
    const participants = members.length;
    const [searchText, setSearchText] = useState('');
    const [selectedNewMember, setSelectedNewMember] = useState(null);
    
    // 임시 검색 가능한 사용자 목록 (실제로는 API에서 받아올 데이터)
    const [availableUsers] = useState([
        {
            id: 'user1',
            name: '김민수',
            gender: '남',
            age: 28,
            tags: ['액티비티', '맛집탐방']
        },
        {
            id: 'user2',
            name: '박지영',
            gender: '여',
            age: 26,
            tags: ['쇼핑', '카페투어', '사진촬영']
        },
        {
            id: 'user3',
            name: '이준호',
            gender: '남',
            age: 30,
            tags: ['자연경관', '힐링']
        },
        {
            id: 'user4',
            name: '이수진',
            gender: '여',
            age: 24,
            tags: ['문화탐방', '역사']
        }
    ]);

    // 검색 결과 필터링
    const filteredUsers = availableUsers.filter(user => 
        user.name.includes(searchText) && 
        !members.some(member => member.id === user.id)
    );

    const handleDeleteMember = (member) => {
        Alert.alert(
            '동반자 삭제',
            `${member.name}님을 동반자에서 삭제하시겠습니까?`,
            [
                {
                    text: '아니오',
                    style: 'cancel',
                },
                {
                    text: '네',
                    onPress: () => {
                        onMemberDelete && onMemberDelete(member);
                    },
                },
            ]
        );
    };

    const handleSelectNewMember = (user) => {
        // 이미 선택된 사용자를 다시 누르면 선택 취소
        if (selectedNewMember?.id === user.id) {
            setSelectedNewMember(null);
        } else {
            setSelectedNewMember(user);
        }
    };

    const handleAddMember = () => {
        if (selectedNewMember) {
            const newMember = {
                ...selectedNewMember,
                isUser: false,
                profileImage: null
            };
            onMemberAdd && onMemberAdd(newMember);
            setSelectedNewMember(null);
            setSearchText('');
        }
    };

    const renderSearchResultItem = ({ item }) => (
        <TouchableOpacity 
            style={[
                styles.searchResultItem,
                selectedNewMember?.id === item.id && styles.selectedSearchResultItem
            ]}
            onPress={() => handleSelectNewMember(item)}
        >
            <Image 
                source={defaultProfile}
                style={styles.searchResultImage}
            />
            <View style={styles.searchResultInfo}>
                <View style={styles.searchResultNameRow}>
                    <Text style={styles.searchResultName}>{item.name}</Text>
                    <Text style={styles.searchResultDetail}> · {item.gender} · {item.age}세</Text>
                </View>
                <View style={styles.searchResultTags}>
                    {item.tags.map((tag, tagIndex) => (
                        <Text key={tagIndex} style={styles.searchResultTag}>#{tag}</Text>
                    ))}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.overlay}>
            <View style={styles.container}>
                {/* 헤더 */}
                <View style={styles.header}>
                    <Text style={styles.title}>동반자 목록</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Feather name="x" size={24} color="black" />
                    </TouchableOpacity>
                </View>

                {/* 인원 수 */}
                <View style={styles.participantsCount}>
                    <Feather name="users" size={12} color="black" />
                    <Text style={styles.countText}>{participants}명</Text>
                </View>

                {/* 멤버 리스트 */}
                <ScrollView 
                    style={styles.membersList} 
                    contentContainerStyle={styles.membersListContent}
                >
                    {members.map((member, index) => (
                        <View key={index} style={styles.memberItem}>
                            <Image 
                                source={member.profileImage || defaultProfile}
                                style={styles.profileImage}
                            />
                            <View style={styles.memberInfoContainer}>
                                <View style={styles.memberInfo}>
                                    <Text style={styles.memberName}>{member.name}</Text>
                                    <Text style={styles.memberDetail}> · {member.gender} · {member.age}세</Text>
                                    {member.isUser && <Text style={styles.hostLabel}>나</Text>}
                                </View>
                                <View style={styles.tagContainer}>
                                    {member.tags.map((tag, tagIndex) => (
                                        <Text key={tagIndex} style={styles.tag}>#{tag}</Text>
                                    ))}
                                </View>
                            </View>
                            
                            {/* 삭제 버튼 (본인이 아닌 경우에만 표시) */}
                            {!member.isUser && (
                                <TouchableOpacity 
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteMember(member)}
                                >
                                    <Text style={styles.deleteButtonText}>삭제</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </ScrollView>

                {/* 동반자 검색/추가 섹션 */}
                <View style={styles.addMemberSection}>
                    {/* 검색창과 추가버튼을 한 줄로 배치 */}
                    <View style={styles.searchRow}>
                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="동반자의 닉네임을 입력해주세요."
                                placeholderTextColor={'#999'}
                                value={searchText}
                                onChangeText={setSearchText}
                            />
                        </View>
                        
                        <TouchableOpacity 
                            style={[
                                styles.addButton,
                                !selectedNewMember && styles.addButtonDisabled
                            ]}
                            onPress={handleAddMember}
                            disabled={!selectedNewMember}
                        >
                            <Text style={[
                                styles.addButtonText,
                                !selectedNewMember && styles.addButtonTextDisabled
                            ]}>
                                추가
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* 검색 결과 */}
                    {searchText.length > 0 && (
                        <View style={styles.searchResults}>
                            <FlatList
                                data={filteredUsers}
                                renderItem={renderSearchResultItem}
                                keyExtractor={(item) => item.id}
                                style={styles.searchResultsList}
                                showsVerticalScrollIndicator={false}
                            />
                        </View>
                    )}
                </View>
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
    },
    countText: {
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 8,
    },
    membersList: {
        paddingHorizontal: 16,
        maxHeight: 300,
    },
    membersListContent: {
        paddingBottom: 12,
    },
    memberItem: {
        flexDirection: 'row',
        paddingVertical: 12,
        alignItems: 'center',
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
        flexWrap: 'wrap',
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
    deleteButton: {
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    deleteButtonText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    addMemberSection: {
        // borderTopWidth: 1,
        // borderTopColor: '#e0e0e0',
        paddingTop: 12,
        paddingHorizontal: 16,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    searchContainer: {
        flex: 1,
        marginRight: 12,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        backgroundColor: '#fff',
    },
    searchResults: {
        maxHeight: 120,
    },
    searchResultsList: {
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 8,
    },
    searchResultItem: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 8,
        marginBottom: 4,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    selectedSearchResultItem: {
        borderColor: '#999',
        borderWidth: 2,
    },
    searchResultImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E5E7EB',
    },
    searchResultInfo: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'center',
    },
    searchResultNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    searchResultName: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    searchResultDetail: {
        fontSize: 12,
        color: '#666',
    },
    searchResultTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    searchResultTag: {
        fontSize: 12,
        color: '#666',
        marginRight: 6,
    },
    addButton: {
        backgroundColor: '#000',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        minWidth: 60,
    },
    addButtonDisabled: {
        backgroundColor: '#e0e0e0',
    },
    addButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    addButtonTextDisabled: {
        color: '#999',
    },
});

export default MemberPopup;