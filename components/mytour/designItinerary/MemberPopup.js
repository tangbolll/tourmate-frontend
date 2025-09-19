import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Alert, FlatList, ActivityIndicator, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { searchUsers } from '../../../utils/MyTourApi'; 
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBaseURL } from '../../../utils/apiConfig';





// 디바운스 기능을 위한 커스텀 훅
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}; 


// API 기본 URL을 가져오는 헬퍼 함수




const defaultProfile = require('../../../assets/defaultprofile.png');

const MemberPopup = ({ members, onClose, onMemberDelete, onMemberAdd, tourId }) => {
    const participants = members.length;
    const [searchText, setSearchText] = useState('');
    const [selectedNewMember, setSelectedNewMember] = useState(null);
    
    // 하드코딩된 availableUsers를 API 결과를 담을 state로 변경
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    
    // 검색어 입력이 멈췄을 때만 API를 호출하기 위한 디바운스
    const debouncedSearchText = useDebounce(searchText, 500); // 500ms 딜레이

    // debouncedSearchText가 변경될 때마다 유저 검색 API를 호출
    useEffect(() => {
        console.log('[MemberPopup] useEffect triggered. debouncedSearchText:', debouncedSearchText);
        const fetchUsers = async () => {
            if (!debouncedSearchText || debouncedSearchText.length < 2) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const users = await searchUsers(debouncedSearchText);
                console.log('[MemberPopup] searchUsers result (users):', users);
                console.log('[MemberPopup] members prop:', members);
                const newUsers = users.filter(user => !members.some(member => member.userId === user.userId));
                setSearchResults(newUsers);
            } catch (error) {
                console.error("Error searching users:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        fetchUsers();
    }, [debouncedSearchText, members]);

    const handleDeleteMember = (member) => {
    Alert.alert(
        '동반자 삭제',
        `${member.nickname}님을 동반자에서 삭제하시겠습니까?`,
        [
            {
                text: '아니오',
                style: 'cancel',
            },
            {
                text: '네',
                onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem('jwtToken');

                        // 서버 호출 (DELETE)
                        await axios.delete(
                            `${getBaseURL()}/api/myTour/${tourId}/companion`,
                            {
                                params: { userId: member.userId }, // 삭제할 멤버 ID
                                headers: {
                                    Authorization: `Bearer ${token}`, // JWT 토큰
                                },
                            }
                        );

                        // 상태 업데이트
                        onMemberDelete && onMemberDelete(member);
                    } catch (error) {
                        console.error("동반자 삭제 실패:", error);
                        Alert.alert("오류", "동반자 삭제에 실패했습니다.");
                    }
                },
            },
        ]
    );
};



    const handleSelectNewMember = (user) => {
    if (selectedNewMember?.userId === user.userId) {
        setSelectedNewMember(null);
    } else {
        setSelectedNewMember(user);
    }
    };


    const handleAddMember = async () => {
    if (!selectedNewMember) return;

    try {
        const token = await AsyncStorage.getItem('jwtToken');

        await axios.post(
            `${getBaseURL()}/api/myTour/${tourId}/companion`,
            null,
            {
                params: { userId: selectedNewMember.userId }, // 추가할 멤버의 ID
                headers: {
                    Authorization: `Bearer ${token}`, // JWT 토큰
                },
            }
        );

        const newMember = { ...selectedNewMember, isOwner: false };
        onMemberAdd && onMemberAdd(newMember);
        setSelectedNewMember(null);
        setSearchText('');
    } catch (error) {
        console.error("멤버 추가 실패:", error);
        Alert.alert("오류", "멤버 추가에 실패했습니다.");
    }
};


    const renderSearchResultItem = ({ item }) => (
        <TouchableOpacity 
            style={[
                styles.searchResultItem,
                selectedNewMember?.userId === item.userId && styles.selectedSearchResultItem
            ]}
            onPress={() => handleSelectNewMember(item)}
            >
            <Image 
                source={item.profileImage ? { uri: item.profileImage } : defaultProfile}
                style={styles.searchResultImage}
            />
            <View style={styles.searchResultInfo}>
                <View style={styles.searchResultNameRow}>
                <Text style={styles.searchResultName}>{item.nickname}</Text>
                <Text style={styles.searchResultDetail}> · {item.gender} · {item.age}세</Text>
                </View>
                <View style={styles.searchResultTags}>
                {Array.isArray(item.tags) && item.tags.map((tag, tagIndex) => (
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
                {members.map((member) => {
                    const isOwner = member.isOwner || member.owner; // owner 통일
                    return (
                        <View key={member.userId} style={styles.memberItem}>
                            <Image 
                                source={member.profileImage ? { uri: member.profileImage } : defaultProfile}
                                style={styles.profileImage}
                            />
                            <View style={styles.memberInfoContainer}>
                                <View style={styles.memberInfo}>
                                    <Text style={styles.memberName} numberOfLines={1}>{member.nickname}</Text>
                                    <Text style={styles.memberDetail}> · {member.gender} · {member.age}세</Text>
                                    {isOwner && <Text style={styles.hostLabel}>나</Text>}
                                </View>
                                <View style={styles.tagContainer}>
                                    {Array.isArray(member.tags) && member.tags.map((tag, tagIndex) => (
                                        <Text key={tagIndex} style={styles.tag}>#{tag}</Text>
                                    ))}
                                </View>
                            </View>

                            {!isOwner && (
                                <TouchableOpacity 
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteMember(member)}
                                >
                                    <Text style={styles.deleteButtonText}>삭제</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                })}
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
                            {isSearching ? (
                                <ActivityIndicator style={{ marginVertical: 20 }} />
                            ) : (
                                <FlatList
                                    data={searchResults} // 👈 data를 searchResults state로 변경
                                    renderItem={renderSearchResultItem}
                                    keyExtractor={(item) => item.userId.toString()} 
                                    style={styles.searchResultsList}
                                    showsVerticalScrollIndicator={false}
                            />
                            )}
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
        marginRight: 8,
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        flexWrap: 'nowrap',
    },
    memberName: {
        flexShrink: 1, 
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