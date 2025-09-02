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
import { Ionicons } from '@expo/vector-icons';

export default function TypeTestMain() {
    const handleStartTest = () => {
        router.push('/typeTest/question');
    };

    const handleGoHome = () => {
        router.replace('/(tabs)');
    };

    return (
        <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        
        <View style={styles.header}>
            <View style={styles.placeholder} />
            <Text style={styles.headerTitle}>여행 성향 테스트</Text>
            <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
                <Ionicons name="home-outline" size={24} color="black" />
            </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
            <Text style={styles.title}>여행 성향 테스트</Text>
            
            <Text style={styles.subtitle}>
            2분만에 알아보는 당신의 여행 성향
            </Text>
            <Text style={styles.description}>
            맞춤형 동행과 여행정보를 추천받아 보세요!
            </Text>
            
            <View style={styles.imageContainer}>
                <View style={[styles.imageWrapper, { zIndex: 3 }]}>
                    <Image 
                        source={require('../../assets/typeTest/IPER.png')} 
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>
                <View style={[styles.imageWrapper, { zIndex: 2 }]}>
                    <Image 
                        source={require('../../assets/typeTest/JPED.png')} 
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>
                <View style={[styles.imageWrapper, { zIndex: 1 }]}>
                    <Image 
                        source={require('../../assets/typeTest/JAED.png')} 
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
    },
    placeholder: {
        width: 24,
    },
    homeButton: {
        padding: 5,
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
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginBottom: 60,
        marginLeft: 40,
        height: 120,
    },
    imageWrapper: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#ffffff',
        borderWidth: 3,
        borderColor: '#cccccc',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        marginLeft: -40,
    },
    image: {
        width: 120,
        height: 120,
        borderRadius: 50,
    },
    startButton: {
        backgroundColor: '#000000',
        paddingHorizontal: 60,
        paddingVertical: 16,
        borderRadius: 18,
        width: '85%',
        alignItems: 'center',
    },
    startButtonText: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: '600',
    },
});