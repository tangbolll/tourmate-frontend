import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import PostTabHeader from '../../components/profile/PostTabHeader';
import PostBoardTab from '../../components/profile/PostBoardTab';
import { PostDirectoryTab } from '../../components/profile/PostDirectoryTab';
import AddPostFloatingButton from '../../components/profile/AddPostFloatingButton';

export default function ProfileHome() {
    const [activeTab, setActiveTab] = useState('board');

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