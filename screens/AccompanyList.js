import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native';
import AccompanyFeed from '../components/AccompanyFeed';
import BottomBar from '../components/BottomBar'; 

const AccompanyList = () => {
return (
    <SafeAreaView style={styles.container}>
        <ScrollView>
            {/* Your other components go here */}
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
      />
      </ScrollView>
      <BottomBar currentTab="accompany" onTabPress={(tab) => console.log(tab)} />

    </SafeAreaView>
  );
};

export default AccompanyList;