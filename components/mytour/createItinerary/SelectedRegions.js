import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';

const defaultImage = require('../../../assets/defaultBackground.png');

const SelectedRegions = ({ selectedRegions, onRemoveRegion }) => {
    if (selectedRegions.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {selectedRegions.map((item) => (
                    <View key={item.key} style={styles.regionItem}>
                        <View style={styles.imageContainer}>
                            <Image 
                                source={defaultImage}
                                style={styles.regionImage}
                                resizeMode="cover"
                            />
                            <TouchableOpacity 
                                style={styles.deleteButton}
                                onPress={() => onRemoveRegion(item.key)}
                                activeOpacity={0.8}
                            >
                                <AntDesign 
                                    name="close" 
                                    style={styles.deleteIcon} 
                                />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.regionText} numberOfLines={1}>
                        {/* <Text style={{ fontWeight: 'bold' }}>{item.country}</Text> */}
                        {item.region}
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#d9d9d9',
        paddingVertical: 10,
        paddingHorizontal: 12,
        width: '100%',
        height: 100,
    },
    scrollContent: {
        paddingHorizontal: 4,
        alignItems: 'center',
    },
    regionItem: {
        alignItems: 'center',
        marginRight: 12,
        width: 60,
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 6,
    },
    regionImage: {
        width: 48,
        height: 48,
        borderRadius: 8,
    },
    deleteButton: {
        position: 'absolute',
        top: -3,
        right: -3,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteIcon: {
        fontSize: 10,
        color: '#6b7280',
        fontWeight: 'bold',
    },
    regionText: {
        fontSize: 10,
        color: '#000',
        textAlign: 'center',
        lineHeight: 14,
        width: '100%',
        fontWeight: 'bold'
    },
});

export default SelectedRegions;