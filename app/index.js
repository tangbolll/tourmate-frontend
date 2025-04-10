import React from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import EventHeader from '../components/EventHeader';
import EventSchedule from '../components/EventSchedule';
import Comment from '../components/Comment';
import Reply from '../components/Reply';
import Intro from '../components/Intro';
import GatheringPlace from '../components/GatheringPlace';
import Conditions from '../components/Conditions';
import Categories from '../components/Categories';
import WriteComment from '../components/WriteComment';
import ApplicationButton from '../components/ApplicationButton';



export default function App() {
    return (
        
        <SafeAreaView style={{ flex: 1 }}>
        <ScrollView 
            style={{ flex: 1 }} 
            contentContainerStyle={{ padding: 16 }}
        >
        <EventHeader 
            location="강원도 화천" 
            participantsCurrent={3} 
            participantsTotal={5} 
        />
        <EventSchedule 
            eventDate="3월4일(월)"
            eventTimeStart="15:00"
            eventTimeEnd="19:00"
            recruitStart="3월1일(금)"
            recruitEnd="3월3일(일)"
        />
        <Intro
            message="화천 산천어 축제 함께 갈 메이트 구해요. 얼음낚시부터 눈썰매, 다양한 먹거리까지 같이 즐겁게 겨울을 보내요! ⛄️❄️"

        />
        <GatheringPlace
            location={"강원도 화천 산천어 축제"}
        />    
        <Conditions 
            gender="여자만" 
            ageGroups={["20대", "30대"]} 
        />
        <Categories
            types={["아웃도어", "축제", "힐링여행"]} 
            tags={["자유로운", "낚시대결", "활기찬사람", "회떠먹기"]} 
        />

        <Comment 
            // profileImage="https://example.com/profile1.jpg" 
            nickname="나는야서휘경" 
            time="1시간 전" 
            content="안녕하세요~ 궁금한 게 있는데요 서휘경이랑 같이 가는 건가요?"
            onReplyPress={() => console.log("답글 클릭")}
        />
        <Reply
            profileImage="https://example.com/profile2.jpg" 

            nickname="여라미" 
            time="30분 전" 
            content="넹! 서휘경이랑 같이 가요~"
            onReplyPress={() => console.log("답글 클릭")}
        />

        <WriteComment onSend={(comment) => console.log("댓글:", comment)} />

        <ApplicationButton
            onPress={() => console.log("신청하기 버튼 클릭")}
            likes={122}
        />

        </ScrollView>
        </SafeAreaView>

    );
}