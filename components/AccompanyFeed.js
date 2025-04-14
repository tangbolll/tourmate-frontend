import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// default image for the feed
const defaultImage = require('../assets/defaultFeed.png');

export default function AccompanyFeed({
  date,
  title,
  tags,
  location,
  participants,
  maxParticipants,
  imageUrl,
  liked,
  onPressLike,
  onPress,
}) 
{
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.date}>{date}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.tagsContainer}>
        {tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.infoContainer}>
        <Icon name="map-marker" size={16} color="#666" />
        <Text style={styles.infoText}>{location}</Text>
        <Icon name="account-multiple" size={16} color="#666" style={{ marginLeft: 12 }} />
        <Text style={styles.infoText}>{participants}/{maxParticipants}</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image
                source={imageUrl ? { uri: imageUrl } : defaultImage}
                style={styles.image}
                ></Image>
        <TouchableOpacity onPress={onPressLike} style={styles.heartIcon}>
        <Icon name="heart" size={30} color={liked ? 'red' : 'lightgray'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  header: {
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#f1f1f1',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#555',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  imageContainer: {
    position: 'absolute',
    top: 22,
    right: 30,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  heartIcon: {
    position: 'absolute',
    bottom: -10,
    right: -7,
  },
});
