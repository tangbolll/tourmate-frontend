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
    createPostcardInExistingFolderApi,
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
            // 폴더 목록과 그 안의 엽서들까지 모두 불러옵니다.
            console.log("✅ 폴더 목록을 불러오기 시작합니다.");
            const fetchedFolders = await getFoldersByUserApi(email);
            const foldersWithPostcards = await Promise.all(
                fetchedFolders.map(async (folder) => {
                    try {
                        const postcards = await getPostcardsByFolderApi(folder.id);
                        return { ...folder, postcards: postcards };
                    } catch (error) {
                        console.error(`❌ 폴더 ID ${folder.id}의 엽서 불러오기 실패:`, error);
                        return { ...folder, postcards: [] };
                    }
                })
            );

            // 썸네일 추가 로직 (기존 로직과 유사)
            const foldersWithThumbnails = foldersWithPostcards.map(folder => ({
                ...folder,
                thumbnailUrl: folder.postcards.length > 0 ? folder.postcards[0].imageUrl : null,
            }));
            
            setFolders(foldersWithThumbnails);
            console.log("✅ 폴더 목록을 성공적으로 불러왔습니다:", foldersWithThumbnails);

            // 즐겨찾기 엽서 목록 불러오기
            console.log("✅ 즐겨찾기 엽서 목록을 불러오기 시작합니다.");
            const fetchedFavoritePostcards = await getFavoritePostcardsApi(email);

            // --- 👇 여기가 핵심 수정 부분입니다 ---
            // 즐겨찾기 엽서에 폴더 정보를 추가(보강)합니다.
            const enrichedFavoritePostcards = fetchedFavoritePostcards.map(favPostcard => {
                // 이 즐겨찾기 엽서가 속한 폴더를 찾습니다.
                const parentFolder = foldersWithPostcards.find(folder =>
                    folder.postcards.some(p => p.postcardId === favPostcard.postcardId)
                );

                if (parentFolder) {
                    console.log("폴더 정보: ", parentFolder);
                    // 폴더 정보를 찾았다면, 기존 엽서 정보에 폴더 정보를 합쳐서 반환합니다.
                    return {
                        ...favPostcard, // 기존 즐겨찾기 엽서의 모든 정보
                        directoryId: parentFolder.id,
                        directoryName: parentFolder.title,
                        startDate: parentFolder.startDate,
                        endDate: parentFolder.endDate,
                    };
                }
                // 폴더를 못 찾으면 기존 정보만 반환 (이런 경우는 거의 없습니다)
                return favPostcard;
            });

            setFavoritePostcards(enrichedFavoritePostcards);
            console.log("✅ 폴더 정보가 추가된 즐겨찾기 엽서 목록:", enrichedFavoritePostcards);
            // --- 👆 여기까지가 핵심 수정 부분입니다 ---

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
        console.log('=== handleEditFolder 호출됨 ===');
        console.log('전달받은 folderData:', folderData);
        console.log('folderData.folderId:', folderData.folderId);
        console.log('folderData 타입:', typeof folderData.folderId);
        
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
        params.newlyCreated = 'true';

        console.log('Navigating to WritePost with params:', params);
        router.push({
            pathname: '/profile/writePost',
            params: params,
        });
    }, [router]);

    //기존 폴더에 엽서 추가 
    const handleAddPostcardToExistingFolder = useCallback(async (selectedFolder) => {
        console.log('=== 기존 폴더에 엽서 추가 시작 ===');
        console.log('선택된 폴더:', selectedFolder);
        
        setSelectPopupVisible(false); // 선택 팝업 닫기
        
        if (!userEmail) {
            Alert.alert('오류', '사용자 정보를 불러올 수 없습니다. 다시 로그인 해주세요.');
            return;
        }
        
        try {
            // 기본 엽서 데이터 생성
            const postcardData = {
                content: '',
                postcardType: 1, // 기본 엽서 템플릿
            };
            
            console.log('기존 폴더에 엽서 생성:', {
                folderId: selectedFolder.id,
                postcardData
            });
            
            // API 호출
            const response = await createPostcardInExistingFolderApi(
                selectedFolder.id, 
                postcardData
            );
            
            console.log('✅ 엽서 생성 응답:', response);
            
            if (response && response.postcardId) {
                Alert.alert('성공', '새 엽서가 생성되었습니다.', [
                    {
                        text: '확인',
                        onPress: () => {
                            // WritePost 페이지로 이동하면서 새로 생성된 엽서 ID 전달
                            const params = {
                                directoryId: selectedFolder.id.toString(),
                                directoryName: selectedFolder.title,
                                startDate: selectedFolder.startDate,
                                endDate: selectedFolder.endDate,
                                postcardId: response.postcardId.toString(), // 새로 생성된 엽서 ID
                                newlyCreated: 'false' // 기존 폴더
                            };
                            
                            console.log('WritePost로 이동할 params:', params);
                            
                            router.push({
                                pathname: '/profile/writePost',
                                params: params
                            });
                        }
                    }
                ]);
            } else {
                throw new Error('엽서 생성 응답에 postcardId가 없습니다.');
            }
            
        } catch (error) {
            console.error('❌ 기존 폴더에 엽서 추가 오류:', error);
            handleApiError(error, '엽서 추가');
        }
    }, [router, userEmail]);

    const handleSave = useCallback(async (folderData) => {
        console.log('=== handleSave 호출됨 ===');
        console.log('현재 popupMode:', popupMode);
        console.log('전달받은 folderData:', folderData);
        console.log('현재 editingFolder:', editingFolder);
        
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

                // API 응답(ID)과 요청 시 사용한 데이터(제목, 날짜)를 합쳐서 전달
                const fullFolderData = {
                    ...requestBody.folder, // title, startDate, endDate
                    id: response.folderId || response.id,
                    postcardId: response.postcardId
                };
                navigateToWritePost(fullFolderData);
            } else {
                // 폴더 수정 로직
                console.log('=== 폴더 수정 시작 ===');
                
                // ✅ 수정: folderId -> id로 변경
                const folderId = editingFolder.id; // editingFolder.folderId 대신 editingFolder.id 사용
                console.log('editingFolder.id:', folderId);
                console.log('editingFolder.id 타입:', typeof folderId);
                
                // editingFolder가 제대로 설정되어 있는지 확인
                if (!editingFolder || !folderId) {
                    console.error('❌ editingFolder 또는 id가 없습니다!');
                    console.log('현재 editingFolder 전체:', editingFolder);
                    Alert.alert('오류', 'editingFolder 정보가 없습니다.');
                    return;
                }
                
                const updateData = {
                    title: folderData.title,
                    startDate: folderData.startDate,
                    endDate: folderData.endDate,
                };
                
                console.log('폴더 수정 API 호출 준비:');
                console.log('- folderId:', folderId);
                console.log('- updateData:', updateData);
                
                // API 호출 직전 로그
                console.log('updateFolderApi 호출 직전');
                await updateFolderApi(folderId, updateData); // editingFolder.folderId 대신 folderId 사용
                console.log('✅ updateFolderApi 호출 완료');
                
                Alert.alert('성공', '폴더가 수정되었습니다.');
                await fetchData(userEmail);
            }
        } catch (error) {
            console.error('❌ handleSave 에러:', error);
            console.log('에러 상세:', {
                message: error.message,
                stack: error.stack,
                editingFolder: editingFolder,
                popupMode: popupMode
            });
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

    const handleFolderSelect = useCallback(async (selectedFolder) => {
        console.log('=== 폴더 선택됨 ===');
        console.log('선택된 폴더:', selectedFolder);
        
        setSelectPopupVisible(false); // 선택 팝업 닫기
        
        if (!userEmail) {
            Alert.alert('오류', '사용자 정보를 불러올 수 없습니다. 다시 로그인 해주세요.');
            return;
        }
        
        try {
            // 기본 엽서 데이터 생성
            const postcardData = {
                content: '',
                postcardType: 1, // 기본 엽서 템플릿
            };
            
            console.log('기존 폴더에 엽서 생성:', {
                folderId: selectedFolder.id,
                postcardData
            });
            
            // API 호출로 새 엽서 생성
            const response = await createPostcardInExistingFolderApi(
                selectedFolder.id, 
                postcardData
            );
            
            console.log('✅ 엽서 생성 응답:', response);
            
            if (response && response.postcardId) {
                // WritePost 페이지로 바로 이동
                const params = {
                    directoryId: selectedFolder.id.toString(),
                    directoryName: selectedFolder.title,
                    startDate: selectedFolder.startDate,
                    endDate: selectedFolder.endDate,
                    postcardId: response.postcardId.toString(), // 새로 생성된 엽서 ID
                    newlyCreated: 'false' // 기존 폴더이므로 false
                };
                
                console.log('WritePost로 이동할 params:', params);
                
                router.push({
                    pathname: '/profile/writePost',
                    params: params
                });
            } else {
                throw new Error('엽서 생성 응답에 postcardId가 없습니다.');
            }

            
        } catch (error) {
            console.error('❌ 기존 폴더에 엽서 추가 오류:', error);
            handleApiError(error, '엽서 추가');
        }
    }, [router, userEmail]);

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
                    onRefresh={() => fetchData(userEmail)} // ⭐ 추가
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
