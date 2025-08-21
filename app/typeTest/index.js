import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    SafeAreaView,
    StatusBar,
    } from 'react-native';
import { router } from 'expo-router';

export default function TypeTestMain() {
    const handleStartTest = () => {
        router.push('/typeTest/question');
    };

    return (
        <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        
        <View style={styles.content}>
            <Text style={styles.title}>여행 성향 테스트</Text>
            
            <Text style={styles.subtitle}>
            2분만에 알아보는 당신의 여행 성향
            </Text>
            <Text style={styles.description}>
            맞춤형 동행과 여행정보를 추천받아 보세요 !
            </Text>
            
            <View style={styles.imageContainer}>
                    <Image
                    source={require('../../assets/typeTestIntro.png')} // 실제 이미지 경로로 변경
                    style={styles.image}
                    resizeMode="stretch"
                    />
            </View>
            
            <TouchableOpacity style={styles.startButton} onPress={handleStartTest}>
            <Text style={styles.startButtonText}>테스트 시작하기</Text>
            </TouchableOpacity>
        </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 4,
    },
    description: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 40,
    },
    imageContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        marginBottom: 60,
    },
    image: {
        width: 280,
        height: 130,
    },
    startButton: {
        backgroundColor: '#000000',
        paddingHorizontal: 60,
        paddingVertical: 16,
        borderRadius: 18,
        width: '80%',
        alignItems: 'center',
    },
    startButtonText: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: '600',
    },
});