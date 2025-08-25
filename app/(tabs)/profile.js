import { useRouter } from 'expo-router';
import React, { useState, useCallback, useEffect } from 'react';
import useUserStore from '../../context/userStore';
import { View, StyleSheet, Alert, Text } from 'react-native';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import PostTabHeader from '../../components/profile/PostTabHeader';
import PostBoardTab from '../../components/profile/PostBoardTab';
import { PostDirectoryTab } from '../../components/profile/PostDirectoryTab';
import AddPostFloatingButton from '../../components/profile/AddPostFloatingButton';
import CreatePostDirectoryPopup from '../../components/profile/CreatePostDirectoryPopup';
import SelectPostDirectoryPopup from '../../components/profile/SelectPostDirectoryPopup';
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserProfileApi } from '../../utils/ProfileApi';

import { 
    createPostcardWithNewFolderApi, 
    updateFolderApi, 
    deleteFolderApi,
    getFoldersByUserApi,
    handleApiError
} from '../../utils/PostCardApi';

export default function ProfileHome() {
    const { signOut } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('board');
    const [folders, setFolders] = useState([]); // 폴더 목록 상태 추가
    const [createPopupVisible, setCreatePopupVisible] = useState(false);
    const [selectPopupVisible, setSelectPopupVisible] = useState(false);
    const [popupMode, setPopupMode] = useState('create');
    const [editingFolder, setEditingFolder] = useState(null);
    const { userData, setUserData } = useUserStore();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (userId) {
                    const data = await fetchUserProfileApi(userId);
                    setUserData(data);
                }
            } catch (error) {
                console.error('Error fetching user data in ProfileHome:', error);
            }
        };

        fetchUserData();
    }, []);

    // 💡 참고: 실제 사용자 이메일은 로그인 세션 등에서 가져와야 합니다.
    const userEmail = userData?.email; 

    // 폴더 목록을 서버에서 불러오는 함수
    const fetchFolders = useCallback(async () => {
        if (!userEmail) return; // userEmail이 없으면 호출하지 않음
        try {
            const fetchedFolders = await getFoldersByUserApi(userEmail);
            setFolders(fetchedFolders);
            console.log("✅ 폴더 목록을 성공적으로 불러왔습니다:", fetchedFolders);
        } catch (error) {
            handleApiError(error, '폴더 목록 조회');
        }
    }, [userEmail]);

    // 컴포넌트 마운트 시 폴더 목록 불러오기
    useEffect(() => {
        fetchFolders();
    }, [fetchFolders, userEmail]); // userEmail을 의존성 배열에 추가

    // if (!userData) {
    //     return <View style={[styles.container, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}><Text>Loading profile...</Text></View>; // 로딩 스피너 또는 플레이스홀더
    // }

    // 폴더 생성/수정 팝업 열기
    const handleCreateFolder = useCallback(() => {
        setPopupMode('create');
        setEditingFolder(null);
        setCreatePopupVisible(true);
    }, []);

    // 폴더 수정 팝업 열기
    const handleEditFolder = useCallback((folderData) => {
        setPopupMode('edit');
        setEditingFolder(folderData);
        setCreatePopupVisible(true);
    }, []);

    // WritePost 페이지로 네비게이션
    const navigateToWritePost = useCallback((folderData) => {
        const params = {};
        if (folderData.folderId) {
            params.directoryId = String(folderData.folderId);
        }
        // 이 부분은 API 응답 형태에 맞춰 수정될 수 있습니다.
        if (folderData.startDate) {
            params.startDate = folderData.startDate;
        }
        if (folderData.endDate) {
            params.endDate = folderData.endDate;
        }

        console.log('Navigating to WritePost with params:', params);
        
        router.push({
            pathname: '/profile/writePost',
            params: params
        });
    }, [router]);

    // 폴더 저장 처리 (API 연동)
    const handleSave = useCallback(async (folderData) => {
        setCreatePopupVisible(false);
        try {
            if (popupMode === 'create') {
                const newFolderData = {
                    title: folderData.title,
                    startDate: folderData.startDate,
                    endDate: folderData.endDate,
                    userEmail: userEmail,
                    // postcards: [] // 엽서 데이터는 비워둠
                };
                console.log('새 폴더 생성 API 호출 준비:', newFolderData);
                const response = await createPostcardWithNewFolderApi(newFolderData);
                Alert.alert('성공', '새 폴더가 생성되었습니다.');
                // 폴더 생성 후 목록 갱신
                await fetchFolders(); 
                // 생성된 폴더 정보로 엽서 작성 페이지 이동
                navigateToWritePost(response);
            } else {
                // 폴더 수정 로직
                const updateData = {
                    title: folderData.title,
                    startDate: folderData.startDate,
                    endDate: folderData.endDate,
                };
                console.log('폴더 수정 API 호출 준비:', editingFolder.folderId, updateData);
                await updateFolderApi(editingFolder.folderId, updateData);
                Alert.alert('성공', '폴더가 수정되었습니다.');
                // 폴더 목록 갱신
                await fetchFolders();
            }
        } catch (error) {
            handleApiError(error, `폴더 ${popupMode === 'create' ? '생성' : '수정'}`);
        }
    }, [popupMode, editingFolder, navigateToWritePost, userEmail, fetchFolders]);

    // 폴더 삭제 처리 (API 연동)
    const handleDelete = useCallback(async (folderId) => {
        setCreatePopupVisible(false);
        try {
            console.log('폴더 삭제 API 호출 준비:', folderId);
            await deleteFolderApi(folderId);
            Alert.alert('성공', '폴더가 삭제되었습니다.');
            // 폴더 목록에서 삭제된 폴더 제거
            await fetchFolders();
        } catch (error) {
            handleApiError(error, '폴더 삭제');
        }
    }, [fetchFolders]);

    // 기존 폴더 선택 처리
    const handleFolderSelect = useCallback((selectedFolder) => {
        console.log('선택된 폴더:', selectedFolder);
        setSelectPopupVisible(false);
        // 선택된 폴더로 WritePost 페이지로 이동
        navigateToWritePost(selectedFolder);
    }, [navigateToWritePost]);

    const handleTabPress = useCallback((tab) => {
        setActiveTab(tab);
    }, []);

    // 플로팅 버튼 옵션 선택 처리
    const handleFloatingButtonOption = useCallback((option) => {
        console.log('Selected option:', option);
        if (option === 'existing') {
            setSelectPopupVisible(true);
        } else if (option === 'new') {
            handleCreateFolder();
        }
    }, [handleCreateFolder]);

    const renderTabContent = useCallback(() => {
        switch (activeTab) {
            case 'board':
                return <PostBoardTab />;
            case 'directory':
                return <PostDirectoryTab 
                    onEditFolder={handleEditFolder} 
                    folders={folders} // 불러온 폴더 데이터를 PostDirectoryTab에 전달
                />;
            default:
                return <PostBoardTab />;
        }
    }, [activeTab, handleEditFolder, folders]);

    return (
        <View style={styles.container}>
            <ProfileHeader userData={userData} />
            <PostTabHeader 
                activeTab={activeTab}
                onTabPress={handleTabPress} 
            />
            <View style={styles.tabContent}>
                {renderTabContent()}
            </View>
            
            <AddPostFloatingButton 
                onOptionSelect={handleFloatingButtonOption}
            />

            <CreatePostDirectoryPopup
                visible={createPopupVisible}
                onClose={() => setCreatePopupVisible(false)}
                onSave={handleSave}
                onDelete={handleDelete}
                mode={popupMode}
                existingData={editingFolder}
            />

            <SelectPostDirectoryPopup
                visible={selectPopupVisible}
                onClose={() => setSelectPopupVisible(false)}
                onSelect={handleFolderSelect}
                folders={folders} // 불러온 폴더 데이터를 SelectPostDirectoryPopup에 전달
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        position: 'relative',
    },
    tabContent: {
        flex: 1,
    },
});
