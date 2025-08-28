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
    handleApiError,
    checkToken,
    testServerConnection,
    createPostcardInExistingFolderApi,
} from '../../utils/PostCardApi';

export default function ProfileHome() {
    const { signOut } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('board');
    const [folders, setFolders] = useState([]);
    const [createPopupVisible, setCreatePopupVisible] = useState(false);
    const [selectPopupVisible, setSelectPopupVisible] = useState(false);
    const [popupMode, setPopupMode] = useState('create');
    const [editingFolder, setEditingFolder] = useState(null);
    const { userData, setUserData } = useUserStore();

    // 폴더 목록을 서버에서 불러오는 함수를 useCallback으로 정의
    // 이 함수는 userEmail이 변경될 때만 새로 생성됩니다.
    const fetchFolders = useCallback(async (email) => {
        if (!email) {
            console.log("⚠️ userEmail이 없으므로 폴더 목록을 불러오지 않습니다.");
            return;
        }
        try {
            const fetchedFolders = await getFoldersByUserApi(email);
            setFolders(fetchedFolders);
            console.log("✅ 폴더 목록을 성공적으로 불러왔습니다:", fetchedFolders);
        } catch (error) {
            handleApiError(error, '폴더 목록 조회');
        }
    }, []); // 이 함수는 userEmail에 의존하지 않으므로, 의존성 배열을 비워둡니다.

    // 컴포넌트 마운트 시 사용자 데이터와 폴더 목록 불러오기
    useEffect(() => {
        const fetchData = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (userId) {
                    const data = await fetchUserProfileApi(userId);
                    setUserData(data);
                    if (data?.email) {
                        // 사용자 이메일이 있을 때만 폴더를 가져옵니다.
                        fetchFolders(data.email);
                    }
                }
            } catch (error) {
                console.error('Error fetching data in ProfileHome:', error);
            }
        };
        fetchData();
    }, [fetchFolders]);

    // userData?.email을 사용하여 userEmail 변수 정의
    const userEmail = userData?.email; 

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
        
        const directoryId = folderData?.folderId || folderData?.id;
        if (directoryId) {
            params.directoryId = String(directoryId);
        }
        
        const directoryName = folderData?.title || folderData?.name;
        if (directoryName) {
            params.directoryName = directoryName;
        }

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

    // 엽서 저장 로직
    const handleSavePostcard = useCallback(async (folderId, postcardData) => {
        try {
            if (folderId) {
                console.log('기존 폴더에 엽서 저장:', folderId);
                const response = await createPostcardInExistingFolderApi(folderId, postcardData);
                Alert.alert('성공', '엽서가 기존 폴더에 저장되었습니다.');
                console.log('엽서 저장 성공:', response);
            } else {
                console.log('새 폴더에 엽서 저장');
                const requestBody = {
                    userEmail: userEmail,
                    folder: {
                        title: postcardData.title || '새 폴더',
                        startDate: postcardData.startDate,
                        endDate: postcardData.endDate,
                    },
                    postcard: {
                        content: postcardData.content,
                        imageUrl: postcardData.imageUrl,
                        postcardType: postcardData.postcardType,
                    },
                };
                const response = await createPostcardWithNewFolderApi(requestBody);
                Alert.alert('성공', '새 폴더와 함께 엽서가 저장되었습니다.');
                console.log('새 폴더에 엽서 저장 성공:', response);
            }
            await fetchFolders(userEmail);

        } catch (error) {
            handleApiError(error, '엽서 저장');
        }
    }, [userEmail, fetchFolders]);

    const handleSave = useCallback(async (folderData) => {
        setCreatePopupVisible(false);
        try {
            if (popupMode === 'create') {
                const requestBody = {
                    userEmail: userEmail,
                    folder: {
                        title: folderData.title,
                        startDate: folderData.startDate,
                        endDate: folderData.endDate,
                    },
                    postcard: {
                        content: '',
                        imageUrl: '',
                        postcardType: 1, 
                    },
                };
                console.log('새 폴더 및 엽서 생성 API 호출 준비:', requestBody);
                const response = await createPostcardWithNewFolderApi(requestBody);
                
                console.log('⭐ 새 폴더 생성 API 응답:', response);

                Alert.alert('성공', '새 폴더가 생성되었습니다.');
                await fetchFolders(userEmail);
                navigateToWritePost(response);
            } else {
                const updateData = {
                    title: folderData.title,
                    startDate: folderData.startDate,
                    endDate: folderData.endDate,
                };
                console.log('폴더 수정 API 호출 준비:', editingFolder.folderId, updateData);
                await updateFolderApi(editingFolder.folderId, updateData);
                Alert.alert('성공', '폴더가 수정되었습니다.');
                await fetchFolders(userEmail);
            }
        } catch (error) {
            handleApiError(error, `폴더 ${popupMode === 'create' ? '생성' : '수정'}`);
        }
    }, [popupMode, editingFolder, navigateToWritePost, userEmail, fetchFolders]);

    const handleDelete = useCallback(async (folderId) => {
        setCreatePopupVisible(false);
        try {
            console.log('폴더 삭제 API 호출 준비:', folderId);
            await deleteFolderApi(folderId);
            Alert.alert('성공', '폴더가 삭제되었습니다.');
            await fetchFolders(userEmail);
        } catch (error) {
            handleApiError(error, '폴더 삭제');
        }
    }, [fetchFolders, userEmail]);

    const handleFolderSelect = useCallback((selectedFolder) => {
        console.log('선택된 폴더:', selectedFolder);
        setSelectPopupVisible(false);
        navigateToWritePost(selectedFolder);
    }, [navigateToWritePost]);

    const handleTabPress = useCallback((tab) => {
        setActiveTab(tab);
    }, []);

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
                return <PostBoardTab userEmail={userEmail} />;
            case 'directory':
                return <PostDirectoryTab 
                    onEditFolder={handleEditFolder} 
                    folders={folders}
                />;
            default:
                return <PostBoardTab userEmail={userEmail}/>;
        }
    }, [activeTab, handleEditFolder, folders, userEmail]);

    if (!userData) {
        return <View style={[styles.container, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}><Text>Loading profile...</Text></View>;
    }

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
                folders={folders}
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
