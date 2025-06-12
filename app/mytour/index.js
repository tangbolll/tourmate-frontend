import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BookmarkedTab from '../../components/mytour/mytourHome/BookMarkedTab';
import TourDesignButton from '../../components/mytour/mytourHome/TourDesignButton';
import MyTourTab from '../../components/mytour/mytourHome/MyTourTab';
import CreateItineraryButton from '../../components/mytour/createItinerary/CreateItineraryButton';
import Continent from '../../components/mytour/createItinerary/Continent';
import Country from '../../components/mytour/createItinerary/Country';

export default function MyTripsScreen() {
    return (
        <View style={styles.container}>
            <Continent />
            <Country selectedContinent={'아시아'}/>
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