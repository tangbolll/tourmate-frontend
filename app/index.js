import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import EventHeader from '../components/EventHeader';

export default function App() {
    return (
        <SafeAreaView className="flex-1">
        <StatusBar style="auto" />
        <EventHeader 
            location="강원도 화천" 
            participantsCurrent={3} 
            participantsTotal={5} 
        />
        {}
        </SafeAreaView>
    );
}