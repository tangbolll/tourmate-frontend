import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import PostTabHeader from '../../components/profile/PostTabHeader';
import PostBoardTab from '../../components/profile/PostBoardTab';
import { PostDirectoryTab } from '../../components/profile/PostDirectoryTab';
import AddPostFloatingButton from '../../components/profile/AddPostFloatingButton';
import CreatePostDirectoryPopup from '../../components/profile/CreatePostDirectoryPopup';
import SelectPostDirectoryPopup from '../../components/profile/SelectPostDirectoryPopup';

export default function ProfileHome() {
    const [activeTab, setActiveTab] = useState('board');
    
    // 팝업 상태 관리
    const [createPopupVisible, setCreatePopupVisible] = useState(false);
    const [selectPopupVisible, setSelectPopupVisible] = useState(false);
    const [popupMode, setPopupMode] = useState('create');
    const [editingFolder, setEditingFolder] = useState(null);

    // 폴더 생성 팝업 열기
    const handleCreateFolder = () => {
        setPopupMode('create');
        setEditingFolder(null);
        setCreatePopupVisible(true);
    };

    // 폴더 수정 팝업 열기
    const handleEditFolder = (folderData) => {
        setPopupMode('edit');
        setEditingFolder(folderData);
        setCreatePopupVisible(true);
    };

    // 폴더 저장 처리
    const handleSave = (folderData) => {
        if (popupMode === 'create') {
            // 새 폴더 생성 로직
            console.log('새 폴더 생성:', folderData);
        } else {
            // 폴더 수정 로직
            console.log('폴더 수정:', folderData);
        }
        setCreatePopupVisible(false);
    };

    // 폴더 삭제 처리
    const handleDelete = (folderId) => {
        // 폴더 삭제 로직
        console.log('폴더 삭제:', folderId);
        setCreatePopupVisible(false);
    };

    // 기존 폴더 선택 처리
    const handleFolderSelect = (selectedFolder) => {
        console.log('선택된 폴더:', selectedFolder);
        setSelectPopupVisible(false);
        // 여기서 선택된 폴더에 엽서를 추가하는 로직을 구현하거나
        // 다음 화면으로 네비게이션 할 수 있습니다.
    };

    const handleTabPress = (tab) => {
        setActiveTab(tab);
    };

    // 플로팅 버튼 옵션 선택 처리
    const handleFloatingButtonOption = (option) => {
        console.log('Selected option:', option);
        
        if (option === 'existing') {
            // 기존 폴더에 엽서 추가 - 폴더 선택 팝업 열기
            setSelectPopupVisible(true);
        } else if (option === 'new') {
            // 새 폴더에 엽서 추가 - 폴더 생성 팝업 열기
            handleCreateFolder();
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'board':
                return <PostBoardTab />;
            case 'directory':
                return <PostDirectoryTab onEditFolder={handleEditFolder} />;
            default:
                return <PostBoardTab />;
        }
    };

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