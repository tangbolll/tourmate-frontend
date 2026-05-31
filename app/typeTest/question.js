import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 질문 데이터 - 섞인 순서
const questions = [
    // JI 타입
    {
        id: 1,
        question: "여행 전, 일정을 계획하는 방식은?",
        optionA: "여행지, 식당, 카페를 꼼꼼히 조사해서 시간 단위로 일정표를 만든다.",
        optionB: "교통편과 숙소만 예약하면 충분하다. 나머지는 목적지에 도착하면 정한다.",
        type: "JI"
    },
    // AP 타입
    {
        id: 4,
        question: "여행지를 고를 때 나는?",
        optionA: "잘 알려지지 않은 지역이나 숨겨진 명소를 찾아 탐험한다.",
        optionB: "유명 관광지 위주로 여행하는 게 더 편하고 안심된다.",
        type: "AP"
    },
    // CE 타입
    {
        id: 7,
        question: "여행지에서 내가 더 기대하는 것은?",
        optionA: "낯선 환경 속에서 새로운 문화를 경험할 생각에 설렌다.",
        optionB: "색다른 여행지에서 인생 사진을 남길 생각에 설렌다.",
        type: "CE"
    },
    // DR 타입
    {
        id: 10,
        question: "하루 일정을 계획할 때 선호하는 스타일은?",
        optionA: "뽕을 뽑아야 한다. 여러 장소를 방문하며 바쁘게 움직인다.",
        optionB: "여유롭게 돌아다니며 여행의 분위기를 음미한다.",
        type: "DR"
    },
    // JI 타입
    {
        id: 2,
        question: "교통편과 숙소 예약 시 나의 성향은?",
        optionA: "한두 달 전 미리 예약해두고 마음 편하게 준비한다.",
        optionB: "특가를 기다렸다가, 가장 저렴할 때 예약한다.",
        type: "JI"
    },
    // AP 타입
    {
        id: 5,
        question: "여행 동행을 고민 중일 때 나는...",
        optionA: "낯선 여행지에서 처음 보는 사람들과 떠나는 여행, 그게 바로 여행의 낭만이지!",
        optionB: "여행 스타일 안 맞으면 불편할텐데.. 그럴 바엔 혼자 다니는 게 낫다.",
        type: "AP"
    },
    // CE 타입
    {
        id: 8,
        question: "세계적으로 유명한 문화유적지에 방문했다.",
        optionA: "도슨트 해설 투어에 참여해 유적지의 역사와 의미를 깊이 있게 이해한다.",
        optionB: "자유롭게 구경한 뒤 멋진 인증샷을 남긴다.",
        type: "CE"
    },
    // DR 타입
    {
        id: 11,
        question: "목적지 이동 시 나는?",
        optionA: "이동하는 것마저 여행의 일부다. 40분 이내 거리는 충분히 걸을 수 있다.",
        optionB: "이동할 때만큼은 편하게 가자. 우버를 잡는다.",
        type: "DR"
    },
    // JI 타입
    {
        id: 3,
        question: "여행 준비물을 챙기는 방식은?",
        optionA: "체크리스트를 만들어 하나하나 빠짐없이 챙긴다.",
        optionB: "떠나기 하루 전쯤에 필요한 것만 챙긴다.",
        type: "JI"
    },
    // AP 타입
    {
        id: 6,
        question: "현지인에게 현지 음식을 추천받았다면?",
        optionA: "\"여기 또 언제 와보겠어!\" 다양한 현지 음식에 도전해본다.",
        optionB: "여행에서 모험은 음식 말고도 충분하다. 실패 없는 익숙한 메뉴를 고른다.",
        type: "AP"
    },
    // CE 타입
    {
        id: 9,
        question: "하루 일정이 끝난 뒤 숙소에 도착한 나는 가장 먼저..",
        optionA: "오늘 새롭게 알게 된 지식과 인상 깊었던 순간을 정리하며 의미를 되새긴다.",
        optionB: "여행지 느낌이 물씬 나는 사진을 골라 SNS에 업로드한다.",
        type: "CE"
    },
    // DR 타입
    {
        id: 12,
        question: "여행에서 가장 중요하게 생각하는 것은?",
        optionA: "다양한 경험과 체험을 하며 신나게 즐긴다.",
        optionB: "충분한 휴식과 힐링으로 에너지를 충전한다.",
        type: "DR"
    }
];

