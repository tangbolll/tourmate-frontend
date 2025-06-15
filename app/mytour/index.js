import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BookmarkedTab from '../../components/mytour/mytourHome/BookMarkedTab';
import TourDesignButton from '../../components/mytour/mytourHome/TourDesignButton';
import MyTourTab from '../../components/mytour/mytourHome/MyTourTab';
import CreateItineraryButton from '../../components/mytour/createItinerary/CreateItineraryButton';
import Continent from '../../components/mytour/createItinerary/Continent';
import Country from '../../components/mytour/createItinerary/Country';
import { ItineraryTitleInput } from '../../components/mytour/createItinerary/ItineraryTitleInput';
import TourPlace from '../../components/mytour/createItinerary/TourPlace';
import TourPeriod from '../../components/mytour/createItinerary/TourPeriod';
import SearchRegionHeader from '../../components/mytour/createItinerary/SearchRegionHeader';
import SearchRegionHistory from '../../components/mytour/createItinerary/SearchRegionHistory';

export default function MyTripsScreen() {
    return (
        <View style={styles.container}>
            <Continent />
            <Country selectedContinent={'아시아'}/>
            <ItineraryTitleInput selectedRegion={[
                {country: '대한민국', regions: ['부산', '제주도']},
                {country: '일본', regions: ['도쿄', '오사카']}]}
            />
            <TourPlace selectedRegion={[
                {country: '대한민국', regions: ['부산', '제주도']},
                {country: '일본', regions: ['도쿄', '오사카']}]}
            />
            <TourPeriod />
            <SearchRegionHistory />
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
});