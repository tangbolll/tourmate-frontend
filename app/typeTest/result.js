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
import AsyncStorage from '@react-native-async-storage/async-storage';

// 결과 타입 정의
const travelResults = {
    'JACD': {
        title: '지적 탐험가',
        emoji: '✍️',
        tags: ['계획형', '모험형', '지식추구형', '활동형'],
        description: '지식과 호기심이 이끄는 대로 걷는 나는 ',
        detail: '출발 전부터 내 여행은 이미 시작돼요.운영 시간? 동선? 현지의 역사적 맥락? 전부 조사 완료! 완벽하게 짜인 일정표를 보고 있으면 그 자체로 설레거든요.\n\n근데 제 여행은 단순한 ‘관광’이 아니에요. 한 도시 안에서도 박물관, 독립 서점, 전통 시장, 유적지까지…이왕 가는 거, 문화의 깊이까지 제대로 파고들고 싶잖아요?\n\n도슨트 해설이 있다면 무조건 듣고, 오디오 가이드도 챙기고, 운 좋으면 현지 전문가가 진행하는 투어까지 싹 예약해요. 조금 빡빡해도 괜찮아요. 하루 종일 돌아다녀도 저는 오히려 신나요!\n\n나에겐 여행이 곧 연구 프로젝트예요. 돌아와서는 사진, 기록까지 정리하며 다음 여행을 설계하죠. ‘더 많이 보고, 더 많이 배우자’가 저의 모토랍니다.'
    },
    'JACR': {
        title: '느긋한 여행가',
        emoji: '🧘',
        tags: ['계획형', '모험형', '지식추구형', '휴식형'],
        description: '모든 순간을 내 방식대로 즐기는 나는 ',
        detail: '일정을 계획하긴 하지만, 빡빡한 건 딱 질색이에요. 꼭 가보고 싶은 곳만 콕콕 집어서 넣고, 중간중간 여유 시간은 필수! 그래야 길 가다 발견한 예쁜 서점이나 작은 박물관도 놓치지 않거든요.\n\n모험? 당연히 좋아하죠. 근데 저는 스릴보단 의미 있는 경험을 더 추구해요. 버스를 타고 도시를 천천히 둘러보거나, 해설이 있는 유적지에 가서 오래 머물기도 해요. 흥미로운 전시 앞에선 시간 가는 줄도 모르고요.\n\n조용한 카페에서 쉬는 시간도, 그 자체로 제겐 여행의 일부예요. 느긋하지만 깊이 있게, 감성과 지식을 함께 담아가는 게 제 여행 스타일이에요. 완벽하게 계획하지만, 계획에 쫓기진 않아요. 여유로운 발걸음으로 차근차근, 저는 오늘도 의미 있는 여행을 떠납니다.'
    },
    'JAED': {
        title: '핫플 마스터',
        emoji: '📷',
        tags: ['계획형', '모험형', '감성추구형', '활동형'],
        description: '여행은 내 감성을 채우고 기록하는 순간들의 연속! 나는 ',
        detail: '이번 여행에선 어떤 사진을 찍고, 어떤 분위기를 남길 수 있을지 상상하면서 트렌디한 카페부터 SNS에 안 뜬 숨은 스팟까지 싹 다 찾아봐요. 일정표는 예쁘고 효율적으로 — 감성과 루트 모두 놓치지 않죠.\n\n저에겐 여행이 곧 콘텐츠! 예쁜 골목, 감성 조명, 이국적인 창가 자리에서 인생샷 한 장 남기면 그게 바로 행복이에요. 피드 꾸미기, 릴스용 영상도 자연스럽게 떠오르죠.\n\n가만히 있기보단 뛰어다니는 스타일이라, 하루에 몇 군데를 가든 거뜬해요. 전망대를 오르든, 버스를 갈아타든, 예쁜 곳이라면 어디든 갑니다. 그 순간을 놓치지 않기 위해 오늘도 빠르게, 감성 가득하게 움직여요.\n\n계획력, 체력, 감성까지 삼박자를 다 갖춘 나는, ‘핫플은 내가 책임질게!’라고 말할 수 있는 진짜 여행 마스터예요.'
    },
    'JAER': {
        title: '계획적인 낭만주의자',
        emoji: '🌅',
        tags: ['계획형', '모험형', '감성추구형', '휴식형'],
        description: '여유와 설렘을 모두 챙기는 나는 ',
        detail: '여행 전엔 꼼꼼하게 조사하고, 예쁘고 감성적인 장소들을 골라 일정을 짜요. 하지만 계획대로만 움직이기보다는, 그날의 공기와 기분에 따라 천천히 걸으며 분위기를 느끼는 걸 더 좋아하죠.\n\n바다 앞에 앉아 멍 때리거나, 골목길의 카페에서 음악을 들으며 커피를 마시는 순간. 그게 바로 제가 여행에서 가장 사랑하는 시간이에요. 사진도, 영상도, 하나하나 감성을 담아 남기는 편이에요. 기억은 흐려지니까요.\n\n가고 싶은 장소는 미리 정해두지만, 현장에서 발길이 이끄는 대로 살짝 바꾸기도 해요. 즉흥적인 감정도 여행의 일부니까요. 그래서 저에게 여행은 감성과 현실 사이를 오가는 완벽한 균형 잡기예요.\n\n느릿하지만 단단하게, 감성도 일정도 놓치지 않는 저는 ‘내 삶의 무드를 내가 연출하는 낭만 감독’ 같은 여행자랍니다.'
    },
    'JPCD': {
        title: '지식 수집가',
        emoji: '🧠',
        tags: ['계획형', '안정형', '지식추구형', '활동형'],
        description: '역사 속 퍼즐을 맞추듯 여행하는 나는 ',
        detail: '여행 준비는 마치 작은 프로젝트처럼 시작돼요. 지도, 운영 시간, 동선, 근처 맛집까지 전부 체크하고 일정을 짜는 게 오히려 설레요. 특히 유적지나 박물관은 빠뜨릴 수 없죠. 도슨트나 해설 들으면서 “아~ 그래서 그게 그렇게 연결되는구나” 싶은 순간이 제일 짜릿하거든요.\n\n하루에 열 군데쯤은 돌아다녀야 제대로 여행한 느낌이 들어요. 정해진 루트 따라 착착 움직일 때 나만의 리듬이 생기고, 성취감도 꽤 크고요.\n\n다른 사람들에겐 과하다 싶을지도 모르지만, 저는 이렇게 여행을 통해 지식과 기록을 쌓아가는 게 제일 큰 재미예요. 여행은 그냥 떠나는 게 아니라, 배우고 정리하는 제 방식의 탐험이니까요.'
    },
    'JPCR': {
        title: '사유하는 여행가',
        emoji: '📚',
        tags: ['계획형', '안정형', '지식추구형', '휴식형'],
        description: '모든 순간마다 생각이 깊어지는 나는 ',
        detail: '일정을 세울 땐 미리 조사하고 준비도 철저히 하지만, 시간에 쫓기진 않아요. 유명한 유적지나 박물관은 꼭 들르지만, 천천히 걷고 오래 머무는 편이에요. 가끔은 카페에 앉아 여행지 관련 책을 펼치거나, 그냥 멍하니 풍경을 바라보는 시간도 정말 소중하거든요.\n\n휴식도, 배움도 빠질 수 없어요. 마음에 와닿는 문장 하나, 설명 하나에도 오래 생각이 머물고, 그 감정을 천천히 곱씹는 게 제 스타일이에요. 다 계획했지만, 흐름이 바뀌면 그에 맞춰 유연하게 움직이기도 해요. 결국 중요한 건 ‘깊이 있게 느끼는’ 거니까요.\n\n저에겐 여행이란, 지식을 쌓고 마음을 채우는 조용한 인문학 산책 같은 거예요.'
    },
    'JPED': {
        title: '트렌디한 여행가',
        emoji: '🗺️',
        tags: ['계획형', '안정형', '감성추구형', '활동형'],
        description: 'SNS에서 핫한 장소를 전략적으로 즐기는 나는 ',
        detail: '여행을 떠나기 전, 인기 스팟부터 예쁜 골목까지 전부 검색하고 일정에 딱 맞게 정리해둬요. 효율적인 이동이 핵심이지만, 감성은 더 중요하죠. 그래서 이동하는 내내 사진 찍고, 영상도 틈틈이 남겨두는 편이에요. 예쁜 배경 앞에선 몇 번이고 각도를 바꿔가며 찍는 것도 즐겁고요.\n\n물론 일정은 빽빽하지만, 체력과 열정만큼은 자신 있어요. 예쁜 카페도, 유명한 거리도 절대 놓칠 수 없거든요. 이왕 떠나는 거, ‘기억에 남는 한 컷’을 남기고 싶은 마음이 크거든요.\n\n계획과 감성을 모두 챙기는 스타일이라, 제 여행엔 늘 콘텐츠가 넘쳐나요. 감각적인 순간들을 기록하면서, 저는 오늘도 가장 트렌디한 여행을 즐깁니다.'
    },
    'JPER': {
        title: '감성적인 힐링러',
        emoji: '🧴',
        tags: ['계획형', '안정형', '감성추구형', '휴식형'],
        description: '잘 짜인 일정 속 여유를 즐기는 나는 ',
        detail: '일정은 미리 꼼꼼히 짜두지만, 빽빽하게 움직이는 건 제 스타일이 아니에요. 유명한 명소도 좋지만, 그 공간에서 느긋하게 머물며 분위기를 음미하는 게 더 중요하거든요.\n\n카페 한 곳에 오래 앉아 풍경을 바라보거나, 조용한 동네를 천천히 산책하는 시간이 제겐 최고의 힐링이에요. 사진도 많지 않아도 괜찮아요. 마음에 남는 장면이 더 소중하니까요.\n\n저는 여행을 통해 감성도, 쉼도 함께 챙겨요. 계획은 철저히 하되, 그 안에서 여유를 즐기는 것 — 그게 제 여행의 진짜 매력이에요.'
    },
    'IACD': {
        title: '호기로운 방랑자',
        emoji: '🏕️',
        tags: ['무계획형', '모험형', '지식추구형', '활동형'],
        description: '지도를 펼치기보다 걸음을 따라가는 나는 ',
        detail: '여행 계획? 솔직히 저는 그날그날 기분 따라 움직이는 게 더 잘 맞아요. 발길 닿는 대로 걷다 보면, 지도엔 없는 재미있는 장소들이 불쑥불쑥 나타나거든요.\n\n로컬 마켓에서 주민들과 수다 떨고, 우연히 마주친 박물관에 들어가 몇 시간을 보내는 날도 있어요. 즉흥적이지만, 그 속에서 배움은 더 깊고 생생해요. 새로운 문화나 역사 이야기 앞에선 시간 가는 줄 모르고요.\n\n계획 없이 떠났지만, 돌아올 때쯤엔 가방보다 머릿속이 더 꽉 차 있어요. 저에게 여행은 살아 있는 교실 같아요 — 어디든, 누구와든 배울 준비가 되어 있는 자유로운 교실 말이에요.'
    },
    'IACR': {
        title: '사색하는 방랑자',
        emoji: '🌿',
        tags: ['무계획형', '모험형', '지식추구형', '휴식형'],
        description: '발길 닿는 곳에서 생각을 쌓아가는 나는 ',
        detail: '여행을 앞두고도 계획은 거의 안 짜요. 대신, 그날의 기분과 분위기에 따라 움직이는 게 저에겐 더 잘 맞죠. 유명한 명소보다 골목 어귀의 작은 박물관이나 동네 책방에 더 끌리는 편이에요.\n\n카페 구석에 앉아 책을 읽거나, 조용한 길을 천천히 걷는 시간은 제게 큰 위안이에요. 현지 문화를 직접 겪으며 느긋하게 흡수할 때, 저만의 생각도 자라나거든요.\n\n즉흥적이지만 성장은 분명해요. 저에게 여행은 조용히, 천천히 나를 채우는 깊이 있는 시간입니다.'
    },
    'IAED': {
        title: '감성적인 모험가',
        emoji: '🎒',
        tags: ['무계획형', '모험형', '감성추구형', '활동형'],
        description: '순간의 느낌을 담는 ',
        detail: '여행 루트요? 그건 발길 닿는 대로예요. 아침에 눈 뜨고 날씨 보고, 기분 따라 걷고 싶은 길을 정하죠. 계획 없이 떠나는 게 오히려 제 감성을 더 잘 자극해요.\n\n빈티지한 간판, 반쯤 열린 골목길, 노을빛에 반사된 창문 하나까지도 사진으로 남겨요. 감동은 늘 예상 못 한 순간에 찾아오니까요.\n\n온종일 여기저기 누비고, 때론 낯선 사람과 얘기하다가 의외의 장소를 발견하기도 해요. 모든 순간이 스토리가 되는 여행, 그게 제 방식이에요. 저에게 여행은 감성과 자유를 실컷 누리는, 살아 있는 순간들의 기록이에요.'
    },
    'IAER': {
        title: '탐험형 로맨티스트',
        emoji: '🪷',
        tags: ['무계획형', '모험형', '감성추구형', '휴식형'],
        description: '감성 따라 걷는 나는 ',
        detail: '계획 없이 훌쩍 떠나 낯선 도시를 느긋하게 거니는 게 좋아요. 관광지도 좋지만, 조용한 골목이나 햇살 좋은 벤치가 더 기억에 남더라고요.\n\n사진도 열심히 찍지만, 남들 다 찍는 뷰 말고 제 눈에 예쁜 순간들을 담아요. 카페에 앉아 멍하니 사람들 구경하다 보면, 그 도시의 분위기가 스며들죠.\n\n혼자 걷다가 발견한 작은 갤러리나 공원에서 보내는 시간이 제겐 진짜 힐링이에요. 자유롭게, 따뜻하게, 낭만 가득한 감성 여행이 제 스타일이에요.'
    },
    'IPCD': {
        title: '소풍하는 탐험가',
        emoji: '🔍',
        tags: ['무계획형', '안정형', '지식추구형', '활동형'],
        description: '가볍게 떠나는 나는 ',
        detail: '꼭 정해진 계획이 없어도, 유명한 명소는 빠뜨리지 않아요. 전체적인 분위기를 느끼며 툭툭 돌아다니는 게 제일 재밌죠.\n\n유적지나 박물관도 무겁게 공부하듯 보기보단, 가볍게 둘러보면서 흥미로운 부분만 쏙쏙! 지나치다 알게 되는 이야기들이 더 오래 기억에 남더라고요.\n\n걸어 다니는 것도 좋아해서, 발길 닿는 대로 이동하다 새로운 곳을 발견하는 게 제 맛이에요. 지식도 경험도 너무 부담 없이, 편안한 호기심으로 채워가는 게 제 여행 방식이에요.'
    },
    'IPCR': {
        title: '여유로운 로컬리스트',
        emoji: '🍵',
        tags: ['무계획형', '안정형', '지식추구형', '휴식형'],
        description: '느긋하게 걷는 나는 ',
        detail: '딱딱한 일정은 별로고, 그날 기분 따라 천천히 움직이는 걸 좋아해요. 소박한 카페, 작은 갤러리, 현지 시장 같은 곳에서 시간을 보내는 게 제일 힐링이죠.\n\n유명한 유적지도 좋지만, 현지인들과 자연스럽게 소통하며 그들의 일상을 느끼는 게 더 소중해요. 조용히 걸으며 주변을 살피고, 뜻밖의 작은 발견에 마음이 설레곤 해요.\n\n휴식과 호기심을 적절히 섞어 가볍게 지식을 쌓으면서, 느긋하게 문화를 만끽하는 게 제 여행 스타일이에요.'
    },
    'IPED': {
        title: '자유로운 여행가',
        emoji: '🌈',
        tags: ['무계획형', '안정형', '감성추구형', '활동형'],
        description: '즉흥적으로 떠나는 나는 ',
        detail: '계획은 딱히 없지만, 감성 가득한 장소를 찾아다니며 사진 찍는 걸 좋아해요. 핫플, 예쁜 카페, 포토존 어디든 놓치지 않고 즐기려 노력하죠.\n\n하루 종일 바쁘게 움직여도 마음은 가볍고 여유로워요. 새로운 사람과 만남, 특별한 순간들을 통해 여행이 더 재미있어지니까요.\n\n즉흥적이고 자유로운 스타일로, 언제 어디서나 여행의 활력을 느끼는 편이에요.'
    },
    'IPER': {
        title: '즉흥적인 힐링 여행가',
        emoji: '☁️',
        tags: ['무계획형', '안정형', '감성추구형', '휴식형'],
        description: '마음 가는 대로 떠나는 나는 ',
        detail: '계획 없이도 익숙한 공간에서 편안하게 쉬는 걸 가장 좋아해요. 카페에 앉아 책 읽거나, 조용히 산책하며 자연을 느끼는 시간이 꼭 필요하죠.\n\n빡빡한 일정은 절대 안 맞고, 그날그날 기분에 따라 천천히 움직이는 편이에요. 여행이 곧 마음의 평화이고, 재충전하는 시간이라 생각하거든요.\n\n자유롭고 여유로운 페이스로, 내 안의 감성을 가득 채우는 여행 스타일입니다.'
    }
};

