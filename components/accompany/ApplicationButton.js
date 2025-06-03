import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


const ApplicationButton = ({ title, initialLikes = 0, onPress, onLikePress, closed}) => {
    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(false);

    const handleLikePress = () => {
        setIsLiked(!isLiked);
        setLikes(prevLikes => newLikeStatus ? prevLikes + 1 : prevLikes - 1);
        
        if (onLikePress) {
        onLikePress(newLikeStatus);
        }
    };

    return (
        <View style={styles.container}>
        <TouchableOpacity 
            style={[styles.button, closed && styles.disabledButton]} 
            onPress={onPress}
            disabled={closed}
        >
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
            style={styles.likesContainer} 
            onPress={handleLikePress}
        >
            <View style={styles.iconWrapper}>
            <Text style={styles.likeText}>{likes}</Text>
            <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={30} 
                color={isLiked ? "black" : "black"} 
            />
            </View>
        </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5, 
        
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingTop: 12,
    },
    button: {
        flex: 1,
        backgroundColor: 'black',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#CCCCCC',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    likesContainer: {
        marginLeft: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconWrapper: {
        position: 'relative',
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    likeText: {
        position: 'absolute',
        top: -8,
        fontSize: 8,
        color: 'black',
        fontWeight: 'thin',
    },
});

export default ApplicationButton;