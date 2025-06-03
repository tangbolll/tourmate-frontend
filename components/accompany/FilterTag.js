import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function FilterTag({ tag, onPress }) {
    return (
        <View style={styles.tagWrapper}>
        <Text style={styles.tagText}>{tag}</Text>
        <TouchableOpacity onPress={onPress}>
            <Icon name="close" size={14} color="#333" />
        </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    tagWrapper: {
        height: 28,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 20,
        paddingVertical: 4,
        paddingHorizontal: 12,
        backgroundColor: "#fff",
        marginRight: 8,
    },
    tagText: {
        marginRight: 6,
        fontSize: 14,
        color: "#333",
    },
});
