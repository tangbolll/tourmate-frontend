import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import ToChatroom from '../../components/accompany/ToChatroom'; 

const EventHeader = ({ title, location, participants, maxParticipants, newApplication = false, onParticipantsClick, postId, currentUserId, status, chatAccess }) => {
    return (
        <View style={styles.headerContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>{title}</Text>
                <View style={styles.infoRow}>
                    <MaterialIcons name="location-pin" size={14} color="black" />
                    <Text style={styles.infoText}>{location}</Text>
                    <TouchableOpacity 
                        style={styles.participantsContainer} 
                        onPress={onParticipantsClick}
                        activeOpacity={0.7}
                    >
                    <Ionicons name="person" size={14} color="black" style={[styles.icon, { marginLeft: 12 }]} />
                    <Text style={styles.infoText}>
                        {participants}명 / {maxParticipants}명
                    </Text>
                    {newApplication && (
                        <View style={styles.redDot} />
                    )}
                </TouchableOpacity>
                <ToChatroom 
                    postId={postId} 
                    currentUserId={currentUserId} 
                    location={location} 
                    participants={participants} 
                    maxParticipants={maxParticipants}
                    status={status}
                    chatAccess={chatAccess}  
                    isDataLoading={false} 
                 />
            </View>
        </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 8,
        textAlign: 'center',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: {
        fontSize: 12,
        color: '#000',
        marginHorizontal: 0,
    },
    icon: {
        marginRight: 4,
    },
    participantsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 2,
    },
    redDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'red',
        marginLeft: 8,
    },
    headerContainer: {
        width: '80%',
        alignSelf: 'center',
        marginTop: 24,
        marginBottom: 12,
        borderWidth: 0,
        padding: 12,
        borderRadius: 20,
        backgroundColor: 'white',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        shadowOpacity: 0.2,
    },
});

export default EventHeader;