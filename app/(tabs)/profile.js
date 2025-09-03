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
    getFavoritePostcardsApi,
    getPostcardsByFolderApi, 
} from '../../utils/PostCardApi';

export default function ProfileHome() {
    const { signOut } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('board');
    const [folders, setFolders] = useState([]);
    const [favoritePostcards, setFavoritePostcards] = useState([]);
    const [createPopupVisible, setCreatePopupVisible] = useState(false);
    const [selectPopupVisible, setSelectPopupVisible] = useState(false);
    const [popupMode, setPopupMode] = useState('create');
    const [editingFolder, setEditingFolder] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가
    const { userData, setUserData } = useUserStore();

    // 모든 데이터를 한 번에 불러오는 함수 (폴더, 즐겨찾기)
    const fetchData = useCallback(async (email) => {
        setIsLoading(true);
        if (!email) {
            console.log("⚠️ userEmail이 없으므로 데이터를 불러오지 않습니다.");
            setIsLoading(false);
            return;
        }
        try {
            // 폴더 목록 불러오기
            console.log("✅ 폴더 목록을 불러오기 시작합니다.");
            const fetchedFolders = await getFoldersByUserApi(email);
            const foldersWithThumbnails = await Promise.all(
                fetchedFolders.map(async (folder) => {
                    try {
                        const postcards = await getPostcardsByFolderApi(folder.id);
                        const firstPostcardImage = postcards.length > 0 ? postcards[0].imageUrl : null;
                        return {
                            ...folder,
                            thumbnailUrl: firstPostcardImage,
                            postcards: postcards,
                        };
                    } catch (error) {
                        console.error(`❌ 폴더 ID ${folder.id}의 엽서 불러오기 실패:`, error);
                        return { ...folder, thumbnailUrl: null, postcards: [] };
                    }
                })
            );
            setFolders(foldersWithThumbnails);
            console.log("✅ 폴더 목록을 성공적으로 불러왔습니다:", foldersWithThumbnails);

            // 즐겨찾기 엽서 목록 불러오기
            console.log("✅ 즐겨찾기 엽서 목록을 불러오기 시작합니다.");
            const fetchedPostcards = await getFavoritePostcardsApi(email);
            setFavoritePostcards(fetchedPostcards);
            console.log("✅ 즐겨찾기 엽서 목록을 성공적으로 불러왔습니다:", fetchedPostcards);

        } catch (error) {
            handleApiError(error, '데이터 조회');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // PostBoardTab에서 데이터 변경 요청 시 호출
    const handleDataUpdate = useCallback((postcardId, actionType, wasActive) => {
        // 스크랩 해제(un-scrap) 동작일 경우, 즐겨찾기 목록에서 해당 엽서를 제거
        if (actionType === 'scrap' && wasActive) {
            setFavoritePostcards(prevPostcards =>
                prevPostcards.filter(p => p.postcardId !== postcardId && p.id !== postcardId)
            );
        }
    }, []);

    // 컴포넌트 마운트 시 사용자 데이터와 모든 목록 불러오기
    useEffect(() => {
        const fetchUserDataAndAllContent = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (userId) {
                    const data = await fetchUserProfileApi(userId);
                    setUserData(data);
                    if (data?.email) {
                        fetchData(data.email);
                    }
                }
            } catch (error) {
                console.error('Error fetching data in ProfileHome:', error);
            }
        };
        fetchUserDataAndAllContent();
    }, [fetchData, setUserData]);

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

    const handleSave = useCallback(async (folderData) => {
        setCreatePopupVisible(false);
        if (!userEmail) {
            Alert.alert('오류', '사용자 정보를 불러올 수 없습니다. 다시 로그인 해주세요.');
            return;
        }
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
                const response = await createPostcardWithNewFolderApi(requestBody.folder, requestBody.postcard);
                console.log('⭐ 새 폴더 생성 API 응답:', response);
                Alert.alert('성공', '새 폴더가 생성되었습니다.');
                await fetchData(userEmail);
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
                await fetchData(userEmail);
            }
        } catch (error) {
            handleApiError(error, `폴더 ${popupMode === 'create' ? '생성' : '수정'}`);
        }
    }, [popupMode, editingFolder, navigateToWritePost, userEmail, fetchData]);

    const handleDelete = useCallback(async (folderId) => {
        setCreatePopupVisible(false);
        try {
            console.log('폴더 삭제 API 호출 준비:', folderId);
            await deleteFolderApi(folderId);
            Alert.alert('성공', '폴더가 삭제되었습니다.');
            await fetchData(userEmail);
        } catch (error) {
            handleApiError(error, '폴더 삭제');
        }
    }, [fetchData, userEmail]);

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
                return <PostBoardTab
                    userEmail={userEmail}
                    favoritePostcards={favoritePostcards}
                    onDataUpdate={handleDataUpdate} // ⭐ 추가
                    onRefresh={() => fetchData(userEmail)} // ⭐ 추가
                />;
            case 'directory':
                return <PostDirectoryTab
                    onEditFolder={handleEditFolder}
                    folders={folders}
                />;
            default:
                return <PostBoardTab
                    userEmail={userEmail}
                    favoritePostcards={favoritePostcards}
                    onDataUpdate={handleDataUpdate} // ⭐ 추가
                    onRefresh={() => fetchData(userEmail)} // ⭐ 추가
                />;
        }
    }, [activeTab, handleEditFolder, folders, userEmail, favoritePostcards, handleDataUpdate, fetchData]);

    if (isLoading) {
        return <View style={[styles.container, { backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }]}><Text>프로필을 불러오는 중입니다...</Text></View>;
    }

    if (!userData) {
        return <View style={[styles.container, { backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }]}><Text>프로필을 불러오는 중입니다...</Text></View>;
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
