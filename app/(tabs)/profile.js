import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import PostTabHeader from '../../components/profile/PostTabHeader';
import PostBoardTab from '../../components/profile/PostBoardTab';
import { PostDirectoryTab } from '../../components/profile/PostDirectoryTab';
import AddPostFloatingButton from '../../components/profile/AddPostFloatingButton';
import CreatePostDirectoryPopup from '../../components/profile/CreatePostDirectoryPopup';
import SelectPostDirectoryPopup from '../../components/profile/SelectPostDirectoryPopup';

export default function ProfileHome() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('board');
    
    // 팝업 상태 관리
    const [createPopupVisible, setCreatePopupVisible] = useState(false);
    const [selectPopupVisible, setSelectPopupVisible] = useState(false);
    const [popupMode, setPopupMode] = useState('create');
    const [editingFolder, setEditingFolder] = useState(null);

    // 폴더 생성 팝업 열기
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

    // WritePost 페이지로 네비게이션 - 개선된 버전
    const navigateToWritePost = useCallback((folderData) => {
        // URL 파라미터로 전달할 때 문자열로 변환
        const params = {};
        
        if (folderData.id) {
            params.directoryId = String(folderData.id);
        }
        if (folderData.name || folderData.folderName) {
            params.directoryName = String(folderData.name || folderData.folderName);
        }
        if (folderData.startDate) {
            params.startDate = folderData.startDate instanceof Date 
                ? folderData.startDate.toISOString() 
                : String(folderData.startDate);
        }
        if (folderData.endDate) {
            params.endDate = folderData.endDate instanceof Date 
                ? folderData.endDate.toISOString() 
                : String(folderData.endDate);
        }

        console.log('Navigating to WritePost with params:', params);
        
        router.push({
            pathname: '/profile/writePost',
            params: params
        });
    }, [router]);

    // 폴더 저장 처리
    const handleSave = useCallback((folderData) => {
        if (popupMode === 'create') {
            // 새 폴더 생성 로직
            console.log('새 폴더 생성:', folderData);
            // 새 폴더 생성 후 바로 WritePost로 이동
            navigateToWritePost(folderData);
        } else {
            // 폴더 수정 로직
            console.log('폴더 수정:', folderData);
        }
        setCreatePopupVisible(false);
    }, [popupMode, navigateToWritePost]);

    // 폴더 삭제 처리
    const handleDelete = useCallback((folderId) => {
        // 폴더 삭제 로직
        console.log('폴더 삭제:', folderId);
        setCreatePopupVisible(false);
    }, []);

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
            // 기존 폴더에 엽서 추가 - 폴더 선택 팝업 열기
            setSelectPopupVisible(true);
        } else if (option === 'new') {
            // 새 폴더에 엽서 추가 - 폴더 생성 팝업 열기
            handleCreateFolder();
        }
    }, [handleCreateFolder]);

    const renderTabContent = useCallback(() => {
        switch (activeTab) {
            case 'board':
                return <PostBoardTab />;
            case 'directory':
                return <PostDirectoryTab onEditFolder={handleEditFolder} />;
            default:
                return <PostBoardTab />;
        }
    }, [activeTab, handleEditFolder]);

    return (
        <View style={styles.container}>
            <ProfileHeader />
            <PostTabHeader 
                activeTab={activeTab}
                onTabPress={handleTabPress} 
            />
            <View style={styles.tabContent}>
                {renderTabContent()}
            </View>
            
            {/* 플로팅 버튼 */}
            <AddPostFloatingButton 
                onOptionSelect={handleFloatingButtonOption}
            />

            {/* 폴더 생성/수정 팝업 */}
            <CreatePostDirectoryPopup
                visible={createPopupVisible}
                onClose={() => setCreatePopupVisible(false)}
                onSave={handleSave}
                onDelete={handleDelete}
                mode={popupMode}
                existingData={editingFolder}
            />

            {/* 기존 폴더 선택 팝업 */}
            <SelectPostDirectoryPopup
                visible={selectPopupVisible}
                onClose={() => setSelectPopupVisible(false)}
                onSelect={handleFolderSelect}
                selectedFolder={null}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        position: 'relative', // 플로팅 버튼을 위한 relative positioning
    },
    tabContent: {
        flex: 1,
    },
});