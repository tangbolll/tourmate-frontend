import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import EventHeader from '../components/EventHeader';
import EventSchedule from '../components/EventSchedule';


export default function App() {
    return (
        
        <SafeAreaView className="flex-1">
        <StatusBar style="auto" />
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
        {}
        </SafeAreaView>

        
    );
}