// 답변 분석 함수
const calculateTravelType = (answers) => {
    const typeScores = {
        J: 0, I: 0,  // Judging vs Improvised
        A: 0, P: 0,  // Allocentric vs Psycocentric  
        C: 0, E: 0,  // Cultural vs Emotional
        D: 0, R: 0   // Dynamic vs Relaxing
    };

    // 각 답변을 분석해서 점수 계산
    answers.forEach(answer => {
        const { answer: choice, type } = answer;
        
        if (type === 'JI') {
            if (choice === 'A') typeScores.J++;
            else typeScores.I++;
        } else if (type === 'AP') {
            if (choice === 'A') typeScores.A++;
            else typeScores.P++;
        } else if (type === 'CE') {
            if (choice === 'A') typeScores.C++;
            else typeScores.E++;
        } else if (type === 'DR') {
            if (choice === 'A') typeScores.D++;
            else typeScores.R++;
        }
    });

    // 각 카테고리에서 더 높은 점수를 가진 타입 선택
    const resultType = 
        (typeScores.J >= typeScores.I ? 'J' : 'I') +
        (typeScores.A >= typeScores.P ? 'A' : 'P') +
        (typeScores.C >= typeScores.E ? 'C' : 'E') +
        (typeScores.D >= typeScores.R ? 'D' : 'R');

    return resultType;
};

export default function Question() {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);

    const handleAnswer = (answer) => {
        setSelectedOption(answer);
        
        // 잠시 선택 효과를 보여주고 다음 질문으로
        setTimeout(() => {
            const newAnswers = [...answers, {
                questionId: questions[currentQuestion].id,
                answer: answer,
                type: questions[currentQuestion].type
            }];
            
            setAnswers(newAnswers);
            setSelectedOption(null);

            if (currentQuestion < questions.length - 1) {
                // 다음 질문으로
                setCurrentQuestion(currentQuestion + 1);
            } else {
                // 모든 질문 완료 - 결과 계산 후 결과 페이지로 이동
                handleTestComplete(newAnswers);
            }
        }, 200);
    };

    const handleTestComplete = async (finalAnswers) => {
        try {
            // 답변 분석해서 여행 타입 계산
            const travelType = calculateTravelType(finalAnswers);
            
            // 결과를 AsyncStorage에 저장
            await AsyncStorage.setItem('travelTestResult', travelType);
            await AsyncStorage.setItem('testAnswers', JSON.stringify(finalAnswers));
            
            // 결과 페이지로 이동
            router.push('/typeTest/result');
        } catch (error) {
            // 오류가 발생해도 결과 페이지로 이동
            router.push('/typeTest/result');
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
            setAnswers(answers.slice(0, -1)); // 마지막 답변 제거
            setSelectedOption(null);
        } else {
            router.back(); // 첫 번째 질문에서 뒤로가기하면 메인으로
        }
    };

    const currentQ = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            
            {/* 상단 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={handlePrevious}>
                    <Text style={styles.backButtonText}>‹</Text>
                </TouchableOpacity>
                
                <Text style={styles.headerTitle}>여행 성향 테스트</Text>
                
                <View style={styles.placeholder} />
            </View>

            {/* 진행률 바 */}
            <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>

            <View style={styles.content}>
                <Text style={styles.questionNumber}>Q. {currentQuestion + 1}</Text>
                <Text style={styles.questionText}>{currentQ.question}</Text>

                <View style={styles.optionsContainer}>
                    <TouchableOpacity 
                        style={[
                            styles.optionButton, 
                            selectedOption === 'A' && styles.optionButtonSelected
                        ]}
                        onPress={() => handleAnswer('A')}
                    >
                        <Text style={styles.optionText}>{currentQ.optionA}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[
                            styles.optionButton,
                            selectedOption === 'B' && styles.optionButtonSelected
                        ]}
                        onPress={() => handleAnswer('B')}
                    >
                        <Text style={styles.optionText}>{currentQ.optionB}</Text>
                    </TouchableOpacity>
                </View>
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
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 24,
        color: '#333333',
        fontWeight: '300',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
    },
    placeholder: {
        width: 40,
    },
    progressContainer: {
        height: 3,
        backgroundColor: '#f0f0f0',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 1.5,
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#000000',
        borderRadius: 1.5,
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 20,
    },
    questionNumber: {
        fontSize: 18,
        color: '#333333',
        fontWeight: '600',
        marginBottom: 15,
    },
    questionText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333333',
        lineHeight: 30,
        marginBottom: 40,
    },
    optionsContainer: {
        gap: 16,
    },
    optionButton: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d0d0d0',
        minHeight: 80,
        justifyContent: 'center',
    },
    optionButtonSelected: {
        backgroundColor: '#f5f5f5',
        borderColor: '#333333',
    },
    optionText: {
        fontSize: 16,
        color: '#333333',
        lineHeight: 22,
        textAlign: 'left',
    },
});