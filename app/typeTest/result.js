import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    SafeAreaView,
    StatusBar,
    ScrollView,
} from 'react-native';
import { router } from 'expo-router';

// 결과 타입 정의
const resultTypes = {
    'J-A-C-D': {
        title: '지적 탐험가',
        emoji: '✍️',
        tags: ['계획형', '모험형', '지식추구형', '활동형'],
        description: '이 유형의 여행자는 철저한 사전 준비로 여행의 시작을 알립니다. 여행지의 역사, 문화, 지역적 특성은 물론, 방문할 장소의 운영 시간, 동선, 근처 식사 장소까지 모든 정보를 꼼꼼히 조사하고 일정표를 완벽하게 구성합니다.\n\n이들은 여행을 지식과 배움의 현장으로 바라봅니다. 잘 알려지지 않은 유적지나 박물관, 독립 서점, 전통 시장 등 문화적 맥락이 담긴 장소를 탐험하며, 깊이 있는 경험을 추구하죠.\n\n모든 걸 계획한 뒤, 현지 문화를 깊이 있게 탐험하며 바쁘게 움직이는 스타일. 여행은 나의 연구 프로젝트!'
    },
    'J-A-C-R': {
        title: '느긋한 여정가',
        emoji: '🧘',
        tags: ['계획형', '모험형', '지식추구형', '휴식형'],
        description: '이 유형의 여행자는 사전에 일정을 세밀하게 준비하되, 너무 촘촘하거나 빡빡하지 않은 일정을 선호합니다. 일정을 구성할 때 꼭 가야 할 장소와 여유 시간이 적절히 조화를 이루도록 설계합니다.\n\n이들은 낯선 곳을 탐험하는 데 주저하지 않지만, 그 목적은 자극적인 모험이 아닌 의미 있는 경험과 지식의 확장입니다.\n\n계획은 철저하지만 강박은 없습니다. 탐험은 좋아하지만 쫓기지 않습니다.'
    },
    'J-A-E-D': {
        title: '핫플 마스터',
        emoji: '📷',
        tags: ['계획형', '모험형', '감성추구형', '활동형'],
        description: '이 유형의 여행자는 여행 전부터 철저한 조사를 시작합니다. "이번 여행에서 어떤 사진을 찍을까?", "어떤 콘텐츠를 만들 수 있을까?"가 핵심 키워드죠.\n\n이들에게 여행은 \'감성을 기록하는 수단\'입니다. 새로운 공간, 예쁜 배경, 이국적인 분위기 속에서 인생샷을 건지고, 사진이나 영상으로 남기는 데 큰 보람을 느낍니다.\n\n비주얼과 기록을 중요시하며, 계획성과 실행력을 모두 갖춘 이들은, 여행지를 누리는 동시에 콘텐츠로 남기는 여행 고수입니다.'
    },
    'J-A-E-R': {
        title: '계획형 낭만주의자',
        emoji: '🌅',
        tags: ['계획형', '모험형', '감성추구형', '휴식형'],
        description: '이 유형의 여행자는 여행 전 꼼꼼한 계획을 세우면서도, 여행 내내 감성과 낭만을 최우선으로 여깁니다. 여행 일정은 치밀하지만, 빡빡한 스케줄로 쫓기기보다는 여유로운 흐름 속에서 여행지의 분위기와 정취를 깊이 느끼는 데 집중하죠.\n\n이들은 여행지의 색깔과 감성을 스스로 연출하는 \'무대 감독\' 같은 존재로, 각 순간이 아름다운 추억과 사진으로 남도록 세심하게 신경 씁니다.\n\n활동적이면서도 휴식과 감성의 균형을 유지하며, 계획과 자유로움을 적절히 조화시켜 낭만적인 여행을 완성하는 스타일입니다.'
    },
    'J-P-C-D': {
        title: '유적 수집가',
        emoji: '🧠',
        tags: ['계획형', '안정형', '지식추구형', '활동형'],
        description: '이 유형의 여행자는 여행 전 치밀한 계획을 세우며, 특히 역사적 유적지와 유명 관광지를 빠짐없이 방문하는 데 강한 집념을 보입니다.\n\n안정적인 여행 방식을 선호하여, 잘 알려진 관광지 위주로 일정을 짜되, 그 속에서도 각 유적지와 박물관에서 깊이 있는 이해와 체험을 추구합니다.\n\n이들에게 여행은 단순한 관광이 아니라, 역사와 문화를 체계적으로 수집하고 정리하는 작업과 같으며, 끊임없는 호기심과 열정으로 가득 찬 지적인 탐험입니다.'
    },
    'J-P-C-R': {
        title: '느긋한 인문 여행자',
        emoji: '📚',
        tags: ['계획형', '안정형', '지식추구형', '휴식형'],
        description: '이 유형의 여행자는 여행 전 충분한 준비와 계획을 세우지만, 일정을 빡빡하게 짜기보다는 여유롭고 편안한 속도로 여행하는 것을 선호합니다.\n\n이들은 여행을 단순한 \'관광\'이 아닌 \'지식과 감성을 함께 채우는 소중한 시간\'으로 생각합니다.\n\n이들에게 여행은 \'느긋한 속도 속에서 지성과 휴식을 모두 누리는 인문학적 여정\'입니다.'
    },
    'J-P-E-D': {
        title: '효율적인 감성러',
        emoji: '🗺️',
        tags: ['계획형', '안정형', '감성추구형', '활동형'],
        description: '이 유형의 여행자는 여행 전 철저한 계획을 통해 동선을 최적화하며, 인기 있는 명소와 감성적인 포토 스팟을 빠짐없이 방문하는 데 열정을 쏟습니다.\n\n핫플레이스, SNS에서 인기 있는 카페와 예쁜 골목, 독특한 배경을 가진 장소들을 미리 조사해놓고, 하루 일정이 빽빽하게 짜여 있어도 체력과 열정을 바탕으로 빠르게 이동하며 모든 순간을 놓치지 않습니다.\n\n이들은 \'효율성과 감성\'을 동시에 추구하며, 여행을 \'최고의 콘텐츠\'로 완성하는 여행자라 할 수 있습니다.'
    },
    'J-P-E-R': {
        title: '휴양 플래너',
        emoji: '🧴',
        tags: ['계획형', '안정형', '감성추구형', '휴식형'],
        description: '이 유형의 여행자는 여행 전 꼼꼼하게 계획을 세우고, 유명한 명소와 가이드북에 소개된 장소를 중심으로 일정을 구성합니다. 하지만 일정은 빡빡하지 않고, 충분한 여유와 휴식을 염두에 둔 느긋한 스타일이 특징입니다.\n\n계획에 따라 움직이지만, 휴식과 감성 체험을 최우선으로 생각해 자신만의 페이스를 유지합니다.\n\n이들에게 여행은 \'잘 짜인 일정 속에서 누리는 편안한 휴식과 감성적인 경험\'이며, 일상의 스트레스를 해소하고 마음의 평화를 찾는 소중한 시간이 됩니다.'
    },
    'I-A-C-D': {
        title: '자유로운 학습자',
        emoji: '🏕️',
        tags: ['무계획형', '모험형', '지식추구형', '활동형'],
        description: '이 유형의 여행자는 계획보다는 즉흥을 중시하며, 현장에서 직접 체험하고 배우는 것을 최고의 가치로 여깁니다. 사전에 치밀한 준비 없이도 낯선 장소에 뛰어들어 그곳의 문화, 역사, 사람들과 자연스럽게 교감하는 자유로운 탐험가입니다.\n\n활동적인 성향 덕분에 하루 종일 걸어 다니며 몸소 체험하는 것을 멈추지 않고, 문화 유산과 전통, 예술을 접할 때마다 깊은 관심과 열정을 보입니다.\n\n이들에게 여행은 \'계획에 얽매이지 않고 자유롭게 배우고 성장하는 현장\'이며, 끊임없이 움직이고 탐색하며 자신만의 지식을 확장하는 교실과도 같습니다.'
    },
    'I-A-C-R': {
        title: '방랑 지식인',
        emoji: '🌿',
        tags: ['무계획형', '모험형', '지식추구형', '휴식형'],
        description: '이 유형의 여행자는 미리 계획을 최소화하고, 현장에서 즉흥적으로 움직이며 여행의 진짜 매력을 찾아 나섭니다. 낯선 곳에서 새로운 지식과 문화를 자연스럽게 받아들이는 열린 마음을 가지고 있으며, 탐험과 휴식을 동시에 즐기는 균형 잡힌 스타일입니다.\n\n즉흥적인 일정 속에서도 자신만의 페이스를 유지하며, 새로운 만남과 우연한 경험을 통해 얻는 배움과 깨달음을 소중히 여깁니다.\n\n이들에게 여행은 \'계획에 얽매이지 않는 자유로움 속에서 지적 성장을 이루는 여정\'이며, 일상에서 벗어나 새로운 문화와 사상을 느긋하게 즐기는 지적인 방랑입니다.'
    },
    'I-A-E-D': {
        title: '감성 모험가',
        emoji: '🎒',
        tags: ['무계획형', '모험형', '감성추구형', '활동형'],
        description: '이 유형의 여행자는 계획보다는 즉흥적이고 자유로운 움직임을 선호하며, 여행 중 마주치는 모든 순간을 감성적으로 경험하는 자유로운 영혼입니다.\n\n이들은 트렌디한 핫플레이스나 잘 알려진 관광지만 쫓기보다는, 로컬의 숨은 명소, 골목길, 자연 풍경 등 감성적인 요소가 담긴 장소를 찾아다니는 모험가입니다.\n\n이들에게 여행은 \'계획에 얽매이지 않고 감성과 자유를 마음껏 누리며, 모험과 기록을 동시에 즐기는 생생한 경험\'입니다.'
    },
    'I-A-E-R': {
        title: '탐험형 로맨티스트',
        emoji: '🪷',
        tags: ['무계획형', '모험형', '감성추구형', '휴식형'],
        description: '이 유형의 여행자는 계획보다는 즉흥성을 중시하며, 낯선 장소에서 느긋하게 시간을 보내는 것을 즐깁니다. 숨겨진 명소나 잘 알려지지 않은 소박한 공간을 찾아다니며, 그곳에서 느껴지는 낭만과 감성을 만끽하는 로맨틱한 탐험가입니다.\n\n즉흥적인 일정 속에서도 마음이 가는 대로 움직이며, 새로운 경험과 감정을 소중하게 받아들입니다.\n\n이들에게 여행은 \'자유로운 탐험과 낭만이 어우러진 감성 충전의 시간\'이며, 삶의 여유와 아름다움을 여행지에서 느끼는 따뜻한 여정입니다.'
    },
    'I-P-C-D': {
        title: '가벼운 명소 탐험가',
        emoji: '🔍',
        tags: ['무계획형', '안정형', '지식추구형', '활동형'],
        description: '이 유형의 여행자는 계획보다는 즉흥적인 움직임을 선호하지만, 유명한 명소는 꼭 놓치지 않고 방문하는 균형 잡힌 탐험가입니다.\n\n유명 관광지나 박물관, 문화유적지를 방문할 때는 깊이 있는 학습보다는 가볍게 둘러보며 전체적인 분위기와 정보를 흡수하는 데 집중합니다.\n\n이들에게 여행은 \'가볍고 편안한 마음으로 주요 명소를 탐색하며 소소한 배움을 얻는 즐거운 여정\'입니다.'
    },
    'I-P-C-R': {
        title: '여유로운 문화애호가',
        emoji: '🍵',
        tags: ['무계획형', '안정형', '지식추구형', '휴식형'],
        description: '이 유형의 여행자는 계획에 크게 구애받지 않고, 현장에서 느긋하게 여행을 즐기며 현지의 문화를 온전히 흡수하는 스타일입니다.\n\n휴식을 충분히 취하면서도, 여행지에서 만나는 문화적 요소에 대한 호기심을 놓치지 않고, 작은 순간들 속에서 특별한 의미를 발견하는 데 능숙합니다.\n\n이들에게 여행은 \'느긋한 속도와 열린 마음으로 현지 문화를 깊이 음미하는 인문학적 힐링\'이며, 매 순간이 소중한 감성 체험의 연속입니다.'
    },
    'I-P-E-D': {
        title: '즉흥 감성 러버',
        emoji: '💃',
        tags: ['무계획형', '안정형', '감성추구형', '활동형'],
        description: '이 유형의 여행자는 계획에 크게 구애받지 않고, 즉흥적으로 떠나 다양한 감성적인 경험을 즐기는 자유로운 영혼입니다.\n\n핫플레이스, 감성 가득한 카페, 포토존 등을 자연스럽게 탐색하며, 그 순간순간을 인생샷으로 남기는 데 큰 즐거움을 느낍니다.\n\n이들에게 여행은 \'즉흥성과 감성, 활동성을 동시에 누리며 자유롭게 즐기는 생동감 넘치는 경험\'입니다.'
    },
    'I-P-E-R': {
        title: '무계획 힐링러',
        emoji: '☁️',
        tags: ['무계획형', '안정형', '감성추구형', '휴식형'],
        description: '이 유형의 여행자는 사전 계획 없이 즉흥적으로 떠나, 익숙하고 편안한 공간에서 마음껏 힐링하는 것을 최우선으로 합니다.\n\n이들은 계획에 얽매이지 않고 자유롭게 흐르는 여행을 선호하며, \'분위기\'와 \'마음의 평화\'를 무엇보다 중요하게 생각하는 힐링 마니아입니다.\n\n이들에게 여행은 \'계획 없는 자유로움 속에서 나 자신과 온전히 마주하는 감성 충전의 시간\'입니다.'
    }
};

