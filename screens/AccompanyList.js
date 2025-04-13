import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import AccompanyFeed from '../components/AccompanyFeed';
import BottomBar from '../components/BottomBar'; 

// navigation prop을 받도록 수정
const AccompanyList = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
        <ScrollView>
            <AccompanyFeed
            date="03.04 월"
            title="공주 공산성에서 야경 같이 즐겨요"
            tags={['야경', '여자만', '저녁식사', '걷기']}
            location="공주"
            participants={2}
            maxParticipants={3}
            imageUrl="https://your-image-url.com/image.jpg"
            liked={true}
            onPressLike={() => console.log('찜 눌림')}
            // 피드 클릭 시 AccompanyPost 화면으로 이동하는 onPress 함수 추가
            onPress={() => navigation.navigate('AccompanyPost', { 
                // 필요한 데이터를 파라미터로 전달
                postId: '1', 
                title: '공주 공산성에서 야경 같이 즐겨요',
                // 기타 필요한 정보들
            })}
            />
        </ScrollView>
        <BottomBar currentTab="accompany" onTabPress={(tab) => console.log(tab)} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});

export default AccompanyList;