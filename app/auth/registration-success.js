import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';

const RegistrationSuccessScreen = () => {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <Image
                source={require('../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
            />
            <View style={styles.content}>
                <Text style={styles.subtitle}>회원가입이 완료되었습니다.</Text>
                <Text style={styles.subtitle}>투어메이트를 자유롭게 이용해보세요 !</Text>
                
                <TouchableOpacity style={[styles.section, { marginTop: 30 }]} onPress={() => router.replace('/')}>
                    <View style={styles.sectionTitleContainer}>
                        <Text style={styles.sectionTitle}>TourMate 바로 이용하기</Text>
                        <Text style={styles.arrowIcon}>{' > '}</Text>
                    </View>
                    <Text style={styles.sectionText}>여행을 계획하고, 동행을 찾아보고, 여행엽서에 추억을 기록해보세요 !</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.section} onPress={() => router.push('/typeTest')}>
                    <View style={styles.sectionTitleContainer}>
                        <Text style={styles.sectionTitle}>여행 성향 테스트 하기</Text>
                        <Text style={styles.arrowIcon}>{' > '}</Text>
                    </View>
                    <Text style={styles.sectionText}>결과를 바탕으로 맞춤형 동행 및 여행정보를 추천받을 수 있어요 !</Text>
                </TouchableOpacity>

                
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    logo: {
        width: 200,
        height: 160,
        marginBottom: -30,
    },
    content: {
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: 20,
        color: '#666',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    section: {
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        width: '90%',
        marginHorizontal: '5%',
        borderWidth: 1,
        borderColor: '#CCCCCC',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
        marginRight: 0,
        lineHeight: 18,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    sectionText: {
        fontSize: 10,
        color: '#333',
    },
    arrowIcon: {
        fontSize: 18,
        color: '#333',
        fontWeight: 'bold',
        lineHeight: 18,
        marginTop: -7,
    },
    button: {
        backgroundColor: 'black',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginTop: 30,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default RegistrationSuccessScreen;