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
    createPostcardInExistingFolderApi, // 추가: 기존 폴더에 엽서 생성 API
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
        
        // folderData에서 id 또는 folderId를 찾아 directoryId로 설정
        const directoryId = folderData?.folderId || folderData?.id;
        if (directoryId) {
            params.directoryId = String(directoryId);
        }
        
        // folderData에서 title 또는 name을 찾아 directoryName으로 설정
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

    const fetchFolders = useCallback(async (email) => {
        if (!email) return; 
        try {
            const fetchedFolders = await getFoldersByUserApi(email);
            setFolders(fetchedFolders);
            console.log("✅ 폴더 목록을 성공적으로 불러왔습니다:", fetchedFolders);
        } catch (error) {
            handleApiError(error, '폴더 목록 조회');
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const tokenInfo = await checkToken();
                console.log('📝 ProfileHome - 토큰 정보:', tokenInfo);
                const userId = await AsyncStorage.getItem('userId');
                
                if (userId) {
                    const data = await fetchUserProfileApi(userId);
                    setUserData(data);
                    if (data?.email) {
                        fetchFolders(data.email);
                    }
                }
            } catch (error) {
                console.error('Error fetching data in ProfileHome:', error);
            }
        };
        fetchData();
    }, [fetchFolders]);

    const userEmail = userData?.email; 

    const handleCreateFolder = useCallback(() => {
        setPopupMode('create');
        setEditingFolder(null);
        setCreatePopupVisible(true);
    }, []);

    const handleEditFolder = useCallback((folderData) => {
        setPopupMode('edit');
        setEditingFolder(folderData);
        setCreatePopupVisible(true);
    }, []);

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
            // 저장 후 폴더 목록 갱신
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
                
                // API 응답의 실제 구조를 확인하기 위한 로그 추가
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
    }, [activeTab, handleEditFolder, folders]);

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