export default function Result() {
    const [resultType, setResultType] = useState('J-A-C-R'); // 임시로 기본값 설정

    useEffect(() => {
        // 실제로는 답변 데이터를 분석해서 결과 타입을 결정해야 함
        // 예시: calculateResult() 함수로 답변 분석
        // const answers = getAnswersFromStorage(); // AsyncStorage 등에서 답변 가져오기
        // const calculatedType = calculateResult(answers);
        // setResultType(calculatedType);
    }, []);

    const result = resultTypes[resultType];

    const handleGoHome = () => {
        router.push('/');
    };

    const handleSetProfile = async () => {
        try {
        // 서버에 POST 요청 (아직 구현되지 않았으므로 로그만 출력)
        console.log('프로필 설정 POST 요청:', {
            travelType: resultType,
            title: result.title,
            tags: result.tags,
            timestamp: new Date().toISOString()
        });
        
        // (tabs)/index.js로 이동
        router.push('/(tabs)');
        } catch (error) {
        console.error('프로필 설정 오류:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        
        {/* 헤더 */}
        <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>여행 성향 테스트</Text>
            <View style={styles.placeholder} />
        </View>

        {/* 진행률 바 (완료) */}
        <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: '100%' }]} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* 결과 이미지 */}
            <View style={styles.imageContainer}>
            <Image
                source={require('../../assets/defaultProfile2.png')}
                style={styles.resultImage}
                resizeMode="contain"
            />
            </View>

            {/* 결과 제목 */}
            <Text style={styles.resultTitle}>
            {result.emoji} {result.title}
            </Text>

            {/* 태그들 */}
            <View style={styles.tagsContainer}>
            {result.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
                </View>
            ))}
            </View>

            {/* 결과 설명 */}
            <Text style={styles.resultDescription}>
            모든 순간을 내 발자취로 흘기는 나는 <Text style={styles.boldText}>{result.title}</Text>입니다.
            </Text>

            <Text style={styles.detailDescription}>
            {result.description}
            </Text>
        </ScrollView>

        {/* 하단 버튼들 */}
        <View style={styles.bottomContainer}>
            <TouchableOpacity style={styles.homeButton} onPress={handleGoHome}>
            <Text style={styles.homeButtonText}>홈으로 가기</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.profileButton} onPress={handleSetProfile}>
            <Text style={styles.profileButtonText}>프로필 설정하기</Text>
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
    },
    imageContainer: {
        alignItems: 'center',
        marginVertical: 30,
    },
    resultImage: {
        width: 200,
        height: 150,
    },
    resultTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        textAlign: 'center',
        marginBottom: 20,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 30,
        gap: 8,
    },
    tag: {
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    tagText: {
        fontSize: 14,
        color: '#555555',
        fontWeight: '500',
    },
    resultDescription: {
        fontSize: 16,
        color: '#333333',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 24,
    },
    boldText: {
        fontWeight: 'bold',
        color: '#000000',
    },
    detailDescription: {
        fontSize: 14,
        color: '#666666',
        lineHeight: 22,
        marginBottom: 40,
    },
    bottomContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    homeButton: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#d0d0d0',
        alignItems: 'center',
    },
    homeButtonText: {
        fontSize: 16,
        color: '#666666',
        fontWeight: '500',
    },
    profileButton: {
        flex: 1,
        backgroundColor: '#000000',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    profileButtonText: {
        fontSize: 16,
        color: '#ffffff',
        fontWeight: '500',
    },
});