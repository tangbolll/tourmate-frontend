import React, { useState, useRef } from 'react';
import { ScrollView, StyleSheet, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeHeader from '../../components/home/HomeHeader';
import TourSection from '../../components/home/TourSection';
import PostSection from '../../components/home/PostSection';

const Home = () => {
    const [refreshing, setRefreshing] = useState(false);
    const tourSectionRef = useRef(null);
    const postSectionRef = useRef(null);

    const handleRefresh = async () => {
        
        setRefreshing(true);
        
        try {
            
            // TourSection 확인
            if (tourSectionRef.current) {
                if (tourSectionRef.current.refresh) {

                    await tourSectionRef.current.refresh();
                    console.log('✅ TourSection refresh 완료');
                } else {
                    console.log('❌ TourSection refresh 함수 없음');
                }
            } else {
                console.log('❌ tourSectionRef가 null');
            }
            
            // PostSection 확인  
            if (postSectionRef.current) {

                if (postSectionRef.current.refresh) {

                    await postSectionRef.current.refresh();
                    console.log('✅ PostSection refresh 완료');
                } else {
                    console.log('❌ PostSection refresh 함수 없음');
                }
            } else {
                console.log('❌ postSectionRef가 null');
            }    
            console.log('🎉 새로고침 완료!');
            
        } catch (error) {
            console.error('❌ 새로고침 오류:', error);
            Alert.alert('오류', `새로고침 중 오류: ${error.message}`);
        } finally {
            console.log('🔄 새로고침 상태 해제');
            setRefreshing(false);
        }
    };

    return (
        <>
            <HomeHeader />
            <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                }
            >
                <TourSection ref={tourSectionRef} />
                <PostSection ref={postSectionRef} />
            </ScrollView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    scrollView: {
        flex: 1,
    },
});

export default Home;