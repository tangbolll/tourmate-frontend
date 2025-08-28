import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeHeader from '../../components/home/HomeHeader';
import TourSection from '../../components/home/TourSection';
import PostSection from '../../components/home/PostSection';

const Home = () => {
    return (
        <SafeAreaView style={styles.container}>
            <HomeHeader />
        <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
        >
            <TourSection />
            <PostSection />
        </ScrollView>
        </SafeAreaView>
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