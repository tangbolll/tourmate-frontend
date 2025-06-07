import React, { useState, useEffect } from 'react'; // useState, useEffect 추가
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
    const [message, setMessage] = useState('로딩 중...'); // 상태 추가

    useEffect(() => {
        fetch("http://172.16.130.232:8080/api/hello") // IP 주소로 변경
            .then(response => response.text())
            .then(data => setMessage(data))
            .catch(error => {
                console.error('API 에러:', error);
                setMessage('연결 실패: ' + error.message);
            });
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.text}>홈 페이지입니다</Text>
            <Text style={styles.apiResult}>{message}</Text> {/* API 결과 표시 */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 18,
        fontWeight: '500',
    },
    apiResult: { // 새로운 스타일 추가
        fontSize: 16,
        marginTop: 20,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        textAlign: 'center',
    },
});