import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

const PostcardTemplate = ({ template }) => {
    if (!template) {
        return (
            <View style={styles.postcardPlaceholder}>
                <Feather name="file-text" size={48} color="#ccc" />
            </View>
        );
    }

    return (
        <View style={[styles.postcardTemplate, { backgroundColor: template.color }]}>
            <Text style={styles.postcardTitle}>Postcard</Text>
            <View style={styles.postcardContent}>
                <View style={styles.postcardLeft} />
                <View style={styles.postcardRight}>
                    {template.tab === 'Line' && (
                        <>
                            <View style={styles.templateLine} />
                            <View style={styles.templateLine} />
                            <View style={styles.templateLine} />
                            <View style={styles.templateLine} />
                        </>
                    )}
                    {template.tab === 'Plain' && (
                        <View style={styles.templatePlainArea} />
                    )}
                    {/* {template.tab === 'Image' && (
                        <View style={styles.templateImageArea}>
                            <Text style={styles.templateImageText}>Image</Text>
                        </View>
                    )} */}
                </View>
            </View>
            <Text style={styles.postcardBottom}>This side for message</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    postcardTemplate: {
        width: '100%',
        height: '100%',
        padding: 12,
        justifyContent: 'space-between',
    },
    postcardTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    postcardContent: {
        flex: 1,
        flexDirection: 'row',
        marginVertical: 8,
        gap: 8,
    },
    postcardLeft: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 4,
    },
    postcardRight: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
    },
    templateLine: {
        height: 1,
        backgroundColor: '#666',
        marginVertical: 2,
    },
    templatePlainArea: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 4,
    },
    templateImageArea: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    templateImageText: {
        fontSize: 10,
        color: '#666',
        fontWeight: '500',
    },
    postcardBottom: {
        fontSize: 8,
        color: '#666',
        textAlign: 'center',
    },
    postcardPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default PostcardTemplate;