import React, { useState } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import PostTabHeader from '../../components/profile/PostTabHeader';
import PostBoardTab from '../../components/profile/PostBoardTab';
import { PostDirectoryTab } from '../../components/profile/PostDirectoryTab';
import AddPostFloatingButton from '../../components/profile/AddPostFloatingButton';
import CreatePostDirectoryPopup from '../../components/profile/CreatePostDirectoryPopup';

export default function ProfileHome() {
    const [activeTab, setActiveTab] = useState('board');
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupMode, setPopupMode] = useState('create');
    const [editingFolder, setEditingFolder] = useState(null);

    // 생성 버튼 클릭
    const handleCreateFolder = () => {
        setPopupMode('create');
        setEditingFolder(null);
        setPopupVisible(true);
    };

    // 수정 버튼 클릭
    const handleEditFolder = (folderData) => {
        setPopupMode('edit');
        setEditingFolder(folderData);
        setPopupVisible(true);
    };

    // 저장 처리
    const handleSave = (folderData) => {
        if (popupMode === 'create') {
        // 새 폴더 생성 로직
        console.log('새 폴더 생성:', folderData);
        } else {
        // 폴더 수정 로직
        console.log('폴더 수정:', folderData);
        }
    };

    // 삭제 처리
    const handleDelete = (folderId) => {
        // 폴더 삭제 로직
        console.log('폴더 삭제:', folderId);
    };

    const handleTabPress = (tab) => {
        setActiveTab(tab);
    };

    const handleFloatingButtonOption = (option) => {
        // 추후 구현: 각 옵션에 맞는 팝업 또는 네비게이션
        console.log('Selected option:', option);
        
        if (option === 'existing') {
            // 기존 폴더에 엽서 추가 로직
            console.log('기존 폴더에 엽서 추가');
        } else if (option === 'new') {
            // 새 폴더에 엽서 추가 로직
            console.log('새 폴더에 엽서 추가');
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'board':
                return <PostBoardTab />;
            case 'directory':
                return <PostDirectoryTab />;
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
            <Button title="폴더 생성" onPress={handleCreateFolder} />
            <Button 
                title="폴더 수정" 
                onPress={() => handleEditFolder({
                id: 1,
                name: 'Busan',
                startDate: '2024-03-04',
                endDate: '2024-03-06'
                })} 
            />

            <CreatePostDirectoryPopup
                visible={popupVisible}
                onClose={() => setPopupVisible(false)}
                onSave={handleSave}
                onDelete={handleDelete}
                mode={popupMode}
                existingData={editingFolder}
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