const typeImages = {
    'IPCD': require('../../assets/typeTest/IPCD.png'),
    'IPCR': require('../../assets/typeTest/IPCR.png'),
    'IPED': require('../../assets/typeTest/IPED.png'),
    'IPER': require('../../assets/typeTest/IPER.png'),
    'IACD': require('../../assets/typeTest/IACD.png'),
    'IACR': require('../../assets/typeTest/IACR.png'),
    'IAED': require('../../assets/typeTest/IAED.png'),
    'IAER': require('../../assets/typeTest/IAER.png'),
    'JPCD': require('../../assets/typeTest/JPCD.png'),
    'JPCR': require('../../assets/typeTest/JPCR.png'),
    'JPED': require('../../assets/typeTest/JPED.png'),
    'JPER': require('../../assets/typeTest/JPER.png'),
    'JAED': require('../../assets/typeTest/JAED.png'),
    'JAER': require('../../assets/typeTest/JAER.png'),
    'JACD': require('../../assets/typeTest/JACD.png'),
    'JACR': require('../../assets/typeTest/JACR.png'),
};

export default function Result() {
    const [travelType, setTravelType] = useState(null);
    const [testAnswers, setTestAnswers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadResults = async () => {
            try {
                const type = await AsyncStorage.getItem('travelTestResult');
                const answers = await AsyncStorage.getItem('testAnswers');
                
                setTravelType(type);
                if (answers) {
                    setTestAnswers(JSON.parse(answers));
                }
            } catch (error) {
                console.error('데이터 로드 오류:', error);
            }
        };

        loadResults();
    }, []); 

    if (!travelType) {
        return (
            <View style={styles.container}>
                <Text>결과를 불러오는 중입니다...</Text>
            </View>
        );
    }

    const handleGoHome = () => {
        router.replace('/(tabs)');
    };

    const handleSetProfile = async () => {
        try {
            // 서버에 POST 요청 (아직 구현되지 않았으므로 로그만 출력)
            console.log('프로필 설정 POST 요청:', {
                travelType: travelType,
                title: travelResults[travelType].title,
                tags: travelResults[travelType].tags,
                timestamp: new Date().toISOString()
            });
            
            // 결과를 AsyncStorage에 저장 (필요시)
            //await AsyncStorage.setItem('userTravelType', travelType);
            
            // (tabs)/index.js로 이동
            router.push('/profile/edit'); // Then push profile settings
        } catch (error) {
            console.error('프로필 설정 오류:', error);
        }
    };

    const resultData = travelResults[travelType];
    const resultImageSource = typeImages[travelType];
    
    if (!travelType) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text>결과를 찾을 수 없습니다.</Text>
                </View>
            </SafeAreaView>
        );
    }

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
                        source={resultImageSource}
                        style={styles.resultImage}
                        resizeMode="contain"
                    />
                </View>

                {/* 결과 제목 */}
                <Text style={styles.resultTitle}>
                    {resultData.emoji} {resultData.title}
                </Text>

                {/* 태그들 */}
                <View style={styles.tagsContainer}>
                    {resultData.tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>

                {/* 결과 설명 */}
                <Text style={styles.resultDescription}>
                    {resultData.description}<Text style={styles.boldText}>{resultData.title}</Text>입니다.
                </Text>

                <Text style={styles.detailDescription}>
                    {resultData.detail}
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
    },
    resultImage: {
        width: 300,
        height: 300,
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
        fontSize: 14.5,
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});